var expect = require('chai').expect
  , fs = require('fs')
  , mkast = require('mkast')
  , parser = new mkast.Parser()
  , mkpage = require('../../index')
  , utils = require('../util');

describe('mkpage:', function() {
  
  it('should create html page w/ inline style (css)', function(done) {
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
          css: 'test/fixtures/style.css'
        };
    
    mkpage(opts);

    output.once('finish', function() {
      var result = utils.result(target);
      expect(result[5].literal)
        .to.eql(
          '<style>\nbody{background:blue;}\n</style>');
      done();
    })
  });

});
