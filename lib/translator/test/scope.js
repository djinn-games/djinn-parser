'use strict';

var mocha = require('mocha');
var chai = require('chai');
global.expect = chai.expect;

var Scope = require('../scope.js');

describe('Scope', function () {
    beforeEach(function () {
        this.scope = new Scope();
    });

    it('is created with a parent and empty vars', function () {
        let s1 = new Scope();
        expect(s1.parent).to.be.null;
        expect(s1.vars).to.be.empty;
        let s2 = new Scope(s1);
        expect(s2.parent).to.equal(s1);
    });

    describe('adding variables', function () {
        it('adds a var and returns true if it does not exist yet', function () {
            expect(this.scope.addVar('x', 'int')).to.be.true;
        });
        it('doesn\'t add a var and returns false if it exists', function () {
            this.scope.addVar('x', 'int');
            expect(this.scope.addVar('x', 'int')).to.be.false;
            expect(this.scope.addVar('x', 'str')).to.be.false;
        });
    });

    describe('getting variables', function () {
        it('gets a var if it is in the current scope', function () {
            this.scope.addVar('x', 'int');
            expect(this.scope.getVar('x')).to.deep.equal({
                name: '_x',
                dataType: 'int',
                type: 'var'
            });
        });

        it('returns null if not in scope and this is a root', function () {
            this.scope.addVar('x', 'int');
            expect(this.scope.getVar('y')).to.be.null;
        });

        it('looks in its parent chain for the variable', function () {
            let root = new Scope();
            root.addVar('x', 'int');
            let father = new Scope(root);
            let scope = new Scope(father);
            scope.addVar('y', 'int');

            expect(scope.getVar('x')).to.deep.equal({
                name: '_x',
                dataType: 'int',
                type: 'var'
            });
        });
    });

    it('creates subscopes', function () {
        let subscope = this.scope.addSubScope();
        expect(subscope).to.be.an.instanceof(Scope);
        expect(subscope.parent).to.equal(this.scope);
    });
});