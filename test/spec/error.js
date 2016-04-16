var expect = require('chai').expect
  , fs = require('fs')
  , mkast = require('mkast')
  , parser = new mkast.Parser()
  , mkpage = require('../../index');

describe('mkpage:', function() {
  
  it('should error with missing style file (css)', function(done) {
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
          css: 'non-existent.css'
        };
    
    mkpage(opts, function(err) {
      function fn() {
        throw err; 
      } 
      expect(fn).throws(/ENOENT/);
      done();
    });

  });

  it('should error with missing script file (javascript)', function(done) {
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
          javascript: 'non-existent.js'
        };
    
    mkpage(opts, function(err) {
      function fn() {
        throw err; 
      } 
      expect(fn).throws(/ENOENT/);
      done();
    });

  });

  it('should error with missing header file', function(done) {
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
          header: 'non-existent.md'
        };
    
    mkpage(opts, function(err) {
      function fn() {
        throw err; 
      } 
      expect(fn).throws(/ENOENT/);
      done();
    });

  });

  it('should error with missing footer file', function(done) {
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
          footer: 'non-existent.md'
        };
    
    mkpage(opts, function(err) {
      function fn() {
        throw err; 
      } 
      expect(fn).throws(/ENOENT/);
      done();
    });

  });

});
