var expect = require('chai').expect
  , mkpage = require('../../index')
  , HtmlPage = require('../../html-page');

describe('mkpage:', function() {
  
  it('should return stream with no options', function(done) {
    var stream = mkpage();
    expect(stream).to.be.an('object');
    done();
  });

  it('should create stream with no options', function(done) {
    var stream = new HtmlPage();
    expect(stream).to.be.an('object');
    done();
  });

  it('should create stream with async option', function(done) {
    var stream = new HtmlPage({async: true});
    expect(stream).to.be.an('object');
    done();
  });

});
