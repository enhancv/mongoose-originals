'use strict';

const assert = require('assert');
const database = require('./database');
const mongoose = require('mongoose');
const Customer = require('./models/Customer');
const originals = require('../src');

describe('Customer', database([Customer], function () {

    it('Should throw an error if no fields are defined', function () {
        const Schema = mongoose.Schema;

        const TestSchema = new Schema({
            ipAddress: String,
        });

        assert.throws(function () {
                TestSchema.plugin(originals);
            },
            /No fields specified for mongoose originals on schema/
        );
    });

    it('Should not add collection methods if specified', function () {
        const Schema = mongoose.Schema;

        const TestSchema = new Schema({
            modes: [String],
        });
        TestSchema.plugin(originals, { fields: ['modes'], methods: false });

        const Test = mongoose.model('Test', TestSchema);
        const test = new Test({});

        assert.ok(!test.collectionAdded);
    });

    it('Should be able to save original values', function () {
        const customer = new Customer({
            name: 'Pesho',
            email: 'Pesho',
            phone: '+318230132',
            answers: [
                { name: 'I am big' },
                { name: 'I am strong' },
            ],
        });

        return customer.save()
            .then(customer => {
                const oldCustomer = customer.toObject();

                customer.name = 'New name';
                customer.email = 'new-email@example.com';
                customer.phone = '+111111111';
                customer.answers = [ { name: 'test' }, { name: 'oskar' } ];

                const expected = {
                    name: oldCustomer.name,
                    phone: oldCustomer.phone,
                    answers: oldCustomer.answers,
                };

                assert.deepEqual(customer.original, expected);

                return customer.save();
            }).then(customer => {
                const newCustomer = customer.toObject();

                const expected = {
                    name: newCustomer.name,
                    phone: newCustomer.phone,
                    answers: newCustomer.answers,
                };

                assert.deepEqual(customer.original, expected);
            });
    });

    it('Should be able to have proper a Customer', function () {
        const customer = new Customer({
            name: 'Pesho',
            email: 'Pesho',
            phone: '+318230132',
            answers: [
                { name: 'I am big' },
                { name: 'I am strong' },
            ],
        });

        return customer.save()
            .then(customer => {
                const oldAnswer = customer.answers[0].toObject();
                customer.answers[1].name = 'test';
                customer.answers[0].remove();
                customer.answers.push({ name: 'added' });

                assert.deepEqual(customer.collectionAdded('answers'), [customer.answers[1]]);
                assert.deepEqual(customer.collectionRemoved('answers'), [oldAnswer]);
                assert.deepEqual(customer.collectionUpdated('answers'), [customer.answers[0]]);
            });
    });
}));
