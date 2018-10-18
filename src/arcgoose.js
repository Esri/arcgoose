import FeatureService from './feature-service';
import FeatureLayer from './feature-layer';
import FeatureTable from './feature-table';

export default {
  modelFeatureService: params => new FeatureService(params),
  modelFeatureLayer: params => new FeatureLayer(params),
  modelFeatureTable: params => new FeatureTable(params),
};
