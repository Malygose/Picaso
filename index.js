var config = require('config');

var picaso = require('picaso');
var cls = require('picaso.utils').console;

var app = picaso.app(config.get('server'));
app.listen().then(function() {
    console.success('Web server start success..');
});
