// #BugID - 117665
// #BugDescription - Handled the checks to prevent the screen crash.
// #Date - 26 October 2022
import { store, useGlobalState } from "state-pool";
import {
  PROCESSTYPE_DEPLOYED,
  PROCESSTYPE_REGISTERED,
  COMPLEX_VARTYPE,
  SERVER_URL,
  PROCESSTYPE_LOCAL,
  PROCESSTYPE_LOCAL_CHECKED,
  ARABIC_LOCALE,
  SPACE,
  ENGLISH_LOCALE,
  BRAND_LOGOS,
  SERVER_URL_LAUNCHPAD,
} from "./../../Constants/appConstants";
import axios from "axios";
import { checkIfParentSwimlaneCheckedOut } from "../SwimlaneCheckedStatus/SwimlaneCheckedStatus";
import { numberedLabel } from "../bpmnView/numberedLabel";
import secureLocalStorage from "react-secure-storage";
import {
  setBrandDetails,
  setBrandDetailsLoading,
} from "../../redux-store/slices/brandDetails/brandDetailsSlice";

// code added on 29 Nov 2022 for BugId 117900
//added 15 and 18 types for BugId 137232
export const ConditionalOperator = [
  { label: "<", value: "1", type: [3, 8, 4, 6, 15] },
  { label: "<=", value: "2", type: [3, 8, 4, 6, 15] },
  { label: "=", value: "3", type: [10, 12, 3, 8, 4, 6, 15, 18] },
  { label: "!=", value: "4", type: [12, 10, 3, 8, 4, 6, 15, 18] },
  { label: ">", value: "5", type: [3, 8, 4, 6, 15] },
  { label: ">=", value: "6", type: [3, 8, 4, 6, 15] },
  { label: "like", value: "7", type: [10, 18] },
  { label: "NOT LIKE", value: "8", type: [10, 18] },
  { label: "null", value: "9", type: [12, 10, 3, 8, 4, 6, 15, 18] },
  { label: "NOT NULL", value: "10", type: [12, 10, 3, 8, 4, 6, 15, 18] },
];

export const LogicalOperator = [
  { label: "AND", value: "1" },
  { label: "or", value: "2" },
  { label: "", value: "3" },
];

export function getConditionalOperator(valueSelected) {
  var label;
  if (valueSelected == "3") {
    label = "equal to";
  } else if (valueSelected == "4") {
    label = "not equals to";
  } else if (valueSelected == "7") {
    label = "like";
  } else if (valueSelected == "8") {
    label = "notLike";
  } else if (valueSelected == "9") {
    label = "null";
  } else if (valueSelected == "10") {
    label = "notNull";
  } else if (valueSelected == "") {
    label = "";
  }
  return label;
}

export function getLogicalOperator(valueSelected) {
  var label;
  if (valueSelected == "AND") {
    label = "1";
  } else if (valueSelected == "OR") {
    label = "2";
  } else if (valueSelected == "+") {
    label = "3";
  } else if (valueSelected == "") {
    label = "";
  }
  return label;
}

export function getLogicalOperatorReverse(valueSelected) {
  var label;
  if (valueSelected == "1") {
    label = "AND";
  } else if (valueSelected == "2") {
    label = "OR";
  } else if (valueSelected == "3") {
    label = "+";
  }
  return label;
}
export function getTypedropdown(valueSelected) {
  var label;
  if (valueSelected == "8") {
    label = "INC PRIORITY";
  } else if (valueSelected == "9") {
    label = "DEC PRIORITY";
  } else if (valueSelected == "15") {
    label = "TRIGGER";
  } else if (valueSelected == "16") {
    label = "COMMIT";
  } else if (valueSelected == "18") {
    label = "ASSIGNED TO";
  } else if (valueSelected == "19") {
    label = "SET PARENT DATA";
  } else if (valueSelected == "22") {
    label = "CALL";
  } else if (valueSelected == "23") {
    label = "SET AND EXECUTE";
  } else if (valueSelected == "24") {
    label = "ESCALATE TO";
  } else if (valueSelected == "26") {
    label = "ESCALATE TO WITH TRIGGER";
  } else if (valueSelected == "") {
    label = "";
  }
  return label;
}

