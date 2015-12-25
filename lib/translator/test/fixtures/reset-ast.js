// this script will re-run the parser on
// error/raw/*.prg and ok/raw/*.prg to generate new .ast fixtures.
// .out files will remain unchanged

'use strict';

var fs = require('fs');
var path = require('path');

var Parser = require('../../../parser');

const OK_RAW_PATH = path.join(__dirname, 'ok', 'raw');
const ERROR_RAW_PATH = path.join(__dirname, 'error', 'raw');

let parser = new Parser();

function generateAstFromPrg(rawPath) {
    fs.readdirSync(rawPath)
    .filter(function (filename) {
        return path.extname(filename) === '.prg';
    })
    .forEach(function (prgFile) {
        let astFile = `${path.basename(prgFile, '.prg')}.ast`;

        let source = fs.readFileSync(path.join(rawPath, prgFile), 'utf8');
        let ast = parser.parse(source);

        fs.writeFileSync(
            path.join(rawPath, '..', astFile), JSON.stringify(ast, null, 2));
        console.log('Generated', astFile);
    });
}

generateAstFromPrg(OK_RAW_PATH);
generateAstFromPrg(ERROR_RAW_PATH);
