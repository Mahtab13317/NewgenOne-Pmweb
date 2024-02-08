// Function to get file type as per its type number.
export function getFileTypes(type) {
  let typeName;
  if (type === "1") {
    typeName = "csv";
  } else if (type === "2") {
    typeName = "text";
  } else if (type === "3") {
    typeName = "dat";
  } else if (type === "4") {
    typeName = "res";
  }
  return typeName;
}

// Function to get the type of field as per its field type number.
export function getFieldTypes(type) {
  let typeName;
  if (type === "1") {
    typeName = "variableLength";
  } else if (type === "2") {
    typeName = "fixedLength";
  }
  return typeName;
}

// Function to get the type of field move as per its field move number.
export function getFieldMoveType(type) {
  let typeName;
  if (type === "D") {
    typeName = "daily";
  } else if (type === "W") {
    typeName = "weekly";
  } else if (type === "M") {
    typeName = "monthly";
  }
  return typeName;
}
