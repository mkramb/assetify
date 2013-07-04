Assets manager
========

**Installing**

    npm init

**Running tests**

    npm test

**Usage**

    bin/cmd.js --help
    bin/cmd.js --baseDir=./test --entryPoint=./a.js
    bin/cmd.js --baseDir=./test --entryPoint=./a.js --outputTree
    bin/cmd.js --baseDir=./test --entryPoint=./a.js --outputJS=./b.js --outputCSS=./b.css
    bin/cmd.js --baseDir=./test --entryPoint=./a.js --outputJS=./b.js --outputCSS=./b.css --compress
    bin/cmd.js --baseDir=./test --entryPoint=./a.js --outputJS=./b.js --outputCSS=./b.css --watchFiles

**Directives**

    // follows CommonJS modules (like browserify)
    require('a.js')

    // compiles to javascript on the fly
    require('a.coffee')

    // replaces function call with loaded string
    require.file('a.html')

    // adds LESS stylesheet to CSS build
    require.less('a.less') 

    // add global LESS stylesheet, which is global (exposes all variables)
    require.lessGlobal('global.less') 
