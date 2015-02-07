(function() {
    'use strict';

    angular
        .module('fidoApp')
        .factory('FidoService', ['$window', '$q', function($window, $q) {
            function isFidoU2FAddOnInstalled() {
                return $window['u2f'] !== undefined;
            }

            function register(challenge, appId) {
                var deferred = $q.defer();

                $window['u2f'].register([{
                    version:    'U2F_V2',
                    challenge:  challenge,
                    appId:      appId
                }], [], function (data) {
                    if (data.errorCode) {
                        // This is an Error object, so reject the promise with it.
                        $q.reject(data);
                    } else {
                        // This isn't an Error object, so resolve the promise with it.
                        $q.resolve(data);
                    }
                });

                return deferred.promise;
            }

            return {
                isFidoU2FAddOnInstalled: isFidoU2FAddOnInstalled,
                register:                register
            };
        }]);
})();
