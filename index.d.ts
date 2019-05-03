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
        applyEdits(): ApplyEdits<T>
        deleteWhere(info: Partial<T>): Promise<Deleted>;
        find(info?: Partial<T>): Find<T>;
        findOne(info?: Partial<T>): Find<T>;
    }

    interface Deleted {
        layerId: number,
        deletedFeatures: any[]
    }

    interface Find<T> {
        contains(): Find<T>
        exec(): Promise<Array<Feature<T>>>
        filter(sqlWhere: string): Find<T>
        geometry(geometry, geometryType): Find<T>
        intersects(): Find<T>
        limit(amount: number): Find<T>
        offset(amount: number): Find<T>
        outSpatialReference(wkid: number): Find<T>
        outStatistics(
            outStatistics: OutStatistics<T>[],
            groupByFieldsForStatistics: Array<keyof T>
        ): FindOutStatistic<T> 

        populate(outFields: Array<keyof T>): Find<T>
        returnCentroid(): Find<T>
        returnGeometry(): Find<T>
        returnZ(): Find<T>

        sort(sortOrder: {
            [P in keyof T]?: number
        }): Find<T>

        where(sqlFilter): Find<T>
    }

    interface FindOutStatistic<T> extends Find<T> {
        exec(): Promise<Array<Feature<any>>>
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

        useGlobalIds(): ApplyEdits<T>
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

    export function connect<T>(config: { url: string }): Connection & T;

    export function model<T>(info: Info, schema: Schema): Promise<Model<T>>;

    export function execAll(handles: Handle[], progressCallback: (percentage: number) => void): Promise<Array<ApplyEditsResult>>

    export function typings(connection: Connection): string
}
