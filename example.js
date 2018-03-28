var MsTranslator = require('./mstranslator');

var api_key = process.env.API_KEY;

if (!api_key) {
  console.log('missing api_key');
  process.exit(1);
}

var params = {
  text: 'How\'s it going?',
  from: 'en',
  to: 'es'
};

var client = new MsTranslator({api_key: api_key});

client.initialize_token(function(err){
  if (err) {
    console.log("initialize_token", err);
    return;
  }
  client.translate(params, function(err, data) {
    if (err) console.log('error:' + err.message);
    console.log(data);
    process.exit();
  });
});
