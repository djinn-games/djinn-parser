'use strict';

var mocha = require('mocha');
var chai = require('chai');
global.expect = chai.expect;

var Helpers = require('../helpers.js');

describe('Translator helpers', function () {
    it('check for div by zero for divs and mods', function () {
        expect(Helpers.shouldCheckForDivByZero({operator: 'div'}))
            .to.be.true;
        expect(Helpers.shouldCheckForDivByZero({operator: 'mod'}))
            .to.be.true;
        ['add', 'sub', 'mul', 'minus', 'plus'].forEach(function (op) {
            expect(Helpers.shouldCheckForDivByZero({operator: op}))
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

        it('returns str for string concatenation', function () {
            // str + str
            expect(Helpers.getDataTypeForBinaryOperation(
                buildOp('add', 'str', 'str'))).to.equal('str');
            // bool + str
            expect(Helpers.getDataTypeForBinaryOperation(
                buildOp('add', 'str', 'bool'))).to.equal('str');
            // str + int
            expect(Helpers.getDataTypeForBinaryOperation(
                buildOp('add', 'int', 'str'))).to.equal('str');
            // float + int
            expect(Helpers.getDataTypeForBinaryOperation(
                buildOp('add', 'str', 'float'))).to.equal('str');
        });

        it('returns int for modulus', function () {
            expect(Helpers.getDataTypeForBinaryOperation(
                buildOp('mod', 'int', 'int'))).to.equal('int');
        });

        it('returns int for int add/sub/mul/div', function () {
            expect(Helpers.getDataTypeForBinaryOperation(
                buildOp('add', 'int', 'int'))).to.equal('int');
            expect(Helpers.getDataTypeForBinaryOperation(
                buildOp('sub', 'int', 'int'))).to.equal('int');
            expect(Helpers.getDataTypeForBinaryOperation(
                buildOp('mul', 'int', 'int'))).to.equal('int');
            expect(Helpers.getDataTypeForBinaryOperation(
                buildOp('div', 'int', 'int'))).to.equal('int');
        });

        it('returns float for float or int add/sub/mul/div', function () {
            expect(Helpers.getDataTypeForBinaryOperation(
                buildOp('add', 'int', 'float'))).to.equal('float');
            expect(Helpers.getDataTypeForBinaryOperation(
                buildOp('add', 'float', 'float'))).to.equal('float');
            expect(Helpers.getDataTypeForBinaryOperation(
                buildOp('sub', 'int', 'float'))).to.equal('float');
            expect(Helpers.getDataTypeForBinaryOperation(
                buildOp('sub', 'float', 'float'))).to.equal('float');
            expect(Helpers.getDataTypeForBinaryOperation(
                buildOp('mul', 'int', 'float'))).to.equal('float');
            expect(Helpers.getDataTypeForBinaryOperation(
                buildOp('mul', 'float', 'float'))).to.equal('float');
            expect(Helpers.getDataTypeForBinaryOperation(
                buildOp('div', 'int', 'float'))).to.equal('float');
            expect(Helpers.getDataTypeForBinaryOperation(
                buildOp('div', 'float', 'float'))).to.equal('float');
        });

        it('returns bool for comparators', function () {
            expect(Helpers.getDataTypeForBinaryOperation(
                buildOp('lt', 'float', 'int'))).to.equal('bool');
            expect(Helpers.getDataTypeForBinaryOperation(
                buildOp('lte', 'int', 'float'))).to.equal('bool');
            expect(Helpers.getDataTypeForBinaryOperation(
                buildOp('gt', 'int', 'int'))).to.equal('bool');
            expect(Helpers.getDataTypeForBinaryOperation(
                buildOp('gte', 'float', 'float'))).to.equal('bool');
            expect(Helpers.getDataTypeForBinaryOperation(
                buildOp('eq', 'float', 'int'))).to.equal('bool');
            expect(Helpers.getDataTypeForBinaryOperation(
                buildOp('neq', 'int', 'int'))).to.equal('bool');
        });

        it('returns bool for and/or', function () {
            expect(Helpers.getDataTypeForBinaryOperation(
                buildOp('and', 'bool', 'bool'))).to.equal('bool');
            expect(Helpers.getDataTypeForBinaryOperation(
                buildOp('or', 'bool', 'bool'))).to.equal('bool');
        });
    });

    it('transform an ID to a literal', function () {
        let id = { name: "waka", type: "Identifier" };
        expect(Helpers.idToLiteral(id)).to.deep.equal({
            type: 'Literal',
            value: 'waka',
            raw: '\"waka\"'
        });
    });

    it('gets a default literal for a data type', function () {
        expect(Helpers.defaultLiteralForType('int')).to.deep.equal({
            type: 'Literal',
            value: 0,
            raw: '0'
        });
        expect(Helpers.defaultLiteralForType('float')).to.deep.equal({
            type: 'Literal',
            value: 0,
            raw: '0'
        });
        expect(Helpers.defaultLiteralForType('str')).to.deep.equal({
            type: 'Literal',
            value: '',
            raw: '\"\"'
        });
        expect(Helpers.defaultLiteralForType('bool')).to.deep.equal({
            type: 'Literal',
            value: false,
            raw: 'false'
        });
    });
});
