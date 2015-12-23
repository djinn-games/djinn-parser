// this script will re-run the parser on *.prg and generate
// new .ast fixtures

'use strict';

var fs = require('fs');
var path = require('path');

var Parser = require('../../');

const PRG_PATH = __dirname;

let parser = new Parser();

fs.readdirSync(PRG_PATH)
.filter(function (filename) {
    return path.extname(filename) === '.prg'
})
.forEach(function (prgFile) {
    let astFile = `${path.basename(prgFile, '.prg')}.ast`;

    let source = fs.readFileSync(path.join(PRG_PATH, prgFile), 'utf8');
    let ast = parser.parse(source);

    fs.writeFileSync(
        path.join(PRG_PATH, astFile), JSON.stringify(ast, null, 2));
    console.log('Generated', astFile);
});
