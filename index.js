var net =           require('net');
var util =          require('util');
var EventEmitter =  require('events').EventEmitter;

var Lirc = function (config) {

    if (!(this instanceof Lirc)) return new Lirc(config);

    var that = this;

    config = config || {};
    if(!config.host && !config.path) {
        config.host = '127.0.0.1';
    }
    if(config.host) {
        config.port = config.port || 8765;
    }
    config.reconnect = config.reconnect || 5000;

    var client;
    var lircConnected;
    var closing;

    var callbacks = {};
    var timeouts = {};

    var incoming = [];
    var isIncoming;

    var delayed = [];

    this.cmd = function (/* cmd, variable number of cmd arguments, optional callback*/) {

        var args = Array.prototype.slice.call(arguments);
        var callback;

        if (Object.keys(timeouts).length) {
            delayed.push(args);
            return;
        }

        if (args.length > 1 && typeof args[args.length - 1] === 'function') {
            callback = args.pop();
        }

        if (!lircConnected) {
            if (callback) callback('not connected');
            return;
        }

        var data = args.join(' ');

        timeouts[data] = setTimeout(function () {
            that.emit('error', 'response timeout: ' + data);
            if (callback) delete callbacks[data];
            delete timeouts[data];
        }, 2500);

        client.write(data + '\n', function () {
            if (callback) callbacks[data] = callback;
        });

    };

    this.close = function() {
        closing = true;
        client.end();
    };

    function parseResponse(data) {

        if (data[0] !== 'BEGIN' || data[data.length - 1] !== 'END') {
            return;
        }

        var cmd = data[1];

        clearTimeout(timeouts[cmd]);
        delete timeouts[cmd];

        var res;
        var payload;

        if (data.length > 3) {
            res = data[2];
        } else {
            that.emit(cmd); // this is used by LIRC for SIGHUP Broadcast
            return;
        }

        if (callbacks[cmd]) {

            if (data[3] === 'DATA') {
                payload = data.slice(5, -1);
            }

            if (res === 'SUCCESS') {
                callbacks[cmd](null, payload);
            } else if (res === 'ERROR') {
                callbacks[cmd](payload[0]);
            }

            delete callbacks[cmd];
        }

        if (delayed.length) {
            that.cmd.apply(that, delayed.shift());
        }

    }

    function reConnect() {
        if(closing) { return; }
        setTimeout(lircConnect, config.reconnect);
    }

    function lircConnect() {
        if (!lircConnected) {

            client = net.connect(config, function() {
                lircConnected = true;
                that.emit('connect');
            });

            client.on('error', function (data) {
                that.emit('error', data.toString());
            });

            client.on('end', function () {
                if(!closing) {
                    that.emit('error', 'end');
                }
                lircConnected = false;
                reConnect();
            });

            client.on('timeout', function () {
                that.emit('error', 'timeout');
                lircConnected = false;
                reConnect();
            });

            client.on('close', function () {
                lircConnected = false;
                that.emit('disconnect');
                reConnect();
            });

            client.on('data', function (data) {
                data = data.toString();
                var lines = data.split('\n');
                if (lines[lines.length - 1] === '') lines.pop();

                if (data.match(/^[0-9a-f]{16} /)) {
                    // Broadcast received

                    for (var i = 0; i < lines.length; i++) {
                        var parts = lines[i].split(' ');
                        that.emit('receive', parts[3], parts[2], parseInt(parts[1], 10));
                    }

                } else if (data.match(/^BEGIN/)) {

                    if (lines[lines.length - 1] === '') lines.pop();

                    incoming = lines;

                    if (lines[lines.length - 1] === 'END') {
                        parseResponse(incoming);
                    } else {
                        isIncoming = true;
                    }

                } else if (isIncoming) {

                    incoming = incoming.concat(lines);

                    if (lines[lines.length - 1] === 'END') {
                        isIncoming = false;
                        parseResponse(incoming);
                    }

                }
            });
        }
    }

    lircConnect();

};

util.inherits(Lirc, EventEmitter);
module.exports = Lirc;
