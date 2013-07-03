var detective = require('detective');
var pack = require('browser-pack');
var async = require('async');

var util = require('util');
var path = require('path');
var fs = require('fs');

var file = require('./lib/file');
var less = require('./lib/less');
var coffee = require('./lib/coffee');

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

Assetify.prototype.process = function (callback) {
  var self = this;

  async.forEach(self.tree, function(item, done) {
    var filePath = path.resolve(util.format(
      '%s/%s', self.opts.basedir, item.id
    ));

    if (coffee.isCoffee(item.id)) {
      item.source = coffee.compile(item.source);
    }

    item.source = file.transform(
      item.source, path.dirname(filePath)
    );
    
    if (!item.stylesheet) {
      return done();
    }
    else {
      var stylesheetPath = path.resolve(util.format(
        '%s/%s', self.opts.basedir, item.stylesheet
      ));

      if (item.stylesheet.indexOf('.less') > 0) {
        less.compile(stylesheetPath, function(content) {
          item.stylesheet = content;
          done();
        });
      }
      else {
        item.stylesheet = fs.readFileSync(filePath, 'utf-8')
        done();
      }
    }
  }, function(err) {
      if (err) throw err;
      if (callback) callback();
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

  var lessName = util.format('%s.less', fileName.slice(
    0, fileName.length - path.extname(fileName).length
  ));

  var lessPath = path.resolve(util.format(
    '%s/%s', self.opts.basedir, lessName
  ));

  if (fs.existsSync(lessPath)) {
    current.stylesheet = lessName;
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
    if (item.stylesheet) {
      self.css.push(item.stylesheet);
    }
  });

  fs.writeFile(output, self.css.join(''), function(err) {
    if (err) throw err;
  });
};
