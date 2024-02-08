import deployed from "../../assets/HomePage/HS_Deployed.svg";
import deployedPending from "../../assets/HomePage/PT_Deployed waiting.svg";
import draft from "../../assets/HomePage/HS_Draft.svg";
import enabled from "../../assets/HomePage/HS_Enabled.svg";
import enablePending from "../../assets/HomePage/PT_Enabled Waiting.svg";
import makerChecker from "../../assets/HomePage/makerChecker.svg";

export function tileProcess(process) {
  var src;
  var processType;
  var pending;
  var backgroundColor;
  var pinnedTileColor;
  var makerCheckerImg;
  var borderColor;
  var processTypeColor;
  let checked = false;

  if (process === "L") {
    src = draft;
    processType = "processList.Draft";
    backgroundColor = "#0054FE1A";
    pinnedTileColor = "blue";
    borderColor = "red";
    processTypeColor = "#0F54FB";
  } else if (process === "LC") {
    // for showing checkout draft processes in recent list
    src = draft;
    processType = "processList.Draft";
    backgroundColor = "#0054FE1A";
    pinnedTileColor = "blue";
    borderColor = "red";
    processTypeColor = "#0F54FB";
    checked = true;
  } else if (process === "R" || process === "D") {
    src = deployed;
    processType = "processList.Deployed";
    backgroundColor = "#FDCC0C1A";
    pinnedTileColor = "orange";
    borderColor = "yellow";
    processTypeColor = "#F5A623";
  } else if (process === "RC") {
    // for showing checkout deployed processes in recent list
    src = deployed;
    processType = "processList.Deployed";
    backgroundColor = "#FDCC0C1A";
    pinnedTileColor = "orange";
    borderColor = "yellow";
    processTypeColor = "#F5A623";
    checked = true;
  } else if (process === "E") {
    src = enabled;
    processType = "processList.Enabled";
    backgroundColor = "#E9F9EF";
    pinnedTileColor = "darkgreen";
    borderColor = "pink";
    processTypeColor = "#0D6F08";
  } else if (process === "EP") {
    src = enablePending;
    processType = "processList.Enabled";
    pending = "waiting";
    backgroundColor = "#E9F9EF";
    pinnedTileColor = "darkgreen";
    makerCheckerImg = makerChecker;
    borderColor = "green";
    processTypeColor = "#0D6F08";
  } else if (process === "P") {
    src = enablePending;
    processType = "processList.Pinned";
    backgroundColor = "#E9F9EF";
    pinnedTileColor = "darkgreen";
    borderColor = "green";
    processTypeColor = "#0F54FB";
  } else if (process === "RP") {
    src = deployedPending;
    processType = "Deployed";
    pending = "waiting";
    backgroundColor = "#FDCC0C1A";
    pinnedTileColor = "orange";
    makerCheckerImg = makerChecker;
    borderColor = "black";
    processTypeColor = "#F5A623";
  } else if (process === "EC") {
    src = enabled;
    processType = "processList.Enabled";
    backgroundColor = "#E9F9EF";
    pinnedTileColor = "darkgreen";
    borderColor = "pink";
    processTypeColor = "#0D6F08";
    checked = true;
  }

  return [
    src,
    processType,
    pending,
    backgroundColor,
    pinnedTileColor,
    makerCheckerImg,
    borderColor,
    processTypeColor,
    checked,
  ];
}
