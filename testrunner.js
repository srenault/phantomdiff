/**
 * testrunner.js
 */


(function() {
    var Casper = require('casper').Casper,
        utils = require("utils"),
        fs = require('fs');

    var Config = new function() {
        this.baseline = './baseline/',
        this.current = './current/',
        this.baselineFilename = function(url) {
            var filename = url.substr(7, (url.length - 8)).replace(/\//g,'\\');
            return this.baseline + filename + '.png';
        };
        this.currentFilename = function(url) {
            var filename = url.substr(7, (url.length - 8)).replace(/\//g,'\\');
            return this.current + filename + '.png';
        };
    };

    var PhantomDiff = function() {
        PhantomDiff.super_.apply(this, arguments);
    };
    utils.inherits(PhantomDiff, Casper);
    var phantomDiff = new PhantomDiff({
        viewportSize: { width: 1027, height: 800 },
        verbose: true,
        logLevel: 'debug'
    });

    phantomDiff.test.exporter = require('./html').create();
    phantomDiff.test.assertImage = function(baseline, current, message) {
        var self = this;
        startDiffServer(baseline, current, function(result) {
            self.assertTrue(result.isEquals, message, {
                type: "assertImage",
                standard: "Image equals the expected image",
                values: {
                    subject:  current,
                    expected: baseline,
                    diff: result.diff
                }
            });
        });
    };

    var startDiffServer = function(baseline, current, callback) {
        var browser = require('casper').create({
            viewportSize: { width: 1027, height: 800 }
//            verbose: true,
//            logLevel: 'info'
        });
        var server = require('webserver').create();
        var fs = require("fs");
        var html = fs.read('images.html');
        var service = server.listen(1337, function(request, response) {
            response.statusCode = 200;
            response.write(html);
            response.close();
        });

        browser.start('http://localhost:1337', function() {
            browser.page.injectJs('/Users/sre/data/Projects/me/phantomdiff/imagediff.min.js');
            this.fill('form#images-diff', {
                'baseline': baseline,
                'current': current
            });

            this.evaluate(function() {
                var baselineReader = new FileReader(),
                    currentReader = new FileReader(),
                    baselineURL = document.getElementById('baseline').files[0],
                    currentURL = document.getElementById('current').files[0];

                window.imageDiff = {
                    hasResult: false,
                    result: {
                        isEquals: false,
                        diff: null
                    }
                };

                var getImageData = function(callback) {
                    return function(b) {
                        var img = new Image();
                        img.onload = function() {
                            callback && callback(img);
                        };
                        img.src = b.target.result;
                    };
                };

                baselineReader.onload = getImageData(function(baselineImg) {
                    currentReader.onload = getImageData(function(currentImg) {
                        window.imageDiff.result.isEquals = imagediff.equal(baselineImg, currentImg, 100);
                        window.imageDiff.hasResult = true;
                    });
                    currentReader.readAsDataURL(currentURL);
                });
                baselineReader.readAsDataURL(baselineURL);
            });
        });

        var hasResult = false;
        browser.waitFor(function check() {
            return browser.evaluate(function() {
                return window.imageDiff.hasResult;
            });
        }, function then() {
            var result = browser.evaluate(function() {
                return window.imageDiff.result;
            });
            hasResult = true;
            callback && callback(result);
        }, function onTimeout() {
            console.log('The processing to diff images timeout !');
        }, 10000);

        browser.run(function() {
        });

        phantomDiff.waitFor(function() {
            return hasResult;
        }, null, null, 3600000);
    };

    phantomDiff.start('http://twelvesouth.wroom.dev', function() {
        var baseline = Config.baselineFilename(this.getCurrentUrl()),
            current = Config.currentFilename(this.getCurrentUrl());

        this.fill('form', {
            'email': 'sre@zenexity.com',
            'password': 'wio8859!'
        }, true);

        this.captureSelector(current, 'body');
        this.test.assertImage(baseline, current, 'The image ' + baseline + ' should be equal to ' + current);
    });

    phantomDiff.then(function() {
        this.test.assertTrue(false, "A should be false");
        this.test.assertTrue(false, "B should be false");
    });

    phantomDiff.run(function() {
        this.test.done();
        this.test.renderResults(true, 0, './report/report.html');
        phantomDiff.exit();
    });
})();
