import FeatureService from './feature-service';
import FeatureLayer from './feature-layer';
import FeatureTable from './feature-table';

export default {
  model: {
    featureService: params => new FeatureService(params),
    featureLayer: params => new FeatureLayer(params),
    featureTable: params => new FeatureTable(params),
  },
};
