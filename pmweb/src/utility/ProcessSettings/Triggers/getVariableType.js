// Function to get the variable type as per its type number.
export function getVariableType(type) {
  let typeName = "";
  if (type === "10") {
    //after discussion with UX team it was decided to change Text to String
    // typeName = "Text";
    typeName = "String";
  } else if (type === "6") {
    typeName = "Float";
  } else if (type === "3") {
    typeName = "Integer";
  } else if (type === "4") {
    typeName = "Long";
  } else if (type === "8") {
    typeName = "Date";
  } else if (type === "12") {
    typeName = "Boolean";
  } else if (type === "15") {
    typeName = "ShortDate";
  } else if (type === "16") {
    typeName = "Time";
  } else if (type === "17") {
    typeName = "Duration";
  } else if (type === "18") {
    typeName = "NText";
  } else if (type === "0") {
    typeName = "Void";
  } else if (type === "11") {
    typeName = "Complex";
  }
  return typeName;
}

export function getTypeByVariable(typeName) {
  let type;
  if (typeName?.toLowerCase() === "text") {
    type = "10";
  } else if (typeName?.toLowerCase() === "string") {
    type = "10";
  } else if (typeName?.toLowerCase() === "float") {
    type = "6";
  } else if (typeName?.toLowerCase() === "integer") {
    type = "3";
  } else if (typeName?.toLowerCase() === "long") {
    type = "4";
  } else if (typeName?.toLowerCase() === "date") {
    type = "8";
  } else if (typeName?.toLowerCase() === "boolean") {
    type = "12";
  } else if (typeName?.toLowerCase() === "shortdate") {
    type = "15";
  } else if (typeName?.toLowerCase() === "time") {
    type = "16";
  } else if (typeName?.toLowerCase() === "duration") {
    type = "17";
  } else if (typeName?.toLowerCase() === "ntext") {
    type = "18";
  } else if (typeName?.toLowerCase() === "void") {
    type = "0";
  } else if (typeName?.toLowerCase() === "complex") {
    type = "11";
  }
  return type;
}

export const getVariableTypeFromMDMType = (mdmType) => {
  let type;
  if (mdmType === "1") {
    type = "10";
  } else if (mdmType === "4") {
    type = "6";
  } else if (mdmType === "2") {
    type = "3";
  } else if (mdmType === "3") {
    type = "4";
  } else if (mdmType === "5") {
    type = "8";
  } else if (mdmType === "8") {
    type = "12";
  } else if (mdmType === "9") {
    type = "15";
  } else if (mdmType === "10") {
    type = "18";
  }

  return type;
};
