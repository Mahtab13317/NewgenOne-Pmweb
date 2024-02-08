import React, { useEffect, useState } from "react";
import { Select, MenuItem, Grid, Tooltip, makeStyles } from "@material-ui/core";
import DeleteIcon from "@material-ui/icons/Delete";
import "./workStep.css";
import { store, useGlobalState } from "state-pool";
import { connect } from "react-redux";
import { useTranslation } from "react-i18next";
import { RTL_DIRECTION } from "../../../../Constants/appConstants";

const useStyles = makeStyles(() => ({
  flex: {
    display: "flex",
    alignItems: "center",
  },
  select: {
    "&$select": {
      paddingRight: (props) =>
        props.direction === RTL_DIRECTION ? "14px" : "1.75vw",
      paddingLeft: (props) =>
        props.direction === RTL_DIRECTION ? "1.75vw" : "14px",
    },
    "&::before": {
      display: "none",
    },
    "&::after": {
      display: "none",
    },
  },
  icon: {
    left: (props) => (props.direction === RTL_DIRECTION ? "0px" : "unset"),
    right: (props) => (props.direction === RTL_DIRECTION ? "unset" : "0px"),
  },
}));

/*code edited on 6 Sep 2022 for BugId 115378 */
function ReusableInputs(props) {
  let { t } = useTranslation();
  const direction = `${t("HTML_DIR")}`;
  const classes = useStyles({ direction });
  const { isReadOnly, index } = props;
  const loadedProcessData = store.getState("loadedProcessData");
  const [localLoadedProcessData] = useGlobalState(loadedProcessData);
  const [selectedMappingField, setSelectedMappingField] = useState(null);

  useEffect(() => {
    setSelectedMappingField(props?.variable?.mappedFieldName);
  }, [props.variable]);

  return (
    <>
      {/* <div className="oneInputPairDiv_Common">
      <Grid container  xs={12} justifyContent="space-between" maxWidth="93%">
        <Grid item xs={6}>
      <p
        style={{
          fontSize: "11px",
          // width: props.isDrawerExpanded ? "281px" : "136px",
          width: "100%",
          padding: "0 8px",
        }}
      >
        {props?.variable?.VarName}
      </p>
      </Grid>
      <Grid item xs={1}>
      <span
        style={{
          width: props.isDrawerExpanded ? "61px" : "25px",
          // textAlign: "center",
          alignItems: "center"
        }}
      >
        =
      </span>
      </Grid>
      <Grid item xs={5}>
      <Grid container xs={12} justifyContent="space-between" spacing={1}>
        <Grid item xs={10}>
      <Select
        className="selectTwo_callActivity"
        onChange={(e) => {
          setSelectedMappingField(e.target.value);
          props.handleFieldMapping(props.variable, e.target.value);
        }}
        id={`pmweb_ReusableInputs_Message_Forward_Mapping_${index}`}
        style={{
          width: props.isDrawerExpanded ? "100%" : "100%",
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
        {localLoadedProcessData?.Variable?.filter((el) => {
          if (+el.VariableType === +props?.variable?.VarType) {
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
      </Select>
      </Grid>
      <Grid item xs={2} >
      {!isReadOnly && (
        //Added tooltip on 08-10-2023 for bug Id:139104 
        <Tooltip title="Delete">
        <DeleteIcon
          style={{
            cursor: "pointer",
            width: props.isDrawerExpanded ? "3rem" : "2rem",
            height: "1.5rem",
          }}
          onClick={() => props.deleteVariablesFromList(props.variable)}
        />
        </Tooltip>
        //Till here for bug Id:139104 
      )}
      </Grid>
      </Grid>
      </Grid>
      
      </Grid>
    </div> */}
      {
        // Modified on 08/10/2023, bug_id:135147
      }
      <Grid item xs={5} className={classes.flex}>
        <div
          style={{
            padding:
              direction === RTL_DIRECTION
                ? "0px 14px 0px 0px"
                : "0px 0px 0px 14px",
          }}
        >
          <p
            style={{
              fontSize: "11px",
              width: "100%",
              //width: props.isDrawerExpanded ? "281px" : "136px",
              //padding: "0 8px",
            }}
          >
            {props?.variable?.VarName}
          </p>
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
        <div>
          <Select
            className="selectTwo_callActivity"
            /*Added classes to flip the dropdown in case of Arabic*/
            classes={{ icon: classes.icon, select: classes.select }}
            onChange={(e) => {
              setSelectedMappingField(e.target.value);
              props.handleFieldMapping(props.variable, e.target.value);
            }}
            id={`pmweb_ReusableInputs_Message_Forward_Mapping_${index}`}
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
            {localLoadedProcessData?.Variable?.filter((el) => {
              if (+el.VariableType === +props?.variable?.VarType) {
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
          </Select>
        </div>
      </Grid>

      <Grid item xs={1} className={classes.flex} justifyContent="flex-start">
        {!isReadOnly && (
          //Added tooltip on 08-10-2023 for bug Id:139104
          <Tooltip title={t("delete")}>
            <DeleteIcon
              style={{
                cursor: "pointer",
                width: "1.5rem",
                height: "1.5rem",
              }}
              onClick={() => props.deleteVariablesFromList(props.variable)}
            />
          </Tooltip>
          //Till here for bug Id:139104
        )}
      </Grid>
      {
        //till her for bug_id:135147
      }
    </>
  );
}
const mapStateToProps = (state) => {
  return {
    isDrawerExpanded: state.isDrawerExpanded.isDrawerExpanded,
  };
};

export default connect(mapStateToProps, null)(ReusableInputs);
