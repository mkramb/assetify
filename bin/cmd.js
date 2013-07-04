#!/usr/bin/env node

var fs = require('fs');
var util = require('util');

var argv = require('optimist')
  .default('watchTimeout', 1000).argv;

var assetify = require('./../index');

if (argv.help) {
  console.log([
    "\nList of arguments:",
    " --baseDir=<directory>",
    " --entryPoint=<file>",
    " --outputJS=<filepath>",
    " --outputCSS=<filepath>",
    " --outputTree",
    " --watchTimeout=<milliseconds>",
    " --watchFiles",
    " --compress",
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
  basedir: argv.baseDir,
  compress: !!argv.compress,
  argv: argv
});

if (argv.outputTree) {
  console.log(JSON.stringify(b.tree, null, 2));
  process.exit(0);
}

if (argv.watchFiles) {
  var pending = false;
  console.log("\nWatching files for changes:");

  b.on('dep', function(item) {
    var type = Object.keys(item);

    if (type.length) {
      var filename = item[type.pop()];

      fs.watch(filename, function (event) {
        if (event === 'change') {

          if (!pending) {
            setTimeout(function () {
              pending = false;
              b.emit('update');

              console.log(util.format(
                ' * Updating: %s ', filename
              ));
            }, argv.watchTimeout);
          }
          
          pending = true;
        }
      });
    }
  });
}

b.process(function() {
  b.bundleCSS(argv.outputCSS);

  if (!argv.outputCSS || argv.outputJS) {
    b.bundleJS(argv.outputJS);
  }  
});