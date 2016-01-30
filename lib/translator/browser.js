'use strict';

var escodegen = require('escodegen');
var _ = require('lodash');

var FUNC_DEFS = require('./defs-functions.js');
var Asserters = require('./asserters.js');
var Scope = require('./scope.js');

var throwError = require('./throw-error.js');

const OPERATORS = {
    // sign
    'plus':     {operator: '+',  type: 'unary'},
    'minus':    {operator: '-',  type: 'unary'},
    // arith
    'add':      {operator: '+',  type: 'binary'},
    'sub':      {operator: '-',  type: 'binary'},
    'mul':      {operator: '*',  type: 'binary'},
    'div':      {operator: '/',  type: 'binary'},
    'mod':      {operator: '%',  type: 'binary'},
    // comparators
    'lt':       {operator: '<',  type: 'binary'},
    'gt':       {operator: '>',  type: 'binary'},
    'lte':      {operator: '<=', type: 'binary'},
    'gte':      {operator: '>=', type: 'binary'},
    'eq':       {operator: '==', type: 'binary'},
    'neq':      {operator: '!=', type: 'binary'},
    // logical
    'and':      {operator: '&&', type: 'binary'},
    'or':       {operator: '||', type: 'binary'},
    'not':      {operator: '!',  type: 'unary'}
};



function Translator () {
    this._translators = {
        'CallExpression': this._translateCall,
        'ExpressionSentence': this._translateExpressionSentence,
        'Identifier': this._translateIdentifier,
        'Literal': this._translateLiteral,
        'OperationExpression': this._translateOperation,
        'Program': this._translateProgram,
        'VarDeclaration': this._translateVarDeclaration,
        'ConstDeclaration': this._translateConstDeclaration,
        'AssignmentExpression': this._translateAssignment
    };
}


Translator.prototype.translate = function (ast) {
    let estree = this.toEstree(ast);
    return escodegen.generate(estree);
    // return JSON.stringify(estree, null, 2);
};

// from djinn AST to ES tree
// https://github.com/estree/estree
Translator.prototype.toEstree = function (ast) {
    return this._translateBlock(new Scope(), ast);
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
    Asserters.assertDataType(block.right, block.operator === 'not'
        ? ['bool']
        : ['int', 'float']);

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
    let right = this.shouldCheckForDivByZero(block)
            ? this.insertCheckForDivByZero(scope, block.right)
            : this._translateBlock(scope, block.right);

    // assert operands types
    Asserters.assertBinaryOperands(block);

    // assign a dataType
    block.dataType = this.getDataTypeForBinaryOperation(block);

    return {
        type: ['not', 'and', 'or'].indexOf(block.operator) >= 0
            ? 'LogicalExpression'
            : 'BinaryExpression',
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

    let callee = this._translateIdentifier(scope, block.callee, true);

    // fetch the dataType for the return value of the function
    if (!block.dataType) {
        block.dataType = FUNC_DEFS[block.callee.name].dataType;
    }

    Asserters.assertFunctionArgs(block);

    return {
        type: 'CallExpression',
        callee: {
            type: 'MemberExpression',
            object: {
                type: 'Identifier',
                name: 'DJINN'
            },
            property: callee
        },
        arguments: args
    };
};

Translator.prototype._translateIdentifier = function (scope, block, isFunction) {
    Asserters.assertIdentifierExists(scope, block, isFunction);

    if (isFunction) {
        return {
            type: 'Identifier',
            name: block.name
        };
    }
    else {
        let lookup = scope.getVarOrConst(block.name);
        block.dataType = lookup.dataType;

        return {
            type: 'MemberExpression',
            object: {
                type: 'MemberExpression',
                object:
                {
                    type: 'Identifier',
                    name: 'DJINN'
                },
                property: {
                    type: 'Identifier',
                    name: '__scope'
                }
            },
            property: this.idToLiteral(lookup),
            computed: true
        };
    }
};

Translator.prototype._translateVarDeclaration = function (scope, block) {
    // check that is not a function
    if (block.id.name in FUNC_DEFS) {
        throwError(block.line, `Identifier already exists: ${block.id.name}`);
    }
    // add to the current scope
    if (!scope.addVar(block.id.name, block.dataType)) {
        throwError(block.line, `Identifier already exists: ${block.id.name}`);
    }

    // get from the scope the translated/prefixed version of the variable name
    block.id.name = scope.getVarOrConst(block.id.name).name;

    // no initialisation? we need to manually include a default one
    let init = block.init
        ? this._translateBlock(scope, block.init)
        : this.defaultLiteralForType(block.dataType);
    // assert data type of initialization, unless it was one by default
    if (block.init) { Asserters.assertDataType(block.init, [block.dataType]); }

    return this.buildAssignment(block.id, init, '=');
};


Translator.prototype._translateConstDeclaration = function (scope, block) {
    // check that is not a function
    if (block.id.name in FUNC_DEFS) {
        throwError(block.line, `Identifier already exists: ${block.id.name}`);
    }
    // add to the current scope
    if (!scope.addConst(block.id.name, block.dataType)) {
        throwError(block.line, `Identifier already exists: ${block.id.name}`);
    }

    // get from the scope the translated/prefixed version of the variable name
    block.id.name = scope.getVarOrConst(block.id.name).name;

    // no initialisation? we need to manually include a default one
    let init = block.init
        ? this._translateBlock(scope, block.init)
        : this.defaultLiteralForType(block.dataType);
    // assert data type of initialization, unless it was one by default
    if (block.init) { Asserters.assertDataType(block.init, [block.dataType]); }

    return this.buildAssignment(block.id, init, '=');
};

Translator.prototype._translateAssignment = function (scope, block) {
    // check that variable exists in scope
    Asserters.assertIdentifierExists(scope, block.left);

    // check this is not a constant
    let lookup = scope.getVarOrConst(block.left.name);
    if (lookup.kind === 'const') {
        throwError(block.line,
            `Can\'t assign values to a const: ${block.left.name}`);
    }

    // check data type
    let right = this._translateBlock(scope, block.right);
    Asserters.assertDataType(block.right, [lookup.dataType]);

    block.dataType = lookup.dataType;

    return this.buildAssignment(lookup, right, block.operator);
};


// ...

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
// Extend translator
//

// TODO: put these into their own objects and remove references
// to the translator itself
_.extend(Translator.prototype, require('./helpers.js'));

module.exports = Translator;
