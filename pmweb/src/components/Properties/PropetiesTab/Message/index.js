import {
  Checkbox,
  FormControlLabel,
  FormGroup,
  Tooltip,
} from "@material-ui/core";
import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import styles from "./index.module.css";
import axios from "axios";
import {
  headerHeight,
  propertiesLabel,
  SERVER_URL,
} from "../../../../Constants/appConstants";
import { store, useGlobalState } from "state-pool";
import { connect, useDispatch, useSelector } from "react-redux";
import { setActivityPropertyChange } from "../../../../redux-store/slices/ActivityPropertyChangeSlice";
import {
  isReadOnlyFunc,
  shortenRuleStatement,
} from "../../../../utility/CommonFunctionCall/CommonFunctionCall";
import { LatestVersionOfProcess } from "../../../../utility/abstarctView/checkLatestVersion";
import TabsHeading from "../../../../UI/TabsHeading";

function Message(props) {
  let { t } = useTranslation();
  const dispatch = useDispatch();
  const loadedProcessData = store.getState("loadedProcessData");
  const localActivityPropertyData = store.getState("activityPropertyData");
  const [localLoadedProcessData] = useGlobalState(loadedProcessData);
  const [localLoadedActivityPropertyData, setlocalLoadedActivityPropertyData] =
    useGlobalState(localActivityPropertyData);
  const [searchVariables, setsearchVariables] = useState([]);
  const [allCheckedBool, setallCheckedBool] = useState(false);
  // changes added for bug_id: 134226
  const windowInnerHeight = useSelector(
    (state) => state.setWindowInnerHeight.windowInnerHeight
  );
  const [webServiceLocation, setwebServiceLocation] = useState(
    t("webServiceLocationNotDefined")
  );
  const [isDisabled, setisDisabled] = useState(false);
  let isReadOnly =
    props.openTemplateFlag ||
    isReadOnlyFunc(
      localLoadedProcessData,
      props.cellCheckedOut,
      props.cellLaneId
    ) ||
    LatestVersionOfProcess(localLoadedProcessData?.Versions) !==
      +localLoadedProcessData?.VersionNo; // modified on 05/09/2023 for BugId 136103

  useEffect(() => {
    const getSearchVariables = async () => {
      const res = await axios.get(
        SERVER_URL +
          `/searchVar?processDefId=${localLoadedProcessData.ProcessDefId}&processState=${localLoadedProcessData.ProcessType}`
      );
      setsearchVariables(res.data?.SearchVariable);
    };
    getSearchVariables();
  }, []);

  useEffect(() => {
    if (
      localLoadedActivityPropertyData?.ActivityProperty.hasOwnProperty(
        "msgInfo"
      )
    ) {
      let actArr =
        localLoadedActivityPropertyData?.ActivityProperty.msgInfo.msgVarList.map(
          (_var) => _var.processVarInfo.variableId
        );
      let searchArr = searchVariables.map((_var) => _var.VariableId);

      //Modified on 30/07/2023, bug_id:130914

      /*  if (arrayCompare(actArr, searchArr)) {
        setallCheckedBool(true);
      } */

      let commonArr = actArr.filter(function (n) {
        return searchArr.indexOf(n) !== -1;
      });

      if (arrayCompare(actArr, searchArr)) {
        setallCheckedBool(true);
      } else {
        if (commonArr?.length === searchArr.length) {
          if (arrayCompare(commonArr, searchArr)) {
            setallCheckedBool(true);
          }
        }
      }
      setwebServiceLocation(
        localLoadedActivityPropertyData?.ActivityProperty.msgInfo.webServiceURL
      );
    }
    if (localLoadedProcessData.ProcessType === "R") {
      setisDisabled(true);
    }
  }, [searchVariables]);

  const getCheckHandler = (varData) => {
    let temp = false;
    if (
      localLoadedActivityPropertyData?.ActivityProperty.hasOwnProperty(
        "msgInfo"
      )
    ) {
      localLoadedActivityPropertyData?.ActivityProperty?.msgInfo?.msgVarList.forEach(
        (_var) => {
          if (_var?.processVarInfo.variableId == varData.VariableId)
            temp = true;
        }
      );
    }

    return temp;
  };

  const checkChangeHandler = (e, varData) => {
    let temp = global.structuredClone(localLoadedActivityPropertyData);

    if (!temp.ActivityProperty.hasOwnProperty("msgInfo")) {
      let msgInfo = {
        msgVarList: [],

        webServiceURL: t("WebServiceLocationUndefinedErr"),

        msgVarMap: {},
      };

      temp.ActivityProperty.msgInfo = msgInfo;
    }

    if (e.target.checked) {
      temp.ActivityProperty.msgInfo.msgVarList.push({
        isSelected: true,

        processVarInfo: {
          varName: varData.FieldName,

          variableId: varData.VariableId,

          varFieldId: "0",
        },
      });
    } else {
      temp.ActivityProperty.msgInfo.msgVarList.forEach((_var, index) => {
        if (_var.processVarInfo.variableId == varData.VariableId) {
          temp.ActivityProperty.msgInfo.msgVarList.splice(index, 1);
        }
      });
    }
    checkforAllChecked(temp.ActivityProperty.msgInfo.msgVarList);
    setlocalLoadedActivityPropertyData(temp);
    enableSaveBtn();
  };

  const enableSaveBtn = () => {
    dispatch(
      setActivityPropertyChange({
        [propertiesLabel.message]: {
          isModified: true,
          hasError: false,
        },
      })
    );
  };

  const allCheckHandler = (e) => {
    setallCheckedBool(e.target.checked);
    let temp = global.structuredClone(localLoadedActivityPropertyData);
    if (!temp.ActivityProperty.hasOwnProperty("msgInfo")) {
      let msgInfo = {
        msgVarList: [],

        webServiceURL: t("WebServiceLocationUndefinedErr"),

        msgVarMap: {},
      };

      temp.ActivityProperty.msgInfo = msgInfo;
    }
    if (e.target.checked) {
      temp.ActivityProperty.msgInfo.msgVarList = [];
      searchVariables.forEach((_var) => {
        temp.ActivityProperty.msgInfo.msgVarList.push({
          isSelected: true,

          processVarInfo: {
            varName: _var.FieldName,

            variableId: _var.VariableId,

            varFieldId: "0",
          },
        });
      });
    } else {
      temp.ActivityProperty.msgInfo.msgVarList = [];
    }
    checkforAllChecked(temp.ActivityProperty.msgInfo.msgVarList);
    setlocalLoadedActivityPropertyData(temp);
    enableSaveBtn();
  };

  const checkforAllChecked = (arr) => {
    let actArr = arr.map((_var) => _var.processVarInfo.variableId);
    let searchArr = searchVariables.map((_var) => _var.VariableId);

    //Modified on 30/07/2023, bug_id:130914

    /*  if (arrayCompare(actArr, searchArr)) {
      setallCheckedBool(true);
    } else setallCheckedBool(false); */

    let commonArr = actArr.filter(function (n) {
      return searchArr.indexOf(n) !== -1;
    });

    if (commonArr?.length === searchArr.length) {
      if (arrayCompare(commonArr, searchArr)) {
        setallCheckedBool(true);
      } else setallCheckedBool(false);
    } else {
      if (arrayCompare(actArr, searchArr)) {
        setallCheckedBool(true);
      } else setallCheckedBool(false);
    }
  };

  const arrayCompare = (_arr1, _arr2) => {
    if (
      !Array.isArray(_arr1) ||
      !Array.isArray(_arr2) ||
      _arr1.length !== _arr2.length
    ) {
      return false;
    } else if (_arr1.length === 0 || _arr2.length === 0) return false;

    // .concat() to not mutate arguments
    const arr1 = _arr1.concat().sort();
    const arr2 = _arr2.concat().sort();

    /* for (let i = 0; i < arr1.length; i++) {
      if (arr1[i] !== arr2[i]) {
        return false;
      }
    }*/
    //return true;

    const isDifferent = arr1.some((item, i) => item !== arr2[i]);
    return isDifferent ? false : true;
  };

  return (
    <div
      className={styles.mainDiv}
      /* code added on 6 July 2023 for issue - save and discard button hide 
        issue in case of tablet(landscape mode)*/
      style={{
        height: `calc((${windowInnerHeight}px - ${headerHeight}) - 9rem)`,
      }}
    >
      <TabsHeading heading={props?.heading} />
      {/* <div className="headingSectionTab">{<h4>{props?.heading}</h4>}</div> */}
      <div className={styles.row}>
        <p className={styles.heading}>{t("webserviceLocation")}</p>
        <input
          aria-label={`${webServiceLocation}`}
          type="text"
          value={webServiceLocation}
          disabled={true}
          style={{
            width: props.isDrawerExpanded ? "30%" : "100%",
            height: "var(--line_height)",
          }}
        />
      </div>

      <div
        className={
          props.isDrawerExpanded ? styles.varRow : styles.varRowCollapse
        }
      >
        <p className={styles.heading} style={{ flex: "1" }}>
          {t("variable(s)")}
        </p>
        <div
          style={{
            display: "flex",
            justifyContent: "flex-start",
            flexDirection: "row",
            flex: "0.5",
            alignItems: "center",
          }}
        >
          <FormGroup>
            <FormControlLabel
              label={
                <span
                  className={styles.heading}
                  style={{ marginInline: "0.5rem" }}
                >
                  {t("search")}
                </span>
              }
              control={
                <Checkbox
                  checked={allCheckedBool}
                  onChange={allCheckHandler}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      allCheckHandler();
                      e.stopPropagation();
                    }
                  }}
                  disabled={isDisabled || isReadOnly}
                />
              }
            />
          </FormGroup>
        </div>
      </div>

      {/*dynamic search variable are below */}
      <div className={styles.variableContainer}>
        {searchVariables?.map((_var) => {
          return (
            <div
              className={
                props.isDrawerExpanded ? styles.varRow : styles.varRowCollapse
              }
            >
              <p
                className={styles.heading}
                style={{ fontWeight: "500", flex: "1" }}
              >
                <Tooltip title={_var.FieldName} placement="bottom-start">
                  <span
                    style={{
                      fontSize: "var(--base_text_font_size)",
                      marginTop: "4px",
                      overflow: "hidden",
                      whiteSpace: "nowrap",
                      textOverflow: "ellipsis",
                      width: "90%",
                    }}
                  >
                    {props.isDrawerExpanded
                      ? _var.FieldName
                      : shortenRuleStatement(_var.FieldName, 13)}
                  </span>
                </Tooltip>
              </p>
              <div
                style={{
                  display: "flex",
                  justifyContent: "flex-start",
                  flexDirection: "row",
                  flex: "0.5",
                  alignItems: "center",
                }}
              >
                <FormGroup>
                  <FormControlLabel
                    label={
                      <span
                        className={styles.heading}
                        style={{ marginInline: "0.5rem" }}
                      ></span>
                    }
                    control={
                      <Checkbox
                        checked={getCheckHandler(_var)}
                        onChange={(e) => checkChangeHandler(e, _var)}
                        disabled={isDisabled || isReadOnly}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            checkChangeHandler(e, _var);
                            e.stopPropagation();
                          }
                        }}
                      />
                    }
                  />
                </FormGroup>
              </div>
            </div>
          );
        })}
      </div>

      {/* <div className={styles.variableContainer}>
        {searchVariables.map((_var) => {
          return (
            <div
              className={
                props.isDrawerExpanded ? styles.varRow : styles.varRowCollapse
              }
            >
              <p
                className={styles.heading}
                style={{ fontWeight: "500", flex: "1" }}
              >
                <Tooltip title={_var.FieldName} placement="bottom-start">
                  <span
                    style={{
                      fontSize: "var(--base_text_font_size)",
                      marginTop: "4px",
                      overflow: "hidden",
                      whiteSpace: "nowrap",
                      textOverflow: "ellipsis",
                      width: "90%",
                    }}
                  >
                    {props.isDrawerExpanded
                      ? _var.FieldName
                      : shortenRuleStatement(_var.FieldName, 13)}
                  </span>
                </Tooltip>
              </p>
              <div
                style={{
                  display: "flex",
                  justifyContent: "flex-start",
                  flexDirection: "row",
                  flex: "0.5",
                  alignItems: "center",
                }}
              >
                <Checkbox
                  checked={getCheckHandler(_var)}
                  onChange={(e) => checkChangeHandler(e, _var)}
                  disabled={isDisabled || isReadOnly}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      checkChangeHandler(e, _var);
                      e.stopPropagation();
                    }
                  }}
                />
              </div>
            </div>
          );
        })}
      </div> */}
    </div>
  );
}

const mapStateToProps = (state) => {
  return {
    cellCheckedOut: state.selectedCellReducer.selectedCheckedOut,
    cellLaneId: state.selectedCellReducer.selectedActLaneId,
    openTemplateFlag: state.openTemplateReducer.openFlag,
    isDrawerExpanded: state.isDrawerExpanded.isDrawerExpanded,
  };
};

export default connect(mapStateToProps, null)(Message);
