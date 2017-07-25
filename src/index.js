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
            !this.original ||
            !isEqual(
                this.original,
                pick(options.fields, this.toObject({ getters: false, transform: false }))
            )
        );
    });

    schema.method("setSnapshotOriginal", function setSnapshotOriginal() {
        eachMongooseOriginalsPath(this, item => {
            item.snapshotOriginal = item.original;
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
        this.original = {};
        const newValues = this.toObject({ getters: false, transform: false });

        options.fields.forEach(name => {
            this.original[name] = newValues[name];
        });
    }

    schema.method("initOriginals", function initOriginals() {
        if (this.original === undefined) {
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
                return !_this.original[name].find(function(originalItem) {
                    return item._id.equals(originalItem._id);
                });
            });
        };

        schema.methods.collectionRemoved = function collectionRemoved(name) {
            var _this = this;

            return this.original[name].filter(function(originalItem) {
                return !_this[name].find(function(item) {
                    return item._id.equals(originalItem._id);
                });
            });
        };

        schema.methods.collectionUpdated = function collectionUpdated(name) {
            var _this = this;

            return this[name].filter(function(item) {
                return _this.original[name].find(function(originalItem) {
                    return item._id.equals(originalItem._id);
                });
            });
        };
    }
}

module.exports = mongooseOriginals;
