# lirc-client

[![npm version](https://badge.fury.io/js/lirc-client.svg)](https://badge.fury.io/js/lirc-client) 
[![Dependency Status](https://img.shields.io/gemnasium/hobbyquaker/lirc-client.svg?maxAge=2592000)](https://gemnasium.com/github.com/hobbyquaker/lirc-client)
[![Build Status](https://travis-ci.org/hobbyquaker/lirc-client.svg?branch=master)](https://travis-ci.org/hobbyquaker/lirc-client)
[![XO code style](https://img.shields.io/badge/code_style-XO-5ed9c7.svg)](https://github.com/sindresorhus/xo)
[![License][mit-badge]][mit-url]


Node.js module to connect to a [LIRC](http://www.lirc.org/) daemon.

**BREAKING CHANGE in v2.0 - Promises instead of Callbacks**

If you prefer using callbacks or want to use Node < 6.12 you can still install the "old" v1.0: 
`npm install lirc-client@1.0.0`. The "old" Readme is here: https://github.com/hobbyquaker/lirc-client/blob/8d6da5a57064b9a59cc170ecae6a86278e006eb6/README.md


## Usage

`$ npm install lirc-client`

```Javascript
const lirc = require('lirc-client')({
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
const lirc = require('lirc-client')({
  path: '/var/run/lirc/lircd'
});
```

## API
