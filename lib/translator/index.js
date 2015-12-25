'use strict';

var Translator = require('./browser.js');

// this is used from the command line
// -> run the translator
if (require.main === module) {
    let stdinReader = require('../stdin-reader');

    stdinReader.pipe(function (ast) {
        let translator = new Translator();
        let res = translator.translate(ast);
        console.log(res);
    });
}

module.exports = Translator;