export const Typedropdown = [];

export const CalenderType = [];

export const getVariablesBasedOnTypes = function GetVariablesBasedOnTypes({
  types = [],
  variables,
}) {
  const loadedProcessData = store.getState("loadedProcessData");
  const [localLoadedProcessData, setlocalLoadedProcessData] =
    useGlobalState(loadedProcessData);
  if (localLoadedProcessData?.Variable) {
    if (types.length > 0) {
      return (variables ? variables : localLoadedProcessData.Variable).filter(
        (variable) =>
          types.includes(+variable.VariableType) && variable.Unbounded === "N"
      );
    }
    return localLoadedProcessData.Variable;
  }
  return [];
};

export const getVariablesBasedOnTypes1 = function GetVariablesBasedOnTypes({
  types = [],
  variables,
}) {
  if (variables) {
    if (types.length > 0) {
      return variables.filter(
        (variable) =>
          types.includes(+variable.VariableType) && variable.Unbounded === "N"
      );
    }
    return variables;
  }
  return [];
};

export const getAllVariableOptions = function GetAllVariableOption({
  types = [],
}) {
  const allVars = getVariablesBasedOnTypes({ types }) || [];
  return allVars.map((item) => ({
    name: item.VariableName,
    value: item.VariableName,
  }));
};

export const getVariablesByScopes = function GetVariablesByScopes({
  variables,
  scopes = [],
}) {
  let newVarList = [];
  let allVars = variables || [];
  if (allVars) {
    if (scopes.length > 0) {
      allVars = variables.filter(
        (variable) =>
          scopes.includes(variable.VariableScope) && variable.Unbounded === "N"
      );
    }
  }
  allVars.forEach((item, i) => {
    if (item.VariableType === COMPLEX_VARTYPE) {
      let tempList = getComplex(item);
      tempList?.forEach((el) => {
        newVarList.push(el);
      });
    } else {
      newVarList.push(item);
    }
  });

  return newVarList;
};

export const getVariableIdByName = function GetVariableId({ variables, name }) {
  const allVars = variables || [];
  const variable = allVars.find((item) => name === item.VariableName);
  return variable?.VariableId || "0";
};

export const getVariableExtObjectIdByName = function GetVariableExtObjectId({
  variables,
  name,
}) {
  const allVars = variables || [];
  const variable = allVars.find((item) => name === item.VariableName);
  return variable?.ExtObjectId || "0";
};

export const getVariableVarFieldIdByName = function GetVariableVarFieldId({
  variables,
  name,
}) {
  const allVars = variables || [];
  const variable = allVars.find((item) => name === item.VariableName);
  return variable?.VarFieldId || "0";
};

export const getVariableScopeByName = function GetVariableScope({
  variables,
  name,
}) {
  const allVars = variables || [];
  const variable = allVars.find((item) => name === item.VariableName);
  return variable?.VariableScope || "C";
};

export const createInstanceWithoutBearer = function (url) {
  return axios.create({
    baseURL: url ? url : SERVER_URL,
    headers: {
      /*  Authorization: `${
        JSON.parse(localStorage.getItem("launchpadKey") || "{}")?.token
      }`,*/
    },
  });
};

export const createInstance = function (url) {
  return axios.create({
    baseURL: url ? url : SERVER_URL,
    headers: {
      Authorization: JSON.parse(secureLocalStorage.getItem("launchpadKey"))
        ?.token,
    },
  });
};

export const getLaunchpadKey = () => {
  return JSON.parse(secureLocalStorage.getItem("launchpadKey") || "{}")?.token;
};

