var utils = require('utils'),
    fs = require('fs'),
    _ = require('./libs/underscore');


exports.create = function create() {
    "use strict";
    return new HTMLExporter();
};

function HTMLExporter() {
    "use strict";

    //Final result
    this.testsResult = {
        passed: 0,
        failed: 0,
        passesTime: 0,
        failuresTime: 0,
        testSuites: [
        ]
    };

    //Templates
    this.passedTmpl = fs.read('./report/tmpl/passed.html');
    this.failedTmpl = fs.read('./report/tmpl/failed.html');
}

exports.HTMLExporter = HTMLExporter;

HTMLExporter.prototype.setTestResults = function setTestResults(testResults) {
    //console.log(JSON.stringify(testResults));

    var summup = function(a, b) {
        return a + b;
    };

    var filename = function(path) {
        var splitPath = path.split('/');
        return splitPath[splitPath.length - 1];
    };

    var copyImagesToReport = function copyImagesToReport(images) {
        var baselineFilename = filename(images.baseline),
            currentFilename = filename(images.current),
            baselineReport = 'report/images/baseline/' + baselineFilename,
            currentReport = 'report/images/current/' + currentFilename;

        try { fs.remove(baselineReport); } catch(e) {}
        try { fs.remove(currentReport); } catch(e) {}

        fs.copy(images.baseline, baselineReport);
        fs.copy(images.current, currentReport);
    };

    var imagesForReport = function(testResults) {
        var all = testResults.passes.concat(testResults.failures);
        return all.filter(function(test) {
            return test.type == 'assertImage';
        }).map(function(test) {
            return {
                current: test.values.subject,
                baseline: test.values.expected
            };
        });
    };

    imagesForReport(testResults).forEach(function(images) {
        copyImagesToReport(images);
    });

    var asTestsSuite = function(testResults) {
        var all = testResults.passes.concat(testResults.failures);

        var testsWithSuiteName =  _(all).map(function(test) {
            var name = filename(test.file),
                extLength = 3;
            test.suite = name.substring(0, name.length - extLength);
            return test;
        });

        return _(testsWithSuiteName).groupBy(function(test) {
            return test.suite;
        });
    };

    this.testResults = {
        passed: testResults.passed,
        failed: testResults.failed,
        passesTime: testResults.passesTime.reduce(summup, 0),
        failuresTime: testResults.failuresTime.reduce(summup, 0),
        totalTime: testResults.passesTime.concat(testResults.failuresTime).reduce(summup, 0),
        testSuites: asTestsSuite(testResults)
    };
};

HTMLExporter.prototype.getXML = function getXML() {
    "use strict";
    return this._html;
};

// Didn't used anymore
HTMLExporter.prototype.addSuccess = function addSuccess(classname, name, duration){};
HTMLExporter.prototype.addFailure = function addFailure(classname, name, message, type, duration){};
HTMLExporter.prototype.setSuiteDuration = function setSuiteDuration(duration){};
