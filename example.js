var MsTranslator  = require('./');
var fs            = require('fs');

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
                } , true);

var params = {
    text        : fs.readFileSync(__dirname + '/test/input/chinese-large-html.txt', {
                    encoding: 'utf8'
                }),
    from        : 'zh-CHS',
    to          : 'en',
    contentType : 'text/html',
    category    : 'general'
};

translator.translate(params, function(err, data) {
    console.log(data);
});