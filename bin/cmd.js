#!/usr/bin/env node

var argv = require('optimist').argv;
var assetify = require('./../index');

if (argv.help) {
  console.log([
    "\nList of arguments:",
    " --baseDir=<directory>",
    " --entryPoint=<file>",
    " --outputJS=<filepath>",
    " --outputCSS=<filepath>",
    " --outputTree",
    " --help\n"
  ].join("\n"));
  process.exit();
}

if (!argv.entryPoint || !argv.baseDir) {
  process.stderr.write([
    "\nPlease provide --baseDir=<directory> and --entryPoint=<file> to run.",
    "Use --help for list of all arguments\n\n"
  ].join("\n"));
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