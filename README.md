# Arcgoose

Let's face it, writing ArcGIS REST API validation, casting and business logic boilerplate is a drag.
That's why we wrote Arcgoose.

```javascript
const connection = await arcgoose.connect({ url });
const Cat = await arcgoose.model(connection.layers.Cats, { name: String });

const cat = await Cat.findOne({ name: 'Grumpy' }).exec();
```

Arcgoose provides a straight-forward, schema-based solution to model your application data. It
includes built-in type casting, validation, query building, business logic hooks and more,
out of the box.\*

\* Arcgoose is a work in progress.

\* Arcgoose is loosely based on the [Mongoose](https://mongoosejs.com) syntax.

## Installing

```
$ npm install --save arcgoose
```

Then, just import to your service or module:

```jsx
import arcgoose from 'arcgoose';
```

## Instructions

### Connecting to ArcGIS Feature Server

Using the feature server URL:

```javascript
const connection = await arcgoose.connect({ url });
```

Using the hosted feature layer item id:

```javascript
const connection = await arcgoose.connect({ portalUrl, portalItemId });
```

Structure of the `connection` JSON object:

```javascript
{
  url,
  capabilities: { create, query, update, delete, editing },
  layers: {
    Cats: { id, url, fields, objectIdField },
    Dogs: { id, url, fields, objectIdField },
  },
  tables: {
    Rabbits: { id, url, fields, objectIdField },
  },
}
```

### Schemas

A schema maps to attributes in the feature layer/table. Schemas are used for default population of
attributes (similar to `outFields`), and can also be used for type casting and aliases.

```javascript
export const catSchema = {
  GlobalID: {
    type: String,
  },
  CatName: {
    type: String,
    alias: 'name', // 'CatName' will become 'name' in the returned object
  },
  DateOfBirth: {
    type: Date, // 'DateOfBirth' will be casted to a Date object
  },
  Details: {
    type: Object, // 'Details' will be casted from a string to a JSON object
  }
};
```

### Models

Models are fancy constructors compiled from `Schema` definitions. Instances of models are used
to query and update layers and tables on the feature server.

```javascript
const schema = { name: String };
const Cat = await arcgoose.model(connection.layers.Cats, schema);

const cat = await Cat.findOne({ name: 'Grumpy' }).exec();
```

### Queries

Queries can be executed using the `find()` or `findOne()` methods. You can pass one or more
object fields to be matched.

```javascript
const cat = await Cat
  .find({ name: 'Grumpy' })
  .exec();
```

Additional query methods can be chained after the `find()` method.

```javascript
const cat = await Cat
  .find({ name: 'Grumpy' })
  .populate(['name', 'dateOfBirth'])
  .returnGeometry()
  .exec();
```

Here is a list of additional query methods:

```javascript
.filter(additionalSQLWhereClause) // chain as many as you like
```

```javascript
.populate(outFields) // otherwise all fields from the schema will be populated
```

```javascript
.geometry(geometry, geometryType).intersects() // spatial query
```

```javascript
.geometry(geometry, geometryType).contains()  // spatial query
```

```javascript
.returnGeometry()
```

```javascript
.returnCentroid()
```

```javascript
.outSpatialReference(wkid)
```

```javascript
.sort(sortOrder)
```

```javascript
.offset(amount)
```

```javascript
.limit(amount)
```

```javascript
.outStatistics(outStatistics, groupByFieldsForStatistics)
```

```javascript
.returnCountOnly()
```

### Edits

Edits can be applied using the `applyEdits()` method.

```javascript
const cat = await Cat
  .applyEdits()
  .add({ name: 'Grumpy' })
  .exec();
```

The following edits are possible:

```javascript
.add(features)
```

```javascript
.update(features)
```

```javascript
.delete(idArray)
```

```javascript
.useGlobalIds() // default
```

```javascript
.useObjectIds()
```

### Multi-layer Edits

You can also collect updates across multiple layers and execute them in a single REST call.

```javascript
const schema = { name: String };
const Cat = await arcgoose.model(connection.layers.Cats, schema);
const Mouse = await arcgoose.model(connection.layers.Mice, schema);

const catHandle = Cat.applyEdits().add({ name: 'Tom' }).handle();
const mouseHandle = Mouse.applyEdits().add({ name: 'Jerry' }).handle();

arcgoose.execAll([catHandle, mouseHandle]);
```

## Issues

Find a bug or want to request a new feature?  Please let us know by submitting an issue.

## Contributing

Esri welcomes contributions from anyone and everyone. Please see our [guidelines for contributing](https://github.com/esri/contributing).

## Licensing
Copyright 2018 Esri

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

   http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.

A copy of the license is available in the repository's [license.txt](/license.txt) file.
