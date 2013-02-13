/**
 * testrunner.js
 */


(function() {
    var Casper = require('casper').Casper;
    var utils = require("utils");

    var Config = new function() {
        this.baseline = 'baseline/',
        this.current = 'current/',
        this.baselineFilename = function(url) {
            var filename = url.substr(7, (url.length - 8)).replace(/\//g,'\\');
            return this.baseline + filename + '.png';
        };
        this.currentFilename = function(url) {
            var filename = url.substr(7, (url.length - 8)).replace(/\//g,'\\');
            return this.current + filename + '.png';
        };
    };

    var startDiffServer = function(callback) {
        var server = require('webserver').create();
        var fs = require("fs");
        var html = fs.read('images.html');
        var service = server.listen(1337, function(request, response) {
            response.statusCode = 200;
            response.write(html);
            response.close();
        });

        var browser = require('casper').create({
            viewportSize: { width: 1027, height: 800 }
        });

        return browser.start('http://localhost:1337', function() {
            
            callback && callback(true);
        });
    };

    var PhantomDiff = function() {
        PhantomDiff.super_.apply(this, arguments);
    };

    utils.inherits(PhantomDiff, Casper);

    var phantomDiff = new PhantomDiff({
        viewportSize: { width: 1027, height: 800 }
    });

    phantomDiff.test.assertImage = function(subject, expected, message) {
        var self = this;
        return startDiffServer(function(isEquals, diff) {
            return self.assertTrue(isEquals, message, {
                type: "assertImage",
                standard: "Image equals the expected image",
                values: {
                    subject:  subject,
                    expected: expected,
                    diff: diff
                }
            });
        }).run();
    };

    phantomDiff.start('http://twelvesouth.wroom.dev', function() {
        var baseline = Config.baselineFilename(this.getCurrentUrl()),
            current = Config.currentFilename(this.getCurrentUrl());

        this.fill('form', {
            'email': 'sre@zenexity.com',
            'password': 'wio8859!'
        }, true);

        phantomDiff.captureSelector(current, 'body');
        this.test.assertImage(current, baseline, 'first test');
    });

    phantomDiff.then(function() {
    });

    phantomDiff.run(function() {
        this.test.done();
        phantomDiff.exit();
    });
})();
