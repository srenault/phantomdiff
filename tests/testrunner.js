/**
 * testrunner.js
 */

var utils = require("utils"),
    fs = require('fs');

var Config = new function() {
    this.phantomdiff = './phantomdiff',
    this.baseline = './images/baseline/',
    this.current = './images/current/',
    this.baselineFilename = function(url) {
        var filename = url.substr(7, (url.length - 8)).replace(/\//g,'\\');
        return this.baseline + filename + '.png';
    };
    this.currentFilename = function(url) {
        var filename = url.substr(7, (url.length - 8)).replace(/\//g,'\\');
        return this.current + filename + '.png';
    };
};

casper.options.viewportSize = { width: 1027, height: 800 };

require(Config.phantomdiff).init(casper);

// Starting the tests
casper.start('http://twelvesouth.wroom.dev', function() {
    var baseline = Config.baselineFilename(this.getCurrentUrl()),
        current = Config.currentFilename(this.getCurrentUrl());

    this.fill('form', {
        'email': 'sre@zenexity.com',
        'password': 'wio8859!'
    }, true);

    this.captureSelector(current, 'body');
    this.test.assertImage(baseline, current, 'The image ' + baseline + ' should be equal to ' + current);
});

casper.run(function() {
    this.test.done(1);
    //casper.exit();
});
