'use strict';

var Parser = require('./lib/parser/browser.js');
var Translator = require('./lib/translator/browser.js');

function Compiler() {
    this.parser = new Parser();
    this.translator = new Translator();
}

Compiler.prototype.compile = function (source) {
    let ast = this.parser.parse(source);
    let js = this.translator.translate(ast);

    return js;
};

module.exports = Compiler;
