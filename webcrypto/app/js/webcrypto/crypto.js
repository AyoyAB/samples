var webcrypto = webcrypto || {};

webcrypto.crypto = (function () {
    'use strict';

    var configMap = {
        algorithmName: 'RSASSA-PKCS1-v1_5',
        modulusLength: 1024,
        publicExponent: new Uint8Array([ 1, 0, 1 ]),
        hash: { name: 'SHA-256' },
        extractableKey: true,
        keyType: [ 'sign', 'verify' ]
    };

    function createKeyPair() {
        return window.crypto.subtle.generateKey({
                name: configMap.algorithmName,
                modulusLength: configMap.modulusLength,
                publicExponent: configMap.publicExponent,
                hash: configMap.hash
            },
            configMap.extractableKey,
            configMap.keyType
        )
            .then(function (keyPair) {
                return keyPair;
            });
    }

    function exportPrivateKey(keyPair) {
        return window.crypto.subtle.exportKey('pkcs8', keyPair.privateKey)
            .then(function(key) {
                return key;
            });
    }

    function exportPublicKey(keyPair) {
        return window.crypto.subtle.exportKey('spki', keyPair.publicKey)
            .then(function(key) {
                return key;
            });
    }

    function exportJwkPrivateKey(keyPair) {
        return window.crypto.subtle.exportKey('jwk', keyPair.privateKey)
            .then(function(key) {
                return key;
            });
    }

    function exportJwkPublicKey(keyPair) {
        return window.crypto.subtle.exportKey('jwk', keyPair.publicKey)
            .then(function(key) {
                return key;
            });
    }

    function signData(privateKey, plaintext) {
        return window.crypto.subtle.sign(privateKey.algorithm, privateKey, plaintext)
            .then(function (signature) {
                return signature;
            });
    }

    function verifySignature(publicKey, signature, plaintext) {
        return window.crypto.subtle.verify(publicKey.algorithm, publicKey, signature, plaintext)
            .then(function (result) {
                return result;
            });
    }

    return {
        createKeyPair: createKeyPair,
        exportPrivateKey: exportPrivateKey,
        exportPublicKey: exportPublicKey,
        exportJwkPrivateKey: exportJwkPrivateKey,
        exportJwkPublicKey: exportJwkPublicKey,
        signData: signData,
        verifySignature: verifySignature
    };
}());
