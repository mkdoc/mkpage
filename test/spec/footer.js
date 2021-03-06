var expect = require('chai').expect
  , fs = require('fs')
  , mkast = require('mkast')
  , parser = new mkast.Parser()
  , mkpage = require('../../index')
  , utils = require('../util');

describe('mkpage:', function() {
  
  it('should create html page w/ footer as markdown', function(done) {
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
          footer: 'test/fixtures/footer.md',
          markdown: true
        };
    
    mkpage(opts);

    output.once('finish', function() {
      var result = utils.result(target);
      expect(result[12].firstChild.literal).to.eql('Footer');
      done();
    })
  });

  it('should create html page w/ footer as html', function(done) {
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
          footer: ['test/fixtures/footer.md']
        };
    
    mkpage(opts);

    output.once('finish', function() {
      var result = utils.result(target);
      expect(result[11].literal).to.eql('# Footer\n');
      done();
    })
  });

});
