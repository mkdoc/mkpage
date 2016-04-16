var expect = require('chai').expect
  , mkpage = require('../../index');

describe('mkpage:', function() {
  
  it('should return stream with no options', function(done) {
    var stream = mkpage();
    expect(stream).to.be.an('object');
    done();
  });

});
