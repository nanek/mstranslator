# Microsoft Translator API module for node.js

  [Microsoft Translator Documentation](http://msdn.microsoft.com/en-us/library/dd576287.aspx)

## Methods

  [Microsoft Translator API Reference](http://msdn.microsoft.com/en-us/library/ff512404.aspx)

  * addTranslation (not implemented)
  * addTranslationArray (not implemented)
  * breakSentences (not working)
  * detect
  * detectArray
  * getAppIdToken (not implemented) This is a legacy, replaced by
    Access Token
  * getLanguageNames
  * getLanguagesForSpeak
  * getLanguagesForTranslate
  * getTranslations
  * getTranslationsArray
  * speak
  * translate
  * translateArray

## Installation

    $ npm install mstranslator

    
or just download it and put it in your project's node_module directory.

You will also need to register to get an client_id and client_secret to
create access tokens. Details at http://msdn.microsoft.com/en-us/library/hh454950.aspx

## Example Usage

    var MsTranslator = require('mstranslator');
    var client = new MsTranslator({client_id:"your client_id", client_secret: "your client secret"});
    var params = { 
      text: 'How\'s it going?'
      , from: 'en'
      , to: 'es'
    };
    
    client.initialize_token(function(keys){ 
      console.log(keys.access_token);
      client.translate(params, function(err, data) {
          console.log(data);
      });
    });
    


## Tests

    expresso
