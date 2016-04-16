var through = require('through3')
  , fs = require('fs')
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

  this.headFile = opts.header;
  this.footFile = opts.footer;

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
  cb(null, chunk);
}

function head(chunk, cb) {
  var i
    , href
    , doctype = Node.createNode(
        Node.HTML_BLOCK, {_htmlBlockType: 4, literal: this.doctype});

  // open containing parent document
  this.push(Node.createNode(Node.DOCUMENT));

  this.push(doctype);

  this.push(element(tag('html', this.html)));
  this.push(element(tag('head')));

  this.push(element(ctag('meta', {charset: this.charset})));

  if(this.title) {
    this.push(element(tag('title') + esc(this.title) + tag('title', true)));
  }

  // meta elements
  for(var k in this.meta) {
    this.push(element(ctag('meta', {name: k, content: this.meta[k]})));
  }

  if(this.favicon) {
    this.push(element(ctag(
      'link',
      {rel: 'shortcut icon', type: mime(this.favicon), href: this.favicon})));
  }

  for(i = 0;i < this.style.length;i++) {
    href = this.style[i];
    this.push(element(ctag(
      'link', {rel: 'stylesheet', type: 'text/css', href: href})));
  }

  for(i = 0;i < this.script.length;i++) {
    href = this.script[i];
    this.push(element(
      tag('script', {type: 'text/javascript', src: href, async: this.async})));
  }

  var sequence = [];

  function loader(name, file) {
    return function load(cb) {
      var scope = this;
      fs.readFile(file, function(err, contents) {
        if(err) {
          return cb.call(scope, err); 
        }

        contents = '' + contents;
        if(!/^\n/.test(contents)) {
          contents = '\n' + contents;
        }
        if(!/\n$/.test(contents)) {
          contents = contents + '\n';
        }

        scope.push(element(
          tag(name) + esc(contents) + tag(name, true)));

        cb(); 
      })
    }
  }

  function onSequence(err) {
    if(err) {
      return cb(err); 
    } 
    this.header(chunk, cb);
  }

  if(this.css) {
    sequence.push(loader('style', this.css)); 
  }

  if(this.javascript) {
    sequence.push(loader('script', this.javascript)); 
  }

  // run async functions
  if(sequence.length) {

    this.sequence(sequence, onSequence);
  // finalize header
  }else{
    this.header(chunk, cb);
  }
}

/**
 *  Finalize the page header.
 *
 *  @function header
 *  @param {Object} chunk chunk to passthrough.
 *  @param {Function} cb callback function.
 */
function header(chunk, cb) {

  // close head
  this.push(element(tag('head', true)));

  // open body
  this.push(element(tag('body', this.body)));

  // add container element
  if(this.element) {
    this.push(element(tag(this.element, this.attr)));
  }

  // pass through incoming data
  this.push(chunk);
  this._header = true;
  cb();
}

function foot(cb) {
  // close container element
  if(this.element) {
    this.push(element(tag(this.element, true)));
  }
  this.footer(cb);

}

function footer(cb) {
  var i
    , href;

  // inject app script elements before close of body
  for(i = 0;i < this.app.length;i++) {
    href = this.app[i];
    this.push(element(
      tag('script', {type: 'text/javascript', src: href, async: this.async})));
  }

  this.push(element(tag('body', true)));
  this.push(element(tag('html', true)));

  // close containing parent document
  this.push(Node.createNode(Node.EOF));
  this._footer = true;
  cb();
}

function sequence(list, cb) {
  var scope = this;
  function next(err) {
    if(err) {
      return cb.call(scope, err); 
    }
    var item = list.shift();
    if(!item) {
      return cb.call(scope); 
    }
    item.call(scope, next);
  }
  next();
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

function element(literal, type) {
  literal = literal || '';
  type = type || 6;
  return Node.createNode(
    Node.HTML_BLOCK, {_htmlBlockType: type, literal: literal});
}

HtmlPage.prototype.head = head;
HtmlPage.prototype.header = header;
HtmlPage.prototype.foot = foot;
HtmlPage.prototype.footer = footer;
HtmlPage.prototype.sequence = sequence;

module.exports = through.transform(transform, flush, {ctor: HtmlPage})
