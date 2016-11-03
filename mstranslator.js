var querystring = require('querystring');
var http = require('http');
var https = require('https');

/**
 * @class
 * @param {Object} credentials Credentials
 * @param {string} credentials.client_id Client id
 * @param {string} credentials.client_secret Client secret
 * @param {boolean} [autoRefresh] Auto refresh
 */
function MsTranslator(credentials, autoRefresh){
  this.credentials = credentials;
  this.access_token = "";
  this.expires_in = null;
  this.expires_at = 0;
  this.autoRefresh = autoRefresh;
  this.useNewApi = Boolean(credentials.api_key);
  this.apiToUse = true === this.useNewApi ? 'newApi' : 'oldApi';
  this.ERR_PATTERNS = [
    'ArgumentException:',
    'ArgumentOutOfRangeException:',
    'TranslateApiException:',
    'ArgumentNullException:'
  ];

  // there is the old and the new API to receive a token from
  this.options = {
    oldApi: {
      host: 'datamarket.accesscontrol.windows.net',
      path: '/v2/OAuth2-13',
      method: 'POST'
    },
    newApi: {
      host: 'api.cognitive.microsoft.com',
      path: '/sts/v1.0/issueToken',
      method: 'POST',
      headers: {
        'Ocp-Apim-Subscription-Key': this.credentials.api_key
      }
    }
  };

  // Did not change from old to new
  this.mstrans = {
      host: 'api.microsofttranslator.com',
      method: 'GET',
      headers: {}
  };

  // use the ajax endpoint so that the responses are JSON
  this.ajax_root = '/V2/Ajax.svc/';
  this.http_root = '/V2/Http.svc/';

  // newApi's token are fetched via headers
  this.query = {
    oldApi: {
      grant_type: 'client_credentials',
      scope: 'http://api.microsofttranslator.com',
      client_id: this.credentials.client_id,
      client_secret: this.credentials.client_secret
    },
    newApi: {
    }
  };

}

module.exports = MsTranslator;

