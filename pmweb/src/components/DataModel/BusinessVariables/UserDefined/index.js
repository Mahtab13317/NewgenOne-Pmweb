import React, { useState, useEffect } from "react";
import styles from "./index.module.css";
import arabicStyles from "./ArabicStyles.module.css";
import {
  ENDPOINT_ADD_USER_DEFINE_VARIABLE,
  ENDPOINT_DELETE_USER_DEFINE_VARIABLE,
  ENDPOINT_MODIFY_USER_DEFINE_VARIABLE,
  RTL_DIRECTION,
  SERVER_URL,
} from "../../../../Constants/appConstants";
import { Checkbox, MenuItem } from "@material-ui/core";
import { useTranslation } from "react-i18next";
import DeleteOutlinedIcon from "@material-ui/icons/DeleteOutlined";
import EmptyStateIcon from "../../../../assets/ProcessView/EmptyState.svg";
import ClearOutlinedIcon from "@material-ui/icons/ClearOutlined";
import axios from "axios";
import TypeAndFieldMapping from "./TypeAndFieldMapping";
import { connect } from "react-redux";
import { style } from "../../../../Constants/bpmnView";
import { store, useGlobalState } from "state-pool";

function UserDefined(props) {
  let { t } = useTranslation();
  const [localLoadedVariableList, setlocalLoadedVariableList] =
    useGlobalState("variableDefinition");
  const { isProcessReadOnly, bForInputStrip, setBForInputStrip } = props;
  const direction = `${t("HTML_DIR")}`;

  const loadedProcess = store.getState("loadedProcessData");
  const [localLoadedProcessData, setlocalLoadedProcessData] =
    useGlobalState(loadedProcess);

  const [aliasName, setAliasName] = useState("");
  const [variableType, setVariableType] = useState("");
  const [variableLength, setVarableLength] = useState("");
  const [userDefinedVariables, setUserDefinedVariables] = useState([]);
  const [disableLength, setDisableLength] = useState(false);
  const [defaultValue, setDefaultValue] = useState("");
  const [showCalender, setShowCalender] = useState(false);
  const [showIntervelIcon, setShowIntervelIcon] = useState(false);
  const [precision, setPresion] = useState("0");
  const [showPrecision, setShowPrecision] = useState(false);
  const [length, setLength] = useState("");
  const [tableName, setTableName] = useState(localLoadedProcessData.TableName);

  //userDefine table alredy present in the system
  useEffect(() => {
    let defaultData = [
      {
        fieldName: "ItemIndex",
        fieldType: "10",
        fieldLen: "50",
        fieldPrecision: precision,
        fieldDefaultValue: "",
        fieldPrimaryKey: "Y",
        fieldUniqueKey: "N",
      },
      {
        fieldName: "ItemType",
        fieldType: "10",
        fieldLen: "50",
        fieldPrecision: precision,
        fieldDefaultValue: "",
        fieldPrimaryKey: "Y",
        fieldUniqueKey: "N",
      },
    ];

    const localData = localLoadedVariableList.map((el) => {
      return el;
    });
    let externalVariable = [];
    localData.map((val) => {
      if (val.ExtObjectId == "1") {
        externalVariable.push(val);
      }
    });

    let outputArray = [];
    const tempArray = externalVariable;
    tempArray &&
      tempArray.forEach((element) => {
        outputArray.push({
          fieldName: element.VariableName,
          fieldType: element.VariableType,
          fieldLen: element.VariableLength,
          fieldPrecision: element.VarPrecision,
          fieldDefaultValue: element.DefaultValue,
          fieldPrimaryKey: "N",
          fieldUniqueKey: "N",
        });
      });

    let defaultARRAY = [...defaultData, ...outputArray];
    setUserDefinedVariables(defaultARRAY);
    setLength(defaultARRAY.length);
  }, []);

  // Function that runs when a user creates a variable using the create variable button.
  const handleCreateVariable = () => {
    const userDefinedObj = {
      externalTable: "N",
      processDefId: props.openProcessID,
      externalTableName: tableName,

      pMFieldInfo: {
        fieldName: aliasName,
        fieldType: variableType,
        fieldLen: variableLength,
        fieldPrecision: precision,
        fieldDefaultValue: defaultValue,
        fieldPrimaryKey: "N",
        fieldUniqueKey: "N",
      },
    };

    axios
      .post(SERVER_URL + ENDPOINT_ADD_USER_DEFINE_VARIABLE, userDefinedObj)
      .then((res) => {
        if (res.data.Status === 0) {
          let temp = JSON.parse(JSON.stringify(userDefinedVariables));
          temp.push(userDefinedObj.pMFieldInfo);

          setUserDefinedVariables(temp);
          let temp2 = JSON.parse(JSON.stringify(localLoadedVariableList));

          temp2.push({
            DefaultValue: userDefinedObj.pMFieldInfo.fieldDefaultValue,
            ExtObjectId: "1",
            SystemDefinedName: userDefinedObj.pMFieldInfo.fieldName,
            Unbounded: userDefinedObj.pMFieldInfo.fieldPrimaryKey,
            VarFieldId: "0",
            VarPrecision: userDefinedObj.pMFieldInfo.fieldPrecision,
            VariableId: "",
            VariableLength: userDefinedObj.pMFieldInfo.fieldLen,
            VariableName: userDefinedObj.pMFieldInfo.fieldName,
            VariableScope: "I",
            VariableType: userDefinedObj.pMFieldInfo.fieldType,
          });
          setlocalLoadedVariableList(temp2);

          setAliasName("");
          setVariableType("");
          setVarableLength("");
          setDefaultValue("");
          setShowCalender(false);
          setShowIntervelIcon(false);
          setPresion("");
          setLength(userDefinedVariables.length);
        }
      });
  };

  //set the count
  props.totalUserDefineVariable(length);

  const inputComponentStyles = {
    mainDiv: styles.inputsSubDiv,
    inputbaseRtl: arabicStyles.aliasNameInput,
    inputbaseLtr: styles.aliasNameInput,
    variableTypeInputRtl: arabicStyles.variableTypeInput,
    variableTypeInputLtr: styles.variableTypeInput,
    lengthRtl: arabicStyles.lengthInput,
    lengthLtr: styles.lengthInput,
    defaultValueRtl: arabicStyles.defaultValueInput,
    defaultValueLtr: styles.defaultValueInput,
  };

  const dataComponentStyles = {
    mainDiv: styles.dataDiv,
    inputbaseRtl: arabicStyles.aliasNameInputData,
    inputbaseLtr: styles.aliasNameInputData,
    variableTypeInputRtl: arabicStyles.variableTypeInputData,
    variableTypeInputLtr: styles.variableTypeInputData,
    lengthRtl: arabicStyles.lengthInputData,
    lengthLtr: styles.lengthInputData,
    defaultValueRtl: arabicStyles.defaultValueInput,
    defaultValueLtr: styles.defaultValueInput,
  };

  // Function to set alias name while user creates a variable.
  const handleAliasName = (event) => {
    setAliasName(event.target.value);
  };

  // Function to set alias length while user creates a variable.
  const handleVariableLenth = (event) => {
    setVarableLength(event.target.value);
  };

  // Function to set alias preciosn while user creates a variable.
  const handleprecision = (event) => {
    setPresion(event.target.value);
  };

  // Function to set defaultValue  while user creates a variable.
  const handledefaultValue = (event) => {
    setDefaultValue(event.target.value);
  };

  const validateVarType = (event) => {
    if (event.target.value === "10") {
      setVarableLength("50");
      setShowCalender(false);
      setShowIntervelIcon(false);
      setDefaultValue("");
      setShowPrecision(false);
    }
    if (event.target.value === "6") {
      setVarableLength("15");
      setShowCalender(false);
      setShowIntervelIcon(false);
      setDefaultValue("");
      setShowPrecision(false);
    }
    if (event.target.value === "3") {
      setVarableLength("2");
      setDisableLength(true);
      setShowCalender(false);
      setShowIntervelIcon(false);
      setDefaultValue("");
      setShowPrecision(true);
    }
    if (event.target.value === "4") {
      setVarableLength("4");
      setDisableLength(true);
      setShowCalender(false);
      setShowIntervelIcon(false);
      setDefaultValue("");
      setShowPrecision(false);
    }
    if (event.target.value === "8") {
      setVarableLength("8");
      setDisableLength(true);
      setShowCalender(true);
      setShowIntervelIcon(false);
      setShowPrecision(false);
    }
    if (event.target.value === "12") {
      setVarableLength("5");
      setDisableLength(true);
      setShowCalender(false);
      setShowIntervelIcon(false);
      setDefaultValue("");
      setShowPrecision(false);
    }
    if (event.target.value === "15") {
      setVarableLength("8");
      setDisableLength(true);
      setShowCalender(true);
      setShowIntervelIcon(false);
      setShowPrecision(false);
    }
    if (event.target.value === "16") {
      setVarableLength("8");
      setShowCalender(false);
      setShowIntervelIcon(false);
      setDefaultValue("");
      setShowPrecision(false);
    }
    if (event.target.value === "17") {
      setVarableLength("50");
      setDisableLength(true);
      setShowCalender(false);
      setShowIntervelIcon(true);
      setDefaultValue("");
      setShowPrecision(false);
    }
    if (event.target.value === "18") {
      setVarableLength("0");
      setDisableLength(true);
      setShowCalender(false);
      setShowIntervelIcon(false);
      setDefaultValue("");
      setShowPrecision(false);
    }
  };

  // Function that sets the variable type when the user selects a value from the dropdown.
  const handleVariableType = (event) => {
    setVariableType(event.target.value);
    validateVarType(event);
  };

  // Function that runs when the user tries to change the variable type of an existing variable.
  const handleVariableTypeData = (event, index) => {
    const oldVariableType = userDefinedVariables[index].fieldType;
    userDefinedVariables[index].fieldType = event.target.value;
    setUserDefinedVariables([...userDefinedVariables]);
    validateVarType(event);
  };

  // Function that runs when the user tries to change the alias name of an existing variable.
  const handleAliasNameData = (event, index) => {
    const oldVariableType = userDefinedVariables[index].fieldName;
    userDefinedVariables[index].fieldName = event.target.value;
    setUserDefinedVariables([...userDefinedVariables]);
  };

  // Function that runs when the user tries to change the length of an existing variable.
  const handleVariableLenthData = (event, index) => {
    const oldLength = userDefinedVariables[index].fieldLen;
    userDefinedVariables[index].fieldLen = event.target.value;
    setUserDefinedVariables([...userDefinedVariables]);
  };

  // Function that runs when the user tries to change the length of an existing variable.
  const handledefaultValueData = (event, index) => {
    const oldDefaultLength = userDefinedVariables[index].fieldDefaultValue;
    userDefinedVariables[index].fieldDefaultValue = event.target.value;
    setUserDefinedVariables([...userDefinedVariables]);
  };

  // Function that runs when the user tries to change the precision of an existing variable.
  const handleprecisionData = (event, index) => {
    const oldDefaultLength = userDefinedVariables[index].fieldPrecision;
    userDefinedVariables[index].fieldPrecision = event.target.value;
    setUserDefinedVariables([...userDefinedVariables]);
  };

  // Function that runs when any variable is deleted.
  const handleVariableDelete = (index, fieldName) => {
    let delJson = {
      externalTable: "N",
      processDefId: props.openProcessID,
      externalTableName: tableName,
      pMFieldInfo: {
        fieldName: fieldName,
      },
    };

    axios
      .post(SERVER_URL + ENDPOINT_DELETE_USER_DEFINE_VARIABLE, delJson)
      .then((res) => {
        if (res.data.Status === 0) {
          const [removedElement] = userDefinedVariables.splice(index, 1);
          setUserDefinedVariables([...userDefinedVariables]);
          setLength(userDefinedVariables.length);
        }
      });
  };

  //modify user define
  const modifyVariable = (index) => {
    let modifyJson = {
      externalTable: "N",
      processDefId: props.openProcessID,
      externalTableName: tableName,
      pMFieldInfo: {
        fieldName: userDefinedVariables[index].fieldName,
        fieldType: userDefinedVariables[index].fieldType,
        fieldLen: userDefinedVariables[index].fieldLen,
        fieldPrecision: userDefinedVariables[index].fieldPrecision,
        fieldDefaultValue: userDefinedVariables[index].fieldDefaultValue,
        fieldPrimaryKey: "N",
        fieldUniqueKey: "N",
      },
    };

    axios
      .post(SERVER_URL + ENDPOINT_MODIFY_USER_DEFINE_VARIABLE, modifyJson)
      .then((res) => {
        if (res.data.Status === 0) {
        }
      });
  };

  //default date
  const selectedDefaultDate = (value) => {
    setDefaultValue(value);
  };

  //default Duration
  const selectedDuration = (value) => {
    setDefaultValue(value);
  };

  return (
    <div className={styles.mainDiv}>
      <div className={styles.tableNameDiv}>
        <p className={styles.TableHeader}>{t("userDefineType")}</p>
        <input value={tableName} disabled={true} className={styles.tableName} />
        <button className={styles.changeTable}>{t("ChangeDataObject")}</button>
      </div>
      <div className={styles.headerDiv}>
        <Checkbox
          className={
            direction === RTL_DIRECTION
              ? arabicStyles.mainCheckbox
              : styles.mainCheckbox
          }
          checked={false}
          size="small"
        />
        <p
          className={
            direction === RTL_DIRECTION
              ? arabicStyles.aliasNameHeader
              : styles.aliasNameHeader
          }
        >
          {t("aliasName")}
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
              ? arabicStyles.lengthHeader
              : styles.lengthHeader
          }
        >
          {t("length")}
        </p>
        {showPrecision ? (
          <p
            className={
              direction === RTL_DIRECTION
                ? arabicStyles.defaultValueHeader
                : styles.defaultValueHeader
            }
          >
            {t("precision")}
          </p>
        ) : null}
        <p
          className={
            direction === RTL_DIRECTION
              ? arabicStyles.defaultValueHeader
              : styles.defaultValueHeader
          }
        >
          {t("defaultValue")}
        </p>
      </div>

      {bForInputStrip ? (
        <div className={styles.inputsDiv}>
          <TypeAndFieldMapping
            autofocusInput={true}
            componentStyles={inputComponentStyles}
            handleAliasName={handleAliasName}
            aliasName={aliasName}
            variableType={variableType}
            handleVariableType={handleVariableType}
            variableLength={variableLength}
            handleVariableLenth={handleVariableLenth}
            disableLength={disableLength}
            defaultValue={defaultValue}
            handledefaultValue={handledefaultValue}
            showCalender={showCalender}
            showIntervelIcon={showIntervelIcon}
            selectedDefaultDate={selectedDefaultDate}
            handleprecision={handleprecision}
            precision={precision}
            showPrecision={showPrecision}
            selectedDuration={selectedDuration}
          />
          <div
            className={
              direction === RTL_DIRECTION
                ? arabicStyles.buttonDiv
                : styles.buttonDiv
            }
          >
            <ClearOutlinedIcon
              id="userDefine_variables_close_input_strip"
              onClick={() => setBForInputStrip(false)}
              className={
                direction === RTL_DIRECTION
                  ? arabicStyles.closeInputStrip
                  : styles.closeInputStrip
              }
            />
            <button
              id="userDefine_variables_create_variable"
              disabled={
                aliasName === "" || variableType === "" || variableLength === ""
              }
              className={
                direction === RTL_DIRECTION
                  ? arabicStyles.createVariableButton
                  : styles.createVariableButton
              }
              onClick={handleCreateVariable}
            >
              <span>{t("createVariable")}</span>
            </button>
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
          <p className={styles.emptyStateHeading}>{t("createVariables")}</p>
          <p className={styles.emptyStateText}>
            {t("noUserDefinedVariable")}
            {!isProcessReadOnly ? t("createQueuesUsingTable") : "."}
          </p>
        </div>
      ) : (
        userDefinedVariables &&
        userDefinedVariables.map((d, index) => {
          return (
            <div className={styles.dataDiv}>
              <Checkbox
                disabled={isProcessReadOnly}
                id="userDefine_variables_data_checkbox"
                className={
                  direction === RTL_DIRECTION
                    ? arabicStyles.dataCheckbox
                    : styles.dataCheckbox
                }
                checked={false}
                size="small"
              />
              <TypeAndFieldMapping
                bForDisabled={isProcessReadOnly || index == 1 || index == 0}
                componentStyles={dataComponentStyles}
                aliasName={d.fieldName}
                handleAliasName={(event) => handleAliasNameData(event, index)}
                variableType={d.fieldType}
                handleVariableType={(event) =>
                  handleVariableTypeData(event, index)
                }
                variableLength={d.fieldLen}
                handleVariableLenth={(event) =>
                  handleVariableLenthData(event, index)
                }
                disableLength={disableLength}
                defaultValue={d.fieldDefaultValue}
                handledefaultValue={(event) =>
                  handledefaultValueData(event, index)
                }
                showCalender={d.fieldType === "8"}
                handleprecision={(event) => handleprecisionData(event, index)}
                precision={d.fieldPrecision}
                showPrecision={d.fieldType === "3"}
                showIntervelIcon={d.fieldType === "17"}
              />
              {!isProcessReadOnly ? (
                <React.Fragment>
                  {index == 1 || index == 0 ? null : (
                    <React.Fragment>
                      <button
                        id="userDefine_variables_modify_variable"
                        className={
                          direction === RTL_DIRECTION
                            ? arabicStyles.modifyVariableButton
                            : styles.modifyVariableButton
                        }
                        style={{ marginLeft: "auto" }}
                        onClick={() => modifyVariable(index)}
                      >
                        <span>{t("modify")}</span>
                      </button>
                      <DeleteOutlinedIcon
                        id="userDefine_variables_delete_variable"
                        className={
                          direction === RTL_DIRECTION
                            ? arabicStyles.deleteIcon
                            : styles.deleteIcon
                        }
                        onClick={() => handleVariableDelete(index, d.fieldName)}
                      />
                    </React.Fragment>
                  )}
                </React.Fragment>
              ) : null}
            </div>
          );
        })
      )}
    </div>
  );
}

const mapStateToProps = (state) => {
  return {
    openProcessID: state.openProcessClick.selectedId,
    openProcessName: state.openProcessClick.selectedProcessName,
    openProcessType: state.openProcessClick.selectedType,
  };
};

export default connect(mapStateToProps, null)(UserDefined);
