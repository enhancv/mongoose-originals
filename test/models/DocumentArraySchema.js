const Schema = require("mongoose").Schema;
const originals = require("../../src");
const DocumentArrayNestedSchema = require("./DocumentArrayNestedSchema");

const DocumentArraySchema = new Schema(
    {
        category: String,
        nested: DocumentArrayNestedSchema,
    },
    { _id: false }
);

DocumentArraySchema.plugin(originals, { fields: ["category"] });

module.exports = DocumentArraySchema;
