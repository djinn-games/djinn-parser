'use strict';

var mocha = require('mocha');
var chai = require('chai');
global.expect = chai.expect;

var Translator = require('../');

describe('Translator asserts', function () {
    beforeEach(function () {
        this.translator = new Translator();
    });

    describe('Data type assert', function () {
        it('passes when the expected data type matches', function () {
            expect(function () {
                this.translator._assertDataType({dataType: 'float'}, ['float']);
            }.bind(this)).to.not.throw(Error);
            expect(function () {
                this.translator._assertDataType(
                    {dataType: 'float'}, ['int', 'float']);
            }.bind(this)).to.not.throw(Error);
        });

        it('throws error when the expected data type doesn\'t match',
        function () {
            expect(function () {
                this.translator._assertDataType({dataType: 'int'}, ['float']);
            }.bind(this)).to.throw(/data type/i);
        });
    });

    // TODO: mock FUNC_DEFS!!
    describe('Identifier existence assert', function () {
        it('throws an error when the id doesn\'t exist', function () {
            expect(function () {
                this.translator._assertIdentifierExists({}, {name: 'waka'});
            }.bind(this)).to.throw(/undefined/i);
        })

        it('passes when the id is a system function', function () {
            expect(function () {
                this.translator._assertIdentifierExists({}, {name: 'log'});
            }.bind(this)).to.not.throw(Error);
        });
    });

    // TODO: mock FUNC_DEFS!!!
    describe('Function arguments assert', function () {
        let buildCall = function (name, args) {
            return {
                callee: {
                    name: name
                },
                args: args.map(function (x) {
                    return {dataType: x};
                })
            };
        };

        it('throws an error when the number of args is wrong', function () {
            expect(function () {
                this.translator._assertFunctionArgs(buildCall('log', []));
            }.bind(this)).to.throw(/argument/i);

            expect(function () {
                this.translator._assertFunctionArgs(
                    buildCall('log', ['str', 'str']));
            }.bind(this)).to.throw(/argument/i);
        });

        it('throws an error when the type of args is wrong', function () {
            // TODO: set a spy here and check for calls to assertDataType
            expect(function () {
                this.translator._assertFunctionArgs(buildCall('log', ['int']));
            }.bind(this)).to.throw(/data type/i);
        });

        it('passes when the number and type of args is correct', function () {
            // TODO: set a spy here and check for calls to assertDataType
            expect(function () {
                this.translator._assertFunctionArgs(buildCall('log', ['str']));
            }.bind(this)).to.not.throw(Error);
        });
    });

    describe('Binary operands assert', function () {
        let buildOp = function (op, leftDataType, rightDataType) {
            return {
                operator: op,
                left: {dataType: leftDataType},
                right: {dataType: rightDataType},
            };
        };

        describe('Concatenation', function () {
            it('passes as long as there is a string', function () {
                // str + str
                expect(function () {
                    this.translator._assertBinaryOperands(
                        buildOp('add', 'str', 'str'));
                }.bind(this)).to.not.throw(Error);
                // str + int
                expect(function () {
                    this.translator._assertBinaryOperands(
                        buildOp('add', 'str', 'int'));
                }.bind(this)).to.not.throw(Error);
                // float + str
                expect(function () {
                    this.translator._assertBinaryOperands(
                        buildOp('add', 'float', 'str'));
                }.bind(this)).to.not.throw(Error);
                // str + bool
                expect(function () {
                    this.translator._assertBinaryOperands(
                        buildOp('add', 'str', 'bool'));
                }.bind(this)).to.not.throw(Error);
            });
        });

        describe('Add/Sub/Mul/Div', function () {
            // TODO: setup spies and look for calls for assertDataType instead
            it('passes when given numbers', function () {
                ['add', 'sub', 'mul', 'div'].forEach(function (op) {
                    // int + float
                    expect(function () {
                        this.translator._assertBinaryOperands(
                            buildOp(op, 'int', 'float'));
                    }.bind(this)).to.not.throw(Error);
                    // int + int
                    expect(function () {
                        this.translator._assertBinaryOperands(
                            buildOp(op, 'int', 'int'));
                    }.bind(this)).to.not.throw(Error);
                    // float + float
                    expect(function () {
                        this.translator._assertBinaryOperands(
                            buildOp(op, 'int', 'int'));
                    }.bind(this)).to.not.throw(Error);
                }.bind(this));
            });

            it('throws error when not a concat and not given numbers',
            function () {
                ['sub', 'mul', 'div'].forEach(function (op) {
                    // str + number
                    expect(function () {
                        this.translator._assertBinaryOperands(
                            buildOp(op, 'str', 'int'));
                    }.bind(this)).to.throw(/data type/i);
                    // bool + number
                    expect(function () {
                        this.translator._assertBinaryOperands(
                            buildOp(op, 'bool', 'float'));
                    }.bind(this)).to.throw(/data type/i);
                    // str + bool
                    expect(function () {
                        this.translator._assertBinaryOperands(
                            buildOp(op, 'str', 'bool'));
                    }.bind(this)).to.throw(/data type/i);
                }.bind(this));
            });
        });

        describe('Mod', function () {
            it('throws error when not given ints', function () {
                expect(function () {
                    this.translator._assertBinaryOperands(
                        buildOp('mod', 'str', 'bool'));
                }.bind(this)).to.throw(/data type/i);
            });

            // specific test for floats --somehow redundant, but worth it
            it('throws error when given float/s', function () {
                // int + float
                expect(function () {
                    this.translator._assertBinaryOperands(
                        buildOp('mod', 'int', 'float'));
                }.bind(this)).to.throw(/data type/i);
                // float + int
                expect(function () {
                    this.translator._assertBinaryOperands(
                        buildOp('mod', 'float', 'int'));
                }.bind(this)).to.throw(/data type/i);
                // float + float
                expect(function () {
                    this.translator._assertBinaryOperands(
                        buildOp('mod', 'float', 'float'));
                }.bind(this)).to.throw(/data type/i);
            });

            it('passes when given ints', function () {
                // int + int
                expect(function () {
                    this.translator._assertBinaryOperands(
                        buildOp('mod', 'int', 'int'));
                }.bind(this)).to.not.throw(Error);
            });
        });
    });
});
