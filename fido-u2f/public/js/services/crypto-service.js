(function() {
    'use strict';

    /**
     * Web Crypto API Service.
     */
    angular
        .module('fidoApp')
        .factory('CryptoService', ['$window', '$q', function($window, $q) {
            /**
             * Checks if Web Crypto is supported in the current browser.
             *
             * @returns {boolean} True if Web Crypto is supported.
             */
            function isSupported() {
                return $window['crypto'] !== undefined && $window['crypto']['getRandomValues'] !== undefined;
            }

            /**
             * Converts an array to a DOM string.
             *
             * @param   {Uint8Array} array The array to convert.
             *
             * @returns {string}            The resulting string.
             *
             * @see {@link http://stackoverflow.com/questions/12710001/how-to-convert-uint8-array-to-base64-encoded-string|Source}
             *
             * @private
             */
            function _arrayToString(array) {
                var CHUNK_SZ = 0x8000,
                    c = [];

                for (var i = 0; i < array.length; i += CHUNK_SZ) {
                    c.push(String.fromCharCode.apply(null, array.subarray(i, i + CHUNK_SZ)));
                }
                return c.join("");
            }

            /**
             * Generates a Base64-encoded random challenge with the specified length.
             *
             * @param   {number} length The length of the challenge to generate.
             *
             * @returns {ng.IPromise}   A promise that is resolved with the random challenge on completion.
             */
            function generateChallenge(length) {
                var array       = new Uint8Array(length),
                    deferred    = $q.defer();

                $window['crypto']['getRandomValues'](array);

                deferred.resolve($window.btoa(_arrayToString(array)));

                return deferred.promise;
            }

            return {
                isSupported:        isSupported,
                generateChallenge:  generateChallenge
            };
        }]);
})();
