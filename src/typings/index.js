// Copyright 2017-2019 by Esri
// Beda Kuster

// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at

//    http://www.apache.org/licenses/LICENSE-2.0

// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.


// grabbed from here: https://developers.arcgis.com/rest/services-reference/layer-feature-service-.htm
const arcgisTsFieldMap = {
  esriFieldTypeOID: 'number',
  esriFieldTypeInteger: 'number',
  esriFieldTypeSmallInteger: 'number',
  esriFieldTypeSingle: 'number',
  esriFieldTypeDouble: 'number',
  esriFieldTypeDate: 'Date',
  esriFieldTypeString: 'string',
  esriFieldTypeGUID: 'string',
};

// grabbed from here: https://developers.arcgis.com/rest/services-reference/layer-feature-service-.htm
const arcgisTsSchemaFieldMap = {
  esriFieldTypeOID: 'Number',
  esriFieldTypeInteger: 'Number',
  esriFieldTypeSmallInteger: 'Number',
  esriFieldTypeSingle: 'Number',
  esriFieldTypeDouble: 'Number',
  esriFieldTypeDate: 'Date',
  esriFieldTypeString: 'String',
  esriFieldTypeGUID: 'String',
};

// eslint-disable-next-line no-useless-escape
const sanatizeName = str => str.replace(/[\(\) \[\]\{\}]/ig, '');

const camelCase = str => str.charAt(0).toLowerCase() + str.slice(1);

// eslint-disable-next-line prefer-template
const markdownForValue = value => '\n```\n' + JSON.stringify(value, null, 4) + '\n```\n';

const jdocForField = (includeDocs, field, title) => {
  if (!includeDocs) return '';
  return `
    /**
     * ${title || 'ArcGIS Service Definition'}:
     *
     * ${Object.keys(field).slice(0, 10).map(p => `${p}: ${markdownForValue(field[p])}`).join(' * ')}
     * 
     * */
    `;
};


const fieldToInterfaceContent = (field, { includeDocs, useAlias }) => `${jdocForField(includeDocs, field)}
            '${useAlias ? field.alias : field.name}': ${arcgisTsFieldMap[field.type]}`;

const fieldToSchemaContent = (field, { includeDocs, useAlias }) => `${jdocForField(includeDocs, field)}
        '${field.name}': {
        type: ${arcgisTsSchemaFieldMap[field.type]}
        ${useAlias ? `,alias: '${field.alias}` : ''}
    } `;

const definition = (item, { includeDocs, useAlias }) => {
  const sanName = sanatizeName(item.name);
  return `
    ${jdocForField(includeDocs, item, 'Feature-Definition')}
    export interface ${sanName}Feature extends arcgoose.Feature<${sanName}> {}
    
    ${jdocForField(includeDocs, item, 'Attribute-Definition')}
    export interface ${sanName} {
        ${item.fields.map(field => fieldToInterfaceContent(field, { includeDocs, useAlias })).join('\n')}
    }

    ${jdocForField(includeDocs, item, 'Schema Description')}
    export const ${camelCase(sanName)}Schema: arcgoose.Schema = {
        ${item.fields.map(field => fieldToSchemaContent(field, { includeDocs, useAlias })).join(',\n')}
    }    
    `;
};

module.exports = ({ layers, tables }, { includeDocs, useAlias }) => {
  const lrs = Object.keys(layers).map(layer => layers[layer]);
  const tbls = Object.keys(tables).map(table => tables[table]);

  const allItems = lrs.concat(tbls);

  const output = `
    
    // tslint:disable
    import arcgoose from 'arcgoose';

    ${allItems.map(item => definition(item, { includeDocs, useAlias })).join('')}
    
    export interface ServiceDefinition {
        layers: {
            ${lrs.map(layer => `'${layer.name}': arcgoose.Info`).join('\n')}
        }, 
        tables: {
            ${tbls.map(table => `'${table.name}': arcgoose.Info`).join('\n')}
        }
    }
    
    `;
  return output;
};
