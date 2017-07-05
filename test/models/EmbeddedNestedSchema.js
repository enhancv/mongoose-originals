const Schema = require("mongoose").Schema;
const originals = require("../../src");

const EmbeddedNestedSchema = new Schema(
    {
        title: String,
    },
    { _id: false }
);

EmbeddedNestedSchema.plugin(originals, { fields: ["title"] });

module.exports = EmbeddedNestedSchema;
