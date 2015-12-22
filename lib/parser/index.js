'use strict';

var path = require('path');
var grammar;

var jison = require('jison');
var fs = require('fs');

let grammarFile = fs.readFileSync(
    path.join(__dirname, 'grammar.y'), 'utf8');
grammar = new jison.Parser(grammarFile);

function Parser() {}

Parser.prototype.parse = function (src) {
    return grammar.parse(src);
};

// this is used from the command line
// -> run the parser
if (require.main === module) {
    let stdinReader = require('../stdin-reader');

    stdinReader.pipe(function (source) {
        let parser = new Parser();
        let res = parser.parse(source);
        console.log(JSON.stringify(res, null, 2));
    });
}

module.exports = Parser;
