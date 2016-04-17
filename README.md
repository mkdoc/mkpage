# Page

[![Build Status](https://travis-ci.org/mkdoc/mkpage.svg?v=3)](https://travis-ci.org/mkdoc/mkpage)
[![npm version](http://img.shields.io/npm/v/mkpage.svg?v=3)](https://npmjs.org/package/mkpage)
[![Coverage Status](https://coveralls.io/repos/mkdoc/mkpage/badge.svg?branch=master&service=github&v=3)](https://coveralls.io/github/mkdoc/mkpage?branch=master)

> Create an HTML page

Converts a markdown document stream to a full HTML page with html, head and body elements.

## Install

```
npm i mkpage --save
```

For the command line interface install [mkdoc][] globally (`npm i -g mkdoc`).

---

- [Install](#install)
- [Example](#example)
- [Usage](#usage)
- [Help](#help)
- [API](#api)
  - [page](#page)
    - [Options](#options)
  - [HtmlPage](#htmlpage)
    - [Options](#options-1)
- [License](#license)

---

## Example

Create an HTML page:

```shell
mkcat README.md | mkpage --title=README | mkout -H > README.html
```

Use a stylesheet:

```shell
mkcat README.md | mkpage --title=README --style=style.css | mkout -H > README.html
```

## Usage

Create the stream and write a [commonmark][] document:

```javascript
var page = require('mkpage')
  , ast = require('mkast');
ast.src('## Heading\n\nParagraph.')
  .pipe(page())
  .pipe(ast.stringify({indent: 2}))
  .pipe(process.stdout);
```

## Help

```
Usage: mkpage [options]

Options
  -d, --doctype=[VAL]     Doctype declaration (default: <!doctype html>)
  -r, --charset=[VAL]     Document charset (default: utf-8)
  -l, --lang=[VAL]        Language attribute (default: en-us)
  -t, --title=[VAL]       Document title
  -s, --style=[PATH...]   Paths for link elements
  -S, --script=[PATH...]  Paths for script elements
  -c, --css=[FILE]        Create style element from FILE
  -j, --javascript=[FILE] Create script element from FILE
  -f, --favicon=[PATH]    Path to use for a favicon
  --html-[ATTR]=[VAL...]  Set attributes on the html element
  --meta-[NAME]=[DESC...] Set meta data in document head
  --body-[ATTR]=[VAL...]  Set attributes on the body element
  --element=[NAME]        Container element for the input document
  --attr-[NAME]=[VAL...]  Set attributes on container element
  --app=[PATH...]         Script elements before the end of the body
  --header=[FILE]         Include file at start of document body
  --footer=[FILE]         Include file at end of document body
  --async                 Add async attribute to script elements
  -h, --help              Display help and exit
  --version               Print the version and exit

mkpage@1.0.1
```

## API

### page

```javascript
page([opts][, cb])
```

Create an HTML page.

See [HtmlPage](#htmlpage) for more options.

Returns an output stream.

* `opts` Object processing options.
* `cb` Function callback function.

#### Options

* `input` Readable input stream.
* `output` Writable output stream.

### HtmlPage

```javascript
HtmlPage([opts])
```

Wraps a document stream with HTML code blocks for the doctype, html, head
and body element.

This implementation wraps the entire output in a DOCUMENT node which is
terminated with an EOF after all output has been sent.

If the `element` option is given the input markdown document is wrapped in
a container element using the tag name given with the `element` option. In
this case you can use the `attr` map to set attributes on the container
element.

The `meta` option allows setting `<meta name="" content="" />` elements in
the head of the document; for example keywords or author information.

Both the `header` and `footer` options are file paths; when specified the
files are loaded and parsed as markdown.

The data from the header file is written after the body element but before
any container element. The data for the footer file is written after any
container element and before the end of the body element.

If the `title` option is not given no title element is created.

The `style` and `script` options correspond to `link` and `script` elements
created in the head of the document, each entry should be the URL to use
for the `href` or `src` attribute.

When the `favicon` option is given it is a URL to an image to use as a
shortcut icon, the path should have a `.png` or `.ico` extension so that
the MIME type may be determined.

If the `async` option is given all `script` elements are given the `async`
attribute.

The `app` array lists URLs for script elements to create just before the
body element is closed; these script elements when given are guaranteed to
be the final elements before the body element is closed (after any footer
or container element).

You can set attributes on the html and body elements using the `html` and
`body` options.

* `opts` Object stream options.

#### Options

* `doctype` String document type declaration.
* `lang` String=en-us language attribute for the html element.
* `charset` String=utf-8 document character set.
* `title` String document title.
* `style` Array paths for link elements.
* `script` Array paths for script elements.
* `css` String file path to inline css contents.
* `javascript` String file path to inline javascript contents.
* `favicon` String path to use for a favicon link element.
* `async` Boolean=false add async attribute to script elements.
* `html` Object map of attributes for the html element.
* `meta` Object map of name and descriptions for meta elements.
* `body` Object map of attributes for the body element.
* `element` String container element name.
* `attr` Object map of attributes for the container element.
* `app` Array paths for script elements before end of body.
* `header` String include file at start of body.
* `footer` String include file at end of body.

## License

MIT

---

Created by [mkdoc](https://github.com/mkdoc/mkdoc) on April 17, 2016

[mkdoc]: https://github.com/mkdoc/mkdoc
[mkparse]: https://github.com/mkdoc/mkparse
[commonmark]: http://commonmark.org
[jshint]: http://jshint.com
[jscs]: http://jscs.info

