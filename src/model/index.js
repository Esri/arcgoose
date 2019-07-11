/* Copyright 2018 Esri
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *    http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import FeatureLayer from './feature-layer';
import FeatureTable from './feature-table';


export default ({ type, ...otherParams }, schema) => {
  if (type === 'Feature Layer') {
    return new FeatureLayer({ ...otherParams, schema });
  }

  if (type === 'Table') {
    return new FeatureTable({ ...otherParams, schema });
  }

  return null;
};
