module.exports = {
  opts: {
    entry: 'a.js',
    basedir: __dirname + '/data'
  },
  tree: [
    {
      "id": "a.js",
      "deps": {
        "1": "b.js"
      },
      "source": "var b = require('b.js');\n\nmodule.exports = function (n) { \n  console.log(b(n));\n}",
      "entry": true,
      "stylesheet": "a.less"
    },
    {
      "id": "b.js",
      "deps": {},
      "source": "module.exports = function (n) { \n  return [\n    requireFile('b.html'),\n    (n * 42)\n  ].join(\"\\n\");\n};"
    }
  ]
};