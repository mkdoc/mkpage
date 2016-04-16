var expect = require('chai').expect
  , fs = require('fs')
  , mkast = require('mkast')
  , Node = mkast.Node
  , parser = new mkast.Parser()
  , mkpage = require('../../index')
  , utils = require('../util');

describe('mkpage:', function() {
  
  it('should return stream with no options', function(done) {
    var stream = mkpage();
    expect(stream).to.be.an('object');
    done();
  });

  it('should create html page', function(done) {
    var source = 'test/fixtures/page.md'
      , target = 'target/page.json.log'
      , data = parser.parse('' + fs.readFileSync(source))

    // mock file for correct relative path
    // mkcat normally injects this info
    data.file = source;

    var input = mkast.serialize(data)
      , output = fs.createWriteStream(target)
      , opts = {input: input, output: output};
    
    mkpage(opts);

    output.once('finish', function() {
      var result = utils.result(target);

      expect(result).to.be.an('array');

      // open document
      //expect(result[0].type).to.eql(Node.DOCUMENT);

      // mock document
      //expect(result[1].type).to.eql(Node.HEADING);
      //expect(result[2].type).to.eql(Node.PARAGRAPH);

      // eof main document
      //expect(result[3].type).to.eql(Node.EOF);

      done();
    })
  });

});
