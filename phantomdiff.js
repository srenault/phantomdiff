/**
 * phantomdiff.js
 */

var fs = require("fs");

exports.init = function create(casper) {
    return new PhantomDiff(casper);
};

exports.PhantomDiff = PhantomDiff;

var PhantomDiff = function(casper) {

    var startDiffServer = function(baseline, current, callback) {
        var browser = require('casper').create({
            viewportSize: { width: 1027, height: 800 }
        });
        var server = require('webserver').create();
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
                    currentURL = document.getElementById('current').files[0],
                    toDataURLFixed = false;

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
                        if(!window.imageDiff.result.isEquals && toDataURLFixed) {
                            var rawDiff = imagediff.diff(baselineImg, currentImg);
                            var canvasDiff = imagediff.createCanvas(rawDiff.width, rawDiff.height);
                            var context = canvasDiff.getContext('2d');
                            context.putImageData(rawDiff, 0, 0);
                            window.imageDiff.result.diff = canvasDiff.toDataURL();
                        }
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

        casper.waitFor(function() {
            return hasResult;
        }, null, null, 3600000);
    };

    casper.test.exporter = require('./html').create();

    casper.test.assertImage = function(current, baseline, message) {
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
}

