const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const originals = require("../../src");
const DocumentArraySchema = require("./DocumentArraySchema");
const EmbeddedSchema = require("./EmbeddedSchema");

const NestedSchema = new Schema({
    name: String,
    email: String,
    embedded: EmbeddedSchema,
    children: [DocumentArraySchema],
});

NestedSchema.plugin(originals, { fields: ["name", "email"] });

const Nested = mongoose.model("Nested", NestedSchema);

module.exports = Nested;
