import React, { useState, useEffect } from "react";
import styles from "./index.module.css";
import arabicStyles from "./ArabicStyles.module.css";
import {
  dataInputs,
  getDropdownOptions,
  getVariableIdFromSysDefinedName,
} from "./TypeAndFieldMapping";
import {
  SERVER_URL,
  RTL_DIRECTION,
  Restricted_Names,
  ARABIC_LOCALE,
  ARABIC_SA_LOCALE,
  SPACE,
} from "../../../../Constants/appConstants";
import { useTranslation } from "react-i18next";
import DeleteOutlinedIcon from "@material-ui/icons/DeleteOutlined";
import EmptyStateIcon from "../../../../assets/ProcessView/EmptyState.svg";
import TypeAndFieldMapping from "../../../../UI/TypeAndFieldMapping";
import Modal from "../../../../UI/Modal/Modal";
import TableMappingModal from "./TableMappingModal";
import ClearOutlinedIcon from "@material-ui/icons/ClearOutlined";
import { store, useGlobalState } from "state-pool";
import { connect, useDispatch } from "react-redux";
import EditIcon from "@material-ui/icons/Edit";
import axios from "axios";
import { setToastDataFunc } from "../../../../redux-store/slices/ToastDataHandlerSlice";
import ObjectDependencies from "../../../../UI/ObjectDependencyModal";
import {
  isArabicLocaleSelected,
  isProcessDeployedFunc,
  isProcessReadDeployedFunc,
  restrictSpecialCharacter,
  validateSpecialCharacter,
} from "../../../../utility/CommonFunctionCall/CommonFunctionCall";
import VariableRuleModal from "./VariableRuleModal";
import { REGEX, validateRegex } from "../../../../validators/validator";
import secureLocalStorage from "react-secure-storage";
import { IconButton } from "@material-ui/core";

function Edit(props) {
  const { varData, editVarData } = props;
  let { t } = useTranslation();
  const direction = `${t("HTML_DIR")}`;

  return (
    <EditIcon
      classes={{
        root:
          direction === RTL_DIRECTION
            ? arabicStyles.infoIcon
            : styles.dataInfoIcon, // class name, e.g. `classes-nesting-root-x`
      }}
      fontSize="medium"
      onClick={() => editVarData(varData)}
    />
  );
}

