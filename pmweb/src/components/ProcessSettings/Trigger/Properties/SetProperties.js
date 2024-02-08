// #BugID - 116666
// #BugDescription - Added check so that delete button is only visible when there are more than 1 row.
import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import styles from "./properties.module.css";
import { connect } from "react-redux";
import * as actionCreators from "../../../../redux-store/actions/Trigger";
import DataDropDown from "./Components/DataDropDown";
import deleteIcon from "../../../../assets/subHeader/delete.svg";
import { store, useGlobalState } from "state-pool";
import { LatestVersionOfProcess } from "../../../../utility/abstarctView/checkLatestVersion";
import {
  PROCESSTYPE_REGISTERED,
  COMPLEX_VARTYPE,
  hideComplexFromVariables,
  USER_DEFINED_VARIABLE,
  COMPLEX_EXTENDED_VARIABLE,
} from "../../../../Constants/appConstants";
import { TRIGGER_CONSTANT } from "../../../../Constants/triggerConstants";
import { getComplex } from "../../../../utility/CommonFunctionCall/CommonFunctionCall";

function SetProperties(props) {
  const loadedProcessData = store.getState("loadedProcessData");
  const [localLoadedProcessData] = useGlobalState(loadedProcessData);
  let { t } = useTranslation();
  const [rowSelected, setRowSelected] = useState(null);
  const [addedFields, setAddedFields] = useState([
    { row_id: 1, field: null, value: null },
  ]);
  const [fieldValue, setFieldValue] = useState();
  const [existingTrigger, setExistingTrigger] = useState(false);
  const variableDefinition = localLoadedProcessData?.Variable;
  const [allVariables, setAllVariables] = useState([]);

  let readOnlyProcess =
    props.isReadOnly ||
    props.openProcessType === PROCESSTYPE_REGISTERED ||
    props.openProcessType === "RC" ||
    LatestVersionOfProcess(localLoadedProcessData?.Versions) !==
      +localLoadedProcessData?.VersionNo; // modified on 05/09/2023 for Bugid 136103;

  useEffect(() => {
    props.setTriggerProperties([]);
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
      // code edited on 25 Aug 2023 for BugId 134145 - Executing a set trigger is only
      // loading on the screen and not working as designed in the process
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
      props.setTriggerProperties([]);
      setAddedFields([{ row_id: 1, field: null, value: null }]);
      // code added on 16 Dec 2022 for BugId 120240
      setExistingTrigger(false);
      props.setReload(false);
    }
  }, [props.reload]);

  useEffect(() => {
    if (props.initialValues) {
      setAddedFields(props.set);
      setExistingTrigger(true);
      props.setInitialValues(false);
    }
  }, [props.initialValues]);

  useEffect(() => {
    if (addedFields?.length > 0) {
      //Modified on 03/08/2023, bug_id:131962

      /*  let arr = addedFields?.filter((child) => {
        if (child.field && child.value) {
          return { field: child.field, value: child.value };
        }
      });
      if (arr.length >= 1) {
        props.setTriggerProperties(arr);
      } */
      props.setTriggerProperties(addedFields);
    } else {
      props.setTriggerProperties([]);
    }
  }, [addedFields]);

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
    if (addedFields.length > 1) {
      setAddedFields((prev) => {
        let newData = [...prev];
        newData.splice(index, 1);
        return newData;
      });
    } else {
      setAddedFields((prev) => {
        let newData = [...prev];
        newData.splice(index, 1);
        newData.push({ row_id: 1, field: null, value: null });
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
              newData[index].value = null;
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

  const dateAndTimeVarTypes = ["15", "16", "17", "18"];
  return (
    <React.Fragment>
      <div className={styles.propertiesColumnView}>
        <div className="flex alignCenter">
          <div className={styles.propertiesTriggerLabel}>
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
              id="pmweb_trigger_set_add_btn"
              aria-label={`${t("SET")} ${t("variable(s)")} ${t("add")}`}
            >
              {t("add")}
            </button>
          ) : null}
        </div>
        <div className={styles.setTriggerList}>
          {addedFields?.length > 0
            ? addedFields?.map((childField, index) => {
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
                      //removed variables of timeduration,NtExt type
                      triggerTypeOptions={allVariables
                        ?.filter(
                          (item) =>
                            !dateAndTimeVarTypes.includes(item.VariableType)
                        )
                        .filter(
                          (el) =>
                            el.VariableScope === USER_DEFINED_VARIABLE ||
                            el.VariableScope === COMPLEX_EXTENDED_VARIABLE
                        )}
                      setFieldValue={setFieldValue}
                      id={childField.row_id}
                      type="F"
                      value={childField.field}
                      setRowSelected={setRowSelected}
                      uniqueId="trigger_setKey_dropdown"
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
                      constantType={childField.field?.VariableType} // code added on 23 Nov 2022 for BugId 119550
                      uniqueId="trigger_setValue_dropdown"
                      isReadOnly={readOnlyProcess}
                    />
                    {rowSelected === childField.row_id &&
                    addedFields.length > 1 &&
                    !readOnlyProcess ? (
                      <div
                        onClick={() => deleteField(index)}
                        className={styles.triggerDeleteIcon}
                        id={`trigger_set_delete_${childField.row_id}`}
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

const mapDispatchToProps = (dispatch) => {
  return {
    setReload: (reload) =>
      dispatch(actionCreators.reload_trigger_fields(reload)),
    setTriggerProperties: (list) =>
      dispatch(actionCreators.setTrigger_properties(list)),
    setInitialValues: (value) =>
      dispatch(actionCreators.set_trigger_fields(value)),
    setTriggerEdited: (value) =>
      dispatch(actionCreators.is_trigger_definition_edited(value)),
  };
};

const mapStateToProps = (state) => {
  return {
    initialValues: state.triggerReducer.setDefaultValues,
    set: state.triggerReducer.Set,
    reload: state.triggerReducer.trigger_reload,
    openProcessType: state.openProcessClick.selectedType,
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(SetProperties);
