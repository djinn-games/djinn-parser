function Scope (parent) {
    this.parent = parent || null;
    this.vars = {};
    this.prefix = `_${parent ? parent.prefix : ''}`;
}

Scope.prototype.addVar = function (name, dataType) {
    name = name.toLowerCase();

    if (!(name in this.vars)) {
        this.vars[name] = {
            type: 'var',
            dataType: dataType,
            name: `${this.prefix}${name}`
        };
        return true;
    }
    else {
        return false;
    }
};

Scope.prototype.getVar = function (name) {
    name = name.toLowerCase();

    if (name in this.vars) {
        return this.vars[name];
    }
    else if (this.parent) {
        return this.parent.getVar(name);
    }
    else {
        return null;
    }
};

Scope.prototype.addSubScope = function () {
   return new Scope(this);
};

module.exports = Scope;
