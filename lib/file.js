var falafel = require('falafel');

var util = require('util');
var path = require('path');
var fs = require('fs');

module.exports = {
  transform: loadFiles
};

function isKeyword (id) {
  if (id === 'requireFile') return true;
}

function loadFiles (source, basedir) {
  return falafel(source, {
      isKeyword: isKeyword, 
      tolerant: true 
    },
    function (node) {
      if (node.type === 'UnaryExpression') {
        if (node.argument && node.argument.value) {
          var filepath = path.resolve(util.format(
            '%s/%s', basedir, new String(node.argument.value).trim()
          ));

          node.update(JSON.stringify(
            fs.readFileSync(filepath, 'utf-8')
          ));
        }
      }
    }
  ).toString();
}