/**
 *
 * @constructor
 */
function Post() {
    this.id = '';
    this.author = '';
    this.text = '';
    this.likes = [];
    this.replies = [];
}

Post.createFromMongo = function(mongoData, accountManager) {
    var post = new Post();
    // todo

};

Post.saveToMongo = function() {
    // todo
};



