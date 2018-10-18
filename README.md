# Arcgoose

Let's face it, writing ArcGIS REST API validation, casting and business logic boilerplate is a drag.
That's why we wrote Arcgoose.

```javascript
const CatLayer = arcgoose.modelFeatureLayer({
  url,
  schema: { name: String },
});

const cat = await CatLayer.findOne({ name: 'Grumpy' }).exec();
```

Arcgoose provides a straight-forward, schema-based solution to model your application data. It
includes built-in type casting, validation, query building, business logic hooks and more,
out of the box.\*

\* Arcgoose is a work in progress.

\* Arcgoose is loosely based on the [Mongoose](https://mongoosejs.com) syntax.
