(function() {
    'use strict';

    angular
        .module('fidoApp')
        .controller('FidoController', [
            'CryptoService', 'FidoService', 'StorageService', function(CryptoService, FidoService, StorageService) {
                var vm = this;

                vm.isWebCryptoSupported = function() {
                    return CryptoService.isSupported();
                };

                vm.isWebStorageSupported = function() {
                    return StorageService.isSupported();
                };

                vm.isFidoU2FAddOnInstalled = function() {
                    return FidoService.isSupported();
                };

                vm.generateChallenge = function() {
                    return CryptoService.generateChallenge(32);
                };

                vm.register = function(challenge, appId) {
                    return FidoService.register(challenge, appId);
                };
        }]);
})();
