
const Lirc = require('../index');
const Mitm = require('mitm');
const chai = require('chai');
const promiseBuiltin = Promise;
const promisePolyfill = require('promise-polyfill');
const sinon = require('sinon');

const should = chai.should();

chai.use(require('sinon-chai'));
chai.use(require('chai-as-promised'));

describe('Lirc', () => {
    let lirc;
    let mitm;
    let socket;
    let clock;

    beforeEach(() => {
        global.Promise = promisePolyfill;
        clock = sinon.useFakeTimers();
        mitm = Mitm();
        mitm.once('connection', _socket => {
            socket = _socket;
            socket.setEncoding('utf8');
        });

        lirc = new Lirc({ 
            autoconnect: false,
        });
    });

    afterEach(() => {
        lirc.disconnect();
        mitm.disable();
        clock.restore();
        global.Promise = promiseBuiltin;
    });

    describe('#_handleQueue()', () => {
        it('should do nothing while disconnected', () => {
            lirc._queue.push(() => Promise.resolve());
            lirc._handleQueue();
            should.not.exist(lirc._queueTimeout);
        });

        it('should set #_queueTimeout to the current timeout timer', () => {
            lirc._queue.push(sinon.stub().resolves());
            should.not.exist(lirc._queueTimeout);
            lirc._connected = true;
            lirc._handleQueue();
            clock.next();
            should.exist(lirc._queueTimeout);
        });

        it('should stop when #_queue is empty', () => {
            lirc._queue.push(sinon.stub().resolves());
            lirc._connected = true;
            lirc._handleQueue();
            clock.next();
            should.exist(lirc._queueTimeout);
            clock.tick(300);
            should.not.exist(lirc._queueTimeout);
        });

        it('should call each function in #_queue', () => {
            let callback1 = sinon.stub().resolves();
            let callback2 = sinon.stub().resolves();
            lirc._queue.push(callback1);
            lirc._queue.push(callback2);
            lirc._connected = true;
            lirc._handleQueue();
            clock.next();
            callback1.should.have.been.called;
            callback2.should.not.have.been.called;
            clock.runAll();
            callback2.should.have.been.called;
            should.not.exist(lirc._queueTimeout);
        });
    });


    describe('#_read()', () => {
        it('should handle standard messages', done => {
            lirc.once('message', (err, data) => {
                should.not.exist(err);
                data.should.deep.equal(['0.9.4c']);
                done();
            });

            lirc._read(`
                BEGIN
                version
                SUCCESS
                DATA
                1
                0.9.4c
                END
            `.replace(/^ +/gm, ''));
        });

        it('should handle error messages', done => {
            lirc.once('message', (err, data) => {
                err.should.equal('bad send packet');
                data.should.deep.equal(['bad send packet']);
                done();
            });

            lirc._read(`
                BEGIN

                ERROR
                DATA
                1
                bad send packet
                END
            `.replace(/^ +/gm, ''));
        });

        it('should handle received button presses');
    });

    describe('#_send()', () => {
        it('should write data to socket', done => {
            lirc.connect().then(() => {
                lirc._send('test');

                socket.once('data', string => {
                    string.should.equal('test\n');
                    done();
                });
            });

            clock.runAll();
        });

        it('should call callback with data if supplied');
        it('should resolve with data');
    });

    describe('#send()', () => {
        it('should call #_handleQueue() on next tick', () => {
            lirc._handleQueue = sinon.spy(lirc, '_handleQueue');
            lirc.send();
            clock.next();
            lirc._handleQueue.should.have.been.called;
        });

        it('should append a function to the #_queue when when called', () => {
            lirc._send = sinon.stub(lirc, '_send').resolves();
            lirc._connected = true;
            lirc._queue.length.should.equal(0);
            lirc.send();
            lirc._queue.length.should.equal(1);
            lirc._queue[0].should.be.a('function');
        });

        it('should create a function that calls #_send() with expected args', () => {
            lirc._send = sinon.stub(lirc, '_send').resolves();
            lirc._connected = true;
            lirc.send('test', 'one');
            lirc._queue[0]();
            lirc._send.should.have.been.calledWith('test one');
        });

        it('should call callback with data if supplied');
        it('should resolve with data');
    });

    describe('#sendOnce()', () => {
        it('should call #send() with expected args', () => {
            lirc.send = sinon.spy(lirc, 'send');
            lirc.sendOnce('tv', 'power');
            lirc.send.should.have.been.calledWith('send_once', 'tv', 'power');
        });

        it('should call callback with data if supplied');
        it('should resolve with data');
    });

    describe('#sendStart()', () => {
        it('should call #send() with expected args', () => {
            lirc.send = sinon.spy(lirc, 'send');
            lirc.sendStart('tv', 'power');
            lirc.send.should.have.been.calledWith('send_start', 'tv', 'power');
        });

        it('should call callback with data if supplied');
        it('should resolve with data');
    });

    describe('#sendStop()', () => {
        it('should call #send() with expected args', () => {
            lirc.send = sinon.spy(lirc, 'send');
            lirc.sendStop('tv', 'power');
            lirc.send.should.have.been.calledWith('send_stop', 'tv', 'power');
        });

        it('should call callback with data if supplied');
        it('should resolve with data');
    });

    describe('#list()', () => {
        it('should call #send() with expected args', () => {
            lirc.send = sinon.spy(lirc, 'send');
            lirc.list('tv');
            lirc.send.should.have.been.calledWith('list', 'tv');
        });

        it('should call callback with data if supplied');
        it('should resolve with data');
    });

    describe('#version()', () => {
        it('should call #send() with expected args', () => {
            lirc.send = sinon.spy(lirc, 'send');
            lirc.version();
            lirc.send.should.have.been.calledWith('version');
        });

        it('should call callback with data if supplied');
        it('should resolve with data');
    });

    describe('#connect()', () => {
        it('should set #_connecting to true', () => {
            lirc._connecting.should.equal(false);
            lirc.connect();
            lirc._connecting.should.equal(true);
        });

        it('should set #_connected to true upon connection', () => {
            lirc._connected.should.equal(false);
            lirc.connect();
            clock.runAll();
            lirc._connected.should.equal(true);
        });

        it('should establish a connection', () => {
            let callback = sinon.spy();
            mitm.on('connection', callback);
            lirc.connect();
            clock.runAll();
            callback.should.have.been.called;
        });

        it('should call callback when connected', () => {
            let callback = sinon.spy();
            lirc.connect(callback);
            clock.runAll();
            callback.should.have.been.called;
        });
    });

    describe('#disconnect()', () => {
        it('should clean up after itself', () => {
            let end = sinon.spy();
            let removeAllListeners = sinon.spy();

            lirc._connected = true;
            lirc._connecting = true;
            lirc._readbuffer.push('foo', 'bar');
            lirc._socket = { end, removeAllListeners };

            lirc.disconnect();

            lirc._connected.should.equal(false);
            lirc._connecting.should.equal(false);
            lirc._readbuffer.should.deep.equal([]);
            should.not.exist(lirc._socket);

            end.should.have.been.called;
            removeAllListeners.should.have.been.calledWith('close');
        });

        it('should resolve when disconnected', () => {
            lirc.disconnect().should.be.fulfilled;
            clock.runAll();
        });

        it('should call callback when disconnected', done => {
            lirc.disconnect(done);
        });
    });
});
