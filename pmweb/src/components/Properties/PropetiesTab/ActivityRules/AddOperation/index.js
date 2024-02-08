// #BugID - 107313
// #BugDescription - Added labels to operation with no label.
// #BugID - 107352
// #BugDescription - Added check so that cost field should only take numeric values.
// #BugID - 112369
// #BugDescription - Added provision to add constants in list with constants already made.
// #BugID - 115601
// #BugDescription - Added constants functionality for fields Date, days, mins, hours, secs and handled multipe checks.
// #BugID - 115604
// #BugDescription - Added constants functionality for email popup for reminder and handled multipe checks.
// #BugID - 115634
// #BugDescription - Added checks and made changes for secondary DB flag.
// #BugID - 114867
// #BugDescription - Added checks and made changes for secondary DB flag.
// #BugID - 116206
// #BugDescription - Added validation for blank entry for frequency and define mail.
// #BugID - 118836
// #BugDescription - In SET Operations data is handled according to IBPS-5.
// #BugID - 121070
// #BugDescription - Handled the issue for Low/Medium/High in priority list.
// #BugID - 121459
// #BugDescription - Handled the issue for keys in mailtriggerInfo.
// #BugID - 124888
// #BugDescription - Fixed the issue for activity/swimlane check in>> getting error while check in the changes for distribute workstep
// #BugID - 126901
// #BugDescription - Handled the issue for enabling the modify button after saving mail definition.
// #BugID - 126842
// #BugDescription - Changes done for Edit Timer Event: Email Operation: Entered email id is not showing.

