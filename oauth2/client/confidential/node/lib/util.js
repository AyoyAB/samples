(function () {
    "use strict";

    var crypto  = require('crypto'),
        nconf   = require('nconf');

    /**
     * Creates the absolute Redirect Endpoint URI for the specified path.
     *
     * @param {string} path The path to use.
     *
     * @returns {string} The absolute Redirect Endpoint URI.
     */
    exports.createRedirectEndpointUri = function (path) {
        return 'http://' + nconf.get('hostname') + ':' + nconf.get('port') + path;
    };

    /**
     * Generates random state.
     *
     * @returns {string} the generated random state.
     */
    exports.generateState = function () {
        return crypto.randomBytes(16).toString('hex');
    };
}());
