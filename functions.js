/********************************************
             USERDB FUNCTIONS
*********************************************/

function createUser(user) {
    //Check if users exists else create user
    console.log(user);
    try {
	user.save(function(err) {
	    if(err)
		throw err;
	});
	console.log("New user created");
    } catch(err) {
	console.log("There was an error creating the user: " + err);
    }
    
}

//Temporary find users functions to test stuff
function findUsers(user, res) {
    var usersArr = [];
    user.find({}, function(err, users) {
	if(err) {
	    throw err;
	} else {	 
	    for(var x in users) {
		
		var temp = {};
		temp['name'] = (users[x].firstName + " " + users[x].lastName);
		temp['userid'] = users[x]._id;
		usersArr.push(temp);
	    }
	}	
	res.send(usersArr);
    });
}

function mkdirSync(fs, path) {
    try {
	fs.mkdirSync(path);
    } catch(e) {
	if ( e.code != 'EEXIST' ) throw e;
    }   
}

exports.createUser = createUser;
exports.findUsers = findUsers;
exports.mkdirSync = mkdirSync;
