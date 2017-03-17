'use strict';

const path = require('path');
const dotenv = require('dotenv');
const mongoose = require('mongoose');

dotenv.config({ path: path.resolve(__dirname, '../.env') });
mongoose.Promise = global.Promise;
mongoose.connect(process.env.MONGO_URI);

function clearModels(models) {
    const removePromises = models.map(model => model.remove().exec());
    return Promise.all(removePromises);
}

function database (models, test) {

    beforeEach('Clear models', function () {
        return clearModels(models);
    });

    return test;
}

module.exports = database;
