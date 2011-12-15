var MsTranslator = require('../mstranslator');

var client_id=process.env.MSCLIENT_ID;
var client_secret=process.env.MSCLIENT_SECRET;

if (!client_id || !client_secret) {
  console.log('missing client_id and client_secret');
  process.exit(1);
}

var translator = new MsTranslator({client_id: client_id, client_secret: client_secret});

/*
exports['test breakSentences'] = function(beforeExit, assert) {
  var text = encodeURIComponent("This is one sentence. The method will count this as the second sentences. Finally, the third sentence.");
  var params = { text: text, language: 'en' };
  translator.access_token(client_id, client_secret, function(err, access_token) {
    translator.breakSentences(params, access_token, function(err, data) {
    });
  });
}*/
exports['test detect'] = function(beforeExit, assert) {
  var text = encodeURIComponent("The language of this text is going to be detected.");
  var params = { text: text };
  translator.initialize_token(function(){
    translator.detect(params, function(err, data) {
      assert.equal(data, 'en');
    });
  });
}
exports['test detectArray'] = function(beforeExit, assert) {
  var texts = "[\"This is English text.\", \"Das ist deutsche Text.\", \"Questo un testo italiano.\"]";
  var params = { texts: texts };
  translator.initialize_token(function(){
    translator.detectArray(params, function(err, data) {
      assert.eql(data, ['en', 'de', 'it']);
    });
  });
}
exports['test getLanguageNames'] = function(beforeExit, assert) {
  var languageCodes = "[\"de\", \"fr\", \"it\"]";
  var params = { locale: 'en', languageCodes: languageCodes };
  translator.initialize_token(function(){
    translator.getLanguageNames(params, function(err, data) {
      assert.eql(data, ['German', 'French', 'Italian']);
    });
  });
}
exports['test getLanguagesForSpeak'] = function(beforeExit, assert) {
  translator.initialize_token(function(){
    translator.getLanguagesForSpeak(function(err, data) {
      assert.type(data, 'object');
    });
  });
}
exports['test getLanguagesForTranslate'] = function(beforeExit, assert) {
  translator.initialize_token(function(){
    translator.getLanguagesForTranslate(function(err, data) {
      assert.type(data, 'object');
    });
  });
}

exports['test speak'] = function(beforeExit, assert) {
  var params = { text: 'Muchas gracias.', language: 'es', format: 'audio/wav' };
  translator.initialize_token(function(){
    translator.speak(params, function(err, data) {
      assert.type(data, 'object');
    });
  });
}
exports['test translate'] = function(beforeExit, assert) {
  var params = { text: 'translate this.', from: 'en', to: 'es' };
  translator.initialize_token(function(){
    translator.translate(params, function(err, data) {
      assert.equal(data, 'traducir esto.');
    });
  });
}
exports['test translateArray'] = function(beforeExit, assert) {
  var texts = ['monkey', 'cow'];
  var params = { texts: texts , from: 'en', to: 'es', maxTranslations:5 };
  translator.initialize_token(function(){
    translator.translateArray(params, function(err, data) {
      assert.equal(data[0].TranslatedText, 'mono');
      assert.equal(data[1].TranslatedText, 'vaca');
    });
  });
}
