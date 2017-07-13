// app/routes.js

var loggedMiddleware  =  require('../middlewares/rutasprotegidas');


/**  @params  app y passport de server.js */
module.exports = function(app, io) {


	/** ==========================================================
		Chat con sockets 
	========================================================== */
	app.get('/seleccionar-sala', loggedMiddleware, function(req, res){ 

	    res.render('elegir-canal.ejs');
	});

	app.post('/sala-llamadas', loggedMiddleware, function(req, res){ 

	    var salaVideoLlamada = req.body.salaVideoLlamada;

	    res.render('client.ejs', {salaVideoLlamada:salaVideoLlamada});
	});
	// app.get('/index.html', function(req, res){ res.sendfile('newclient.html'); });
	// app.get('/client.html', function(req, res){ res.sendfile('newclient.html'); });



	var channels = {};
	var sockets = {};

	 /**
	  * Los usuarios se conectarán al servidor de señalización, después de lo cual emitirán un "join"
	  * Para unirse a un canal en particular. El servidor de señalización realiza un seguimiento de todos los sockets
	  * Que están en un canal, y al unirse enviará eventos 'addPeer' a cada par
	  * De usuarios en un canal. Cuando los clientes reciben el 'addPeer' incluso comenzarán
	  * Configurar una RTCPeerConnection entre sí. Durante este proceso,
	  * Necesidad de retransmitir información ICECandidate entre sí, así como SessionDescription
	  * Información. Después de todo eso, finalmente podrán completar
	  * La conexión de pares y se streaming de audio / video entre sí.
	 */
	io.sockets.on('connection', function (socket) {
	    console.log(" ==================================== \n io.sockets.on(      connection ... \n====================================");


	    socket.channels = {};
	    sockets[socket.id] = socket;

	    console.log("["+ socket.id + "] connection accepted");
	    socket.on('disconnect', function () {
	        console.log(" ==================================== \n socket.on(       disconnect... \n====================================");

	        for (var channel in socket.channels) {
	            part(channel);
	        }
	        console.log("["+ socket.id + "] disconnected");
	        delete sockets[socket.id];
	    });


	    socket.on('join', function (config) {
	        console.log(" ==================================== \n socket.on(       join... \n====================================");


	        console.log("["+ socket.id + "] join ", config);
	        var channel = config.channel;
	        var userdata = config.userdata;

	        if (channel in socket.channels) {
	            console.log("["+ socket.id + "] ERROR: already joined ", channel);
	            return;
	        }

	        if (!(channel in channels)) {
	            channels[channel] = {};
	        }

	        for (id in channels[channel]) {
	            channels[channel][id].emit('addPeer', {'peer_id': socket.id, 'should_create_offer': false});
	            socket.emit('addPeer', {'peer_id': id, 'should_create_offer': true});
	        }

	        channels[channel][socket.id] = socket;
	        socket.channels[channel] = channel;
	    });


	    /**   ==========================================
	        Sacar de la sesion 
	    ==========================================  */
	    function part(channel) {
	        console.log(" ==================================== \n socket.on(       part... \n====================================");


	        console.log("["+ socket.id + "] part ");

	        if (!(channel in socket.channels)) {
	            console.log("["+ socket.id + "] ERROR: not in ", channel);
	            return;
	        }

	        delete socket.channels[channel];
	        delete channels[channel][socket.id];

	        for (id in channels[channel]) {
	            channels[channel][id].emit('removePeer', {'peer_id': socket.id});
	            socket.emit('removePeer', {'peer_id': id});
	        }
	    }

	    socket.on('part', part);

	    socket.on('relayICECandidate', function(config) {
	        console.log(" ==================================== \n socket.on(       relayICECandidate... \n====================================");


	        var peer_id = config.peer_id;
	        var ice_candidate = config.ice_candidate;
	        console.log("["+ socket.id + "] relaying ICE candidate to [" + peer_id + "] ", ice_candidate);

	        if (peer_id in sockets) {
	            sockets[peer_id].emit('iceCandidate', {'peer_id': socket.id, 'ice_candidate': ice_candidate});
	        }
	    });

	    socket.on('relaySessionDescription', function(config) {
	        console.log(" ==================================== \n socket.on(       relaySessionDescription... \n====================================");

	        var peer_id = config.peer_id;
	        var session_description = config.session_description;
	        // console.log("["+ socket.id + "] relaying session description to [" + peer_id + "] ", session_description);

	        if (peer_id in sockets) {
	            sockets[peer_id].emit('sessionDescription', {'peer_id': socket.id, 'session_description': session_description});
	        }
	    });
	});


};

