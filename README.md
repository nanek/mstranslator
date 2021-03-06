# DEPRECATED
Microsoft Translator API module for node.js

NOTE: This module currently only supports V2 of the API which will be discontinued on April 30, 2019.
https://docs.microsoft.com/en-us/azure/cognitive-services/translator/migrate-to-v3

See https://github.com/MicrosoftTranslator/Text-Translation-API-V3-NodeJS for examples of working with v3.

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

An API key from portal.azure.com is needed to create a token as of April 30, 2017.
See [Microsoft Translator API Documentation](http://docs.microsofttranslator.com/text-translate.html). For details on previous authentication API and
[migration info](https://translatorbusiness.uservoice.com/knowledgebase/articles/1078534-microsoft-translator-on-azure)

## Example Usage - Auto-generated token

```js
var MsTranslator = require('mstranslator');
// Second parameter to constructor (true) indicates that
// the token should be auto-generated.

var client = new MsTranslator({
  api_key: "your portal.azure.com api key"
}, true);

var params = {
  text: 'How\'s it going?',
  from: 'en',
  to: 'es'
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
  api_key: "your portal.azure.com api key"
}, true);

var params = {
  text: 'How\'s it going?',
  from: 'en',
  to: 'es'
};

// Using initialize_token manually.
client.initialize_token(function(err, keys) {
  console.log(keys);
  client.translate(params, function(err, data) {
    console.log(data);
  });
});
```


## Tests

    npm test


## License

Licensed under the [MIT license](LICENSE-MIT).
