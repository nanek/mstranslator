var querystring = require('querystring');
var https       = require('https');
var soap        = require('soap');
var soap_uri    = 'http://api.microsofttranslator.com/V2/soap.svc?wsdl';

function MsTranslator(credentials, autoRefresh)
{
    var self = this;

    this.credentials  = credentials;
    this.access_token = "";
    this.expires_in   = null;
    this.expires_at   = 0;
    this.autoRefresh  = autoRefresh;

    this.tokenRequestParams = {
        host  : 'datamarket.accesscontrol.windows.net',
        path  : '/v2/OAuth2-13',
        method: 'POST',
    };

    this.tokenRequestPayload = querystring.stringify({
        grant_type   : 'client_credentials',
        scope        : 'http://api.microsofttranslator.com',
        client_id    : this.credentials.client_id,
        client_secret: this.credentials.client_secret
    });

    var clientListeners        = [];
    var soapClient             = null;
    var soapClientConstructing = false;
    this.getSoapClient = function(cb)
    {
        if (soapClient)
        {
            return cb(null, soapClient);
        }
        else if (soapClientConstructing)
        {
            return clientListeners.push(cb);
        }
        else
        {
            clientListeners.push(cb);

            soapClientConstructing = true;
            soap.createClient(soap_uri, function(err, client)
            {
                soapClientConstructing = false;
                soapClient             = client;

                for (var i = 0, il = clientListeners.length; i < il; i++)
                {
                    clientListeners[i].call(this, err, soapClient);
                }
            });
        }
    };
}


module.exports = MsTranslator;

MsTranslator.prototype.makeRequest = function(path, params, fn)
{
    if (this.autoRefresh && this.expires_at <= Date.now())
    {
        var self = this;
        this.initialize_token(function()
        {
            self.call(path, params, fn);
        }, true);
    }
    else {
        this.call(path, params, fn);
    }
}

MsTranslator.prototype.initialize_token = function(callback, noRefresh)
{
    var self = this;
    var req = https.request(self.tokenRequestParams, function(res)
    {
        res.setEncoding('utf8');

        var data = '';

        res.on('data', function (chunk)
        {
            data += chunk;
        });

        res.on('end', function ()
        {
            var keys = JSON.parse(data);

            self.access_token = keys.access_token;
            self.expires_in   = (parseInt(keys.expires_in) - 10) * 1000;
            self.expires_at   = Date.now() + self.expires_in;

            if (!noRefresh)
            {
                setTimeout(function()
                {
                    self.initialize_token()
                }, self.expires_in);
            }
            if (typeof callback === 'function')
            {
                callback(null, keys);
            }
        });
    });

    req.write(this.tokenRequestPayload);
    req.end();
}

MsTranslator.prototype.call = function(path, params, fn)
{
    var self = this;

    this.getSoapClient(function(err, client)
    {
        if (err)
        {
            return fn(err);
        }

        client.setSecurity(new soap.BearerSecurity(self.access_token));

        client.Translate(params, function(err, response, raw, soapHeader)
        {
            if (err)
            {
                return fn(err);
            }

            return fn(null, response);
        });
    });    
};

// Translate Method
// params { text, from, to, contentType, category }
MsTranslator.prototype.translate = function(params, fn) {
    this.makeRequest('Translate', params, fn);
};