/* eslint-disable no-unused-vars */

const net = require('net');
const {EventEmitter} = require('events');

module.exports = function (options) {
    return new module.exports.Lirc(options);
};

module.exports.Lirc = class Lirc extends EventEmitter {
  /**
   * @constructor
   * @param {object} [config]  Configuration object.
   * @param {boolean} [config.autoconnect=true]  Automatically connect.
   * @param {string} [config.host='127.0.0.1']  Host running LIRC.
   * @param {number} [config.port=8765]  Port of running LIRC daemon.
   * @param {string} [config.path]  Path to LIRC socket.
   * @param {boolean} [config.reconnect=true]  Automatically reconnect.
   * @param {number} [config.reconnect_delay=5000]  Delay when reconnecting.
   */
    constructor(config = {}) {
        super();

        // Simple default option handler
        const _default = (opt, def) => {
            this[`_${opt}`] = config[opt] === undefined ? def : config[opt];
        };

        _default('autoconnect', true);
        _default('host', '127.0.0.1');
        _default('port', 8765);
        _default('path', '');
        _default('reconnect', true);
        _default('reconnect_delay', 5000);

        this._connected = false;
        this._connecting = false;
        this._queue = [];
        this._readbuffer = [];
        this._socket = null;

        this.on('rawdata', data => this._read(data));

        this.on('error', msg => {
            if (msg === 'end' && this._reconnect) {
                this.disconnect().then(() =>
                  setTimeout(() => this.connect(), this._reconnect_delay)
                );
            }
        });

        // Start handling send queue
        this._handleQueue();

        if (this._autoconnect) {
            this.connect();
        }
    }

  /**
   * @private
   * Handle send queue.
   */
    _handleQueue() {
        const next = () => setTimeout(() => this._handleQueue(), 100);

        if (this._queue.length > 0) {
            this._queue.shift().call().then(next).catch(next);
        } else {
            next();
        }
    }

  /**
   * @private
   * Read and parse received data.
   *
   * @param {string} data  Incoming data from LIRC.
   */
    _read(data) {
        const lines = data.trim().split('\n');

        if (this._readbuffer.length === 0 && (/^[0-9a-f]{16} /).test(data)) {
            // Handle broadcasts
            while (lines.length > 0) {
                this.emit('receive', ...lines.shift().split(' ').reverse());
            }
        } else {
            // Handle messages
            while (lines.length) {
                const line = lines.shift();

                if (line.startsWith('BEGIN')) {
                    this._readbuffer.splice(0, this._readbuffer.length);
                    continue;
                }

                if (line.startsWith('END')) {
                    const [command, response, type, count, ...payload] =
                      this._readbuffer.splice(0, this._readbuffer.length);

                    switch (response) {
                        case 'ERROR':
                            this.emit('message', payload[0], payload);
                            break;

                        default:
                            this.emit('message', null, payload);
                    }

                    continue;
                }

                this._readbuffer.push(line);
            }
        }
    }

  /**
   * @private
   * Send a command.
   *
   * @param {string} command  Command string to send.
   * @return {Promise<array<string>>}  Resulting response from LIRC daemon.
   */
    _send(command) {
        this._socket.write(`${command}\n`);

        return new Promise((resolve, reject) =>
      this.once('message', (err, data) => {
          if (err) {
              reject(err, data);
          } else {
              resolve(data);
          }
      })
    );
    }

  /**
   * Send a command.
   *
   * @param {string} ...args  Command to send, or individual parameters.
   * @return {Promise<array<string>>}  Resulting response from LIRC daemon.
   */
    send(...args) {
        return new Promise((resolve, reject) => {
            this._queue.push(() =>
        this._send(args.join(' ')).then(resolve).catch(reject)
      );
        });
    }

  /**
   * Tell LIRC to emit a button press.
   *
   * @param {string} remote  Remote name.
   * @param {string} button  Button name.
   * @param {number} [repeat]  Number of times to repeat.
   * @return {Promise<array<string>>}  Response from LIRC.
   */
    sendOnce(remote, button, repeat = '') {
        return this.send('send_once', remote, button, repeat);
    }

  /**
   * Tell LIRC to start emitting button presses.
   *
   * @param {string} remote  Remote name.
   * @param {string} button  Button name.
   * @return {Promise<array<string>>}  Response from LIRC.
   */
    sendStart(remote, button) {
        return this.send('send_start', remote, button);
    }

  /**
   * Tell LIRC to stop emitting a button press.
   *
   * @param {string} remote  Remote name.
   * @param {string} button  Button name.
   * @return {Promise<array<string>>}  Response from LIRC.
   */
    sendStop(remote, button) {
        return this.send('send_stop', remote, button);
    }

  /**
   * If a remote is supplied, list available buttons for remote, otherwise
   * return list of remotes.
   *
   * @param {string} [remote]  Remote name.
   * @return {Promise<array<string>>}  Response from LIRC.
   */
    list(remote = '') {
        return this.send('list', remote);
    }

  /**
   * Get LIRC version from server.
   *
   * @return {Promise<array<string>>}  Response from LIRC.
   */
    version() {
        return this.send('version');
    }

  /**
   * Connect to a running LIRC daemon.
   *
   * @return {Promise}  Resolves upon connection to server.
   */
    connect() {
        return new Promise((resolve, reject) => {
            if (this._connected) {
                return resolve();
            }

            if (this._connecting) {
                return this.once('connect', () => resolve());
            }

            const options = this._path ?
        {path: this._path} :
        {host: this._host, port: this._port};

            this._socket = net.connect(options, () => {
                this._socket.removeListener('error', reject);
                this.emit('connect');
                resolve();
            });

            this._socket.once('error', reject);

            this._socket.on('close', () => this.emit('disconnect'));
            this._socket.on('data', data => this.emit('rawdata', data.toString()));
            this._socket.on('end', () => this.emit('error', 'end'));
            this._socket.on('error', data => this.emit('error', data.toString()));
            this._socket.on('timeout', () => this.emit('error', 'timeout'));
        });
    }

  /**
   * Disconnect from LIRC daemon and clean up socket.
   *
   * @return {Promise}  Resolves upon disconnect.
   */
    disconnect() {
        const events = ['close', 'data', 'end', 'error', 'timeout'];
        const socket = this._socket;

        this._connected = false;
        this._connecting = false;
        this._readbuffer.splice(0, this._readbuffer.length);
        this._socket = null;

        Object.keys(events).forEach(ev => {
            socket.removeAllListeners(ev);
        });

        socket.end();

        return Promise.resolve();
    }
};
