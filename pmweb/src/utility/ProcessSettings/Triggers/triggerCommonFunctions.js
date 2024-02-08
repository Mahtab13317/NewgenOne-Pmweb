import { COMPLEX_VARTYPE } from "../../../Constants/appConstants";
import { getComplex } from "../../CommonFunctionCall/CommonFunctionCall";

export const addConstantsToString = (string, value) => {
  return string + `&<${value}>&`;
};

export const getVariableById = (variableId, values, varfieldId) => {
  let variable;
  values &&
    values.forEach((content) => {
      if (content.VariableId === variableId) {
        if (varfieldId) {
          if (content.VarFieldId === varfieldId) {
            variable = content;
          } else {
            let tempList = getComplex(content);
            const indexOfChildVar = tempList.findIndex(
              (item) => item.VarFieldId === varfieldId
            );
            if (indexOfChildVar !== -1) {
              variable = tempList[indexOfChildVar];
            }
          }
        } else {
          variable = content;
        }
      }
    });
  return variable;
};

export const getVariableByName = (variableName, values) => {
  let variable = null;
  values &&
    values.forEach((content) => {
      if (content.VariableName === variableName) {
        variable = content;
      } else if (content.VariableType === COMPLEX_VARTYPE) {
        let tempList = getComplex(content);
        tempList.forEach((item) => {
          if (item.VariableName === variableName) {
            variable = item;
          }
        });
      }
    });
  return variable;
};
