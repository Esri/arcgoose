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

declare module 'arcgoose' {

    interface ServiceDefinition {
        layers: {
            [id: string]: Info
        },
        tables: {
            [id: string]: Info
        }
    }

    interface Connection {
        url,
        capabilities: { create, query, update, delete, editing }
    }

    interface Info { id, url, fields, objectIdField }


    interface Model<T> {
        /**
         * Use to add, update or delete features
         */
        applyEdits(): ApplyEdits<T>

        /**
         * deletes all features which match the whereClause
         * @param whereClause sql-like where clause
         */
        deleteWhere(whereClause: string): Promise<Deleted>;

        /**
         * finds a set of features
         * @param info object-based definition to filter features
         * @example ```
         *   const features = await model.find({
         *       city: 'Zürich'
         *   }).exec()
         * ```
         */
        find(info?: Partial<T>): Find<T, Array<Feature<T>>>;

        /**
         * finds one feature
         * 
         * will throw an exception if the service finds no or more than one features
         * @param info object-based definition to filter features
         * @example ```typescript
         * const features = await model.findOne({
             *     objectid: 1
         * }).exec()
         * ```
         * */
        findOne(info?: Partial<T>): Find<T, Feature<T>>;
    }

    interface Deleted {
        layerId: number,
        deletedFeatures: any[]
    }

    interface Find<T, K> {
        /**
         * uses `esriSpatialRelContains` to query by geometry
         */
        contains(): Find<T, K>

        /**
         * executes the query, will resolve when all features are fetched
         */
        exec(): Promise<K>

        /**
         * adds a where clause, if multiple added, they will be joined with
         * `and`
         */
        filter(sqlWhere: string): Find<T, K>

        /**
         * sets the geometry for a spatial query
         * @param geometry ArcGIS Rest Geometry Representation as Object
         * @param geometryType type of the input geometry
         */
        geometry(geometry, geometryType: 'esriGeometryPoint' | 'esriGeometryMultipoint' | 'esriGeometryPolyline' | 'esriGeometryPolygon' | 'esriGeometryEnvelope'): Find<T, K>
        
        /**
         * uses `esriSpatialRelIntersects` to query by geometry
         */
        intersects(): Find<T, K>

        /**
         * limits the maximal amount of features
         * @param amount maximal count of features to retrieve
         */
        limit(amount: number): Find<T, K>

        /**
         * sets an offset to use with `.limit`
         * @param amount offset at which feature-count to start
         */
        offset(amount: number): Find<T, K>

        /**
         * 
         * @param wkid spatial reference of the output features
         */
        outSpatialReference(wkid: number): Find<T, K>

        /**
         * a definition to aggregate data
         * @param outStatistics some outstatistic definitions
         * @param groupByFieldsForStatistics fields which should be grouped by
         */
        outStatistics(
            outStatistics: OutStatistics<T>[],
            groupByFieldsForStatistics: Array<keyof T>
        ): Find<T, Array<any>> 

        /**
         * if specified, only these fields will be fetched from the service
         * @param outFields fields to populate in out features
         */
        populate(outFields: Array<keyof T>): Find<T, K>

        /**
         * if set, out features will contain centroids
         */
        returnCentroid(): Find<T, K>

        /**
         * if set, out features will contain geometries
         */
        returnGeometry(): Find<T, K>

        /**
         * if set, out features geometries will contain z-values
         */
        returnZ(): Find<T, K>

        /**
         * 
         * @param sortOrder object with key-map, use positive value for ascending, negative for descending
         * @example ```typescript
         * // returns features, sorted descending by objectid and ascending by name
         * const features = await model.sort({
         *      objectId: -1,
         *      name: 1
         * }).exec()
         * ```
         */
        sort(sortOrder: {
            [P in keyof T]?: number
        }): Find<T, K>

        /**
         * same as filter, adds a where clause part.
         * 
         * all parts are joined with `and`
         * @param sqlFilter where clause
         */
        where(sqlFilter): Find<T, K>

        /**
         * returns the featureset count
         */
        returnCountOnly(): Find<T, {count: number}>
    }

 

    interface OutStatistics<T> {
        statisticType: 'count' | 'sum' | 'min' | 'max' | 'avg' | 'stddev' | 'var'
        onStatisticField: keyof T
        outStatisticFieldName: string
    }

    interface Feature<T> {
        attributes?: Partial<T>
        geometry?: any
        centroid?: any
    }

    interface ApplyEdits<T> {

        add(features: Feature<T> | Array<Feature<T>>): ApplyEdits<T>
        update(features: Feature<T> | Array<Feature<T>>): ApplyEdits<T>
        delete(featureIds: any | Array<any>): ApplyEdits<T>

        /**
         * uses global ids for deletion
         * @default true
         */
        useGlobalIds(): ApplyEdits<T>

        /**
         * uses object ids for deletion
         */
        useObjectIds(): ApplyEdits<T>

        handle(): Handle
        exec(): Promise<ApplyEditsResult>

    }
    interface ApplyEditsResult {
        addedFeatures: any[],
        updatedFeatures: any[],
        deletedFeatures: any[],
        addedOIDs: number[],
        layerId: number
    }

    interface Handle {

    }

    interface Schema {
        [fieldname: string]: {
            type: StringConstructor | NumberConstructor | DateConstructor | ObjectConstructor,
            alias?: string,
        }
    }

    /**
     * establishes a connection to a feature service
     * @param config url or portal item
     * @example ```typescript
     * // `Model.ServiceDefinition` can be generated with `npx arcgoose-typings`
     * const connection = await arcgoose.connect<Model.ServiceDefinition>({
     *      url: 'https://url-to-the-feature-service/arcgis/rest/services/Something/FeatureServer'
     * })
     * ```
     */
    export function connect<T>(config: { url: string }): Connection & T;

    /**
     * creates an endpoint for a specific layer / table
     * 
     * @param info information about a specific layer of the feature service
     * @param schema schema of the layer passed in info
     * 
     * @example ```typescript
     * // Model.FeatureClass, connetion.layers.FeatureClass and Model.FeatureClassSchema
     * // are autogenerated by `npx arcgoose-typings`
     * const model = await arcgoose.model<Model.FeatureClass>(
     *      connection.layers.FeatureClass, 
     *      Model.FeatureClassSchema
     * )
     * ```
     */
    export function model<T>(info: Info, schema?: Schema): Promise<Model<T>>;

    /**
     * uploads a bunch of handles
     * 
     * @param handles a list with handles, collected from applyEdits().handle()
     * @param progressCallback callback which reports the state of progress
     */
    export function execAll(handles: Handle[], progressCallback: (percentage: number) => void): Promise<Array<ApplyEditsResult>>

    export function typings(connection: Connection): string
}
