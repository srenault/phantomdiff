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
        baselineReport = 'report/baseline/' + baselineFilename,
        currentReport = 'report/current/' + currentFilename;

    try { fs.remove(baselineReport); } catch(e) {}
    try { fs.remove(currentReport); } catch(e) {}

    fs.copy(baseline, baselineReport);
    fs.copy(current, currentReport);
};

HTMLExporter.prototype.addSuccess = function addSuccess(classname, name, duration, _success_) {
    "use strict";
    console.log('#######################');
    console.log('classname : ' + classname);
    console.log('name : ' + name);
    console.log('duration : ' + duration);
    console.log('_success_ : ' + JSON.stringify(_success_));
};

HTMLExporter.prototype.addFailure = function addFailure(classname, name, message, type, duration, _failure_) {
    "use strict";
    //console.log('####################### ' + classname);
};

HTMLExporter.prototype.setSuiteDuration = function setSuiteDuration(duration) {
};

HTMLExporter.prototype.setTestResults = function setTestResults(testResults) {
};

HTMLExporter.prototype.getXML = function getXML() {
    "use strict";
    return this._html;
};
