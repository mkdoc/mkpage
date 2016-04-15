var through = require('through3')
  //, Node = require('mkast').Node;

/**
 *  Wraps a document stream with HTML code blocks for the document head, 
 *  start of the body and the end of the body and document.
 *
 *  If the `element` option is given the input markdown document is wrapped in 
 *  a container element using the tag name given with the `element` option. In 
 *  this case you can use the `attr` map to set attributes on the container 
 *  element.
 *
 *  @module {constructor} HtmlPage
 *  @param {Object} [opts] stream options.
 *
 *  @option {String} doctype document type declaration.
 *  @option {String=en-us} lang language attribute for the html element.
 *  @option {String} title document title.
 *  @option {Array} style paths for link elements.
 *  @option {Array} script paths for script elements.
 *  @option {String} css file path to inline css contents.
 *  @option {String} javascript file path to inline javascript contents.
 *  @option {String} favicon path to use for a favicon link element.
 *  @option {Boolean=false} async add async attribute to script elements.
 *  @option {Object} html map of attributes for the html element.
 *  @option {Object} meta map of name and descriptions for meta elements.
 *  @option {Object} body map of attributes for the body element.
 *  @option {String} element container element name.
 *  @option {Object} attr map of attributes for the container element.
 *  @option {Array} app paths for script elements before end of body.
 *  @option {String} header include file at start of body.
 *  @option {String} footer include file at end of body.
 */
function HtmlPage(opts) {
  opts = opts || {};

  this.doctype = opts.doctype || '<!doctype html>';
  this.lang = opts.lang || 'en-us';

  this.title = opts.title;
  this.style = opts.style || [];
  this.script = opts.script || [];

  this.css = opts.css;
  this.javascript = opts.javascript;

  this.favicon = opts.favicon;

  this.async = opts.async !== undefined ? Boolean(opts.async) : false;

  this.html = opts.html || {};
  this.meta = opts.meta || {};
  this.body = opts.body || {};

  this.element = opts.element;
  this.attr = opts.attr || {};

  this.app = opts.app || [];

  this.header = opts.header;
  this.footer = opts.footer;

  // internal state
  this._header = false;
  this._footer = false;
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
  if(!this._header) {
    return this.head(chunk, cb); 
  }

  // pass through incoming data
  this.push(chunk);

  cb();
}

function head(chunk, cb) {

  // pass through incoming data
  this.push(chunk);

  this._header = true;
  cb();
}

function foot(cb) {
  this._footer = true;
  cb();
}

function flush(cb) {
  if(!this._footer) {
    return this.foot(cb); 
  }
  cb();
}

HtmlPage.prototype.head = head;
HtmlPage.prototype.foot = foot;

module.exports = through.transform(transform, flush, {ctor: HtmlPage})
