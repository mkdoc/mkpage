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
- [Usage](#usage)
- [Help](#help)
- [API](#api)
  - [page](#page)
    - [Options](#options)
- [License](#license)

---

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
  -o, --output=[FILE]     Write output to FILE (default: stdout)
  -d, --doctype=[VAL]     Doctype declaration (default: <!doctype html>)
  -l, --lang=[VAL]        Language attribute (default: en-us)
  -t, --title=[VAL]       Document title
  -s, --style=[PATH...]   Stylesheets to use in document head
  -f, --favicon=[PATH]    Path to use for a favicon
  --html-[ATTR]=[VAL...]  Set attributes on the html element
  --meta-[NAME]=[DESC...] Set meta data in document head
  --body-[ATTR]=[VAL...]  Set attributes on the body element
  --element=[NAME]        Container element for the input document
  --attr-[NAME]=[VAL...]  Set attributes on container element
  --header=[FILE]         Include file at start of document body
  --footer=[FILE]         Include file at end of document body
  -h, --help              Display help and exit
  --version               Print the version and exit

mkpage@1.0.0
```

## API

### page

```javascript
page([opts][, cb])
```

Create an HTML page.

Returns an output stream.

* `opts` Object processing options.
* `cb` Function callback function.

#### Options

* `input` Readable input stream.
* `output` Writable output stream.

## License

MIT

---

Created by [mkdoc](https://github.com/mkdoc/mkdoc) on April 15, 2016

[mkdoc]: https://github.com/mkdoc/mkdoc
[mkparse]: https://github.com/mkdoc/mkparse
[commonmark]: http://commonmark.org
[jshint]: http://jshint.com
[jscs]: http://jscs.info
