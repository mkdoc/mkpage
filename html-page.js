var through = require('through3')
  , fs = require('fs')
  , ast = require('mkast')
  , Node = ast.Node;

/**
 *  Wraps a document stream with HTML code blocks for the doctype, html, head 
 *  and body elements.
 *
 *  This implementation wraps the entire output in a DOCUMENT node which is 
 *  terminated with an EOF after all output has been sent.
 *
 *  If the `element` option is given the input markdown document is wrapped in 
 *  a container element using the tag name given with the `element` option. In 
 *  this case you can use the `attr` map to set attributes on the container 
 *  element.
 *
 *  The `meta` option allows setting `<meta name="" content="" />` elements in 
 *  the head of the document; for example keywords or author information.
 *
 *  Both the `header` and `footer` options are file paths; when specified the 
 *  files are loaded and parsed as markdown.
 *
 *  The data from the header file is written after the body element but before 
 *  any container element. The data for the footer file is written after any 
 *  container element and before the end of the body element.
 *
 *  If the `title` option is not given no title element is created.
 *
 *  The `style` and `script` options correspond to `link` and `script` elements 
 *  created in the head of the document, each entry should be the URL to use 
 *  for the `href` or `src` attribute.
 *
 *  When the `favicon` option is given it is a URL to an image to use as a 
 *  shortcut icon, the path should have a `.png` or `.ico` extension so that 
 *  the MIME type may be determined.
 *
 *  If the `async` option is given all `script` elements are given the `async` 
 *  attribute.
 *
 *  The `app` array lists URLs for script elements to create just before the 
 *  body element is closed; these script elements when given are guaranteed to 
 *  be the final elements before the body element is closed (after any footer 
 *  or container element).
 *
 *  You can set attributes on the html and body elements using the `html` and 
 *  `body` options.
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
 *  @option {String} media stylesheet media attribute.
 *  @option {Boolean=false} async add async attribute to script elements.
 *  @option {Object} html map of attributes for the html element.
 *  @option {Object} meta map of name and descriptions for meta elements.
 *  @option {Object} equiv map of name and content for meta http-equiv elements.
 *  @option {Object} body map of attributes for the body element.
 *  @option {String} element container element name.
 *  @option {Object} attr map of attributes for the container element.
 *  @option {Array} app paths for script elements before end of body.
 *  @option {Array|String} header include files at start of body.
 *  @option {Array|String} footer include files at end of body.
 *  @option {Boolean} markdown parse headers and footers as markdown.
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
  this.media = opts.media;

  if(!this.async) {
    // need it to be undefined
    delete this.async; 
  }

  this.html = opts.html || {};
  this.meta = opts.meta || {};
  this.equiv = opts.equiv || {};
  this.body = opts.body || {};

  // configure lang attribute
  this.html.lang = this.lang;

  this.element = opts.element;
  this.attr = opts.attr || {};

  this.app = opts.app || [];

  this.headFiles = Array.isArray(opts.header)
    ? opts.header : (opts.header ? [opts.header] : []);
  this.footFiles = Array.isArray(opts.footer)
    ? opts.footer : (opts.footer ? [opts.footer] : []);
  this.markdown = opts.markdown;

  // internal state
  this._header = false;
}

/**
 *  Stream transform.
 *
 *  @private {function} transform
 *  @member HtmlPage
 *
 *  @param {Object} chunk input node.
 *  @param {String} encoding character encoding.
 *  @param {Function} cb callback function.
 */
function transform(chunk, encoding, cb) {
  if(!this._header) {
    return this.head(chunk, cb); 
  }

  // pass through incoming data
  cb(null, chunk);
}

/**
 *  Writes the initial part of the document head.
 *
 *  This creates a DOCUMENT node to encapsualate the entire output in a single 
 *  document, the footer logic will terminate the document with an EOF.
 *
 *  @private {function} head
 *  @member HtmlPage
 *
 *  @param {Object} chunk input node.
 *  @param {Function} cb callback function.
 */
