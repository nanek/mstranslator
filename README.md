# Microsoft Translator API module for node.js

  [Microsoft Translator Documentation](http://msdn.microsoft.com/en-us/library/dd576287.aspx)

[![devDependency Status](https://david-dm.org/nanek/mstranslator/dev-status.svg)](https://david-dm.org/nanek/mstranslator#info=devDependencies)

[SOAP version that supports translating longer strings](https://github.com/tommedema/node-mstranslate-soap)

## Methods

  [Microsoft Translator API Reference](http://msdn.microsoft.com/en-us/library/ff512404.aspx)

  [API Docs](./API.md)

  * addTranslation
  * addTranslationArray (not implemented)
  * breakSentences (not working)
  * detect
  * detectArray
  * getLanguageNames
  * getLanguagesForSpeak
  * getLanguagesForTranslate
  * getTranslations
  * getTranslationsArray
  * speak
  * translate
  * translateArray
  * translateArray2

## Installation

    $ npm install mstranslator

You will also need to register to get an client_id and client_secret to
create access tokens. Details at http://msdn.microsoft.com/en-us/library/hh454950.aspx

Or if you've already migrated to portal.azure.com: Your api key is needed to create a token.
Details at https://translatorbusiness.uservoice.com/knowledgebase/articles/1078534-microsoft-translator-on-azure

## Example Usage - Auto-generated token

```js
var MsTranslator = require('mstranslator');
// Second parameter to constructor (true) indicates that
// the token should be auto-generated.

// old token API
var client = new MsTranslator({
  client_id: "your client_id" // use this for the old token API
  , client_secret: "your client secret" // use this for the old token API
}, true);

// new token API
var client = new MsTranslator({
  api_key: "your portal.azure.com api key" // use this for the new token API. 
}, true);

var params = {
  text: 'How\'s it going?'
  , from: 'en'
  , to: 'es'
};

// Don't worry about access token, it will be auto-generated if needed.
client.translate(params, function(err, data) {
  console.log(data);
});
```

## Example Usage - Generate token manually

```js
var MsTranslator = require('mstranslator');
var client = new MsTranslator({
  client_id: "your client_id"
  , client_secret: "your client secret"
});

var client = new MsTranslator({
  api_key: "your portal.azure.com api key" // use this for the new token API. 
}, true);

var params = {
  text: 'How\'s it going?'
  , from: 'en'
  , to: 'es'
};

// Using initialize_token manually.
client.initialize_token(function(keys){
  console.log(keys.access_token);
  client.translate(params, function(err, data) {
    console.log(data);
  });
});
```


## Tests

    npm test


## License

Licensed under the [MIT license](LICENSE-MIT).
