const Schema = require("mongoose").Schema;
const originals = require("../../src");

const DocumentArrayNestedSchema = new Schema(
    {
        type: String,
    },
    { _id: false }
);

DocumentArrayNestedSchema.plugin(originals, { fields: ["type"] });

module.exports = DocumentArrayNestedSchema;
