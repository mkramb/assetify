var less = require('less');
var fs = require('fs');

module.exports = {
  compile: parse,
  getOptions: function() {
    return options;
  }
};

var options = {
  depends: false,
  compress: false,
  yuicompress: false,
  max_line_len: -1,
  optimization: 1,
  silent: false,
  verbose: false,
  lint: false,
  paths: [],
  color: true,
  strictImports: false,
  rootpath: '',
  relativeUrls: false,
  ieCompat: true,
  strictMath: false,
  strictUnits: false
};

function parse (filename, callback) {
  fs.readFile(filename, 'utf8', function(err, data) {
    if (err) throw err;

    options.filename = filename;
    var parser = new (less.Parser)(options);

    parser.parse(data, function (err, tree) {
      if (err) {
        less.writeError(err);
      } 
      else {
        callback(tree);
      }
    });
  });
}
