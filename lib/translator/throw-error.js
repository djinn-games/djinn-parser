module.exports = function (line, message) {
    throw new Error(`Line ${line} – ${message}`);
};
