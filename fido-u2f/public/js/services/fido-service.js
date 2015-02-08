(function() {
    'use strict';

    /**
     * FIDO U2F Service.
     */
    angular
        .module('fidoApp')
        .factory('FidoService', ['$window', '$q', function($window, $q) {
            /**
             * Checks if FIDO U2F is supported in the current browser.
             *
             * @returns {boolean} True if FIDO U2F is supported.
             */
            function isSupported() {
                return $window['u2f'] !== undefined;
            }

            /**
             * Performs a FIDO U2F V2 Registration using the supplied values.
             *
             * @param   {string} challenge  A random registration challenge.
             * @param   {string} appId      The application identifier.
             *
             * @returns {ng.IPromise}       A promise that is resolved with the registration result on completion.
             */
            function register(challenge, appId) {
                var deferred = $q.defer();

                $window['u2f'].register([{
                    version:    'U2F_V2',
                    challenge:  challenge,
                    appId:      appId
                }], [], function (data) {
                    if (data.errorCode) {
                        // This is an Error object, so reject the promise with it.
                        deferred.reject(data);
                    } else {
                        // This isn't an Error object, so resolve the promise with it.
                        deferred.resolve(data);
                    }
                });

                return deferred.promise;
            }

            return {
                isSupported:    isSupported,
                register:       register
            };
        }]);
})();
