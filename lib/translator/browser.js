'use strict';

var escodegen = require('escodegen');

var Scope = require('./scope.js');
var translateBlock = require('./block-translators.js');

function Translator() {}

Translator.prototype.translate = function (ast) {
    let estree = this.toEstree(ast);
    return escodegen.generate(estree);
    // return JSON.stringify(estree, null, 2);
};

// from djinn AST to ES tree
// https://github.com/estree/estree
Translator.prototype.toEstree = function (ast) {
    return translateBlock(new Scope(), ast);
};

module.exports = Translator;
