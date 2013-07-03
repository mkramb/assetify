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

    require('a.js') // follows CommonJS modules (like browserify)
    require('a.coffee') // compiles to javascript on the fly
    requireStylesheet('a.less') // adds stylesheet to CSS build
    requireFile('a.html') // replaces function call with loaded string
