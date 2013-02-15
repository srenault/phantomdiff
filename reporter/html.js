var utils = require('utils'),
    fs = require('fs'),
    _ = require('./libs/underscore');


/**
 * Creates a HTML instance
 *
 * @return HtmlExporter
 */
exports.create = function create() {
    "use strict";
    return new HTMLExporter();
};

/**
 * HTML exporter for test results.
 *
 */
function HTMLExporter() {
    "use strict";

    var passedTmpl = fs.read('./report/tmpl/passed.html'),
        failedTmpl = fs.read('./report/tmpl/failed.html');
}

exports.HTMLExporter = HTMLExporter;

HTMLExporter.prototype.copyImagesToReport = function copyImagesToReport(baseline, current) {
    var baselinePath = baseline.split('/'),
        currentPath = current.split('/'),
        baselineFilename = baselinePath[baselinePath.length - 1],
        currentFilename = currentPath[currentPath.length - 1],
        baselineReport = 'report/images/baseline/' + baselineFilename,
        currentReport = 'report/images/current/' + currentFilename;

    try { fs.remove(baselineReport); } catch(e) {}
    try { fs.remove(currentReport); } catch(e) {}

    fs.copy(baseline, baselineReport);
    fs.copy(current, currentReport);
};

HTMLExporter.prototype.addSuccess = function addSuccess(classname, name, duration, _success_) {
    "use strict";
};

HTMLExporter.prototype.addFailure = function addFailure(classname, name, message, type, duration, _failure_) {
    "use strict";
};

HTMLExporter.prototype.setSuiteDuration = function setSuiteDuration(duration) {
};

HTMLExporter.prototype.setTestResults = function setTestResults(testResults) {
    //console.log(JSON.stringify(testResults));
};

HTMLExporter.prototype.getXML = function getXML() {
    "use strict";
    return this._html;
};
