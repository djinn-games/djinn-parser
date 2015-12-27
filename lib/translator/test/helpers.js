'use strict';

var mocha = require('mocha');
var chai = require('chai');
global.expect = chai.expect;

var Translator = require('../');

describe('Translator helpers', function () {
    beforeEach(function () {
        this.translator = new Translator();
    });

    it('Checks for div by zero for divs and mods', function () {
        expect(this.translator._shouldCheckForDivByZero({operator: 'div'}))
            .to.be.true;
        expect(this.translator._shouldCheckForDivByZero({operator: 'mod'}))
            .to.be.true;
        ['add', 'sub', 'mul', 'minus', 'plus'].forEach(function (op) {
            expect(this.translator._shouldCheckForDivByZero({operator: op}))
                .to.be.false;
        }.bind(this));
    });

    describe('Binary operations data type', function () {
        let buildOp = function (op, leftDataType, rightDataType) {
            return {
                operator: op,
                left: { dataType: leftDataType },
                right: { dataType: rightDataType }
            };
        };

        it('Returns str for string concatenation', function () {
            // str + str
            expect(this.translator._getDataTypeForBinaryOperation(
                buildOp('add', 'str', 'str'))).to.equal('str');
            // bool + str
            expect(this.translator._getDataTypeForBinaryOperation(
                buildOp('add', 'str', 'bool'))).to.equal('str');
            // str + int
            expect(this.translator._getDataTypeForBinaryOperation(
                buildOp('add', 'int', 'str'))).to.equal('str');
            // float + int
            expect(this.translator._getDataTypeForBinaryOperation(
                buildOp('add', 'str', 'float'))).to.equal('str');
        });

        it('returns int for modulus', function () {
            expect(this.translator._getDataTypeForBinaryOperation(
                buildOp('mod', 'int', 'int'))).to.equal('int');
        });

        it('returns int for int add/sub/mul/div', function () {
            expect(this.translator._getDataTypeForBinaryOperation(
                buildOp('add', 'int', 'int'))).to.equal('int');
            expect(this.translator._getDataTypeForBinaryOperation(
                buildOp('sub', 'int', 'int'))).to.equal('int');
            expect(this.translator._getDataTypeForBinaryOperation(
                buildOp('mul', 'int', 'int'))).to.equal('int');
            expect(this.translator._getDataTypeForBinaryOperation(
                buildOp('div', 'int', 'int'))).to.equal('int');
        });

        it('returns float for float or int add/sub/mul/div', function () {
            expect(this.translator._getDataTypeForBinaryOperation(
                buildOp('add', 'int', 'float'))).to.equal('float');
            expect(this.translator._getDataTypeForBinaryOperation(
                buildOp('add', 'float', 'float'))).to.equal('float');
            expect(this.translator._getDataTypeForBinaryOperation(
                buildOp('sub', 'int', 'float'))).to.equal('float');
            expect(this.translator._getDataTypeForBinaryOperation(
                buildOp('sub', 'float', 'float'))).to.equal('float');
            expect(this.translator._getDataTypeForBinaryOperation(
                buildOp('mul', 'int', 'float'))).to.equal('float');
            expect(this.translator._getDataTypeForBinaryOperation(
                buildOp('mul', 'float', 'float'))).to.equal('float');
            expect(this.translator._getDataTypeForBinaryOperation(
                buildOp('div', 'int', 'float'))).to.equal('float');
            expect(this.translator._getDataTypeForBinaryOperation(
                buildOp('div', 'float', 'float'))).to.equal('float');
        });
    });
});
