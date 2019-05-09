import arcgoose from 'arcgoose'

// Setup your Service Definition Interface, they contain your Layers and Tables.
interface FeatureServiceDefinition {
    layers: {
        Cats: arcgoose.Info // 'Cats' must match with the Layer Name
    },
    tables: {
        Dogs: arcgoose.Info // 'Dogs' must match with the Table Name
    }
}


// Setup interfaces which represent attributes from retrieved features
interface Cat {
    ObjectID: number
    Name: string
    FavouriteSnack: string
}

interface Dog {
    ObjectID: number
    Name: string
    Breed: string
}


// optional step: Setup a schema. This allows use of different types and Alias
const catSchema = {
    'Cat_Name': {
        type: String, // Must be a Type!
        alias: 'Name' // Must match with Cat Interface
    },
    'Favourite-Snack': {
        type: String,
        alias: 'FavouriteSnack'
    }
}


let catModel: arcgoose.Model<Cat>
let dogModel: arcgoose.Model<Dog>

export async function createModels() {

    // establish the connection
    const url = 'http://www.arcgis.com/arcgis/rest/services/CatsAndDogs/FeatureServer'
    const connection = await arcgoose.connect<FeatureServiceDefinition>({ url })

    // prepare the models for easy access
    catModel = await arcgoose.model<Cat>(connection.layers.Cats, catSchema)
    dogModel = await arcgoose.model<Dog>(connection.tables.Dogs)
}

export async function fetchTerriers() {
    await createModels()

    const terriers = await dogModel.find({
        Breed: 'Terrier' // ok
        Bred: 'Pitbull' // typechecked: not ok
    })
    .populate(['Name']) // ok
    .populate(['oid']) // typechecked: not ok
    .sort({
        Name: 1 // ok
    })
    .sort({
        namee: 1 // typechecked: not ok
    })
    .exec()

    console.log(terriers.map(terrier => terrier.attributes.Name)) // ok
    console.log(terriers.map(terrier => terrier.attributes.name)) // typechecked: not ok

}

