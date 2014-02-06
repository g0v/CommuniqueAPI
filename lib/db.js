var mongodbClient = require('mongodb');

var mongoUri =  process.env.MONGOLAB_URI;
                // process.env.MONGOHQ_URL ||
                // 'mongodb://127.0.0.1:27017/Communique';
// var url = 'mongodb://127.0.0.1:27017/Communique';

var app = exports = module.exports = {};

app.init = function () {
    mongodbClient.connect(mongoUri, {}, function (err, db) {
        // db.dropDatabase(function (err, result) {
            // db.dropCollection('item', function (err, result) {
                // db.addListener('error', function (err, db){
                //     console.log('Error connection');
                // })
                // db.createCollection('item', function (err, collection){
                //     if (err) {
                //         console.log('Create Error');
                //     } else {
                //         console.log('Create Successed');
                //     }
                //     db.close();
                // });
            // });
        // });
        db.collection('item', function (err, collection) {
            collection.remove();
            db.close();
        });
    });
};

app.insertData = function (data) {
    mongodbClient.connect(mongoUri, function (err, db) {
        db.collection('item', function (err, collection) {
            collection.insert(data, function (err, records) {
                if (err) {
                    console.log('Insert Error');
                } else {
                    // console.log("Insert Successed");
                    // console.log("Record added as", records[0]._id);
                }
                db.close();
            });
        });
    });
};

app.queryData = function (filter, getResult) {
    mongodbClient.connect(mongoUri, function (err, db) {
        db.collection('item', function (err, collection) {
            collection.find(filter, {'sort':[['date','desc']]}).toArray(function (err, docs) {
                db.close();
                getResult(docs);
            });
        });
    });
};
