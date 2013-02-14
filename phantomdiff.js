/**
 * phantomdiff.js
 */

var fs = require("fs");

var Config = {
    addressURL: 'http://localhost:1337',
    page: './images.html',
    imagediff: './libs/imagediff.min.js',
    htmlReporter: './reporter/html'
};

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
        var html = fs.read(Config.page);
        var service = server.listen(1337, function(request, response) {
            response.statusCode = 200;
            response.write(html);
            response.close();
        });
        browser.start(Config.addressURL, function() {
            browser.page.injectJs(Config.imagediff);
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
                        if(!window.imageDiff.result.isEquals) {
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

        browser.run(function(){}); //Don't remove this.

        casper.waitFor(function() {
            return hasResult;
        }, null, null, 3600000);
    };

    casper.test.exporter = require(Config.htmlReporter).create();

    var checkBaseline = function(baseline) {
        try {
            fs.open(baseline, 'r');
            return true;
        } catch (e) {
            return false;
        }
    };

    casper.test.assertImage = function(baseline, current, message) {
        var self = this;
        if(checkBaseline(baseline)) {
            startDiffServer(baseline, current, function(result) {
                self.assertTrue(result.isEquals, message, {
                    type: "assertImage",
                    standard: "Image equals the expected image",
                    values: {
                        subject: current,
                        expected: baseline
                    }
                });
            });
        } else {
            self.assertTrue(true, 'The following reference image was not found : ' + baseline, {
                type: "baselineNotFound",
                standard: "A baseline image was'nt not found.",
                values: {
                    subject: baseline,
                    expected: baseline
                }
            });
            try {
                casper.log('Completing the missing image in the baseline directory', 'warning');
                fs.copy(current, baseline);
            } catch(e) {
                casper.log('An error occured whilte completing the missing image in the baseline directory', 'error');
            }
        }
    };
};
