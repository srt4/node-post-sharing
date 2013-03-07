var MongoDB 	= require('mongodb').Db;
var Server 		= require('mongodb').Server;
var moment 		= require('moment');

var dbPort 		= 27017;
var dbHost 		= 'localhost';
var dbName 		= 'node-login';

var db = new MongoDB(dbName, new Server(dbHost, dbPort, {auto_reconnect: true}), {w: 1});
db.open(function(e, d){
    if (e) {
        console.log(e);
    }	else{
        console.log('connected to database :: ' + dbName);
    }
});
var posts = db.collection('posts');

exports.findPosts = function(callback) {
    posts.find().sort({$natural: -1}).toArray(callback)
};

exports.createPost = function(post, callback) {
    posts.insert(post, {safe:true}, callback);
};