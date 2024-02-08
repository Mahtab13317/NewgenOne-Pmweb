// #BugID - 106096 (Trigger Bug)
// #BugDescription - Solved the issue of not being able to add create child workitem
import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import {
  MenuItem,
  Select,
  Radio,
  RadioGroup,
  FormControlLabel,
  Checkbox,
  makeStyles,
} from "@material-ui/core";
import styles from "./properties.module.css";
import triggerStyles from "../trigger.module.css";
import triggerArabicStyles from "../triggerArabicStyles.module.css";
import { connect } from "react-redux";
import * as actionCreators from "../../../../redux-store/actions/Trigger";
import DataDropDown from "./Components/DataDropDown";
import deleteIcon from "../../../../assets/subHeader/delete.svg";
import { store, useGlobalState } from "state-pool";
import { LatestVersionOfProcess } from "../../../../utility/abstarctView/checkLatestVersion";
import MultiSelect from "../../../../UI/MultiSelect";
import {
  DEFAULT,
  RTL_DIRECTION,
  PROCESSTYPE_REGISTERED,
  COMPLEX_VARTYPE,
  hideComplexFromVariables,
  SYSTEM_DEFINED_VARIABLE,
  USER_DEFINED_VARIABLE,
  COMPLEX_EXTENDED_VARIABLE,
} from "../../../../Constants/appConstants";
import {
  TRIGGER_CONSTANT,
  TRIGGER_CONST_VARIABLE,
  TRIGGER_CONST_WORKSTEP,
} from "../../../../Constants/triggerConstants";
import { getVariableById } from "../../../../utility/ProcessSettings/Triggers/triggerCommonFunctions";
import {
  RedefineEventTarget,
  getComplex,
} from "../../../../utility/CommonFunctionCall/CommonFunctionCall";

const useStyles = makeStyles((theme) => ({
  focusVisible: {
    outline: "none",
    "&:focus-visible": {
      "& svg": {
        outline: `2px solid #00477A`,
        borderRadius: "10px",
      },
    },
  },
}));

