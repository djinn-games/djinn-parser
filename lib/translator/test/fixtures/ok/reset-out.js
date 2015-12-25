// this script will re-run the translator on *.ast and generate
// new .js.out fixtures. The .ast files will remain unchanged

'use strict';

var fs = require('fs');
var path = require('path');

var Translator = require('../../../');

const AST_PATH = __dirname;

let translator = new Translator();

fs.readdirSync(AST_PATH)
.filter(function (filename) {
    return path.extname(filename) === '.ast';
})
.forEach(function (astFile) {
    let outFile = `${path.basename(astFile, '.ast')}.ast.out`;

    let ast = fs.readFileSync(path.join(AST_PATH, astFile), 'utf8');
    let out = translator.toEstree(JSON.parse(ast));
    out = JSON.stringify(out, null, 2);

    fs.writeFileSync(path.join(AST_PATH, outFile), out + '\n');
    console.log('Generated', outFile);
});
