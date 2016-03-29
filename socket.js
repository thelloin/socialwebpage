// export function for listening to the socket
module.exports = function (socket) {

    // broadcast a user's message to other users
    socket.on('send:message', function (data) {
	
	socket.broadcast.emit('send:message', {
	    sender: data.user,
	    reciever: data.reciever,
	    text: data.message
	});
	socket.emit('send:message', {
	    sender: data.user,
	    reciever: data.reciever,
	    text: data.message
	});
    });

};
