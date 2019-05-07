#! /usr/bin/env node
/* eslint-disable no-console */

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

const typings = require('./index');
const fs = require('fs');
const request = require('request');

if (process.argv.length < 4) {
  console.log('');
  console.log('');
  console.log('******************************************************************');
  console.log('This tool will generate TypeScript Typings for your FeatureService');
  console.log('It will give you Type-Completion while you are using arcgoose');
  console.log('******************************************************************');
  console.log('Usage:');
  console.log('   - npx arcgoose-typings <FeatureServiceURL> <OutputFileName>');
  console.log('Options');
  console.log('   --include-docs: Adds Docs to your model with infos from FeatureService JSON');
  console.log('   --use-alias: takes field alias instead of field names');
  console.log('');
  console.log('If your service is secured, use FeatureServiceURL with appended Token ?token=...');
  console.log('');
  process.exit();
}


let featureServiceUrl = process.argv[2];
const output = process.argv[3];

if (featureServiceUrl.indexOf('?') < 0) {
  featureServiceUrl += '?f=json';
} else {
  featureServiceUrl += '&f=json';
}

function retrieveItemDetails(id) {
  return new Promise((resolve) => {
    const toks = featureServiceUrl.split('?');
    const requestUrl = `${toks[0]}/${id}?${toks[1]}`;
    request(requestUrl, (err, response, body) => {
      resolve(JSON.parse(body));
    });
  });
}

request(featureServiceUrl, (err, response, body) => {
  const j = JSON.parse(body);
  const connection = {
    ...j,
    layers: {},
    tables: {},
  };

  const proms = j.layers.map(layer => retrieveItemDetails(layer.id)
    .then((result) => {
      connection.layers[layer.name] = result;
    }));


  proms.push(...j.tables.map(layer => retrieveItemDetails(layer.id)
    .then((result) => {
      connection.tables[layer.name] = result;
    })));

  Promise.all(proms).then(() => {
    const types = typings(connection, {
      includeDocs: process.argv.filter(arg => arg === '--include-docs').length === 1,
      useAlias: process.argv.filter(arg => arg === '--use-alias').length === 1,
    });
    fs.writeFileSync(output, types);
  });
});
