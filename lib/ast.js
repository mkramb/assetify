var falafel = require('falafel');

var util = require('util');
var path = require('path');
var fs = require('fs');

module.exports = {
  transform: transformAst
};

var commands = {
  'lessGlobal': lessGlobalHandler,
  'less': lessHandler,
  'file': fileHandler
};

function isRequire (id) {
  if (id === 'require.') return true;
}

function transformAst (source, basedir, callback) {
  var results = [];
  var output = falafel(source, {
      isKeyword: isRequire, 
      tolerant: true 
    },
    function (node) {
      if (node.type === 'Literal') {
        var callee = node.parent.callee;

        if (callee && callee.property) {
          var value = node.value;
          var command = callee.property.name;

          if (Object.keys(commands).indexOf(command) !== -1) {
            var result = commands[command](value, node, basedir);

            if (result) {
              results.push(result);
            }
          }
        }
      }
    }
  );

  if (callback) {
    callback(results);
  }

  return output.toString()
}

function fileHandler (value, node, basedir) {
  var filePath = path.resolve(util.format(
    '%s/%s', basedir, new String(value).trim()
  ));

  node.parent.update(JSON.stringify(
    fs.readFileSync(filePath, 'utf-8')
  ));

  return;
}

function lessHandler (value, node, basedir) {
  var filePath = path.resolve(util.format(
    '%s/%s', basedir, new String(value).trim()
  ));

  node.parent.update(util.format(
    "// %s", node.parent.source()
  ));

  return {
    'stylesheet': filePath
  };
}

function lessGlobalHandler (value, node, basedir) {
  var result = lessHandler(
    value, node, basedir
  );

  result.global = true;
  return result;
}