function escapeDoubleQuotes (element) {
  if(typeof element !== 'string' ) {
    return element;
  }

  return element.replace(/(^|[^\\])"/g, '$1\\"');
}

MsTranslator.prototype.printArray = function(arr) {
  var arrval = arr
      .map(escapeDoubleQuotes)
      .join('","');
  return '["' + arrval + '"]';
};

MsTranslator.prototype.convertArrays = function(obj) {
  for (var prop in obj) {
    if (Array.isArray(obj[prop])) {
      obj[prop] = this.printArray(obj[prop]);
    }
  }
  return obj;
};

MsTranslator.prototype.makeRequest = function(path, params, fn, method) {
  method = method || 'call';
  if (this.autoRefresh && this.expires_at <= Date.now()) {
    var self = this;
    this.initialize_token(function() {
      self[method](path, params, fn);
    }, true);
  }
  else {
    this[method](path, params, fn);
  }
};

MsTranslator.prototype.initialize_token = function(callback, noRefresh){
  var self = this;
  var req = https.request(self.options[self.apiToUse], function(res) {
    res.setEncoding('utf8');
    var data = '';
    res.on('data', function (chunk) {
      data += chunk;
    });
    res.on('end', function () {
      if (!self.useNewApi) {
        var keys = JSON.parse(data);
        self.access_token = keys.access_token;
        self.expires_in = (parseInt(keys.expires_in) - 10) * 1000;
        self.expires_at = Date.now() + self.expires_in;
      } else {
        self.access_token = data;
        self.expires_in = 9 * 60 * 1000; // token is valid for 10 min. So set time before it is expiring
        self.expires_at = Date.now() + self.expires_in;
      }

      if (!noRefresh) {
        setTimeout(function() {self.initialize_token();}, self.expires_in);
      }
      if(callback !== undefined) {
        callback(null, keys);
      }
    });
  });
  if (callback) {
    req.on('error', callback);
  }

  req.write(querystring.stringify(this.query[this.apiToUse]));
  req.end();
};

MsTranslator.prototype.call = function(path, params, fn) {
  var settings = this.mstrans;
  var errPatterns = this.ERR_PATTERNS;
  settings.headers.Authorization = 'Bearer ' + this.access_token;
  params = this.convertArrays(params);
  settings.path= this.ajax_root + path + '?' + querystring.stringify(params);
  var req = http.request(settings, function(res) {
    res.setEncoding('utf8');
    var body = '';
    res.on('data', function (chunk) {
      body += chunk;
    });
    res.on('end', function () {
      //remove invalid BOM
      body = body.substring(1, body.length);
      try {
        var data = null;
        if (body.length > 0) {
          data = JSON.parse(body);
        }
        var errMessages = errPatterns.filter(function(pattern) {
          return body.indexOf(pattern) > -1;
        });
        if (errMessages.length > 0) {
          fn(new Error(body), data);
        } else {
          fn(null, data);
        }
      } catch (e) {
        fn(e, null);
      }
    });
  });
  req.on('error', fn);
  req.end();
};

MsTranslator.prototype.call_speak = function(path, params, fn) {
  var settings = this.mstrans;
  settings.headers.Authorization = 'Bearer ' + this.access_token;
  params = this.convertArrays(params);
  settings.path= this.http_root + path + '?' + querystring.stringify(params);
  var req = http.request(settings, function(res) {
    var buffers = [];

    res.on('data', function (chunk) {
      if(!Buffer.isBuffer(chunk)){
        chunk = new Buffer(chunk);
      }
      buffers.push(chunk);
    });

    res.on('end', function () {
      var index = 0;
      var buffer_length = buffers.reduce(function(sum, e) {
        return sum += e.length;
      }, 0);
      var body = new Buffer(buffer_length);
      buffers.forEach(function (buf, i) {
        buf.copy(body, index, 0, buf.length);
        index += buf.length;
      });
      fn(null, body);
    });
  });
  req.on('error', fn);
  req.end();
};

/**
 * Breaks a piece of text into sentences and returns an array containing the
 * lengths in each sentence.
 * @param {Object} params Parameters
 * @param {string} params.text The text to split into sentences. The size of
 *   the text must not exceed 10000 characters.
 * @param {string} params.language Language code of input text.
 * @param {callback} fn callback
 */
MsTranslator.prototype.breakSentences = function(params, fn) {
  this.makeRequest('BreakSentences', params, fn);
};

/**
 * Detects the language of a selection of text.
 * @param {Object} params Parameters
 * @param {string} params.text A string representing the text from an unknown
 *   language. The size of the text must not exceed 10000 characters.
 * @param {callback} fn callback
 */
MsTranslator.prototype.detect = function(params, fn) {
  this.makeRequest('Detect', params, fn);
};

/**
 * Detects the language of an array of strings.
 * @param {Object} params Parameters
 * @param {string[]} params.texts A string array representing the text from an
 *   unknown language. The size of the text must not exceed 10000 characters.
 * @param {callback} fn callback
 */
MsTranslator.prototype.detectArray = function(params, fn) {
  this.makeRequest('DetectArray', params, fn);
};

/**
 * Obtains a list of the languages supported by the Translator Service.
 * @param {string} locale A string representing a combination of an ISO 639
 *   two-letter lowercase culture code associated with a language and an
 *   ISO 3166 two-letter uppercase subculture code to localize the language
 *   names or a ISO 639 lowercase culture code by itself.
 * @param {string[]} languageCodes A string array representing the ISO 639-1
 *   language codes to retrieve the friendly name for.
 * @param {callback} fn callback
 */
MsTranslator.prototype.getLanguageNames = function(params, fn) {
  this.makeRequest('GetLanguageNames', params, fn);
};

/**
 * Obtains a list of the language codes supported by the Translator Service for
 * speech synthesis.
 * @param {callback} fn callback
 */
MsTranslator.prototype.getLanguagesForSpeak = function(fn) {
  this.makeRequest('GetLanguagesForSpeak', {}, fn);
};

/**
 * Obtains a list of the language codes supported by the Translator Service.
 * @param {callback} fn callback
 */
MsTranslator.prototype.getLanguagesForTranslate = function(fn) {
  this.makeRequest('GetLanguagesForTranslate', {}, fn);
};

/**
 * Retrieves an array of translations for a given language pair from the store
 * and the MT engine. GetTranslations differs from Translate as it returns all
 * available translations.
 * @param {Object} params Parameters
 * @param {string} params.text The text to translate. The size of the text must
 *   not exceed 10000 characters.
 * @param {string} params.from Language code of the translation text.
 * @param {string} params.to Language code to translate the text into.
 * @param {int} params.maxTranslations Maximum number of translations to return.
 * @param {Object} [params.options] Options
 * @param {callback} fn callback
 */
MsTranslator.prototype.getTranslations = function(params, fn) {
  this.makeRequest('GetTranslations', params, fn);
};

/**
 * Returns an array of alternative translations of the passed array of text.
 * @param {Object} params Parameters
 * @param {string[]} params.texts The texts for translation. All strings must be
 *   of the same language. The total of all texts to be translated must not
 *   exceed 10000 characters. The maximum number of array elements is 10.
 * @param {string} params.from Language code of the translation text.
 * @param {string} params.to Language code to translate the text into.
 * @param {int} params.maxTranslations Maximum number of translations to return.
 * @param {Object} [params.options] Options
 * @param {callback} fn callback
 */
MsTranslator.prototype.getTranslationsArray = function(params, fn) {
  this.makeRequest('GetTranslationsArray', params, fn);
};

/**
 * Returns a wave or mp3 stream of the passed-in text
 * being spoken in the desired language.
 * @param {Object} params Parameters
 * @param {string} params.text A sentence or sentences of the specified language
 *   to be spoken for the wave stream. The size of the text to speak must not
 *   exceed 2000 characters.
 * @param {string} params.language Language code to speak the text in
 * @param {string} [params.format=audio/wav] Content-type 'audio/wav' or
 *   'audio/mp3'
 * @param {Object} [params.options] Options
 * @param {callback} fn callback
 */
MsTranslator.prototype.speak = function(params, fn) {
  this.makeRequest('Speak', params, fn, 'call_speak');
};

/**
 * Returns a string which is a URL to a wave or mp3 stream of the passed-in text
 * being spoken in the desired language.
 * @param {Object} params Parameters
 * @param {string} params.text A sentence or sentences of the specified language
 *   to be spoken for the wave stream. The size of the text to speak must not
 *   exceed 2000 characters.
 * @param {string} params.language Language code to speak the text in
 * @param {string} [params.format=audio/wav] Content-type 'audio/wav' or
 *   'audio/mp3'
 * @param {Object} [params.options] Options
 * @param {callback} fn callback
 */
MsTranslator.prototype.speakURL = function(params, fn) {
  this.makeRequest('Speak', params, fn);
};

/**
 * Converts a text string from one language to another.
 * @param {Object} params Parameters
 * @param {string} params.text The text to translate. The size of the text must
 *  not exceed 10000 characters.
 * @param {string} [params.from] Language code of the translation text.
 * @param {string} params.to Language code to translate the text into.
 * @param {string} [params.contentType] The format of the text being translated.
 *   The supported formats are 'text/plain' and 'text/html'. Any HTML needs to
 *   be well-formed.
 * @param {string} [params.category=general] The category of the translation
 * @param {callback} fn callback
 */
MsTranslator.prototype.translate = function(params, fn) {
  this.makeRequest('Translate', params, fn);
};

/**
 * Translates an array of texts into another language.
 * @param {Object} params Parameters
 * @param {string[]} params.texts The texts for translation. All strings must be
 *   of the same language. The total of all texts to be translated must not
 *   exceed 10000 characters. The maximum number of array elements is 2000.
 * @param {string} [params.from] Language code of the translation text
 * @param {string} params.to Language code to translate the text to
 * @param {Object} [params.options] Options
 * @param {callback} fn callback
 */
MsTranslator.prototype.translateArray = function(params, fn) {
  this.makeRequest('TranslateArray', params, fn);
};

/**
 * Works just like regular TranslateArray(), except it has an additional element
 * in the response structure, called "Alignment".
 * http://msdn.microsoft.com/en-us/library/dn198370.aspx
 * @param {Object} params Parameters
 * @param {string[]} params.texts The texts for translation. All strings must be
 *   of the same language. The total of all texts to be translated must not
 *   exceed 10000 characters. The maximum number of array elements is 2000.
 * @param {string} [params.from] Language code of the translation text
 * @param {string} params.to Language code to translate the text to
 * @param {Object} [params.options] Options
 * @param {callback} fn callback
 */
MsTranslator.prototype.translateArray2 = function(params, fn) {
  this.makeRequest('TranslateArray2', params, fn);
};

/**
 * Adds a translation to the translation memory.
 * @param {Object} params Parameters
 * @param {string} params.originalText The text to translate from. The string
 *   has a maximum length of 1000 characters.
 * @param {string} params.translatedText Translated text in the target language.
 *   The string has a maximum length of 2000 characters.
 * @param {string} params.from Language code of the source language. Must be a
 *   valid culture name.
 * @param {string} params.to Language code of the target language. Must be a
 *   valid culture name.
 * @param {string} params.user A string used to track the originator of the
 *   submission.
 * @param {int} [params.rating=1] The quality rating for this string. Value
 *   between -10 and 10.
 * @param {string} [params.contentType] The format of the text being translated.
 *   The supported formats are 'text/plain' and 'text/html'. Any HTML needs to
 *   be well-formed.
 * @param {string} [params.category=general] The category (domain) of the
 *   translation.
 * @param {string} [params.uri] The content location of this translation.
 * @param {callback} fn callback
 */
MsTranslator.prototype.addTranslation = function(params, fn) {
  this.makeRequest('AddTranslation', params, fn);
};

/**
 * @callback callback
 * @param {Object} error
 * @param {Object} data
 */
