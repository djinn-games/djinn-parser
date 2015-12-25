'use strict';

var escodegen = require('escodegen');

function Translator () {
    this._translators = {
        'Program': this._translateProgram,
        'ExpressionSentence': this._translateExpressionSentence,
        'Literal': this._translateLiteral
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

    return translator.bind(this)(scope, astBlock);
};

//
// translator blocks
//

Translator.prototype._translateProgram = function (scope, block) {
    return {
        type: 'Program',
        body: this._translateBody(scope, block.body)
    };
};

Translator.prototype._translateBody = function (scope, body) {
    return body.sentences.map(function (sentence) {
        return this._translateBlock(scope, sentence);
    }.bind(this));
};

Translator.prototype._translateExpressionSentence = function (scope, block) {
    return {
        type: 'ExpressionStatement',
        expression: this._translateBlock(scope, block.expression)
    };
};

Translator.prototype._translateLiteral = function (scope, block) {
    return {
        type: 'Literal',
        value: block.value,
        raw: JSON.stringify(block.value),
        value: block.value
    };
};

module.exports = Translator;
