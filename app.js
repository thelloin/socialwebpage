var express = require('express');
var http = require('http');

var path = require('path');
var passport = require('passport');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var morgan = require('morgan');
var session = require('express-session');
var Negotiator = require('negotiator');
var errorHandler = require('errorhandler');
var LocalStrategy = require('passport-local').Strategy;
var mongoose = require('mongoose');
var MongoStore = require('connect-mongo')(session);
var cors = require('cors');
var functions = require('./functions.js');

var busboy = require('connect-busboy');
var fs = require('fs');


var DBconfig = require('./db.js');
mongoose.connect(DBconfig.url);

var User = require('./user');

passport.use('local-login', new LocalStrategy({
    usernameField: 'username',
    passwordField: 'password',
    passReqToCallback: true
},function(req, username, password, done) {
    process.nextTick(function() {
	User.findOne({'local.username': username }, function(err, user){
	    if(err)
		return done(err);
	    if(!user)
		return done(null, false, { message: 'Incorrect username' });
	    if(user.local.password != password)
		return done(null, false, { message: 'Incorrect password' });
	    return done(null, user);
	})
    })
}));

passport.use('local-signup', new LocalStrategy({
    usernameField: 'username',
    passwordField: 'password',
    passReqToCallback: true
    
}, function(req, username, password, done) {

    // asynchronous
    // User.findOne wont fire unless data is sent back
    process.nextTick(function() {

	// find a user whose email is the same as the forms email
	// we are checking to see if the user trying to login already exists
	User.findOne({ 'local.username' :  username }, function(err, user) {
	    // if there are any errors, return the error
	    if (err)
		return done(err);

	    // check to see if theres already a user with that email
	    if (user) {
		//console.log(user);
		console.log("User exists");
		return done(null, false);
	    } else {

		var newUser = new User();
		newUser.local.username = username;
		newUser.local.password = password;;
		newUser.firstName = req.body.firstname;
		newUser.lastName = req.body.lastname;
		// save the user
		functions.createUser(newUser);
		return done(null, newUser);
	    }

	});    

    });

}));



// Serialized and deserialized methods when got from session
passport.serializeUser(function(user, done) {
    done(null, user);
});

passport.deserializeUser(function(user, done) {
    done(null, user);
});

// Define a middleware function to be used for every secured routes
var auth = function(req, res, next){
  if (!req.isAuthenticated()) 
  	res.send(401);
  else
  	next();
};


var app = express();

// all environments
app.set('port', process.env.PORT || 3000);
app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');
app.use(morgan('dev'));
app.use(cors());
app.use(cookieParser()); 
app.use(bodyParser.json());
app.use(session({
    secret: 'securedsession',
    resave: false,
    saveUninitialized: false,
    store: new MongoStore({mongooseConnection: mongoose.connection })
}));

app.use(passport.initialize()); // Add passport initialization
app.use(passport.session());    // Add passport initialization
app.use(busboy({ immediate: true }));
app.use(express.static(path.join(__dirname, 'public')));

// development only
if ('development' == app.get('env')) {
  app.use(errorHandler());
}

// routes
app.get('/', function(req, res){
  res.render('index', { title: 'Express' });
});

app.get('/users', auth, function(req, res){
    var searchValue = req.value;
    functions.findUsers(User, res);
});

app.get('/posts', auth, function(req, res){
    var postToGet = req.query.userid;
    if(postToGet == undefined){
	postToGet = req.user._id;
    }
       
    User.findOne({ _id : postToGet }, function(err, user){
	if (err) {
	    throw err;
	}
	res.send(user.posts);
    }); 
  
});

app.post('/newpost', auth, function(req, res){
    var author = req.user.firstName + " " + req.user.lastName;
    var text = req.body.text;
    if(req.body.userToRecieve != undefined) {
	var userToRecieve = req.body.userToRecieve;
    } else {
	var userToRecieve = req.user._id;
    }
    var post = {'author': author, 'text':text };   
    
    User.findByIdAndUpdate(userToRecieve, {$push: { posts: post }}, {new: true}, function(err, user){
	if(err) {

	    throw err;
	}
	
	res.send(post);
    });
});

app.get('/friends', auth, function(req, res){
   
    var userToFind = req.user._id;
    var userInfo = []
    User.findOne({ _id : userToFind }, function(err, user){
	if (err) {
	    throw err;
	}
	
	res.send(user.friends);
    });
});

