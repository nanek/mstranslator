var querystring = require('querystring');
var https       = require('https');
var soap        = require('soap');

function MsTranslator(credentials, autoRefresh)
{
    this.credentials  = credentials;
    this.access_token = "";
    this.expires_in   = null;
    this.expires_at   = 0;
    this.autoRefresh  = autoRefresh;
    this.soap_uri     = 'http://api.microsofttranslator.com/V2/soap.svc?wsdl';

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

    this.soapClient = soap.createClient(this.soap_uri, function(err, client)
    {
        if (err)
        {
            return console.error(err);
        }

        client.setSecurity(new soap.BearerSecurity(self.access_token));

        client.Translate(params, function(err, response, raw, soapHeader)
        {
            if (err)
            {
                return console.error(err);
            }

            console.log(response);
        });
    });
};

// Translate Method
// params { text, from, to, contentType, category }
MsTranslator.prototype.translate = function(params, fn) {
    this.makeRequest('Translate', params, fn);
};