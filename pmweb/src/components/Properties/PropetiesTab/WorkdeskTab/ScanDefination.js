import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import styles from "../../../ProcessSettings/Trigger/Properties/properties.module.css";
import style from "./scan.module.css";
import { connect } from "react-redux";
import * as actionCreators from "../../../../redux-store/actions/Trigger";
import { store, useGlobalState } from "state-pool";
import CloseIcon from "@material-ui/icons/Close";
import { PROCESSTYPE_REGISTERED } from "../../../../Constants/appConstants";
import ScanRule from "./ScanRule";
import { LatestVersionOfProcess } from "../../../../utility/abstarctView/checkLatestVersion";

function SetProperties(props) {
  const loadedProcessData = store.getState("loadedProcessData");
  const [localLoadedProcessData] = useGlobalState(loadedProcessData);
  let { t } = useTranslation();
  const [addedFields, setAddedFields] = useState([
    { row_id: 1, field: null, value: null },
  ]);
  const [fieldValue, setFieldValue] = useState();
  const [isEdited, setIsEdited] = useState(false);
  let readOnlyProcess =
    props.isReadOnly ||
    props.openProcessType === PROCESSTYPE_REGISTERED ||
    props.openProcessType === "RC" ||
    LatestVersionOfProcess(localLoadedProcessData?.Versions) !==
      +localLoadedProcessData?.VersionNo; // modified on 05/09/2023 for BugId 136103;

  useEffect(() => {
    if (props.selectedDoc?.scanActionList?.length > 0) {
      let tempFields = [];
      props.selectedDoc?.scanActionList?.forEach((doc, index) => {
        let field = localLoadedProcessData?.Variable?.filter((el) => {
          if (el.VariableName == doc.param1) {
            return el;
          }
        })[0];
        // code edited on 19 Sep 2022 for BugId 115558
        let fieldValue =
          doc.varScope2 === "C"
            ? {
                VariableName: doc.param2,
                ExtObjectId: doc.extObjID2,
                VariableType: doc.type2,
                VariableScope: doc.varScope2,
                VariableId: doc.variableId_2,
                constant: true,
              }
            : localLoadedProcessData?.Variable?.filter((el) => {
                if (el.VariableName == doc.param2) {
                  return el;
                }
              })[0];
        tempFields.push({ row_id: index + 1, field: field, value: fieldValue });
      });
      setAddedFields(tempFields);
    }
  }, [props.selectedDoc]);

  const okHandler = () => {
    if (addedFields && addedFields.length > 0) {
      let arr = addedFields.filter((child) => {
        if (child.field && child.value) {
          return { field: child.field, value: child.value };
        }
      });
      if (arr.length >= 1) {
        props.selectedScanActionHandler(arr, isEdited);
      }
    } else {
      props.selectedScanActionHandler([], isEdited);
    }
  };

  const addNewField = () => {
    setIsEdited(true);
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
    setIsEdited(true);
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
                  VariableFieldId: "0",
                  VariableScope: "C",
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

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      okHandler();
      e.stopPropagation();
    }

    if (e.keyCode === 27) {
      props.setopenModal(null);
    }
  };

  React.useEffect(() => {
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);

  return (
    <React.Fragment>
      <div className={style.modalHeader}>
        <h5 className={style.modalHeading}>{t("scanAction")}</h5>
        <CloseIcon
          onClick={props.modalClosed}
          className={style.closeIcon}
          id="pmweb_workdesk_scanDef_closeIcon"
          tabIndex={0}
          onKeyDown={props.onKeyDown}
        />
      </div>
      <div className={style.modalBody}>
        <div className="flex alignCenter">
          <div className={styles.propertiesTriggerLabel}>
            {t("SET")} {t("variable(s)")}
            <span className={styles.starIcon}>*</span>
          </div>
          {!readOnlyProcess ? (
            <button
              className={styles.addSetTrigger}
              onClick={addNewField}
              id="pmweb_trigger_set_add_btn"
            >
              {t("add")}
            </button>
          ) : null}
        </div>
        <div className={style.variableList}>
          {addedFields?.length > 0
            ? addedFields?.map((childField, index) => {
                return (
                  <ScanRule
                    childField={childField}
                    index={index}
                    readOnlyProcess={readOnlyProcess}
                    deleteField={deleteField}
                    setFieldValue={setFieldValue}
                    setIsEdited={setIsEdited}
                  />
                );
              })
            : null}
        </div>
      </div>
      <div className={style.modalFooter}>
        <button
          className={style.cancelButton}
          onClick={() => props.setopenModal(null)}
          id="pmweb_scandef_cancel"
        >
          {t("cancel")}
        </button>
        <button
          className={style.okButton}
          onClick={okHandler}
          id="pmweb_scandef_OK"
          onKeyUp={(e) => handleKeyDown(e)}
        >
          {t("ok")}
        </button>
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
