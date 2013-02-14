var utils = require('utils');
var fs = require('fs');

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
    var htmlNode = utils.node('html'),
        bodyNode = utils.node('body'),
        headNode = utils.node('head'),
        cssImport = utils.node('link', {
            rel: "stylesheet",
            media: "screen",
            href: "report.css"
        }),
        successesNode = utils.node('ul', { 'class': 'successes'}),
        failuresNode = utils.node('ul', { 'class': 'failures'});

    headNode.appendChild(cssImport);
    htmlNode.appendChild(headNode);
    bodyNode.appendChild(successesNode);
    bodyNode.appendChild(failuresNode);
    htmlNode.appendChild(bodyNode);

    this._html = htmlNode;
    this._html.toString = function toString() {
        return '<!DOCTYPE html>' + this.outerHTML;
    };
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

/**
 * Adds a successful test result.
 *
 * @param  String  classname
 * @param  String  name
 * @param  Number  duration  Test duration in milliseconds
 */
HTMLExporter.prototype.addSuccess = function addSuccess(classname, name, duration, _success_) {
    "use strict";
    var snode = utils.node('div', {
        'class': 'testcase success'
    });
    //if (duration !== undefined) {
    //snode.setAttribute('time', utils.ms2seconds(duration));
    //}
    this._html.appendChild(snode);
};

/**
 * Adds a failed test result.
 *
 * @param  String  classname
 * @param  String  name
 * @param  String  message
 * @param  String  type
 * @param  Number  duration  Test duration in milliseconds
 */

var addMessage = function(elt, message) {
    var messageNode = utils.node('p', { 'class': 'message'});
    messageNode.appendChild(document.createTextNode(message));
    elt.appendChild(messageNode);
    return elt;
};

HTMLExporter.prototype.addFailure = function addFailure(classname, name, message, type, duration, _failure_) {
    "use strict";
    var failureNode = addMessage(utils.node('li'), _failure_.message);
    var failuresNodes = this._html.getElementsByClassName('failures')[0];

    if (type == 'assertImage') {
        console.log(JSON.stringify(_failure_));
        this.copyImagesToReport(_failure_.values.expected, _failure_.values.subject);
        var detailsNode = utils.node('div', { 'class': 'details' }),
            baselineNode = utils.node('div', { 'class': 'baseline' }),
            currentNode = utils.node('div', { 'class': 'current' }),
            baselineImg = utils.node('img', { src: _failure_.values.subject }),
            currentImg = utils.node('img', { src: _failure_.values.expected });

        baselineNode.appendChild(baselineImg);
        currentNode.appendChild(currentImg);
        detailsNode.appendChild(baselineNode);
        detailsNode.appendChild(currentNode);
        failureNode.appendChild(detailsNode);
    }
    failuresNodes.appendChild(failureNode);
};

/**
 * Adds test suite duration
 *
 * @param  Number  duration  Test duration in milliseconds
 */
HTMLExporter.prototype.setSuiteDuration = function setSuiteDuration(duration) {
    "use strict";
    //if (!isNaN(duration)) {
    //this._html.setAttribute("time", utils.ms2seconds(duration));
    //}
};

/**
 * Retrieves generated HTML object.
 *
 * @return HTMLElement
 */
HTMLExporter.prototype.getXML = function getXML() {
    "use strict";
    return this._html;
};