import React, { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import styles from "./index.module.css";
import arabicStyles from "./ArabicStyles.module.css";
import {
  MenuItem,
  Radio,
  Checkbox,
  InputBase,
  Grid,
  IconButton,
} from "@material-ui/core";
import DeleteOutlinedIcon from "@material-ui/icons/DeleteOutlined";
import {
  operationTypeOptions,
  calendarTypeOptions,
  secondaryDBFlagOptions,
  getTypedropdown,
} from "../CommonFunctionCall";
import { store, useGlobalState } from "state-pool";
import {
  DATE_VARIABLE_TYPE,
  INTEGER_VARIABLE_TYPE,
  ADD_OPERATION_SYSTEM_FUNCTIONS,
  ADD_OPERATION_SECONDARY_DBFLAG,
  SYSTEM_DEFINED_SCOPE,
  USER_DEFINED_SCOPE,
  STRING_VARIABLE_TYPE,
  SET_OPERATION_TYPE,
  INC_PRIORITY_OPERATION_TYPE,
  DEC_PRIORITY_OPERATION_TYPE,
  TRIGGER_OPERATION_TYPE,
  COMMIT_OPERATION_TYPE,
  ASSIGNED_TO_OPERATION_TYPE,
  CALL_OPERATION_TYPE,
  SET_PARENT_DATA_OPERATION_TYPE,
  SET_AND_EXECUTE_OPERATION_TYPE,
  ESCALATE_TO_OPERATION_TYPE,
  ESCALATE_WITH_TRIGGER_OPERATION_TYPE,
  ROUTE_TO_OPERATION_TYPE,
  REINITIATE_OPERATION_TYPE,
  ROLLBACK_OPERATION_TYPE,
  AUDIT_OPERATION_TYPE,
  DISTRIBUTE_TO_OPERATION_TYPE,
  Y_FLAG,
  READ_RIGHT,
  MODIFY_RIGHT,
  OPTION_VALUE_1,
  OPTION_VALUE_2,
  RTL_DIRECTION,
  REMINDER_OPERATION_TYPE,
  ERROR_MANDATORY,
  COMPLEX_VARTYPE,
  RAISE_OPERATION_TYPE,
  CLEAR_OPERATION_TYPE,
  RESPONSE_OPERATION_TYPE,
  hideComplexFromVariables,
  RELEASE_OPERATION_TYPE,
  SHORT_DATE_VARIABLE_TYPE,
  FLOAT_VARIABLE_TYPE,
} from "../../../../../Constants/appConstants";
import {
  getOperatorOptions,
  getEmptyRuleOperationObj,
} from "../CommonFunctions";
import Modal from "../../../../../UI/Modal/Modal";
import TriggerDefinition from "../../../../ProcessSettings/Trigger/TriggerDefinition";
import { getVariableType } from "../../../../../utility/ProcessSettings/Triggers/getVariableType";
import ParameterMappingModal from "./MappingModal";
import CustomizedDropdown from "../../../../../UI/Components_With_ErrrorHandling/Dropdown";
import { isEqual, omit, unset } from "lodash";
import clsx from "clsx";
import { setToastDataFunc } from "../../../../../redux-store/slices/ToastDataHandlerSlice";
import { connect, useDispatch } from "react-redux";
import EmailPopup from "./EmailPopup";
import TextInput from "../../../../../UI/Components_With_ErrrorHandling/InputField";
import { getVariableByName } from "../../../../../utility/ProcessSettings/Triggers/triggerCommonFunctions";
import { REGEX, validateRegex } from "../../../../../validators/validator";
import {
  TRIGGER_PRIORITY_HIGH,
  TRIGGER_PRIORITY_LOW,
  TRIGGER_PRIORITY_MEDIUM,
} from "../../../../../Constants/triggerConstants";

function AddOperations(props) {
  let { t } = useTranslation();
  const direction = `${t("HTML_DIR")}`;
  const {
    index,
    localRuleData,
    setLocalRuleData,
    deleteOperation,
    isRuleBeingCreated,
    isRuleBeingModified,
    setIsRuleBeingModified,
    isReadOnly,
    registeredFunctions,
    operationsAllowed,
    workstepList,
    checkValidation,
    setCheckValidation,
    setDoesSelectedRuleHaveErrors,
    showDelIcon,
    variablesWithRights,
    cellActivityType,
  } = props;

  const dispatch = useDispatch();
  const loadedProcessDataObj = store.getState("loadedProcessData"); //current processdata clicked
  const [loadedProcessData] = useGlobalState(loadedProcessDataObj);
  const variableData = loadedProcessData?.Variable;
  const constantsData = loadedProcessData.DynamicConstant;
  //added by mahtab for reminder
  const tempOperationType =
    props?.currentTab === "Reminder"
      ? REMINDER_OPERATION_TYPE
      : SET_OPERATION_TYPE;

  const [operationType, setOperationType] = useState(tempOperationType);
  const [field, setField] = useState(""); // State to store the value of field dropdown.
  const [value1, setValue1] = useState(""); // State to store the value of value 1 dropdown.
  const [operator, setOperator] = useState("0"); // State to store the value of operator dropdown.
  const [value2, setValue2] = useState(""); // State to store the value of value 2 dropdown.
  const [calendarType, setCalendarType] = useState(Y_FLAG); // State to store the value of calendar type dropdown.
  const [triggerValue, setTriggerValue] = useState(""); // State to save value of the trigger selected.
  const [expValue, setExpValue] = useState(""); // State to save value of the exception selected.
  const [isModalOpen, setIsModalOpen] = useState(false); // State that manages modal.
  const [operandSelected, setOperandSelected] = useState(""); // State to save the value of operand selected in set and execute.
  const [applicationName, setApplicationName] = useState(""); // State to save the application type selected in set and execute.
  const [functionSelected, setFunctionSelected] = useState(""); // State to save the function selected.
  const [selectedFunctionMethodIndex, setSelectedFunctionMethodIndex] =
    useState(""); // State to save the methodIndex of the function selected.
  const [emailValue, setEmailValue] = useState("");
  const [dateValue, setDateValue] = useState("");
  const [daysValue, setDaysValue] = useState("");
  const [hoursValue, setHoursValue] = useState("");
  const [minutesValue, setMinutesValue] = useState("");
  const [secondsValue, setSecondsValue] = useState("");
  const [repeatAfterValue, setRepeatAfterValue] = useState(false);
  const [repeatAfterMinutesValue, setRepeatAfterMinutesValue] = useState("");
  const [mailTriggerSelected, setMailTriggerSelected] = useState("");
  const [auditPercentage, setAuditPercentage] = useState(5);
  const [ifSampledValue, setIfSampledValue] = useState("");
  const [notSampledValue, setNotSampledValue] = useState("");
  const [escalateWithTriggerRadio, setEscalateWithTriggerRadio] = useState(1);
  const [readRightsVariables, setReadRightsVariables] = useState(false);
  const [modifyRightsVariables, setModifyRightsVariables] = useState(false);

  const [functionOptions, setFunctionOptions] = useState([]); // State to store the function dropdown options.
  const [isDBFlagSelected, setIsDBFlagSelected] = useState(false); // State to store whether secondary db flag is selected or not.
  const [value1DropdownOptions, setValue1DropdownOptions] = useState([]); // State to store the options for value 1 dropdown.
  const [value2DropdownOptions, setValue2DropdownOptions] = useState([]); // State to store the options for value 2 dropdown.
  const [operatorList, setOperatorList] = useState([]); // State to store the list of operators according to the field selected.
  const [dropdownOptions, setDropdownOptions] = useState([]); // State to store all the data variables for dropdown options.
  const [assignedToValue, setAssignedToValue] = useState(""); // State to store the value of Assigned to variable dropdown.
  // const [isDateTypeFieldSelected, setIsDateTypeFieldSelected] = useState(false); // State to check if the value of field dropdown is date type or not in SET operation.
  const [routeToType, setRouteToType] = useState(OPTION_VALUE_1); // State to store route to type.
  const [selectedRouteToValue, setSelectedRouteToValue] = useState(""); // State to store selected route to value.
  const [selectedWorkstep, setSelectedWorkstep] = useState("");
  const [selectedChildVariable, setSelectedChildVariable] = useState("");
  const [selectedChildArray, setSelectedChildArray] = useState("");

  const [showSetOperations, setShowSetOperations] = useState(false); // Boolean to show SET operation fields.
  const [showTrigger, setShowTrigger] = useState(false); // Boolean to show TRIGGER operation fields.
  const [triggerListData, setTriggerListData] = useState([]); // List of triggers for a process.
  const [expListData, setExpListData] = useState([]); // List of triggers for a process.
  const [showSetAndExecute, setShowSetAndExecute] = useState(false); // Boolean to show SET AND EXECUTE operation fields.
  const [showAssignedTo, setShowAssignedTo] = useState(false); // Boolean to show Assigned to operation fields.
  const [showCallOp, setShowCallOp] = useState(false); // Boolean to show Call operation fields.
  const [showEscalateToOperations, setShowEscalateToOperations] =
    useState(false); // Boolean to show Escalate to operation fields.
  const [showEscalateWithTrigger, setShowEscalateWithTrigger] = useState(false); // Boolean to show Escalate to with trigger operation fields.
  const [showRouteTo, setShowRouteTo] = useState(false); // Boolean to show Route to operation fields.
  const [showAuditOp, setShowAuditOp] = useState(false); // Boolean to show Audit operation fields.
  const [showExceptionFld, setShowExceptionFld] = useState(false); // Boolean to show Exception fields.
  const [showDistributeOp, setShowDistributeOp] = useState(false);
  const [isField1Const, setIsField1Const] = useState(false);
  const [isField2Const, setIsField2Const] = useState(false);
  const [frequencyValue, setFrequencyValue] = useState("0");
  const [isOpenMailModal, setIsOpenMailModal] = useState(false);
  const [openTriggerModal, setOpenTriggerModal] = useState(false);
  const [parentEmailData, setParentEmailData] = useState({
    to: "",
    from: "",
    cc: "",
    bcc: "",
    priority: "",
    subject: "",
    body: "",
    type1: false,
    type2: false,
    type3: false,
    type4: false,
  });
  const [repeatAfterStatus, setRepeatAfterStatus] = useState(false);
  const [isDateConst, setIsDateConst] = useState(false);
  const [isDaysConst, setIsDaysConst] = useState(false);
  const [isHourConst, setIsHourConst] = useState(false);
  const [isMinConst, setIsMinConst] = useState(false);
  const [isSecConst, setIsSecConst] = useState(false);
  const [applicationNameOptions, setApplicationNameOptions] = useState([]);
  const [isAssignedToConst, setIsAssignedToConst] = useState(false);
  const [isVarEmailConst, setIsVarEmailConst] = useState(false);
  const [functionParam, setFunctionParam] = useState([]);
  const loadedActivityPropertyData = store.getState("activityPropertyData");
  const [localLoadedActivityPropertyData] = useGlobalState(
    loadedActivityPropertyData
  );
  const value1Ref = useRef();

  const setOperationTypes = [
    SET_OPERATION_TYPE,
    SET_PARENT_DATA_OPERATION_TYPE,
  ];
  const triggerOperationTypes = [TRIGGER_OPERATION_TYPE];
  const setAndExecuteAndCallTypes = [
    SET_AND_EXECUTE_OPERATION_TYPE,
    CALL_OPERATION_TYPE,
  ];
  const assignedToAndCallTypes = [ASSIGNED_TO_OPERATION_TYPE];
  const noFieldOperations = [
    INC_PRIORITY_OPERATION_TYPE,
    DEC_PRIORITY_OPERATION_TYPE,
    COMMIT_OPERATION_TYPE,
    REINITIATE_OPERATION_TYPE,
    ROLLBACK_OPERATION_TYPE,
    RELEASE_OPERATION_TYPE,
  ];

  const escalateTypeOptions = [
    ESCALATE_TO_OPERATION_TYPE,
    ESCALATE_WITH_TRIGGER_OPERATION_TYPE,
  ];

  const reminderTypeOptions = [REMINDER_OPERATION_TYPE];

  const auditTypeOption = [AUDIT_OPERATION_TYPE];

  const distributeToOption = [DISTRIBUTE_TO_OPERATION_TYPE];

  const multipleOpValidation = [
    ROLLBACK_OPERATION_TYPE,
    ROUTE_TO_OPERATION_TYPE,
    COMMIT_OPERATION_TYPE,
    REINITIATE_OPERATION_TYPE,
    AUDIT_OPERATION_TYPE,
    CALL_OPERATION_TYPE,
  ];

  const exceptionTypeOption = [
    RAISE_OPERATION_TYPE,
    CLEAR_OPERATION_TYPE,
    RESPONSE_OPERATION_TYPE,
  ];

  // Function that runs when the selectedFunctionMethodIndex value changes.
  useEffect(() => {
    if (functionOptions?.length > 0) {
      let tempFuncList = [...functionOptions];
      const filterFunc = tempFuncList?.filter(
        (d) => d.methodIndex === selectedFunctionMethodIndex
      );
      setFunctionParam(filterFunc[0]?.parameters);
    }
  }, [selectedFunctionMethodIndex, functionOptions]);

  // Function that runs when the isRuleBeingCreated value changes.
  useEffect(() => {
    setIsField1Const(false);
    setIsField2Const(false);
    setIsDateConst(false);
    setIsDaysConst(false);
    setIsHourConst(false);
    setIsMinConst(false);
    setIsSecConst(false);
  }, [isRuleBeingCreated]);

  // added on 03/10/23 for BugId 135855
  const checkForVarRights = (data) => {
    let temp = false;
    localLoadedActivityPropertyData?.ActivityProperty?.m_objDataVarMappingInfo?.dataVarList?.forEach(
      (item) => {
        if (+item?.processVarInfo?.variableId === +data.VariableId) {
          if (
            item?.m_strFetchedRights === "O" ||
            item?.m_strFetchedRights === "R" ||
            item?.m_strFetchedRights === "A"
          ) {
            temp = true;
          }
        }
      }
    );
    return temp;
  };

  const checkForModifyRights = (data) => {
    let temp = false;
    localLoadedActivityPropertyData?.ActivityProperty?.m_objDataVarMappingInfo?.dataVarList?.forEach(
      (item) => {
        if (+item?.processVarInfo?.variableId === +data.VariableId) {
          if (
            item?.m_strFetchedRights === "O" ||
            item?.m_strFetchedRights === "A"
          ) {
            temp = true;
          }
        }
      }
    );
    return temp;
  };

  // Function that gets called when variableData prop changes.
  useEffect(() => {
    if (variableData) {
      let variableWithConstants = [];
      constantsData?.forEach((element) => {
        let tempObj = {
          VariableName: element.ConstantName,
          VariableScope: "F",
        };
        variableWithConstants.push(tempObj);
      });
      variableData?.forEach((element) => {
        if (
          (hideComplexFromVariables &&
            element.VariableType !== COMPLEX_VARTYPE) ||
          !hideComplexFromVariables
        ) {
          // modified on 03/10/23 for BugId 135855
          // variableWithConstants.push(element);
          // added on 11/10/23 for BugId 139311
          if (
            (props.cellActivityType === 7 && props.cellActivitySubType === 1) ||
            props.cellActivityType === 5
          ) {
            variableWithConstants.push(element);
          } else {
            if (
              (element.VariableScope === "U" && checkForVarRights(element)) ||
              (element.VariableScope === "I" && checkForVarRights(element)) ||
              (element.VariableScope !== "U" && element.VariableScope !== "I")
            ) {
              variableWithConstants.push(element);
            }
          }
        }
      });

      //Removing the TATConsumed and TATRemaining for Rules due to user can only use for BAM reports, so no need of this as per requirement.
      variableWithConstants = variableWithConstants.filter(
        (d) =>
          d.VariableName !== "TATConsumed" && d.VariableName !== "TATRemaining"
      );
      setDropdownOptions(variableWithConstants);
    }
  }, [variableData]);

  useEffect(() => {
    if (
      (localRuleData.ruleOpList[index].opType ===
        SET_AND_EXECUTE_OPERATION_TYPE ||
        localRuleData.ruleOpList[index].opType === CALL_OPERATION_TYPE) &&
      registeredFunctions?.length > 0
    ) {
      setApplicationOptions(localRuleData.ruleOpList[index].opType);
    }

    if (
      localRuleData?.ruleOpList[index]?.opType === REMINDER_OPERATION_TYPE ||
      localRuleData?.ruleOpList[index]?.opType === ESCALATE_TO_OPERATION_TYPE ||
      localRuleData?.ruleOpList[index]?.opType ===
        ESCALATE_WITH_TRIGGER_OPERATION_TYPE ||
      localRuleData?.ruleOpList[index]?.opType === SET_OPERATION_TYPE ||
      localRuleData?.ruleOpList[index]?.opType ===
        SET_PARENT_DATA_OPERATION_TYPE
    ) {
      setCalendarType(Y_FLAG);
      setLocalRuleData((prevData) => {
        let temp = JSON.parse(JSON.stringify(prevData));
        temp.ruleOpList[index].ruleCalFlag = Y_FLAG;
        return temp;
      });
    } else {
      setCalendarType("");
      setLocalRuleData((prevData) => {
        let temp = JSON.parse(JSON.stringify(prevData));
        temp.ruleOpList[index].ruleCalFlag = "";
        return temp;
      });
    }
    // Added on 17-05-23 for Bug 127712.
  }, [localRuleData.ruleOpList[index].opType, registeredFunctions]);
  // till here for Bug 127712.

  // Function that runs when the variablesWithRights value changes.
  useEffect(() => {
    if (variablesWithRights) {
      const readVariables = variablesWithRights.filter(
        (element) => element.VariableType === READ_RIGHT
      );
      const modifyVariables = variablesWithRights.filter(
        (element) => element.VariableType === MODIFY_RIGHT
      );
      setReadRightsVariables(readVariables);
      setModifyRightsVariables(modifyVariables);
    }
  }, [variablesWithRights]);

  // Function that runs when the component loads.
  useEffect(() => {
    if (loadedProcessData) {
      let triggerList = [];
      // Added on 16-05-23 for bug 127902.
      loadedProcessData?.TriggerList?.forEach((element) => {
        triggerList?.push(element.TriggerName);
        //till here for bug 127902.
      });
      setTriggerListData(triggerList);
    }
    if (localRuleData.ruleOpList[index].opType === TRIGGER_OPERATION_TYPE) {
      setOperator("0");
    }
  }, [loadedProcessData?.TriggerList]);

  // Function that runs when the component loads.
  useEffect(() => {
    /*code added on 13 July 2023 for BugId 130801 */
    if (loadedProcessData) {
      let expList = [];
      loadedProcessData?.ExceptionList?.forEach((element) => {
        expList?.push(element.ExceptionName);
      });
      setExpListData(expList);
    }
  }, [loadedProcessData?.ExceptionList]);

  // Function that runs and selects the first available option in a route to operation dropdown.
  const setFirstRouteOption = (routeToValue) => {
    let firstOption = "";
    if (routeToValue === OPTION_VALUE_1) {
      firstOption = workstepList && workstepList[0];
    } else if (routeToValue === OPTION_VALUE_2) {
      firstOption = getFieldListing() && getFieldListing()[0]?.VariableName;
    }
    setSelectedRouteToValue(firstOption);
    setLocalRuleData((prevData) => {
      let temp = JSON.parse(JSON.stringify(prevData));
      temp.ruleOpList[index].param1 = firstOption;
      return temp;
    });
  };

  // Function to empty all data fields.
  const emptyAllDataFields = () => {
    setField("");
    setValue1("");
    setOperator("");
    setValue2("");
    setTriggerValue("");
    setExpValue(""); /*code added on 13 July 2023 for BugId 130801 */
    setOperandSelected("");
    setApplicationName("");
    setFunctionSelected("");
    setSelectedFunctionMethodIndex("");
    setValue1DropdownOptions([]);
    setValue2DropdownOptions([]);
    setOperatorList([]);
    setAssignedToValue("");
    setRouteToType("1");
    setSelectedRouteToValue("");
    setEmailValue("");
    setDateValue("");
    setDaysValue("");
    setHoursValue("");
    setMinutesValue("");
    setSecondsValue("");
    setRepeatAfterValue(false);
    setRepeatAfterMinutesValue("");
    setSelectedChildArray("");
    setSelectedWorkstep("");
    setSelectedChildVariable("");
  };

  // Function that generates the options for system and external functions based on its parameters.
  const getFunctionOptions = (methodIndex, isTypeNameSent) => {
    let functionsList = [];
    let functionOptionsList = [];
    let applicationName = isTypeNameSent
      ? methodIndex
      : getFunctionTypeName(methodIndex);

    // Function that checks if the parameter is the last parameter.
    const isLastParameter = (index, length) => {
      return index === length - 1;
    };

    if (applicationName === ADD_OPERATION_SYSTEM_FUNCTIONS) {
      functionsList =
        registeredFunctions &&
        registeredFunctions.filter((element) => {
          if (element.AppType === SYSTEM_DEFINED_SCOPE) {
            return element;
          }
        });
    } else {
      functionsList =
        registeredFunctions &&
        registeredFunctions.filter((element) => {
          if (
            element.AppName === applicationName &&
            element.AppType === USER_DEFINED_SCOPE
          ) {
            return element;
          }
        });
    }
    functionsList &&
      functionsList.forEach((element) => {
        let optionLabel = "";
        let paramLabel = "";
        element.Parameter &&
          element.Parameter.forEach((parameterElement, elemIndex) => {
            const concatenatedParameterLabel = paramLabel.concat(
              getVariableType(parameterElement.ParamType),
              isLastParameter(elemIndex, element.Parameter.length) ? "" : ","
            );
            paramLabel = concatenatedParameterLabel;
          });
        optionLabel = optionLabel.concat(
          element.MethodName,
          "(",
          paramLabel,
          ")"
        );
        const obj = {
          label: optionLabel,
          value: element.MethodName,
          parameters: element.Parameter,
          methodIndex: element.MethodIndex,
        };
        functionOptionsList.push(obj);
      });
    setFunctionOptions([...functionOptionsList]);
    getSelectedFunction(methodIndex, functionOptionsList);
  };

  // Might not be used for now.
  const filterVariablesAsPerRights = (variableData, rightsType) => {
    let filteredArray,
      temp = [];
    let arr = [];
    let variables = variableData;
    variables.forEach((element) => {
      if (element.VariableScope === "U" || element.VariableScope === "I") {
        variablesWithRights &&
          variablesWithRights.forEach((elem) => {
            if (elem.VariableType === rightsType) {
              if (element.VariableName === elem.VariableName) {
                temp.push(element);
              }
            }
          });
      }
    });
    variables.forEach((element, index) => {
      if (element.VariableScope === "U" || element.VariableScope === "I") {
        if (!temp.includes(element)) {
          arr.push(element);
        }
      }
    });
    filteredArray = variables.filter((element) => {
      return arr.indexOf(element) === -1;
    });

    return filteredArray;
  };

  // Function that gets the listing of variables in a particular order.
  const getFieldListing = (value) => {
    /* VariableIds of variables used are as follows :
      CalendarName : 10001,
      SecondaryDBFlag : 42,
      Status : 10022
    */
    let fieldArray = [];
    if (value === "19") {
      const defaultOptions =
        dropdownOptions &&
        dropdownOptions.filter((element) => {
          if (element.VariableId === "10001" || element.VariableId === "42")
            return element;
        });
      fieldArray = defaultOptions;
      const remainingOptions =
        dropdownOptions &&
        dropdownOptions.filter((element) => {
          if (element.VariableId === "10001" || element.VariableId === "42")
            return element;
        });
    } else {
      dropdownOptions &&
        dropdownOptions.forEach((element) => {
          if (
            element.VariableId === "10001" ||
            element.VariableId === "42" ||
            element.VariableId === "10022"
          ) {
            fieldArray.push(element);
          }
        });

      dropdownOptions &&
        dropdownOptions.forEach((element) => {
          if (
            element.VariableId !== "10001" &&
            element.VariableId !== "42" &&
            element.VariableId !== "10022" &&
            element.VariableType !== "11"
          ) {
            fieldArray.push(element);
          }
        });

      //updated by mahtab
      if (props.currentTab == "Reminder") {
        fieldArray = fieldArray.filter(
          (element) =>
            element.VariableScope === "U" ||
            (element.VariableScope === "I" && element.VariableType !== "11") ||
            element.VariableScope === "M"
        );
      } else {
        fieldArray = fieldArray?.filter(
          (element) =>
            element.VariableScope === "U" ||
            (element.VariableScope === "I" && element.VariableType !== "11") ||
            (element.VariableScope === "M" &&
              (element.VariableId === "10001" ||
                element.VariableId === "42" ||
                element.VariableId === "10022"))
        );
      }
    }

    return fieldArray;
  };

  // USED FUNCTION
  const setApplicationOptions = (opType) => {
    let options = [],
      tempArr = [];

    registeredFunctions?.forEach((element) => {
      if (
        element.AppType === USER_DEFINED_SCOPE &&
        !tempArr.includes(element.AppName)
      ) {
        tempArr.push(element.AppName);
      }
    });

    if (opType === SET_AND_EXECUTE_OPERATION_TYPE) {
      options = [ADD_OPERATION_SYSTEM_FUNCTIONS].concat(tempArr);
    } else if (opType === CALL_OPERATION_TYPE) {
      options = [...tempArr];
    }
    setApplicationNameOptions(options);
  };

  // Function to show field according to operation type.
  const setFieldValues = (element) => {
    const opType = element.opType;
    switch (opType) {
      case TRIGGER_OPERATION_TYPE:
        setTriggerValue(element.param1);
        break;
      case ASSIGNED_TO_OPERATION_TYPE:
        setAssignedToValue(element.param1);
        break;
      case SET_AND_EXECUTE_OPERATION_TYPE:
        setOperandSelected(element.param1); // for setting operand
        getFunctionOptions(element.param2, false); // list of options
        setSelectedFunctionMethodIndex(element.param2); // setter for selected method index
        if (registeredFunctions?.length > 0) {
          setApplicationOptions(opType);
        }
        setApplicationName(getFunctionTypeName(element.param2)); // for setting application name
        break;
      case CALL_OPERATION_TYPE:
        getFunctionOptions(element.param1, false);
        setSelectedFunctionMethodIndex(element.param1);
        if (registeredFunctions?.length > 0) {
          setApplicationOptions(opType);
        }
        setApplicationName(getFunctionTypeName(element.param1));
        break;
      case ROUTE_TO_OPERATION_TYPE:
        setRouteToType(checkParamType(element.param1));
        setSelectedRouteToValue(element.param1);
        break;
      case ESCALATE_TO_OPERATION_TYPE:
        setEmailValue(element.param1);
        setDateValue(element.param2);
        let parsedDate = Date.parse(localRuleData.ruleOpList[index].param2);

        if (
          isNaN(localRuleData.ruleOpList[index].param2) &&
          !isNaN(parsedDate)
        ) {
          setIsDateConst(true);
        } else {
          // setIsDateConst(false);
          if (localRuleData.ruleOpList[index].type2 !== "C") {
            setIsDateConst(false);
          }
        }

        setDaysValue(element.durationInfo.paramDays);
        setHoursValue(element.durationInfo.paramHours);
        setMinutesValue(element.durationInfo.paramMinutes);
        setSecondsValue(element.durationInfo.paramSeconds);
        // commented on 20/09/23 for BugId 137019
        // if (element.minute !== "") {
        //   setRepeatAfterValue(true);
        //   setRepeatAfterMinutesValue(element.minute);
        // }
        if (element.repeat) {
          setRepeatAfterValue(true);
          setRepeatAfterMinutesValue(element.m_strRepeatAfter);
        }
        break;
      case AUDIT_OPERATION_TYPE: /*code added on 13 July 2023 for BugId 130801 */
      case RESPONSE_OPERATION_TYPE /*code added on 13 July 2023 for BugId 130801 */:
        if (cellActivityType === 7) {
          setAuditPercentage(element.param1);
          setIfSampledValue(element.param2);
          setNotSampledValue(element.param3);
        } else if (cellActivityType === 10) {
          setExpValue(element.param1);
        }
        break;
      case ESCALATE_WITH_TRIGGER_OPERATION_TYPE:
      case REMINDER_OPERATION_TYPE:
        // setMailTriggerSelected(element.triggerName);
        // setMailTriggerSelected(element?.triggerName);
        setMailTriggerSelected(element?.sTriggerId); //Modified on 16/01/2024 for bug_id:142527
        setDateValue(element.param2);
        setDaysValue(element.durationInfo.paramDays);
        setHoursValue(element.durationInfo.paramHours);
        setMinutesValue(element.durationInfo.paramMinutes);
        setSecondsValue(element.durationInfo.paramSeconds);
        setFrequencyValue(element?.iReminderFrequency);
        // commented on 20/09/23 for BugId 137019
        // if (element.minute !== "") {
        //   setRepeatAfterValue(true);
        //   setRepeatAfterMinutesValue(element.minute);
        // }
        if (element.repeat) {
          setRepeatAfterValue(true);
          setRepeatAfterMinutesValue(element.m_strRepeatAfter);
        }
        // if (element.triggerName !== "") {
        if (element.triggerName !== "" || element?.sTriggerId!="") { //Modified on 16/01/2024 for bug_id:142527
          setEscalateWithTriggerRadio(2);
          props?.setTriggerType(2); //Added on 10/09/2023, bug_id:136026
        } else {
          // Modified on 18-10-23 for Bug 139512
          if (!isRuleBeingCreated && !isRuleBeingModified) {
            setEscalateWithTriggerRadio(1);
          }
          // Till here for Bug 139512
        }
        setParentEmailData({
          to: element?.mailTrigInfo?.mailInfo?.toConstant
            ? element?.mailTrigInfo?.mailInfo?.toConstant
            : element?.mailTrigInfo?.mailInfo?.toUser,
          from: element?.mailTrigInfo?.mailInfo?.fromConstant
            ? element?.mailTrigInfo?.mailInfo?.fromConstant
            : element?.mailTrigInfo?.mailInfo?.fromUser,
          cc: element?.mailTrigInfo?.mailInfo?.ccConstant
            ? element?.mailTrigInfo?.mailInfo?.ccConstant
            : element?.mailTrigInfo?.mailInfo?.ccUser,
          bcc: element?.mailTrigInfo?.mailInfo?.bccConstant
            ? element?.mailTrigInfo?.mailInfo?.bccConstant
            : element?.mailTrigInfo?.mailInfo?.bccUser,
          priority: element?.mailTrigInfo?.mailInfo?.priority,
          subject: element?.mailTrigInfo?.mailInfo?.subject,
          body: element?.mailTrigInfo?.mailInfo?.message,
          /*  type1: element?.mailTrigInfo?.mailInfo?.variableIdFrom,
          type2: element?.mailTrigInfo?.mailInfo?.variableIdTo,
          type3: element?.mailTrigInfo?.mailInfo?.variableIdCC,
          type4: element?.mailTrigInfo?.mailInfo?.variableIdBCC, */
          type1: element?.mailTrigInfo?.mailInfo?.m_bFromConst,
          type2: element?.mailTrigInfo?.mailInfo?.m_bToConst,
          type3: element?.mailTrigInfo?.mailInfo?.m_bCcConst,
          type4: element?.mailTrigInfo?.mailInfo?.m_bBCcConst,
        });
        break;
      case DISTRIBUTE_TO_OPERATION_TYPE:
        setSelectedWorkstep(element.param1);
        if (element.param2.trim() !== "") {
          setSelectedChildVariable(element.param2);
          setSelectedChildArray(element.param3);
        }
        break;
      case RAISE_OPERATION_TYPE /*code added on 13 July 2023 for BugId 130801 */:
        setExpValue(element.param1);
        break;
      case CLEAR_OPERATION_TYPE /*code added on 13 July 2023 for BugId 130801 */:
        setExpValue(element.param1);
        break;
      default:
        break;
    }
  };

  // Function to get the param type according to the param name.
  const checkParamType = (paramName) => {
    let paramType = "";
    workstepList &&
      workstepList.forEach((element) => {
        if (element === paramName) {
          paramType = OPTION_VALUE_1;
        }
      });
    if (paramType === "") {
      paramType = OPTION_VALUE_2;
    }
    return paramType;
  };

  // Function that sets the selected function according to the methodIndex.
  const getSelectedFunction = (methodIndex, functionOptions) => {
    let selectedFunction = "";
    let methodName = "";
    registeredFunctions &&
      registeredFunctions.forEach((element) => {
        if (element.MethodIndex === methodIndex) {
          methodName = element.MethodName;
        }
      });

    functionOptions &&
      functionOptions.forEach((element) => {
        if (
          element.value === methodName &&
          element.methodIndex === methodIndex
        ) {
          selectedFunction = element.methodIndex;
        }
      });

    setFunctionSelected(selectedFunction);
  };

  // Function to get the function type based on the app type.
  const getFunctionType = (element) => {
    if (element.AppType === SYSTEM_DEFINED_SCOPE) {
      return ADD_OPERATION_SYSTEM_FUNCTIONS;
    } else if (element.AppType === USER_DEFINED_SCOPE) {
      return element.AppName;
    }
  };

  // Function to get the function type name based on the method index.
  const getFunctionTypeName = (methodIndex) => {
    let functionType = "";
    registeredFunctions &&
      registeredFunctions.forEach((element) => {
        if (element.MethodIndex === methodIndex) {
          functionType = getFunctionType(element);
        }
      });
    return functionType;
  };

  // Function that handles the change in radio options for route to operation.
  const routeToRadioHandler = (event) => {
    const { value } = event.target;
    setRouteToType(value);
    setFirstRouteOption(value);
    if (isRuleBeingCreated === false) {
      setIsRuleBeingModified(true);
    }
  };

  // Function that handles the change in route to value.
  const routeToHandler = (event) => {
    setSelectedRouteToValue(event.target.value);
    setLocalRuleData((prevData) => {
      let temp = JSON.parse(JSON.stringify(prevData));
      temp.ruleOpList[index].param1 = event.target.value;
      return temp;
    });
    if (isRuleBeingCreated === false) {
      setIsRuleBeingModified(true);
    }
  };

  // Function that handles the change in audit percentage.
  const auditPercentageHandler = (event) => {
    const { value } = event.target;
    if (value >= 5) {
      setAuditPercentage(value);
    }
    setLocalRuleData((prevData) => {
      let temp = JSON.parse(JSON.stringify(prevData));
      temp.ruleOpList[index].param1 = value;
      return temp;
    });
  };

  // Function that handles the workstep changes.
  const workstepHandler = (event) => {
    const { value } = event.target;
    setSelectedWorkstep(value);
    setLocalRuleData((prevData) => {
      let temp = JSON.parse(JSON.stringify(prevData));
      temp.ruleOpList[index].param1 = value;
      return temp;
    });
    if (isRuleBeingCreated === false) {
      setIsRuleBeingModified(true);
    }
  };

  // Function that handles the child variable changes.
  const childVariableHandler = (event) => {
    const { value } = event.target;
    setSelectedChildVariable(value);
    setSelectedChildArray("");
    setLocalRuleData((prevData) => {
      let temp = JSON.parse(JSON.stringify(prevData));
      temp.ruleOpList[index].param2 = value;
      temp.ruleOpList[index].param3 = "";
      return temp;
    });
    if (isRuleBeingCreated === false) {
      setIsRuleBeingModified(true);
    }
  };

  // Function that handles the child array changes.
  const childArrayHandler = (event) => {
    const { value } = event.target;
    setSelectedChildArray(value);
    setLocalRuleData((prevData) => {
      let temp = JSON.parse(JSON.stringify(prevData));
      temp.ruleOpList[index].param3 = value;
      return temp;
    });
    if (isRuleBeingCreated === false) {
      setIsRuleBeingModified(true);
    }
  };

  // Function that gets the array variables for a particular variableData and variable type.
  const getArrayVariables = (variableData) => {
    const variableType = findVariableType(selectedChildVariable);
    return variableData?.filter(
      (element) =>
        element.VariableType === variableType && element.Unbounded === "Y"
    );
  };

  // Function that handles the change in 'if sampled' value.
  const ifSampledHandler = (event) => {
    const { value } = event.target;
    setIfSampledValue(value);
    setLocalRuleData((prevData) => {
      let temp = JSON.parse(JSON.stringify(prevData));
      temp.ruleOpList[index].param2 = value;
      return temp;
    });
  };

  // Function that handles the change in 'not sampled' value.
  const notSampledHandler = (event) => {
    const { value } = event.target;
    setNotSampledValue(value);
    setLocalRuleData((prevData) => {
      let temp = JSON.parse(JSON.stringify(prevData));
      temp.ruleOpList[index].param3 = value;
      return temp;
    });
  };

  // Function that handles the change in email value.
  const emailValueHandler = (event, isEmailConst) => {
    if (!checkDuplicateValues(event, "param1")) {
      /*code edited on 14 July 2023 for BugId 130964 - oracle>>entry settings>>escalate to>> no 
      option to add constant value for email/variable field */
      let variableScope, extObjId, varFieldId, variableId;
      const { value } = event.target;
      setEmailValue(value);
      if (isRuleBeingCreated === false) {
        setIsRuleBeingModified(true);
      }

      if (isEmailConst) {
        variableScope = "C";
        extObjId = "0";
        varFieldId = "0";
        variableId = "0";
      } else {
        let variable = getVariableByName(
          value,
          dropdownOptions?.filter(
            (element) =>
              +element.VariableType === 10 || element.VariableScope === "F"
          )
        );
        variableId =
          variable === null ||
          variable?.VariableId === "" ||
          variable?.VariableId === undefined
            ? "0"
            : variable.VariableScope === "F"
            ? "0"
            : variable.VariableId;
        varFieldId =
          variable === null ||
          variable?.VarFieldId === "" ||
          variable?.VarFieldId === undefined
            ? "0"
            : variable.VariableScope === "F"
            ? "0"
            : variable.VarFieldId;
        extObjId =
          variable === null ||
          variable?.ExtObjectId === "" ||
          variable?.ExtObjectId === undefined
            ? "0"
            : variable.VariableScope === "F"
            ? "0"
            : variable.ExtObjectId;
        variableScope = variable === null ? "C" : variable.VariableScope;
      }

      setLocalRuleData((prevData) => {
        let temp = JSON.parse(JSON.stringify(prevData));
        temp.ruleOpList[index].param1 = value;
        temp.ruleOpList[index].extObjID1 =
          extObjId === "" || extObjId === undefined ? "0" : extObjId;
        temp.ruleOpList[index].varFieldId_1 =
          varFieldId === "" || varFieldId === undefined ? "0" : varFieldId;
        temp.ruleOpList[index].variableId_1 =
          variableId === "" || variableId === undefined ? "0" : variableId;
        temp.ruleOpList[index].type1 = variableScope ? variableScope : "C";
        return temp;
      });
    }
  };

  // Function that handles the change in date value.
  const dateValueHandler = (event, islocalDateConst) => {
    if (!checkDuplicateValues(event, "param2")) {
      const { value } = event.target;
      setDateValue(value);
      setLocalRuleData((prevData) => {
        let temp = JSON.parse(JSON.stringify(prevData));
        temp.ruleOpList[index].param2 = value;
        if (islocalDateConst) {
          temp.ruleOpList[index].variableId_2 = "0";
          temp.ruleOpList[index].varFieldId_2 = "0";
          temp.ruleOpList[index].extObjID2 = "0";
          temp.ruleOpList[index].type2 = "C";
        } else {
          let variable = getVariableByName(
            value,
            variableData?.filter(
              (element) =>
                (element.VariableScope === "S" ||
                  element.VariableScope === "U") &&
                +element.VariableType === DATE_VARIABLE_TYPE
            )
          );
          temp.ruleOpList[index].variableId_2 =
            variable === null ||
            variable?.VariableId === "" ||
            variable?.VariableId === undefined
              ? "0"
              : variable.VariableId;
          temp.ruleOpList[index].varFieldId_2 =
            variable === null ||
            variable?.VarFieldId === "" ||
            variable?.VarFieldId === undefined
              ? "0"
              : variable.VarFieldId;
          temp.ruleOpList[index].extObjID2 =
            variable === null ||
            variable?.ExtObjectId === "" ||
            variable?.ExtObjectId === undefined
              ? "0"
              : variable.ExtObjectId;
          temp.ruleOpList[index].type2 = variable === null ? "C" : "";
        }
        return temp;
      });

      if (isRuleBeingCreated === false) {
        setIsRuleBeingModified(true);
      }
    }
  };

  //added by mahtab to get all variable details
  const getVarDetails = (name) => {
    let temp = {};
    variableData?.forEach((item) => {
      if (item.VariableName === name) {
        temp = item;
      }
    });
    return temp;
  };

  // Function that handles the change in days value.
  const daysValueHandler = (event, isLocalDaysConst) => {
    if (!checkDuplicateValues(event, "durationInfo.paramDays")) {
      const { value } = event.target;
      setDaysValue(value);
      setLocalRuleData((prevData) => {
        let temp = JSON.parse(JSON.stringify(prevData));
        temp.ruleOpList[index].durationInfo.paramDays = value;
        if (isLocalDaysConst) {
          temp.ruleOpList[index].durationInfo.variableIdDays = "0";
          temp.ruleOpList[index].durationInfo.varFieldIdDays = "0";
          temp.ruleOpList[index].durationInfo.m_strExtObjID_Days = "0";
          temp.ruleOpList[index].durationInfo.m_strDataType_Days = "C";
        } else {
          let variable = getVariableByName(value, dropdownOptions);
          temp.ruleOpList[index].durationInfo.variableIdDays =
            variable === null ||
            variable?.VariableId === "" ||
            variable?.VariableId === undefined
              ? "0"
              : variable.VariableId;
          temp.ruleOpList[index].durationInfo.varFieldIdDays =
            variable === null ||
            variable?.VarFieldId === "" ||
            variable?.VarFieldId === undefined
              ? "0"
              : variable.VarFieldId;
          temp.ruleOpList[index].durationInfo.m_strExtObjID_Days =
            variable === null ||
            variable?.ExtObjectId === "" ||
            variable?.ExtObjectId === undefined
              ? "0"
              : variable.ExtObjectId;
          temp.ruleOpList[index].durationInfo.m_strDataType_Days =
            variable === null ? "C" : variable.VariableScope;
        }

        return temp;
      });
    }
    if (isRuleBeingCreated === false) {
      setIsRuleBeingModified(true);
    }
  };

  // Function that handles the change in hours value.
  const hoursValueHandler = (event, islocalHourConst) => {
    if (!checkDuplicateValues(event, "durationInfo.paramHours")) {
      const { value } = event.target;
      setHoursValue(value);
      setLocalRuleData((prevData) => {
        let temp = JSON.parse(JSON.stringify(prevData));
        temp.ruleOpList[index].durationInfo.paramHours = value;
        if (islocalHourConst) {
          temp.ruleOpList[index].durationInfo.variableIdHours = "0";
          temp.ruleOpList[index].durationInfo.varFieldIdHours = "0";
          temp.ruleOpList[index].durationInfo.m_strExtObjID_Hours = "0";
          temp.ruleOpList[index].durationInfo.m_strType_Hours = "C";
        } else {
          let variable = getVariableByName(value, dropdownOptions);
          temp.ruleOpList[index].durationInfo.variableIdHours =
            variable === null ||
            variable?.VariableId === "" ||
            variable?.VariableId === undefined
              ? "0"
              : variable.VariableId;
          temp.ruleOpList[index].durationInfo.varFieldIdHours =
            variable === null ||
            variable?.VarFieldId === "" ||
            variable?.VarFieldId === undefined
              ? "0"
              : variable.VarFieldId;
          temp.ruleOpList[index].durationInfo.m_strExtObjID_Hours =
            variable === null ||
            variable?.ExtObjectId === "" ||
            variable?.ExtObjectId === undefined
              ? "0"
              : variable.ExtObjectId;
          temp.ruleOpList[index].durationInfo.m_strType_Hours =
            variable === null ? "C" : variable.VariableScope;
        }

        return temp;
      });
    }
    if (isRuleBeingCreated === false) {
      setIsRuleBeingModified(true);
    }
  };

  // Function that handles the change in minutes value.
  const minutesValueHandler = (event, islocalMinConst) => {
    if (!checkDuplicateValues(event, "durationInfo.paramMinutes")) {
      const { value } = event.target;
      setMinutesValue(value);
      setLocalRuleData((prevData) => {
        let temp = JSON.parse(JSON.stringify(prevData));
        temp.ruleOpList[index].durationInfo.paramMinutes = value;
        if (islocalMinConst) {
          temp.ruleOpList[index].durationInfo.variableIdMinutes = "0";
          temp.ruleOpList[index].durationInfo.varFieldIdMinutes = "0";
          temp.ruleOpList[index].durationInfo.m_strExtObjID_Minutes = "0";
          temp.ruleOpList[index].durationInfo.m_strType_Minutes = "C";
        } else {
          let variable = getVariableByName(value, dropdownOptions);
          temp.ruleOpList[index].durationInfo.variableIdMinutes =
            variable === null ||
            variable?.VariableId === "" ||
            variable?.VariableId === undefined
              ? "0"
              : variable.VariableId;
          temp.ruleOpList[index].durationInfo.varFieldIdMinutes =
            variable === null ||
            variable?.VarFieldId === "" ||
            variable?.VarFieldId === undefined
              ? "0"
              : variable.VarFieldId;
          temp.ruleOpList[index].durationInfo.m_strExtObjID_Minutes =
            variable === null ||
            variable?.ExtObjectId === "" ||
            variable?.ExtObjectId === undefined
              ? "0"
              : variable.ExtObjectId;
          temp.ruleOpList[index].durationInfo.m_strType_Minutes =
            variable === null ? "C" : variable.VariableScope;
        }

        return temp;
      });
    }
    if (isRuleBeingCreated === false) {
      setIsRuleBeingModified(true);
    }
  };

  // Function that handles the change in seconds value.
  const secondsValueHandler = (event, islocalSecondConst) => {
    if (!checkDuplicateValues(event, "durationInfo.paramSeconds")) {
      const { value } = event.target;
      setSecondsValue(value);
      setLocalRuleData((prevData) => {
        let temp = JSON.parse(JSON.stringify(prevData));
        temp.ruleOpList[index].durationInfo.paramSeconds = value;
        if (islocalSecondConst) {
          temp.ruleOpList[index].durationInfo.variableIdSeconds = "0";
          temp.ruleOpList[index].durationInfo.varFieldIdSeconds = "0";
          temp.ruleOpList[index].durationInfo.m_strExtObjID_Seconds = "0";
          temp.ruleOpList[index].durationInfo.m_strDataType_Seconds = "C";
        } else {
          let variable = getVariableByName(value, dropdownOptions);
          temp.ruleOpList[index].durationInfo.variableIdSeconds =
            variable === null ||
            variable?.VariableId === "" ||
            variable?.VariableId === undefined
              ? "0"
              : variable.VariableId;
          temp.ruleOpList[index].durationInfo.varFieldIdSeconds =
            variable === null ||
            variable?.VarFieldId === "" ||
            variable?.VarFieldId === undefined
              ? "0"
              : variable.VarFieldId;
          temp.ruleOpList[index].durationInfo.m_strExtObjID_Seconds =
            variable === null ||
            variable?.ExtObjectId === "" ||
            variable?.ExtObjectId === undefined
              ? "0"
              : variable.ExtObjectId;
          temp.ruleOpList[index].durationInfo.m_strDataType_Seconds =
            variable === null ? "C" : variable.VariableScope;
        }
        return temp;
      });
    }
    if (isRuleBeingCreated === false) {
      setIsRuleBeingModified(true);
    }
  };

  // Function that handles the change in 'repeat after minutes' value.
  const repeatAfterMinutesValueHandler = (event) => {
    // code added on 2 March 2023 for BugId 121558
    if (!validateRegex(event.target.value, REGEX.NumPositive)) {
      dispatch(
        setToastDataFunc({
          message: "Negative numbers are not allowed for Repeat After min(s)",
          severity: "error",
          open: true,
        })
      );
    } else {
      if (!checkDuplicateValues(event, "minute")) {
        const { value } = event.target;
        setRepeatAfterMinutesValue(value);
        setLocalRuleData((prevData) => {
          let temp = JSON.parse(JSON.stringify(prevData));
          temp.ruleOpList[index].minute = value;
          temp.ruleOpList[index].repeat = true;
          temp.ruleOpList[index].m_strRepeatAfter = value;

          return temp;
        });
      }
      if (isRuleBeingCreated === false) {
        setIsRuleBeingModified(true);
      }
    }
  };

  // Function that handles the change in escalate to radio.
  const escalateToRadioHandler = (event) => {
    const { value } = event.target;
    setEscalateWithTriggerRadio(value);
    // code edited on 24 Nov 2022 for BugId 116206
    setLocalRuleData((prevData) => {
      let temp = { ...prevData };
      if (+value === 1) {
        temp.ruleOpList[index].triggerName = "";
        temp.ruleOpList[index].sTriggerId = "";
      }
      return temp;
    });
    props?.setTriggerType(+value);
    if (isRuleBeingCreated === false) {
      setIsRuleBeingModified(true);
    }
  };

  // Function that runs when the ruleOpList on the localRuleData changes.
  // Changes made to solve Bug 121445
  useEffect(() => {
    setOperationType(localRuleData.ruleOpList[index].opType);
    checkOperationType(localRuleData.ruleOpList[index].opType);
    setField(localRuleData.ruleOpList[index].param1);
    setOperator(localRuleData.ruleOpList[index].operator);
    if (props.currentTab === "Reminder") {
      /*code edited on 17 July 2023 for BugId 132521 - While adding the rule, when the variable is of 
    text type and we enter any value in constant field, that includes abbreviation of month name, then 
    it gets converted to date.*/
      // modified on 21/09/23 for BugId 136677
      // if (
      //   param2VarType === "8" &&
      //   isValueDateType(localRuleData.ruleOpList[index].param2).isValDateType
      // ) {
      //   if (localRuleData.ruleOpList[index].type2 === "C") {
      //     setDateValue(
      //       isValueDateType(localRuleData.ruleOpList[index].param2)
      //         .convertedDate
      //     );
      //     setIsDateConst(true);
      //   }
      // } else {
      //   setDateValue(localRuleData.ruleOpList[index].param2);
      // }
      setDateValue(localRuleData.ruleOpList[index].param2);
      // till here BugId 136677
    } else {
      /*code edited on 17 July 2023 for BugId 132521 - While adding the rule, when the variable is of 
    text type and we enter any value in constant field, that includes abbreviation of month name, then 
    it gets converted to date.*/
      // modified on 21/09/23 for BugId 136677
      // if (
      //   param2VarType === "8" &&
      //   isValueDateType(localRuleData.ruleOpList[index].param2).isValDateType
      // ) {
      //   if (localRuleData.ruleOpList[index].type2 === "C") {
      //     setValue1(
      //       isValueDateType(localRuleData.ruleOpList[index].param2)
      //         .convertedDate
      //     );
      //   }
      // } else {
      //   setValue1(localRuleData.ruleOpList[index].param2);
      // }
      setValue1(localRuleData.ruleOpList[index].param2);
      // till here BugId 136677
    }
    /*code edited on 17 July 2023 for BugId 132521 - While adding the rule, when the variable is of 
    text type and we enter any value in constant field, that includes abbreviation of month name, then 
    it gets converted to date.*/
    // modified on 21/09/23 for BugId 136677
    // if (
    //   param3VarType === "8" &&
    //   isValueDateType(localRuleData.ruleOpList[index].param3).isValDateType
    // ) {
    //   if (localRuleData.ruleOpList[index].type3 === "C") {
    //     setValue2(
    //       isValueDateType(localRuleData.ruleOpList[index].param3).convertedDate
    //     );
    //   }
    // } else {
    //   setValue2(localRuleData.ruleOpList[index].param3);
    // }
    setValue2(localRuleData.ruleOpList[index].param3);
    // till here BugId 136677
    if (isConstIncluded(localRuleData.ruleOpList[index].param2)) {
      setIsField1Const(true);
    } else {
      setIsField1Const(false);
      if (localRuleData.ruleOpList[index].type2 === "C") {
        setIsField1Const(true);
      }
    }
    if (isConstIncluded(localRuleData.ruleOpList[index].param3)) {
      setIsField2Const(true);
    } else {
      setIsField2Const(false);
      if (localRuleData.ruleOpList[index].type3 === "C") {
        setIsField2Const(true);
      }
    }
    let parsedDate1 = Date.parse(localRuleData.ruleOpList[index].param2);
    let parsedDate2 = Date.parse(localRuleData.ruleOpList[index].param3);

    if (isNaN(localRuleData.ruleOpList[index].param2) && !isNaN(parsedDate1)) {
      setIsField1Const(true);
    } else {
      if (localRuleData.ruleOpList[index].type2 !== "C") {
        setIsField1Const(false);
      }
    }

    if (isNaN(localRuleData.ruleOpList[index].param3) && !isNaN(parsedDate2)) {
      setIsField2Const(true);
    } else {
      if (localRuleData.ruleOpList[index].type3 !== "C") {
        setIsField2Const(false);
      }
    }

    /*code edited on 14 July 2023 for BugId 130964 - oracle>>entry settings>>escalate to>> no 
    option to add constant value for email/variable field */
    if (isRuleBeingCreated) {
      setIsAssignedToConst(false);
      setIsVarEmailConst(false);
    } else {
      if (
        localRuleData.ruleOpList[index].variableId_1 === "0" &&
        localRuleData.ruleOpList[index].varFieldId_1 === "0"
      ) {
        if (isConstList(localRuleData.ruleOpList[index]?.param1)) {
          setIsAssignedToConst(false);
          setIsVarEmailConst(false);
        } else {
          if (
            localRuleData.ruleOpList[index].opType ===
            ESCALATE_TO_OPERATION_TYPE
          ) {
            setIsVarEmailConst(true);
          } else if (
            localRuleData.ruleOpList[index].opType ===
            ASSIGNED_TO_OPERATION_TYPE
          ) {
            setIsAssignedToConst(true);
          }
        }
      } else {
        setIsAssignedToConst(false);
        setIsVarEmailConst(false);
      }
    }

    if (
      localRuleData.ruleOpList[index]?.durationInfo?.variableIdDays === "0" &&
      localRuleData.ruleOpList[index]?.durationInfo?.varFieldIdDays === "0"
    ) {
      if (
        isConstList(localRuleData.ruleOpList[index]?.durationInfo?.paramDays)
      ) {
        setIsDaysConst(false);
      } else {
        setIsDaysConst(true);
      }
    }

    //Added  on 17/08/2023, bug_id:134442
    if (
      localRuleData.ruleOpList[index]?.variableId_2 === "0" &&
      localRuleData.ruleOpList[index]?.varFieldId_2 === "0"
    ) {
      if (isConstList(localRuleData.ruleOpList[index]?.param2)) {
        setIsDateConst(false);
      } else {
        setIsDateConst(true);
      }
    }
    //ends code for bug_id:134442

    if (
      localRuleData.ruleOpList[index]?.durationInfo?.variableIdHours === "0" &&
      localRuleData.ruleOpList[index]?.durationInfo?.varFieldIdHours === "0"
    ) {
      if (
        isConstList(localRuleData.ruleOpList[index]?.durationInfo?.paramHours)
      ) {
        setIsHourConst(false);
      } else {
        setIsHourConst(true);
      }
    }

    if (
      localRuleData.ruleOpList[index]?.durationInfo?.variableIdMinutes ===
        "0" &&
      localRuleData.ruleOpList[index]?.durationInfo?.varFieldIdMinutes === "0"
    ) {
      if (
        isConstList(localRuleData.ruleOpList[index]?.durationInfo?.paramMinutes)
      ) {
        setIsMinConst(false);
      } else {
        setIsMinConst(true);
      }
    }

    if (
      localRuleData.ruleOpList[index]?.durationInfo?.variableIdSeconds ===
        "0" &&
      localRuleData.ruleOpList[index]?.durationInfo?.varFieldIdSeconds === "0"
    ) {
      if (
        isConstList(localRuleData.ruleOpList[index]?.durationInfo?.paramSeconds)
      ) {
        setIsSecConst(false);
      } else {
        setIsSecConst(true);
      }
    }

    // code edited on 24 Nov 2022 for BugId 116206
    if (
      (+localRuleData.ruleOpList[index].dataType1 === DATE_VARIABLE_TYPE ||
        +localRuleData.ruleOpList[index].dataType1 ===
          SHORT_DATE_VARIABLE_TYPE) &&
      (localRuleData.ruleOpList[index].opType !== REMINDER_OPERATION_TYPE ||
        localRuleData.ruleOpList[index].opType !== ESCALATE_TO_OPERATION_TYPE)
    ) {
      setCalendarType(localRuleData.ruleOpList[index].ruleCalFlag);
    } else {
      /* code edited on 29 June 2023 for BugId 130966 - escalate with trigger>>while adding the rule 
      it is showing it is already added */
      if (
        localRuleData?.ruleOpList[index]?.opType === REMINDER_OPERATION_TYPE ||
        localRuleData?.ruleOpList[index]?.opType ===
          ESCALATE_TO_OPERATION_TYPE ||
        localRuleData?.ruleOpList[index]?.opType ===
          ESCALATE_WITH_TRIGGER_OPERATION_TYPE ||
        localRuleData?.ruleOpList[index]?.opType === SET_OPERATION_TYPE ||
        localRuleData?.ruleOpList[index]?.opType ===
          SET_PARENT_DATA_OPERATION_TYPE
      ) {
        setCalendarType(localRuleData.ruleOpList[index].ruleCalFlag);
      } else {
        setCalendarType("");
      }
    }

    setFieldValues(localRuleData.ruleOpList[index]);

    if (
      localRuleData.ruleOpList[index].param1 === ADD_OPERATION_SECONDARY_DBFLAG
    ) {
      setIsDBFlagSelected(true);
      setValue1DropdownOptions([...secondaryDBFlagOptions]);
    } else {
      setIsDBFlagSelected(false);
      getDropdownOptions(localRuleData.ruleOpList[index].param1);
    }
    /*code edited on 21 July 2023 for BugId 132939 - Entry Settings: no option to add constant 
    value in dropdown on Mapping window under call operation. */
  }, [localRuleData?.ruleOpList, registeredFunctions]);

  // Function that runs when the localRuleData?.ruleOpList[index].param1 value changes.
  useEffect(() => {
    if (
      (localRuleData?.ruleOpList[index]?.opType === SET_OPERATION_TYPE ||
        localRuleData?.ruleOpList[index]?.opType ===
          SET_PARENT_DATA_OPERATION_TYPE) &&
      isRuleBeingModified
    ) {
      if (
        +localRuleData.ruleOpList[index].dataType1 === DATE_VARIABLE_TYPE ||
        +localRuleData.ruleOpList[index].dataType1 === SHORT_DATE_VARIABLE_TYPE
      ) {
        setCalendarType(Y_FLAG);
        setLocalRuleData((prevData) => {
          let temp = JSON.parse(JSON.stringify(prevData));
          temp.ruleOpList[index].ruleCalFlag = Y_FLAG;
          return temp;
        });
      } else {
        if (
          localRuleData?.ruleOpList[index]?.opType !==
            REMINDER_OPERATION_TYPE &&
          localRuleData?.ruleOpList[index]?.opType !==
            ESCALATE_TO_OPERATION_TYPE &&
          localRuleData?.ruleOpList[index]?.opType !==
            ESCALATE_WITH_TRIGGER_OPERATION_TYPE
        ) {
          setCalendarType("");
          setLocalRuleData((prevData) => {
            let temp = JSON.parse(JSON.stringify(prevData));
            temp.ruleOpList[index].ruleCalFlag = "";
            return temp;
          });
        }
      }
    }

    if (isRuleBeingCreated) {
      if (
        +localRuleData.ruleOpList[index].dataType1 === DATE_VARIABLE_TYPE ||
        +localRuleData.ruleOpList[index].dataType1 === SHORT_DATE_VARIABLE_TYPE
      ) {
        setCalendarType(Y_FLAG);
        setLocalRuleData((prevData) => {
          let temp = JSON.parse(JSON.stringify(prevData));
          temp.ruleOpList[index].ruleCalFlag = Y_FLAG;
          return temp;
        });
      } else {
        if (
          localRuleData?.ruleOpList[index]?.opType !==
            REMINDER_OPERATION_TYPE &&
          localRuleData?.ruleOpList[index]?.opType !==
            ESCALATE_TO_OPERATION_TYPE &&
          localRuleData?.ruleOpList[index]?.opType !==
            ESCALATE_WITH_TRIGGER_OPERATION_TYPE
        ) {
          setCalendarType("");
          setLocalRuleData((prevData) => {
            let temp = JSON.parse(JSON.stringify(prevData));
            temp.ruleOpList[index].ruleCalFlag = "";
            return temp;
          });
        }
      }
    }
  }, [localRuleData?.ruleOpList[index]?.param1]);

  // Function that gets the dropdown options and list of operator based on the field selected.
  const getDropdownOptions = (value) => {
    const variableType = findVariableType(value);
    const operatorList = getOperatorOptions(variableType);
    setOperatorList([...operatorList]);
    if (+variableType === STRING_VARIABLE_TYPE) {
      const filteredParam1Options = dropdownOptions;
      setValue1DropdownOptions(filteredParam1Options);
    } else {
      const filteredParam1Options =
        dropdownOptions &&
        dropdownOptions.filter((element) => {
          if (
            element.VariableType === variableType ||
            element.VariableScope === "F"
          ) {
            return element;
          }
        });
      setValue1DropdownOptions(filteredParam1Options);
    }
    getFieldValues(variableType);
  };

  // Function to select first trigger value.
  const selectFirstTrigger = () => {
    setTriggerValue(triggerListData && triggerListData[0]);
    if (
      localRuleData?.ruleOpList[index]?.param1 === "" &&
      triggerListData.length > 0
    ) {
      setLocalRuleData((prevData) => {
        let temp = JSON.parse(JSON.stringify(prevData));
        temp.ruleOpList[index].param1 =
          triggerListData?.length !== 0 ? triggerListData[0] : "";
        return temp;
      });
    }
  };

  /*code added on 13 July 2023 for BugId 130801 */
  // Function to select first trigger value.
  const selectFirstException = () => {
    setExpValue(expListData && expListData[0]);
    if (
      localRuleData?.ruleOpList[index]?.param1 === "" &&
      expListData.length > 0
    ) {
      setLocalRuleData((prevData) => {
        let temp = JSON.parse(JSON.stringify(prevData));
        temp.ruleOpList[index].param1 =
          expListData?.length !== 0 ? expListData[0] : "";
        return temp;
      });
    }
  };

  // Function that checks the operation type and set the fields accordingly.
  const checkOperationType = (value) => {
    if (setOperationTypes.includes(value)) {
      setShowSetOperations(true);
      setShowTrigger(false);
      setShowAssignedTo(false);
      getFieldListing(value);
      setShowSetAndExecute(false);
      setShowCallOp(false);
      setShowRouteTo(false);
      setShowEscalateToOperations(false);
      setShowAuditOp(false);
      setShowDistributeOp(false);
      setShowExceptionFld(
        false
      ); /*code added on 13 July 2023 for BugId 130801 */
    } else if (triggerOperationTypes.includes(value)) {
      setShowTrigger(true);
      selectFirstTrigger();
      setShowSetOperations(false);
      setShowAssignedTo(false);
      setShowSetAndExecute(false);
      setShowRouteTo(false);
      setShowEscalateToOperations(false);
      setShowAuditOp(false);
      setShowDistributeOp(false);
      setShowExceptionFld(
        false
      ); /*code added on 13 July 2023 for BugId 130801 */
    } else if (setAndExecuteAndCallTypes.includes(value)) {
      if (value === CALL_OPERATION_TYPE) {
        setShowCallOp(true);
        setShowSetAndExecute(false);
      } else if (value === SET_AND_EXECUTE_OPERATION_TYPE) {
        setShowSetAndExecute(true);
        setShowCallOp(false);
      }
      setShowAuditOp(false);
      setShowTrigger(false);
      setShowSetOperations(false);
      setShowAssignedTo(false);
      setShowRouteTo(false);
      setShowEscalateToOperations(false);
      setShowDistributeOp(false);
      setShowExceptionFld(
        false
      ); /*code added on 13 July 2023 for BugId 130801 */
    } else if (assignedToAndCallTypes.includes(value)) {
      setShowAuditOp(false);
      setShowAssignedTo(true);
      setShowSetAndExecute(false);
      setShowTrigger(false);
      setShowSetOperations(false);
      setShowSetAndExecute(false);
      setShowCallOp(false);
      setShowRouteTo(false);
      setShowEscalateToOperations(false);
      setShowDistributeOp(false);
      setShowExceptionFld(
        false
      ); /*code added on 13 July 2023 for BugId 130801 */
    } else if (ROUTE_TO_OPERATION_TYPE === value) {
      setShowAuditOp(false);
      setShowRouteTo(true);
      setShowAssignedTo(false);
      setShowSetAndExecute(false);
      setShowTrigger(false);
      setShowSetOperations(false);
      setShowSetAndExecute(false);
      setShowCallOp(false);
      setShowEscalateToOperations(false);
      setShowDistributeOp(false);
      setShowExceptionFld(
        false
      ); /*code added on 13 July 2023 for BugId 130801 */
    } else if (escalateTypeOptions.includes(value)) {
      setShowAuditOp(false);
      setShowEscalateToOperations(true);
      if (value === ESCALATE_TO_OPERATION_TYPE) {
        setShowEscalateWithTrigger(false);
      } else if (value === ESCALATE_WITH_TRIGGER_OPERATION_TYPE) {
        setShowEscalateWithTrigger(true);
      }
      setShowAssignedTo(false);
      setShowSetAndExecute(false);
      setShowTrigger(false);
      setShowSetOperations(false);
      setShowSetAndExecute(false);
      setShowCallOp(false);
      setShowRouteTo(false);
      setShowDistributeOp(false);
      setShowExceptionFld(
        false
      ); /*code added on 13 July 2023 for BugId 130801 */
    } else if (auditTypeOption.includes(value) && +cellActivityType === 7) {
      setShowAuditOp(true);
      setShowEscalateToOperations(false);
      setShowAssignedTo(false);
      setShowSetAndExecute(false);
      setShowTrigger(false);
      setShowSetOperations(false);
      setShowSetAndExecute(false);
      setShowCallOp(false);
      setShowRouteTo(false);
      setShowDistributeOp(false);
      setShowExceptionFld(
        false
      ); /*code added on 13 July 2023 for BugId 130801 */
    } else if (distributeToOption.includes(value)) {
      setShowAuditOp(false);
      setShowEscalateToOperations(false);
      setShowAssignedTo(false);
      setShowSetAndExecute(false);
      setShowTrigger(false);
      setShowSetOperations(false);
      setShowSetAndExecute(false);
      setShowCallOp(false);
      setShowRouteTo(false);
      setShowDistributeOp(true);
      setShowExceptionFld(
        false
      ); /*code added on 13 July 2023 for BugId 130801 */
    } else if (
      /*code added on 13 July 2023 for BugId 130801 */
      exceptionTypeOption.includes(value)
      // commented on 13/10/23 for BugId 139492
      // && +cellActivityType === 10
      // till here BugId 139492
    ) {
      setShowAuditOp(false);
      selectFirstException();
      setShowEscalateToOperations(false);
      setShowAssignedTo(false);
      setShowSetAndExecute(false);
      setShowTrigger(false);
      setShowSetOperations(false);
      setShowSetAndExecute(false);
      setShowCallOp(false);
      setShowRouteTo(false);
      setShowDistributeOp(false);
      setShowExceptionFld(true);
    } else {
      setShowAuditOp(false);
      setShowEscalateToOperations(false);
      setShowAssignedTo(false);
      setShowSetAndExecute(false);
      setShowTrigger(false);
      setShowSetOperations(false);
      setShowSetAndExecute(false);
      setShowCallOp(false);
      setShowRouteTo(false);
      setShowDistributeOp(false);
      setShowExceptionFld(
        false
      ); /*code added on 13 July 2023 for BugId 130801 */
    }
  };

  // Function that runs when the user changes the type of the operation.
  const onSelectType = (event) => {
    const { value } = event.target;
    emptyAllDataFields();
    if (isRuleBeingCreated === false) {
      setIsRuleBeingModified(true);
    }
    if (value === ROUTE_TO_OPERATION_TYPE) {
      setFirstRouteOption(routeToType);
    }
    let temp = { ...localRuleData };
    temp.ruleOpList[index] = getEmptyRuleOperationObj(
      temp.ruleOpList[index].opOrderId,
      temp.ruleOpList[index].opType
    );
    setLocalRuleData(temp);

    if (multipleOpValidation.includes(value)) {
      if (!multipleOperationValidation(value)) {
        checkOperationType(value);
        setOperationType(value);
        setLocalRuleData((prevData) => {
          let temp = JSON.parse(JSON.stringify(prevData));
          temp.ruleOpList[index].opType = value;
          return temp;
        });
      } else {
        dispatch(
          setToastDataFunc({
            message: `${getTypedropdown(value)} ${t(
              "operationAlreadyDefined"
            )}.`,
            severity: "error",
            open: true,
          })
        );
      }
    } else {
      checkOperationType(value);
      setOperationType(value);
      setLocalRuleData((prevData) => {
        let temp = JSON.parse(JSON.stringify(prevData));
        temp.ruleOpList[index].opType = value;
        return temp;
      });
    }
  };

  // Function that validates if multiple operations are defined or not.
  const multipleOperationValidation = (value) => {
    let temp = false;
    localRuleData &&
      localRuleData.ruleOpList.forEach((element) => {
        if (element.opType === value) {
          temp = true;
        }
      });
    return temp;
  };

  // Function that runs when the user changes the trigger dropdown value for a TRIGGER operation.
  const onSelectTrigger = (event) => {
    if (!checkDuplicateValues(event, "param1")) {
      if (isRuleBeingCreated === false) {
        setIsRuleBeingModified(true);
      }
      setTriggerValue(event.target.value);
      setLocalRuleData((prevData) => {
        let temp = JSON.parse(JSON.stringify(prevData));
        temp.ruleOpList[index].param1 = event.target.value;
        return temp;
      });
    }
  };

  /*code added on 13 July 2023 for BugId 130801 */
  // Function that runs when the user changes the trigger dropdown value for a TRIGGER operation.
  const onSelectException = (event) => {
    if (!checkDuplicateValues(event, "param1")) {
      if (isRuleBeingCreated === false) {
        setIsRuleBeingModified(true);
      }
      setExpValue(event.target.value);
      setLocalRuleData((prevData) => {
        let temp = JSON.parse(JSON.stringify(prevData));
        temp.ruleOpList[index].param1 = event.target.value;
        return temp;
      });
    }
  };

  // Function that validates if the same operation has already been defined or not.
  const checkDuplicateValues = (event, key) => {
    let temp = false;
    const operationType =
      localRuleData && localRuleData.ruleOpList[index].opType;
    let obj = JSON.parse(JSON.stringify(localRuleData.ruleOpList[index]));
    obj[key] = event.target.value;
    obj = omit(obj, "opOrderId");

    localRuleData &&
      localRuleData.ruleOpList.forEach((element) => {
        if (element.opType === operationType) {
          let tempObj = omit(element, "opOrderId");
          if (isEqual(tempObj, obj)) {
            temp = true;
            dispatch(
              setToastDataFunc({
                message: `${getTypedropdown(operationType)} ${t(
                  "operationAlreadyDefined"
                )}.`,
                severity: "error",
                open: true,
              })
            );
          }
        }
      });
    return temp;
  };

  // Function that runs when the user changes the field dropdown value for a SET operation.
  const handleFieldChange = (event) => {
    if (!checkDuplicateValues(event, "param1")) {
      const temp = [];
      setIsField1Const(false);
      setValue2DropdownOptions([...temp]);
      setValue1DropdownOptions([...temp]);
      setOperatorList([...temp]);
      setValue1("");
      setValue2("");
      setOperator("");
      setField(event.target.value);
      let variableScope, extObjId, varFieldId, variableId, variableType;
      getFieldListing()
        .filter(
          (element) =>
            element.VariableScope !== "S" && element.VariableScope !== "F"
        )
        ?.forEach((value) => {
          if (value.VariableName === event.target.value) {
            extObjId = value.ExtObjectId;
            varFieldId = value.VarFieldId;
            variableId = value.VariableId;
            variableScope = value.VariableScope;
            variableType = value.VariableType;
          }
        });
      if (isRuleBeingCreated === false) {
        setIsRuleBeingModified(true);
      }
      setLocalRuleData((prevData) => {
        let temp = JSON.parse(JSON.stringify(prevData));
        temp.ruleOpList[index].param1 = event.target.value;
        temp.ruleOpList[index].extObjID1 = extObjId;
        temp.ruleOpList[index].varFieldId_1 = varFieldId;
        temp.ruleOpList[index].variableId_1 = variableId;
        temp.ruleOpList[index].type1 = variableScope ? variableScope : "C";
        // modified on 08/09/2023 for BugId 135331
        temp.ruleOpList[index].dataType1 = variableType;
        temp.ruleOpList[index].param2 =
          event.target.value === ADD_OPERATION_SECONDARY_DBFLAG ? "U" : "";
        temp.ruleOpList[index].operator = "0";
        temp.ruleOpList[index].param3 = "";
        return temp;
      });

      if (event.target.value === ADD_OPERATION_SECONDARY_DBFLAG) {
        setIsDBFlagSelected(true);
        setValue1DropdownOptions([...secondaryDBFlagOptions]);
        setValue1(secondaryDBFlagOptions && secondaryDBFlagOptions[0].value);
      } else {
        setIsDBFlagSelected(false);
        let variableType = findVariableType(event.target.value);
        const operatorList = getOperatorOptions(variableType);
        setOperatorList([...operatorList]);

        if (+variableType === STRING_VARIABLE_TYPE) {
          const filteredParam1Options = dropdownOptions;
          setValue1DropdownOptions(filteredParam1Options);
        } else {
          const filteredParam1Options =
            dropdownOptions &&
            dropdownOptions.filter((element) => {
              if (
                element.VariableType === variableType ||
                element.VariableScope === "F"
              ) {
                return element;
              }
            });

          setValue1DropdownOptions(filteredParam1Options);
        }

        if (
          +variableType === DATE_VARIABLE_TYPE ||
          +variableType === SHORT_DATE_VARIABLE_TYPE
        ) {
          const filteredParam2Options =
            dropdownOptions &&
            dropdownOptions.filter((element) => {
              if (
                +element.VariableType === INTEGER_VARIABLE_TYPE ||
                element.VariableScope === "F"
              ) {
                return element;
              }
            });
          setValue2DropdownOptions(filteredParam2Options);
        } else {
          const filteredParam1Options =
            dropdownOptions &&
            dropdownOptions.filter((element) => {
              if (
                element.VariableType === variableType ||
                element.VariableScope === "F"
              ) {
                return element;
              }
            });
          setValue2DropdownOptions(filteredParam1Options);
        }
      }
    }
  };

  // Function that closes the modal.
  const handleClose = () => {
    setIsModalOpen(false);
  };

  // Function that opens the modal.
  const openModal = () => {
    setIsModalOpen(true);
  };

  // Function that is used to find the variable type of a specific variable.
  const findVariableType = (value) => {
    let variableType = "";
    dropdownOptions &&
      dropdownOptions.forEach((element) => {
        if (element.VariableName === value) {
          variableType = element.VariableType;
        }
      });

    return variableType;
  };

  // Function that gets the dropdown options for value 2 dropdown based on the variable type given.
  const getFieldValues = (variableType) => {
    if (variableType !== "") {
      if (
        +variableType === DATE_VARIABLE_TYPE ||
        +variableType === SHORT_DATE_VARIABLE_TYPE
      ) {
        const filteredParam2Options = dropdownOptions?.filter((element) => {
          if (
            +element.VariableType === INTEGER_VARIABLE_TYPE ||
            element.VariableScope === "F"
          ) {
            return element;
          }
        });
        setValue2DropdownOptions(filteredParam2Options);
      } else if (+variableType === STRING_VARIABLE_TYPE) {
        setValue2DropdownOptions(dropdownOptions);
      } else {
        const filteredParam2Options =
          dropdownOptions &&
          dropdownOptions.filter((element) => {
            if (
              element.VariableType === variableType ||
              element.VariableScope === "F"
            ) {
              return element;
            }
          });
        setValue2DropdownOptions(filteredParam2Options);
      }
    }
  };

  const isValueSecondaryDBFlag = (value) => {
    let isValueDBFlag = false;
    if (value === ADD_OPERATION_SECONDARY_DBFLAG) {
      isValueDBFlag = true;
    }
    return isValueDBFlag;
  };

  // Function that runs when the user changes the first value dropdown for a SET operation.
  const handleValue1Change = (event, isValue1Const) => {
    if (!checkDuplicateValues(event, "param2")) {
      let variableType = findVariableType(event.target.value);
      let variableScope, extObjId, varFieldId, variableId;
      setValue1(event.target.value);
      getFieldValues(variableType);
      if (isRuleBeingCreated === false) {
        setIsRuleBeingModified(true);
      }
      if (isValue1Const) {
        extObjId = "0";
        varFieldId = "0";
        variableId = "0";
        variableScope = "C";
      } else {
        value1DropdownOptions?.forEach((value) => {
          if (
            value.VariableName === event.target.value &&
            value.VariableScope !== "F"
          ) {
            extObjId = value.ExtObjectId;
            varFieldId = value.VarFieldId;
            variableId = value.VariableId;
            variableScope = value.VariableScope;
          } else if (
            value.VariableName === event.target.value &&
            value.VariableScope === "F"
          ) {
            extObjId = "0";
            varFieldId = "0";
            variableId = "0";
            variableScope = "F";
          }
        });
      }

      setLocalRuleData((prevData) => {
        let temp = JSON.parse(JSON.stringify(prevData));
        temp.ruleOpList[index].param2 = event.target.value;
        temp.ruleOpList[index].extObjID2 =
          extObjId === "" || extObjId === undefined ? "0" : extObjId;
        temp.ruleOpList[index].varFieldId_2 =
          varFieldId === "" || varFieldId === undefined ? "0" : varFieldId;
        temp.ruleOpList[index].variableId_2 =
          variableId === "" || variableId === undefined ? "0" : variableId;
        temp.ruleOpList[index].type2 = variableScope
          ? variableScope
          : isValueSecondaryDBFlag(localRuleData.ruleOpList[index].param1)
          ? ""
          : "C";
        return temp;
      });
    }
  };

  // Function that runs when the user changes the operator dropdown for a SET operation.
  const handleOperatorChange = (event) => {
    if (!checkDuplicateValues(event, "operator")) {
      setOperator(event.target.value);
      setValue2("");
      if (isRuleBeingCreated === false) {
        setIsRuleBeingModified(true);
      }
      setLocalRuleData((prevData) => {
        let temp = JSON.parse(JSON.stringify(prevData));
        temp.ruleOpList[index].operator = event.target.value;
        temp.ruleOpList[index].param3 = "";
        temp.ruleOpList[index].extObjID3 = "0";
        temp.ruleOpList[index].varFieldId_3 = "0";
        temp.ruleOpList[index].variableId_3 = "0";
        temp.ruleOpList[index].type3 = "V";
        return temp;
      });
    }
  };

  // Function that checks if value is a part of existing dropdown options or is it from a constant newly added.
  const isConstIncluded = (value) => {
    let isConstantIncluded = false;
    if (value !== "") {
      value2DropdownOptions?.forEach((element) => {
        if (element.VariableName === value && element.VariableScope === "C") {
          isConstantIncluded = true;
        }
      });
    }

    return isConstantIncluded;
  };

  const isConstList = (value) => {
    let isConstantList = false;
    if (value !== "") {
      let variableWithConstants = [];
      constantsData?.forEach((element) => {
        let tempObj = {
          VariableName: element.ConstantName,
          VariableScope: "F",
        };
        variableWithConstants.push(tempObj);
      });
      variableData.forEach((element) => {
        variableWithConstants.push(element);
      });

      variableWithConstants?.forEach((element) => {
        if (element.VariableName === value && element.VariableScope === "F") {
          isConstantList = true;
        }
      });
    }

    return isConstantList;
  };

  // Function that runs when the user changes the second value dropdown for a SET operation.
  const handleValue2Change = (event, isVal2Const) => {
    if (!checkDuplicateValues(event, "param3")) {
      let variableScope, extObjId, varFieldId, variableId;
      setValue2(event.target.value);
      if (isRuleBeingCreated === false) {
        setIsRuleBeingModified(true);
      }

      if (isVal2Const) {
        variableScope = "C";
        extObjId = "0";
        varFieldId = "0";
        variableId = "0";
      } else {
        value2DropdownOptions?.forEach((value) => {
          if (
            value.VariableName === event.target.value &&
            value.VariableScope !== "F"
          ) {
            extObjId = value.ExtObjectId;
            varFieldId = value.VarFieldId;
            variableId = value.VariableId;
            variableScope = value.VariableScope;
          } else if (
            value.VariableName === event.target.value &&
            value.VariableScope === "F"
          ) {
            variableScope = "F";
            extObjId = "0";
            varFieldId = "0";
            variableId = "0";
          }
        });
      }

      setLocalRuleData((prevData) => {
        let temp = JSON.parse(JSON.stringify(prevData));
        temp.ruleOpList[index].param3 = event.target.value;
        temp.ruleOpList[index].extObjID3 =
          extObjId === "" || extObjId === undefined ? "0" : extObjId;
        temp.ruleOpList[index].varFieldId_3 =
          varFieldId === "" || varFieldId === undefined ? "0" : varFieldId;
        temp.ruleOpList[index].variableId_3 =
          variableId === "" || variableId === undefined ? "0" : variableId;
        temp.ruleOpList[index].type3 = variableScope ? variableScope : "C";
        return temp;
      });
    }
  };

  // Function that runs when the user changes the calendar type dropdown for a SET operation.
  const handleCalendarType = (event) => {
    if (!checkDuplicateValues(event, "ruleCalFlag")) {
      setCalendarType(event.target.value);
      if (isRuleBeingCreated === false) {
        setIsRuleBeingModified(true);
      }
      if (event.target.value === "Y") {
        setRepeatAfterStatus(false);
      } else {
        setRepeatAfterStatus(true);
      }

      setLocalRuleData((prevData) => {
        let temp = JSON.parse(JSON.stringify(prevData));
        temp.ruleOpList[index].ruleCalFlag = event.target.value;
        return temp;
      });
    }
  };

  // Function that handles the application name changes.
  const handleApplicationName = (event) => {
    setFunctionSelected("");
    setApplicationName(event.target.value);
    getFunctionOptions(event.target.value, true);
    if (isRuleBeingCreated === false) {
      setIsRuleBeingModified(true);
    }
  };

  // Function that handles the selected operand in SET and EXECUTE operation.
  const handleOperandSelected = (event) => {
    const { value } = event.target;
    if (!checkDuplicateValues(event, "param1")) {
      if (!showCallOp) {
        setOperandSelected(value);
        setLocalRuleData((prevData) => {
          let temp = JSON.parse(JSON.stringify(prevData));
          temp.ruleOpList[index].param1 = value;
          temp.ruleOpList[index].type1 = getVarDetails(value).VariableScope;
          temp.ruleOpList[index].varFieldId_1 = getVarDetails(value).VarFieldId;
          temp.ruleOpList[index].variableId_1 = getVarDetails(value).VariableId;
          temp.ruleOpList[index].extObjID1 = getVarDetails(value).ExtObjectId;
          return temp;
        });
      }
    }
  };

  // Function that handles the selected function in SET and EXECUTE operation.
  const handleSelectedFunction = (event) => {
    setFunctionSelected(event.target.value);

    //Added  on 16/08/2023, bug_id:130970
    let tempFuncList = [...functionOptions];
    const filterFunc = tempFuncList?.filter(
      (d) => d.methodIndex === event.target.value
    );
    setFunctionParam(filterFunc[0]?.parameters);

    //bug_id:130970 code ends

    if (isRuleBeingCreated === false) {
      setIsRuleBeingModified(true);
    }
    setLocalRuleData((prevData) => {
      let temp = JSON.parse(JSON.stringify(prevData));
      if (showCallOp) {
        temp.ruleOpList[index].param1 = event.target.value;
      } else {
        temp.ruleOpList[index].param2 = event.target.value;
      }
      return temp;
    });
  };

  // Function that handles the assigned to variable changes.
  const handleAssignedToVariable = (event, isAssignedVarConst) => {
    if (!checkDuplicateValues(event, "param1")) {
      let variableScope, extObjId, varFieldId, variableId;
      setAssignedToValue(event.target.value);
      if (isRuleBeingCreated === false) {
        setIsRuleBeingModified(true);
      }

      if (isAssignedVarConst) {
        variableScope = "C";
        extObjId = "0";
        varFieldId = "0";
        variableId = "0";
      } else {
        dropdownOptions
          ?.filter(
            (element) =>
              element.VariableType === "10" || element.VariableScope === "F"
          )
          .map((value) => {
            if (value.VariableName === event.target.value) {
              extObjId = value.ExtObjectId;
              varFieldId = value.VarFieldId;
              variableId = value.VariableId;
              variableScope = value.VariableScope;
            }
            if (value.VariableScope === "F") {
              extObjId = "0";
              varFieldId = "0";
              variableId = "0";
            }
          });
      }

      setLocalRuleData((prevData) => {
        let temp = JSON.parse(JSON.stringify(prevData));
        temp.ruleOpList[index].param1 = event.target.value;
        temp.ruleOpList[index].extObjID1 =
          extObjId === "" || extObjId === undefined ? "0" : extObjId;
        temp.ruleOpList[index].varFieldId_1 =
          varFieldId === "" || varFieldId === undefined ? "0" : varFieldId;
        temp.ruleOpList[index].variableId_1 =
          variableId === "" || variableId === undefined ? "0" : variableId;
        temp.ruleOpList[index].type1 = variableScope ? variableScope : "C";
        return temp;
      });
    }
  };

  // Function to get trigger details.
  const getTriggerDetails = (val) => {
    let temp = {};
    loadedProcessData?.TriggerList?.forEach((item) => {
      if (item.TriggerName === val) {
        temp = item;
      }
    });

    return temp;
  };

  // mahtab Function that runs when the user changes mail trigger to show the email trigger when click on select mail trigger
  const mailTriggerHandler = (e) => {
    setMailTriggerSelected(e.target.value);
    //Added on 16/01/2024 for bug_id:142527
    const trigData = loadedProcessData?.TriggerList.filter(
      (d) => d.TriggerId === e.target.value
    );
    //till here for bug_id:142527
    if (!checkDuplicateValues(e, "triggerName")) {
      //  setAssignedToValue(e.target.value);
      setAssignedToValue(trigData[0]?.TriggerName); //Modified on 16/01/2024 for bug_id:142527
      setLocalRuleData((prevData) => {
        let temp = JSON.parse(JSON.stringify(prevData));
        // temp.ruleOpList[index].triggerName = e.target.value;
        temp.ruleOpList[index].triggerName = trigData[0]?.TriggerName; //Modified on 16/01/2024 for bug_id:142527
        /* temp.ruleOpList[index].sTriggerId = getTriggerDetails(
           e.target.value
        ).TriggerId; */
        temp.ruleOpList[index].sTriggerId = e.target.value //Modified on 16/01/2024 for bug_id:142527
        return temp;
      });
    }

    //Added on 16/01/2024 for bug_id:142527
    if (isRuleBeingCreated === false) {
      setIsRuleBeingModified(true);
    }
    //till here for bug_id:142527
  };

  // Function to show email modal for reminder added by mahtab
  const showEmailModal = () => {
    setIsOpenMailModal(true);
  };

  // Function to close email modal.
  const handleCloseEmailModal = () => {
    setIsOpenMailModal(false);
  };

  // Function that handles the change in days value.
  const frequencyValueHandler = (event) => {
    // code added on 2 March 2023 for BugId 121558
    if (!validateRegex(event.target.value, REGEX.NumPositive)) {
      dispatch(
        setToastDataFunc({
          message: "Negative numbers are not allowed for frequency.",
          severity: "error",
          open: true,
        })
      );
    } else {
      if (!checkDuplicateValues(event, "iReminderFrequency")) {
        const { value } = event.target;
        setFrequencyValue(value);
        setLocalRuleData((prevData) => {
          let temp = JSON.parse(JSON.stringify(prevData));
          temp.ruleOpList[index].iReminderFrequency = value;
          return temp;
        });
      }
      if (isRuleBeingCreated === false) {
        setIsRuleBeingModified(true);
      }
    }
  };

  // Call back function to set email data of the popup email.
  const passEmailData = (data) => {
    setParentEmailData(data);
    setLocalRuleData((prevData) => {
      let temp = JSON.parse(JSON.stringify(prevData));
      let varIdTo;
      let varFieldTo;
      let extObjTo;
      let varIdFrom;
      let varFieldFrom;
      let extObjFrom;
      let varIdCC;
      let varFieldCC;
      let extObjCC;
      let varIdBCC;
      let varFieldBCC;
      let extObjBCC;
      let varFieldTypeTo;
      let varFieldTypeFrom;
      let varFieldTypeCC, varFieldTypeBCC;
      let varFieldTypePriority;
      let variableIdPriority;
      let m_bFromConst, m_bToConst, m_bCcConst, m_bBCcConst;
      console.log("###", "DATA", data);
      if (data.type1) {
        varIdFrom = "0";
        varFieldFrom = "0";
        extObjFrom = "0";
        varFieldTypeFrom = "C";
        // added on 20/09/23 for BugId 137563,BugId 135974
        m_bFromConst = true;
      } else {
        varIdFrom = getVarDetails(data.from).VariableId;
        varFieldFrom = getVarDetails(data.from).VarFieldId;
        extObjFrom = getVarDetails(data.from).ExtObjectId;
        varFieldTypeFrom = getVarDetails(data.from).VariableScope;
        // added on 20/09/23 for BugId 137563,BugId 135974
        m_bFromConst = false;
      }

      if (data.type2) {
        varIdTo = "0";
        varFieldTo = "0";
        extObjTo = "0";
        varFieldTypeTo = "C";
        // added on 20/09/23 for BugId 137563,BugId 135974
        m_bToConst = true;
      } else {
        varIdTo = getVarDetails(data.to).VariableId;
        varFieldTo = getVarDetails(data.to).VarFieldId;
        extObjTo = getVarDetails(data.to).ExtObjectId;
        varFieldTypeTo = getVarDetails(data.to).VariableScope;
        // added on 20/09/23 for BugId 137563,BugId 135974
        m_bToConst = false;
      }

      if (data.type3) {
        varIdCC = "0";
        varFieldCC = "0";
        extObjCC = "0";
        // added on 20/09/23 for BugId 137563
        varFieldTypeCC = "C";
        m_bCcConst = true;
      } else {
        varIdCC = getVarDetails(data.cc).VariableId;
        varFieldCC = getVarDetails(data.cc).VarFieldId;
        extObjCC = getVarDetails(data.cc).ExtObjectId;
        // added on 20/09/23 for BugId 137563
        varFieldTypeCC = getVarDetails(data.cc).VariableScope;
        m_bCcConst = false;
      }

      if (data.type4) {
        varIdBCC = "0";
        varFieldBCC = "0";
        extObjBCC = "0";
        // added on 20/09/23 for BugId 137563
        varFieldTypeBCC = "C";
        m_bBCcConst = true;
      } else {
        varIdBCC = getVarDetails(data.bcc).VariableId;
        varFieldBCC = getVarDetails(data.bcc).VarFieldId;
        extObjBCC = getVarDetails(data.bcc).ExtObjectId;
        // added on 20/09/23 for BugId 137563
        varFieldTypeBCC = getVarDetails(data.bcc).VariableScope;
        m_bBCcConst = false;
      }

      let priorityVar = getVariableByName(data.priority, variableData);

      let priorityVal = null;
      if (priorityVar === null) {
        // modified on 20/09/23 for BugId 137563
        // if (data.priority == "Low") {
        if (data.priority === t(TRIGGER_PRIORITY_LOW)) {
          priorityVal = 1;
        }
        // modified on 20/09/23 for BugId 137563
        // if (data.priority == "Medium") {
        else if (data.priority === t(TRIGGER_PRIORITY_MEDIUM)) {
          priorityVal = 2;
        }
        // modified on 20/09/23 for BugId 137563
        // if (data.priority == "High") {
        else if (data.priority === t(TRIGGER_PRIORITY_HIGH)) {
          priorityVal = 3;
        }
        varFieldTypePriority = "0";
        variableIdPriority = "0";
      } else {
        priorityVal = data.priority;
        varFieldTypePriority = getVarDetails(data.priority).VariableScope;
        variableIdPriority = getVarDetails(data.priority).VariableId;
      }

      let mailInfo = {
        toUser: data.to,
        fromUser: data.from,
        ccUser: data.cc,
        bccUser: data.bcc,
        priority: priorityVal === null ? "" : priorityVal,
        subject: data.subject,
        message: data.body,
        variableIdTo: varIdTo,
        varFieldIdTo: varFieldTo,
        extObjIDTo: extObjTo,
        variableIdFrom: varIdFrom,
        varFieldIdFrom: varFieldFrom,
        extObjIDFrom: extObjFrom,
        variableIdCC: varIdCC,
        varFieldIdCC: varFieldCC,
        extObjIDCC: extObjCC,
        variableIdBCC: varIdBCC,
        varFieldIdBCC: varFieldBCC,
        extObjIDBCC: extObjBCC,
        varFieldTypeFrom: varFieldTypeFrom,
        varFieldTypeTo: varFieldTypeTo,
        varFieldTypePriority: varFieldTypePriority,
        variableIdPriority: variableIdPriority,
        // added on 20/09/23 for BugId 137563
        varFieldTypeCC: varFieldTypeCC,
        varFieldTypeBCC: varFieldTypeBCC,
        m_bFromConst: m_bFromConst,
        m_bToConst: m_bToConst,
        m_bCcConst: m_bCcConst,
        m_bBCcConst: m_bBCcConst,
      };

      temp.ruleOpList[index].mailTrigInfo = { mailInfo: mailInfo };
      return temp;
    });
  };

  return (
    <div
      className={
        direction === RTL_DIRECTION ? arabicStyles.flexRow : styles.flexRow
      }
      style={{
        alignItems: showEscalateToOperations ? "start" : null,
        flexDirection:
          props.currentTab === "Reminder" || showEscalateToOperations
            ? "column"
            : "row",
      }}
    >
      {/* Bug 137846:- Updated the screen as per new UX design*/}
      <Grid
        style={{
          width:
            props.currentTab === "Reminder" || showEscalateToOperations
              ? "100%"
              : null,
        }}
      >
        <p className={styles.dropdownMargin}></p>
        <Grid
          className={
            direction === RTL_DIRECTION ? arabicStyles.flexRow : styles.flexRow
          }
          style={
            props.currentTab === "Reminder" || showEscalateToOperations
              ? { marginTop: "0rem", width: "100%" }
              : null
          }
        >
          <Grid
            className={
              direction === RTL_DIRECTION
                ? arabicStyles.flexRow
                : styles.flexRow
            }
            style={{
              alignItems: !showEscalateToOperations ? "center" : null,
              justifyContent: "space-between",
            }}
            xs={
              props.currentTab === "Reminder" || showEscalateToOperations
                ? 10
                : 12
            }
          >
            <Grid item className={styles.flexColumn}>
              <p className={styles.operationsLabel}>{t("type")}</p>
              <CustomizedDropdown
                id={`AR_Operation_Type_Dropdown_${index}`}
                disabled={isReadOnly}
                className={
                  direction === RTL_DIRECTION
                    ? arabicStyles.typeDropdown
                    : styles.typeDropdown
                }
                value={
                  props.currentTab === "Reminder"
                    ? REMINDER_OPERATION_TYPE
                    : operationType
                }
                onChange={(event) => onSelectType(event)}
                validationBoolean={checkValidation}
                validationBooleanSetterFunc={setCheckValidation}
                showAllErrorsSetterFunc={setDoesSelectedRuleHaveErrors}
                maxHeight="10rem"
                ariaLabel={"Select an Operation Type"}
              >
                {/*code edited on 13 July 2023 for BugId 130801 */}
                {operationTypeOptions
                  .filter(
                    (item) =>
                      (operationsAllowed.includes(item.value) &&
                        item.value === "25" &&
                        +cellActivityType === +item.activityType) ||
                      (operationsAllowed.includes(item.value) &&
                        item.value !== "25")
                  )
                  .map((element) => {
                    return (
                      <MenuItem
                        className={
                          direction === RTL_DIRECTION
                            ? arabicStyles.menuItemStyles
                            : styles.menuItemStyles
                        }
                        key={element.value}
                        value={element.value}
                        disabled={
                          (+element.value === 21 &&
                            props.isActivityCheckedOut === "Y") ||
                          (+element.value === 4 &&
                            props.isActivityCheckedOut === "Y")
                        }
                      >
                        {element.label}
                      </MenuItem>
                    );
                  })}
              </CustomizedDropdown>
            </Grid>

            {showEscalateToOperations || props.currentTab === "Reminder" ? (
              <Grid
                item
                //className={styles.flexColumnMargin}
                style={{
                  width: "100%",
                  alignItems:
                    !showEscalateWithTrigger && props.currentTab !== "Reminder"
                      ? "flex-start"
                      : "flex-end",
                }}
                className={
                  direction === RTL_DIRECTION
                    ? arabicStyles.flexEndColumn
                    : styles.flexColumn
                }
              >
                <div
                  className={
                    direction === RTL_DIRECTION
                      ? arabicStyles.flexEndColumn
                      : styles.flexColumn
                  }
                >
                  {!showEscalateWithTrigger &&
                  props?.currentTab !== "Reminder" ? (
                    <div
                      className={clsx(
                        direction === RTL_DIRECTION
                          ? arabicStyles.flexEndColumn
                          : styles.flexStartColumn,
                        styles.dropdownMargin
                      )}
                    >
                      <p className={styles.operationsLabel}>
                        {t("variableOrEmail")}
                      </p>
                      {/*code edited on 14 July 2023 for BugId 130964 - oracle>>entry settings>>escalate to>> no 
                option to add constant value for email/variable field */}
                      <CustomizedDropdown
                        id={`AO_Escalate_To_Variable_Dropdown_${index}`}
                        disabled={isReadOnly}
                        className={
                          direction === RTL_DIRECTION
                            ? arabicStyles.escalateToVariableDropdown
                            : styles.escalateToVariableDropdown
                        }
                        value={emailValue}
                        onChange={(event, isConst) =>
                          emailValueHandler(event, isConst)
                        }
                        validationBoolean={checkValidation}
                        validationBooleanSetterFunc={setCheckValidation}
                        showAllErrorsSetterFunc={setDoesSelectedRuleHaveErrors}
                        isConstant={isVarEmailConst}
                        setIsConstant={(val) => setIsVarEmailConst(val)}
                        showConstValue={true}
                        validateConstField={(e) => {
                          if (
                            e.target.value !== "" &&
                            e.target.value?.length > 255
                          ) {
                            dispatch(
                              setToastDataFunc({
                                message:
                                  "Value length can't be more than 255 characters.",
                                severity: "error",
                                open: true,
                              })
                            );
                            return false;
                          }
                          return true;
                        }}
                      >
                        {dropdownOptions
                          ?.filter(
                            (element) =>
                              +element.VariableType === 10 ||
                              element.VariableScope === "F"
                          )
                          .map((element) => {
                            return (
                              <MenuItem
                                className={
                                  direction === RTL_DIRECTION
                                    ? arabicStyles.menuItemStyles
                                    : styles.menuItemStyles
                                }
                                key={element.VariableName}
                                value={element.VariableName}
                              >
                                {element.VariableName}
                              </MenuItem>
                            );
                          })}
                      </CustomizedDropdown>
                    </div>
                  ) : (
                    <div
                      className={
                        direction === RTL_DIRECTION
                          ? arabicStyles.flexRow
                          : styles.flexRow
                      }
                      style={{ marginTop: "1.25rem", alignItems: "center" }}
                    >
                      <Radio
                        disabled={isReadOnly}
                        id={`AO_Escalate_trigger_Define_Mail_Option_${index}`}
                        checked={+escalateWithTriggerRadio === 1}
                        onChange={escalateToRadioHandler}
                        className={styles.radioOption}
                        value={1}
                        inputProps={{ "aria-label": "Define Mail" }}
                      />
                      <p
                        className={styles.routeToType}
                        style={{ transform: "none" }}
                      >
                        {t("defineMail")}
                      </p>
                      <Radio
                        disabled={isReadOnly}
                        id={`AO_Escalate_trigger_Select_Mail_Option_${index}`}
                        checked={+escalateWithTriggerRadio === 2}
                        onChange={escalateToRadioHandler}
                        className={styles.radioOption}
                        value={2}
                        inputProps={{ "aria-label": "Select Mail Trigger" }}
                      />
                      <p
                        className={styles.routeToType}
                        style={{ transform: "none" }}
                      >
                        {t("selectMailTrigger")}
                      </p>
                      {+escalateWithTriggerRadio === 2 ? (
                        <p style={{ marginLeft: "1vw" }}>
                          <CustomizedDropdown
                            className={
                              direction === RTL_DIRECTION
                                ? arabicStyles.escalateToVariableDropdown
                                : styles.escalateToVariableDropdown
                            }
                            id={`AO_Reminder_trigger_Define_Mail_Dropdown_${index}`}
                            onChange={(event) => {
                              mailTriggerHandler(event);
                            }}
                            style={{
                              marginRight:
                                direction === RTL_DIRECTION ? "10px" : "unset",
                              marginLeft:
                                direction === RTL_DIRECTION && "unset",
                            }}
                            value={mailTriggerSelected}
                            validationBoolean={checkValidation}
                            validationBooleanSetterFunc={setCheckValidation}
                            showAllErrorsSetterFunc={
                              setDoesSelectedRuleHaveErrors
                            }
                          >
                            {loadedProcessData.TriggerList.filter(
                              (d) => d.TriggerType === "M"
                            ).map((data, i) => (
                              <MenuItem
                                className={
                                  direction === RTL_DIRECTION
                                    ? arabicStyles.menuItemStyles
                                    : styles.menuItemStyles
                                }
                                // key={data.TriggerName}
                                // value={data.TriggerName}
                                key={data.TriggerId} //Added on 16/01/2024 for bug_id:142527
                                value={data.TriggerId} //Added on 16/01/2024 for bug_id:142527
                              >
                                {data.TriggerName}
                              </MenuItem>
                            ))}
                          </CustomizedDropdown>
                        </p>
                      ) : null}

                      {+escalateWithTriggerRadio === 1 ? (
                        <p
                          style={{
                            marginLeft:
                              direction === RTL_DIRECTION ? "unset" : "1vw",
                            marginRight:
                              direction === RTL_DIRECTION ? "1vw" : "unset",
                          }}
                        >
                          <button
                            id={`Reminder_Define_Email_Button_${index}`}
                            className={styles.button}
                            style={{
                              marginTop:
                                direction === RTL_DIRECTION && "2px !important",
                            }}
                            /* code edited on 29 June 2023 for BugId 130967 */
                            onClick={() => {
                              showEmailModal();
                            }}
                          >
                            {t("email")}
                          </button>
                        </p>
                      ) : null}

                      {props?.currentTab === "Reminder" ? (
                        <div
                          style={{
                            marginLeft:
                              direction === RTL_DIRECTION ? "1vw" : "unset",
                          }}
                          className={styles.routeToType}
                        >
                          <p>
                            {t("frequency")}{" "}
                            <span style={{ color: "rgb(181,42,42)" }}>*</span>
                          </p>
                          <p>
                            {/* code edited on 24 Nov 2022 for BugId 116206 */}
                            {/*code updated on 23 Dec 2022 for BugId 115595*/}
                            <TextInput
                              inputValue={frequencyValue.toString()}
                              classTag={
                                direction === RTL_DIRECTION
                                  ? arabicStyles.textInputField
                                  : styles.textInputField
                              }
                              onChangeEvent={(e) => frequencyValueHandler(e)}
                              idTag={`Reminder_Frequency_${index}`}
                              readOnlyCondition={isReadOnly}
                              type="number"
                              errorSeverity={checkValidation ? "error" : ""}
                              errorType={ERROR_MANDATORY}
                              onKeyPress={(event) => {
                                if (
                                  event?.key === "-" ||
                                  event?.key === "+" ||
                                  event?.key === "e"
                                ) {
                                  event.preventDefault();
                                }
                              }}
                            />
                          </p>
                        </div>
                      ) : null}
                    </div>
                  )}
                </div>
              </Grid>
            ) : null}
          </Grid>
          {noFieldOperations.includes(operationType) &&
            showDelIcon &&
            !isReadOnly && (
              <IconButton
                id={`AR_DeleteOperationBtn_${index}`}
                onClick={() => deleteOperation(index)}
                tabIndex={0}
                onKeyDown={(e) => e.key === "Enter" && deleteOperation(index)}
                className={styles.iconButton}
                disableFocusRipple
                disableTouchRipple
                disableRipple
              >
                <DeleteOutlinedIcon className={styles.noFieldDeleteIcon} />
              </IconButton>
            )}
        </Grid>
      </Grid>
      {showSetOperations && props.currentTab !== "Reminder" ? (
        <React.Fragment>
          <div
            className={
              direction === RTL_DIRECTION
                ? arabicStyles.flexEndColumn
                : styles.flexStartColumn
            }
          >
            <p className={styles.dropdownMargin}></p>
            <p className={styles.operationsLabel}>{t("variable")}</p>
            <CustomizedDropdown
              id={`AR_Field_Type_Dropdown_${index}`}
              disabled={isReadOnly}
              className={
                direction === RTL_DIRECTION
                  ? arabicStyles.fieldDropdown
                  : styles.fieldDropdown
              }
              value={field}
              onChange={(event) => handleFieldChange(event)}
              validationBoolean={checkValidation}
              validationBooleanSetterFunc={setCheckValidation}
              showAllErrorsSetterFunc={setDoesSelectedRuleHaveErrors}
              ariaLabel={"Select Variable"}
            >
              {/* added on 11/10/23 for BugId 139311 */}
              {(props.cellActivityType !== 7 && props.cellActivityType !== 5
                ? getFieldListing().filter(
                    (element) =>
                      element.VariableScope !== "S" &&
                      element.VariableScope !== "F" &&
                      ((element.VariableScope === "U" &&
                        checkForModifyRights(element)) ||
                        (element.VariableScope === "I" &&
                          checkForModifyRights(element)) ||
                        (element.VariableScope !== "U" &&
                          element.VariableScope !== "I"))
                  )
                : getFieldListing().filter(
                    (element) =>
                      element.VariableScope !== "S" &&
                      element.VariableScope !== "F"
                  )
              )?.map((element) => {
                return (
                  <MenuItem
                    className={
                      direction === RTL_DIRECTION
                        ? arabicStyles.menuItemStyles
                        : styles.menuItemStyles
                    }
                    key={element.VariableName}
                    value={element.VariableName}
                  >
                    {element.VariableName}
                  </MenuItem>
                );
              })}
            </CustomizedDropdown>
          </div>
          <div
            className={
              direction === RTL_DIRECTION ? arabicStyles.equals : styles.equals
            }
          >
            =
          </div>
          <div
            className={
              direction === RTL_DIRECTION
                ? arabicStyles.flexEndColumn
                : styles.flexStartColumn
            }
          >
            <p className={styles.dropdownMargin}></p>
            <p className={styles.operationsLabel}>{t("value")}</p>
            <CustomizedDropdown
              id={`AR_Value1_Dropdown_${index}`}
              disabled={isReadOnly}
              className={
                direction === RTL_DIRECTION
                  ? arabicStyles.valueDropdown
                  : styles.valueDropdown
              }
              value={value1}
              onChange={(event, isConst) => handleValue1Change(event, isConst)}
              validationBoolean={checkValidation}
              validationBooleanSetterFunc={setCheckValidation}
              showAllErrorsSetterFunc={setDoesSelectedRuleHaveErrors}
              isConstant={isField1Const}
              setIsConstant={(val) => setIsField1Const(val)}
              showConstValue={!isDBFlagSelected}
              constType={findVariableType(
                localRuleData.ruleOpList[index].param1
              )}
              isFloat={
                findVariableType(localRuleData.ruleOpList[index].param1) ===
                FLOAT_VARIABLE_TYPE
              }
              reference={value1Ref}
              // code added on 1 March 2023 for BugId 121556
              validateConstField={(e) => {
                if (e.target.value !== "" && e.target.value?.length > 255) {
                  dispatch(
                    setToastDataFunc({
                      message:
                        "Value length can't be more than 255 characters.",
                      severity: "error",
                      open: true,
                    })
                  );
                  return false;
                }
                return true;
              }}
              ariaLabel={"Select value"}
            >
              {value1DropdownOptions?.map((element) => {
                return !isDBFlagSelected ? (
                  <MenuItem
                    className={
                      direction === RTL_DIRECTION
                        ? arabicStyles.menuItemStyles
                        : styles.menuItemStyles
                    }
                    key={element.VariableName}
                    value={element.VariableName}
                  >
                    {element.VariableName}
                  </MenuItem>
                ) : (
                  <MenuItem
                    className={
                      direction === RTL_DIRECTION
                        ? arabicStyles.menuItemStyles
                        : styles.menuItemStyles
                    }
                    key={element.value}
                    value={element.value}
                  >
                    {element.label}
                  </MenuItem>
                );
              })}
            </CustomizedDropdown>
          </div>
          {!isDBFlagSelected ? (
            <div
              className={
                direction === RTL_DIRECTION
                  ? arabicStyles.flexRow
                  : styles.flexRow
              }
            >
              <div
                className={
                  direction === RTL_DIRECTION
                    ? arabicStyles.flexEndColumn
                    : styles.flexStartColumn
                }
              >
                <p className={styles.dropdownMargin}></p>
                <p className={styles.operationsLabel}>{t("operator")}</p>
                <CustomizedDropdown
                  id={`AR_Operator_Type_Dropdown_${index}`}
                  disabled={isReadOnly}
                  className={
                    direction === RTL_DIRECTION
                      ? arabicStyles.operatorDropdown
                      : styles.operatorDropdown
                  }
                  value={operator}
                  onChange={(event) => handleOperatorChange(event)}
                  validationBoolean={checkValidation}
                  validationBooleanSetterFunc={setCheckValidation}
                  showAllErrorsSetterFunc={setDoesSelectedRuleHaveErrors}
                  isNotMandatory={operator === "0"}
                  ariaLabel={"Select Operator Type"}
                  unselectOptionValue={"0"}
                  showUnselectOption={true}
                >
                  {operatorList &&
                    operatorList.map((element) => {
                      return (
                        <MenuItem
                          className={
                            direction === RTL_DIRECTION
                              ? arabicStyles.menuItemStyles
                              : styles.menuItemStyles
                          }
                          key={element.value}
                          value={element.value}
                        >
                          {element.label}
                        </MenuItem>
                      );
                    })}
                </CustomizedDropdown>
              </div>

              <div
                className={
                  direction === RTL_DIRECTION
                    ? arabicStyles.flexEndColumn
                    : styles.flexStartColumn
                }
              >
                <p className={styles.dropdownMargin}></p>
                <p className={styles.operationsLabel}>{t("value")}</p>
                <CustomizedDropdown
                  id={`AR_Value2_Dropdown_${index}`}
                  disabled={isReadOnly || operator === "0"}
                  className={
                    direction === RTL_DIRECTION
                      ? arabicStyles.valueDropdown
                      : styles.valueDropdown
                  }
                  value={value2}
                  onChange={(event, isConst) =>
                    handleValue2Change(event, isConst)
                  }
                  validationBoolean={checkValidation}
                  validationBooleanSetterFunc={setCheckValidation}
                  showAllErrorsSetterFunc={setDoesSelectedRuleHaveErrors}
                  isConstant={isField2Const}
                  setIsConstant={(val) => setIsField2Const(val)}
                  showConstValue={true}
                  constType={findVariableType(
                    localRuleData.ruleOpList[index].param3
                  )}
                  isNotMandatory={operator === "0"}
                  // code added on 1 March 2023 for BugId 121556
                  validateConstField={(e) => {
                    if (e.target.value !== "" && e.target.value?.length > 255) {
                      dispatch(
                        setToastDataFunc({
                          message:
                            "Value length can't be more than 255 characters.",
                          severity: "error",
                          open: true,
                        })
                      );
                      return false;
                    }
                    return true;
                  }}
                  ariaLabel={"Select another Value"}
                >
                  {value2DropdownOptions &&
                    value2DropdownOptions.map((element) => {
                      return (
                        <MenuItem
                          className={
                            direction === RTL_DIRECTION
                              ? arabicStyles.menuItemStyles
                              : styles.menuItemStyles
                          }
                          key={element.VariableName}
                          value={element.VariableName}
                        >
                          {element.VariableName}
                        </MenuItem>
                      );
                    })}
                </CustomizedDropdown>
              </div>
              {(+getVarDetails(field)?.VariableType === DATE_VARIABLE_TYPE ||
                +getVarDetails(field)?.VariableType ===
                  SHORT_DATE_VARIABLE_TYPE) && (
                <div
                  className={
                    direction === RTL_DIRECTION
                      ? arabicStyles.flexEndColumn
                      : styles.flexStartColumn
                  }
                >
                  <p className={styles.dropdownMargin}></p>
                  <p className={styles.operationsLabel}>{t("calenderType")}</p>
                  <CustomizedDropdown
                    id={`AR_Calendar_Type_Dropdown_${index}`}
                    disabled={isReadOnly}
                    className={
                      direction === RTL_DIRECTION
                        ? arabicStyles.calendarTypeDropdown
                        : styles.calendarTypeDropdown
                    }
                    value={calendarType}
                    onChange={(event) => handleCalendarType(event)}
                    validationBoolean={checkValidation}
                    validationBooleanSetterFunc={setCheckValidation}
                    showAllErrorsSetterFunc={setDoesSelectedRuleHaveErrors}
                    isNotMandatory={
                      +findVariableType(field) !== DATE_VARIABLE_TYPE &&
                      +findVariableType(field) !== SHORT_DATE_VARIABLE_TYPE
                    }
                    hideDefaultSelect={true}
                  >
                    {calendarTypeOptions &&
                      calendarTypeOptions.map((element) => {
                        return (
                          <MenuItem
                            className={
                              direction === RTL_DIRECTION
                                ? arabicStyles.menuItemStyles
                                : styles.menuItemStyles
                            }
                            key={element.value}
                            value={element.value}
                          >
                            {element.label}
                          </MenuItem>
                        );
                      })}
                  </CustomizedDropdown>
                </div>
              )}
            </div>
          ) : null}
          {showDelIcon && !isReadOnly && (
            <IconButton
              id={`AR_DeleteSetOpBtn_${index}`}
              onClick={() => deleteOperation(index)}
              tabIndex={0}
              onKeyDown={(e) => e.key === "Enter" && deleteOperation(index)}
              className={styles.iconButton}
              disableFocusRipple
              disableTouchRipple
              disableRipple
            >
              <DeleteOutlinedIcon className={styles.deleteIcon} />
            </IconButton>
          )}
        </React.Fragment>
      ) : null}
      {showTrigger ? (
        <React.Fragment>
          <div
            className={
              direction === RTL_DIRECTION
                ? arabicStyles.flexEndColumn
                : styles.flexStartColumn
            }
          >
            <p className={styles.dropdownMargin}></p>
            <p className={styles.operationsLabel}>{t("trigger")}</p>
            <CustomizedDropdown
              id={`AR_Trigger_List_Dropdown_${index}`}
              disabled={isReadOnly}
              className={
                direction === RTL_DIRECTION
                  ? arabicStyles.triggerDropdown
                  : styles.triggerDropdown
              }
              value={triggerValue}
              onChange={(event) => onSelectTrigger(event)}
              validationBoolean={checkValidation}
              validationBooleanSetterFunc={setCheckValidation}
              showAllErrorsSetterFunc={setDoesSelectedRuleHaveErrors}
            >
              {triggerListData &&
                triggerListData.map((element) => {
                  return (
                    <MenuItem
                      className={
                        direction === RTL_DIRECTION
                          ? arabicStyles.menuItemStyles
                          : styles.menuItemStyles
                      }
                      key={element}
                      value={element}
                    >
                      {element}
                    </MenuItem>
                  );
                })}
            </CustomizedDropdown>
          </div>
          <div style={{ marginTop: "1.75rem" }}>
            {!isReadOnly ? (
              <button
                id={`AR_Define_Trigger_Button_${index}`}
                /* code edited on 29 June 2023 for BugId 130967 */
                onClick={() => {
                  setOpenTriggerModal(true);
                }}
                className={styles.button}
              >
                {t("define")}
              </button>
            ) : null}
          </div>
          {showDelIcon && !isReadOnly && (
            <IconButton
              id={`AR_DeleteTriggerBtn_${index}`}
              onClick={() => deleteOperation(index)}
              tabIndex={0}
              onKeyDown={(e) => e.key === "Enter" && deleteOperation(index)}
              className={styles.iconButton}
              disableRipple
              disableFocusRipple
              disableTouchRipple
            >
              <DeleteOutlinedIcon className={styles.deleteIcon} />
            </IconButton>
          )}
        </React.Fragment>
      ) : null}
      {showSetAndExecute || showCallOp ? (
        <div
          className={
            direction === RTL_DIRECTION ? arabicStyles.flexRow : styles.flexRow
          }
        >
          <div
            className={
              direction === RTL_DIRECTION
                ? arabicStyles.flexEndColumn
                : styles.flexStartColumn
            }
          >
            <p className={styles.dropdownMargin}></p>
            {!showCallOp ? (
              <p className={styles.operationsLabel}>{t("operand")}</p>
            ) : null}
            {!showCallOp ? (
              <CustomizedDropdown
                id={`AR_Operand_Type_Dropdown_${index}`}
                disabled={isReadOnly}
                className={
                  direction === RTL_DIRECTION
                    ? arabicStyles.operandDropdown
                    : styles.operandDropdown
                }
                value={operandSelected}
                onChange={(event) => handleOperandSelected(event)}
                validationBoolean={checkValidation}
                validationBooleanSetterFunc={setCheckValidation}
                showAllErrorsSetterFunc={setDoesSelectedRuleHaveErrors}
              >
                {getFieldListing()?.map((element) => {
                  return (
                    <MenuItem
                      className={
                        direction === RTL_DIRECTION
                          ? arabicStyles.menuItemStyles
                          : styles.menuItemStyles
                      }
                      key={element.VariableName}
                      value={element.VariableName}
                    >
                      {element.VariableName}
                    </MenuItem>
                  );
                })}
              </CustomizedDropdown>
            ) : null}
          </div>
          {!showCallOp ? (
            <div
              className={
                direction === RTL_DIRECTION
                  ? arabicStyles.setAndExecuteEquals
                  : styles.setAndExecuteEquals
              }
            >
              =
            </div>
          ) : null}
          <div
            className={
              direction === RTL_DIRECTION
                ? arabicStyles.flexEndColumn
                : styles.flexStartColumn
            }
          >
            <p className={styles.dropdownMargin}></p>
            <p className={styles.operationsLabel}>{t("applicationName")}</p>
            <CustomizedDropdown
              id={`AR_Application_Name_Dropdown_${index}`}
              disabled={isReadOnly}
              className={
                direction === RTL_DIRECTION
                  ? arabicStyles.valueDropdown
                  : styles.valueDropdown
              }
              value={applicationName}
              onChange={(event) => handleApplicationName(event)}
              validationBoolean={checkValidation}
              validationBooleanSetterFunc={setCheckValidation}
              showAllErrorsSetterFunc={setDoesSelectedRuleHaveErrors}
            >
              {applicationNameOptions?.map((element) => {
                return (
                  <MenuItem
                    className={
                      direction === RTL_DIRECTION
                        ? arabicStyles.menuItemStyles
                        : styles.menuItemStyles
                    }
                    key={element}
                    value={element}
                  >
                    {element}
                  </MenuItem>
                );
              })}
            </CustomizedDropdown>
          </div>
          <div
            className={
              direction === RTL_DIRECTION
                ? arabicStyles.flexEndColumn
                : styles.flexStartColumn
            }
          >
            <p className={styles.dropdownMargin}></p>
            <p className={styles.operationsLabel}>{t("functionName")}</p>
            <CustomizedDropdown
              id={`AR_Field_Type_Dropdown_${index}`}
              disabled={isReadOnly}
              className={
                direction === RTL_DIRECTION
                  ? arabicStyles.valueDropdown
                  : styles.valueDropdown
              }
              value={functionSelected}
              onChange={(event) => handleSelectedFunction(event)}
              validationBoolean={checkValidation}
              validationBooleanSetterFunc={setCheckValidation}
              showAllErrorsSetterFunc={setDoesSelectedRuleHaveErrors}
            >
              {functionOptions?.map((element) => {
                return (
                  <MenuItem
                    className={
                      direction === RTL_DIRECTION
                        ? arabicStyles.menuItemStyles
                        : styles.menuItemStyles
                    }
                    key={element.methodIndex}
                    value={element.methodIndex}
                  >
                    {element.label}
                  </MenuItem>
                );
              })}
            </CustomizedDropdown>
          </div>
          <div className={styles.dropdownMargin}>
            {
              //Modified  on 16/08/2023, bug_id:130970
              functionSelected !== "" && functionParam?.length > 0 ? (
                <button
                  disabled={functionSelected === ""}
                  id={`AR_Map_Fields_Button_${index}`}
                  onClick={openModal}
                  className={
                    styles.buttonMap
                  } /*Changes made to solve Bug 132672*/
                >
                  {t("map")}
                </button>
              ) : null
            }
            {/*modified on 08/09/2023 for Bug 136553 - regression>>entry settings>>screen is getting 
            unresponsive while changing operations */}
            {isModalOpen && (
              <Modal
                show={isModalOpen}
                modalClosed={handleClose}
                style={{
                  // width: "47%",
                  minWidth: "40rem",
                  // height:"66%" code modified on 27-09-2023 for bugId:138218
                  height: " 68%",
                  // left: "27%",
                  //top:"20%" code modified on 27-09-2023 for bugId:138218
                  top: "18%",
                  padding: "0px",
                  left: "calc(50%-20rem) !important",
                }}
              >
                <ParameterMappingModal
                  index={index}
                  isRuleBeingCreated={isRuleBeingCreated}
                  dropdownOptions={dropdownOptions}
                  functionSelected={functionSelected}
                  functionMethodIndex={selectedFunctionMethodIndex} // not required
                  functionOptions={functionOptions}
                  parameterMapping={
                    localRuleData.ruleOpList &&
                    localRuleData.ruleOpList[index].paramMappingList
                  }
                  setLocalRuleData={setLocalRuleData}
                  handleClose={handleClose}
                  setIsRuleBeingModified={setIsRuleBeingModified}
                />
              </Modal>
            )}
          </div>
          {showDelIcon && !isReadOnly && (
            <IconButton
              id={`AR_DeleteSAEOrCallOPBtn_${index}`}
              onClick={() => deleteOperation(index)}
              tabIndex={0}
              onKeyDown={(e) => e.key === "Enter" && deleteOperation(index)}
              className={styles.iconButton}
              disableTouchRipple
              disableFocusRipple
              disableRipple
            >
              <DeleteOutlinedIcon className={styles.deleteIcon} />
            </IconButton>
          )}
        </div>
      ) : null}
      {showAssignedTo ? (
        <div
          className={
            direction === RTL_DIRECTION ? arabicStyles.flexRow : styles.flexRow
          }
        >
          <div
            className={
              direction === RTL_DIRECTION
                ? arabicStyles.flexEndColumn
                : styles.flexStartColumn
            }
          >
            <p className={styles.dropdownMargin}></p>
            <p className={styles.operationsLabel}>{t("variableName")}</p>
            <CustomizedDropdown
              id={`AR_Assigned_To_Dropdown_${index}`}
              disabled={isReadOnly}
              className={
                direction === RTL_DIRECTION
                  ? arabicStyles.assignedToVariableDropdown
                  : styles.assignedToVariableDropdown
              }
              value={assignedToValue}
              onChange={(event, isConst) =>
                handleAssignedToVariable(event, isConst)
              }
              validationBoolean={checkValidation}
              validationBooleanSetterFunc={setCheckValidation}
              showAllErrorsSetterFunc={setDoesSelectedRuleHaveErrors}
              isConstant={isAssignedToConst}
              setIsConstant={(val) => setIsAssignedToConst(val)}
              showConstValue={true}
              // code added on 1 March 2023 for BugId 121556
              validateConstField={(e) => {
                if (e.target.value !== "" && e.target.value?.length > 255) {
                  dispatch(
                    setToastDataFunc({
                      message:
                        "Value length can't be more than 255 characters.",
                      severity: "error",
                      open: true,
                    })
                  );
                  return false;
                }
                return true;
              }}
            >
              {dropdownOptions
                ?.filter(
                  (element) =>
                    +element.VariableType === 10 ||
                    element.VariableScope === "F"
                )
                .map((element) => {
                  return (
                    <MenuItem
                      className={
                        direction === RTL_DIRECTION
                          ? arabicStyles.menuItemStyles
                          : styles.menuItemStyles
                      }
                      key={element.VariableName}
                      value={element.VariableName}
                    >
                      {element.VariableName}
                    </MenuItem>
                  );
                })}
            </CustomizedDropdown>
          </div>
          {showDelIcon && !isReadOnly && (
            <IconButton
              id={`AR_DeleteAssignedToOPBtn_${index}`}
              onClick={() => deleteOperation(index)}
              tabIndex={0}
              onKeyDown={(e) => e.key === "Enter" && deleteOperation(index)}
              className={styles.iconButton}
              disableFocusRipple
              disableTouchRipple
              disableRipple
            >
              <DeleteOutlinedIcon className={styles.deleteIcon} />
            </IconButton>
          )}
        </div>
      ) : null}
      {showRouteTo ? (
        <div
          className={
            direction === RTL_DIRECTION ? arabicStyles.flexRow : styles.flexRow
          }
        >
          <div
            className={clsx(
              direction === RTL_DIRECTION
                ? arabicStyles.flexRow
                : styles.flexRow,
              styles.dropdownMargin
            )}
            style={{ marginTop: "18px", alignItems: "center" }}
          >
            <p className={styles.dropdownMargin}></p>
            <Radio
              disabled={isReadOnly}
              id={`AO_Worksteps_Option_${index}`}
              checked={+routeToType === 1}
              onChange={routeToRadioHandler}
              size="small"
              className={styles.radioOption}
              value={1}
            />
            <p style={{ marginTop: "20px" }} className={styles.routeToType}>
              {t("workstep(s)")}
            </p>
            <Radio
              disabled={isReadOnly}
              id={`AO_Variables_Option_${index}`}
              checked={+routeToType === 2}
              onChange={routeToRadioHandler}
              size="small"
              className={styles.radioOption}
              value={2}
            />
            <p style={{ marginTop: "20px" }} className={styles.routeToType}>
              {t("variable(s)")}
            </p>
            <CustomizedDropdown
              id={`AO_Route_To_Dropdown_${index}`}
              disabled={isReadOnly}
              className={styles.inputVariableDropdown}
              value={selectedRouteToValue}
              onChange={(event) => routeToHandler(event)}
              validationBoolean={checkValidation}
              validationBooleanSetterFunc={setCheckValidation}
              showAllErrorsSetterFunc={setDoesSelectedRuleHaveErrors}
              style={{ marginTop: "3px" }}
            >
              {+routeToType === 1
                ? workstepList?.map((element) => {
                    return (
                      <MenuItem
                        className={
                          direction === RTL_DIRECTION
                            ? arabicStyles.menuItemStyles
                            : styles.menuItemStyles
                        }
                        key={element}
                        value={element}
                      >
                        {element}
                      </MenuItem>
                    );
                  })
                : +routeToType === 2
                ? getFieldListing()
                    ?.filter(
                      (element) =>
                        +element.VariableType === STRING_VARIABLE_TYPE
                    )
                    .map((element) => {
                      return (
                        <MenuItem
                          className={
                            direction === RTL_DIRECTION
                              ? arabicStyles.menuItemStyles
                              : styles.menuItemStyles
                          }
                          key={element.VariableName}
                          value={element.VariableName}
                        >
                          {element.VariableName}
                        </MenuItem>
                      );
                    })
                : null}
            </CustomizedDropdown>
          </div>
          {showDelIcon && !isReadOnly && (
            <IconButton
              id={`AR_DeleteRouteToOPBtn_${index}`}
              onClick={() => deleteOperation(index)}
              tabIndex={0}
              onKeyDown={(e) => e.key === "Enter" && deleteOperation(index)}
              className={styles.iconButton}
              disableFocusRipple
              disableTouchRipple
              disableRipple
            >
              <DeleteOutlinedIcon className={styles.deleteIcon} />
            </IconButton>
          )}
        </div>
      ) : null}
      {showEscalateToOperations || props.currentTab === "Reminder" ? (
        <div className={styles.flexColumnMargin} style={{ width: "100%" }}>
          <Grid
            className={
              direction === RTL_DIRECTION
                ? arabicStyles.flexRow
                : styles.flexRow
            }
            style={{ alignItems: "center" }}
          >
            <Grid
              container
              xs={10}
              justifyContent="space-between"
              className={styles.flexColumn}
            >
              {
                //Modified on 04/10/2023, bug_id:130969
                /* <Grid item xs={1}>
                  <p className={styles.afterEscalationText}>{t("after")}</p>
                </Grid> */
              }
              {/* Added it Bug:137846 - as per UX's new screen */}
              <Grid item xs={1}>
                <p
                  className={styles.afterEscalationText}
                  style={{ marginInlineStart: "unset", marginTop: "1rem" }}
                >
                  {t("after")}
                </p>
              </Grid>
              <Grid
                item
                container
                xs={12}
                justifyContent="space-between"
                style={{ backgroundColor: "#f8f8f8", padding: "10px" }}
              >
                <Grid item container xs={12}>
                  <Grid item xs={4}>
                    <div
                      className={
                        direction === RTL_DIRECTION
                          ? arabicStyles.flexEndColumn
                          : styles.flexStartColumn
                      }
                    >
                      <p className={styles.operationsLabel}>{t("Date")}</p>
                      {/*code updated on 26 September 2022 for BugId 115913*/}
                      <CustomizedDropdown
                        id={`AO_Escalate_To_Date_Dropdown_${index}`}
                        disabled={isReadOnly}
                        className={
                          direction === RTL_DIRECTION
                            ? arabicStyles.escalateToFieldsDropdown +
                              " " +
                              styles.newWidth
                            : styles.escalateToFieldsDropdown +
                              " " +
                              styles.newWidth
                        }
                        value={dateValue}
                        onChange={(event, isConst) =>
                          dateValueHandler(event, isConst)
                        }
                        validationBoolean={checkValidation}
                        validationBooleanSetterFunc={setCheckValidation}
                        showAllErrorsSetterFunc={setDoesSelectedRuleHaveErrors}
                        isConstant={isDateConst}
                        setIsConstant={(val) => setIsDateConst(val)}
                        showConstValue={true}
                        constType={"8"}
                        relativeStyle={{ width: "100%" }}
                      >
                        {variableData
                          ?.filter(
                            (element) =>
                              (element.VariableScope === "S" ||
                                element.VariableScope === "U") &&
                              +element.VariableType === DATE_VARIABLE_TYPE
                          )
                          ?.map((element) => {
                            return (
                              <MenuItem
                                className={
                                  direction === RTL_DIRECTION
                                    ? arabicStyles.menuItemStyles
                                    : styles.menuItemStyles
                                }
                                key={element.VariableName}
                                value={element.VariableName}
                              >
                                {element.VariableName}
                              </MenuItem>
                            );
                          })}
                      </CustomizedDropdown>
                    </div>
                  </Grid>
                  <Grid item xs={4}>
                    <div
                      className={
                        direction === RTL_DIRECTION
                          ? arabicStyles.flexEndColumn
                          : styles.flexStartColumn
                      }
                    >
                      <p className={styles.operationsLabel}>{t("days")}</p>
                      <CustomizedDropdown
                        id={`AO_Escalate_To_Days_Dropdown_${index}`}
                        disabled={isReadOnly}
                        className={
                          direction === RTL_DIRECTION
                            ? arabicStyles.escalateToFieldsDropdown +
                              " " +
                              styles.newWidth
                            : styles.escalateToFieldsDropdown +
                              " " +
                              styles.newWidth
                        }
                        value={daysValue}
                        onChange={(event, isConst) =>
                          daysValueHandler(event, isConst)
                        }
                        validationBoolean={checkValidation}
                        validationBooleanSetterFunc={setCheckValidation}
                        showAllErrorsSetterFunc={setDoesSelectedRuleHaveErrors}
                        isConstant={isDaysConst}
                        setIsConstant={(val) => setIsDaysConst(val)}
                        showConstValue={true}
                        constType={"3"}
                        relativeStyle={{ width: "100%" }}
                      >
                        {dropdownOptions
                          ?.filter(
                            (d) =>
                              (d.VariableScope === "F" ||
                                d.VariableScope === "U" ||
                                d.VariableScope !== "S") &&
                              +d.VariableType === 3 &&
                              d.VariableId !== "10001" &&
                              d.VariableId !== "42" &&
                              d.VariableId !== "10022"
                          )
                          ?.map((element) => {
                            return (
                              <MenuItem
                                className={
                                  direction === RTL_DIRECTION
                                    ? arabicStyles.menuItemStyles
                                    : styles.menuItemStyles
                                }
                                key={element.VariableName}
                                value={element.VariableName}
                              >
                                {element.VariableName}
                              </MenuItem>
                            );
                          })}
                      </CustomizedDropdown>
                    </div>
                  </Grid>
                  <Grid item xs={4}>
                    <div
                      className={
                        direction === RTL_DIRECTION
                          ? arabicStyles.flexEndColumn
                          : styles.flexStartColumn
                      }
                    >
                      <p className={styles.operationsLabel}>{t("hours")}</p>
                      <CustomizedDropdown
                        id={`AO_Escalate_To_Hours_Dropdown_${index}`}
                        disabled={isReadOnly}
                        className={
                          direction === RTL_DIRECTION
                            ? arabicStyles.escalateToFieldsDropdown +
                              " " +
                              styles.newWidth
                            : styles.escalateToFieldsDropdown +
                              " " +
                              styles.newWidth
                        }
                        value={hoursValue}
                        onChange={(event, isConst) =>
                          hoursValueHandler(event, isConst)
                        }
                        validationBoolean={checkValidation}
                        validationBooleanSetterFunc={setCheckValidation}
                        showAllErrorsSetterFunc={setDoesSelectedRuleHaveErrors}
                        isConstant={isHourConst}
                        setIsConstant={(val) => setIsHourConst(val)}
                        showConstValue={true}
                        constType={"3"}
                        relativeStyle={{ width: "100%" }}
                      >
                        {dropdownOptions
                          ?.filter(
                            (d) =>
                              (d.VariableScope === "F" ||
                                d.VariableScope === "U" ||
                                d.VariableScope !== "S") &&
                              +d.VariableType === 3 &&
                              d.VariableId !== "10001" &&
                              d.VariableId !== "42" &&
                              d.VariableId !== "10022"
                          )
                          ?.map((element) => {
                            return (
                              <MenuItem
                                className={
                                  direction === RTL_DIRECTION
                                    ? arabicStyles.menuItemStyles
                                    : styles.menuItemStyles
                                }
                                key={element.VariableName}
                                value={element.VariableName}
                              >
                                {element.VariableName}
                              </MenuItem>
                            );
                          })}
                      </CustomizedDropdown>
                    </div>
                  </Grid>
                </Grid>
                <Grid item container xs={12} style={{ marginTop: "10px" }}>
                  <Grid item xs={4}>
                    <div
                      className={
                        direction === RTL_DIRECTION
                          ? arabicStyles.flexEndColumn
                          : styles.flexStartColumn
                      }
                    >
                      <p className={styles.operationsLabel}>{t("minutes")}</p>
                      <CustomizedDropdown
                        id={`AO_Escalate_To_Minutes_Dropdown_${index}`}
                        disabled={isReadOnly}
                        className={
                          direction === RTL_DIRECTION
                            ? arabicStyles.escalateToFieldsDropdown +
                              " " +
                              styles.newWidth
                            : styles.escalateToFieldsDropdown +
                              " " +
                              styles.newWidth
                        }
                        value={minutesValue}
                        onChange={(event, isConst) =>
                          minutesValueHandler(event, isConst)
                        }
                        validationBoolean={checkValidation}
                        validationBooleanSetterFunc={setCheckValidation}
                        showAllErrorsSetterFunc={setDoesSelectedRuleHaveErrors}
                        isConstant={isMinConst}
                        setIsConstant={(val) => setIsMinConst(val)}
                        showConstValue={true}
                        constType={"3"}
                        relativeStyle={{ width: "100%" }}
                      >
                        {dropdownOptions
                          ?.filter(
                            (d) =>
                              (d.VariableScope === "F" ||
                                d.VariableScope === "U" ||
                                d.VariableScope !== "S") &&
                              +d.VariableType === 3 &&
                              d.VariableId !== "10001" &&
                              d.VariableId !== "42" &&
                              d.VariableId !== "10022"
                          )
                          ?.map((element) => {
                            return (
                              <MenuItem
                                className={
                                  direction === RTL_DIRECTION
                                    ? arabicStyles.menuItemStyles
                                    : styles.menuItemStyles
                                }
                                key={element.VariableName}
                                value={element.VariableName}
                              >
                                {element.VariableName}
                              </MenuItem>
                            );
                          })}
                      </CustomizedDropdown>
                    </div>
                  </Grid>
                  <Grid item xs={4}>
                    <div
                      className={
                        direction === RTL_DIRECTION
                          ? arabicStyles.flexEndColumn
                          : styles.flexStartColumn
                      }
                    >
                      <p className={styles.operationsLabel}>{t("seconds")}</p>
                      <CustomizedDropdown
                        id={`AO_Escalate_To_Secs_Dropdown_${index}`}
                        disabled={isReadOnly}
                        className={
                          direction === RTL_DIRECTION
                            ? arabicStyles.escalateToFieldsDropdown +
                              " " +
                              styles.newWidth
                            : styles.escalateToFieldsDropdown +
                              " " +
                              styles.newWidth
                        }
                        value={secondsValue}
                        onChange={(event, isConst) =>
                          secondsValueHandler(event, isConst)
                        }
                        validationBoolean={checkValidation}
                        validationBooleanSetterFunc={setCheckValidation}
                        showAllErrorsSetterFunc={setDoesSelectedRuleHaveErrors}
                        isConstant={isSecConst}
                        setIsConstant={(val) => setIsSecConst(val)}
                        showConstValue={true}
                        constType={"3"}
                        relativeStyle={{ width: "100%" }}
                      >
                        {dropdownOptions
                          ?.filter(
                            (d) =>
                              (d.VariableScope === "F" ||
                                d.VariableScope === "U" ||
                                d.VariableScope !== "S") &&
                              +d.VariableType === 3 &&
                              d.VariableId !== "10001" &&
                              d.VariableId !== "42" &&
                              d.VariableId !== "10022"
                          )
                          ?.map((element) => {
                            return (
                              <MenuItem
                                className={
                                  direction === RTL_DIRECTION
                                    ? arabicStyles.menuItemStyles
                                    : styles.menuItemStyles
                                }
                                key={element.VariableName}
                                value={element.VariableName}
                              >
                                {element.VariableName}
                              </MenuItem>
                            );
                          })}
                      </CustomizedDropdown>
                    </div>
                  </Grid>
                  <Grid item xs={4}>
                    <div
                      className={
                        direction === RTL_DIRECTION
                          ? arabicStyles.flexEndColumn
                          : styles.flexStartColumn
                      }
                    >
                      <p className={styles.operationsLabel}>
                        {t("calendarTypes")}
                      </p>
                      <CustomizedDropdown
                        id={`AO_Calendar_Type_Dropdown_${index}`}
                        disabled={isReadOnly}
                        style={{ margin: "0" }}
                        className={
                          direction === RTL_DIRECTION
                            ? arabicStyles.escalateToFieldsDropdown +
                              " " +
                              styles.newWidth
                            : styles.escalateToFieldsDropdown +
                              " " +
                              styles.newWidth
                        }
                        value={calendarType}
                        onChange={(event) => handleCalendarType(event)}
                        validationBoolean={checkValidation}
                        validationBooleanSetterFunc={setCheckValidation}
                        showAllErrorsSetterFunc={setDoesSelectedRuleHaveErrors}
                        relativeStyle={{ width: "100%" }}
                      >
                        {calendarTypeOptions &&
                          calendarTypeOptions.map((element) => {
                            return (
                              <MenuItem
                                className={
                                  direction === RTL_DIRECTION
                                    ? arabicStyles.menuItemStyles
                                    : styles.menuItemStyles
                                }
                                key={element.value}
                                value={element.value}
                              >
                                {element.label}
                              </MenuItem>
                            );
                          })}
                      </CustomizedDropdown>
                    </div>
                  </Grid>
                </Grid>
              </Grid>
            </Grid>
          </Grid>
          <Grid
            className={
              direction === RTL_DIRECTION
                ? arabicStyles.flexRow
                : styles.flexRow
            }
            style={{ alignItems: "center" }}
          >
            <Checkbox
              inputProps={{ "aria-label": "Repeat After" }}
              disabled={repeatAfterStatus}
              id={`AO_Repeat_after_checkbox_${index}`}
              className={
                direction === RTL_DIRECTION
                  ? arabicStyles.repeatAfterCheckbox
                  : styles.repeatAfterCheckbox
              }
              checked={repeatAfterValue}
              onChange={(e) => {
                // modified on 20/09/23 for BugId 137019
                // setRepeatAfterValue(!repeatAfterValue);
                setRepeatAfterValue(e.target.checked);
                setRepeatAfterMinutesValue("");
                if (isRuleBeingCreated === false) {
                  setIsRuleBeingModified(true);
                }
                setLocalRuleData((prevData) => {
                  let temp = JSON.parse(JSON.stringify(prevData));
                  temp.ruleOpList[index].minute = "";
                  temp.ruleOpList[index].m_strRepeatAfter = "";
                  // modified on 20/09/23 for BugId 137019
                  // temp.ruleOpList[index].repeat = false;
                  temp.ruleOpList[index].repeat = e.target.checked;
                  return temp;
                });
              }}
              size="small"
            />
            <p className={styles.operationsLabelMid}>{t("repeatAfter")}</p>
            {/*code updated on 23 Dec 2022 for BugId 115596*/}
            <InputBase
              id={`AO_RepeatAfterMinutes_${index}`}
              variant="outlined"
              className={
                direction === RTL_DIRECTION
                  ? arabicStyles.textInputField
                  : styles.textInputField
              }
              value={repeatAfterMinutesValue}
              disabled={isReadOnly || !repeatAfterValue}
              type="number"
              onChange={(event) => repeatAfterMinutesValueHandler(event)}
              onKeyPress={(event) => {
                if (
                  event?.key === "-" ||
                  event?.key === "+" ||
                  event?.key === "e"
                ) {
                  event.preventDefault();
                }
              }}
              inputProps={{ min: 0, "aria-label": "Repeat After Minutes" }}
            />
            <p className={styles.operationsLabelMid}>{t("minutes")}</p>
            {showDelIcon && !isReadOnly && (
              <IconButton
                id={`AR_DeleteEscalateToOPBtn_${index}`}
                onClick={() => deleteOperation(index)}
                tabIndex={0}
                onKeyDown={(e) => e.key === "Enter" && deleteOperation(index)}
                className={styles.iconButton}
                disableFocusRipple
                disableTouchRipple
                disableRipple
              >
                <DeleteOutlinedIcon
                  className={styles.deleteIcon}
                  style={{ marginTop: "0px", marginInline: "6px" }}
                />
              </IconButton>
            )}
          </Grid>
        </div>
      ) : null}
      {showAuditOp ? (
        <div
          className={
            direction === RTL_DIRECTION ? arabicStyles.flexRow : styles.flexRow
          }
        >
          <div
            className={
              direction === RTL_DIRECTION
                ? arabicStyles.flexRow
                : styles.flexRow
            }
          >
            <div
              className={
                direction === RTL_DIRECTION
                  ? arabicStyles.flexEndColumn
                  : styles.flexStartColumn
              }
            >
              <p className={styles.dropdownMargin}></p>
              <p className={styles.operationsLabel}>{"Audit"}</p>
              <InputBase
                id={`AO_Audit_Percentage_Input_${index}`}
                variant="outlined"
                className={
                  direction === RTL_DIRECTION
                    ? arabicStyles.textInputField
                    : styles.textInputField
                }
                value={auditPercentage}
                disabled={isReadOnly}
                type="number"
                onChange={(event) => auditPercentageHandler(event)}
              />
            </div>
            <p
              className={
                direction === RTL_DIRECTION
                  ? arabicStyles.percentageIcon
                  : styles.percentageIcon
              }
            >
              %
            </p>
            <div
              className={
                direction === RTL_DIRECTION
                  ? arabicStyles.flexEndColumn
                  : styles.flexStartColumn
              }
            >
              <p className={styles.dropdownMargin}></p>
              <p
                className={clsx(
                  styles.operationsLabel,
                  styles.marginLeftOperationLabel
                )}
              >
                {"If Sampled"}
              </p>
              <CustomizedDropdown
                id={`AO_If_Sampled_Dropdown_${index}`}
                disabled={isReadOnly}
                className={
                  direction === RTL_DIRECTION
                    ? arabicStyles.inputVariableDropdown
                    : styles.inputVariableDropdown
                }
                value={ifSampledValue}
                onChange={(event) => ifSampledHandler(event)}
                validationBoolean={checkValidation}
                validationBooleanSetterFunc={setCheckValidation}
                showAllErrorsSetterFunc={setDoesSelectedRuleHaveErrors}
              >
                {workstepList &&
                  workstepList.map((element) => {
                    return (
                      <MenuItem
                        className={
                          direction === RTL_DIRECTION
                            ? arabicStyles.menuItemStyles
                            : styles.menuItemStyles
                        }
                        key={element}
                        value={element}
                      >
                        {element}
                      </MenuItem>
                    );
                  })}
              </CustomizedDropdown>
            </div>
            <div
              className={
                direction === RTL_DIRECTION
                  ? arabicStyles.flexEndColumn
                  : styles.flexStartColumn
              }
            >
              <p className={styles.dropdownMargin}></p>
              <p
                className={clsx(
                  styles.operationsLabel,
                  styles.marginLeftOperationLabel
                )}
              >
                {"Not Sampled"}
              </p>
              <CustomizedDropdown
                id={`AO_Not_Sampled_Dropdown_${index}`}
                disabled={isReadOnly}
                className={
                  direction === RTL_DIRECTION
                    ? arabicStyles.inputVariableDropdown
                    : styles.inputVariableDropdown
                }
                value={notSampledValue}
                onChange={(event) => notSampledHandler(event)}
                validationBoolean={checkValidation}
                validationBooleanSetterFunc={setCheckValidation}
                showAllErrorsSetterFunc={setDoesSelectedRuleHaveErrors}
              >
                {workstepList &&
                  workstepList.map((element) => {
                    return (
                      <MenuItem
                        className={
                          direction === RTL_DIRECTION
                            ? arabicStyles.menuItemStyles
                            : styles.menuItemStyles
                        }
                        key={element}
                        value={element}
                      >
                        {element}
                      </MenuItem>
                    );
                  })}
              </CustomizedDropdown>
            </div>
          </div>
          {showDelIcon && !isReadOnly && (
            <IconButton
              id={`AR_DeleteAuditOPBtn_${index}`}
              onClick={() => deleteOperation(index)}
              tabIndex={0}
              onKeyDown={(e) => e.key === "Enter" && deleteOperation(index)}
              className={styles.iconButton}
              disableFocusRipple
              disableTouchRipple
              disableRipple
            >
              <DeleteOutlinedIcon className={styles.deleteIcon} />
            </IconButton>
          )}
        </div>
      ) : null}
      {showDistributeOp ? (
        <div
          className={
            direction === RTL_DIRECTION ? arabicStyles.flexRow : styles.flexRow
          }
        >
          <div
            className={
              direction === RTL_DIRECTION
                ? arabicStyles.flexRow
                : styles.flexRow
            }
            style={{ marginTop: "8px" }}
          >
            <p className={styles.dropdownMargin}></p>
            <div
              className={
                direction === RTL_DIRECTION
                  ? arabicStyles.flexColumn
                  : styles.flexColumn
              }
            >
              <p className={styles.operationsLabel}>{t("workstepName")}</p>
              <CustomizedDropdown
                id={`AO_Workstep_Dropdown_${index}`}
                disabled={isReadOnly}
                className={
                  direction === RTL_DIRECTION
                    ? arabicStyles.inputVariableDropdown
                    : styles.inputVariableDropdown
                }
                value={selectedWorkstep}
                onChange={(event) => workstepHandler(event)}
                validationBoolean={checkValidation}
                validationBooleanSetterFunc={setCheckValidation}
                showAllErrorsSetterFunc={setDoesSelectedRuleHaveErrors}
              >
                {workstepList &&
                  workstepList.map((element) => {
                    return (
                      <MenuItem
                        className={
                          direction === RTL_DIRECTION
                            ? arabicStyles.menuItemStyles
                            : styles.menuItemStyles
                        }
                        key={element}
                        value={element}
                      >
                        {element}
                      </MenuItem>
                    );
                  })}
              </CustomizedDropdown>
            </div>
            <div
              className={
                direction === RTL_DIRECTION
                  ? arabicStyles.flexColumn
                  : styles.flexColumn
              }
              style={{ paddingLeft: "0.75vw" }}
            >
              <p className={styles.operationsLabel}>{`${t("setChildData")} (${t(
                "Variables"
              )})`}</p>
              <div
                className={
                  direction === RTL_DIRECTION
                    ? arabicStyles.flexRow
                    : styles.flexRow
                }
                style={{ minHeight: "auto" }}
              >
                <CustomizedDropdown
                  id={`AO_Child_Variable_Dropdown_${index}`}
                  disabled={isReadOnly}
                  className={
                    direction === RTL_DIRECTION
                      ? arabicStyles.inputVariableDropdown
                      : styles.inputVariableDropdown
                  }
                  value={selectedChildVariable}
                  onChange={(event) => childVariableHandler(event)}
                  validationBoolean={checkValidation}
                  validationBooleanSetterFunc={setCheckValidation}
                  showAllErrorsSetterFunc={setDoesSelectedRuleHaveErrors}
                  isNotMandatory={true}
                >
                  <MenuItem
                    className={
                      direction === RTL_DIRECTION
                        ? arabicStyles.menuItemStyles
                        : styles.menuItemStyles
                    }
                    style={{ minHeight: "2rem" }}
                    value={""}
                  >
                    {dropdownOptions?.filter(
                      (element) =>
                        (element.VariableScope === "I" ||
                          element.VariableScope === "U") &&
                        element.VariableType !== COMPLEX_VARTYPE
                    )?.length > 0
                      ? `-- ${t("select")} --`
                      : t("NoVariablesPresent")}
                  </MenuItem>
                  {dropdownOptions
                    ?.filter(
                      (element) =>
                        (element.VariableScope === "I" ||
                          element.VariableScope === "U") &&
                        element.VariableType !== COMPLEX_VARTYPE
                    )
                    .map((element) => {
                      return (
                        <MenuItem
                          className={
                            direction === RTL_DIRECTION
                              ? arabicStyles.menuItemStyles
                              : styles.menuItemStyles
                          }
                          key={element.VariableName}
                          value={element.VariableName}
                        >
                          {element.VariableName}
                        </MenuItem>
                      );
                    })}
                </CustomizedDropdown>
                <div
                  style={{
                    margin: "2% 2.5%",
                  }}
                >
                  =
                </div>
                <CustomizedDropdown
                  id={`AO_Child_Array_Dropdown_${index}`}
                  disabled={isReadOnly}
                  className={
                    direction === RTL_DIRECTION
                      ? arabicStyles.inputVariableDropdown
                      : styles.inputVariableDropdown
                  }
                  value={selectedChildArray}
                  onChange={(event) => childArrayHandler(event)}
                  validationBoolean={
                    selectedChildVariable === "" ? false : checkValidation
                  }
                  validationBooleanSetterFunc={setCheckValidation}
                  showAllErrorsSetterFunc={setDoesSelectedRuleHaveErrors}
                  isNotMandatory={selectedChildVariable === ""}
                >
                  <MenuItem
                    className={
                      direction === RTL_DIRECTION
                        ? arabicStyles.menuItemStyles
                        : styles.menuItemStyles
                    }
                    style={{ minHeight: "2rem" }}
                    value={""}
                  >
                    {getArrayVariables(
                      dropdownOptions?.filter(
                        (element) =>
                          (element.VariableScope === "I" ||
                            element.VariableScope === "U") &&
                          element.VariableType !== COMPLEX_VARTYPE
                      )
                    )?.length > 0
                      ? `-- ${t("select")} --`
                      : t("NoVariablesPresent")}
                  </MenuItem>

                  {getArrayVariables(
                    dropdownOptions?.filter(
                      (element) =>
                        (element.VariableScope === "I" ||
                          element.VariableScope === "U") &&
                        element.VariableType !== COMPLEX_VARTYPE
                    )
                  )?.map((element) => {
                    return (
                      <MenuItem
                        className={
                          direction === RTL_DIRECTION
                            ? arabicStyles.menuItemStyles
                            : styles.menuItemStyles
                        }
                        key={element.VariableName}
                        value={element.VariableName}
                      >
                        {element.VariableName}
                      </MenuItem>
                    );
                  })}
                </CustomizedDropdown>
              </div>
            </div>
          </div>
          {showDelIcon && !isReadOnly && (
            <IconButton
              id={`AR_DeleteDistributeToOPBtn_${index}`}
              onClick={() => deleteOperation(index)}
              tabIndex={0}
              onKeyDown={(e) => e.key === "Enter" && deleteOperation(index)}
              className={styles.iconButton}
              disableFocusRipple
              disableTouchRipple
              disableRipple
            >
              <DeleteOutlinedIcon className={styles.deleteIcon} />
            </IconButton>
          )}
        </div>
      ) : null}
      {/*code added on 13 July 2023 for BugId 130801 */}
      {showExceptionFld ? (
        <React.Fragment>
          <div
            className={
              direction === RTL_DIRECTION
                ? arabicStyles.flexEndColumn
                : styles.flexStartColumn
            }
          >
            <p className={styles.dropdownMargin}></p>
            <p className={styles.operationsLabel}>{t("exceptionName")}</p>
            <CustomizedDropdown
              id={`AR_Trigger_List_Dropdown_${index}`}
              disabled={isReadOnly}
              className={
                direction === RTL_DIRECTION
                  ? arabicStyles.triggerDropdown
                  : styles.triggerDropdown
              }
              value={expValue}
              onChange={(event) => onSelectException(event)}
              validationBoolean={checkValidation}
              validationBooleanSetterFunc={setCheckValidation}
              showAllErrorsSetterFunc={setDoesSelectedRuleHaveErrors}
            >
              {expListData?.map((element) => {
                return (
                  <MenuItem
                    className={
                      direction === RTL_DIRECTION
                        ? arabicStyles.menuItemStyles
                        : styles.menuItemStyles
                    }
                    key={element}
                    value={element}
                  >
                    {element}
                  </MenuItem>
                );
              })}
            </CustomizedDropdown>
          </div>
          {showDelIcon && !isReadOnly && (
            <IconButton
              id={`AR_DeleteExceptionFieldBtn_${index}`}
              onClick={() => deleteOperation(index)}
              tabIndex={0}
              onKeyDown={(e) => e.key === "Enter" && deleteOperation(index)}
              className={styles.iconButton}
              disableFocusRipple
              disableTouchRipple
              disableRipple
            >
              <DeleteOutlinedIcon className={styles.deleteIcon} />
            </IconButton>
          )}
        </React.Fragment>
      ) : null}
      {/* code added on 29 June 2023 for BugId 130967 - not able to open 
      Email template for escalate to with trigger option */}
      {/*modified on 08/09/2023 for Bug 136553 - regression>>entry settings>>screen is getting 
      unresponsive while changing operations */}
      {isOpenMailModal && (
        <Modal
          show={isOpenMailModal}
          // modalClosed={handleClose} Code commented for Bug 116664.
          modalClosed={handleCloseEmailModal}
          style={{
            width: "50%",
            left: "25%",
            // modified on 17-10-2023 for bug_id: 138077
            // top: "15%",
            top: "29%",
            padding: "0px",
            boxShadow: "none",
            zIndex: "1500",
          }}
        >
          <EmailPopup
            passEmailData={passEmailData}
            handleCloseEmailModal={handleCloseEmailModal}
            parentEmailData={parentEmailData}
            setIsRuleBeingModified={setIsRuleBeingModified}
          />
        </Modal>
      )}
      {openTriggerModal && (
        <Modal
          show={openTriggerModal}
          style={{
            width: "72%" /*Modified on 14/10/2023, bug_id:139488 */,
            // width: "70%",
            left: "15%",
            // top: window.innerWidth < 825 ? "18%" : "15%", // code modified on 04-10-2023 for bugId: 134016
            top: window.innerWidth < 825 ? "18%" : "10%", // code modified on 04-10-2023 for bugId: 134016
            padding: "0px",
            boxShadow: "none",
          }}
        >
          <TriggerDefinition
            isModalOpen={openTriggerModal}
            hideLeftPanel={true}
            handleCloseModal={() => setOpenTriggerModal(false)}
          />
        </Modal>
      )}
    </div>
  );
}

const mapStateToProps = (state) => {
  return {
    cellActivityType: state.selectedCellReducer.selectedActivityType,
    cellActivitySubType: state.selectedCellReducer.selectedActivitySubType,
  };
};

export default connect(mapStateToProps, null)(AddOperations);
