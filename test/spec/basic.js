var expect = require('chai').expect
  , fs = require('fs')
  , mkast = require('mkast')
  , Node = mkast.Node
  , parser = new mkast.Parser()
  , mkpage = require('../../index')
  , utils = require('../util');

describe('mkpage:', function() {
  
  it('should create basic html page', function(done) {
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

      // open document
      expect(result[0].type).to.eql(Node.DOCUMENT);

      // doctype
      expect(result[1].type).to.eql(Node.HTML_BLOCK);
      expect(result[1].htmlBlockType).to.eql(4);
      expect(result[1].literal).to.eql('<!doctype html>');

      // html open
      expect(result[2].type).to.eql(Node.HTML_BLOCK);
      expect(result[2].htmlBlockType).to.eql(6);
      expect(result[2].literal).to.eql('<html lang="en-us">');

      // open head
      expect(result[3].type).to.eql(Node.HTML_BLOCK);
      expect(result[3].literal).to.eql('<head>');

      // meta charset
      expect(result[4].type).to.eql(Node.HTML_BLOCK);
      expect(result[4].literal).to.eql('<meta charset="utf-8" />');

      // close head
      expect(result[5].type).to.eql(Node.HTML_BLOCK);
      expect(result[5].literal).to.eql('</head>');

      // open body
      expect(result[6].type).to.eql(Node.HTML_BLOCK);
      expect(result[6].literal).to.eql('<body>');

      // mock document
      expect(result[7].type).to.eql(Node.DOCUMENT);
      expect(result[8].type).to.eql(Node.HEADING);
      expect(result[9].type).to.eql(Node.PARAGRAPH);
      expect(result[10].type).to.eql(Node.EOF);

      // close body
      expect(result[11].type).to.eql(Node.HTML_BLOCK);
      expect(result[11].literal).to.eql('</body>');

      // close html
      expect(result[12].type).to.eql(Node.HTML_BLOCK);
      expect(result[12].literal).to.eql('</html>');

      // eof main document
      expect(result[13].type).to.eql(Node.EOF);
      done();
    })
  });

});
