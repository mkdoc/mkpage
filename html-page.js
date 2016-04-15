var through = require('through3')
  , Node = require('mkast').Node;

function tag(name, attrs, close, terminates) {
  if(typeof attrs === 'boolean') {
    close = attrs; 
    attrs = null;
  }
  if(close) {
    return '</' + name + '>';
  }

  var str = '<' + name;
  for(var k in attrs) {
    str += ' ' + k + '="' + attrs[k] + '"';
  }

  if(terminates) {
    str += ' /';
  }
  str += '>';

  return str;
}

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
 *  @option {String=utf-8} charset document character set.
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
  this.charset = opts.charset || 'utf-8';

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

  // configure lang attribute
  this.html.lang = this.lang;

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

  var doctype = Node.createNode(
        Node.HTML_BLOCK, {_htmlBlockType: 4, literal: this.doctype})
    , html = Node.createNode(
        Node.HTML_BLOCK, {_htmlBlockType: 6});

  html.literal = tag('html', this.html);
  html.literal += tag('head');
  html.literal += tag('meta', {charset: this.charset}, false, true);

  // close head
  html.literal += tag('head', true);

  // open body
  html.literal += tag('body', this.body);

  this.push(doctype);
  this.push(html);

  // pass through incoming data
  this.push(chunk);
  this._header = true;
  cb();
}

function foot(cb) {
  var html = Node.createNode(
        Node.HTML_BLOCK, {_htmlBlockType: 6, literal: ''});

  // close body
  html.literal += tag('body', true);

  // close html
  html.literal += tag('html', true);

  this.push(html);

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
