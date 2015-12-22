'use strict';

var Parser = require('./lib/parser');
var Translator = require('./lib/translator');
var stdinReader = require('./lib/stdin-reader');

function Compiler() {
    this.parser = new Parser();
    this.translator = new Translator();
}

Compiler.prototype.compile = function (source) {
    let ast = this.parser.parse(source);
    let js = this.translator.translate(ast);

    return js;
};

if (require.main === module) {
    stdinReader.pipe(function (source) {
        let compiler = new Compiler();
        let out = compiler.compile(source);
        console.log(out);
    });
}

module.exports = Compiler;
