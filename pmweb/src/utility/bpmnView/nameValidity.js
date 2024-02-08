import { SPACE } from "../../Constants/appConstants";
import { maxLabelCharacter, style, artifacts } from "../../Constants/bpmnView";
import { PMWEB_ARB_REGEX, PMWEB_REGEX } from "../../validators/validator";
import {
  checkRegex,
  isArabicLocaleSelected,
} from "../CommonFunctionCall/CommonFunctionCall";

const maxChar = maxLabelCharacter;

export function nameValidity(graph, value, cell, translation) {
  let isValid = true,
    message = null;

  let entityName = "";

  if (graph.isSwimlane(cell)) {
    if (cell.style === style.milestone) {
      entityName = translation("SegmentName");
    } else if (cell.style?.includes(style.swimlane)) {
      entityName = translation("LaneName");
    }
  } else if (
    cell.getStyle() === style.taskTemplate ||
    cell.getStyle() === style.newTask ||
    cell.getStyle() === style.processTask
  ) {
    entityName = translation("TaskName");
  } else if (
    cell.getStyle() !== style.taskTemplate &&
    cell.getStyle() !== style.newTask &&
    cell.getStyle() !== style.processTask &&
    !artifacts.includes(cell.getStyle())
  ) {
    entityName = translation("ActivityName");
  } else if (artifacts.includes(cell.getStyle())) {
    if (cell.getStyle() === style.dataObject) {
      entityName = translation("DataObject");
    } else if (cell.getStyle() === style.message) {
      entityName = translation("MessageArtifactName");
    }
  }

  // code edited on 3 Nov 2022 for BugId 118320
  if (value == null || (value !== null && value?.trim() === "")) {
    isValid = false;
    isValid = false;
    message = translation("EntityCantBeBlank", {
      entityName: entityName,
    });
  } else {
    value = value && value?.trim();
    // code added on 18 Jan 2023 for BugId 110065
    if (
      isValid &&
      !checkRegex(
        value,
        PMWEB_REGEX.Activity_Mile_Lane_Task_Name,
        PMWEB_ARB_REGEX.Activity_Mile_Lane_Task_Name
      )
    ) {
      isValid = false;
      if (isArabicLocaleSelected()) {
        message =
          translation(entityName) +
          SPACE +
          translation("cannotContain") +
          SPACE +
          "& * | \\ : \" ' < > ? /" +
          SPACE +
          translation("charactersInIt");
      } else {
        message =
          translation("AllCharactersAreAllowedExcept") +
          SPACE +
          "& * | \\ : \" ' < > ? /" +
          SPACE +
          translation("AndFirstCharacterShouldBeAlphabet") +
          SPACE +
          translation("in") +
          SPACE +
          translation(entityName) +
          ".";
      }
    } else if (isValid && value.length > maxChar) {
      isValid = false;
      message = translation("messages.minMaxChar", {
        maxChar: maxChar,
        entityName: translation(entityName),
      });
    }
  }

  return [isValid, message];
}
