# Page

<? @include readme/badges.md ?>

> Create an HTML page

Converts a markdown document stream to a full HTML page with html, head and body elements.

<? @include {=readme} install.md ?>

***
<!-- @toc -->
***

## Usage

Create the stream and write a [commonmark][] document:

<? @source {javascript=s/\.\.\/index/mkpage/gm} usage.js ?>

<? @include {=readme} help.md ?>

<? @exec mkapi index.js --title=API --level=2 ?>
<? @include {=readme} license.md links.md ?>
