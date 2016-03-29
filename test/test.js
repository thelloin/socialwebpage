var request = require('superagent');
var server = require('../app');
var assert = require('assert');
var func = require('../functions');
var should = require('should');

var io = require('socket.io-client');



server.start();

var URL = 'http://localhost:3000';

describe('request', function() {
    describe('persistent agent', function() {
	var firstUserId;
	var secondUserId;
	var agent1 = request.agent();
	var agent2 = request.agent();
	var agent3 = request.agent();
	var agent4 = request.agent();

	it('Should return 401, not authorized. Not logged in yet.', function(done) {
	    agent1
		.get(URL + '/userinfo')
		.end(function(err, res) {
		    should.exist(err);
		    assert.equal(res.statusCode, 401);
		    done();
		});
	});

	it('Should successfully register a user and set cookies', function(done) {
	    agent1
		.post(URL + '/register')
		.send({username: "klas123", password: "klas123", firstname: "Klas", lastname: "Arvidsson"})
		.end(function(err, res) {
		    should.not.exist(err);
		    assert.equal(res.statusCode, 200);
		    firstUserId = res.body._id;
		    done();
		});
	});

	it('Should successfully log out and delete the session.', function(done) {
	    agent1
		.post(URL + '/logout')
		.end(function(err, res) {
		    should.not.exist(err);
		    assert.equal(res.statusCode, 200);
		    done();
		});
	});

	it('Should successfully register a second user', function(done) {
	    agent2
		.post(URL + '/register')
		.send({username: "test123", password: "test123", firstname: "test", lastname: "123"})
		.end(function(err, res) {
		    should.not.exist(err);
		    assert.equal(res.statusCode, 200);
		    secondUserId = res.body._id;
		    done();
		});
	});

	it('Should succcessfully log out', function(done) {
	    agent1
		.post(URL + '/logout')
		.end(function(err, res) {
		    should.not.exist(err);
		    assert.equal(res.statusCode, 200);
		    done();
		});
	});

	it('Should return 200, redirected to login (no cookies).', function(done) {
	    agent1
		.get(URL + '/')
		.end(function(err, res) {

		    assert.equal(res.statusCode, 200);
		    done();
		});
	});
	

	it('Should log in and set session cookie.', function(done) {
	    agent1
		.post(URL + '/login')
		.send({username: "klas123", password: "klas123"})
		.end(function(err, res) {
		    should.not.exist(err);
		    assert.equal(res.statusCode, 200);
		    done();
		});
	});

	it('Should persist and return 200, cookie already set.', function(done) {
	    agent1
		.get(URL + '/userinfo')
		.end(function(err, res) {
		    assert.equal(res.statusCode, 200);
		    done();
		});
	});

	it('Should persist and return 200, cookie already set.', function(done) {
	    agent1
		.get(URL + '/userinfo?userid=' + secondUserId)
		.end(function(err, res) {
		    assert.equal(res.statusCode, 200);
		    done();
		});
	});

	it('Should persist and return 200, cookie already set.', function(done) {
	    agent1
		.get(URL + '/friends')
		.end(function(err, res) {
		    assert.equal(res.statusCode, 200);
		    done();
		});
	});

	it('Should persist and return 200, cookie already set.', function(done) {
	    agent1
		.get(URL + '/users')
		.end(function(err, res) {
		    //should.not.exist(err);
		    assert.equal(res.statusCode, 200);
		    done();
		});
	});



        it('Should persist and return 200, cookie already set.', function(done) {
	    agent1
		.get(URL + '/checkForUpdates?user=' +secondUserId)
		.end(function(err, res) {
		    //should.not.exist(err);
		    assert.equal(res.statusCode, 200);
		    done();
		});
	});


	it('Should persist and return 200, cookie already set.', function(done) {
	    agent1
		.get(URL + '/loggedin')
		.end(function(err, res) {
		    assert.equal(res.statusCode, 200);
		    done();
		});
	});

	it('Should persist and return 200, cookie already set.', function(done) {
	    agent1
		.get(URL + '/posts')
		.end(function(err, res) {
		    assert.equal(res.statusCode, 200);
		    done();
		});
	});

	it('Should persist and return 200, cookie already set.', function(done) {
	    agent1
		.post(URL + '/addfriend')
		.send({userIdToAdd: secondUserId, nameToAdd: 'test 123'})
		.end(function(err, res) {
		    should.not.exist(err);
		    assert.equal(res.statusCode, 200);
		    done();
		});
	});

	it('Should persist and return 200, cookie already set.', function(done) {
	    agent1
		.post(URL + '/upload')
		.attach('image', 'test/testimage4.png')
		.end(function(err, res) {
		    //should.not.exist(err);
		    assert.equal(res.statusCode, 200);
		    //should.not.exist(res.headers['set-cookie']);
		    //res.text.should.include('dashboard');
		    done();
		});
	});

	it('Should persist and return 200, cookie already set.', function(done) {
	    agent1
		.post(URL + '/newpost')
		.send({text: "Hej mig själv" })
		.end(function(err, res) {
		    //should.not.exist(err);
		    assert.equal(res.statusCode, 200);
		    //should.not.exist(res.headers['set-cookie']);
		    //res.text.should.include('dashboard');
		    done();
		});
	});

	it('Should persist and return 200, cookie already set.', function(done) {
	    agent1
		.post(URL + '/newpost')
		.send({text: "Hej test 123", userToRecieve: secondUserId })
		.end(function(err, res) {
		    assert.equal(res.statusCode, 200);
		    done();
		});
	});

	it('Should persist and return 200, cookie already set.', function(done) {
	    agent1
		.get(URL + '/images?userid='+ secondUserId)
		.end(function(err, res) {
		    imagesPath = res.body[0];
		    console.log(res.body[0]);
		    
		    assert.equal(res.statusCode, 200);
		    done();
		});
	});

	var imagesPath;
	var timeToCheck;
	
	it('Should persist and return 200, cookie already set.', function(done) {
	    agent1
		.get(URL + '/images')
		.end(function(err, res) {
		    //should.not.exist(err);
		    imagesPath = res.body[0];
		    console.log(res.body[0]);
		    timeToCheck = imagesPath.split("/")[3];		    
		    assert.equal(res.statusCode, 200);
		    done();
		});
	});

	it('Should persist and return 200, cookie already set.', function(done) {
	    agent1
		.get(URL + imagesPath)
		.end(function(err, res) {		   
		    assert.equal(res.statusCode, 200);
		    done();
		});
	});

	it('Should be able to send a message, cookie already set.', function(done) {
	    var socket = io.connect(URL);
	    
	    socket.emit('send:message', {
		user: "1",
		reciever: "2",
		text: "Socket test!"
	    });

	    setTimeout(done, 1000);
	    
	});
	console.log("TIME TO CHECK");
	console.log(timeToCheck);
	it('Should persist and return 200, cookie already set.', function(done) {
	    agent1
		.get(URL + '/checkForUpdates/?user=req.user._id&time=' + timeToCheck)
		.end(function(err, res) {
		    assert.equal(res.statusCode, 200);
		    done();
		});
	});

	it('Should successfully log out.', function(done) {
	    agent1
		.post(URL + '/logout')
		.end(function(err, res) {
		    should.not.exist(err);
		    assert.equal(res.statusCode, 200);
		    done();
		});
	});

	it('Should get 401 statuscode because user already exists', function(done) {
	    agent2
		.post(URL + '/register')
		.send({username: "test123", password: "test123", firstname: "test", lastname: "123"})
		.end(function(err, res) {
		    should.exist(err);
		    assert.equal(res.statusCode, 401);
		    done();
		});
	});

	it('Should get 401 statuscode because username doesnt exist', function(done) {
	    agent2
		.post(URL + '/login')
		.send({username: "test12", password: "test123"})
		.end(function(err, res) {
		    should.exist(err);
		    assert.equal(res.statusCode, 401);
		    done();
		});
	});


	it('Should get 401 statuscode because password is incorrect', function(done) {
	    agent2
		.post(URL + '/login')
		.send({username: "test123", password: "test12"})
		.end(function(err, res) {
		    should.exist(err);
		    assert.equal(res.statusCode, 401);
		    done();
		});
	});

    });
});
