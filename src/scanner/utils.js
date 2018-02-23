const utils = (function () {

  const analysisResult = (name, consistent, data) => {
    return {name: name, consistent: consistent, data: data};
  };

  // Define consistency link between two attributes
  const defineConsistencyLink = (attribute1, attribute2, fn) => {
    return fn(attribute1, attribute2);
  };

  const defineRule = (attribute, fn) => {
    return fn(attribute);
  };


  const isConsistent = function(analysisResults) {
    let consistent = true;
    Object.keys(analysisResults).forEach((res) => {
      if(!analysisResults[res].consistent) {
        consistent = false;
      }
    });
    return consistent;
  };

  return {
    analysisResult: analysisResult,
    defineConsistencyLink: defineConsistencyLink,
    isConsistent: isConsistent
  }
})();

module.exports = utils;
