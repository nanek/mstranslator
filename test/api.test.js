var MsTranslator = require('../mstranslator');

var client_id=process.env.MSCLIENT_ID;
var client_secret=process.env.MSCLIENT_SECRET;

if (!client_id || !client_secret) {
  console.log('missing client_id and client_secret');
  process.exit(1);
}

var translator = new MsTranslator({client_id: client_id, client_secret: client_secret});


// Test framework offers assert.
var assert = require('assert');


// Each before in the root, thus only once for all tests
beforeEach(function(done){
  translator.initialize_token(function(){
    done();
  });
});

describe('MsTranslator', function() {
  
  /*
  it('test breakSentences', function() {
    var text = encodeURIComponent("This is one sentence. The method will count this as the second sentences. Finally, the third sentence.");
    var params = { text: text, language: 'en' };
    translator.access_token(client_id, client_secret, function(err, access_token) {
      translator.breakSentences(params, access_token, function(err, data) {
      });
    });
  }*/

  it('tests detect', function(done) {
    var text = encodeURIComponent("The language of this text is going to be detected.");
    var params = { text: text };
    translator.detect(params, function(err, data) {
      assert.equal(data, 'en');
      done();
    });
  });

  it('tests detectArray', function(done) {
    var texts = "[\"This is English text.\", \"Das ist deutsche Text.\", \"Questo un testo italiano.\"]";
    var params = { texts: texts };
    translator.detectArray(params, function(err, data) {
      assert.eql(data, ['en', 'de', 'it']);
      done();
    });
  });

  it('tests getLanguageNames', function(done) {
    var languageCodes = "[\"de\", \"fr\", \"it\"]";
    var params = { locale: 'en', languageCodes: languageCodes };
    translator.getLanguageNames(params, function(err, data) {
      assert.eql(data, ['German', 'French', 'Italian']);
      done();
    });
  });

  it('tests getLanguagesForSpeak', function(done) {
    translator.getLanguagesForSpeak(function(err, data) {
      assert.type(data, 'object');
      done();
    });
  });

  it('tests getLanguagesForTranslate', function(done) {
    translator.getLanguagesForTranslate(function(err, data) {
      assert.type(data, 'object');
      done();
    });
  });


  it('tests speak', function(done) {
    var params = { text: 'Muchas gracias.', language: 'es', format: 'audio/wav' };
    translator.speak(params, function(err, data) {
      assert.type(data, 'object');
      done();
    });
  });

  it('tests translate', function(done) {
    var params = { text: 'translate this.', from: 'en', to: 'es' };
    translator.translate(params, function(err, data) {
      assert.equal(data, 'traducir esto.');
      done();
    });
  });

  it('tests translateArray', function(done) {
    var texts = ['monkey', 'cow'];
    var params = { texts: texts , from: 'en', to: 'es', maxTranslations:5 };
    translator.translateArray(params, function(err, data) {
      assert.equal(data[0].TranslatedText, 'mono');
      assert.equal(data[1].TranslatedText, 'vaca');
      done();
    });
  });

});
