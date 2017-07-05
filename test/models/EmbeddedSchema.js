const Schema = require("mongoose").Schema;
const originals = require("../../src");
const EmbeddedNestedSchema = require("./EmbeddedNestedSchema");

const EmbeddedSchema = new Schema(
    {
        name: String,
        children: [EmbeddedNestedSchema],
    },
    { _id: false }
);

EmbeddedSchema.plugin(originals, { fields: ["name"] });

module.exports = EmbeddedSchema;
