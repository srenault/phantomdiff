/**
 * baseline.js
 */

(function() {
    var casper = require('casper').create({
        viewportSize: {width: 1027, height: 800}
    });

    var utils = require("utils");

    var baseline = 'baseline/',
        generateFilename = function(url) {
            var filename = url.substr(7, (url.length - 8)).replace(/\//g,'\\');
            return baseline + filename + '.png';
        };

    var urls = [
        'http://twelvesouth.wroom.dev/documents/-live/',
        'http://twelvesouth.wroom.dev/documents/-edited/'
    ];

    casper.start('http://twelvesouth.wroom.dev', function() {
        casper.echo("Logging into wroom...");
        this.fill('form', {
            'email': 'sre@zenexity.com',
            'password': 'wio8859!'
        }, true);
        console.log('Capturing ' + this.getCurrentUrl());
        casper.captureSelector(generateFilename(this.getCurrentUrl()), 'body');
    });

    urls.forEach(function(url) {
        casper.thenOpen(url, function() {
            console.log('Capturing ' + this.getCurrentUrl());
            casper.wait(1000, function() {
                casper.captureSelector(generateFilename(this.getCurrentUrl()), 'body');
            });
        });
    });

    casper.run(function() {
        casper.exit();
    });
})();