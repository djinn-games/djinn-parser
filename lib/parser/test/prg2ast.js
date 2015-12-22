'use strict';

var Mocha = require('mocha');
var path = require('path');
var fs = require('fs');
var assert = require('assert');

var Parser = require('../');

const FIXTURES_PATH = path.join(__dirname, 'fixtures');

// var mocha = new Mocha();
// var suite = Mocha.Suite.create(mocha.suite, 'AST');

var parser = new Parser();

describe('AST parsing', function () {
    // get all .prg files in fixtures and create text comparing
    // them to their matchig .ast
    fs.readdirSync(FIXTURES_PATH)
    .filter(function (filename) {
        return path.extname(filename) === '.prg';
    })
    .forEach(function (prgFile) {
        // name of the matching .ast file
        let astFile = path.join(path.dirname(prgFile),
                                `${path.basename(prgFile, '.prg')}.ast`);
        // name for the test case
        let title = `${path.basename(prgFile)} should generate ` +
                    `${path.basename(astFile)}`;
        // create test dynamically
        it(title, function () {
            var source = fs.readFileSync(
                path.join(FIXTURES_PATH, prgFile), 'utf8');
            var targetAst = fs.readFileSync(
                path.join(FIXTURES_PATH, astFile), 'utf8');
            var parsedAst = parser.parse(source);
            assert.equal(parsedAst, targetAst);
        });
    });
});
