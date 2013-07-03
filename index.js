var detective = require('detective');
var pack = require('browser-pack');
var async = require('async');

var util = require('util');
var path = require('path');
var fs = require('fs');

var less = require('./less');
var coffee = require('./coffee');

module.exports = function (opts) {
  return new Assetify(opts);
};

function Assetify (opts) {
  var self = this;

  self.visited = [];
  self.opts = opts;

  self.tree = [];
  self.walk();
}

Assetify.prototype.process = function(callback) {
  var self = this;

  async.forEach(self.tree, function(item, cb) {
    if (!item.css) return cb();
    less(item.css, function(content) {
      item.css = content;
      cb();
    });
  }, function(err) {
      if (err) throw err;
      if (callback) callback();
  });
};

Assetify.prototype.walk = function (filename, parent) {
  var self = this;
  var filename = path.normalize(
    filename ? filename : self.opts.entry
  );

  if (self.visited[filename]) return;
  self.visited[filename] = true;

  var filepath = path.resolve(util.format(
    '%s/%s', self.opts.basedir, filename
  ));

  var source = fs.readFileSync(filepath, 'utf-8');
  var deps = detective(source);

  var resolved = {};
  var index = 0;

  deps.forEach(function (file) {
    resolved[++index] = path.normalize(file);
  });

  var current = {
    id: filename, 
    source: source,
    deps: resolved
  };

  if (!parent) {
    current.entry = true;
  }

  var less = path.resolve(util.format(
    '%s/%s.less', self.opts.basedir, filename.slice(
      0, filename.length - path.extname(filename).length
    )
  ));

  if (fs.existsSync(less)) {
    current.css = less;
  }

  if (coffee.isCoffee(filename)) {
    current.source = coffee.compile(current.source);
  }

  self.tree.push(current);

  deps.forEach(function (filename) {
    self.walk(filename, current);
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
  var build = util.format("require = %s }, {}, []);", source)

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

  self.tree.forEach(function(item) {
    if (item.css) {
      self.css.push(item.css);
    }
  });

  fs.writeFile(output, self.css.join(''), function(err) {
    if (err) throw err;
  });
};

Assetify.prototype.isCoffee = function (file) {
    return /\.((lit)?coffee|coffee\.md)$/.test(file);
};