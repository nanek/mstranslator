var http = require('http');
var https = require('https');
var querystring = require('querystring');

var options = {
    host: 'datamarket.accesscontrol.windows.net',
    path: '/v2/OAuth2-13',
    method: 'POST',
};

var mstrans = {
  host: 'api.microsofttranslator.com',
  method: 'GET',
  headers: {}
};

// use the ajax endpoint so that the responses are JSON
var ajax_root = '/V2/Ajax.svc/';
var http_root = '/V2/Http.svc/';

var query = {
  grant_type: 'client_credentials',
  scope: 'http://api.microsofttranslator.com'
};

function printArray(arr)
{
  var arrval = arr.join('","');
  return '["' + arrval + '"]';
}

function convertArrays(obj)
{
  for (var prop in obj) {
    if (Array.isArray(obj[prop])) {
      obj[prop] = printArray(obj[prop]);
    }
  }
  return obj;
}

exports.access_token = function(client_id, client_secret, fn) {
  var req = https.request(options, function(res) {
    res.setEncoding('utf8');
    res.on('data', function (chunk) {
      var keys = JSON.parse(chunk);
      //TODO: use expiration
      fn(null, keys.access_token);
    });
  });

  query.client_id = client_id;
  query.client_secret = client_secret;
  req.write(querystring.stringify(query));
  req.end();
};

var call = function(path, params, access_token, fn) {
  var settings = mstrans;
  settings.headers.Authorization = 'Bearer ' + access_token;
  params = convertArrays(params);
  settings.path= ajax_root + path + '?' + querystring.stringify(params);
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
        fn(null, JSON.parse(body));
      } catch (e) {
        fn(e, null);
      }
    });
  });
  req.end();
};

var call_speak = function(path, params, access_token, fn) {
  var settings = mstrans;
  settings.headers.Authorization = 'Bearer ' + access_token;
  params = convertArrays(params);
  settings.path= http_root + path + '?' + querystring.stringify(params);
  var req = http.request(settings, function(res) {
    //res.setEncoding('utf8');
    var body;
    res.on('data', function (chunk) {
      body += chunk;
    });
    res.on('end', function () {
      fn(null, body);
    });
  });
  req.end();
};

// BreakSentences Method
// params { text, language }
exports.breakSentences = function(params, access_token, fn) {
  call('BreakSentences', params, access_token, fn);
};

// Detect Method
// params { text }
exports.detect = function(params, access_token, fn) {
  call('Detect', params, access_token, fn);
};

// DetectArray Method
// params { texts }
exports.detectArray = function(params, access_token, fn) {
  call('DetectArray', params, access_token, fn);
};

// GetLanguageNames Method
// params { locale, languageCodes }
exports.getLanguageNames = function(params, access_token, fn) {
  call('GetLanguageNames', params, access_token, fn);
};

// GetLanguagesForSpeak Method
// params { }
exports.getLanguagesForSpeak = function(access_token, fn) {
  call('GetLanguagesForSpeak', {}, access_token, fn);
};

// GetLanguagesForTranslate Method
// params { }
exports.getLanguagesForTranslate = function(access_token, fn) {
  call('GetLanguagesForTranslate', {}, access_token, fn);
};

// GetTranslations Method
// params { text, from, to, maxTranslations, options }
exports.getTranslations = function(params, access_token, fn) {
  call('GetTranslations', params, access_token, fn);
};

// GetTranslationsArray Method
// params { text, from, to, maxTranslations, options }
exports.getTranslationsArray = function(params, access_token, fn) {
  call('GetTranslationsArray', params, access_token, fn);
};

// Speak Method
// params { text, language, format }
exports.speak = function(params, access_token, fn) {
  call_speak('Speak', params, access_token, fn);
};

// Translate Method
// params { text, from, to, contentType, category }
exports.translate = function(params, access_token, fn) {
  call('Translate', params, access_token, fn);
};

// TranslateArray Method
// params { textss, from, to, options }
exports.translateArray = function(params, access_token, fn) {
  call('TranslateArray', params, access_token, fn);
};
