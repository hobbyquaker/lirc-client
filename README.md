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

<a name="Lirc"></a>

## Lirc
**Kind**: global class  

* [Lirc](#Lirc)
    * [new module.exports.Lirc([config])](#new_Lirc_new)
    * [.send(command)](#Lirc+send) ⇒ <code>Promise.&lt;array.&lt;string&gt;&gt;</code>
    * [.sendOnce(remote, button, [repeat])](#Lirc+sendOnce) ⇒ <code>Promise.&lt;array.&lt;string&gt;&gt;</code>
    * [.sendStart(remote, button)](#Lirc+sendStart) ⇒ <code>Promise.&lt;array.&lt;string&gt;&gt;</code>
    * [.sendStop(remote, button)](#Lirc+sendStop) ⇒ <code>Promise.&lt;array.&lt;string&gt;&gt;</code>
    * [.list([remote])](#Lirc+list) ⇒ <code>Promise.&lt;array.&lt;string&gt;&gt;</code>
    * [.version()](#Lirc+version) ⇒ <code>Promise.&lt;array.&lt;string&gt;&gt;</code>
    * [.connect()](#Lirc+connect) ⇒ <code>Promise</code>
    * [.disconnect()](#Lirc+disconnect) ⇒ <code>Promise</code>

<a name="new_Lirc_new"></a>

### new module.exports.Lirc([config])

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| [config] | <code>object</code> |  | Configuration object. |
| [config.autoconnect] | <code>boolean</code> | <code>true</code> | Automatically connect. |
| [config.host] | <code>string</code> | <code>&quot;&#x27;127.0.0.1&#x27;&quot;</code> | Host running LIRC. |
| [config.port] | <code>number</code> | <code>8765</code> | Port of running LIRC daemon. |
| [config.path] | <code>string</code> |  | Path to LIRC socket. |
| [config.reconnect] | <code>boolean</code> | <code>true</code> | Automatically reconnect. |
| [config.reconnect_delay] | <code>number</code> | <code>5000</code> | Delay when reconnecting. |

<a name="Lirc+send"></a>

### lirc.send(command) ⇒ <code>Promise.&lt;array.&lt;string&gt;&gt;</code>
Send a command.

**Kind**: instance method of [<code>Lirc</code>](#Lirc)  
**Returns**: <code>Promise.&lt;array.&lt;string&gt;&gt;</code> - Resulting response from LIRC daemon.  
**See**: available commands http://www.lirc.org/html/lircd.html  

| Param | Type | Description |
| --- | --- | --- |
| command | <code>string</code> | Command to send, or individual parameters. |
| [...args] | <code>string</code> | optional parameters. |

<a name="Lirc+sendOnce"></a>

### lirc.sendOnce(remote, button, [repeat]) ⇒ <code>Promise.&lt;array.&lt;string&gt;&gt;</code>
Tell LIRC to emit a button press.

**Kind**: instance method of [<code>Lirc</code>](#Lirc)  
**Returns**: <code>Promise.&lt;array.&lt;string&gt;&gt;</code> - Response from LIRC.  

| Param | Type | Description |
| --- | --- | --- |
| remote | <code>string</code> | Remote name. |
| button | <code>string</code> | Button name. |
| [repeat] | <code>number</code> | Number of times to repeat. |

<a name="Lirc+sendStart"></a>

### lirc.sendStart(remote, button) ⇒ <code>Promise.&lt;array.&lt;string&gt;&gt;</code>
Tell LIRC to start emitting button presses.

**Kind**: instance method of [<code>Lirc</code>](#Lirc)  
**Returns**: <code>Promise.&lt;array.&lt;string&gt;&gt;</code> - Response from LIRC.  

| Param | Type | Description |
| --- | --- | --- |
| remote | <code>string</code> | Remote name. |
| button | <code>string</code> | Button name. |

<a name="Lirc+sendStop"></a>

### lirc.sendStop(remote, button) ⇒ <code>Promise.&lt;array.&lt;string&gt;&gt;</code>
Tell LIRC to stop emitting a button press.

**Kind**: instance method of [<code>Lirc</code>](#Lirc)  
**Returns**: <code>Promise.&lt;array.&lt;string&gt;&gt;</code> - Response from LIRC.  

| Param | Type | Description |
| --- | --- | --- |
| remote | <code>string</code> | Remote name. |
| button | <code>string</code> | Button name. |

<a name="Lirc+list"></a>

### lirc.list([remote]) ⇒ <code>Promise.&lt;array.&lt;string&gt;&gt;</code>
If a remote is supplied, list available buttons for remote, otherwise
return list of remotes.

**Kind**: instance method of [<code>Lirc</code>](#Lirc)  
**Returns**: <code>Promise.&lt;array.&lt;string&gt;&gt;</code> - Response from LIRC.  

| Param | Type | Description |
| --- | --- | --- |
| [remote] | <code>string</code> | Remote name. |

<a name="Lirc+version"></a>

### lirc.version() ⇒ <code>Promise.&lt;array.&lt;string&gt;&gt;</code>
Get LIRC version from server.

**Kind**: instance method of [<code>Lirc</code>](#Lirc)  
**Returns**: <code>Promise.&lt;array.&lt;string&gt;&gt;</code> - Response from LIRC.  
<a name="Lirc+connect"></a>

### lirc.connect() ⇒ <code>Promise</code>
Connect to a running LIRC daemon.

**Kind**: instance method of [<code>Lirc</code>](#Lirc)  
**Returns**: <code>Promise</code> - Resolves upon connection to server.  
<a name="Lirc+disconnect"></a>

### lirc.disconnect() ⇒ <code>Promise</code>
Disconnect from LIRC daemon and clean up socket.

**Kind**: instance method of [<code>Lirc</code>](#Lirc)  
**Returns**: <code>Promise</code> - Resolves upon disconnect.  


## License

MIT © [Sebastian Raff](https://hobbyquaker.github.io)

[mit-badge]: https://img.shields.io/badge/License-MIT-blue.svg?style=flat
[mit-url]: LICENSE