function head(chunk, cb) {
  var i
    , k
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
  for(k in this.meta) {
    this.push(element(ctag('meta', {name: k, content: this.meta[k]})));
  }

  // http-equiv meta elements
  for(k in this.equiv) {
    this.push(element(
      ctag('meta', {'http-equiv': k, content: this.equiv[k]})));
  }

  if(this.favicon) {
    this.push(element(ctag(
      'link',
      {rel: 'shortcut icon', type: mime(this.favicon), href: this.favicon})));
  }

  for(i = 0;i < this.style.length;i++) {
    href = this.style[i];
    this.push(element(ctag(
      'link', {
        rel: 'stylesheet', type: 'text/css', media: this.media, href: href})));
  }

  for(i = 0;i < this.script.length;i++) {
    href = this.script[i];
    this.push(element(
      tag('script', {type: 'text/javascript', src: href, async: this.async})
        + tag('script', true)));
  }

  var sequence = [];

  function loader(name, file, attrs) {
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
          tag(name, attrs) + esc(contents) + tag(name, true)));

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
    sequence.push(loader('style', this.css, {media: this.media})); 
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
 *  Completes the initial part of the document head injecting a document 
 *  header after the open body element when necessary.
 *
 *  @private {function} header
 *  @member HtmlPage
 *
 *  @param {Object} chunk input node.
 *  @param {Function} cb callback function.
 */
function header(chunk, cb) {
  var scope = this;

  // close head
  this.push(element(tag('head', true)));

  // open body
  this.push(element(tag('body', this.body)));

  function it(item, cb) {
    scope.parse(item, cb); 
  }

  // parse header files into the stream
  if(this.headFiles.length) {
    this.iterate(this.headFiles, it, function(err) {
      if(err) {
        return cb(err); 
      } 
      // finalize the header
      scope.finalize(chunk, cb);
    });
  }else{
    this.finalize(chunk, cb);
  }
}

/**
 *  Finalize the page header.
 *
 *  @private {function} finalize
 *  @member HtmlPage
 *
 *  @param {Object} chunk input node.
 *  @param {Function} cb callback function.
 */
function finalize(chunk, cb) {
  // add container element
  if(this.element) {
    this.push(element(tag(this.element, this.attr)));
  }

  // pass through incoming data
  this.push(chunk);
  this._header = true;
  cb();
}

/**
 *  Write the page footer injecting a footer file before the body element 
 *  is closed when necessary.
 *
 *  @private {function} flush
 *  @member HtmlPage
 *
 *  @param {Function} cb callback function.
 */
function flush(cb) {
  var scope = this;

  // close container element
  if(this.element) {
    this.push(element(tag(this.element, true)));
  }

  function it(item, cb) {
    scope.parse(item, cb); 
  }

  // parse a footer file into the stream
  if(this.footFiles.length) {
    this.iterate(this.footFiles, it, function(err) {
      if(err) {
        return cb(err); 
      } 
      // finalize the footer
      scope.footer(cb)
    });
  }else{
    this.footer(cb);
  }
}

/**
 *  Iterate a list in series calling the `it` function for each item 
 *  in the list.
 *
 *  @private {function} iterate
 *  @member HtmlPage
 *
 *  @param {Array} list array of items.
 *  @param {Function} it iterator function.
 *  @param {Function} cb callback function.
 */
function iterate(list, it, cb) {
  var item;
  function next(err) {
    if(err) {
      return cb(err); 
    }
    item = list.shift();
    if(!item) {
      return cb(); 
    }
    it(item, next);
  }
  next();
}

/**
 *  Finalize the page footer output writing an EOF to terminate the 
 *  encapsulating document.
 *
 *  @private {function} footer
 *  @member HtmlPage
 *
 *  @param {Function} cb callback function.
 */
