
const Lirc = require('../index');
const Mitm = require('mitm');
const sinon = require('sinon');

const should = require('should');
require('should-sinon');

describe('Lirc', () => {
    let lirc;
    let mitm;
    let socket;

    beforeEach(() => {
        mitm = Mitm();
        lirc = new Lirc({ autoconnect: false });
    });

    afterEach(() => {
        if (lirc._connected || lirc._connecting) {
            lirc.disconnect();
        }

        mitm.disable();
    });

    describe('#connect()', () => {
        it('should set #_connecting to true', () => {
            lirc.connect();
            lirc._connecting.should.equal(true);
        });

        it('should establish a connection', () => {
            let callback = sinon.spy();
            mitm.on('connection', callback);

            return lirc.connect().then(() => {
                callback.should.have.been.called();
            });
        });

        it('should resolve when connected');
        it('should call callback when connected');
    });

    describe('#disconnect()', () => {
        it('should clean up connections');
        it('should resolve when disconnected');
        it('should call callback when disconnected');
    });

    describe('#send()', () => {
        xit('should call #_send with expected args', () => {
            lirc._send = sinon.spy();
            lirc.send('send_once', 'remote', 'button');
            lirc._send.should.have.been.called();
        });

        it('should call callback with data if supplied');
        it('should resolve with data');
    });

    describe('#sendOnce()', () => {
        it('should call #_send with expected args');
        it('should call callback with data if supplied');
        it('should resolve with data');
    });

    describe('#sendStart()', () => {
        it('should call #_send with expected args');
        it('should call callback with data if supplied');
        it('should resolve with data');
    });

    describe('#sendStop()', () => {
        it('should call #_send with expected args');
        it('should call callback with data if supplied');
        it('should resolve with data');
    });

    describe('#list()', () => {
        it('should call #_send with expected args');
        it('should call callback with data if supplied');
        it('should resolve with data');
    });

    describe('#version()', () => {
        it('should call #_send with expected args');
        it('should call callback with data if supplied');
        it('should resolve with data');
    });
});
