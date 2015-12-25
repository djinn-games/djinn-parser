'use strict';

var escodegen = require('escodegen');
const FUNC_DEFS = require('./defs-functions.js');

const OPERATORS = {
    'plus':     {operator: '+', type: 'unary'},
    'minus':    {operator: '-', type: 'unary'}
};

function Translator () {
    this._translators = {
        'CallExpression': this._translateCall,
        'ExpressionSentence': this._translateExpressionSentence,
        'Identifier': this._translateIdentifier,
        'Literal': this._translateLiteral,
        'OperationExpression': this._translateOperation,
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

Translator.prototype._translateOperation = function (scope, block) {
    let op = OPERATORS[block.operator];
    if (!op) {
        throw new Error(`Unrecognised operator: ${block.operator}`);
    }

    return op.type === 'unary' ?
        this._translateUnaryOperation(scope, block) : {};
};

Translator.prototype._translateUnaryOperation = function (scope, block) {
    this._assertDataType(block.right, ['int', 'float']);

    return {
        type: 'UnaryExpression',
        operator: OPERATORS[block.operator].operator,
        prefix: true,
        argument: this._translateBlock(scope, block.right)
    };
};

Translator.prototype._translateCall = function (scope, block) {
    let callee = this._translateIdentifier(scope, block.callee);
    this._assertFunctionArgs(block);

    return {
        type: 'CallExpression',
        callee: this._translateInternalId(scope, block.callee),
        arguments: block.args.map(function (arg) {
            return this._translateBlock(scope, arg);
        }.bind(this))
    }
};

Translator.prototype._translateIdentifier = function (scope, block) {
    this._assertIdentifierExists(scope, block);
    return {
        type: "Identifier",
        name: block.name
    };
};

Translator.prototype._translateInternalId = function (scope, block) {
    return {
        type: "MemberExpression",
        object: {
            type: "Identifier",
            name: "DJINN"
        },
        property: this._translateBlock(scope, block)
    };
};


//
// assertions
//

Translator.prototype._assertDataType = function (block, expected) {
    if (expected.indexOf(block.dataType) === -1) {
        throw new Error(`Expecting data type/s: ${expected.join(",")}`);
    }
};

Translator.prototype._assertIdentifierExists = function (scope, identifier) {
    if (!(identifier.name in FUNC_DEFS)) {
        throw new Error(`Undefined identifier: ${identifier.name}`);
    }
};

Translator.prototype._assertFunctionArgs = function (block) {
    let def = FUNC_DEFS[block.callee.name];

    if (def.args.length !== block.args.length) {
        throw new Error(
            `Expecting ${def.args.length} argument/s ` +
            `for function: ${block.callee.name}`);
    }
};


module.exports = Translator;