app.post('/addfriend', auth, function(req, res){
    var currUser = req.user._id;
    var userToAdd = req.body.userIdToAdd;
    var nameToAdd = req.body.nameToAdd;

    User.findByIdAndUpdate(currUser, {$push: { friends: {userid: userToAdd, name: nameToAdd } }}, {new: true}, function(err, user){
	if(err) {
	    throw err;
	}
	
	res.send(user.friends);
    });        
});
		       
	

app.get('/userinfo', auth, function(req, res){
    
    if(req.query.userid != undefined) 
	var userToFind = req.query.userid;
    else
	var userToFind = req.user._id;
    
    var userInfo = []
    
    User.findOne({ _id : userToFind }, function(err, user){
	if (err) {
	    throw err;
	} else {
	    userInfo.push(user.firstName + " " + user.lastName);
	    userInfo.push(user.posts);
	}
	res.send(userInfo);
    });  
});

app.get(/useruploads/, function(req, res) {

    res.sendFile(__dirname + req.path);
});

app.get('/images', function(req, res) {

    var userImages = [];
    var imageFolder;
    
    if(req.query.userid === undefined) {
	imageFolder = req.user._id;
    } else {
	imageFolder = req.query.userid;
    }
    
    fs.readdir(__dirname + '/useruploads/' + imageFolder, function(err,files){
	if(err) {
	    throw err;
	}
	files.forEach(function(file){	    
	    userImages.push('/useruploads/' + imageFolder + "/" + file);
	});
	
	res.send(userImages);
    });
       
});

app.post('/upload', function(req, res) {
    
    var fstream;
    req.pipe(req.busboy);

    var newName = Date.now();

    req.busboy.on('file', function (fieldname, file, filename) {
        console.log("Uploading: " + filename); 
        fstream = fs.createWriteStream(__dirname + '/useruploads/' + req.user._id + "/" + newName);
        file.pipe(fstream);
        fstream.on('close', function () {
            res.send();
        });
    });

});

app.get('/checkForUpdates', function(req, res) {

    var userToCheck;
    
    if(req.query.user === "req.user._id") {
	userToCheck = req.user._id;
    } else {
	userToCheck = req.query.user;
    }
 
    fs.readdir(__dirname + '/useruploads/' + userToCheck, function(err,files){
	if(err) {

	    throw err;
	}
	
	var toCompare = parseInt(req.query.time);
	var latest = 0;
	if (files.length >= 1) {
	    latest = parseInt(files.slice(-1)[0]);
	} 
	var toSend;
	if(latest > toCompare)
	{
	    toSend = true;
	} else {
	    toSend = false;
	}

	res.send(toSend);        
    });

});


// route to test if the user is logged in or not
app.get('/loggedin', function(req, res) {

  res.send(req.isAuthenticated() ? req.user : '0');
});

app.post('/register', passport.authenticate('local-signup'), function(req, res) {
    try {
	functions.mkdirSync(fs, __dirname + '/useruploads/' + req.user._id);
    } catch(err) {
	throw err;
    }

    res.send(req.user);
});

// route to log in
app.post('/login', passport.authenticate('local-login'), function(req, res) {
  res.send(req.user);
});

// route to log out
app.post('/logout', function(req, res){
  req.logOut();
  res.send(200);
});

var server = http.createServer(app);

function start() {
    if(require.main != module) {
	clearDb();
    }
    server.listen(app.get('port'), function(){
	console.log('Express server listening on port ' + app.get('port'));
    });
};

function clearDb() {
    User.remove({}, function(err) {
	console.log("Db collections cleared");
    });
};

var io = require('socket.io').listen(server);
app.io = require('socket.io').listen(app.server);
var socketPassport = require('passport.socketio');
app.io.use(socketPassport.authorize({
  cookieParser: cookieParser,
  key: 'connect.sid',
  secret: 'securedsession',
  store: {mongooseConnection: mongoose.connection},
  fail: function(data, message, error, accept) {
    accept(null, false);
  },
  success: function(data, accept) {
      accept(null, true);
  }
}));
io.sockets.on('connection', require('./socket'));


if(require.main === module) {

    start();
}


exports.start = start;
