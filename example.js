var MsTranslator = require('./mstranslator');

var client_secret=process.env.MSCLIENT_SECRET;
var client_id=process.env.MSCLIENT_ID;

if (!client_secret || !client_id) {
  console.log('client_secret and client_id missing');
  process.exit(1);
}

var params = {
  text: 'How\'s it going?',
  from: 'en',
  to: 'es'
};

var client = new MsTranslator({
  client_id: client_id,
  client_secret: client_secret
});

client.initialize_token(function(){
  client.translate(params, function(err, data) {
    if (err) console.log('error:' + err);
    console.log(data);
    process.exit();
  });
});
