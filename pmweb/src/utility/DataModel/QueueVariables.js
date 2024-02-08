// Function to get variable type as per its scope.
export const getVariableTypeByScope = (variableScope) => {
  let variableType;
  if (variableScope === "M") {
    variableType = "systemModifiable";
  } else if (variableScope === "S") {
    variableType = "systemDefined";
  } else if (variableScope === "U") {
    variableType = "userDefined";
  } else if (variableScope === "I") {
    variableType = "complex";
  }
  return variableType;
};
