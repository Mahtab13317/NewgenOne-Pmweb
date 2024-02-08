export const getVariableObject = (processData, variableName) => {
  let varObj = {};
  if (variableName.includes(".")) {
    for (let pi in processData.Variable) {
      if (
        processData.Variable[pi].VariableName === variableName.split(".")[0]
      ) {
        for (let ti in processData.Variable[pi].RelationAndMapping.Mappings
          .Mapping) {
          if (
            processData.Variable[pi].RelationAndMapping.Mappings.Mapping[ti]
              .VariableName === variableName.split(".")[1]
          ) {
            varObj =
              processData.Variable[pi].RelationAndMapping.Mappings.Mapping[ti];
          }
        }
      }
    }
  } else {
    for (let index in processData.Variable) {
      if (processData.Variable[index].VariableName === variableName) {
        varObj = processData.Variable[index];
        break;
      }
    }
  }
  return varObj;
};
