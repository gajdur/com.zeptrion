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
		Homey.log("Zeptrion app - User aborted pairing, or pairing is finished");
	});
};

// these are the methods that respond to get/set calls from Homey
// for example when a user pressed a button
module.exports.capabilities = {};
module.exports.capabilities.onoff = {};
module.exports.capabilities.onoff.get = function( device_data, callback ) {
    var device = getDeviceByData( device_data );
    if( device instanceof Error ) return callback( device );
    return callback( null, device.state.onoff );
}
module.exports.capabilities.onoff.set = function( device_data, onoff, callback ) {
    var device = getDeviceByData( device_data );
    if( device instanceof Error ) return callback( device );
    device.state.onoff = onoff;
    // here you would use a wireless technology to actually turn the device on or off
    // also emit the new value to realtime
    // this produced Insights logs and triggers Flows
    self.realtime( device_data, 'onoff', device.state.onoff)
    return callback( null, device.state.onoff );
}

// a helper method to get a device from the devices list by it's device_data object
function getDeviceByData( device_data ) {
    var device = devices[ device_data.id ];
    if( typeof device === 'undefined' ) {
        return new Error("invalid_device");
    } else {
        return device;
    }
}

// a helper method to add a device to the devices list
function initDevice( device_data ) {
    devices[ device_data.id ] = {};
    devices[ device_data.id ].state = { onoff: true };
    devices[ device_data.id ].data = device_data;
}

// flow action handlers
Homey.manager('flow').on('action.zeptrion_cmd', function (callback, args) {
	var device = args.device;
	var channel = args.channel;
	var argument = args.argument;
	request.post({
        method: 'POST',
        uri: 'http://'+device+'/zrap/chctrl/'+channel,
        body: 'cmd='+argument
    })
	//  SendPOSTForm ();
	callback(null, true);
});
/*
function SendPOSTForm {
	Homey.log ("Zeptrion app - sending " + arguments + " to " + hostIP);
    request.post({
        method: 'POST',
        url: 'http://'+device+'/zrap/chctrl/'+channel'
        body: 'cmd='+argument'
    })
	Homey.log ('callback true');
}
*/
