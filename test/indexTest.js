"use strict";

const assert = require("assert");
const database = require("./database");
const mongoose = require("mongoose");
const Customer = require("./models/Customer");
const Subscription = require("./models/Subscription");
const Nested = require("./models/Nested");
const originals = require("../src");

describe(
    "Customer",
    database([Customer, Nested], function() {
        it("Should throw an error if no fields are defined", function() {
            const Schema = mongoose.Schema;

            const TestSchema = new Schema({
                ipAddress: String,
            });

            assert.throws(function() {
                TestSchema.plugin(originals);
            }, /No fields specified for mongoose originals on schema/);
        });

        it("Should test nested setSnapshotOriginal and clearSnapshotOriginal", function() {
            const nested = new Nested({
                name: "11",
                embedded: { name: "22", children: [{ title: "33" }, { title: "44" }] },
                children: [
                    { category: "55", nested: { type: "66" } },
                    { category: "77", nested: { type: "88" } },
                ],
            });

            return nested
                .save()
                .then(nested => {
                    assert.equal(nested.setSnapshotOriginal(), nested);

                    assert.deepEqual(nested.snapshotOriginal, nested.original);
                    assert.deepEqual(nested.embedded.snapshotOriginal, nested.embedded.original);
                    assert.deepEqual(
                        nested.embedded.children[0].snapshotOriginal,
                        nested.embedded.children[0].original
                    );
                    assert.deepEqual(
                        nested.embedded.children[1].snapshotOriginal,
                        nested.embedded.children[1].original
                    );
                    assert.deepEqual(
                        nested.children[0].snapshotOriginal,
                        nested.children[0].original
                    );
                    assert.deepEqual(
                        nested.children[0].nested.snapshotOriginal,
                        nested.children[0].nested.original
                    );
                    assert.deepEqual(
                        nested.children[1].snapshotOriginal,
                        nested.children[1].original
                    );
                    assert.deepEqual(
                        nested.children[1].nested.snapshotOriginal,
                        nested.children[1].nested.original
                    );

                    assert.deepEqual(nested.snapshotOriginal, { name: "11", email: undefined });
                    assert.deepEqual(nested.embedded.snapshotOriginal, { name: "22" });
                    assert.deepEqual(nested.embedded.children[0].snapshotOriginal, { title: "33" });
                    assert.deepEqual(nested.embedded.children[1].snapshotOriginal, { title: "44" });
                    assert.deepEqual(nested.children[0].snapshotOriginal, { category: "55" });
                    assert.deepEqual(nested.children[0].nested.snapshotOriginal, { type: "66" });
                    assert.deepEqual(nested.children[1].snapshotOriginal, { category: "77" });
                    assert.deepEqual(nested.children[1].nested.snapshotOriginal, { type: "88" });

                    nested.name = "t1";
                    nested.embedded.name = "t2";
                    nested.embedded.children[0].title = "t3";
                    nested.embedded.children[1].title = "t4";
                    nested.children[0].category = "t5";
                    nested.children[0].nested.type = "t6";
                    nested.children[1].category = "t7";
                    nested.children[1].nested.type = "t8";

                    return nested.save();
                })
                .then(nestedSaved => {
                    assert.deepEqual(nestedSaved.original, { name: "t1", email: undefined });
                    assert.deepEqual(nestedSaved.embedded.original, { name: "t2" });
                    assert.deepEqual(nestedSaved.embedded.children[0].original, { title: "t3" });
                    assert.deepEqual(nestedSaved.embedded.children[1].original, { title: "t4" });
                    assert.deepEqual(nestedSaved.children[0].original, { category: "t5" });
                    assert.deepEqual(nestedSaved.children[0].nested.original, { type: "t6" });
                    assert.deepEqual(nestedSaved.children[1].original, { category: "t7" });
                    assert.deepEqual(nestedSaved.children[1].nested.original, { type: "t8" });

                    assert.deepEqual(nested.snapshotOriginal, { name: "11", email: undefined });
                    assert.deepEqual(nested.embedded.snapshotOriginal, { name: "22" });
                    assert.deepEqual(nested.embedded.children[0].snapshotOriginal, { title: "33" });
                    assert.deepEqual(nested.embedded.children[1].snapshotOriginal, { title: "44" });
                    assert.deepEqual(nested.children[0].snapshotOriginal, { category: "55" });
                    assert.deepEqual(nested.children[0].nested.snapshotOriginal, { type: "66" });
                    assert.deepEqual(nested.children[1].snapshotOriginal, { category: "77" });
                    assert.deepEqual(nested.children[1].nested.snapshotOriginal, { type: "88" });

                    assert.equal(nested.clearSnapshotOriginal(), nested);

                    assert.equal(nested.snapshotOriginal, undefined);
                    assert.equal(nested.embedded.snapshotOriginal, undefined);
                    assert.equal(nested.embedded.children[0].snapshotOriginal, undefined);
                    assert.equal(nested.embedded.children[1].snapshotOriginal, undefined);
                    assert.equal(nested.children[0].snapshotOriginal, undefined);
                    assert.equal(nested.children[0].nested.snapshotOriginal, undefined);
                    assert.equal(nested.children[1].snapshotOriginal, undefined);
                    assert.equal(nested.children[1].nested.snapshotOriginal, undefined);
                });
        });

        it("Should not add collection methods if specified", function() {
            const Schema = mongoose.Schema;

            const TestSchema = new Schema({
                modes: [String],
            });
            TestSchema.plugin(originals, { fields: ["modes"], methods: false });

            const Test = mongoose.model("Test", TestSchema);
            const test = new Test({});

            assert.ok(!test.collectionAdded);
        });

        it("Should be able to save original values", function() {
            const customer = new Customer({
                name: "Pesho",
                email: "Pesho",
                phone: "+318230132",
                answers: [{ name: "I am big" }, { name: "I am strong" }],
            });

            return customer
                .save()
                .then(customer => {
                    const oldCustomer = customer.toObject();

                    customer.name = "New name";
                    customer.email = "new-email@example.com";
                    customer.phone = "+111111111";
                    customer.answers = [{ name: "test" }, { name: "oskar" }];

                    const expected = {
                        name: oldCustomer.name,
                        phone: oldCustomer.phone,
                        answers: oldCustomer.answers,
                    };

                    assert.deepEqual(customer.original, expected);

                    return customer.save();
                })
                .then(customer => {
                    const newCustomer = customer.toObject();

                    const expected = {
                        name: newCustomer.name,
                        phone: newCustomer.phone,
                        answers: newCustomer.answers,
                    };

                    assert.deepEqual(customer.original, expected);
                });
        });

        it("Should be able to have proper a Customer", function() {
            const customer = new Customer({
                name: "Pesho",
                email: "Pesho",
                phone: "+318230132",
                answers: [{ name: "I am big" }, { name: "I am strong" }],
            });

            return customer.save().then(customer => {
                const oldAnswer = customer.answers[0].toObject();
                customer.answers[1].name = "test";
                customer.answers[0].remove();
                customer.answers.push({ name: "added" });

                assert.deepEqual(customer.collectionAdded("answers"), [customer.answers[1]]);
                assert.deepEqual(customer.collectionRemoved("answers"), [oldAnswer]);
                assert.deepEqual(customer.collectionUpdated("answers"), [customer.answers[0]]);
            });
        });

        it("Should be able to check for isChanged status", function() {
            const customer = new Customer({
                name: "Pesho",
                email: "Pesho",
                phone: "+318230132",
                answers: [{ name: "I am big" }, { name: "I am strong" }],
            });

            return customer.save().then(customer => {
                customer.email = "other";
                assert.equal(customer.isChanged(), false);
                customer.name = "other";
                assert.equal(customer.isChanged(), true);
            });
        });

        it("Should be able to check for isChanged status for nested arrays", function() {
            const customer = new Customer({
                name: "Pesho",
                email: "Pesho",
                phone: "+318230132",
                answers: [{ name: "I am big" }, { name: "I am strong" }],
            });

            return customer.save().then(customer => {
                assert.equal(customer.isChanged(), false);
                customer.answers[0].name = "other";
                assert.equal(customer.isChanged(), true);
            });
        });

        it("Should work even with unsaved models, by calling initOriginals", function() {
            const subscription = new Subscription({ name: "Basic" });

            assert.equal(undefined, subscription.original);

            subscription.initOriginals();

            subscription.discounts.push(subscription.discounts.create({ amount: 20 }));

            assert.deepEqual({ discounts: [] }, subscription.original);

            subscription.initOriginals();

            subscription.discounts.push(subscription.discounts.create({ amount: 30 }));

            assert.deepEqual(
                { discounts: [] },
                subscription.original,
                "Should not change initOriginals"
            );
        });
    })
);
