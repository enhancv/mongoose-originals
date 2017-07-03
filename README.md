Mongoose Originals
==================
[![Build Status](https://travis-ci.org/enhancv/mongoose-originals.svg?branch=master)](https://travis-ci.org/enhancv/mongoose-originals)
[![Code Climate](https://codeclimate.com/github/enhancv/mongoose-originals/badges/gpa.svg)](https://codeclimate.com/github/enhancv/mongoose-originals)
[![Test Coverage](https://codeclimate.com/github/enhancv/mongoose-originals/badges/coverage.svg)](https://codeclimate.com/github/enhancv/mongoose-originals/coverage)

A mongoose plugin to retrieve original values

Instalation
-----------

```bash
yarn add mongoose-originals
```

Usage
-----

```javascript
var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var originals = require('mongoose-originals');

var CustomerSchema = new Schema({
    name: String,
    email: String,
    answers: [{ name: String }],
});

CustomerSchema.plugin(originals, { fields: ['name', 'email'] });
var Customer = mongoose.model('Customer', CustomerSchema);

var customer = new Customer({ name: 'test', email: 'example.com' });

customer.save();

customer.name = 'new name';
console.log(customer.originals.name);
```

Since mongoose [has some limitations](https://github.com/Automattic/mongoose/issues/3968) originals object will not be available when you create a brand new unsaved object. To work arround that, you'll need to execute the "initOriginals" method.

```
var customer = new Customer({ name: 'test', email: 'example.com' });
customer.initOriginals();
console.log(customer.originals.name);
```

You can check if the values are changed compared to the originals:
```
var customer = new Customer({ name: 'test', email: 'example.com' });
customer.save().then((customer) => {
    console.log(customer.isChanged()); // false
    customer.name = 'other';
    console.log(customer.isChanged()); // true
});

License
-------

Copyright (c) 2016-2017 Enhancv
Licensed under the MIT license.
