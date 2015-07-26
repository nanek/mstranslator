var MsTranslator = require('../');
var fs           = require('fs');
var assert       = require('assert');

var client_id     = process.env.MSCLIENT_ID;
var client_secret = process.env.MSCLIENT_SECRET;

if (!client_id || !client_secret)
{
    console.log('missing client_id and client_secret');
    process.exit(1);
}

var translator = new MsTranslator({
        client_id    : client_id,
        client_secret: client_secret
    }, true);

describe('MsTranslator', function()
{
    this.timeout(10000);

    it('tests translate', function(done)
    {
        var params = { text: 'translate this.', from: 'en', to: 'es' };
        translator.translate(params, function(err, data)
        {
            assert.equal(data.toLowerCase(), 'traducir esto.');
            done();
        });
    });

});