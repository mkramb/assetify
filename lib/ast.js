var falafel = require('falafel');

var util = require('util');
var path = require('path');
var fs = require('fs');

module.exports = {
  loadFiles: loadFiles,
  loadStylesheets: loadStylesheets
};

function isRequireFile (id) {
  if (id === 'requireFile') return true;
}

function loadFiles (source, basedir) {
  return falafel(source, {
      isKeyword: isRequireFile, 
      tolerant: true 
    },
    function (node) {
      if (node.type === 'UnaryExpression') {
        if (node.argument && node.argument.value) {
          var filePath = path.resolve(util.format(
            '%s/%s', basedir, new String(node.argument.value).trim()
          ));

          node.update(JSON.stringify(
            fs.readFileSync(filePath, 'utf-8')
          ));
        }
      }
    }
  ).toString();
}

function isRequireStylesheet (id) {
  if (id === 'requireStylesheet') return true;
}

function loadStylesheets (source, basedir, callback) {
  var stylesheets = [];
  var output = falafel(source, {
      isKeyword: isRequireStylesheet, 
      tolerant: true 
    },
    function (node) {
      if (node.type === 'UnaryExpression') {
        if (node.argument && node.argument.value) {
          var filePath = path.resolve(util.format(
            '%s/%s', basedir, new String(node.argument.value).trim()
          ));

          node.update(util.format("// %s", node.source()));
          stylesheets.push(filePath);
        }
      }
    }
  );

  callback(stylesheets);
  return output.toString();
}