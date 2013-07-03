var parser = require('coffee-script');

module.exports = {
  isCoffee: function (file) {
    return /\.((lit)?coffee|coffee\.md)$/.test(file);
  },
  compile: function(source) {
    return parser.compile(source, {
      inline: true
    });
  }
};