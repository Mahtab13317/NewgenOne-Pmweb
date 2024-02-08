import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import styles from "../../../ProcessSettings/Trigger/Properties/properties.module.css";
import { connect } from "react-redux";
import * as actionCreators from "../../../../redux-store/actions/Trigger";
import DataDropDown from "../../../ProcessSettings/Trigger/Properties/Components/DataDropDown";
import deleteIcon from "../../../../assets/subHeader/delete.svg";
import { store, useGlobalState } from "state-pool";

function ScanRule(props) {
  const {
    childField,
    index,
    readOnlyProcess,
    deleteField,
    setFieldValue,
    setIsEdited,
  } = props;
  const loadedProcessData = store.getState("loadedProcessData");
  const [localLoadedProcessData] = useGlobalState(loadedProcessData);
  let { t } = useTranslation();
  const [rowSelected, setRowSelected] = useState(null);
  const [fieldDropdown, setFieldDropdown] = useState([]);
  const [valueDropdown, setValueDropdown] = useState([]);

  useEffect(() => {
    setFieldDropdown(localLoadedProcessData?.Variable);
  }, [localLoadedProcessData?.Variable]);

  const setValueDropdownFunc = (type) => {
    let tempList = [...localLoadedProcessData?.Variable];
    tempList = tempList.filter((el) => el.VariableType === type);
    setValueDropdown(tempList);
  };

  return (
    <div
      onMouseEnter={() => setRowSelected(childField.row_id)}
      onMouseLeave={() => setRowSelected(null)}
      className={`${styles.setTriggerDropDowns} flex`}
      style={{
        backgroundColor:
          rowSelected === childField.row_id ? "#F0F0F0" : "white",
        width: "100%",
      }}
    >
      <div>
        <DataDropDown
          triggerTypeOptions={fieldDropdown}
          setFieldValue={(val) => {
            setFieldValue(val);
            setIsEdited(true);
          }}
          id={childField.row_id}
          type="F"
          value={childField.field}
          setRowSelected={setRowSelected}
          setValueDropdownFunc={setValueDropdownFunc}
          uniqueId="trigger_setKey_dropdown"
        />
      </div>
      <span className={styles.triggerEqualTo}>=</span>
      <div>
        <DataDropDown
          triggerTypeOptions={valueDropdown}
          setFieldValue={(val) => {
            setFieldValue(val);
            setIsEdited(true);
          }}
          id={childField.row_id}
          type="V"
          value={childField.value}
          setRowSelected={setRowSelected}
          constantAdded={true}
          constantType={childField.field?.VariableType}
          uniqueId="trigger_setValue_dropdown"
        />
      </div>
      {rowSelected === childField.row_id && !readOnlyProcess ? (
        <div
          onClick={() => {
            setRowSelected(null);
            deleteField(index);
          }}
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              setRowSelected(null);
              deleteField(index);
              e.stopPropagation();
            }
          }}
          className={styles.triggerDeleteIcon}
          id={`trigger_set_delete_${childField.row_id}`}
        >
          <img
            src={deleteIcon}
            width="16px"
            height="16px"
            title="Delete"
            alt={t("DELETE")}
          />
        </div>
      ) : (
        ""
      )}
    </div>
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

export default connect(mapStateToProps, mapDispatchToProps)(ScanRule);
