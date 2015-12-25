'use strict';

var path = require('path');
var grammar = require('./grammar.js');

function Parser() {}

Parser.prototype.parse = function (src) {
    return grammar.parse(src);
};

module.exports = Parser;
