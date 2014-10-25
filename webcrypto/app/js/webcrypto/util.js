var webcrypto = webcrypto || {};

webcrypto.util = (function () {
    'use strict';

    // From: http://updates.html5rocks.com/2012/06/How-to-convert-ArrayBuffer-to-and-from-String
     function ab2str(buf) {
         return String.fromCharCode.apply(null, new Uint16Array(buf));
     }

    // From: http://updates.html5rocks.com/2012/06/How-to-convert-ArrayBuffer-to-and-from-String
    function str2ab(str) {
        var buf = new ArrayBuffer(str.length * 2); // 2 bytes for each char
        var bufView = new Uint16Array(buf);
        for (var i = 0, strLen = str.length; i < strLen; i++) {
            bufView[i] = str.charCodeAt(i);
        }
        return buf;
    }

    // From: http://jsperf.com/tobase64-implementations/3
    function arrayBufferToBase64(buffer) {
        var binary = '';
        var bytes = new Uint8Array(buffer);
        var len = bytes.byteLength;

        for (var i = 0; i < len; i++) {
            binary += String.fromCharCode(bytes[i]);
        }

        return window.btoa(binary);
    }

    // From: http://stackoverflow.com/questions/21797299/convert-base64-string-to-arraybuffer
    function base64ToArrayBuffer(string) {
        var binary_string =  window.atob(string);
        var len = binary_string.length;
        var bytes = new Uint8Array(len);

        for (var i = 0; i < len; i++) {
            bytes[i] = binary_string.charCodeAt(i);
        }

        return bytes.buffer;
    }

    return {
        ab2str: ab2str,
        str2ab: str2ab,
        arrayBufferToBase64: arrayBufferToBase64,
        base64ToArrayBuffer: base64ToArrayBuffer
    };
}());
