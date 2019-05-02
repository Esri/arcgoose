#! /usr/bin/env node
const typings = require('./index')
const fs = require('fs');
const request = require('request')

if (process.argv.length < 4) {
    console.log('')
    console.log('')
    console.log('******************************************************************')
    console.log('This tool will generate TypeScript Typings for your FeatureService')
    console.log('It will give you Type-Completion while you are using arcgoose')
    console.log('******************************************************************')
    console.log('Usage:')
    console.log('   - npx arcgoose-typings <FeatureServiceURL> <OutputFileName> --include-docs')
    console.log('')
    console.log('If your service is secured, use FeatureServiceURL with appended Token ?token=...')
    console.log('')
    process.exit()
}


let featureServiceUrl = process.argv[2];
const output = process.argv[3];

if (featureServiceUrl.indexOf('?') < 0) {
    featureServiceUrl += '?f=json'
} else {
    featureServiceUrl += `&f=json`
}

function retrieveItemDetails(id) {
    return new Promise(resolve => {
        let toks = featureServiceUrl.split("?")
        let requestUrl = `${toks[0]}/${id}?${toks[1]}` 
        request(requestUrl, (err, response, body) => {
            resolve(JSON.parse(body))
        })
    })
}

request(featureServiceUrl, (err, response, body) => {
    const j = JSON.parse(body)
    const connection = {
        ...j,
        layers: {},
        tables: {},
    }

    let proms = j.layers.map(layer => retrieveItemDetails(layer.id)
                                .then(result => {
                                    connection.layers[layer.name] = result
                                }))

                                
    proms.push(...j.tables.map(layer => retrieveItemDetails(layer.id)
                                .then(result => {
                                    connection.tables[layer.name] = result
                                })))

    Promise.all(proms).then(stuff => {
        const types = typings(connection, {
            includeDocs: process.argv.filter(arg => arg === '--include-docs').length === 1,
            useAlias: process.argv.filter(arg => arg === '--use-alias').length === 1})
        fs.writeFileSync(output, types);
    })
})


// arcgoose.default.connect({
//     url: featureServiceUrl
// }).then(connection => {
//     const types = arcgoose.default.typings(connection);

//     fs.writeFileSync(output, types);
// })