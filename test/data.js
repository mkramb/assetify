module.exports = {
  opts: {
    entry: 'a.js',
    basedir: './test/data'
  },
  tree: [
    {
      "id": "a.js",
      "deps": {
        "1": "b.js"
      },
      "source": "var b = require('b.js');\n\nmodule.exports = function (n) { \n  console.log(b(n));\n}",
      "entry": true,
      "css": "body {\n  background-color: #ff0000;\n}\n"
    },{
      "id": "b.js",
      "deps": {},
      "source": "module.exports = function (n) { \n  return [\n    \"<h1>Output</h1>\",\n    (n * 42)\n  ].join(\"\\n\");\n};"
    }
  ]
};