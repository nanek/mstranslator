# Simplified Microsoft Translator API module for node.js based on SOAP

  [Microsoft Translator Documentation](http://msdn.microsoft.com/en-us/library/dd576287.aspx)

## Methods supported (using SOAP)

  [Microsoft Translator API Reference](http://msdn.microsoft.com/en-us/library/ff512404.aspx)

  * translate (maximum input length: 10240 characters)

Because the library has been implemented using SOAP, it should be trivial to add new methods.

## Installation

    $ npm install node-mstranslate-soap

You will also need to register to get an client_id and client_secret to
create access tokens. Details at http://msdn.microsoft.com/en-us/library/hh454950.aspx

## Example Usage - Auto-generated token

```js
var MsTranslator = require('mstranslator');

// Second parameter to constructor (true) indicates that
// the token should be auto-generated.
var client = new MsTranslator({
    client_id    : "your client_id",
    client_secret: "your client secret"
}, true);

var params = {
    text: 'How\'s it going?',
    from: 'en',
    to  : 'es'
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
    client_id    : "your client_id",
    client_secret: "your client secret"
});

var params = {
    text: 'How\'s it going?',
    from: 'en',
    to  : 'es'
};


// Using initialize_token manually.
client.initialize_token(function(keys)
{
    console.log(keys.access_token);
    client.translate(params, function(err, data)
    {
        console.log(data);
    });
});
```


## Tests

    npm test

Requires mocha. Tests are currently limited, feel free to fork and send a pull request.


## License

Licensed under the [MIT license](LICENSE-MIT).
