var app = (function () {
    'use strict';

    return {
        init: function () {
            // Make sure the browser supports crypto && crypto.subtle.
            if (!window.crypto || !window.crypto.subtle) {
                window.alert('No window.crypto.subtle found!');
                return;
            }

            // Wire up the click event handlers.
            $('#generate').click(webcrypto.model.createKeyPair);
            $('#sign').click(webcrypto.model.signData);
            $('#verify').click(webcrypto.model.verifySignature);

            // Wire up our custom event handlers.
            $(document).on('key-generated', function () {
                $('#sign').removeAttr('disabled');
                $('#generate').attr('disabled', 'disabled');

                window.alert('Key generated!');
            });
            $(document).on('signature-created', function () {
                $('#verify').removeAttr('disabled');
                $('#sign').attr('disabled', 'disabled');

                window.alert('Signature created!');
            });
            $(document).on('signature-verified', function (event, param1) {
                $('#verify').attr('disabled', 'disabled');

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
