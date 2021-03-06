const { isEqual, pick } = require("lodash/fp");

function eachMongooseOriginalsPath(item, fn, name) {
    if (item && item.schema) {
        if (item.schema.mongooseOriginals) {
            fn(item);
        }
        item.schema.eachPath((name, type) => {
            if (item[name] instanceof Array) {
                item[name].forEach(item => eachMongooseOriginalsPath(item, fn, name));
            } else {
                eachMongooseOriginalsPath(item[name], fn, name);
            }
        });
    }
}

function mongooseOriginals(schema, userOptions) {
    var options = Object.assign({ methods: true }, userOptions);

    if (!options.fields) {
        throw new Error("No fields specified for mongoose originals on schema");
    }

    schema.method("isChanged", function isChanged() {
        return (
            !this._original ||
            !isEqual(
                this._original,
                pick(options.fields, this.toObject({ depopulate: true, getters: false, transform: false }))
            )
        );
    });

    schema.method("setSnapshotOriginal", function setSnapshotOriginal() {
        eachMongooseOriginalsPath(this, item => {
            item.snapshotOriginal = item._original;
        });
        return this;
    });

    schema.method("clearSnapshotOriginal", function clearSnapshotOriginal() {
        eachMongooseOriginalsPath(this, item => {
            delete item.snapshotOriginal;
        });
        return this;
    });

    function saveOriginalNamed() {
        this._original = {};
        const newValues = this.toObject({ depopulate: true, getters: false, transform: false });

        options.fields.forEach(name => {
            this._original[name] = newValues[name];
        });
    }

    schema.method("initOriginals", function initOriginals() {
        if (this._original === undefined) {
            saveOriginalNamed.bind(this)();
        }
    });

    schema.mongooseOriginals = true;
    schema.post("init", saveOriginalNamed);
    schema.post("save", saveOriginalNamed);

    if (options.methods) {
        schema.methods.collectionAdded = function collectionAdded(name) {
            var _this = this;

            return this[name].filter(function(item) {
                return !_this._original[name].find(function(_originalItem) {
                    return item._id.equals(_originalItem._id);
                });
            });
        };

        schema.methods.collectionRemoved = function collectionRemoved(name) {
            var _this = this;

            return this._original[name].filter(function(_originalItem) {
                return !_this[name].find(function(item) {
                    return item._id.equals(_originalItem._id);
                });
            });
        };

        schema.methods.collectionUpdated = function collectionUpdated(name) {
            var _this = this;

            return this[name].filter(function(item) {
                return _this._original[name].find(function(_originalItem) {
                    return item._id.equals(_originalItem._id);
                });
            });
        };
    }
}

module.exports = mongooseOriginals;
