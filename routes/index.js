var bodyParser = require('body-parser');
var parseUrlencoded = bodyParser.urlencoded({ extended: true });

module.exports = function (app, db, passport) {
    
    // function to check if user is logged in
	function isLoggedIn (req, res, next) {
		if (req.isAuthenticated()) {
			return next();
		} else {
			res.redirect('/');
		}
	}
    
    // direct user to correct app if logged in or anon
    app.route('/')
        .get(function (request, response) {
    		if (request.isAuthenticated()) {
    			response.sendFile(process.cwd() + '/public/app/loggedin.html');
    		} else {
    			response.sendFile(process.cwd() + '/public/app/index.html');
    		}
            
        });
        
    // anonomous api's
    app.route('/api/polls')
        .get(function(req, res) {
            db.collection('polls').find({}, {"_id": 0, "title": 1, "poll_id": 1}).toArray(function(err, docs) {
                if (err) {
                    res.json({ "error": "There were no polls found" });
                } else {
                    // repond with all poll titles and poll id's
                    res.json(docs);
                }
            });
        });
    app.route('/api/poll/:pollid')
        .get(function(req, res) {
            var pollID = parseInt(req.params.pollid);
            var ip = req.headers["x-forwarded-for"];
            db.collection('polls').findOne({"poll_id": pollID}, {"_id": 0, "title": 1, "poll_id": 1, "options": 1}, function(err, doc) {
                if (err) {
                    res.json({ "error": "No poll found" });
                } else {
                    // return user IP info to check if IP has already voted
                    db.collection('anonip').findOne({"ip": ip }, {"_id": 0, "ip": 1, "poll_votes": 1}, function(err, user) {
                        if (err) {
                            // respond with poll information including options
                            res.json({ poll: doc });
                        } else {
                            // respond with poll information including options and user information
                            res.json({ poll: doc, user: user });
                        }
                    });
                }
            });
        });
    app.route('/api/newvote/:pollid/:vote(*)')
        .get(function(req, res) {
            var pollID = parseInt(req.params.pollid);
            var optionVote = req.params.vote;
            var ip = req.headers["x-forwarded-for"];
            var query = { "poll_id": pollID, "options.option": optionVote };
            db.collection('anonip').findOne({"ip": ip }, {"_id": 0, "ip": 1, "poll_votes": 1}, function(err, user) {
                if (err) {
                    console.log(err);
                } else {
                    if (user) {
                        // user ip found add the poll_id to the voted array for the IP 
                        db.collection('anonip').update({"ip": ip}, { $push: { "poll_votes": pollID } });
                    } else {
                        // no user found add the IP and the vote to the anonip collection
                        db.collection('anonip').insert({"ip": ip, "poll_votes": [pollID]});
                    }
                // and add the vote to the poll
                db.collection('polls').update(query, { $inc: { "options.$.votes" : 1 } }, { upsert: false, multi: false });
                }
            });

        });

        
    // registered apis
    app.route('/api/user')
        .get(isLoggedIn, function(req, res) {
			res.json(req.user);
        });
    app.route('/api/user/poll/:pollid')
        .get(isLoggedIn, function(req, res) {
			var user = req.user;
            var pollID = parseInt(req.params.pollid);
            db.collection('polls').findOne({"poll_id": pollID}, {"_id": 0, "title": 1, "poll_id": 1, "options": 1, "author": 1}, function(err, doc) {
                if (err) {
                    res.json({ "error": "No poll found" });
                } else {
                    // return poll info and user info to check if user has already voted
                    res.json({ poll: doc, user: user });
                }
            });
        });
    app.route('/api/user/vote/:pollid/:vote(*)')
        .get(isLoggedIn, function(req, res) {
            var pollID = parseInt(req.params.pollid);
            var optionVote = req.params.vote;
            var query = { poll_id: pollID, "options.option": optionVote };
            db.collection('users').findOne({"_id": req.user._id }, {"_id": 1}, function(err, user) {
                if (err) {
                    // no user found so log the error
                    console.log("Error: " + err);
                } else {
                    // user found add the poll_id to the voted array and activity message
                    var today = new Date;
                    var months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
                    var month = months[today.getMonth()];
                    db.collection('users').update({"_id": req.user._id}, { $push: { "poll_votes": pollID, "activity": { $each: [{ "poll": pollID, "option": optionVote, "type": "voted", "date": month + " " + today.getDate() + ", " + today.getFullYear() }], $position: 0, $slice: 50 } } });
                }
            });
            // and add the vote to the poll
            db.collection('polls').update(query, { $inc: { "options.$.votes" : 1 } }, { upsert: false, multi: false });
        });
    app.route('/api/user/option/:pollid/:option(*)')
        .get(isLoggedIn, function(req, res) {
            var pollID = parseInt(req.params.pollid);
            var optionNew = req.params.option;
            var query = { poll_id: pollID };
            db.collection('users').findOne({"_id": req.user._id }, {"_id": 1}, function(err, user) {
                if (err) {
                    // no user found so log the error
                    console.log("Error: " + err);
                } else {
                    // user found add the poll_id to the voted array and activity message
                    var today = new Date;
                    var months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
                    var month = months[today.getMonth()];
                    db.collection('users').update({"_id": req.user._id}, { $push: { "poll_votes": pollID, "activity": { $each: [{ "poll": pollID, "option": optionNew, "type": "voted", "date": month + " " + today.getDate() + ", " + today.getFullYear() }], $position: 0, $slice: 50 } } });
                }
            });
            // and add the vote to the poll
            db.collection('polls').update(query, { $push: { "options" : { option: optionNew, votes: 1 } } }, { upsert: false, multi: false });
        });
    app.route('/api/user/add/poll')
        .post(isLoggedIn, parseUrlencoded, function(req, res) {
			// get the poll number
			db.collection('polls').find({}, {"_id": 0, poll_id: 1}).sort({poll_id:-1}).limit(1).toArray(function(err, doc) {
			    if (err) {
                    // no poll found so log the error
                    console.log("Error: " + err);
			    } else {
			        // add the poll
			        var pollNum = doc[0].poll_id+1;
			        var optionsArr = [];
			        for (var i = 0; i < req.body.pollOptions.length; i++) {
			            optionsArr.push({ "option": req.body.pollOptions[i].option, "votes": parseInt(req.body.pollOptions[i].votes, 10) });
			        }
			        db.collection('polls').insert({ "author": req.user._id, "title": req.body.pollName, "options": optionsArr, "poll_id": pollNum });
			        // add the poll_id to the voted array and activity message 
                    var today = new Date;
                    var months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
                    var month = months[today.getMonth()];
			        db.collection('users').update({"_id": req.user._id}, { $push: { "poll_votes": pollNum, "activity": { $each: [{ "poll": pollNum, "option": req.body.pollName, "type": "added poll", "date": month + " " + today.getDate() + ", " + today.getFullYear() }], $position: 0, $slice: 50 } } });
			        // respond to trigger the angular success redirect
			        res.json({ "poll_id": pollNum });
			    }
			});
        });
    app.route('/api/user/delete/poll/:pollid')
        .get(isLoggedIn, function(req, res) {
            var pollID = parseInt(req.params.pollid);
            db.collection('polls').remove({"poll_id": pollID, "author": req.user._id}, 1, function(err, doc) {
                if (err) {
                    res.json({ "error": "No poll deleted" });
                } else {
                    // respond to trigger the angular success redirect
                    res.json({ "Poll": "The poll has been deleted" });
                }
            });
        });
    app.route('/api/user/polls')
        .get(isLoggedIn, function(req, res) {
            db.collection('polls').find({"author": req.user._id}, {"_id": 0, "title": 1, "poll_id": 1}).toArray(function(err, docs) {
                if (err) {
                    res.json({ "error": "There were no polls found" });
                } else {
                    // repond with all poll titles and poll id's
                    res.json(docs);
                }
            });
        });
        
    // authentication routes (FIRST LOG IN)
        
	app.route('/auth/twitter')
		.get(passport.authenticate('twitter'));

	app.route('/auth/twitter/callback')
		.get(passport.authenticate('twitter', {
			successRedirect: '/',
			failureRedirect: '/'
		}));
		
	app.route('/auth/facebook')
	    .get(passport.authenticate('facebook'));
	    
	app.route('/auth/facebook/callback')
		.get(passport.authenticate('facebook', {
			successRedirect: '/',
			failureRedirect: '/'
		}));
		
	
	// authorize routes (CONNECT ADDITIONAL ACCOUNT)
	// put the logic in the above authentication routes, in future could have seperate strategy as per passport docs

	
	// LOG OUT
		
	app.route('/logout')
		.get(function (req, res) {
			req.logout();
			res.redirect('/');
		});
		
};