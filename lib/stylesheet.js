var less = require('less');
var fs = require('fs');

module.exports = {
  compile: parse
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

function parse (filename, compress, callback) {
  options.yuicompress = options.compress = compress;

  fs.readFile(filename, 'utf8', function(err, data) {
    if (err) throw err;

    options.filename = filename;
    var parser = new (less.Parser)(options);

    parser.parse(data, function (err, tree) {
      if (err) {
        less.writeError(err);
      } 
      else {
        try {
          callback(tree.toCSS(options));
        }
        catch (e) {
          less.writeError(e);
        }
      }
    });
  });
}
