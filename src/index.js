"use strict";

/* eslint-disable func-names,no-magic-numbers */

const version = process.version.substring(1).split(".");
const major = Number(version[0]);
const minor = Number(version[1]);

const patch = () => {
    const isPatched = major >= 10;
    const isPatched9 = major === 9 && minor >= 3;
    const isPatched8 = major === 8 && minor >= 10;
    if (isPatched || isPatched9 || isPatched8) {
        console.warn(
            "Warning: `node-dns-bugfix` module was required but it is not needed on Node " + process.version
            + ". Please refer to documentation to learn more.",
        );
        return;
    }

    const dns = require("dns");

    let resolvesInProgress = 0,
        newServers = null;

    // Called when any resolve ends
    const notifyResolveEnd = function() {
        if (resolvesInProgress || !newServers) {
            // do nothing if still resolving something or no setServers called in meantime
            return;
        }
        // update servers settings
        dns.setServers(newServers);
        newServers = null; // clear "pending" settings
    };

    // Loop patch resolve* methods
    Object.keys(dns).forEach((key) => {
        if (!key.startsWith("resolve")) {
            return;
        }

        const originalResolve = dns[key];
        dns[key] = function(...args) {
            resolvesInProgress++;

            // resolve methods has various arguments count, but required callback is always last
            const callback = args.pop();

            // call original resolve with original arguments prepending the callback and injected callback
            originalResolve.apply(this, [...args, function(...callbackArgs) {
                resolvesInProgress--;
                notifyResolveEnd(); // notify that resolve ended, update dns if needed before calling original callback
                callback.apply(this, callbackArgs); // eslint-disable-line no-invalid-this
            }]);
        };
    });

    // Patch setServers
    const originalSetServers = dns.setServers;
    dns.setServers = function(servers) {
        if (!resolvesInProgress) {
            // just set servers if nothing in progress
            originalSetServers(servers);
            return;
        }

        // if something is in progress just store the value for later set
        newServers = servers;
    };
};

patch();
