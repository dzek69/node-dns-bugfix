# node-dns-bugfix

Patch for NodeJS bug where calling `dns.setServers` during `dns.resolve*` being in progress causes Node process to crash
with: 
```
node: ../deps/cares/src/ares_destroy.c:102: ares__destroy_servers_state: Assertion `ares__is_list_empty(&server->queries_to_server)' failed.
Aborted (core dumped)
```

Some links:
- [dns: occasionally crashing in resolve4 and setServers](https://github.com/nodejs/node/issues/14734)
- [dns.setServers() crash](https://github.com/nodejs/node/issues/894)
- [Traceback with DNS & IPv6](https://github.com/nodejs/node/issues/3106)

## Compatibility

### You don't need that for
- Node 10+
- Node 9.3.0+ (but you need it for Node < 9.3.0)
- Node 8.10.0+ (but you need it for Node < 8.10.0)

(you will be warned if imported in your code in these versions)

### Tested to work (fixes the bug) with
- Node 6.14.3
- Node 9.2.1

### Does not work with
Issue seems to be even bigger in these versions.
- Node 4.9.1
- Node 5.12.0
- Node 7.10.1

## How it works

The fix monkey patches `setServers` and `resolve` functions of `dns` module. This makes new `setServer` calls to wait
for all `resolve` to finish. After last `resolve` is done it updates the servers settings if `setServers` was called 
while resolving.

**Note that this causes differences between real Node bugfix and this monkey patch behavior**:
- Monkey patched version will not update dns servers until all resolved are completed. If you call `resolve` always
before last one finishes - dns servers may never be updated and Node will be resolving with old servers forever. This is
**VERY** edge-case, but I want you to know that it is possible.
- Real patched Node versions (9.3.0 and up) should use newest servers set with every resolve.


## Usage
Do this as soon as possible in your code:
```javascript
require("node-dns-bugfix");
```

You will be warned with console if used with Node version that has this fixed already. No patching will occur.

## ES5

For Node v6 you probably need to import ES5 version of the code: 
```javascript
require("node-dns-bugfix/dist");
```

## Test

Test files are contained in `test` directory.
Run `should-crash.js` on broken Node version to see process crash.
Run `should-not-crash.js` on broken Node version to see how this fix prevents the crash.

On fixed Node versions (8.10+, 9.3+) both scripts won't cause crash, but `should-not-crash` will trigger a warning.

## To do

- Make it work with unsupported Node versions? At least for v.4+.

## License

MIT