function CreateChildWorkitemProperties(props) {
  const classes = useStyles();
  const loadedProcessData = store.getState("loadedProcessData");
  const [localLoadedProcessData] = useGlobalState(loadedProcessData);
  const variableDefinition = localLoadedProcessData?.Variable;
  let { t } = useTranslation();
  const direction = `${t("HTML_DIR")}`;
  const [rowSelected, setRowSelected] = useState(null);
  const [addedFields, setAddedFields] = useState([
    { row_id: 1, field: null, value: null },
  ]);
  const [selectedWorkstepField, setSelectedWorkstepField] = useState([DEFAULT]);
  const [selectedVariableField, setSelectedVariableField] = useState(DEFAULT);
  const [fieldValue, setFieldValue] = useState();
  const [sameParentChecked, setSameParentChecked] = useState(false);
  const [selectedType, setSelectedType] = useState(TRIGGER_CONST_WORKSTEP);
  const [activitiesList, setActivitiesList] = useState([]);
  const [existingTrigger, setExistingTrigger] = useState(false);
  const [allVariables, setAllVariables] = useState([]);

  let readOnlyProcess =
    props.isReadOnly ||
    props.openProcessType === PROCESSTYPE_REGISTERED ||
    props.openProcessType === "RC" ||
    LatestVersionOfProcess(localLoadedProcessData?.Versions) !==
      +localLoadedProcessData?.VersionNo; // modified on 05/09/2023 for Bugid 136103;

  const getActivities = (str) => {
    let localArr = [];
    let localStr = str.split(",");
    localLoadedProcessData?.MileStones.forEach((mile) => {
      mile.Activities.forEach((activity) => {
        if (localStr.includes(activity.ActivityName)) {
          localArr.push(activity);
        }
      });
    });
    return localArr;
  };

  useEffect(() => {
    props.setTriggerProperties({});
  }, []);

  useEffect(() => {
    let variableWithConstants = [];

    localLoadedProcessData?.DynamicConstant?.forEach((element) => {
      let tempObj = {
        VariableName: element.ConstantName,
        VariableScope: "F",
        ExtObjectId: "0",
        VarFieldId: "0",
        VariableId: "0",
        VariableType: "0", // added on 31/08/2023 for BugId 135541
      };
      variableWithConstants.push(tempObj);
    });

    variableDefinition?.forEach((element) => {
      if (
        (hideComplexFromVariables &&
          element.VariableType !== COMPLEX_VARTYPE) ||
        !hideComplexFromVariables
      ) {
        variableWithConstants.push(element);
      }
    });

    let tempVarList = [];

    variableWithConstants.forEach((_var) => {
      if (_var.VariableType === COMPLEX_VARTYPE) {
        let tempList = getComplex(_var);
        tempList?.forEach((el) => {
          tempVarList.push(el);
        });
      } else {
        tempVarList.push(_var);
      }
    });

    setAllVariables(tempVarList);
  }, []);

  useEffect(() => {
    if (props.reload) {
      // code added on 16 Dec 2022 for BugId 120240
      setExistingTrigger(false);
      props.setTriggerProperties({});
      setAddedFields([{ row_id: 1, field: null, value: null }]);
      setSelectedWorkstepField([DEFAULT]);
      setSelectedVariableField(DEFAULT);
      setSameParentChecked(false);
      setSelectedType(TRIGGER_CONST_WORKSTEP);
      setFieldValue();
      props.setReload(false);
    }
  }, [props.reload]);

  useEffect(() => {
    if (props.initialValues) {
      if (props.CREATE_CHILD_WORKITEM.type === TRIGGER_CONSTANT) {
        let localArr = getActivities(
          props.CREATE_CHILD_WORKITEM.m_strAssociatedWS
        );
        setSelectedWorkstepField(localArr);
      } else {
        setSelectedVariableField(
          getVariableById(
            props.CREATE_CHILD_WORKITEM.variableId,
            variableDefinition,
            props.CREATE_CHILD_WORKITEM.varFieldId
          )
        );
      }
      setAddedFields(props.CREATE_CHILD_WORKITEM.list);
      setSameParentChecked(
        props.CREATE_CHILD_WORKITEM.generateSameParent === "Y" ? true : false
      );
      setSelectedType(
        props.CREATE_CHILD_WORKITEM.type === TRIGGER_CONSTANT
          ? TRIGGER_CONST_WORKSTEP
          : TRIGGER_CONST_VARIABLE
      );
      setExistingTrigger(true);
      props.setInitialValues(false);
    }
  }, [props.initialValues]);

  useEffect(() => {
    let arr = [];
    localLoadedProcessData?.MileStones.forEach((mile) => {
      mile.Activities.forEach((activity) => {
        arr.push(activity);
      });
    });
    setActivitiesList(arr);
  }, [localLoadedProcessData]);

  const addNewField = () => {
    if (existingTrigger) {
      props.setTriggerEdited(true);
    }
    setAddedFields((prev) => {
      let newData = [...prev];
      newData.push({
        row_id: newData[newData.length - 1].row_id + 1,
        field: null,
        value: null,
      });
      return newData;
    });
  };

  const deleteField = (index) => {
    if (existingTrigger) {
      props.setTriggerEdited(true);
    }
    setRowSelected(null);
    if (addedFields?.length > 1) {
      setAddedFields((prev) => {
        let newData = [...prev];
        newData.splice(index, 1);
        return newData;
      });
    } else {
      setAddedFields((prev) => {
        let newData = [...prev];
        newData.splice(index, 1);
        newData.push({ id: 1, field: null, value: null });
        return newData;
      });
    }
  };

  useEffect(() => {
    if (fieldValue) {
      if (existingTrigger) {
        props.setTriggerEdited(true);
      }
      addedFields.forEach((field, index) => {
        if (field.row_id === fieldValue.row_id) {
          setAddedFields((prev) => {
            let newData = [...prev];
            if (fieldValue.type === "F") {
              newData[index].field = fieldValue.value;
            } else {
              if (fieldValue.constant) {
                newData[index].value = {
                  VariableName: fieldValue.value,
                  ExtObjectId: "0",
                  VariableId: "0",
                  VarFieldId: "0", // modified on 31/08/2023 for Bug 135407 and Bug 135409
                  VariableScope: TRIGGER_CONSTANT,
                  VariableType: "0", // added on 31/08/2023 for BugId 135541
                  constant: true,
                };
              } else {
                newData[index].value = fieldValue.value;
              }
            }
            return newData;
          });
        }
      });
    }
  }, [fieldValue]);

  useEffect(() => {
    let m_strAssociatedWS = "";
    let variableId;
    let varFieldId;
    let type;
    let list = [];
    let generateSameParent = sameParentChecked ? "Y" : "N";
    if (selectedType === TRIGGER_CONST_WORKSTEP) {
      type = TRIGGER_CONSTANT;
      if (selectedWorkstepField?.length > 0) {
        selectedWorkstepField.forEach((workstep) => {
          if (workstep !== DEFAULT) {
            if (m_strAssociatedWS.length === 0) {
              m_strAssociatedWS = workstep.ActivityName;
            } else {
              m_strAssociatedWS =
                m_strAssociatedWS + "," + workstep.ActivityName;
            }
          }
        });
      }
      variableId = "0";
      varFieldId = "0";
    } else if (selectedType === TRIGGER_CONST_VARIABLE) {
      type = selectedVariableField?.VariableScope;
      variableId = selectedVariableField?.VariableId;
      varFieldId = selectedVariableField?.VarFieldId;
      m_strAssociatedWS = selectedVariableField?.VariableName;
    }
    if (addedFields?.length > 0) {
      list = addedFields?.filter((child) => {
        if (child.field && child.value) {
          return { field: child.field, value: child.value };
        }
      });
    }
    props.setTriggerProperties({
      m_strAssociatedWS,
      type,
      generateSameParent,
      variableId,
      varFieldId,
      list,
    });
  }, [
    sameParentChecked,
    selectedType,
    selectedWorkstepField,
    selectedVariableField,
    addedFields,
  ]);

  const handleSelectVariableField = (value) => {
    const arrayOfVarIdAndFieldId = value.split("_");
    const varibleid = arrayOfVarIdAndFieldId[0];
    const varfieldid = arrayOfVarIdAndFieldId[1];
    const selVariable = getVariableById(
      varibleid,
      variableDefinition,
      varfieldid
    );
    setSelectedVariableField(selVariable);
  };

  const onChange = (e) => {
    setSelectedType(e.target.value);
    if (existingTrigger) {
      props.setTriggerEdited(true);
    }
  };

  return (
    <React.Fragment>
      <div className={styles.propertiesColumnView}>
        <div className="flex">
          <div className={styles.triggerFormLabel}>
            {t("workstep")}{" "}
            <span className="relative">
              {t("name")}
              <span className={styles.starIcon}>*</span>
            </span>
          </div>
          <div>
            <RadioGroup
              name="createChildWorkitem"
              className={styles.properties_radioDiv}
              value={selectedType}
              onChange={onChange}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  const child = e.target.querySelector("input");
                  onChange(RedefineEventTarget(e, child));
                }
              }}
            >
              <FormControlLabel
                value={TRIGGER_CONST_WORKSTEP}
                control={<Radio tabIndex={-1} />}
                tabIndex={0}
                disabled={readOnlyProcess}
                label={t("selectWorkstep")}
                id="trigger_ccwi_workstepOpt"
                className={classes.focusVisible}
              />
              <FormControlLabel
                value={TRIGGER_CONST_VARIABLE}
                disabled={readOnlyProcess}
                control={<Radio tabIndex={-1} />}
                tabIndex={0}
                label={t("selectVariable")}
                id="trigger_ccwi_variableOpt"
                className={classes.focusVisible}
              />
            </RadioGroup>
            <div className="flex" style={{ alignItems: "center" }}>
              {selectedType === TRIGGER_CONST_WORKSTEP ? (
                <MultiSelect
                  completeList={activitiesList}
                  labelKey="ActivityName"
                  indexKey="ActivityId"
                  associatedList={selectedWorkstepField}
                  handleAssociatedList={(val) => {
                    setSelectedWorkstepField(val);
                    if (existingTrigger) {
                      props.setTriggerEdited(true);
                    }
                  }}
                  placeholder={t("chooseWorkstep")}
                  noDataLabel={t("noWorksteps")}
                  disabled={readOnlyProcess}
                  labelId="trigger_ccwi_workstepOpt"
                  id="trigger_ccwi_workstepMultiSelect"
                  style={{ width: "35vw",maxHeight:"8rem",overflowY:"auto" }}
                
                />
              ) : (
                <Select
                  className={styles.triggerSelectVariableInput}
                  MenuProps={{
                    anchorOrigin: {
                      vertical: "bottom",
                      horizontal: "left",
                    },
                    transformOrigin: {
                      vertical: "top",
                      horizontal: "left",
                    },
                    getContentAnchorEl: null,
                    PaperProps: {
                      style: {
                        maxHeight: "10rem",
                      },
                    },
                  }}
                  inputProps={{
                    readOnly: readOnlyProcess,
                    "aria-labelledby": "trigger_ccwi_variableOpt",
                  }}
                  value={`${selectedVariableField?.VariableId}_${selectedVariableField?.VarFieldId}`}
                  onChange={(e) => {
                    handleSelectVariableField(e.target.value);
                    if (existingTrigger) {
                      props.setTriggerEdited(true);
                    }
                  }}
                  id={`trigger_ccwi_variable_list`}
                >
                  <MenuItem
                    className={styles.defaultSelectValue}
                    value={DEFAULT}
                  >
                    <span>{t("chooseVariable")}</span>
                  </MenuItem>
                  {/* modified on 31/08/2023 for Bug 135320 - Child trigger -> integer/float/long etc 
                  is displayed for variables.*/}
                  {/* list of variables which are of text type and are system defined or user defined.*/}
                  {allVariables
                    ?.filter(
                      (el) =>
                        +el.VariableType === 10 &&
                        (el.VariableScope === SYSTEM_DEFINED_VARIABLE ||
                          el.VariableScope === USER_DEFINED_VARIABLE)
                    )
                    ?.map((option) => {
                      return (
                        <MenuItem
                          className={
                            direction === RTL_DIRECTION
                              ? triggerArabicStyles.triggerDropdownData
                              : triggerStyles.triggerDropdownData
                          }
                          value={`${option.VariableId}_${option.VarFieldId}`}
                        >
                          {option.VariableName}
                        </MenuItem>
                      );
                    })}
                </Select>
              )}
              <div className={styles.sameParentCheckbox}>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={sameParentChecked}
                      disabled={readOnlyProcess}
                      onChange={() => {
                        setSameParentChecked((prev) => {
                          return !prev;
                        });
                        if (existingTrigger) {
                          props.setTriggerEdited(true);
                        }
                      }}
                      id="trigger_ccwi_sameParentCheck"
                      name="checkedB"
                      color="primary"
                      onKeyUp={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          setSameParentChecked((prev) => !prev);
                          if (existingTrigger) {
                            props.setTriggerEdited(true);
                          }
                        }
                      }}
                      tabIndex={readOnlyProcess ? -1 : 0}
                    />
                  }
                  className={styles.properties_radioButton}
                  label={t("generateSameParent")}
                />
              </div>
            </div>
          </div>
        </div>
        <div className="flex alignCenter">
          <div
            className={`${styles.propertiesTriggerLabel} ${styles.propertiesSetTriggerLabel}`}
          >
            {t("SET")}{" "}
            <span className="relative">
              {t("variable(s)")}
              <span className={styles.starIcon}>*</span>
            </span>
          </div>
          {!readOnlyProcess ? (
            <button
              className={styles.addSetTrigger}
              onClick={addNewField}
              id="trigger_ccwi_addFieldsBtn"
              aria-description={`${t("SET")} ${t("variable(s)")}`}
            >
              {t("add")}
            </button>
          ) : null}
        </div>
        {
          //Modified on 22/05/2023, bug_id:127677
          /* <div className={styles.setTriggerList}> */
        }
        <div className={`${styles.setTriggerList} ${styles.variableList}`}>
          {addedFields?.length > 0
            ? addedFields.map((childField, index) => {
                return (
                  <div
                    onMouseEnter={() => setRowSelected(childField.row_id)}
                    onMouseLeave={() => setRowSelected(null)}
                    className={`${styles.setTriggerDropDowns} flex`}
                    style={{
                      backgroundColor:
                        rowSelected === childField.row_id ? "#F0F0F0" : "white",
                    }}
                  >
                    <DataDropDown
                      // modified on 31/08/2023 for Bug 135407 and Bug 135409
                      // list of variables which are user defined.
                      triggerTypeOptions={allVariables?.filter(
                        (el) =>
                          el.VariableScope === USER_DEFINED_VARIABLE ||
                          el.VariableScope === COMPLEX_EXTENDED_VARIABLE
                      )}
                      setFieldValue={setFieldValue}
                      id={childField.row_id}
                      type="F"
                      value={childField.field}
                      setRowSelected={setRowSelected}
                      uniqueId="trigger_ccwi_key_dropdown"
                      isReadOnly={readOnlyProcess}
                    />
                    <span className={styles.triggerEqualTo}>=</span>
                    <DataDropDown
                      triggerTypeOptions={allVariables?.filter(
                        (el) =>
                          el.VariableType === childField.field?.VariableType
                      )}
                      setFieldValue={setFieldValue}
                      id={childField.row_id}
                      type="V"
                      value={childField.value}
                      setRowSelected={setRowSelected}
                      constantAdded={true}
                      constantType={childField.field?.VariableType}
                      uniqueId="trigger_ccwi_value_dropdown"
                      isReadOnly={readOnlyProcess}
                    />
                    {rowSelected === childField.row_id ? (
                      <div
                        onClick={() => deleteField(index)}
                        className={styles.triggerDeleteIcon}
                        id={`trigger_ccwi_delete_${childField.row_id}`}
                        tabIndex={0}
                        onKeyUp={(e) => {
                          if (e.key === "Enter") {
                            deleteField(index);
                          }
                        }}
                      >
                        <img
                          src={deleteIcon}
                          width="16px"
                          height="16px"
                          title={t("delete")}
                          alt={t("delete")}
                        />
                      </div>
                    ) : (
                      ""
                    )}
                  </div>
                );
              })
            : null}
        </div>
      </div>
    </React.Fragment>
  );
}

const mapStateToProps = (state) => {
  return {
    CREATE_CHILD_WORKITEM: state.triggerReducer.CreateChild,
    initialValues: state.triggerReducer.setDefaultValues,
    reload: state.triggerReducer.trigger_reload,
    openProcessType: state.openProcessClick.selectedType,
  };
};

const mapDispatchToProps = (dispatch) => {
  return {
    setReload: (reload) =>
      dispatch(actionCreators.reload_trigger_fields(reload)),
    setTriggerProperties: ({
      m_strAssociatedWS,
      type,
      generateSameParent,
      variableId,
      varFieldId,
      list,
    }) =>
      dispatch(
        actionCreators.createChildWorkitemTrigger_properties({
          m_strAssociatedWS,
          type,
          generateSameParent,
          variableId,
          varFieldId,
          list,
        })
      ),
    setInitialValues: (value) =>
      dispatch(actionCreators.set_trigger_fields(value)),
    setTriggerEdited: (value) =>
      dispatch(actionCreators.is_trigger_definition_edited(value)),
  };
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(CreateChildWorkitemProperties);