export const getVarTypeAndIsArray = (varVal) => {
  //return [varType, isArray];

  switch (varVal) {
    case "3":
      return { variableType: "3", isArray: "N" };
    case "13":
      return { variableType: "3", isArray: "Y" };
    case "4":
      return { variableType: "4", isArray: "N" };
    case "14":
      return { variableType: "4", isArray: "Y" };
    case "6":
      return { variableType: "6", isArray: "N" };
    case "16":
      return { variableType: "6", isArray: "Y" };
    case "8":
      return { variableType: "8", isArray: "N" };
    case "18":
      return { variableType: "8", isArray: "Y" };
    case "15":
      return { variableType: "15", isArray: "N" };
    case "115":
      return { variableType: "15", isArray: "Y" };
    case "10":
      return { variableType: "10", isArray: "N" };
    case "20":
      return { variableType: "10", isArray: "Y" };
    case "12":
      return { variableType: "12", isArray: "N" };
    // code added on 2 Jan 2023 for BugId 121349
    case "30":
      return { variableType: "30", isArray: "N" };
    case "40":
      return { variableType: "30", isArray: "Y" };
    default:
      return { variableType: "10", isArray: "N" };
  }
};

// Function used to see if process is read only and is used in activity properties and other modules.
export const isReadOnlyFunc = (openProcess, cellCheckedOut, cellLaneId) => {
  // code edited on 5 Dec 2022 for BugId 120080
  return (
    (openProcess?.ProcessType === PROCESSTYPE_DEPLOYED ||
      openProcess?.ProcessType === PROCESSTYPE_REGISTERED) &&
    cellCheckedOut === "N" &&
    !checkIfParentSwimlaneCheckedOut(openProcess, cellLaneId)?.length > 0
  );
};

// Function used to check whether process is deployed or not.
export const isProcessDeployedFunc = (openProcess) => {
  return (
    openProcess?.ProcessType === PROCESSTYPE_DEPLOYED ||
    openProcess?.ProcessType === PROCESSTYPE_REGISTERED ||
    openProcess?.ProcessType === "RC"
  );
};

export const isProcessReadOnly = (processType) => {
  return (
    processType === PROCESSTYPE_LOCAL_CHECKED ||
    processType === PROCESSTYPE_LOCAL
  );
};

export const isProcessReadDeployedFunc = (processType) => {
  return (
    processType === PROCESSTYPE_DEPLOYED ||
    processType === PROCESSTYPE_REGISTERED
  );
};

export const getComplex = (variable, parentVariable) => {
  let varList = [];
  let varRelationMapArr = variable?.RelationAndMapping
    ? variable.RelationAndMapping
    : variable["Relation&Mapping"];
  varRelationMapArr?.Mappings?.Mapping?.forEach((el) => {
    if (el.VariableType === "11") {
      let tempList = getComplex(el, variable);
      tempList.forEach((ell) => {
        varList.push({
          ...ell,
          SystemDefinedName: `${variable.VariableName}.${ell.VariableName}`,
          VariableName: `${variable.VariableName}.${ell.VariableName}`,
        });
      });
    } else {
      varList.push({
        DefaultValue: "",
        ExtObjectId: el.ExtObjectId
          ? el.ExtObjectId
          : variable.ExtObjectId
          ? variable.ExtObjectId
          : parentVariable.ExtObjectId,
        SystemDefinedName: `${variable.VariableName}.${el.VariableName}`,
        Unbounded: el.Unbounded,
        VarFieldId: el.VarFieldId,
        VarPrecision: el.VarPrecision,
        VariableId: el.VariableId,
        VariableLength: el.VariableLength,
        VariableName: `${variable.VariableName}.${el.VariableName}`,
        VariableScope: el.VariableScope
          ? el.VariableScope
          : variable.VariableScope
          ? variable.VariableScope
          : parentVariable.VariableScope,
        VariableType: el.VariableType,
      });
    }
  });

  return varList;
};

export const getVariableBasedOnScopeAndTypes = ({
  types = [],
  scopes = [],
  variables,
}) => {
  const allVars = getVariablesBasedOnTypes1({ types, variables });
  if (scopes.length > 0) {
    return getVariablesByScopes({ variables: allVars, scopes });
  }
  return allVars;
};

export const removeTheme = () => {
  let token = JSON.parse(secureLocalStorage.getItem("launchpadKey"))?.token;
  let themeString = window.location.origin + "/oap-rest/app/theme";
  for (let i = 0; i < document.styleSheets.length; i++) {
    if (
      document.styleSheets[i]?.href?.includes(token) ||
      document.styleSheets[i]?.href?.includes(themeString)
    ) {
      document.styleSheets[i].disabled = true;
    }
  }
};