function PrimaryVariables(props) {
  let { t } = useTranslation();
  const { isProcessReadOnly, setPrimaryVariableCount } = props;
  const loadedProcessData = store.getState("loadedProcessData");
  const [localLoadedProcessData, setLocalLoadedProcessData] =
    useGlobalState(loadedProcessData);
  const direction = `${t("HTML_DIR")}`;
  const dispatch = useDispatch();
  const [isDisabledDataType, setIsDisabledDataType] = useState(
    new Array(dataInputs.length).fill(false)
  );
  const [bForInputStrip, setBForInputStrip] = useState(false);
  const [aliasName, setAliasName] = useState("");
  const [variableType, setVariableType] = useState("");
  const [complexDataJSON, setcomplexDataJSON] = useState({});
  const [dataField, setDataField] = useState("");
  const [dataType, setDataType] = useState([]);
  const [userDefinedVariables, setUserDefinedVariables] = useState([]);
  const [dataTypeData, setDataTypeData] = useState([]);
  const [arrayType, setArrayType] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isComplexSelected, setIsComplexSelected] = useState(false);
  const [modifyComplexJson, setModifyComplexJson] = useState({});
  const [modifyButtonDisableId, setmodifyButtonDisableId] = useState();
  const [dataObjectTemplates, setdataObjectTemplates] = useState([]);
  const [dependencyModalBool, setdependencyModalBool] = useState(false);
  const [validationsArray, setvalidationsArray] = useState([]);
  const [isFirstRender, setisFirstRender] = useState(true);
  const [showRuleModal, setShowRuleModal] = useState(null);
  const locale = secureLocalStorage.getItem("locale");

  const callbackMethod = (data) => {
    let temp = false;
    data?.columns?.forEach((col) => {
      if (col.alias === aliasName) {
        temp = true;
      }
    });
    if (!temp) {
      handleVariableType("11", data);
    } else {
      handleVariableType(variableType, data);
    }
    setArrayType(data?.arr_type_do === "Y" ? true : false);
    setcomplexDataJSON(data);
  };

  let microProps = {
    source: "PD_CMP", //PD_EXT
    data_object_alias_name: "", // Mandatory in props in PD_EXT
    data_object_name: "", // Mandatory in props in PD_EXT
    data_object_id: "",
    // default_category_name: "a_puneet",
    object_type: "P", //AP/P/C
    object_id: localLoadedProcessData.ProcessDefId,
    // object_name: "a_puneet",
    parent_do: [
      {
        name: "WFINSTRUMENTTABLE",
        rel_do_id: "-1",
        relation_type: "P",
        relations: [
          {
            mapped_do_field: "ProcessInstanceID",
            base_do_field: "mapid",
            base_do_field_id: 0,
          },
        ],
        status: 4,
      },
    ],
    default_data_fields: [
      {
        name: "mapid",
        alias: "mapid",
        type: "1",
        key_field: true,
        id: 0,
      },
    ],
    //"1" = String, "2" = Integer, "3" = Long, "4" = Float,"5" =Date and Time,"6" = Binary Data, "7" = Currency, "8" = Boolean,"9" = ShortDate, "10" = Ntext, "11" = Text, "12" = Nvarchar,"13" = Phone Number,"14" =Email.Binary,
    ContainerId: "pmweb_dataObjectContainer",
    Module: "MDM",
    Component: "DataModelListViewer",
    InFrame: false,
    Renderer: "renderDataModelListViewer",
    Callback: callbackMethod,
    // auto_generate_table: true,
    data_types: [1, 2, 3, 4, 5, 8, 9, 10],
    currentState: isProcessDeployedFunc(localLoadedProcessData) ? "R" : "L",
  };

  // Function to make a variable array type.
  const handleArrayType = (e) => {
    setArrayType(e.target.checked);
    // setcomplexDataJSON((prev) => {
    //   let temp = { ...prev };
    //   temp.unbounded = e.target.checked ? "Y" : "N";
    //   return temp;
    // });
  };

  // Function that closes the modal.
  const handleClose = () => {
    setIsModalOpen(false);
  };

  // Function that runs when the component loads.
  useEffect(() => {
    getUserDefinedVariables(localLoadedProcessData);
  }, []);

  useEffect(() => {
    getComplexTemplates();
  }, []);

  const getComplexTemplates = async () => {
    try {
      const res = await axios({
        method: "post",
        url: "/mdm-rest/app/templates",
        data: {
          sort_order: "A",
          filter: "",
          order_by: "2",
        },
      });
      setdataObjectTemplates([...res.data.data.templates]);
    } catch (err) {
      console.log(err);
    }
  };

  const getUserDefinedVariables = (processData) => {
    let temp = [];
    processData?.Variable.map((variable) => {
      if (
        variable.VariableScope === "U" ||
        (variable.VariableScope === "I" && variable.ExtObjectId !== "1")
      ) {
        temp.push({
          aliasName: variable.VariableName,
          dataField: variable.SystemDefinedName,
          arrayType: variable.Unbounded === "Y" ? true : false,
          variableType: variable.VariableType,
          defaultValue: variable.DefaultValue,
          variableLength: variable.VariableLength,
          columnName: variable.ColumnName || "",
          tableName: variable.TableName || "",
          relationAndMapping: variable.RelationAndMapping || "",
          variableId: variable.VariableId,
          isEditable: false,
          dataObjectId: variable?.DataObjectId || "",
        });
      }
    });
    setUserDefinedVariables(temp);
    //removeUsedDataFields(temp);
    setPrimaryVariableCount(temp.length);
    if (temp?.length > 0) {
      setBForInputStrip(true);
    }
  };

  // Function to remove the already used data fields.

  const inputComponentStyles = {
    mainDiv: styles.inputsSubDiv,
    inputbaseRtl: arabicStyles.aliasNameInput,
    inputbaseLtr: styles.aliasNameInput,
    variableTypeInputRtl: arabicStyles.variableTypeInput,
    variableTypeInputLtr: styles.variableTypeInput,
    dataFieldRtl: arabicStyles.dataFieldInput,
    dataFieldLtr: styles.dataFieldInput,
    arrayCheckboxRtl: arabicStyles.arrayCheckboxInput,
    arrayCheckboxLtr: styles.arrayCheckboxInput,
    moreOptionsRtl: arabicStyles.moreOptionsIcon,
    moreOptionsLtr: styles.moreOptionsIcon,
  };

  const dataComponentStyles = {
    mainDiv: styles.dataDiv,
    inputbaseRtl: arabicStyles.aliasNameInputData,
    inputbaseLtr: styles.aliasNameInputData,
    variableTypeInputRtl: arabicStyles.variableTypeInputData,
    variableTypeInputLtr: styles.variableTypeInputData,
    dataFieldRtl: arabicStyles.dataFieldInputData,
    dataFieldLtr: styles.dataFieldInputData,
    arrayCheckboxRtl: arabicStyles.arrayCheckboxInputData,
    arrayCheckboxLtr: styles.arrayCheckboxInputData,
    moreOptionsRtl: arabicStyles.moreOptionsIcon,
    moreOptionsLtr: styles.moreOptionsIcon,
  };

  // Function that runs when any variable is deleted.
  const handleVariableDelete = (index, selectedVariable) => {
    let postBody = {
      //processDefId: props.openProcessID,
      processDefId: localLoadedProcessData?.ProcessDefId, //Modified on 30/01/2024 for bug_id:143046
      varName: selectedVariable.aliasName,
      variableId: selectedVariable.variableId,
      varType: selectedVariable.variableType,
      sysDefName: selectedVariable.dataField,
    };

    axios.post(SERVER_URL + `/deleteVariable`, postBody).then((res) => {
      if (res.status === 200 && res.data.Status === 0) {
        if (res.data.hasOwnProperty("Validations")) {
          setvalidationsArray(res.data.Validations);
          setdependencyModalBool(true);
        } else {
          const temp = [...userDefinedVariables];
          const [removedElement] = temp.splice(index, 1);
          // Updating processData on deleting Variable
          let newProcessData = JSON.parse(
            JSON.stringify(localLoadedProcessData)
          );
          let indexValue;
          newProcessData.Variable.map((variable, index) => {
            if (variable.VariableId == selectedVariable.variableId) {
              indexValue = index;
            }
          });
          newProcessData.Variable.splice(indexValue, 1);
          setLocalLoadedProcessData(newProcessData);
          const removedDataField = removedElement.dataField;
          dataInputs.forEach((element) => {
            if (element.variableType === removedElement.variableType) {
              element.dataFields.push(removedDataField);
            }
          });
          setUserDefinedVariables(temp);
          setPrimaryVariableCount(temp.length);
          if (temp.length === 0) setBForInputStrip(false);
          dispatch(
            setToastDataFunc({
              message: t("variableDeleted"),
              severity: "success",
              open: true,
            })
          );
        }
      }
    });

    if (variableType !== "") {
      getDataFields(variableType);
    }
    updateIsDisabledDataType();
  };

  // Function that runs and makes the variable type options disabled when the data fields for a variable type are all used.
  const updateIsDisabledDataType = () => {
    dataInputs?.forEach((element, index) => {
      if (element.dataFields && element.dataFields.length === 0) {
        isDisabledDataType[index] = true;
      } else {
        isDisabledDataType[index] = false;
      }
    });
    setIsDisabledDataType([...isDisabledDataType]);
  };

  // Function that runs when the component loads for the first time.
  useEffect(() => {
    updateIsDisabledDataType();
  }, []);

  // Function to set alias name while user creates a variable.
  const handleAliasName = (event) => {
    //Modified  on 16/08/2023, bug_id:131027
    //setAliasName(event.target.value);
    let toastMsg = "";
    let isValid = true;
    const restrictChars = "~`!@#$%^&*()-+={}[]|:\";'<>?,./";
    if (isArabicLocaleSelected()) {
      isValid = restrictSpecialCharacter(
        event.target.value,
        "[~`!@#$%^&*()\\-+={}\\[\\]|\\\\:\";'<>?,.//]+"
      );

      toastMsg = `${t("varName")}${SPACE}${t(
        "cannotContain"
      )}${SPACE}${restrictChars}${SPACE}${t("charactersInIt")}`;
    } else {
      isValid = validateRegex(event.target.value, REGEX.AlphaNumUsSpace);
      toastMsg = `${t("alphanumericSpaceHiphenMsg")} ${t("in")} ${t(
        "varName"
      )}`;
    }

    console.log("@@@", "Check validattion", isValid, locale);

    if (!isValid && event.target.value.length > 0) {
      dispatch(
        setToastDataFunc({
          message: toastMsg,
          severity: "error",
          open: true,
        })
      );
    } else {
      setAliasName(event.target.value);
    }
  };

  // Function that gets the values for the data fields in the input data field.
  const getDataFields = (variableType) => {
    let temp = [];
    dataInputs?.forEach((data) => {
      if (data.variableType === variableType) {
        temp = data.dataFields;
      }
    });
    localLoadedProcessData?.Variable?.forEach((_var) => {
      const index = temp.indexOf(_var.SystemDefinedName);
      if (index > -1) {
        temp.splice(index, 1);
      }
    });
    setDataType(variableType);
    // setDataField(temp);
  };

  const getVariableTypeName = (varType) => {
    let temp = "";
    let finalVariableTypes = [
      { value: "3", label: "Integer" },
      { value: "4", label: "Long" },
      { value: "6", label: "Float" },
      { value: "8", label: "Date" },
      { value: "10", label: "Text" },
    ];
    finalVariableTypes.forEach((_var) => {
      if (_var.value === varType) {
        temp = _var.label;
      }
    });
    return temp;
  };

  // Function that sets the variable type when the user selects a value from the dropdown.
  const handleVariableType = (event, complexDataFields) => {
    setVariableType(event);
    // setcomplexDataJSON(complexDataFields);
    if (event === "11") {
      setDataField(complexDataFields?.name);
    } else if (event !== 11 && complexDataFields?.hasOwnProperty("id")) {
      setDataField(complexDataFields?.name);
    } else {
      let dataFieldsForType = getDataFieldsForType(event);
      if (dataFieldsForType.length > 0) {
        setDataField(getDataFieldsForType(event)[0]);
      } else {
        setDataField(""); //code changes for bug id 131239
        // dispatch(
        //   setToastDataFunc({
        //     message: t("noSysDefinedVarPresentError"),
        //     severity: "error",
        //     open: true,
        //   })
        // );
      }
    }

    // if (
    //   event !== "" &&
    //   event.includes("C") === false
    // ) {
    // getDataFields(event);

    //   setIsComplexSelected(false);
    // } else if (event.target.value.includes("C") === true) {
    //   setDataField("");
    //   setIsComplexSelected(true);
    // }
  };

  // Function that runs when the user tries to change the variable type of an existing variable.
  const handleVariableTypeData = (event, index, complexDataFields) => {
    if (!event.includes("C")) {
      const oldVariableType = userDefinedVariables[index].variableType;
      userDefinedVariables[index].variableType = event;
      setUserDefinedVariables([...userDefinedVariables]);
      const selectedDataType = userDefinedVariables[index].dataField;
      if (selectedDataType !== "") {
        dataInputs.forEach((element) => {
          if (element.variableType === oldVariableType) {
            element.dataFields.push(selectedDataType);
          }
        });
        setUserDefinedVariables((prevState) => {
          let temp = [...prevState];
          temp[index].dataField = "";
          return temp;
        });
      }
      const [dataInputObj] = dataInputs?.filter(
        (d) => d.variableType === event
      );
      if (event === "11") {
        setDataTypeData([...complexDataFields.map((el) => el.alias)]);
      } else {
        setDataTypeData([...dataInputObj.dataFields]);
        let temp = [...userDefinedVariables];
        temp[index].dataField = dataInputObj.dataFields[0];
        const availableDataFields = dataInputObj.dataFields?.filter(
          (q) => q !== dataInputObj.dataFields[0]
        );
        // dataInputs.forEach((element) => {
        //   if (element.variableType === event) {
        //     element.dataFields = availableDataFields;
        //   }
        // });
        setUserDefinedVariables(temp);
        updateIsDisabledDataType();
      }
    } else {
      let temp = [...userDefinedVariables];
      temp[index].dataField = "";
      setUserDefinedVariables(temp);
    }
    let temp = [...userDefinedVariables];
    temp[index].variableType = event;
    setUserDefinedVariables(temp);
  };

  // Function that runs when the user clicks on the data field dropdown of an existing variable.
  const handleDataFieldData = (index) => {
    updateIsDisabledDataType();
    const selectedVariableType = userDefinedVariables[index].variableType;
    const [dataInputObj] = dataInputs?.filter(
      (d) => d.variableType === selectedVariableType
    );
    setDataTypeData([...dataInputObj.dataFields]);
  };

  const checkDuplicateVariables = (varName) => {
    let isVariableDuplicate = false;
    for (let index = 0; index < userDefinedVariables.length; index++) {
      if (userDefinedVariables[index]?.aliasName === varName) {
        isVariableDuplicate = true;
        break;
      }
    }
    return isVariableDuplicate;
  };

  // function that checks if the provided name is from system reserved keywords
  const isSystemReserverdName = (varName = "") => {
    return Restricted_Names.some(
      (name) => name.toLowerCase() === varName.toLowerCase()
    );
  };

  //Function to check object is empty or not
  const isObjEmpty = (obj) => {
    return Object.keys(obj).length === 0;
  };

  // Function that runs when a user creates a variable using the create variable button.
  const handleCreateVariable = async () => {
    //code  added for bug 131994 on 14-10-23

    if (!aliasName) {
      dispatch(
        setToastDataFunc({
          message: t("enterVariableName"),
          severity: "error",
          open: true,
        })
      );
      return;
    }
    //till here
    if (!isSystemReserverdName(aliasName?.trim())) {
      if (!checkDuplicateVariables(aliasName?.trim())) {
        const userDefinedObj = {
          aliasName: aliasName.trim(),
          variableType: variableType,
          dataField: dataField,
          isArrayType: arrayType,
          variableId: getVariableIdFromSysDefinedName(dataField, variableType),
        };
        if (dataField !== "") {
          let postBody = {
            // processDefId: props.openProcessID,
            processDefId: localLoadedProcessData?.ProcessDefId, //Modified on 22/01/2024 for bug_id:142453
            varName: aliasName.trim(),
            variableId: getVariableIdFromSysDefinedName(
              dataField,
              variableType
            ),
            varType: variableType,
            sysDefName: dataField,
            defaultValue: "",
            varLength: "0",
            varPrecision: "0",
            unbounded: arrayType ? "Y" : "N",
            extObjectId: "0",
          };
          if (variableType !== "11" && !arrayType) {
            axios.post(SERVER_URL + `/addVariable`, postBody).then((res) => {
              if (res.status === 200 && res.data.Status === 0) {
                setisFirstRender(false);
                let temp = [...userDefinedVariables];
                temp.splice(0, 0, userDefinedObj);

                setUserDefinedVariables(temp);
                setPrimaryVariableCount(temp.length);
                // Updating processData on adding Variable
                let newProcessData = JSON.parse(
                  JSON.stringify(localLoadedProcessData)
                );
                newProcessData?.Variable?.push({
                  DefaultValue: "",
                  ExtObjectId: "0",
                  SystemDefinedName: dataField,
                  Unbounded: arrayType ? "Y" : "N",
                  VarFieldId: "0",
                  VarPrecision: "0",
                  VariableId: getVariableIdFromSysDefinedName(
                    dataField,
                    variableType
                  ),
                  VariableLength: "0",
                  VariableName: aliasName,
                  VariableScope: "U",
                  VariableType: variableType,
                });
                setLocalLoadedProcessData(newProcessData);
                setToastDataFunc({
                  message: t("variableAdded"),
                  severity: "success",
                  open: true,
                });
              }
            });
            if (!isComplexSelected) {
              const [dataInputObj] = dataInputs?.filter(
                (d) => d.variableType === variableType
              );
              const availableDataFields = dataInputObj.dataFields?.filter(
                (q) => q !== dataField
              );

              updateIsDisabledDataType();
            }
            setVariableType("");
            setDataField("");
            setArrayType(false);
            setAliasName("");
          } else {
            //Modified  on 17/08/2023, bug_id:131036
            /* const formData = new FormData();
            let varData = {
              variableType: variableType,
              variableName: aliasName,
              unbounded: complexDataJSON?.arr_type_do,
              processName: localLoadedProcessData.ProcessName,
            };

           

            let modData = { ...complexDataJSON, ...varData };

            let mystring = JSON.stringify(modData);
            let myBlob = new Blob([mystring], {
              type: "text/plain",
            });
            formData.append("file", myBlob);

            if (modData.hasOwnProperty("id")) {
              const response = await axios({
                method: "post",
                url: `/pmweb/saveVariable/${localLoadedProcessData.ProcessDefId}`,
                data: formData,
                headers: {
                  "Content-Type": "multipart/form-data",
                  // type: "application/json",
                },
              });
              if (
                response?.data?.Status === 0 &&
                response?.data?.Variable.length !== 0
              ) {
                setisFirstRender(false);
                let temp = JSON.parse(JSON.stringify(localLoadedProcessData));
                temp.Variable = [];
                temp.Variable = [...response.data.Variable];
                setLocalLoadedProcessData(temp);
                getUserDefinedVariables(temp);
                setVariableType("");
                setDataField("");
                setArrayType(false);
                setAliasName("");

                // setBForInputStrip(false);
                setToastDataFunc({
                  message: t("variableAdded"),
                  severity: "success",
                  open: true,
                });
              } else {
                setVariableType("");
                setDataField("");
                setArrayType(false);
                setAliasName("");
              }
            } */

            if (arrayType && isObjEmpty(complexDataJSON)) {
              dispatch(
                setToastDataFunc({
                  message: t("dataObjectCheckedErrorMessage"), //code added on 23-09-2023 for BugId: 137119
                  severity: "error",
                  open: true,
                })
              );
            } else {
              const formData = new FormData();
              let varData = {
                variableType: variableType,
                // variableName: aliasName.trim(),
                variableName: aliasName?.trim(), //Modified on 03/11/23 for bug_id:140614
                unbounded: complexDataJSON?.arr_type_do,
                processName: localLoadedProcessData.ProcessName,
              };

              let modData = { ...complexDataJSON, ...varData };

              let mystring = JSON.stringify(modData);
              let myBlob = new Blob([mystring], {
                type: "text/plain",
              });
              formData.append("file", myBlob);

              if (modData.hasOwnProperty("id")) {
                const response = await axios({
                  method: "post",
                  url: `/pmweb/saveVariable/${localLoadedProcessData.ProcessDefId}`,
                  data: formData,
                  headers: {
                    "Content-Type": "multipart/form-data",
                    // type: "application/json",
                  },
                });
                if (
                  response?.data?.Status === 0 &&
                  response?.data?.Variable.length !== 0
                ) {
                  setisFirstRender(false);
                  let temp = JSON.parse(JSON.stringify(localLoadedProcessData));
                  temp.Variable = [];
                  temp.Variable = [...response.data.Variable];
                  setLocalLoadedProcessData(temp);
                  getUserDefinedVariables(temp);
                  setVariableType("");
                  setDataField("");
                  setArrayType(false);
                  setAliasName("");

                  // setBForInputStrip(false);
                  setToastDataFunc({
                    message: t("variableAdded"),
                    severity: "success",
                    open: true,
                  });
                } else {
                  setVariableType("");
                  setDataField("");
                  setArrayType(false);
                  setAliasName("");
                }
              }
            }
          }
        } else {
          dispatch(
            setToastDataFunc({
              message: t("noSysDefinedVarPresentError"),
              severity: "error",
              open: true,
            })
          );
        }
      } else {
        dispatch(
          setToastDataFunc({
            message: t("sameNameVarErrorMsg"),
            severity: "error",
            open: true,
          })
        );
      }
    } else {
      dispatch(
        setToastDataFunc({
          message: t("systemReserverdErrorMsg"),
          severity: "error",
          open: true,
        })
      );
    }
  };

  // Function that sets the data field value when the user sets a data field value while creating a variable.
  const handleDataType = (event) => {
    setDataField(event.target.value);
  };

  // Function that runs when the user opens the input data field dropdown while creating a variable.
  const handleDataTypeOnOpen = () => {
    if (variableType !== "") {
      const [dataInputObj] = dataInputs?.filter(
        (d) => d.variableType === variableType
      );
      setDataType([...dataInputObj.dataFields]);
    } else {
      setDataType([]);
    }
  };

  const getDataFieldsForType = (type) => {
    let temp = [];

    temp = getDropdownOptions(type);

    localLoadedProcessData.Variable.forEach((_var) => {
      if (_var.VariableScope === "U" || _var.VariableScope === "I") {
        const index = temp.indexOf(_var.SystemDefinedName);
        if (index > -1) {
          temp.splice(index, 1);
        }
      }
    });

    if (type === "11" || type === "") return [];
    else return temp;
  };

  // Function that runs and sets the value of the data field that a user selects while creating a variable.
  const handleDataFieldChange = (event, index) => {
    const oldDataField = userDefinedVariables[index].dataField;
    const selectedVariableType = userDefinedVariables[index].variableType;
    if (oldDataField !== "") {
      dataInputs.forEach((element) => {
        if (element.variableType === selectedVariableType) {
          element.dataFields.push(oldDataField);
        }
      });
    }
    dataInputs.forEach((element) => {
      if (element.variableType === selectedVariableType) {
        const availableFields = element.dataFields?.filter(
          (d) => d !== event.target.value
        );
        element.dataFields = availableFields;
      }
    });
    if (variableType !== "") {
      getDataFields(variableType);
    }
    userDefinedVariables[index].dataField = event.target.value;
    setUserDefinedVariables([...userDefinedVariables]);
    updateIsDisabledDataType();
  };

  const changeUnboundedType = (e, varObj, index) => {
    let temp = JSON.parse(JSON.stringify(localLoadedProcessData));
    temp?.Variable.forEach((_var) => {
      if (_var.VariableId === varObj.variableId) {
        _var.Unbounded = e.target.checked ? "Y" : "N";
      }
    });
    setLocalLoadedProcessData(temp);
    userDefinedVariables[index].arrayType = e.target.checked;
    setUserDefinedVariables([...userDefinedVariables]);
  };

  const editVarData = (varData) => {
    let temp = JSON.parse(JSON.stringify(userDefinedVariables));
    temp.forEach((_var) => {
      if (_var.variableId === varData.variableId) {
        _var.isEditable = !_var.isEditable;
      } else {
        _var.isEditable = false;
      }
    });
    setUserDefinedVariables(temp);
  };

  const getPreviousVarData = (varData) => {
    getUserDefinedVariables(localLoadedProcessData);
  };

  const handleModifyAliasName = (e, varData) => {
    // let temp = JSON.parse(JSON.stringify(userDefinedVariables));
    // temp.forEach((_var) => {
    //   if (_var.variableId === varData.variableId) {
    //     _var.aliasName = e.target.value;
    //   }
    // });
    // setUserDefinedVariables(temp);
  };

  const modifyVarDataHandler = async (varData) => {
    const formData = new FormData();

    let moreData = {
      variableType: varData.variableType,
      variableName: varData.aliasName,
      unbounded: varData.arrayType ? "Y" : "N",
      variableId: varData.variableId,
      processName: localLoadedProcessData.ProcessName,
    };
    let modData = { ...modifyComplexJson, ...moreData };

    let mystring = JSON.stringify(modData);
    let myBlob = new Blob([mystring], {
      type: "text/plain",
    });
    formData.append("file", myBlob);
    if (modifyComplexJson?.hasOwnProperty("id")) {
      const response = await axios({
        method: "post",
        url: `/pmweb/modifyVariable/${localLoadedProcessData.ProcessDefId}`,
        data: formData,
        headers: {
          "Content-Type": "multipart/form-data",
          // type: "application/json",
        },
      });
      if (response.data.Status === 0) {
        let temp = JSON.parse(JSON.stringify(localLoadedProcessData));
        temp.Variable = [];
        temp.Variable = [...response.data.Variable];
        setLocalLoadedProcessData(temp);
        getUserDefinedVariables(temp);
        setModifyComplexJson({});
        setmodifyButtonDisableId(undefined);
      }
    }
  };

  // Code commented to solve Bug 135822
  // //for showing alert on blank variable name
  // useEffect(() => {
  //   if (!!dataField && !!variableType && !aliasName) {
  //     dispatch(
  //       setToastDataFunc({
  //         message: t("enterVariableName"),
  //         severity: "error",
  //         open: true,
  //       })
  //     );
  //   }
  // }, [aliasName, dataField, variableType]);
  // till here dated 26thSept
  return (
    <div className={styles.mainDiv}>
      <div className={styles.headerDiv}>
        {dependencyModalBool ? (
          <Modal
            show={dependencyModalBool}
            modalClosed={() => setdependencyModalBool(false)}
            style={{
              width: "45vw",
              left: "50%",
              top: "50%",
              padding: "0",
              position: "absolute",
              transform: "translate(-50%,-50%)",
            }}
          >
            <ObjectDependencies
              processAssociation={validationsArray}
              cancelFunc={() => setdependencyModalBool(false)}
            />
          </Modal>
        ) : null}
        <div
          style={{
            display: "flex",
            flexDirection: "row",
            marginInline: "1.25vw",
            alignItems: "center",
            gap: "0.75vw",
          }}
        >
          {/* <Checkbox
            className={
              direction === RTL_DIRECTION
                ? arabicStyles.mainCheckbox
                : styles.mainCheckbox
            }
            checked={false}
            size="medium"
          /> */}
          <p
            className={
              direction === RTL_DIRECTION
                ? arabicStyles.aliasNameHeader
                : styles.aliasNameHeader
            }
          >
            {/* Changes on 26-09-2023 to resolve the bug Id 132068 */}
            {t("variableName")}
          </p>
          <p
            className={
              direction === RTL_DIRECTION
                ? arabicStyles.typeHeader
                : styles.typeHeader
            }
          >
            {t("type")}
          </p>
          <p
            className={
              direction === RTL_DIRECTION
                ? arabicStyles.dataFieldHeader
                : styles.dataFieldHeader
            }
          >
            {t("dataField")}
          </p>
          <p
            className={
              direction === RTL_DIRECTION
                ? arabicStyles.arrayHeader
                : styles.arrayHeader
            }
          >
            {t("allowMultipleEntries")}
          </p>
        </div>
        {!isProcessReadOnly &&
        localLoadedProcessData?.ProcessVariantType !== "T" &&
        !isProcessReadDeployedFunc(localLoadedProcessData?.ProcessType) ? (
          <button
            //code modified for bug id 136265
            //className={styles.addButton}

            className="secondary"
            style={{ cursor: "pointer" }}
            onClick={() => {
              setBForInputStrip(true);
              setisFirstRender(false);
            }}
            id="pmweb_dataModel_Prim_addVar"
          >
            {t("addVariable")}
          </button>
        ) : null}
      </div>
      {!isFirstRender && bForInputStrip ? (
        <div className={styles.inputsDiv} style={{ background: "#0072C61A" }}>
          <TypeAndFieldMapping
            setdataObjectTemplates={setdataObjectTemplates}
            dataObjectTemplates={dataObjectTemplates}
            microProps={microProps}
            autofocusInput={true}
            componentStyles={inputComponentStyles}
            handleAliasName={handleAliasName}
            aliasName={aliasName}
            variableType={variableType}
            variableTypeOnOpen={updateIsDisabledDataType}
            handleVariableType={(e, complexDataFields) =>
              handleVariableType(e, complexDataFields)
            }
            inputStrip={bForInputStrip}
            isDisabledDataType={isDisabledDataType}
            dataField={dataField}
            dataTypeOnOpen={handleDataTypeOnOpen}
            handleDataType={handleDataType}
            dataTypeOptions={getDataFieldsForType(variableType)}
            arrayType={arrayType}
            setarrayType={(e) => handleArrayType(e)}
            localLoadedProcessData={localLoadedProcessData}
            newField={true}
            isEditable={true}
          />
          <div>
            {arrayType ? (
              <div className={styles.infoDiv}>
                {/* <InfoOutlinedIcon
                  className={
                    direction === RTL_DIRECTION
                      ? arabicStyles.infoIcon
                      : styles.infoIcon
                  }
                  fontSize="small"
                /> */}
                <p
                  className={
                    direction === RTL_DIRECTION
                      ? arabicStyles.infoText
                      : styles.infoText
                  }
                >
                  {/* {t("tableAndMapping")}
                  <br /> {t("autoCreated")}. */}
                </p>
                {isModalOpen ? (
                  <Modal
                    show={isModalOpen}
                    modalClosed={handleClose}
                    style={{
                      width: "90%",
                      height: "80%",
                      left: "5%",
                      top: "10%",
                      padding: "0px",
                    }}
                  >
                    <TableMappingModal
                      aliasName={aliasName}
                      handleClose={handleClose}
                    />
                  </Modal>
                ) : null}
              </div>
            ) : null}
          </div>
          <div
            className={
              direction === RTL_DIRECTION
                ? arabicStyles.buttonDiv
                : styles.buttonDiv
            }
          >
            <button
              id="pmweb_primary_variables_create_variable"
              disabled={
                // aliasName.trim() === "" ||
                variableType === "" || dataField === ""
              }
              className={
                direction === RTL_DIRECTION
                  ? arabicStyles.createVariableButton
                  : styles.createVariableButton
              }
              onClick={handleCreateVariable}
            >
              {t("createVariable")}
            </button>
            <IconButton
              classes={{
                root:
                  direction === RTL_DIRECTION
                    ? arabicStyles.deleteIcon
                    : styles.deleteIcon,
              }}
              id="pmweb_primary_variables_close_input_strip"
              onClick={() => {
                setBForInputStrip(false);
                setisFirstRender(true);
                setDataField("");
                setVariableType("");
                setAliasName("");
                setArrayType(false);
              }}
              aria-label="Close Input Strip"
            >
              <ClearOutlinedIcon

              /* tabindex={0}
              onKeyUp={(e) => {
                if (e.key === "Enter") {
                  setBForInputStrip(false);
                  setisFirstRender(true);
                  setDataField("");
                  setVariableType("");
                  setAliasName("");
                  setArrayType(false);
                }
              }}*/
              />
            </IconButton>
          </div>
        </div>
      ) : null}
      {userDefinedVariables && userDefinedVariables.length === 0 ? (
        <div className={styles.emptyStateMainDiv}>
          <img
            className={styles.emptyStateImage}
            src={EmptyStateIcon}
            alt={t("emptyState")}
          />
          {!isProcessReadOnly ? (
            <p className={styles.emptyStateHeading}>{t("createVariables")}</p>
          ) : null}
          <p className={styles.emptyStateText}>
            {t("noQueuesCreated")}
            {!isProcessReadOnly ? t("createQueuesUsingTable") : "."}
          </p>
        </div>
      ) : (
        <div className={styles.primaryVarsMain} id="primaryVarsMain">
          {userDefinedVariables
            ?.filter((d) =>
              d.aliasName.toLowerCase()?.includes(props.searchKey.toLowerCase())
            )
            ?.map((d, index) => {
              return (
                <div
                  className={styles.dataDiv}
                  style={{ background: d.isEditable ? "#0072C61A" : "#fff" }}
                >
                  {/* <Checkbox
                    disabled={isProcessReadOnly}
                    id="primary_variables_data_checkbox"
                    className={
                      direction === RTL_DIRECTION
                        ? arabicStyles.dataCheckbox
                        : styles.dataCheckbox
                    }
                    checked={false}
                    size="medium"
                  /> */}
                  <TypeAndFieldMapping
                    dataObjectTemplates={dataObjectTemplates}
                    modifyVariableData={(data) => {
                      setModifyComplexJson(data);
                      setmodifyButtonDisableId(d.variableId);
                    }}
                    bForDisabled={isProcessReadOnly}
                    componentStyles={dataComponentStyles}
                    aliasName={d.aliasName}
                    handleAliasName={(e) => handleModifyAliasName(e, d)}
                    variableType={d.variableType}
                    variableLength={d.variableLength}
                    handleVariableType={(event, complexDataFields) =>
                      handleVariableTypeData(event, index, complexDataFields)
                    }
                    isDisabledDataType={isDisabledDataType}
                    dataField={d.dataField}
                    defaultValue={d.defaultValue}
                    dataTypeOnOpen={() => handleDataFieldData(index)}
                    handleDataType={(event) =>
                      handleDataFieldChange(event, index)
                    }
                    dataTypeOptions={getDropdownOptions(d.variableType)}
                    isEditable={d.isEditable}
                    arrayType={d.arrayType}
                    localLoadedProcessData={localLoadedProcessData}
                    setarrayType={(e) => changeUnboundedType(e, d, index)}
                    varData={d}
                    setdataObjectTemplates={setdataObjectTemplates}
                    style={{
                      margin: "0 1.25vw",
                      display: "flex",
                      gap: "0.75vw",
                    }}
                  />

                  <div style={{ display: "flex", alignItems: "center" }}>
                    {/*code edited on 17 April 2023 for BugId 127038*/}
                    {d.variableType === "11" ? (
                      <>
                        <button
                          className={styles.addButton}
                          onClick={() => setShowRuleModal(d.variableId)}
                          id={`pmweb_PrimaryVar_${t("rules")}`}
                        >
                          {t("rules")}
                        </button>
                        {/*code edited on 17 April 2023 for BugId 127038 */}
                        {!isProcessReadOnly ? (
                          !d.isEditable ? (
                            <Edit
                              varData={d}
                              userDefinedVariables={userDefinedVariables}
                              setUserDefinedVariables={setUserDefinedVariables}
                              editVarData={(varData) => editVarData(varData)}
                            />
                          ) : (
                            <div
                              style={{
                                display: "flex",
                                flexDirection: "row",
                                alignItems: "center",
                                justifyContent: "flex-end",
                                width: "100%",
                              }}
                            >
                              <button
                                className={styles.cancelButton}
                                onClick={() => {
                                  getPreviousVarData(d);
                                  setModifyComplexJson({});
                                  setmodifyButtonDisableId(undefined);
                                }}
                                id="pmweb_PrimaryVar_Cancel"
                              >
                                {t("cancel")}
                              </button>
                              <button
                                style={{
                                  background:
                                    d.variableId === modifyButtonDisableId
                                      ? "#0072C6"
                                      : "#0073c64c",
                                }}
                                className={styles.updateButton}
                                id={`pmweb_PrimaryVar_${t("update")}`}
                                onClick={() => modifyVarDataHandler(d)}
                                disabled={
                                  !d.variableId === modifyButtonDisableId
                                }
                              >
                                {t("update")}
                              </button>
                            </div>
                          )
                        ) : null}
                      </>
                    ) : null}

                    {!isProcessReadOnly && !d.isEditable ? (
                      <DeleteOutlinedIcon
                        id="pmweb_primary_variables_delete_variable"
                        classes={{
                          root:
                            direction === RTL_DIRECTION
                              ? arabicStyles.deleteIcon
                              : styles.deleteIcon,
                        }}
                        onClick={() => handleVariableDelete(index, d)}
                        tabindex={0}
                        onKeyUp={(e) => {
                          if (e.key === "Enter") {
                            handleVariableDelete(index, d);
                          }
                        }}
                      />
                    ) : null}
                  </div>
                </div>
              );
            })}
        </div>
      )}
      {showRuleModal !== null ? (
        <Modal
          show={showRuleModal !== null}
          style={{
            width: "90%",
            //height:"80%"  code modified on 27-09-23 for bugId: 138226
            height: "auto", // till here for bugId: 138226
            left: "5%",
            top: "10%",
            padding: "0px",
          }}
        >
          <VariableRuleModal
            closeFunc={() => setShowRuleModal(null)}
            isReadOnly={isProcessReadOnly}
            processType={localLoadedProcessData?.ProcessType}
            variableArr={userDefinedVariables
              ?.filter((d) => +d.variableType === 11)
              .map((el) => {
                return {
                  Name: el.aliasName,
                  NameId: el.variableId,
                };
              })}
            variableId={showRuleModal}
          />
        </Modal>
      ) : null}
    </div>
  );
}
const mapStateToProps = (state) => {
  return {
    openProcessID: state.openProcessClick.selectedId,
  };
};

export default connect(mapStateToProps, null)(PrimaryVariables);
