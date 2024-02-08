export const getSelectedCellType = (cellType) => {
  switch (cellType) {
    case "MILE":
      return "M";
    case "LANE":
      return "L";
    case "ACTIVITY":
      return "A";
    case "EDGE":
      return "E";
    case "TASK":
      return "T";
    case "TASKTEMPLATE":
      return "TT";
    case "ARTIFACTS":
      return "AR";
    default:
      return null;
  }
};
