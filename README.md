# lirc-client

Node.js module to connect to a [LIRC](http://www.lirc.org/) daemon.

## Usage

````npm install lirc-client````

```Javascript

var lirc = require('lirc-client')({
  host: '127.0.0.1',
  port: 8765
});

// or

var lirc = require('lirc-client')({
  path: '/var/run/lirc/lircd'
});

lirc.on('connect', function () {
    lirc.cmd('VERSION', function (err, res) {
        console.log('LIRC Version', res);
    });

    lirc.cmd('SEND_ONCE', 'Remote1', 'Key1', function (err) {
        if (err) console.log(err);
    });
});

lirc.on('receive', function (remote, button, repeat) {
    console.log('button ' + button + ' on remote ' + remote + ' was pressed!');
});
```



## Methods

#### cmd( cmd, [ argument, ... ], [ callback(err, res) ] )

see available commands here: http://www.lirc.org/html/lircd.html

#### close()

## Options

#### host

Default: '127.0.0.1'

#### port

Default: 8765

#### reconnect

Pause in milliseconds before trying to reconnect to LIRC

Default: 5000

## Events

#### receive(remote, button, repeat)

#### error(message)

#### connect

#### disconnect

## License

MIT © [Sebastian Raff](https://hobbyquaker.github.io)

