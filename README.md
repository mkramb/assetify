Assets manager
========

**Installing**

    npm init

**Running tests**

    npm test

**Example usage**

    bin/cmd.js --baseDir=./test --entryPoint=./a.js
    bin/cmd.js --baseDir=./test --entryPoint=./a.js --outputTree
    bin/cmd.js --baseDir=./test --entryPoint=./a.js --outputJS=./bundle.js --outputCSS=./bundle.css    

**Directives**

    // follows CommonJS modules (like browserify)
    require('a.js')

    // compiles to javascript on the fly
    require('a.coffee')

    // adds LESS stylesheet to CSS build
    require.stylesheet('a.less') 

    // replaces function call with loaded string
    require.file('a.html')
