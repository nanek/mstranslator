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

You will also need to register to get an client_id and client_secret to
create access tokens. Details at http://msdn.microsoft.com/en-us/library/hh454950.aspx
Specify these values as environment variables.

    MSCLIENT_ID=''
    MSCLIENT_SECRET=''

## Example Usage

    var tanslator = require('mstranslator');

    var params = { 
      text: 'How\'s it going?'
      , from: 'en'
      , to: 'es'
    };

    translator.access_token('your_client_id', 'your_client_secret', function(err, access_token) {
      translator.translate(params, access_token, function(err, data) {
        console.log(data);
      });
    });

## Tests

    expresso
