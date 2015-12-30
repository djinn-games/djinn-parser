'use strict';

var escodegen = require('escodegen');

var FUNC_DEFS = require('./defs-functions.js');

const OPERATORS = {
    'plus':     {operator: '+', type: 'unary'},
    'minus':    {operator: '-', type: 'unary'},
    'add':      {operator: '+', type: 'binary'},
    'sub':      {operator: '-', type: 'binary'},
    'mul':      {operator: '*', type: 'binary'},
    'div':      {operator: '/', type: 'binary'},
    'mod':      {operator: '%', type: 'binary'}
};

function throwError(line, message) {
    throw new Error(`Line ${line} – ${message}`);
}

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
        throwError(astBlock.line,
            `Can't translate block of type: ${astBlock.type}`);
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
        raw: JSON.stringify(block.value)
    };
};

Translator.prototype._translateOperation = function (scope, block) {
    let op = OPERATORS[block.operator];
    if (!op) {
        throwError(block.line, `Unrecognised operator: ${block.operator}`);
    }

    return op.type === 'unary'
        ? this._translateUnaryOperation(scope, block)
        : this._translateBinaryOperation(scope, block);
};

Translator.prototype._translateUnaryOperation = function (scope, block) {
    this._assertDataType(block.right, ['int', 'float']);

    // assign a dataTpe to it so we can check it in other operations
    block.dataType = block.right.dataType;

    return {
        type: 'UnaryExpression',
        operator: OPERATORS[block.operator].operator,
        prefix: true,
        argument: this._translateBlock(scope, block.right)
    };
};

Translator.prototype._translateBinaryOperation = function (scope, block) {
    // translate operands first so we can check dataTypes
    let left = this._translateBlock(scope, block.left);
    let right = this._shouldCheckForDivByZero(block)
            ? this._insertCheckForDivByZero(scope, block.right)
            : this._translateBlock(scope, block.right);

    // assert operands types
    this._assertBinaryOperands(block);

    // assign a dataType
    block.dataType = this._getDataTypeForBinaryOperation(block);

    return {
        type: 'BinaryExpression',
        operator: OPERATORS[block.operator].operator,
        left: left,
        right: right
    };
};

Translator.prototype._translateCall = function (scope, block) {
    // translate arguments first so we can determine if their dataType
    // are the expected ones
    let args = block.args.map(function (arg) {
        return this._translateBlock(scope, arg);
    }.bind(this));

    let callee = this._translateIdentifier(scope, block.callee);

    // fetch the dataType for the return value of the function
    if (!block.dataType) {
        block.dataType = FUNC_DEFS[block.callee.name].dataType;
    }

    this._assertFunctionArgs(block);

    return {
        type: 'CallExpression',
        callee: this._translateInternalId(scope, block.callee),
        arguments: args
    };
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
        type: 'MemberExpression',
        object: {
            type: 'Identifier',
            name: 'DJINN'
        },
        property: this._translateBlock(scope, block)
    };
};

Translator.prototype._translateInternalCall =
function (funcName, scope /*, arg1, arg2, ... */) {
    let args = Array.prototype.slice.call(arguments, 2, arguments.length)
        .map(function (arg) {
            return this._translateBlock(scope, arg);
        }.bind(this));

    return {
        type: 'CallExpression',
        callee: {
            type: 'MemberExpression',
            object: {
                type: 'Identifier',
                name: 'DJINN'
            },
            property: {
                type: 'Identifier',
                name: funcName
            },
        },
        arguments: args
    };
};


//
// assertions
//

Translator.prototype._assertDataType = function (block, expected) {
    if (expected.indexOf(block.dataType) === -1) {
        throwError(block.line,
            `Expecting data type/s: ${expected.join(",")}` +
            ` but got: ${block.dataType}`);
    }
};

Translator.prototype._assertIdentifierExists = function (scope, identifier) {
    if (!(identifier.name in FUNC_DEFS)) {
        throwError(identifier.line, `Undefined identifier: ${identifier.name}`);
    }
};

Translator.prototype._assertFunctionArgs = function (block) {
    let def = FUNC_DEFS[block.callee.name];

    if (def.args.length !== block.args.length) {
        throwError(block.line,
            `Expecting ${def.args.length} argument/s ` +
            `for function: ${block.callee.name}`);
    }

    block.args.forEach(function (arg, index) {
        this._assertDataType(arg, def.args[index]);
    }.bind(this));
};

Translator.prototype._assertBinaryOperands = function (block) {
    // NOTE: different operations will require different types
    //
    if (block.operator === 'add' && (block.left.dataType === 'str' ||
                                     block.right.dataType === 'str')) {
        // do nothing since it's a string concat
    }
    else if (block.operator === 'mod') {
        this._assertDataType(block.left, ['int']);
        this._assertDataType(block.right, ['int']);
    }
    else { // other binary arith operations require numbers
        this._assertDataType(block.left, ['int', 'float']);
        this._assertDataType(block.right, ['int', 'float']);
    }
};

//
// helpers
//

Translator.prototype._getDataTypeForBinaryOperation = function (block) {
    let res = 'int';

    // modulus -> int
    if (block.operator === 'mod') {
        res = 'int';
    // string concatenation -> str
    } else if (block.operator === 'add' &&
               (block.left.dataType === 'str') ||
               (block.right.dataType === 'str')) {
        res = 'str';
    // other arith -> float if at least one of the operands is float
    } else if (block.left.dataType === 'float' ||
               block.right.dataType === 'float') {
        res = 'float';
    }
    // other arith -> int if both operands are int

    return res;
};

Translator.prototype._shouldCheckForDivByZero = function (block) {
    return block.operator === 'div' || block.operator === 'mod';
};

Translator.prototype._insertCheckForDivByZero = function (scope, block) {
    return this._translateInternalCall('__checkDivByZero', scope, block);
};

module.exports = Translator;
