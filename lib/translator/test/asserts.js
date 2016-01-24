'use strict';

var rewire = require('rewire');

var mocha = require('mocha');
var chai = require('chai');
var sinon = require('sinon');
global.expect = chai.expect;

var Asserters = rewire('../asserters.js');
var Translator = rewire('../browser.js');
var Scope = rewire('../scope.js');

//
// tests
//
// NOTE: wrapping a unit test in sinon.test will create a sinon sandbox
//       that will automatically restore mocks, spies, etc.

describe('Translator asserts', function () {
    beforeEach(function () {
        this.translator = new Translator();
    });

    describe('Data type assert', function () {
        it('passes when the expected data type matches', function () {
            expect(function () {
                Asserters.assertDataType({dataType: 'float'}, ['float']);
            }.bind(this)).to.not.throw(Error);
            expect(function () {
                Asserters.assertDataType(
                    {dataType: 'float'}, ['int', 'float']);
            }.bind(this)).to.not.throw(Error);
        });

        it('throws error when the expected data type doesn\'t match',
        function () {
            expect(function () {
                Asserters.assertDataType({dataType: 'int'}, ['float']);
            }.bind(this)).to.throw(/data type/i);
        });
    });

    describe('Identifier existence assert', function () {
        beforeEach(function () {
            this.revert = Asserters.__set__('FUNC_DEFS', {
                vader: { args: [['str']] }
            });
            this.scope = new Scope();
        });

        afterEach(function () { this.revert(); });

        it('throws an error when the id doesn\'t exist', sinon.test(function () {
            this.stub(this.scope, 'getVarOrConst').returns(null);
            expect(function () {
                Asserters.assertIdentifierExists(
                    this.scope, {name: 'waka'}, true);
            }.bind(this)).to.throw(/undefined/i);
        }));

        it('passes when the id is a system function', function () {
            expect(function () {
                Asserters.assertIdentifierExists(
                    this.scope, {name: 'vader'}, true);
            }.bind(this)).to.not.throw(Error);
        });

        it('passes when the id is a existing variable', sinon.test(function () {
            let stub = this.stub(this.scope, 'getVarOrConst').returns(null);
            stub.withArgs('waka').returns({});

            expect(function () {
                Asserters.assertIdentifierExists(
                    this.scope, {name: 'waka'});
            }.bind(this)).to.not.throw(Error);
        }));
    });

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

        beforeEach(function () {
            this.revert = Asserters.__set__('FUNC_DEFS', {
                vader: { args: [['str']] }
            });
        });

        afterEach(function () { this.revert(); });

        it('throws an error when the number of args is wrong', function () {
            expect(function () {
                Asserters.assertFunctionArgs(buildCall('vader', []));
            }.bind(this)).to.throw(/argument/i);

            expect(function () {
                Asserters.assertFunctionArgs(
                    buildCall('vader', ['str', 'str']));
            }.bind(this)).to.throw(/argument/i);
        });

        it('checks for the type of args', sinon.test(function () {
            this.stub(Asserters, 'assertDataType');

            Asserters.assertFunctionArgs(buildCall('vader', ['int']));

            expect(Asserters.assertDataType.calledOnce).to.be.true;
            expect(Asserters.assertDataType.calledWith(
                sinon.match.any, ['str'])).to.be.true;
        }));

        it('passes when the number and type of args is correct', function () {
            expect(function () {
                Asserters.assertFunctionArgs(buildCall('vader', ['str']));
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
                    Asserters.assertBinaryOperands(
                        buildOp('add', 'str', 'str'));
                }.bind(this)).to.not.throw(Error);
                // str + int
                expect(function () {
                    Asserters.assertBinaryOperands(
                        buildOp('add', 'str', 'int'));
                }.bind(this)).to.not.throw(Error);
                // float + str
                expect(function () {
                    Asserters.assertBinaryOperands(
                        buildOp('add', 'float', 'str'));
                }.bind(this)).to.not.throw(Error);
                // str + bool
                expect(function () {
                    Asserters.assertBinaryOperands(
                        buildOp('add', 'str', 'bool'));
                }.bind(this)).to.not.throw(Error);
            });
        });

        describe('Add/Sub/Mul/Div', function () {
            it('passes when given numbers', function () {
                ['add', 'sub', 'mul', 'div'].forEach(function (op) {
                    // int + float
                    expect(function () {
                        Asserters.assertBinaryOperands(
                            buildOp(op, 'int', 'float'));
                    }.bind(this)).to.not.throw(Error);
                    // int + int
                    expect(function () {
                        Asserters.assertBinaryOperands(
                            buildOp(op, 'int', 'int'));
                    }.bind(this)).to.not.throw(Error);
                    // float + float
                    expect(function () {
                        Asserters.assertBinaryOperands(
                            buildOp(op, 'int', 'int'));
                    }.bind(this)).to.not.throw(Error);
                }.bind(this));
            });

            it('throws error when not a concat and not given numbers',
            function () {
                ['sub', 'mul', 'div'].forEach(function (op) {
                    // str + number
                    expect(function () {
                        Asserters.assertBinaryOperands(
                            buildOp(op, 'str', 'int'));
                    }.bind(this)).to.throw(/data type/i);
                    // bool + number
                    expect(function () {
                        Asserters.assertBinaryOperands(
                            buildOp(op, 'bool', 'float'));
                    }.bind(this)).to.throw(/data type/i);
                    // str + bool
                    expect(function () {
                        Asserters.assertBinaryOperands(
                            buildOp(op, 'str', 'bool'));
                    }.bind(this)).to.throw(/data type/i);
                }.bind(this));
            });
        });

        describe('Mod', function () {
            it('throws error when not given ints', function () {
                expect(function () {
                    Asserters.assertBinaryOperands(
                        buildOp('mod', 'str', 'bool'));
                }.bind(this)).to.throw(/data type/i);
            });

            // specific test for floats --somehow redundant, but worth it
            it('throws error when given float/s', function () {
                // int + float
                expect(function () {
                    Asserters.assertBinaryOperands(
                        buildOp('mod', 'int', 'float'));
                }.bind(this)).to.throw(/data type/i);
                // float + int
                expect(function () {
                    Asserters.assertBinaryOperands(
                        buildOp('mod', 'float', 'int'));
                }.bind(this)).to.throw(/data type/i);
                // float + float
                expect(function () {
                    Asserters.assertBinaryOperands(
                        buildOp('mod', 'float', 'float'));
                }.bind(this)).to.throw(/data type/i);
            });

            it('passes when given ints', function () {
                // int + int
                expect(function () {
                    Asserters.assertBinaryOperands(
                        buildOp('mod', 'int', 'int'));
                }.bind(this)).to.not.throw(Error);
            });
        });

        describe('Comparators', function () {
            let ops = ['lt', 'gt', 'lte', 'gte', 'eq', 'neq'];

            it('pass when given numbers', function () {
                ops.forEach(function (op) {
                   expect(function () {
                       Asserters.assertBinaryOperands(
                           buildOp(op, 'int', 'int'));
                   }.bind(this)).to.not.throw(Error);
                   expect(function () {
                       Asserters.assertBinaryOperands(
                           buildOp(op, 'float', 'float'));
                   }.bind(this)).to.not.throw(Error);
                   expect(function () {
                       Asserters.assertBinaryOperands(
                           buildOp(op, 'int', 'float'));
                   }.bind(this)).to.not.throw(Error);
                }.bind(this));
            });

            it('throw error when no given numbers', function () {
                ops.forEach(function (op) {
                    expect(function () {
                        Asserters.assertBinaryOperands(
                            buildOp(op, 'int', 'bool'));
                    }.bind(this)).to.throw(/data type/i);

                    expect(function () {
                        Asserters.assertBinaryOperands(
                            buildOp(op, 'str', 'float'));
                    }.bind(this)).to.throw(/data type/i);
                }.bind(this));
            });
        });
    });
});
