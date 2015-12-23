// this script will re-run the parser on raw/*.prg and generate
// new .ast fixtures. The .js.out files will remain unchanged

'use strict';

var fs = require('fs');
var path = require('path');

var Parser = require('../../../../parser');

const RAW_PATH = __dirname;

let parser = new Parser();

fs.readdirSync(RAW_PATH)
.filter(function (filename) {
    return path.extname(filename) === '.prg';
})
.forEach(function (prgFile) {
    let astFile = `${path.basename(prgFile, '.prg')}.ast`;

    let source = fs.readFileSync(path.join(RAW_PATH, prgFile), 'utf8');
    let ast = parser.parse(source);

    fs.writeFileSync(
        path.join(RAW_PATH, '..', astFile), JSON.stringify(ast, null, 2));
    console.log('Generated', astFile);
});
