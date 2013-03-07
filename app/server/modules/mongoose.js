var mongoose = require('mongoose'),
    db = mongoose.connect('mongodb://localhost/test'),
    Schema = mongoose.Schema;

var Post = new Schema({
    user:  {type: Schema.Types.ObjectId, ref: 'User'},
    text: String,
    likes: [{type: Schema.Types.ObjectId, ref: 'User'}],
    replies: [Post]
});
Post.virtual('dateCreated').get(function(){
    return this._id.getTimestamp();
});

var User = new Schema({
    username: String,
    email: String,
    password: String,
    name: String,
    posts: [{type: Schema.Types.ObjectId, ref: 'Post'}]
});

var UserModel = mongoose.model('User', User);

var PostModel = mongoose.model('Post', Post);

exports.createNewUser = function() {
    return new User;
};

exports.createNewPost = function() {
    return new Post;
};

exports.getUserModel = function() {
    return UserModel;
};

exports.getPostModel = function() {
    return PostModel;
};