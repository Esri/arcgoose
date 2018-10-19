export const processResults = results => (results ?
  results
    .filter(result => result.success)
    .map(result => result.globalId) :
  []);

export const processResultsOIDs = results => (results ?
  results
    .filter(result => result.success)
    .map(result => result.objectId) :
  []);