export const removeUserSession = () => {
  secureLocalStorage.removeItem("launchpadKey");
  secureLocalStorage.removeItem("modelerData");
  //secureLocalStorage.removeItem("locale");
  secureLocalStorage.removeItem("cabinet");
  sessionStorage.removeItem("lastLoginTime");
  secureLocalStorage.removeItem("user_id");
  secureLocalStorage.removeItem("username");
  secureLocalStorage.removeItem("Authorization");
  secureLocalStorage.removeItem("dateFormat");
  localStorage.removeItem("calenderType");
  secureLocalStorage.removeItem("messageVisibilityThresholdTime");
  Object.keys(sessionStorage).forEach((key) => {
    if (key != "uniqueConfigKey") {
      sessionStorage.removeItem(key);
    }
  });
};

export const containsText = (text, searchText) => {
  return text?.toLowerCase().indexOf(searchText?.toLowerCase()) > -1;
};

export const checkDuplicateNameFunc = (itemArr, itemKey, prefix, seqId) => {
  let newName = numberedLabel(null, prefix, seqId);
  itemArr?.forEach((item) => {
    if (item[itemKey] === newName) {
      newName = checkDuplicateNameFunc(itemArr, itemKey, prefix, seqId + 1);
    }
  });
  return newName;
};
export const MaximumLengthText = (str, length) => {
  if (typeof str === "string" || str instanceof String) {
    return str.trim().length > length
      ? `Maximum ${length} characters are allowed.`
      : "";
  } else {
    return "";
  }
};

export const getVarDetails = (variables, name) => {
  let temp = {};
  variables?.forEach((item) => {
    if (item.VariableName == name) {
      temp = item;
    }
  });

  return temp;
};

export const shortenRuleStatement = (str, num) => {
  if (str?.length <= num) {
    return str;
  }
  return str?.slice(0, num) + "...";
};

export const replaceNChars = (str, replace, num) => {
  return str.slice(0, -num) + replace;
};

export const checkStyle = (styleArr, elem) => {
  let isPresent = false;
  styleArr.forEach((el) => {
    if (elem.includes(el) || elem === el) {
      isPresent = true;
    }
  });
  return isPresent;
};

export const RedefineEventTarget = (event, target) => {
  const newKeyPressEvent = new KeyboardEvent(event.type, {
    key: event.key,
    bubbles: event.bubbles,
    cancelable: event.cancelable,
  });

  Object.defineProperty(newKeyPressEvent, "target", {
    value: target,
    writable: false,
  });

  return newKeyPressEvent;
};

export const restrictSpecialCharacter = (str, reg) => {
  let regex = new RegExp(reg);
  return !regex.test(str);
};

export const checkRegex = (str, engRegex, arbRegex) => {
  if (isArabicLocaleSelected()) {
    const regex = new RegExp(arbRegex);
    return !regex.test(str);
  } else {
    const regex = new RegExp(engRegex);
    return regex.test(str);
  }
};

export const getLocale = () => {
  const locale = secureLocalStorage.getItem("locale");
  return locale;
};

export const getIncorrectRegexErrMsg = (entityName, t, charRestricted) => {
  let message = "";
  if (isArabicLocaleSelected()) {
    message =
      t(entityName) +
      SPACE +
      t("cannotContain") +
      SPACE +
      charRestricted +
      SPACE +
      t("charactersInIt");
  } else {
    message =
      t("AllCharactersAreAllowedExcept") +
      SPACE +
      charRestricted +
      SPACE +
      t("AndFirstCharacterShouldBeAlphabet") +
      SPACE +
      t("in") +
      SPACE +
      t(entityName) +
      ".";
  }
  return message;
};

export const getCommonRegErrorMsg = (entityName, t, charRestricted) => {
  let message = "";
  message =
    t(entityName) +
    SPACE +
    t("cannotContain") +
    SPACE +
    charRestricted +
    SPACE +
    t("charactersInIt");
  return message;
};

export const getIncorrectLenErrMsg = (entityName, maxLength, t) => {
  return (
    t("LengthShouldBeLessThan") +
    SPACE +
    maxLength +
    SPACE +
    t("characters") +
    SPACE +
    t("in") +
    SPACE +
    t(entityName)
  );
};

