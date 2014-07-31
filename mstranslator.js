var querystring = require('querystring');
var http = require('http');
var https = require('https');

function MsTranslator(credentials, autoRefresh){
  this.credentials = credentials;
  this.access_token = "";
  this.expires_in = null;
  this.expires_at = 0;
  this.autoRefresh = autoRefresh;
  
  this.options = {
    host: 'datamarket.accesscontrol.windows.net',
    path: '/v2/OAuth2-13',
    method: 'POST',
  };
  this.mstrans = {
    host: 'api.microsofttranslator.com',
    method: 'GET',
    headers: {}
  };

  // use the ajax endpoint so that the responses are JSON
  this.ajax_root = '/V2/Ajax.svc/';
  this.http_root = '/V2/Http.svc/';
  
  this.query = {
    grant_type: 'client_credentials',
    scope: 'http://api.microsofttranslator.com'
  };

}


module.exports = MsTranslator;


MsTranslator.prototype.printArray = function(arr)
{
  var arrval = arr.join('","');
  return '["' + arrval + '"]';
}

MsTranslator.prototype.convertArrays = function(obj)
{
  for (var prop in obj) {
    if (Array.isArray(obj[prop])) {
      obj[prop] = this.printArray(obj[prop]);
    }
  }
  return obj;
}

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
}

MsTranslator.prototype.initialize_token = function(callback, noRefresh){
  var self = this;
  var req = https.request(self.options, function(res) {
    res.setEncoding('utf8');
    var data = '';
    res.on('data', function (chunk) {
      data += chunk;
    });
    res.on('end', function () {
      var keys = JSON.parse(data);
      self.access_token = keys.access_token;
      self.expires_in = (parseInt(keys.expires_in) - 10) * 1000;
      self.expires_at = Date.now() + self.expires_in;
      if (!noRefresh) {
        setTimeout(function() {self.initialize_token()}, self.expires_in);
      }
      if(callback != undefined) {
        callback(null,keys);
      }
    });
  });
  
  this.query.client_id = self.credentials.client_id;
  this.query.client_secret = self.credentials.client_secret;
  req.write(querystring.stringify(this.query));
  req.end();
}

MsTranslator.prototype.call = function(path, params, fn) {
  var settings = this.mstrans;
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
        if (body.indexOf('ArgumentException:') === 1) {
          fn(body, JSON.parse(body));
        } else {
          fn(null, JSON.parse(body));
        }
      } catch (e) {
        fn(e, null);
      }
    });
  });
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
      var buffer_length = buffers.reduce(function(sum, e) { return sum += e.length }, 0);
      var body = new Buffer(buffer_length);
      buffers.forEach(function (buf, i) {
        buf.copy(body, index, 0, buf.length);
        index += buf.length;
      });
      delete(buffers);
      fn(null, body);
    });
  });
  req.end();
};

// BreakSentences Method
// params { text, language }
MsTranslator.prototype.breakSentences = function(params, fn) {
  this.makeRequest('BreakSentences', params, fn);
};

// Detect Method
// params { text }
MsTranslator.prototype.detect = function(params, fn) {
  this.makeRequest('Detect', params, fn);
};

// DetectArray Method
// params { texts }
MsTranslator.prototype.detectArray = function(params, fn) {
  this.makeRequest('DetectArray', params, fn);
};

// GetLanguageNames Method
// params { locale, languageCodes }
MsTranslator.prototype.getLanguageNames = function(params, fn) {
  this.makeRequest('GetLanguageNames', params, fn);
};

// GetLanguagesForSpeak Method
// params { }
MsTranslator.prototype.getLanguagesForSpeak = function(fn) {
  this.makeRequest('GetLanguagesForSpeak', {}, fn);
};

// GetLanguagesForTranslate Method
// params { }
MsTranslator.prototype.getLanguagesForTranslate = function(fn) {
  this.makeRequest('GetLanguagesForTranslate', {}, fn);
};

// GetTranslations Method
// params { text, from, to, maxTranslations, options }
MsTranslator.prototype.getTranslations = function(params, fn) {
  this.makeRequest('GetTranslations', params, fn);
};

// GetTranslationsArray Method
// params { text, from, to, maxTranslations, options }
MsTranslator.prototype.getTranslationsArray = function(params, fn) {
  this.makeRequest('GetTranslationsArray', params, fn);
};

// Speak Method
// params { text, language, format }
MsTranslator.prototype.speak = function(params, fn) {
  this.makeRequest('Speak', params, fn, 'call_speak');
};

// Translate Method
// params { text, from, to, contentType, category }
MsTranslator.prototype.translate = function(params, fn) {
  this.makeRequest('Translate', params, fn);
};

// TranslateArray Method
// params { texts, from, to, options }
MsTranslator.prototype.translateArray = function(params, fn) {
  this.makeRequest('TranslateArray', params, fn);
};

// TranslateArray2 Method
// params { texts, from, to, options }
// http://msdn.microsoft.com/en-us/library/dn198370.aspx
MsTranslator.prototype.translateArray2 = function(params, fn) {
  this.makeRequest('TranslateArray2', params, fn);
};
