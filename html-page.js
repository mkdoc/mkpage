var through = require('through3')
  , Node = require('mkast').Node;

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

  var k
    , attrs
    , async = this.async
    , doctype = Node.createNode(
        Node.HTML_BLOCK, {_htmlBlockType: 4, literal: this.doctype})
    , html = Node.createNode(
        Node.HTML_BLOCK, {_htmlBlockType: 6});

  html.literal = tag('html', this.html);
  html.literal += tag('head');
  html.literal += ctag('meta', {charset: this.charset});

  html.literal += tag('title');
  if(this.title) {
    html.literal += esc(this.title);
  }
  html.literal += tag('title', true);

  // meta elements
  for(k in this.meta) {
    html.literal +=
      tag('meta', {name: k, content: this.meta[k]},
      false, true);
  }

  if(this.favicon) {
    html.literal += ctag(
      'link',
      {rel: 'shortcut icon', type: mime(this.favicon), href: this.favicon});
  }

  this.style.forEach(function(href) {
    html.literal += ctag(
      'link', {rel: 'stylesheet', type: 'text/css', href: href});
  })

  this.script.forEach(function(src) {
    attrs = {type: 'text/javascript', src: src};
    if(async) {
      attrs.async = async;
    }
    html.literal += tag(
      'script', attrs);
    html.literal += tag('script', true);
  })

  // close head
  html.literal += tag('head', true);

  // open body
  html.literal += tag('body', this.body);

  this.push(doctype);
  this.push(html);

  // add container element
  if(this.element) {
    var el = Node.createNode(
        Node.HTML_BLOCK, {_htmlBlockType: 6});
    el.literal = tag(this.element, this.attr);
    this.push(el);
  }

  // pass through incoming data
  this.push(chunk);
  this._header = true;
  cb();
}

function foot(cb) {
  var html = Node.createNode(
        Node.HTML_BLOCK, {_htmlBlockType: 6, literal: ''});

  // add container element
  if(this.element) {
    var el = Node.createNode(
        Node.HTML_BLOCK, {_htmlBlockType: 6});
    el.literal = tag(this.element, true);
    this.push(el);
  }

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

function esc(str, attr) {
  var s = str.replace(/&/gm, '&amp;');
  s = s.replace(/</gm, '&lt;');
  s = s.replace(/>/gm, '&gt;');
  if(attr) {
    s = s.replace(/"/gm, '&quot;');
  }
  return s;
}

function mime(file) {
  var ext = file.replace(/^([^\.]+)\.([^\.]+)$/, '$2')
    , type;

  switch(ext) {
    case 'png':
      type = 'image/png';
      break;
    case 'ico':
      type = 'image/x-icon';
      break;
  }

  return type;
}

function ctag(name, attrs) {
  return tag(name, attrs, false, true); 
}

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
    str += ' ' + k;
    // NOTE: when an attribute is true it is not given a value, eg: `async`
    if(attrs[k] !== true && attrs[k] !== undefined) {
      str += '="' + esc(attrs[k], true) + '"';
    }
  }

  if(terminates) {
    str += ' /';
  }
  str += '>';

  return str;
}

HtmlPage.prototype.head = head;
HtmlPage.prototype.foot = foot;

module.exports = through.transform(transform, flush, {ctor: HtmlPage})
