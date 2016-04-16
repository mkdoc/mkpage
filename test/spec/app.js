var expect = require('chai').expect
  , fs = require('fs')
  , mkast = require('mkast')
  , parser = new mkast.Parser()
  , mkpage = require('../../index')
  , utils = require('../util');

describe('mkpage:', function() {
  
  it('should create html page w/ app and async', function(done) {
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
          // trigger mime lookup code path for .ico extension
          favicon: '/favicon.ico',
          async: true,
          app: ['app1.js', 'app2.js']
        };
    
    mkpage(opts);

    output.once('finish', function() {
      var result = utils.result(target);
      expect(result[12].literal)
        .to.eql(
          '<script type="text/javascript" src="app1.js" async></script>');
      expect(result[13].literal)
        .to.eql(
          '<script type="text/javascript" src="app2.js" async></script>');
      done();
    })
  });

});
