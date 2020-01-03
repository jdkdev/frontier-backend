/* FRONTIER */
const { env } = require('frontier')
const log = require('frontier/lib/logger')
const argv = require('frontier/lib/args')()
const fs = require('fs')
const path = require('path')

//This should be in frontier
let tryIt = function(fn, ...arguments) {
    console.log(arguments)
    try {
        return fn(...arguments)
    } catch(err) {
        //pretty log it
        log.err(err)
    }
}

let modelPath = (() => {
    //might need to change once in froniter
    let p = path.resolve(env.get('npm_package_main'))
    return p.slice(0, p.lastIndexOf('/')) + '/Models/'
})()

let modelFiles = []
if (argv.models) {
   modelFiles = argv.models.split(',')
} else {
     modelFiles = tryIt(fs.readdirSync, modelPath)
}

modelFiles.forEach(file => {
    let model = require(modelPath + file)
    let stmt = model.createTable()
    log.info({stmt})
})