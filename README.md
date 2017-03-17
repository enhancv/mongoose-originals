Mongoose Originals
==================

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
