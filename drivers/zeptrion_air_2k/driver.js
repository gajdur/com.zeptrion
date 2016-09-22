//"use strict";

var net = require('net');
var tempIP = '';
var client;
var dropmenu = 0;
//var Promise = require("bluebird");
//var xml2js = Promise.promisifyAll(require("xml2js"));

//var request = Promise.promisify(require("request"));
//Promise.promisifyAll(request);
var request = require('request');
var hostIP = Homey.manager('settings').get( 'hostIP' );


module.exports.pair = function (socket) {
	// socket is a direct channel to the front-end

	// this method is run when Homey.emit('list_devices') is run on the front-end
	// which happens when you use the template `list_devices`
	socket.on('list_devices', function (data, callback) {

		Homey.log("Zeptrion app - list_devices tempIP is " + tempIP);

		//Execute !xECNQSTN to get type number as name?
		var devices = [{
			data: {
				id			: tempIP,
				ipaddress 	: tempIP
			}
		}];

		callback (null, devices);

	});

	// this is called when the user presses save settings button in start.html
	socket.on('get_devices', function (data, callback) {

		// Set passed pair settings in variables
		tempIP = data.ipaddress;
		Homey.manager('settings').set( 'hostIP', data.ipaddress);
		hostIP = tempIP;
		Homey.log ( "Zeptrion app - got get_devices from front-end, tempIP =" + hostIP );

		// assume IP is OK and continue
		socket.emit ('continue', null);

	});

	socket.on('disconnect', function(){
		Homey.log("Yamaha receiver app - User aborted pairing, or pairing is finished");
	})
}

// flow action handlers
Homey.manager('flow').on('action.zeptrion_cmd', function (callback, args) {
	var device = args.device;
	var channel = args.channel;
	var arguments = args.arguments;
	SendPOSTForm ();
	callback(null, true);
});

function SendPOSTForm {
	Homey.log ("Zeptrion app - sending " + arguments + " to " + hostIP);
    request.post({
        method: 'POST',
        url: 'http://'+device+'/zrap/chctrl/'+channel'
        body: 'cmd='+arguments'
    })
	Homey.log ('callback true');
}
