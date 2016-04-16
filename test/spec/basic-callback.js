var expect = require('chai').expect
  , fs = require('fs')
  , mkast = require('mkast')
  , Node = mkast.Node
  , parser = new mkast.Parser()
  , mkpage = require('../../index')
  , utils = require('../util');

describe('mkpage:', function() {
  
  it('should create basic html page w/ callback', function(done) {
    var source = 'test/fixtures/page.md'
      , target = 'target/page.json.log'
      , data = parser.parse('' + fs.readFileSync(source))

    // mock file for correct relative path
    // mkcat normally injects this info
    data.file = source;

    var input = mkast.serialize(data)
      , output = fs.createWriteStream(target)
      , opts = {input: input, output: output};
    
    function onFinish() {
      var result = utils.result(target);

      // open document
      expect(result[0].type).to.eql(Node.DOCUMENT);

      // NOTE: main assertions in basic.js

      // eof main document
      expect(result[13].type).to.eql(Node.EOF);
      done();
    }

    mkpage(opts, onFinish);

  });

});
