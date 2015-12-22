'use strict';

module.exports = {
    pipe: function (callback)  {
        let source = '';
        process.stdin.resume();
        process.stdin.setEncoding('utf-8');
        process.stdin.on('data', function (data) { source += data; })
        process.stdin.on('end', function () {
            callback(source);
        });
    }
};
