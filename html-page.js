var through = require('through3')
  //, Node = require('mkast').Node;

/**
 *  Wraps a document stream with HTML code blocks for the document head, 
 *  start of the body and the end of the body and document.
 *
 *  @module {constructor} HtmlPage
 *  @param {Object} [opts] stream options.
 */
function HtmlPage(opts) {
  opts = opts || {};
}

/**
 *  Stream transform.
 *
 *  @private {function} transform
 *  @member HtmlPage
 *
 *  @param {Array} node input AST node.
 *  @param {String} encoding character encoding.
 *  @param {Function} callback function.
 */
function transform(chunk, encoding, cb) {
  this.push(chunk);
  cb();
}

function flush(cb) {
  cb();
}

module.exports = through.transform(transform, flush, {ctor: HtmlPage})

