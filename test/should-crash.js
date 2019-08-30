"use strict";

var dns = require("dns");

var cb = function() {
    console.info(arguments); // eslint-disable-line prefer-rest-params
};
dns.setServers(["8.8.8.8"]);
dns.resolve4("google.com", cb);
dns.setServers(["8.8.4.4"]);
