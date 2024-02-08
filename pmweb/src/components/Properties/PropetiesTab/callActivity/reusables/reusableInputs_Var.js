import React, { useEffect, useState } from "react";
import { MenuItem, Grid, makeStyles } from "@material-ui/core";
import DeleteIcon from "@material-ui/icons/Delete";
import "../../callActivity/commonCallActivity.css";
import { store, useGlobalState } from "state-pool";
import { connect } from "react-redux";
import CustomizedDropdown from "../../../../../UI/Components_With_ErrrorHandling/Dropdown";
import { Tooltip } from "@mui/material";
import { useTranslation } from "react-i18next";
import { RTL_DIRECTION } from "../../../../../Constants/appConstants";

const useStyles = makeStyles(() => ({
  flex: {
    display: "flex",
    alignItems: "center",
  },
}));
/*code edited on 6 Sep 2022 for BugId 115378 */
function ReusableInputs(props) {
  const { isReadOnly, index } = props;
  const loadedProcessData = store.getState("loadedProcessData");
  const [localLoadedProcessData] = useGlobalState(loadedProcessData);
  const [selectedMappingField, setSelectedMappingField] = useState(null);
  let { t } = useTranslation();
  const direction = `${t("HTML_DIR")}`;
  const classes = useStyles({ direction });

  useEffect(() => {
    setSelectedMappingField(props.variable.mappedFieldName);
  }, [props.variable]);

  return (
    <Grid container spacing={1}>
      <Grid item xs={5} className={classes.flex}>
        <div
          style={{
            padding:
              direction === RTL_DIRECTION
                ? "0px 14px 0px 0px"
                : "0px 0px 0px 14px",
          }}
        >
          <Tooltip title={props.variable.VarName}>
            <span
              style={{
                fontSize: "11px",
                width: "100%",
              }}
            >
              {props.variable.VarName}
            </span>
          </Tooltip>
        </div>
      </Grid>
      <Grid item xs={1} className={classes.flex} justifyContent="center">
        <div
          style={{
            textAlign: "center",
          }}
        >
          <span>=</span>
        </div>
      </Grid>
      <Grid item xs={5}>
        <CustomizedDropdown
          id={`pmweb_ReusableInputs_SelectMappingField_${index}`}
          ariaLabel="select Mapping Field"
          className="selectTwo_callActivity"
          onChange={(e) => {
            setSelectedMappingField(e.target.value);
            props.handleFieldMapping(props.variable, e.target.value);
          }}
          // changes done on 29-09-2023 for bugID: 138200
          style={{
            // width:
            //   window.innerWidth < 800 && props.isDrawerExpanded
            //     ? "26vw"
            //     : props.isDrawerExpanded
            //     ? "20.69vw"
            //     : window.innerWidth < 800
            //     ? "15.9vw"
            //     : "9.9vw",
            //     // till here for bugID: 138200
            width: "100%",
            border:
              (!selectedMappingField || selectedMappingField.trim() == "") &&
              props.showRedBorder
                ? "1px solid red"
                : null,
          }}
          relativeStyle={{ width: "100%" }}
          value={selectedMappingField}
          disabled={isReadOnly}
          hideDefaultSelect={true}
          isNotMandatory={true}
        >
          {localLoadedProcessData?.Variable?.filter((el) => {
            if (+el.VariableType === +props.variable.VarType) {
              return el;
            }
          })?.map((loadedVar) => {
            return (
              <MenuItem
                className="InputPairDiv_CommonList"
                value={loadedVar.VariableName}
              >
                {loadedVar.VariableName}
              </MenuItem>
            );
          })}
        </CustomizedDropdown>
      </Grid>
      <Grid item xs={1} className={classes.flex} justifyContent="flex-start">
        {!isReadOnly && (
          <Tooltip title={t("delete")}>
            <DeleteIcon
              ariaLabel="Delete Icon"
              id={`pmweb_ReusableInputs_DeleteVarFromList_${index}`}
              style={{
                cursor: "pointer",
                width: "1.5rem",
                height: "1.5rem",
                // width: props.isDrawerExpanded ? "3rem" : "2rem",
                // height: "1.5rem",
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
          </Tooltip>
        )}
      </Grid>
      {/* <div className="oneInputPairDiv_Common">
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
          <div
            style={{
              padding:
                direction === RTL_DIRECTION
                  ? "0px 14px 0px 0px"
                  : "0px 0px 0px 14px",
            }}
          >
            <Tooltip title={props.variable.VarName}>
              <span
                style={
                  {
                    // fontSize: "11px",
                    // width: props.isDrawerExpanded ? "281px" : "136px",
                    // padding: "0 8px",
                    //padding: "5px",
                  }
                }
              >
                {props.variable.VarName}
              </span>
            </Tooltip>
          </div>
        </div>
        <span
          style={{
            // width: props.isDrawerExpanded ? "53px" : "62px",
            // textAlign: "center",
            marginTop: "5px",
            flex: "0.2",
            textAlign: "center",
          }}
        >
          =
        </span>
        {/* Changes to resolve the bug ID 125561 */}
      {/* <div
          style={{
            flex: "1",
            overflow: "hidden",
          }}
        >
          <CustomizedDropdown
            id={`pmweb_ReusableInputs_SelectMappingField_${index}`}
            ariaLabel="select Mapping Field"
            className="selectTwo_callActivity"
            onChange={(e) => {
              setSelectedMappingField(e.target.value);
              props.handleFieldMapping(props.variable, e.target.value);
            }}
            // changes done on 29-09-2023 for bugID: 138200
            style={{
              // width:
              //   window.innerWidth < 800 && props.isDrawerExpanded
              //     ? "26vw"
              //     : props.isDrawerExpanded
              //     ? "20.69vw"
              //     : window.innerWidth < 800
              //     ? "15.9vw"
              //     : "9.9vw",
              //     // till here for bugID: 138200
              width: "100%",
              border:
                (!selectedMappingField || selectedMappingField.trim() == "") &&
                props.showRedBorder
                  ? "1px solid red"
                  : null,
            }}
            value={selectedMappingField}
            disabled={isReadOnly}
            hideDefaultSelect={true}
            isNotMandatory={true}
          >
            {localLoadedProcessData?.Variable?.filter((el) => {
              if (+el.VariableType === +props.variable.VarType) {
                return el;
              }
            })?.map((loadedVar) => {
              return (
                <MenuItem
                  className="InputPairDiv_CommonList"
                  value={loadedVar.VariableName}
                >
                  {loadedVar.VariableName}
                </MenuItem>
              );
            })}
          </CustomizedDropdown>
        </div>

        {!isReadOnly && (
          <Tooltip title={t("delete")}>
            <div style={{ marginTop: "9px", flex: "0.2" }}>
              <DeleteIcon
                ariaLabel="Delete Icon"
                id={`pmweb_ReusableInputs_DeleteVarFromList_${index}`}
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
      </div>  */}
    </Grid>
  );
}
const mapStateToProps = (state) => {
  return {
    isDrawerExpanded: state.isDrawerExpanded.isDrawerExpanded,
  };
};

export default connect(mapStateToProps, null)(ReusableInputs);
