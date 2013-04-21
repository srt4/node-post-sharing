var CT = require('./modules/country-list');
var AM = require('./modules/account-manager');
var EM = require('./modules/email-dispatcher');
var _ = require('underscore');
var Mongoose = require('./modules/mongoose');

module.exports = function(app) {

	app.get('/', function(req, res){
		if (req.cookies.user == undefined || req.cookies.pass == undefined){
			res.render('login', { title: 'Hello - Please Login To Your Account' });
		}	else{
			AM.autoLogin(req.cookies.user, req.cookies.pass, function(o){
				if (o != null){
				    req.session.user = o;
					res.redirect('/posts');
				}	else{
					res.render('login', { title: 'Hello - Please Login To Your Account' });
				}
			});
		}
	});
	
	app.post('/', function(req, res){
		AM.manualLogin(req.param('user'), req.param('pass'), function(e, o){
			if (!o){
				res.send(e, 400);
			}	else{
			    req.session.user = o;
				if (req.param('remember-me') == 'true'){
					res.cookie('user', o.username, { maxAge: 900000 });
					res.cookie('pass', o.password, { maxAge: 900000 });
				}
				res.send(o, 200);
			}
		});
	});
	
	app.get('/home', function(req, res) {
        res.redirect('/posts'); //todo remove
        if (req.session.user == null){
	        res.redirect('/');
	    }   else{
			res.render('home', {
				title : 'Control Panel',
				countries : CT,
				udata : req.session.user
			});
	    }
	});

    app.get('/posts', function(req, res) {
        if (req.session.user == null) {
            res.redirect('/');
        } else {
            Mongoose.getPostModel()
                .find()
                .sort({'_id': -1})
                .populate('user')
                .populate('likes')
                .populate('replies.user')
                .exec(function(error, posts) {
                    res.render('posts', {
                        title: "Posts",
                        udata: req.session.user,
                        posts: posts
                    });
                }
            );
        }
    });

    app.post('/posts', function(req, res) {
        if(req.session.user == null) {
            res.redirect('/');
        } else {
            var text = req.param('text', null);
            if (text == null) {
                res.send('error-posting', 400);
            }

            Mongoose.getUserModel().findOne({
                    email: req.session.user.email
            }, function(error, user) {
                Mongoose.getPostModel().create({
                    user: user._id,
                    text: text
                }, function(error){
                    if(error) res.send(error);
                    res.redirect('/posts');
                });
            });

        }
    });

    app.post('/post/:id/like', function(req, res) {
        var id = req.params.id;
        Mongoose.getPostModel().findById(id, function(error, post){
            var alreadyLiked = false;
            _.each(post.likes, function(userId) {
                alreadyLiked = alreadyLiked || userId == req.session.user._id;
            });

            if (!alreadyLiked) {
                post.likes.push(
                    req.session.user._id
                );
            }

            post.save(function(error){
                if(!error) {
                    res.redirect('/posts');
                } else {
                    res.send('Error');
                }
            });
        });
    });

    app.post('/post/:id/comment', function(req, res){
        var id = req.params.id;

        Mongoose.getPostModel().findById(id, function(error, post){
            post.replies.push({
                user: req.session.user._id,
                text: req.param('text', null)
            });

            post.save(function(error){
                if(!error) {
                    res.redirect('/posts');
                } else {
                    res.send('Error');
                }
            });
        });
    });

    app.get('/user/:id', function(req, res){
        var id = req.params.id;
        Mongoose
            .getUserModel()
            .findById(id)
            .exec(function(error, user){
                Mongoose.getPostModel().find({
                    user: user._id
                })
                .sort({'_id': -1})
                .populate('user')
                .populate('likes')
                .populate('replies.user')
                .exec(function(error, posts){
                        res.render('user', {
                            user: user,
                            posts: posts
                        });
                });
            });
    });

    app.get('/users', function(req, res) {

        AM.getAllRecords(function(e, accounts){
            console.log(accounts);
            res.render('print', { title : 'Account List', accts : accounts });
        });
    });
	
	app.post('/home', function(req, res){
        res.redirect('/posts'); //todo remove
		if (req.param('user') != undefined) {
			AM.updateAccount({
				user 		: req.param('user'),
				name 		: req.param('name'),
				email 		: req.param('email'),
				country 	: req.param('country'),
				pass		: req.param('pass')
			}, function(e, o){
				if (e){
					res.send('error-updating-account', 400);
				}	else{
					req.session.user = o;
			// update the user's login cookies if they exists //
					if (req.cookies.user != undefined && req.cookies.pass != undefined){
						res.cookie('user', o.user, { maxAge: 900000 });
						res.cookie('pass', o.pass, { maxAge: 900000 });	
					}
					res.send('ok', 200);
				}
			});
		}	else if (req.param('logout') == 'true'){
			res.clearCookie('user', null);
			res.clearCookie('pass', null);
			req.session.destroy(function(e){ if(!e) res.send('ok', 200); });
		}
	});

	app.get('/signup', function(req, res) {
		res.render('signup', {  title: 'Signup', countries : CT });
	});
	
	app.post('/signup', function(req, res){
		AM.addNewAccount({
			name 	: req.param('name'),
			email 	: req.param('email'),
			user 	: req.param('user'),
			pass	: req.param('pass'),
			country : req.param('country')
		}, function(e){
			if (e){
				res.send(e, 400);
			}	else{
				res.send('ok', 200);
			}
		});
	});

	app.post('/lost-password', function(req, res){
		AM.getAccountByEmail(req.param('email'), function(o){
			if (o){
				res.send('ok', 200);
				EM.dispatchResetPasswordLink(o, function(e, m){
					if (!e && m) {
					}	else{
						res.send('email-server-error', 400);
						for (var k in e)
                            if(e.hasOwnProperty(k))
                                console.log('error : ', k, e[k]);
					}
				});
			}	else{
				res.send('email-not-found', 400);
			}
		});
	});

	app.get('/reset-password', function(req, res) {
		var email = req.query["e"];
		var passH = req.query["p"];
		AM.validateResetLink(email, passH, function(e){
			if (e != 'ok'){
				res.redirect('/');
			} else{
	// save the user's email in a session instead of sending to the client //
				req.session.reset = { email:email, passHash:passH };
				res.render('reset', { title : 'Reset Password' });
			}
		})
	});
	
	app.post('/reset-password', function(req, res) {
		var nPass = req.param('pass');
	// retrieve the user's email from the session to lookup their account and reset password //
		var email = req.session.reset.email;
	// destory the session immediately after retrieving the stored email //
		req.session.destroy();
		AM.updatePassword(email, nPass, function(o){
			if (o){
				res.send('ok', 200);
			}	else{
				res.send('unable to update password', 400);
			}
		})
	});

	app.post('/delete', function(req, res){
		AM.deleteAccount(req.body.id, function(e, obj){
			if (!e && obj){
				res.clearCookie('user', null);
				res.clearCookie('pass', null);
	            req.session.destroy(function(e){ if(!e) res.send('ok', 200); });
			}	else{
				res.send('record not found', 400);
			}
	    });
	});
	
	app.get('*', function(req, res) { res.render('404', { title: 'Page Not Found'}); });
};