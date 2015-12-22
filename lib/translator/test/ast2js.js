'use strict';

var Mocha = require('mocha');
var path = require('path');
var fs = require('fs');
var assert = require('assert');

var Translator = require('../');

const FIXTURES_PATH = path.join(__dirname, 'fixtures');

describe('Translator', function () {
    beforeEach(function () {
        this.translator = new Translator();
    });

    // get all .prg files in fixtures and create text comparing
    // them to their matchig .ast
    fs.readdirSync(FIXTURES_PATH)
    .filter(function (filename) {
        return path.extname(filename) === '.ast';
    })
    .forEach(function (astFile) {
        // name of the matching js file
        let jsFile = path.join(path.dirname(astFile),
                                `${path.basename(astFile, '.ast')}.js.out`);
        // name for the test case
        let title = `${path.basename(astFile)} should generate ` +
                    `${path.basename(jsFile)}`;
        // create test dynamically
        it(title, function () {
            let ast = fs.readFileSync(
                path.join(FIXTURES_PATH, astFile), 'utf8');
            let targetOutput = fs.readFileSync(
                path.join(FIXTURES_PATH, jsFile), 'utf8');
            let output = this.translator.translate(ast);
            assert.equal(output + '\n', targetOutput);
        });
    });
});
