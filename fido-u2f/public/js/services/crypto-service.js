'use strict';

angular
    .module('fidoApp')
    .factory('CryptoService', ['$window', function($window) {
        function isWebCryptoSupported() {
            return $window['crypto'] !== undefined && $window['crypto']['getRandomValues'] !== undefined;
        }

        // From: http://stackoverflow.com/questions/12710001/how-to-convert-uint8-array-to-base64-encoded-string
        function arrayToString(array) {
            var CHUNK_SZ = 0x8000,
                c = [];

            for (var i = 0; i < array.length; i += CHUNK_SZ) {
                c.push(String.fromCharCode.apply(null, array.subarray(i, i + CHUNK_SZ)));
            }
            return c.join("");
        }

        function generateChallenge() {
            var array = new Uint32Array(32);

            $window['crypto']['getRandomValues'](array);

            return $window.atob(arrayToString(array));
        }

        return {
            isWebCryptoSupported:   isWebCryptoSupported,
            generateChallenge:      generateChallenge
        };
    }]);
