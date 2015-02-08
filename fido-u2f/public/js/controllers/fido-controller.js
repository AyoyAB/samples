(function() {
    'use strict';

    /**
     * The main demo application controller.
     */
    angular
        .module('fidoApp')
        .controller('FidoController', [
            'CryptoService', 'FidoService', 'StorageService', function(CryptoService, FidoService, StorageService) {
                /**
                 * Generates the FIDO U2F random registration challenge.
                 *
                 * @returns {ng.IPromise} The generated registration challenge.
                 *
                 * @private
                 */
                function _generateRegistrationChallenge() {
                    return CryptoService.generateChallenge(32);
                }

                var vm = this;

                /**
                 * Checks if the Web Crypto API is supported by the browser.
                 *
                 * @returns {boolean} True if Web Crypto API is supported.
                 */
                vm.isWebCryptoSupported = function() {
                    return CryptoService.isSupported();
                };

                /**
                 * Checks if the Web Storage API is supported by the browser.
                 *
                 * @returns {boolean} True if Web Storage API is supported.
                 */
                vm.isWebStorageSupported = function() {
                    return StorageService.isSupported();
                };

                /**
                 * Checks if the FIDO U2F API is supported by the browser.
                 *
                 * @returns {boolean} True if FIDO U2F API is supported.
                 */
                vm.isFidoU2FSupported = function() {
                    return FidoService.isSupported();
                };

                /**
                 * Checks if all pre-requisites are met.
                 *
                 * @returns {boolean} True if all pre-requisites are met.
                 */
                vm.isAllSet = function() {
                   return vm.isWebCryptoSupported() && vm.isWebStorageSupported() && vm.isFidoU2FSupported();
                };

                /**
                 * Performs FIDO U2F registration.
                 *
                 * @param {string} appId The application identifier.
                 */
                vm.register = function(appId) {
                    _generateRegistrationChallenge()
                        .then(function (challenge) {
                            FidoService.register(challenge, appId)
                                .then(function (result) {
                                    // TODO: Display and store result.
                                }, function (error) {
                                    // TODO: Display error.
                                });
                    });
                };
        }]);
})();
