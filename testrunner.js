/**
 * testrunner.js
 */

// Init & configure casper server
var Casper = require('casper').Casper,
    utils = require("utils"),
    fs = require('fs');

var Config = new function() {
    this.baseline = '../baseline/',
    this.current = '../current/',
    this.baselineFilename = function(url) {
        var filename = url.substr(7, (url.length - 8)).replace(/\//g,'\\');
        return this.baseline + filename + '.png';
    };
    this.currentFilename = function(url) {
        var filename = url.substr(7, (url.length - 8)).replace(/\//g,'\\');
        return this.current + filename + '.png';
    };
};

var TestRunner = function() {
    TestRunner.super_.apply(this, arguments);
};

utils.inherits(TestRunner, Casper);
var testRunner = new TestRunner({
    viewportSize: { width: 1027, height: 800 },
    verbose: true,
    logLevel: 'debug'
});

require('./phantomdiff').init(testRunner);

// Starting the tests
testRunner.start('http://twelvesouth.wroom.dev', function() {
    var baseline = Config.baselineFilename(this.getCurrentUrl()),
        current = Config.currentFilename(this.getCurrentUrl());

    this.fill('form', {
        'email': 'sre@zenexity.com',
        'password': 'wio8859!'
    }, true);

    this.captureSelector(current, 'body');
    this.test.assertImage(baseline, current, 'The image ' + baseline + ' should be equal to ' + current);
});

testRunner.run(function() {
    this.test.done();
    this.test.renderResults(true, 0, './report/report.html');
    testRunner.exit();
});
