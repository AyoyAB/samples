var webcrypto = webcrypto || {};

webcrypto.model = (function () {
    'use strict';

    var keyPair;

    function hasKeyPair() {
        return keyPair !== null;
    }

    function createKeyPair() {
        webcrypto.crypto.createKeyPair()
            .then(function(result) {
                keyPair = result;

                $(document).trigger('key-generated', [ result ]);
            }, function (err) {
                window.alert('Could not create key pair: ' + err.message);
            });
    }

    function exportPrivateKey() {
        webcrypto.crypto.exportPrivateKey(keyPair)
            .then(function(result) {
                $(document).trigger('privateKey-exported', [ result ]);
            }, function (err) {
                window.alert('Could not export private key: ' + err.message);
            });
    }

    function exportPublicKey() {
        webcrypto.crypto.exportPublicKey(keyPair)
            .then(function(result) {
                $(document).trigger('publicKey-exported', [ result ]);
            }, function (err) {
                window.alert('Could not export public key: ' + err.message);
            });
    }

    function exportJwkPrivateKey() {
        webcrypto.crypto.exportJwkPrivateKey(keyPair)
            .then(function(result) {
                $(document).trigger('jwkPrivateKey-exported', [ result ]);
            }, function (err) {
                window.alert('Could not export JWT private key: ' + err.message);
            });
    }

    function exportJwkPublicKey() {
        webcrypto.crypto.exportJwkPublicKey(keyPair)
            .then(function(result) {
                $(document).trigger('jwkPublicKey-exported', [ result ]);
            }, function (err) {
                window.alert('Could not export JWT public key: ' + err.message);
            });
    }

    function signData(data) {
        webcrypto.crypto.signData(keyPair.privateKey, data)
            .then(function(result) {
                $(document).trigger('signature-created', [ result ]);

                return result;
            }, function (err) {
                window.alert('Could not create signature: ' + err.message);
            });
    }

    function verifySignature(signature, data) {
        webcrypto.crypto.verifySignature(keyPair.publicKey, signature, data)
            .then(function(result) {
                $(document).trigger('signature-verified', [ result ]);

                return result;
            }, function (err) {
                window.alert('Could not verify signature: ' + err.message);
            });
    }

    return {
        hasKeyPair: hasKeyPair,
        createKeyPair: createKeyPair,
        exportPrivateKey: exportPrivateKey,
        exportPublicKey: exportPublicKey,
        exportJwkPrivateKey: exportJwkPrivateKey,
        exportJwkPublicKey: exportJwkPublicKey,
        signData: signData,
        verifySignature: verifySignature
    };
}());
