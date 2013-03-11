var mongoose = require('mongoose'),
    db = mongoose.connect('mongodb://localhost/test'),
    Schema = mongoose.Schema;

var Comment = new Schema({
    user: {type: Schema.Types.ObjectId, ref: 'User'},
    text: String,
    likes: [{type: Schema.Types.ObjectId, ref: 'User'}]
});

var Post = new Schema({
    user:  {type: Schema.Types.ObjectId, ref: 'User'},
    text: String,
    likes: [{type: Schema.Types.ObjectId, ref: 'User'}],
    replies: [Comment]
});

Post.virtual('dateCreated').get(function(){
    return this._id.getTimestamp();
});

var User = new Schema({
    username: String,
    email: String,
    password: String,
    name: String,
});

var UserModel = mongoose.model('User', User);

var CommentModel = mongoose.model('Comment', Comment);

var PostModel = mongoose.model('Post', Post);

exports.createNewComment = function() {
    return new Comment;
};

exports.createNewUser = function() {
    return new User;
};

exports.createNewPost = function() {
    return new Post;
};

exports.getCommentModel = function() {
    return CommentModel;
};

exports.getUserModel = function() {
    return UserModel;
};

exports.getPostModel = function() {
    return PostModel;
};