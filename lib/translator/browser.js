'use strict';

var escodegen = require('escodegen');

function Translator () {
    this._translators = {
        'Program': this._translateProgram
    };
}

Translator.prototype.translate = function (ast) {
    let estree = this.toEstree(ast);
    return escodegen.generate(estree);
};

// from djinn AST to ES tree
// https://github.com/estree/estree
Translator.prototype.toEstree = function (ast) {
    return this._translateBlock({}, ast);
};

Translator.prototype._translateBlock = function (scope, astBlock) {
    let translator =  this._translators[astBlock.type];
    if (!translator) {
        throw new Error(`Can't translate block of type: ${astBlock.type}`);
    }

    return translator(scope, astBlock);
};

//
// translator blocks
//

Translator.prototype._translateProgram = function (scope, block) {
    return {
        type: 'Program',
        body: []
    };
};

module.exports = Translator;
