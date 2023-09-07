const { mongoPassword: password } = require('../.env');

const mongodb = require('mongodb');
const MongoClient = mongodb.MongoClient;

const mongoConnect = (callback) => {
  MongoClient.connect(
    `mongodb+srv://roadtomars2030:${password}@cluster0.6j6n0va.mongodb.net/?retryWrites=true&w=majority`
  )
    .then((client) => {
      console.log('Connected!');
      callback(client);
    })
    .catch(console.log);
};

module.exports = mongoConnect;
