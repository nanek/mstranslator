# MsTranslator

**Parameters**

-   `credentials` **Object** Credentials
    -   `credentials.client_id` **string** Client id
    -   `credentials.client_secret` **string** Client secret
-   `autoRefresh` **[boolean]** Auto refresh

## addTranslation

Adds a translation to the translation memory.

**Parameters**

-   `params` **Object** Parameters
    -   `params.translatedText` **string** Translated text in the target language.
          The string has a maximum length of 2000 characters.
    -   `params.from` **string** Language code of the source language. Must be a
          valid culture name.
    -   `params.to` **string** Language code of the target language. Must be a
          valid culture name.
    -   `params.originalText` **string** The text to translate from. The string
          has a maximum length of 1000 characters.
    -   `params.rating` **[int]** The quality rating for this string. Value
          between -10 and 10. (optional, default `1`)
    -   `params.contentType` **[string]** The format of the text being translated.
          The supported formats are 'text/plain' and 'text/html'. Any HTML needs to
          be well-formed.
    -   `params.category` **[string]** The category (domain) of the
          translation. (optional, default `general`)
    -   `params.uri` **[string]** The content location of this translation.
    -   `params.user` **string** A string used to track the originator of the
          submission.
-   `fn` **callback** callback

## breakSentences

Breaks a piece of text into sentences and returns an array containing the
lengths in each sentence.

**Parameters**

-   `params` **Object** Parameters
    -   `params.text` **string** The text to split into sentences. The size of
          the text must not exceed 10000 characters.
    -   `params.language` **string** Language code of input text.
-   `fn` **callback** callback

## detect

Detects the language of a selection of text.

**Parameters**

-   `params` **Object** Parameters
    -   `params.text` **string** A string representing the text from an unknown
          language. The size of the text must not exceed 10000 characters.
-   `fn` **callback** callback

## detectArray

Detects the language of an array of strings.

**Parameters**

-   `params` **Object** Parameters
    -   `params.texts` **Array&lt;string&gt;** A string array representing the text from an
          unknown language. The size of the text must not exceed 10000 characters.
-   `fn` **callback** callback

## getLanguageNames

Obtains a list of the languages supported by the Translator Service.

**Parameters**

-   `locale` **string** A string representing a combination of an ISO 639
      two-letter lowercase culture code associated with a language and an
      ISO 3166 two-letter uppercase subculture code to localize the language
      names or a ISO 639 lowercase culture code by itself.
-   `languageCodes` **Array&lt;string&gt;** A string array representing the ISO 639-1
      language codes to retrieve the friendly name for.
-   `params`  
-   `fn` **callback** callback

## getLanguagesForSpeak

Obtains a list of the language codes supported by the Translator Service for
speech synthesis.

**Parameters**

-   `fn` **callback** callback

## getLanguagesForTranslate

Obtains a list of the language codes supported by the Translator Service.

**Parameters**

-   `fn` **callback** callback

## getTranslations

Retrieves an array of translations for a given language pair from the store
and the MT engine. GetTranslations differs from Translate as it returns all
available translations.

**Parameters**

-   `params` **Object** Parameters
    -   `params.text` **string** The text to translate. The size of the text must
          not exceed 10000 characters.
    -   `params.from` **string** Language code of the translation text.
    -   `params.to` **string** Language code to translate the text into.
    -   `params.maxTranslations` **int** Maximum number of translations to return.
    -   `params.options` **[Object]** Options
-   `fn` **callback** callback

## getTranslationsArray

Returns an array of alternative translations of the passed array of text.

**Parameters**

-   `params` **Object** Parameters
    -   `params.texts` **Array&lt;string&gt;** The texts for translation. All strings must be
          of the same language. The total of all texts to be translated must not
          exceed 10000 characters. The maximum number of array elements is 10.
    -   `params.from` **string** Language code of the translation text.
    -   `params.to` **string** Language code to translate the text into.
    -   `params.maxTranslations` **int** Maximum number of translations to return.
    -   `params.options` **[Object]** Options
-   `fn` **callback** callback

## speak

Returns a string which is a URL to a wave or mp3 stream of the passed-in text
being spoken in the desired language.

**Parameters**

-   `params` **Object** Parameters
    -   `params.text` **string** A sentence or sentences of the specified language
          to be spoken for the wave stream. The size of the text to speak must not
          exceed 2000 characters.
    -   `params.language` **string** Language code to speak the text in
    -   `params.format` **[string]** Content-type 'audio/wav' or
          'audio/mp3' (optional, default `audio/wav`)
    -   `params.options` **[Object]** Options
-   `fn` **callback** callback

## translate

Converts a text string from one language to another.

**Parameters**

-   `params` **Object** Parameters
    -   `params.text` **string** The text to translate. The size of the text must
         not exceed 10000 characters.
    -   `params.from` **[string]** Language code of the translation text.
    -   `params.to` **string** Language code to translate the text into.
    -   `params.contentType` **[string]** The format of the text being translated.
          The supported formats are 'text/plain' and 'text/html'. Any HTML needs to
          be well-formed.
    -   `params.category` **[string]** The category of the translation (optional, default `general`)
-   `fn` **callback** callback

## translateArray

Translates an array of texts into another language.

**Parameters**

-   `params` **Object** Parameters
    -   `params.texts` **Array&lt;string&gt;** The texts for translation. All strings must be
          of the same language. The total of all texts to be translated must not
          exceed 10000 characters. The maximum number of array elements is 2000.
    -   `params.from` **[string]** Language code of the translation text
    -   `params.to` **string** Language code to translate the text to
    -   `params.options` **[Object]** Options
-   `fn` **callback** callback

## translateArray2

Works just like regular TranslateArray(), except it has an additional element
in the response structure, called "Alignment".
<http://msdn.microsoft.com/en-us/library/dn198370.aspx>

**Parameters**

-   `params` **Object** Parameters
    -   `params.texts` **Array&lt;string&gt;** The texts for translation. All strings must be
          of the same language. The total of all texts to be translated must not
          exceed 10000 characters. The maximum number of array elements is 2000.
    -   `params.from` **[string]** Language code of the translation text
    -   `params.to` **string** Language code to translate the text to
    -   `params.options` **[Object]** Options
-   `fn` **callback** callback

# callback

**Parameters**

-   `error` **Object** 
-   `data` **Object** 
