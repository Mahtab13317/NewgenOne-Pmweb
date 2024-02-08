import React, { useEffect, useState } from "react";
import { Select, MenuItem, Grid, makeStyles, Tooltip } from "@material-ui/core";
import DeleteIcon from "@material-ui/icons/Delete";
import "../../../PropetiesTab/callActivity/commonCallActivity.css";
import { store, useGlobalState } from "state-pool";
import { connect, useDispatch } from "react-redux";
import { setActivityPropertyChange } from "../../../../../redux-store/slices/ActivityPropertyChangeSlice";
import {
  RTL_DIRECTION,
  propertiesLabel,
} from "../../../../../Constants/appConstants";
import { useTranslation } from "react-i18next";

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
  const { isReadOnly, index } = props;
  let { t } = useTranslation();
  const direction = `${t("HTML_DIR")}`;
  const classes = useStyles({ direction });
  const dispatch = useDispatch();
  const loadedProcessData = store.getState("loadedProcessData");
  const [localLoadedProcessData] = useGlobalState(loadedProcessData);
  const [selectedMappingField, setSelectedMappingField] = useState(null);
  const loadedVariables = localLoadedProcessData?.DocumentTypeList;
  const loadedActivityPropertyData = store.getState("activityPropertyData");
  const [localLoadedActivityPropertyData, setlocalLoadedActivityPropertyData] =
    useGlobalState(loadedActivityPropertyData);

  const handleFieldMapping = (document, event) => {
    setSelectedMappingField(event.target.value);
    let forwardMapArr = [];
    let tempLocalState = JSON.parse(
      JSON.stringify(localLoadedActivityPropertyData)
    );
    props.docList.forEach((doc) => {
      forwardMapArr.push({
        ...doc,
        mappedFieldName:
          doc.DocName === document.DocName
            ? event.target.value
            : doc.mappedFieldName,
      });
    });
    tempLocalState?.ActivityProperty?.pMMessageEnd?.m_arrFwdDocMapping?.map(
      (el, idx) => {
        if (el.importedFieldName === document.DocName) {
          tempLocalState.ActivityProperty.pMMessageEnd.m_arrFwdDocMapping[idx] =
            {
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
        [propertiesLabel.fwdDocMapping]: { isModified: true, hasError: false },
      })
    );
  };

  useEffect(() => {
    setSelectedMappingField(props.document.mappedFieldName);
  }, [props.document]);

  return (
    <>
      {/*  <div className="oneInputPairDiv_Common">
      <p
        style={{
          fontSize: "11px",
          width: props.isDrawerExpanded ? "281px" : "136px",
          padding: "0 8px",
        }}
      >
        {props.document.DocName}
      </p>
      <span
        style={{
          width: props.isDrawerExpanded ? "61px" : "25px",
          textAlign: "center",
        }}
      >
        =
      </span>
      <Select
        className="selectTwo_callActivity"
        onChange={(e) => handleFieldMapping(props.document, e)}
        style={{
          width: props.isDrawerExpanded ? "280px" : "135px",
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
        {loadedVariables.map((loadedVar) => {
          return (
            <MenuItem
              className="InputPairDiv_CommonList"
              value={loadedVar.DocName}
            >
              {loadedVar.DocName}
            </MenuItem>
          );
        })}
      </Select>
      {!isReadOnly && (
       <Tooltip title={t("delete")}>
          <DeleteIcon
            style={{
              cursor: "pointer",
              width: props.isDrawerExpanded ? "3rem" : "2rem",
              height: "1.5rem",
            }}
            onClick={() => props.deleteVariablesFromList(props.document)}
          />
        </Tooltip>
      )}
    </div> */}
      {
        // Modified on 08/10/2023, bug_id:135147
      }
      {/* <div className="oneInputPairDiv_Common">
        <Grid container xs={12} justifyContent="space-between" maxWidth="93%">
          <Grid item xs={6}>
            <p
              style={{
                fontSize: "11px",
                // width: props.isDrawerExpanded ? "281px" : "136px",
                width: "100%",
                padding: "0 8px",
              }}
            >
              {props.document.DocName}
            </p>
          </Grid>
          <Grid item xs={1}>
            <span
              style={{
                width: props.isDrawerExpanded ? "61px" : "25px",
                // textAlign: "center",
                alignItems: "center",
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
                  id={`pmweb_ReusableInputs_Message_Doc_Mapping_${index}`}
                  onChange={(e) => handleFieldMapping(props.document, e)}
                  style={{
                    width: props.isDrawerExpanded ? "100%" : "100%",
                    border:
                      (!selectedMappingField ||
                        selectedMappingField.trim() == "") &&
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
                  {loadedVariables.map((loadedVar) => {
                    return (
                      <MenuItem
                        className="InputPairDiv_CommonList"
                        value={loadedVar.DocName}
                      >
                        {loadedVar.DocName}
                      </MenuItem>
                    );
                  })}
                </Select>
              </Grid>
              <Grid item xs={2}>
                {!isReadOnly && (
                  <DeleteIcon
                    style={{
                      cursor: "pointer",
                      width: props.isDrawerExpanded ? "3rem" : "2rem",
                      height: "1.5rem",
                    }}
                    onClick={() =>
                      props.deleteVariablesFromList(props.document)
                    }
                  />
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
              // width: props.isDrawerExpanded ? "281px" : "136px",
              width: "100%",
              //padding: "0 8px",
            }}
          >
            {props.document.DocName}
          </p>
        </div>
      </Grid>

      {/*Bug 138354:-  Added few styles*/}
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
        <Select
          className="selectTwo_callActivity"
          /*Bug 138354:-  Added classes to flip the dropdown in case of Arabic*/
          classes={{ icon: classes.icon, select: classes.select }}
          id={`pmweb_ReusableInputs_Message_Doc_Mapping_${index}`}
          onChange={(e) => handleFieldMapping(props.document, e)}
          style={{
            width: props.isDrawerExpanded ? "100%" : "100%",
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
          {loadedVariables.map((loadedVar) => {
            return (
              <MenuItem
                className="InputPairDiv_CommonList"
                value={loadedVar.DocName}
              >
                {loadedVar.DocName}
              </MenuItem>
            );
          })}
        </Select>
      </Grid>

      {/*Bug 138354:-  Added few styles*/}
      <Tooltip title={t("delete")}>
        <Grid item xs={1} className={classes.flex} justifyContent="flex-start">
          {!isReadOnly && (
            <DeleteIcon
              style={{
                cursor: "pointer",
                //width: props.isDrawerExpanded ? "3rem" : "2rem",
                width: "1.5rem",
                height: "1.5rem",
              }}
              onClick={() => props.deleteVariablesFromList(props.document)}
            />
          )}
        </Grid>
      </Tooltip>
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
