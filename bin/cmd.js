#!/usr/bin/env node

var argv = require('optimist').argv;
var assetify = require('./../index');

if (!argv.entryPoint || !argv.baseDir) {
  process.stderr.write("Please provide --entryPoint=<file> and -baseDir=<directory>\n");
  process.exit();
}

var b = assetify({
  entry: argv.entryPoint,
  basedir: argv.baseDir
});

b.process(function() {
  if (argv.outputTree) {
    console.log(JSON.stringify(b.tree, null, 2));
    process.exit(0);
  }

  b.bundleJS(argv.outputJS);
  b.bundleCSS(argv.outputCSS);
});