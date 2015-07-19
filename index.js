var querystring = require('querystring');
var http        = require('http');
var https       = require('https');
var soap        = require('soap');

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
    hostname: 'api.microsofttranslator.com',
    method: 'POST',
    headers: {}
  };

  this.soap_root = '/V2/soap.svc';
  
  this.query = {
    grant_type: 'client_credentials',
    scope: 'http://api.microsofttranslator.com'
  };

}


module.exports = MsTranslator;

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
  var inputHtml = 'hello';

  var postData = '<?xml version="1.0" encoding="utf8"?><TranslateArrayRequest><AppId /><From>zh-CHS</From><Options><ContentType xmlns="http://schemas.datacontract.org/2004/07/Microsoft.MT.Web.Service.V2">text/plain</ContentType></Options><Texts><string xmlns="http://schemas.microsoft.com/2003/10/Serialization/Arrays"><![CDATA[' + inputHtml + ']]></string></Texts><To>en</To></TranslateArrayRequest>';

  var settings                       = this.mstrans;
  var token = this.access_token;
  settings.headers['Authorization']  = 'Bearer ' + this.access_token;
  settings.headers['Content-Type']   = 'text/xml';
  settings.headers['Content-Length'] = postData.length;

  this.soapClient = soap.createClient('http://' + this.mstrans.hostname + this.soap_root + '?wsdl', function(err, client) {

    if (err)
    {
      console.error('soap error');
      return console.error(err);
    }

    client.setSecurity(new soap.BearerSecurity(token));

    client.Translate(params, function(err, response, raw, soapHeader)
    {
      if (err)
      {
        console.error('trans error');
        return console.error(err.body);
      }

      console.log(raw);
      console.log(soapHeader);

      console.log('trans response');
      console.log(response);
    });

  });

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