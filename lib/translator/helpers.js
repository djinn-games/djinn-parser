'use strict';

var Helpers = {};

Helpers.getDataTypeForBinaryOperation = function (block) {
    let res = 'int';

    // modulus -> int
    if (block.operator === 'mod') {
        res = 'int';
    // string concatenation -> str
    }
    else if (block.operator === 'add' &&
               (block.left.dataType === 'str') ||
               (block.right.dataType === 'str')) {
        res = 'str';
    }
    // comparators
    else if (['lt', 'gt', 'lte', 'gte', 'eq', 'neq']
        .indexOf(block.operator) >= 0 )
    {
        res = 'bool';
    }
    else if (['and', 'or'].indexOf(block.operator) >= 0) {
        res = 'bool';
    }
    // other arith -> float if at least one of the operands is float
    else if (block.left.dataType === 'float' ||
               block.right.dataType === 'float') {
        res = 'float';
    }
    // other arith -> int if both operands are int

    return res;
};

Helpers.shouldCheckForDivByZero = function (block) {
    return block.operator === 'div' || block.operator === 'mod';
};

Helpers.insertCheckForDivByZero = function (translatedBlock) {
    return Helpers.translateInternalCall(
        '__checkDivByZero', translatedBlock);
};

// converts an identifier block into a literal one (ES ast)
Helpers.idToLiteral = function (block) {
    return {
        type: 'Literal',
        value: block.name,
        raw: JSON.stringify(block.name)
    };
};

// gets a default value literal for a given dataType (ES ast)
Helpers.defaultLiteralForType = function (dataType) {
    let res = { type: 'Literal' };

    switch (dataType) {
    case 'str':
        res.value = "";
        break;
    case 'float':
    case 'int':
        res.value = 0.0;
        break;
    case 'bool':
        res.value = false;
        break;
    default:
        throw new Error(`Unknown data type: ${dataType}`);
    }

    res.raw = JSON.stringify(res.value);

    return res;
};

// builds an assigment expression (ES ast)
Helpers.buildAssignment = function (name, right, operator) {
    return {
        type: 'AssignmentExpression',
        operator: operator,
        left: {
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
            property: this.idToLiteral(name),
            computed: true
        },
        right: right
    };
};

Helpers.translateInternalCall = function (funcName /* arg1,arg2,... */) {
    let args = Array.prototype.slice.call(arguments, 1, arguments.length);

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


module.exports = Helpers;
