const INLOOP = 'inLoop';

function Scope (parent) {
    this.parent = parent || null;
    this.vars = {};
    this.prefix = `_${parent ? parent.prefix : ''}`;
    this.flags = {};
}

Scope.prototype.addVar = function (name, dataType) {
    return this._addIdentifier(name, dataType, 'var');
};


Scope.prototype.addConst = function (name, dataType) {
    return this._addIdentifier(name, dataType, 'const');
};

Scope.prototype.getVarOrConst = function (name) {
    return this._getItem('vars', name.toLowerCase());
};

Scope.prototype.flagInLoop = function () {
    this.flags[INLOOP] = true;
};

Scope.prototype.isInLoop = function () {
    return !!this._getItem('flags', INLOOP);
};

Scope.prototype.push = function () {
   return new Scope(this);
};

Scope.prototype.pop = function () {
    if (this.parent === null) {
        throw new Error('Can\'t pop the root scope');
    }
    return this.parent;
};


Scope.prototype._getItem = function (kind, name) {
    let container = this[kind];

    if (name in container) {
        return container[name];
    }
    else if (this.parent) {
        return this.parent._getItem(kind, name);
    }
    else {
        return null;
    }
};

Scope.prototype._addIdentifier = function (name, dataType, kind) {
    name = name.toLowerCase();

    if (!(name in this.vars)) {
        this.vars[name] = {
            kind: kind,
            dataType: dataType,
            name: `${this.prefix}${name}`
        };
        return true;
    }
    else {
        return false;
    }
};


module.exports = Scope;
