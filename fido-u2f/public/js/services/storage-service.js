(function() {
    'use strict';

    /**
     * Web Storage API Service.
     */
    angular
        .module('fidoApp')
        .factory('StorageService', ['$window', function($window) {
            /**
             * Checks if Web Local Storage is supported in the current browser.
             *
             * @returns {boolean} True if Web Storage is supported.
             */
            function isSupported() {
                return $window['localStorage'] !== undefined;
            }

            /**
             * Checks if a given key is present in Web Local Storage.
             *
             * @param   {string} key    The key to check.
             *
             * @returns {boolean}       True if the key is present.
             */
            function hasItem(key) {
                return $window['localStorage'].getItem(key) !== null;
            }

            /**
             * Gets the value for the specified key from Web Local Storage.
             *
             * @param   {string} key    The key of the value to fetch.
             *
             * @returns {*}             The requested value, or null if none was found.
             */
            function getItem(key) {
                var value = $window['localStorage'].getItem(key);

                return (value === null) ? null : angular.fromJson(value);
            }

            /**
             * Stores the value for the specified key in Web Local Storage.
             *
             * @param {string}  key     The key to store the value under.
             * @param {*}       value   The value to store.
             */
            function setItem(key, value) {
                $window['localStorage'].setItem(key, angular.toJson(value));
            }

            return {
                isSupported:    isSupported,
                hasItem:        hasItem,
                getItem:        getItem,
                setItem:        setItem
            };
        }]);
})();
