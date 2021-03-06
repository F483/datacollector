var express = require('express');
var jsonBody = require('body/json');
var cors = require('cors');
var logger = require('morgan');
var mongoskin = require('mongoskin');
var assert = require('assert');

var db = mongoskin.db('mongodb://@localhost:27017/datacoll', {safe:true})

var app = express();

var cors_options = {origin: true, credentials: true};
app.use(logger());
app.use(cors(cors_options));
app.options('*', cors(cors_options));

var api = express.Router();

api.param('collectionName', function(req, res, next, collectionName){
  req.collection = db.collection(collectionName)
  return next()
})

api.post('/:collectionName', function (req, res) {
  jsonBody(req, function (error, body) {
    if (!(body instanceof Object)) {
      body = {"content": body};
    }
    body.srv_timestamp = Date.now();
    console.log(body);
    req.collection.insert(body, {}, function(e, results){
        console.log('inserted');
        if (e) { console.error(e); next(e);}
        else res.json({srv_timestamp: body.srv_timestamp,
                       _id: results[0]._id})
    });
  });
});

app.use('/', api);

var server = app.listen(4343, function () { });
