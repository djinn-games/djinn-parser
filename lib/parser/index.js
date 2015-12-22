'use strict';

var path = require('path');
var grammar;

var jison = require('jison');
var fs = require('fs');

var grammarFile = fs.readFileSync(
    path.join(__dirname, 'grammar.y'), 'utf8');
grammar = new jison.Parser(grammarFile);

function Parser() {}

Parser.prototype.parse = function (src) {
    return grammar.parse(src);
};

// this is used from the command line
// -> run the parser
if (require.main === module) {
    var source = '';

    // read source program from stdin
    process.stdin.resume();
    process.stdin.setEncoding('utf-8');
    process.stdin.on('data', function (data) { source += data; })
    process.stdin.on('end', function () {
        var parser = new Parser();
        var res = parser.parse(source);
        console.log(JSON.stringify(res, null, 2));
    });
}

module.exports = Parser;