function footer(cb) {
  var i
    , href;

  // inject app script elements before close of body
  for(i = 0;i < this.app.length;i++) {
    href = this.app[i];
    this.push(element(
      tag('script', {type: 'text/javascript', src: href, async: this.async})
        + tag('script', true)));
  }

  this.push(element(tag('body', true)));
  this.push(element(tag('html', true)));

  // close containing parent document
  this.push(Node.createNode(Node.EOF));
  cb();
}

/**
 *  Iterates a collection of functions asynchronously calling each function 
 *  in series.
 *
 *  @private {function} sequence
 *  @member HtmlPage
 *
 *  @param {Array} list collection of functions to call.
 *  @param {Function} cb callback function.
 */
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

/**
 *  Read and parse a markdown document into the stream.
 *
 *  @private {function} parse
 *  @member HtmlPage
 *
 *  @param {String} file markdown file to load.
 *  @param {Function} cb callback function.
 */
function parse(file, cb) {
  var scope = this;
  fs.readFile(file, function(err, contents) {
    if(err) {
      return cb(err); 
    }

    // not configured to parse as markdown
    if(!scope.markdown) {
      scope.push(element('' + contents)); 
      return cb();
    }

    // parse as markdown into the stream
    var stream = ast.src('' + contents);
    stream.on('data', function(chunk) {
      // pass through data
      scope.push(chunk);
    })
    stream.once('finish', cb);
  })
}

/**
 *  Escapes values for embedding in an HTML document.
 *
 *  @private {function} esc
 *
 *  @param {String} str value to escape.
 *  @param {Boolean} attr escape double quotes for attribute values.
 */
function esc(str, attr) {
  var s = str.replace(/&/gm, '&amp;');
  s = s.replace(/</gm, '&lt;');
  s = s.replace(/>/gm, '&gt;');
  if(attr) {
    s = s.replace(/"/gm, '&quot;');
  }
  return s;
}

/**
 *  Looks up the MIME type for a favicon path.
 *
 *  Recognises the .png and .ico file extensions.
 *
 *  @private {function} mime
 *
 *  @param {String} file path to the file.
 *  
 *  @returns String mime type.
 */
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

/**
 *  Create a self-closing HTML tag.
 *
 *  @private {function} ctag
 *
 *  @param {String} name element name.
 *  @param {Object} attrs map of element attributes.
 *  
 *  @returns String element.
 */
function ctag(name, attrs) {
  return tag(name, attrs, false, true); 
}

/**
 *  Create an open or close HTML tag.
 *
 *  @private {function} tag
 *
 *  @param {String} name element name.
 *  @param {Object} attrs map of element attributes.
 *  @param {Boolean} close create a closed element.
 *  @param {Boolean} terminates self-closing open element.
 *  
 *  @returns String element.
 */
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
    if(attrs[k] !== undefined) {
      str += ' ' + k;
      // NOTE: when an attribute is true it is not given a value, eg: `async`
      if(attrs[k] !== true) {
        str += '="' + esc('' + attrs[k], true) + '"';
      }
    }
  }

  if(terminates) {
    str += ' /';
  }
  str += '>';

  return str;
}

/**
 *  Create an HTML_BLOCK node.
 *
 *  @private {function} element
 *
 *  @param {String} literal content for the html block node.
 *  @param {Number} type html block type identifier.
 *  
 *  @returns Object node of the HTML_BLOCK type.
 */
function element(literal, type) {
  type = type || 6;
  return Node.createNode(
    Node.HTML_BLOCK, {_htmlBlockType: type, literal: literal});
}

HtmlPage.prototype.head = head;
HtmlPage.prototype.header = header;
HtmlPage.prototype.finalize = finalize;
HtmlPage.prototype.footer = footer;
HtmlPage.prototype.sequence = sequence;
HtmlPage.prototype.parse = parse;
HtmlPage.prototype.iterate = iterate;

module.exports = through.transform(transform, flush, {ctor: HtmlPage})
