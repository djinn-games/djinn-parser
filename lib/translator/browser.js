'use strict';

var escodegen = require('escodegen');

var Scope = require('./scope.js');
var translateBlock = require('./block-translators.js');

function Translator() {}

Translator.prototype.translate = function (ast, outputMode) {
    let estree = this.toEstree(ast);
    return outputMode === 'ast'
        ? JSON.stringify(estree, null, 2)
        : escodegen.generate(estree);
};

// from djinn AST to ES tree
// https://github.com/estree/estree
Translator.prototype.toEstree = function (ast) {
    return translateBlock(new Scope(), ast);
};

module.exports = Translator;
