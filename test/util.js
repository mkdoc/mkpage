var fs = require('fs');

function getResult(target) {
  var result = ('' + fs.readFileSync(target)).trim().split('\n');
  result = result.map(function(line) {
    var o = JSON.parse(line)
      //, n = Node.createNode(o._type, o);
    //return n;
    return o;
  })
  return result;
}

module.exports = {
  result: getResult
}
