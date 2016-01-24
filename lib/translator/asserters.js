'use strict';

var throwError = require('./throw-error.js');
var FUNC_DEFS = require('./defs-functions.js');

var Asserters = {};

Asserters.assertDataType = function (block, expected) {
    if (expected.indexOf(block.dataType) === -1) {
        throwError(block.line,
            `Expecting data type/s: ${expected.join(",")}` +
            ` but got: ${block.dataType}`);
    }
};

Asserters.assertIdentifierExists = function (scope, identifier, isFunction) {
    let found = (isFunction && identifier.name in FUNC_DEFS) ||
                (scope.getVarOrConst(identifier.name));
    if (!found) {
        throwError(identifier.line, `Undefined identifier: ${identifier.name}`);
    }
};

Asserters.assertFunctionArgs = function (block) {
    let def = FUNC_DEFS[block.callee.name];

    if (def.args.length !== block.args.length) {
        throwError(block.line,
            `Expecting ${def.args.length} argument/s ` +
            `for function: ${block.callee.name}`);
    }

    block.args.forEach(function (arg, index) {
        Asserters.assertDataType(arg, def.args[index]);
    }.bind(this));
};

Asserters.assertBinaryOperands = function (block) {
    // NOTE: different operations will require different types
    //
    if (block.operator === 'add' && (block.left.dataType === 'str' ||
                                     block.right.dataType === 'str')) {
        // do nothing since it's a string concat
    }
    else if (['and', 'or'].indexOf(block.operator) >= 0) {
        this.assertDataType(block.left, ['bool']);
        this.assertDataType(block.right, ['bool']);
    }
    else if (block.operator === 'mod') {
        this.assertDataType(block.left, ['int']);
        this.assertDataType(block.right, ['int']);
    }
    else { // other binary arith operations require numbers
        this.assertDataType(block.left, ['int', 'float']);
        this.assertDataType(block.right, ['int', 'float']);
    }
};

module.exports = Asserters;
