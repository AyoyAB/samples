var express = require('express'),
    path    = require('path'),
    app     = express();

// Set the TCP port to list to.
app.set('port',        process.env['PORT'] || 3000);

// Set up Jade as the view engine.
app.set('views',       path.join(__dirname, 'views'));
app.set('view engine', 'jade');

// Use the public folder for static files.
app.use(express.static(path.join(__dirname, 'public')));

// Set up manual routes.
app.get('/', function(req, res) {
    res.render('index');
});
app.get('/partials/:name', function (req, res) {
    var name = req.params.name;
    res.render(path.join('partials/', name));
});

// Start the server.
app.listen(app.get('port'), function () {
    console.log('Server listening on port: %s.', app.get('port'));
});
