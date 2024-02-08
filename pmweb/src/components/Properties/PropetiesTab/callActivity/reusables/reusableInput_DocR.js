import React, { useEffect, useState } from "react";
import { MenuItem, Tooltip } from "@material-ui/core";
import DeleteIcon from "@material-ui/icons/Delete";
import "../../callActivity/commonCallActivity.css";
import { store, useGlobalState } from "state-pool";
import { connect, useDispatch } from "react-redux";
import { propertiesLabel } from "../../../../../Constants/appConstants";
import { setActivityPropertyChange } from "../../../../../redux-store/slices/ActivityPropertyChangeSlice";
import CustomizedDropdown from "../../../../../UI/Components_With_ErrrorHandling/Dropdown";
import { useTranslation } from "react-i18next";

/*code edited on 6 Sep 2022 for BugId 115378 */
function ReusableInputs_Reverse(props) {
  const { isReadOnly, index } = props;
  const dispatch = useDispatch();
  const [loadedVariables, setLoadedVariables] = useState(null);
  const [selectedMappingField, setSelectedMappingField] = useState(null);
  const loadedActivityPropertyData = store.getState("activityPropertyData");
  const [localLoadedActivityPropertyData, setlocalLoadedActivityPropertyData] =
    useGlobalState(loadedActivityPropertyData);
  let { t } = useTranslation();

  const handleFieldMapping = (document, event) => {
    setSelectedMappingField(event.target.value);
    let forwardMapArr = [];
    let tempLocalState = { ...localLoadedActivityPropertyData };
    props.docList.forEach((doc) => {
      forwardMapArr.push({
        ...doc,
        mappedFieldName:
          doc.DocName === document.DocName
            ? event.target.value
            : doc.mappedFieldName,
      });
    });
    tempLocalState?.ActivityProperty?.SubProcess?.revDocMapping?.map(
      (el, idx) => {
        if (el.importedFieldName === document.DocName) {
          tempLocalState.ActivityProperty.SubProcess.revDocMapping[idx] = {
            ...el,
            mappedFieldName: event.target.value,
            m_bSelected: true,
          };
        }
      }
    );
    props.setDocList(forwardMapArr);
    setlocalLoadedActivityPropertyData(tempLocalState);
    dispatch(
      setActivityPropertyChange({
        [propertiesLabel.revDocMapping]: { isModified: true, hasError: false },
      })
    );
  };

  useEffect(() => {
    setSelectedMappingField(props.document.mappedFieldName);
  }, [props.document]);

  useEffect(() => {
    setLoadedVariables(props.targetDocList);
  }, [props.targetDocList]);

  return (
    <div className="oneInputPairDiv_Common">
      <div
        style={{
          flex: "1",
          height: "36px",
          borderRadius: "1px",
          opacity: "1",
          fontSize: "12px",
          padding: "5px",
          textOverflow: "ellipsis",
          overflow: "hidden",
          whiteSpace: "nowrap",
        }}
      >
        <Tooltip title={props.document.DocName}>
          <span
            style={{
              // fontSize: "11px",
              // width: props.isDrawerExpanded ? "281px" : "136px",
              // padding: "0 8px",
              padding: "5px",
            }}
          >
            {props.document.DocName}
          </span>
        </Tooltip>
      </div>

      <span
        style={{
          marginTop: "5px",
          flex: "0.2",
          textAlign: "center",
        }}
      >
        =
      </span>
      <div
        style={{
          flex: "1",
          overflow: "hidden",
        }}
      >
        <CustomizedDropdown
          id={`pmweb_ReusableInputDocR_FieldMapping_${index}`}
          className="selectTwo_callActivity"
          ariaLabel="Select mapping field"
          onChange={(e) => handleFieldMapping(props.document, e)}
          style={{
            width: "100%",
            border:
              (!selectedMappingField || selectedMappingField.trim() == "") &&
              props.showRedBorder
                ? "1px solid red"
                : null,
          }}
          value={selectedMappingField}
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
          }}
          disabled={isReadOnly}
        >
          {loadedVariables?.map((loadedVar) => {
            return (
              <MenuItem
                className="InputPairDiv_CommonList"
                value={loadedVar.DocName}
              >
                {loadedVar.DocName}
              </MenuItem>
            );
          })}
        </CustomizedDropdown>
      </div>

      {!isReadOnly && (
        <Tooltip title={t("delete")}>
          <div style={{ marginTop: "9px", flex: "0.2" }}>
            <DeleteIcon
              aria-label="Delete Icon"
              id={`pmweb_ReusableInputDocR_DeleteVarFromList_${index}`}
              style={{
                cursor: "pointer",
                width: props.isDrawerExpanded ? "3rem" : "2rem",
                height: "1.5rem",
              }}
              onClick={() => props.deleteVariablesFromList(props.document)}
              tabIndex={0}
              onKeyUp={(e) => {
                if (e.key === "Enter") {
                  props.deleteVariablesFromList(props.document);
                  e.stopPropagation();
                }
              }}
            />
          </div>
        </Tooltip>
      )}
    </div>
  );
}
const mapStateToProps = (state) => {
  return {
    isDrawerExpanded: state.isDrawerExpanded.isDrawerExpanded,
  };
};

export default connect(mapStateToProps, null)(ReusableInputs_Reverse);
