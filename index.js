var detective = require('detective');
var uglifyJS = require("uglify-js");
var pack = require('browser-pack');
var async = require('async');

var util = require('util');
var path = require('path');
var fs = require('fs');

var ast = require('./lib/ast');
var coffee = require('./lib/coffee');
var stylesheet = require('./lib/stylesheet');

module.exports = function (opts) {
  return new Assetify(opts);
};

function Assetify (opts) {
  var self = this;

  self.visited = [];
  self.opts = opts;

  self.tree = [];
  self.globals = {
    stylesheet: {
      style: [],
      vars: []
    }
  };

  self.walk();
}

Assetify.prototype.process = function (callback) {
  var self = this;

  async.forEach(self.tree, function(item, done) {
    var filePath = path.resolve(util.format(
      '%s/%s', self.opts.basedir, item.id
    ));

    if (coffee.isCoffee(item.id)) {
      item.source = coffee.compile(item.source);
    }

    item.source = ast.transform(
      item.source, path.dirname(filePath), function(results) {
        if (!results.length) {
          done();
        }
        else {
          var count = 0;

          async.whilst(
            function () {
              return results.length > count;
            },
            function (callback) {
              var result = results[count];

              if (result && result.stylesheet) {
                stylesheet.compile(result.stylesheet, function(tree) {
                  if (result.global) {
                    self.globals.stylesheet.style.push(tree);

                    tree.rules.forEach(function(rule) {
                      if (rule.variable === true) {
                        self.globals.stylesheet.vars.push(rule);
                      }
                    });
                  }
                  else {
                    if (!item.stylesheet) {
                      item.stylesheet = tree;
                    }
                    else {
                      tree.rules.forEach(function(rule) {
                        item.stylesheet.rules.push(rule);
                      });
                    }
                  }

                  count++, callback();
                });
              }
            },
            function (err) {
              done();
            }
          );
        }
      }
    );
  },
  function(err) {
    if (err) throw err;

    if (callback) {
      callback();
    }
  });
};

Assetify.prototype.walk = function (fileName, parentNode) {
  var self = this;

  var fileName = path.normalize(
    fileName ? fileName : self.opts.entry
  );

  if (self.visited[fileName]) return;
  self.visited[fileName] = true;

  var filePath = path.resolve(util.format(
    '%s/%s', self.opts.basedir, fileName
  ));

  var current = {
    id: fileName, deps: {},
    source: fs.readFileSync(filePath, 'utf-8')
  };

  var deps = detective(current.source);
  var index = 0;

  deps.forEach(function (file) {
    current.deps[++index] = path.normalize(file);
  });

  if (!parentNode) {
    current.entry = true;
  }

  self.tree.push(current);

  deps.forEach(function (fileName) {
    self.walk(fileName, current);
  });
};

Assetify.prototype.bundleJS = function (output) {  
  var self = this;

  var source = '';
  var p = pack();

  p.on('data', function (buf) {
    source += buf; 
  });

  p.write(JSON.stringify(self.tree));

  var build = util.format(
    "require = %s }, {}, []);", source
  );

  if (self.opts.compress) {
    build = uglifyJS.minify(build, {
      fromString: true
    }).code;
  }

  if (output) {
    fs.writeFile(output, build, function(err) {
      if (err) throw err;
    });
  }
  else {
    process.stdout.write(build);
  }
};

Assetify.prototype.bundleCSS = function (output) {
  var self = this;
  self.css = [];

  if (!output) {
    return;
  }

  var options = stylesheet.getOptions();
  options.yuicompress = options.compress = self.opts.compress;

  self.globals.stylesheet.style.forEach(function(globalTree) {
    self.css.push(globalTree.toCSS(options));
  });

  self.tree.forEach(function(item) {
    if (item.stylesheet) {
      self.globals.stylesheet.vars.forEach(function(varRule) {
        item.stylesheet.rules.unshift(varRule);
      });

      self.css.push(item.stylesheet.toCSS(options));
    }
  });

  fs.writeFile(output, self.css.join(''), function(err) {
    if (err) throw err;
  });
};
