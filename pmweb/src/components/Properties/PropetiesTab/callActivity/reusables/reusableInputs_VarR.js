import React, { useEffect, useState } from "react";
import { MenuItem, Tooltip } from "@material-ui/core";
import DeleteIcon from "@material-ui/icons/Delete";
import "../../callActivity/commonCallActivity.css";
import { connect } from "react-redux";
import CustomizedDropdown from "../../../../../UI/Components_With_ErrrorHandling/Dropdown/index";
import { useTranslation } from "react-i18next";

/*code edited on 6 Sep 2022 for BugId 115378 */
function ReusableInputs(props) {
  const { isReadOnly, index } = props;
  const [loadedVariables, setLoadedVariables] = useState([]);
  const [selectedMappingField, setSelectedMappingField] = useState(null);
  let { t } = useTranslation();

  useEffect(() => {
    //Modified on 12/07/2023, bug_id:132117
    // setSelectedMappingField(props.variable.mappedFieldName);
    setSelectedMappingField(props.variable.importedFieldName);
  }, [props?.variable]);

  useEffect(() => {
    //Modified on 12/07/2023, bug_id:132117
    //setLoadedVariables(props.targetProcessVarList);

    let tempTarget = [];

    if (props?.variable?.importedFieldDataType) {
      tempTarget = props?.targetProcessVarList?.filter(
        (d) => +d.VarType === +props.variable.importedFieldDataType
      );
    } else {
      tempTarget = props?.targetProcessVarList?.filter(
        (d) => +d.VarType === +props.variable.VariableType
      );
    }
    setLoadedVariables(tempTarget);
  }, [props?.targetProcessVarList]);

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
        <Tooltip title={props.variable.VariableName}>
          <span
            style={{
              // fontSize: "11px",
              // width: props.isDrawerExpanded ? "281px" : "136px",
              // padding: "0 8px",
              padding: "5px",
            }}
          >
            {props.variable.VariableName}
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
          id={`pmweb_ReusableInputsVarR_SelectMappingField_${index}`}
          className="selectTwo_callActivity"
          ariaLabel="Select Mapping field"
          onChange={(e) => {
            setSelectedMappingField(e.target.value);
            props.handleFieldMapping(props?.variable, e.target.value);
          }}
          style={{
            width: "100%",
            border:
              (!selectedMappingField || selectedMappingField.trim() == "") &&
              props.showRedBorder
                ? "1px solid red"
                : null,
          }}
          value={selectedMappingField}
          disabled={isReadOnly}
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
        >
          {
            //Modified on 12/07/2023, bug_id:132117
            /*  {
          props.targetProcessVarList
          ?.filter((el) => {
            //if (+el.VarType === +props.variable.VariableType) {
              if (+el.VarType === +props?.variable?.importedFieldDataType) {
              return el;
            }
          })
          ?.map((loadedVar) => {
            return (
              <MenuItem
                className="InputPairDiv_CommonList"
                value={loadedVar.VarName}
              >
                {loadedVar.VarName}
              </MenuItem>
            );
          })} */
          }
          {loadedVariables?.map((loadedVar, i) => {
            return (
              <MenuItem
                className="InputPairDiv_CommonList"
                value={loadedVar.VarName}
              >
                {loadedVar.VarName}
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
              id={`pmweb_ReusableInputsVarR_DeleteVarFromList_${index}`}
              style={{
                cursor: "pointer",
                width: props.isDrawerExpanded ? "3rem" : "2rem",
                height: "1.5rem",
              }}
              onClick={() => props.deleteVariablesFromList(props.variable)}
              tabIndex={0}
              onKeyUp={(e) => {
                if (e.key === "Enter") {
                  props.deleteVariablesFromList(props.variable);
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

export default connect(mapStateToProps, null)(ReusableInputs);
