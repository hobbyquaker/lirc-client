# lirc-client

[![npm version](https://badge.fury.io/js/lirc-client.svg)](https://badge.fury.io/js/lirc-client)
[![License][mit-badge]][mit-url]

Node.js module to connect to a [LIRC](http://www.lirc.org/) daemon.

**BREAKING CHANGE in v2.0 - Promises instead of Callbacks**

If you prefer using callbacks you can still `npm install lirc-client@1.0.0`.


## Usage

````npm install lirc-client````

```Javascript

var lirc = require('lirc-client')({
  host: '127.0.0.1',
  port: 8765
});

lirc.on('connect', () => {
    lirc.send('VERSION').then(res => {
        console.log('LIRC Version', res);
    });

    lirc.sendOnce('Remote1', 'Key1').catch(error => {
        if (error) console.log(error);
    });
});

lirc.on('receive', function (remote, button, repeat) {
    console.log('button ' + button + ' on remote ' + remote + ' was pressed!');
});
```

you can also connect to a unix domain socket via path option:
```Javascript
var lirc = require('lirc-client')({
  path: '/var/run/lirc/lircd'
});
```

## API
