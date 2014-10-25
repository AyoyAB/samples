var app = (function () {
    'use strict';

    function _setGenerateButtonState() {
        if (!webcrypto.model.hasKeyPair()) {
            $('#generateButton').removeAttr('disabled');
        } else {
            $('#generateButton').attr('disabled', 'disabled');
        }
    }

    function _setSignButtonState() {
        if (webcrypto.model.hasKeyPair() && $('#plainTextInput').val().length != 0) {
            $('#signButton').removeAttr('disabled');
        } else {
            $('#signButton').attr('disabled', 'disabled');
        }
    }

    function _setVerifyButtonState() {
        if (webcrypto.model.hasKeyPair() && $('#signatureInput').val().length != 0) {
            $('#verifyButton').removeAttr('disabled');
        } else {
            $('#verifyButton').attr('disabled', 'disabled');
        }
    }

    return {
        init: function () {
            // Make sure the browser supports crypto && crypto.subtle.
            if (!window.crypto || !window.crypto.subtle) {
                window.alert('No window.crypto.subtle found!');
                return;
            }

            // Wire up the click event handlers.
            $('#generateButton').click(webcrypto.model.createKeyPair);
            $('#signButton').click(function () {
                webcrypto.model.signData(webcrypto.util.str2ab($('#plainTextInput').val()))
            });
            $('#verifyButton').click(function () {
                webcrypto.model.verifySignature(
                    webcrypto.util.base64ToArrayBuffer($('#signatureInput').val()),
                    webcrypto.util.str2ab($('#plainTextInput').val()));
            });

            // Wire up the keyup event handlers.
            $('#plainTextInput').keyup(function () {
                _setSignButtonState();
            });

            // Wire up our custom event handlers.
            $(document).on('key-generated', function () {
                _setGenerateButtonState();
                _setSignButtonState();

                // Extract the key.
                webcrypto.model.exportPrivateKey();
                webcrypto.model.exportPublicKey();
                webcrypto.model.exportJwkPrivateKey();
                webcrypto.model.exportJwkPublicKey();
            });
            $(document).on('privateKey-exported', function (event, param1) {
                $('#privateKeyInput').val(webcrypto.util.arrayBufferToBase64(param1));
            });
            $(document).on('publicKey-exported', function (event, param1) {
                $('#publicKeyInput').val(webcrypto.util.arrayBufferToBase64(param1));
            });
            $(document).on('jwkPrivateKey-exported', function (event, param1) {
                $('#jwkPrivateKeyTextArea').val(JSON.stringify(param1, null, '\t'));
            });
            $(document).on('jwkPublicKey-exported', function (event, param1) {
                $('#jwkPublicKeyTextArea').val(JSON.stringify(param1, null, '\t'));
            });
            $(document).on('signature-created', function (event, param1) {
                $('#signatureInput').val(webcrypto.util.arrayBufferToBase64(param1));

                _setSignButtonState();
                _setVerifyButtonState();
            });
            $(document).on('signature-verified', function (event, param1) {
                if (param1) {
                    window.alert('Verification succeeded!');
                } else {
                    window.alert('Verification failed!');
                }
            });
        }
    };
}());

$(function () {
    'use strict';

    app.init();
});
