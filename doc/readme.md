# Page

<? @include readme/badges.md ?>

> Create an HTML page

Converts a markdown document stream to a full HTML page with html, head and body elements.

<? @include {=readme} install.md ?>

***
<!-- @toc -->
***

<? @include {=readme} example.md usage.md help.md ?>

<? @exec mkapi index.js html-page.js --title=API --level=2 ?>
<? @include {=readme} license.md links.md ?>
