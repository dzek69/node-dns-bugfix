const dns = require("dns");

const cb = function () {
    console.log(arguments);
};
dns.setServers(["8.8.8.8"]);
dns.resolve4("google.com", cb);
dns.setServers(["8.8.4.4"]);
