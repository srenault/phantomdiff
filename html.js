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
    this._html = utils.node('body');
    this._html.toString = function toString() {
        return '<!DOCTYPE html>' + this.outerHTML;
    };
}
exports.HTMLExporter = HTMLExporter;

/**
 * Adds a successful test result.
 *
 * @param  String  classname
 * @param  String  name
 * @param  Number  duration  Test duration in milliseconds
 */
HTMLExporter.prototype.addSuccess = function addSuccess(classname, name, duration) {
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
HTMLExporter.prototype.addFailure = function addFailure(classname, name, message, type, duration) {
    "use strict";
    var fnode = utils.node('div', {
        'class': 'testcase failures'
    });
    //if (duration !== undefined) {
    //fnode.setAttribute('time', utils.ms2seconds(duration));
    //}
    var failure = utils.node('div', {
        'class': 'failure'
    });
    failure.appendChild(document.createTextNode(message || "no message left"));
    fnode.appendChild(failure);
    this._html.appendChild(fnode);
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
