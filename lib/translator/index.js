'use strict';

var Translator = require('./browser.js');

var options = require('minimist')(process.argv.slice(2));

// this is used from the command line
// -> run the translator
if (require.main === module) {
    let stdinReader = require('../stdin-reader');

    stdinReader.pipe(function (ast) {
        let output = 'ast' in options ? 'ast' : 'js';
        let translator = new Translator();
        let res = translator.translate(JSON.parse(ast), output);
        console.log(res);
    });
}

module.exports = Translator;
