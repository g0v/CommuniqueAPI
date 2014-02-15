var mongodbClient = require('mongodb');

// var mongoUri =  process.env.MONGOLAB_URI;
                // process.env.MONGOHQ_URL ||
                // 'mongodb://127.0.0.1:27017/Communique';
var dbUser = process.env.DBUSER;
var dbPWD  = process.env.DBPWD;

var mongoUri = typeof(process.env.DBUSER) == 'undefined'?
                'mongodb://127.0.0.1:27017/Communique':
                'mongodb://' + dbUser + ':' + dbPWD +'@ds027509.mongolab.com:27509/heroku_app21942061';

var listTAG = [];

var url = {name: '', url: ''};
var urls = [];
var tag = {name: '', description: '', urls: urls};

// var url = 'mongodb://127.0.0.1:27017/Communique';

var app = exports = module.exports = {};

app.init = function () {
    mongodbClient.connect(mongoUri, {}, function (err, db) {
        // db.dropDatabase(function (err, result) {
        //     db.dropCollection('item', function (err, result) {
        //         db.addListener('error', function (err, db){
        //             console.log('Error connection');
        //         })
        //         db.createCollection('item', function (err, collection){
        //             if (err) {
        //                 console.log('Create Error');
        //             } else {
        //                 console.log('Create Successed');
        //             }
        //             db.close();
        //         });
        //     });
        // });
        db.collection('item', function (err, collection) {
            collection.remove( function (err) {
                if (err) {
                    console.log('remove error' + err);
                }
            });
            db.close();
        });
    });
};

app.insertData = function (data, getItemID) {
    console.log(data);
    var tags = data['tags'];
    tags.forEach(function (tag) {
        if (listTAG.indexOf(tag) < 0)   // parse tag list
        {
            console.log('tag' + tag);
            listTAG.push(tag);
        }
    });
    mongodbClient.connect(mongoUri, {}, function (err, db) {
        db.collection('item', function (err, collection) {
            collection.insert(data, {safe: true}, function (err, records) {
                if (err) {
                    console.log('Insert Error' + err);
                } else {
                    // console.log("Insert Successed");
                    // console.log("Record added as", records[0]._id);
                }
                getItemID(records[0]._id);
                db.close();
            });
        });
    });
};

app.queryData = function (filter, getResult) {
    mongodbClient.connect(mongoUri, {}, function (err, db) {
        db.collection('item', function (err, collection) {
            collection.find(filter, {'sort':[['date','desc']]}).toArray(function (err, docs) {
                db.close();
                getResult(docs);
            });
        });
    });
};

app.queryTags = function (getResult) {
    getResult(listTAG);
};

app.updateData = function (id, data) {
    mongodbClient.connect(mongoUri, {}, function (err, db) {
        db.collection('item', function (err, collection) {
            collection.update(id, {$set: data}, function (err) {
                db.close();
            });
        });
    });
};

app.updateTags = function (tagdata) {
    var tagExist = 0;
    for (var i = listTAG.length - 1; i >= 0; i--) {
        tmpTag = listTAG[i];
        if(tmpTag['name'] == tagdata['name']) {
            tmpTag = tagdata;
            tagExist = 1;
        }
    }
    if (tagExist == 0) {
        listTAG.push(tagdata);
        console.log('add tag ' + tagdata);
    }
}
