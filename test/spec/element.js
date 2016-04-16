var expect = require('chai').expect
  , fs = require('fs')
  , mkast = require('mkast')
  , parser = new mkast.Parser()
  , mkpage = require('../../index')
  , utils = require('../util');

describe('mkpage:', function() {
  
  it('should create html page w/ container element', function(done) {
    var source = 'test/fixtures/page.md'
      , target = 'target/page.json.log'
      , data = parser.parse('' + fs.readFileSync(source))

    // mock file for correct relative path
    // mkcat normally injects this info
    data.file = source;

    var input = mkast.serialize(data)
      , output = fs.createWriteStream(target)
      , opts = {
          input: input,
          output: output,
          element: 'section',
          attr: {
            class: 'article'
          }
        };
    
    mkpage(opts);

    output.once('finish', function() {
      var result = utils.result(target);
      expect(result[7].literal)
        .to.eql(
          '<section class="article">');
      expect(result[12].literal)
        .to.eql(
          '</section>');
      done();
    })
  });

});
