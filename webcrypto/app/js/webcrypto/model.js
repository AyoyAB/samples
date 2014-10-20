var webcrypto = webcrypto || {};

webcrypto.model = (function () {
    'use strict';

    var keyPair,
        signature,
        plainText = webcrypto.util.str2ab('Hello, world!'); // TODO: Read from web page.

    function createKeyPair() {
        webcrypto.crypto.createKeyPair()
            .then(function(result) {
                keyPair = result;

                $(document).trigger('key-generated', [ result ]);
            })
            .catch(function (err) {
                window.alert('Could not create key pair: ' + err.message);
            });
    }

    function signData() {
        webcrypto.crypto.signData(keyPair.privateKey, plainText)
            .then(function(result) {
                signature = result;

                $(document).trigger('signature-created', [ result ]);
            })
            .catch(function (err) {
                window.alert('Could not create signature: ' + err.message);
            });
    }

    function verifySignature() {
        webcrypto.crypto.verifySignature(keyPair.publicKey, signature, plainText)
            .then(function(result) {
                $(document).trigger('signature-verified', [ result ]);
            }).catch(function (err) {
                window.alert('Could not verify signature: ' + err.message);
            });
    }

    return {
        createKeyPair: createKeyPair,
        signData: signData,
        verifySignature: verifySignature
    };
}());
