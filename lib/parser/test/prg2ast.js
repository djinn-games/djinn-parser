'use strict';

var Mocha = require('mocha');
var path = require('path');
var fs = require('fs');
var assert = require('assert');

var Parser = require('../');

const FIXTURES_PATH = path.join(__dirname, 'fixtures');

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
            let source = fs.readFileSync(
                path.join(FIXTURES_PATH, prgFile), 'utf8');
            let targetAst = JSON.parse(fs.readFileSync(
                path.join(FIXTURES_PATH, astFile), 'utf8'));
            let parsedAst = parser.parse(source);
            assert.deepEqual(parsedAst, targetAst);
        });
    });
});
