'use strict';

var Mocha = require('mocha');
var path = require('path');
var fs = require('fs');
var chai = require('chai');
global.expect = chai.expect;

var Translator = require('../');

const FIXTURES_PATH = path.join(__dirname, 'fixtures', 'error');


describe('Translator', function () {
    beforeEach(function () {
        this.translator = new Translator();
    });

    // get all .ast files in fixtures and create test comparing
    // them to their matchig .out files
    //
    // out files will contain a list of regexes that are to
    // be checked against the error thrown
    fs.readdirSync(FIXTURES_PATH)
    .filter(function (filename) {
        return path.extname(filename) === '.ast';
    })
    .forEach(function (astFile) {
        // name of the matching js file
        let outFile = path.join(path.dirname(astFile),
                                `${path.basename(astFile, '.ast')}.out`);
        // name for the test case
        let title = `${path.basename(astFile)} should throw errors in ` +
                    `${path.basename(outFile)}`;
        // create test dynamically
        it(title, function () {
            let ast = JSON.parse(fs.readFileSync(
                path.join(FIXTURES_PATH, astFile), 'utf8'));

            let targetRegex = fs.readFileSync(
                path.join(FIXTURES_PATH, outFile), 'utf8').trim();
            expect(function () {
                this.translator.toEstree(ast);
            }.bind(this)).to.throw(new RegExp(targetRegex, 'i'));
        });
    });
});
