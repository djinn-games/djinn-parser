function Scope (parent) {
    this.parent = parent || null;
    this.vars = {};
    this.prefix = `_${parent ? parent.prefix : ''}`;
}


Scope.prototype.addVar = function (name, dataType) {
    return this._addIdentifier(name, dataType, 'var');
};


Scope.prototype.addConst = function (name, dataType) {
    return this._addIdentifier(name, dataType, 'const');
};


Scope.prototype.getVarOrConst = function (name) {
    name = name.toLowerCase();

    if (name in this.vars) {
        return this.vars[name];
    }
    else if (this.parent) {
        return this.parent.getVarOrConst(name);
    }
    else {
        return null;
    }
};


Scope.prototype.addSubScope = function () {
   return new Scope(this);
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
