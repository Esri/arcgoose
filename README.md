# Arcgoose

Let's face it, writing ArcGIS REST API validation, casting and business logic boilerplate is a drag.
That's why we wrote Arcgoose.

```javascript
const schema = { name: String };
const Cat = await arcgoose.model(connection.layers.Cats, schema);

const cat = await Cat.findOne({ name: 'Grumpy' }).exec();
```

Arcgoose provides a straight-forward, schema-based solution to model your application data. It
includes built-in type casting, validation, query building, business logic hooks and more,
out of the box.\*

\* Arcgoose is a work in progress.

\* Arcgoose is loosely based on the [Mongoose](https://mongoosejs.com) syntax.

## Instructions

### Connecting to ArcGIS Feature Server

Using the feature server URL:

```javascript
const connection = await arcgoose.connect({ url, token });
```

Using the hosted feature layer item id:

```javascript
const connection = await arcgoose.connect({ portalUrl, portalItemId, token });
```

Structure of the `connection` JSON object:

```javascript
{
  url,
  token,
  capabilities: { create, query, update, delete, editing },
  layers: {
    Cats: { id, fields, objectIdField },
    Dogs: { id, fields, objectIdField },
  },
  tables: {
    Rabbits: { id, fields, objectIdField },
  },
}
```

### Models

Models are fancy constructors compiled from `Schema` definitions. Instances of models are used
to query and update layers and tables on the feature server.

```javascript
const schema = { name: String };
const Cat = await arcgoose.model(connection.layers.Cats, schema);

const cat = await Cat.findOne({ name: 'Grumpy' }).exec();
```
