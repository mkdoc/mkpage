var expect = require('chai').expect
  , fs = require('fs')
  , mkast = require('mkast')
  , parser = new mkast.Parser()
  , mkpage = require('../../index')
  , utils = require('../util');

describe('mkpage:', function() {
  
  it('should create html page w/ inline script (javascript)', function(done) {
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
          javascript: 'test/fixtures/script.js'
        };
    
    mkpage(opts);

    output.once('finish', function() {
      var result = utils.result(target);
      expect(result[5].literal)
        .to.eql(
          '<script>\nmodule.exports = {};\n</script>');
      done();
    })
  });

  it('should create html page w/ inline script (lead newline)',
    function(done) {
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
            javascript: 'test/fixtures/script-leading-newline.js'
          };
      
      mkpage(opts);

      output.once('finish', function() {
        var result = utils.result(target);
        expect(result[5].literal)
          .to.eql(
            '<script>\nmodule.exports = {};\n</script>');
        done();
      })
    }
  );

  it('should create html page w/ inline script (trail newline)',
    function(done) {
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
            javascript: 'test/fixtures/script-no-trailing-newline.js'
          };
      
      mkpage(opts);

      output.once('finish', function() {
        var result = utils.result(target);
        expect(result[5].literal)
          .to.eql(
            '<script>\nmodule.exports = {};\n</script>');
        done();
      })
    }
  );

});
