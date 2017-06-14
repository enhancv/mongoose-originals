const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const originals = require("../../src");

const CustomerSchema = new Schema({
    ipAddress: String,
    name: String,
    email: String,
    phone: String,
    answers: [{ name: String }],
});

CustomerSchema.plugin(originals, { fields: ["name", "phone", "answers"] });

const Customer = mongoose.model("Customer", CustomerSchema);

module.exports = Customer;
