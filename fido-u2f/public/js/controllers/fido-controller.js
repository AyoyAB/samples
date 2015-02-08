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
                 * Controller startup function.
                 *
                 * @private
                 */
                function _activate() {
                    vm.registerRequest.version  = FidoService.getFidoVersion();
                    vm.registerRequest.appId    = vm.APPLICATION_ID;

                    _generateRegistrationChallenge().then(function (challenge) {
                        vm.registerRequest.challenge = challenge;
                    });
                }

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

                /**
                 * Checks if the Web Crypto API is supported by the browser.
                 *
                 * @returns {boolean} True if Web Crypto API is supported.
                 */
                function isWebCryptoSupported() {
                    return CryptoService.isSupported();
                }

                /**
                 * Checks if the Web Storage API is supported by the browser.
                 *
                 * @returns {boolean} True if Web Storage API is supported.
                 */
                function isWebStorageSupported() {
                    return StorageService.isSupported();
                }

                /**
                 * Checks if the FIDO U2F API is supported by the browser.
                 *
                 * @returns {boolean} True if FIDO U2F API is supported.
                 */
                function isFidoU2FSupported() {
                    return FidoService.isSupported();
                }

                /**
                 * Checks if all pre-requisites are met.
                 *
                 * @returns {boolean} True if all pre-requisites are met.
                 */
                function isAllSet() {
                    return vm.isWebCryptoSupported() && vm.isWebStorageSupported() && vm.isFidoU2FSupported();
                }

                /**
                 * Performs FIDO U2F registration.
                 */
                function register() {
                    FidoService.register(vm.registerRequest.challenge, vm.registerRequest.appId)
                        .then(function (result) {
                            // Store the result.
                            vm.registrationResponse = result;

                            // TODO: We'll need to work on our state management.
                            StorageService.setItem('registration-result', result);

                        }, function (error) {
                            // Store the error.
                            vm.registrationError = error;
                        });
                }

                var vm = this;

                vm.isWebCryptoSupported     = isWebCryptoSupported;
                vm.isWebStorageSupported    = isWebStorageSupported;
                vm.isFidoU2FSupported       = isFidoU2FSupported;
                vm.isAllSet                 = isAllSet;
                vm.register                 = register;
                vm.APPLICATION_ID           = 'http://localhost:3000/';
                vm.registerRequest          = {};
                vm.registrationError        = null;
                vm.registrationResponse     = null;

                _activate();
        }]);
})();
