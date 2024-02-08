export const ReplaceSpaceToUnderScore = (str) => {
  if (typeof str === "string") {
    // return str.replaceAll(" ", "_");
    return str.replace(/ /g, "_");
  } else {
    return "";
  }
};

export const ReplaceDotToUnderScore = (str) => {
  if (typeof str === "string") {
    //return str.replaceAll(".", "_");
    return str.replace(/./g, "_");
  } else {
    return "";
  }
};
