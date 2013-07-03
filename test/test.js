var should = require('should');

var assetify = require("./../index");
var data = require("./data");

describe('Assetify', function () {
  var b = assetify(data.opts);

  it('should generate a tree', function() {
    should.exist(b.tree);

    (JSON.stringify(b.tree)).should.equal(
      JSON.stringify(data.tree)
    );
  });
});