export const getGenErrMsg = (entityName, key, t) => {
  return t(entityName) + SPACE + t(key);
};

export function truncateString(str, length) {
  if (str?.length <= length) {
    return str; // No truncation needed
  }

  // Truncate the string as per the length provided.
  return str?.slice(0, length);
}

export const getVariableTypeByName = function GetVariableType({
  variables,
  name,
}) {
  const allVars = variables || [];
  const variable = allVars.find((item) => name === item.VariableName);
  return variable?.VariableType || "0";
};

export const isArabicLocaleSelected = () => {
  const locale =
    secureLocalStorage.getItem("locale") ||
    navigator.language ||
    navigator.userLanguage;
  return locale.startsWith(ARABIC_LOCALE);
};

export const isEnglishLocaleSelected = () => {
  const locale =
    secureLocalStorage.getItem("locale") ||
    navigator.language ||
    navigator.userLanguage;
  return locale.startsWith(ENGLISH_LOCALE);
};

// Function to insert a newline at cursor.
export const insertNewlineAtCursor = (textareaRef) => {
  const textarea = textareaRef.current;
  const { selectionStart, selectionEnd, value } = textarea;

  // Insert a newline character at the cursor position
  const newValue =
    value.substring(0, selectionStart) +
    "\n" +
    value.substring(selectionEnd, value.length);

  // Set the new cursor position
  textareaRef.current.selectionStart = textareaRef.current.selectionEnd =
    selectionStart + 1;

  return newValue;
};

// Function that checks if the file uploaded is greater than the maximum size allowed for files to be uploaded.
export function validateUploadedFile(sizeOfUploadedFile, maxSizeInMB) {
  let isFileTooLarge = false;

  if (sizeOfUploadedFile) {
    const maxSize = maxSizeInMB * 1024 * 1024; // maxSizeInMB in bytes
    if (sizeOfUploadedFile > maxSize) {
      isFileTooLarge = true;
    }
  }
  return isFileTooLarge;
}
export const isSafariBrowser = () => {
  return (
    /constructor/i.test(window.HTMLElement) ||
    (function (p) {
      return p.toString() === "[object SafariRemoteNotification]";
    })(!window["safari"] || (global.safari && global.safari.pushNotification))
  );
};

export const getBrandInfos = function GetBrandInfos({ dispatch }) {
  let requiredItems = ["commonLogo", "favIcon", "poweredByIcon"];
  dispatch(setBrandDetailsLoading(true));
  try {
    axios({
      url:
        SERVER_URL_LAUNCHPAD +
        BRAND_LOGOS +
        `?requiredBrandInfo=${JSON.stringify([...requiredItems])}`,
      method: "get",
    })
      .then((response) => {
        if (response.status === 200) {
          dispatch(setBrandDetails(response.data));
          dispatch(setBrandDetailsLoading(false));
        }
      })
      .catch((err) => {
        console.log(err);
        dispatch(setBrandDetailsLoading(false));
      });
  } catch (error) {
    console.log(error);
  }

  return null;
};

export const isActNameAlreadyPresent = (actName, milestonesData) => {
  // let mileStonesData = props.processData.MileStones;
  let mileStonesData = milestonesData;
  let isActivityNamePresent = false;
  outerLoop: for (let i = 0; i < mileStonesData?.length; i++) {
    const activityArr = mileStonesData[i];
    for (let d = 0; d < activityArr?.Activities?.length; d++) {
      const actData = activityArr.Activities[d];
      if (actData?.ActivityName === actName) {
        isActivityNamePresent = true;
        break outerLoop;
      }
      if (actData?.ActivityType === 35 && actData?.ActivitySubType === 1) {
        const embeddedDataArr = actData.EmbeddedActivity[0];
        for (let e = 0; e < embeddedDataArr.length; e++) {
          const embeddedElement = embeddedDataArr[e];
          if (embeddedElement?.ActivityName === actName) {
            isActivityNamePresent = true;
            break outerLoop;
          }
        }
      }
    }
  }
  return isActivityNamePresent;
};
