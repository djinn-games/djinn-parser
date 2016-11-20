'use strict';

var throwError = require('./throw-error.js');
var Asserters = require('./asserters.js');
var Helpers = require('./helpers.js');
var FUNC_DEFS = require('./defs-functions.js');

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

const BLOCKS =  {
    'CallExpression': translateCall,
    'ExpressionSentence': translateExpressionSentence,
    'Identifier': translateIdentifier,
    'Literal': translateLiteral,
    'OperationExpression': translateOperation,
    'Program': translateProgram,
    'VarDeclaration': translateVarDeclaration,
    'ConstDeclaration': translateConstDeclaration,
    'AssignmentExpression': translateAssignment,
    'IfSentence': translateIf,
    'LoopSentence': translateLoop,
    'BreakSentence': translateBreak
};

//
// generic translator
//

function translateBlock(scope, astBlock) {
    let translator = BLOCKS[astBlock.type];
    if (!translator) {
        throwError(astBlock.line,
            `Can't translate block of type: ${astBlock.type}`);
    }

    return translator(scope, astBlock);
}

//
// high level blocks (those present in BLOCKS)
//

function translateProgram(scope, block) {
    return {
        type: 'Program',
        body: translateBody(scope, block.body)
    };
}

function translateBody(scope, body) {
    return body.sentences.map(function (sentence) {
        return translateBlock(scope, sentence);
    });
}

function translateExpressionSentence(scope, block) {
    return {
        type: 'ExpressionStatement',
        expression: translateBlock(scope, block.expression)
    };
}

function translateLiteral(scope, block) {
    return {
        type: 'Literal',
        value: block.value,
        raw: JSON.stringify(block.value)
    };
}

function translateOperation(scope, block) {
    let op = OPERATORS[block.operator];
    if (!op) {
        throwError(block.line, `Unrecognised operator: ${block.operator}`);
    }

    return op.type === 'unary'
        ? translateUnaryOperation(scope, block)
        : translateBinaryOperation(scope, block);
}

function translateCall(scope, block) {
    // translate arguments first so we can determine if their dataType
    // are the expected ones
    let args = block.args.map(function (arg) {
        return translateBlock(scope, arg);
    });

    let callee = translateIdentifier(scope, block.callee, true);

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
}

function translateIdentifier(scope, block, isFunction) {
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
            property: Helpers.idToLiteral(lookup),
            computed: true
        };
    }
}

function translateVarDeclaration(scope, block) {
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
        ? translateBlock(scope, block.init)
        : Helpers.defaultLiteralForType(block.dataType);
    // assert data type of initialization, unless it was one by default
    if (block.init) { Asserters.assertDataType(block.init, [block.dataType]); }

    return Helpers.buildAssignment(block.id, init, '=');
}

function translateConstDeclaration(scope, block) {
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
        ? translateBlock(scope, block.init)
        : Helpers.defaultLiteralForType(block.dataType);
    // assert data type of initialization, unless it was one by default
    if (block.init) { Asserters.assertDataType(block.init, [block.dataType]); }

    return Helpers.buildAssignment(block.id, init, '=');
}

function translateAssignment(scope, block) {
    // check that variable exists in scope
    Asserters.assertIdentifierExists(scope, block.left);

    // check this is not a constant
    let lookup = scope.getVarOrConst(block.left.name);
    if (lookup.kind === 'const') {
        throwError(block.line,
            `Can\'t assign values to a const: ${block.left.name}`);
    }

    // check data type
    let right = translateBlock(scope, block.right);
    Asserters.assertDataType(block.right, [lookup.dataType]);

    block.dataType = lookup.dataType;

    return Helpers.buildAssignment(lookup, right, block.operator);
}

function translateIf(scope, block) {
    let subscope = scope.push();

    let condition = translateBlock(subscope, block.if.condition);
    Asserters.assertDataType(block.if.condition, ['bool']);

    return {
       type: 'IfStatement',
       test: condition,
       consequent: {
           type: 'BlockStatement',
           body: block.if.consequent.map(function (x) {
               return translateBlock(subscope, x);
           })
       },
       alternate: translateElseList(subscope, block.if.alternates)
    };
}

function translateLoop(scope, block) {
    let subscope = scope.push();
    subscope.flagInLoop();

    return {
        type: 'ForStatement',
        init: null,
        test: null,
        update: null,
        body: {
            type: 'BlockStatement',
            body: translateBody(subscope, block)
        }
    };
}

function translateBreak(scope, block) {
    Asserters.assertInsideALoop(scope, block);

    return {
        type: 'BreakStatement',
        label: null
    };
}


//
// misc blocks
//

function translateElseList(scope, blockList) {
    let block = blockList.shift(); // pop first else
    scope = scope.pop()

    if (block && block[0].if) { // this is an elseif
        block[0].if.alternates = blockList || [];
        return translateIf(scope, block[0]);
    }
    else { // this is an else
        return {
            type: 'BlockStatement',
            body: block
                ? block.map(function (x) {
                    return translateBlock(scope, x);
                  })
                : []
        };
    }
}

function translateUnaryOperation(scope, block) {
    Asserters.assertDataType(block.right, block.operator === 'not'
        ? ['bool']
        : ['int', 'float']);

    // assign a dataTpe to it so we can check it in other operations
    block.dataType = block.right.dataType;

    return {
        type: 'UnaryExpression',
        operator: OPERATORS[block.operator].operator,
        prefix: true,
        argument: translateBlock(scope, block.right)
    };
}

function translateBinaryOperation(scope, block) {
    // translate operands first so we can check dataTypes
    let left = translateBlock(scope, block.left);
    let right = translateBlock(scope, block.right);
    if (Helpers.shouldCheckForDivByZero(block)) {
        right = Helpers.insertCheckForDivByZero(right);
    }

    // assert operands types
    Asserters.assertBinaryOperands(block);

    // assign a dataType
    block.dataType = Helpers.getDataTypeForBinaryOperation(block);

    return {
        type: ['not', 'and', 'or'].indexOf(block.operator) >= 0
            ? 'LogicalExpression'
            : 'BinaryExpression',
        operator: OPERATORS[block.operator].operator,
        left: left,
        right: right
    };
}

function translateInternalId(scope, block) {
    return {
        type: 'MemberExpression',
        object: {
            type: 'Identifier',
            name: 'DJINN'
        },
        property: translateBlock(scope, block)
    };
}


module.exports = translateBlock;
