const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const originals = require("../../src");

const DiscountSchema = new Schema({
    amount: Number,
});

const SubscriptionSchema = new Schema({
    name: String,
    discounts: [DiscountSchema],
});

SubscriptionSchema.plugin(originals, { fields: ["discounts"] });

const Subscription = mongoose.model("Subscription", SubscriptionSchema);

module.exports = Subscription;
