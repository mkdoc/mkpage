var page = require('../index')
  , ast = require('mkast');
ast.src('## Heading\n\nParagraph.')
  .pipe(page())
  .pipe(ast.stringify({indent: 2}))
  .pipe(process.stdout);
