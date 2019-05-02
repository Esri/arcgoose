import Mustache from 'mustache'

// grabbed from here: https://developers.arcgis.com/rest/services-reference/layer-feature-service-.htm
const arcgisTsFieldMap = {
    'esriFieldTypeOID': 'number',
    'esriFieldTypeInteger': 'number',
    'esriFieldTypeSmallInteger': 'number',
    'esriFieldTypeDouble': 'number',
    'esriFieldTypeDate': 'Date',
    'esriFieldTypeString': 'string',
    'esriFieldTypeGUID': 'string'
}

// grabbed from here: https://developers.arcgis.com/rest/services-reference/layer-feature-service-.htm
const arcgisTsSchemaFieldMap = {
    'esriFieldTypeOID': 'Number',
    'esriFieldTypeInteger': 'Number',
    'esriFieldTypeSmallInteger': 'Number',
    'esriFieldTypeDouble': 'Number',
    'esriFieldTypeDate': 'Date',
    'esriFieldTypeString': 'String',
    'esriFieldTypeGUID': 'String'
}

const camelCase = str => str.charAt(0).toLowerCase() + str.slice(1);

const fieldToInterfaceContent = field => {
    return `${field.alias}: ${arcgisTsFieldMap[field.type]}`
}

const fieldToSchemaContent = field => {
    return `${field.name}: {
        type: ${arcgisTsSchemaFieldMap[field.type]},
        alias: '${field.alias}'
    } `
}

const definition = item => {
    return `

    export interface ${item.name} {
        ${ item.fields.map(field => fieldToInterfaceContent(field)).join('\n')}
    }

    export const ${camelCase(item.name)}Schema: arcgoose.Schema = {
        ${item.fields.map(field => fieldToSchemaContent(field)).join(',\n')}
    }
    
    `
}


export default ({ layers, tables }) => {

    const lrs = Object.keys(layers).map(layer => layers[layer])
    const tbls = Object.keys(tables).map(table => tables[table])

    let allItems = lrs.concat(tbls)

    let output = `import arcgoose from 'arcgoose';

    ${allItems.map(item => definition(item)).join(`\n\n`)}
    
    export interface ServiceDefinition {
        layers: {
            ${lrs.map(layer => `${layer.name}: arcgoose.Info`).join('\n')}
        }, 
        tables: {
            ${tbls.map(table => `${table.name}: arcgoose.Info`).join('\n')}
        }
    }
    
    `
    return output
}