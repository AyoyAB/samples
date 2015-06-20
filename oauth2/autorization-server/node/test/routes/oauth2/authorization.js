var should  = require('should'),
    request = require('supertest'),
    express = require('express'),
    i18n    = require("i18n"),
    config  = require('nconf');

    routes  = require('../../../routes');

describe('Routes', function() {
   describe('OAuth2', function() {
       describe('Authorization Endpoint', function() {
           config.file('test/routes/oauth2/config.json');

           i18n.configure({
               locales:        [ 'en' ],
               defaultLocale:  'en',
               directory:      __dirname + '/../../../locales'
           });

           var app = express(),
               clientConfig = config.get('clients:unitTestClient');

           app.use(i18n.init);

           app.use('/', routes);

           it('shall reject a missing client_id query parameter', function(done) {
               request(app)
                   .get('/oauth2/authorization')
                   .expect(400)
                   .expect(i18n.__('missing_client_id'))
                   .end(done);
           });

           it('shall reject an unknown client_id query parameter', function(done) {
               request(app)
                   .get('/oauth2/authorization?client_id=xyzzy')
                   .expect(400)
                   .expect(i18n.__('invalid_client_id'))
                   .end(done);
           });

           it('shall reject a missing redirect_uri query parameter', function(done) {
               request(app)
                   .get('/oauth2/authorization?client_id=' + encodeURIComponent(clientConfig.clientId))
                   .expect(400)
                   .expect(i18n.__('missing_redirect_uri'))
                   .end(done);
           });

           it('shall reject an unknown redirect_uri query parameter', function(done) {
               request(app)
                   .get('/oauth2/authorization?client_id=' + encodeURIComponent(clientConfig.clientId) + '&redirect_uri=xyzzy')
                   .expect(400)
                   .expect(i18n.__('invalid_redirect_uri'))
                   .end(done);
           });

           it('shall reject a missing state query parameter', function(done) {
               request(app)
                   .get('/oauth2/authorization?client_id=' + encodeURIComponent(clientConfig.clientId) + '&redirect_uri=' + encodeURIComponent(clientConfig.redirectUri))
                   .expect(302)
                   .expect('Location', clientConfig.redirectUri + '?error=invalid_request&error_description=' + encodeURIComponent(i18n.__('missing_state')))
                   .end(done);
           });

           it('shall reject a missing response_type query parameter', function(done) {
               request(app)
                   .get('/oauth2/authorization?client_id=' + encodeURIComponent(clientConfig.clientId) + '&redirect_uri=' + encodeURIComponent(clientConfig.redirectUri) + '&state=xyzzy')
                   .expect(302)
                   .expect('Location', clientConfig.redirectUri + '?error=invalid_request&error_description=' + encodeURIComponent(i18n.__('missing_response_type')) + '&state=xyzzy')
                   .end(done);
           });

           it('shall reject an unknown response_type query parameter', function(done) {
               request(app)
                   .get('/oauth2/authorization?client_id=' + encodeURIComponent(clientConfig.clientId) + '&redirect_uri=' + encodeURIComponent(clientConfig.redirectUri) + '&state=xyzzy&response_type=xyzzy')
                   .expect(302)
                   .expect('Location', clientConfig.redirectUri + '?error=invalid_request&error_description=' + encodeURIComponent(i18n.__('invalid_response_type')) + '&state=xyzzy')
                   .end(done);
           });

           // TODO: Re-evaluate this
           it('shall accept a scope-less request', function(done) {
               request(app)
                   .get('/oauth2/authorization?client_id=' + encodeURIComponent(clientConfig.clientId) + '&redirect_uri=' + encodeURIComponent(clientConfig.redirectUri) + '&state=xyzzy&response_type=' + encodeURIComponent(clientConfig.responseType))
                   .expect(200)
                   .end(done);
           });
       });
   });
});
