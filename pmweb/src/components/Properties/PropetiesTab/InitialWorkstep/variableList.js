// #BugID - 120653
// #BugDescription -added css to handle the buttons of modal
// #BugID - 122280
// #BugDescription -select all functionality added
import React, { useState, useEffect } from "react";
import { Checkbox, Button } from "@material-ui/core";

import SearchComponent from "../../../../UI/Search Component/index.js";
import "./workStep.css";
import styles from "./index.module.css";

import {
  VARDOC_LIST,
  SERVER_URL,
  propertiesLabel,
  headerHeight,
  ENDPOINT_GET_ALLDEPLOYEDPROCESSLIST,
} from "../../../../Constants/appConstants";
import axios from "axios";
import { connect, useDispatch, useSelector } from "react-redux";
import { store, useGlobalState } from "state-pool";
import { getVariableType } from "../../../../utility/ProcessSettings/Triggers/getVariableType.js";
import { setActivityPropertyChange } from "../../../../redux-store/slices/ActivityPropertyChangeSlice.js";
import NoResultFound from "../../../../assets/NoSearchResult.svg";
import { useTranslation } from "react-i18next";

/*code edited on 6 Sep 2022 for BugId 115378 */
function VariableList(props) {
  let { t } = useTranslation();
  const { isReadOnly } = props;
  const dispatch = useDispatch();
  let [queueVariablesList, setQueueVariablesList] = useState([]);
  let [searchTerm, setSearchTerm] = useState("");
  let [externalVariablesList, setExternalVariablesList] = useState([]);
  const [varDefinition, setVarDefinition] = useState([]);
  const [selectedVariables, setSelectedVariables] = useState([]);
  const [deployedProcesses, setDeployedProcesses] = useState([]);
  const [deployedProcessId, setDeployedProcessId] = useState(null);
  const [selectedVariableType, setSelectedVariableType] = useState(0);
  const loadedActivityPropertyData = store.getState("activityPropertyData");
  // changes added for bug_id: 134226
  const windowInnerHeight = useSelector(
    (state) => state.setWindowInnerHeight.windowInnerHeight
  );
  const [localLoadedActivityPropertyData] = useGlobalState(
    loadedActivityPropertyData
  );
  const [isAllSelect, setIsAllSelect] = useState(false);

  /*code added on 16 Feb 2023 for BugId 122280*/
  const handleCheckChange = (selectedVariable) => {
    let temp = [...varDefinition];
    // temp?.map((v) => {
    temp?.forEach((v) => {
      if (v.VarName === selectedVariable.VarName) {
        v.isChecked = !v.isChecked;
      }
    });

    const uncheckData = temp.filter((d) => d.isChecked === false);

    if (uncheckData.length === 0) {
      setIsAllSelect(true);
    } else {
      setIsAllSelect(false);
    }
    setVarDefinition(temp);

    if (selectedVariable.isChecked) {
      setSelectedVariables((prev) => {
        return [...prev, selectedVariable];
      });
    } else {
      setSelectedVariables((prev) => {
        let teList = [...prev];
        // teList.map((el, idx) => {
        teList?.forEach((el, idx) => {
          if (el.VarName === selectedVariable.VarName) {
            teList.splice(idx, 1);
          }
        });
        return teList;
      });
    }
  };

  const addVariablesToList = () => {
    props.selectedVariables(selectedVariables);
    // code edited on 26 April 2023 for select all shown as true for all cases, once clicked true.
    setIsAllSelect(false);
    let tempArr = [];
    selectedVariables.forEach((v) => {
      tempArr.push(v.VarName);
    });
    let newJson =
      selectedVariableType === 0
        ? queueVariablesList.filter((d) => !tempArr.includes(d.VarName))
        : externalVariablesList.filter((d) => !tempArr.includes(d.VarName));
    selectedVariableType === 0
      ? setQueueVariablesList(newJson)
      : setExternalVariablesList(newJson);
    dispatch(
      setActivityPropertyChange({
        [propertiesLabel[props.propLabel]]: {
          isModified: true,
          hasError: true,
        },
      })
    );
  };

  useEffect(() => {
    axios
      .get(SERVER_URL + `${ENDPOINT_GET_ALLDEPLOYEDPROCESSLIST}`)
      .then((res) => {
        if (res?.data?.Status === 0) {
          setDeployedProcesses(res.data.Processes);
        }
      });
  }, []);

  useEffect(() => {
    deployedProcesses.map((el) => {
      if (
        el.ProcessName ==
        localLoadedActivityPropertyData?.ActivityProperty.pMMessageEnd
          .processName
      ) {
        setDeployedProcessId(el.ProcessDefId);
      }
    });
  }, [deployedProcesses, localLoadedActivityPropertyData]);

  useEffect(() => {
    if (
      localLoadedActivityPropertyData?.ActivityProperty.pMMessageEnd
        .processName &&
      deployedProcessId !== null
    ) {
      let jsonBody = {
        processDefId: deployedProcessId,
        extTableDataFlag: "Y",
        docReq: "Y",
        omniService: "Y",
      };
      axios.post(SERVER_URL + VARDOC_LIST, jsonBody).then((res) => {
        if (res?.data?.Status === 0) {
          let tempQueueVars = [];
          let tempExternalVars = [];
          res.data.VarDefinition.forEach((variable) => {
            if (+variable.ExtObjID === 0) {
              tempQueueVars.push(variable);
            } else if (+variable.ExtObjID === 1) {
              tempExternalVars.push(variable);
            }
          });
          filterData(tempQueueVars, tempExternalVars);
        }
      });
      setSelectedVariables(props.selectedVariableList);
    }
  }, [selectedVariableType, props.selectedVariableList, deployedProcessId]);

  const filterData = (queueList, extList) => {
    let newQueueList = [];
    let newExtList = [];
    queueList?.forEach((list) => {
      let tempVariable = false;
      props.selectedVariableList?.forEach((variable) => {
        if (variable.VarName === list.VarName) {
          tempVariable = true;
        }
      });
      if (!tempVariable) {
        newQueueList.push(list);
      }
    });
    setQueueVariablesList(newQueueList);

    extList?.forEach((list) => {
      let tempVariable = false;
      props.selectedVariableList?.forEach((variable) => {
        if (variable.VarName === list.VarName) {
          tempVariable = true;
        }
      });
      if (!tempVariable) {
        newExtList.push(list);
      }
    });
    setExternalVariablesList(newExtList);
  };

  useEffect(() => {
    setVarDefinition(
      selectedVariableType == 0
        ? queueVariablesList?.map((x) => {
            return { ...x, isChecked: false };
          })
        : externalVariablesList?.map((x) => {
            return { ...x, isChecked: false };
          })
    );
  }, [queueVariablesList, externalVariablesList, selectedVariableType]);

  let filteredRows = varDefinition.filter((row) => {
    if (searchTerm == "") {
      return row;
    } else if (row.VarName.toLowerCase().includes(searchTerm.toLowerCase())) {
      return row;
    }
  });

  const selectAllData = (e) => {
    setIsAllSelect(e.target.checked);
    let tempData = [...varDefinition];
    let tempArr = [];
    tempData?.forEach((item) => {
      item.isChecked = e.target.checked;
      if (e.target.checked) tempArr = [...tempArr, item];
    });
    setVarDefinition(tempData);
    if (e.target.checked) {
      setSelectedVariables((prev) => {
        return [...prev, ...tempArr];
      });
    } else {
      setSelectedVariables([]);
    }
  };

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        height: props.isDrawerExpanded ? "100%" : "inherit",
        backgroundColor: props.isDrawerExpanded ? "white" : "",
      }}
    >
      <div>
        {filteredRows?.length === 0 && searchTerm?.trim() === "" ? null : (
          <SearchComponent
            /*style={{ width: "100%", margin: "5px 10px 0" }}
            setSearchTerm={setSearchTerm}*/
            // Modified on 08/10/2023, bug_id:135147
            style={{ width: "auto", margin: "5px 10px 0" }}
            setSearchTerm={setSearchTerm}
            //till her for bug_id:135147
          />
        )}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            borderBottom: "1px solid #D6D6D6",
            padding: "10px 10px 0px 10px",
          }}
        >
          <p
            onClick={() => setSelectedVariableType(0)}
            style={{
              fontSize: "12px",
              paddingBottom: "5px",
              // Added on : 23-5-2023 for BUGID: 127640
              cursor: "pointer",
              borderBottom:
                selectedVariableType == 0
                  ? "3px solid var(--selected_tab_color)"
                  : null,
            }}
          >
            {/* {t("SystemDefined")} */}
            {t("basicVariables")}
          </p>
          <p
            onClick={() => setSelectedVariableType(1)}
            style={{
              fontSize: "12px",
              marginLeft: "25px",
              paddingBottom: "5px",
              borderBottom:
                selectedVariableType == 1
                  ? "3px solid var(--selected_tab_color)"
                  : null,
              // Added on : 23-5-2023 for BUGID: 127640
              cursor: "pointer",
            }}
          >
            {/* {t("userDefined")} */}
            {t("extendedVariables")}
          </p>
        </div>
        {/* -------------------------- */}
        {filteredRows?.length === 0 ? (
          <>
            {/*  <img
              src={NoResultFound}
              alt={t("noResultsFound")}
              className={
                props.isDrawerExpanded
                ? direction === RTL_DIRECTION
                  ? "noSearchResultImageExpandedArabic"
                  : "noSearchResultImageExpanded"
                : "noSearchResultImage"  //Changes made to solve Bug 137005
              }
              // style={{
              //   width: props.isDrawerExpanded ? "12%" : "50%",
              //   height: "auto",
              // }}
            />
            <span
              className={
                props.isDrawerExpanded
                  ? direction === RTL_DIRECTION
                    ? "noVariablesPresentExpandedArabic"
                    : "noVariablesPresentExpanded"
                  : "noVariablesPresent"
              }
            >
              {searchTerm?.trim() !== ""
                ? t("noVariablesFound")
                : t("NoVariablesPresent")}
            </span> */}
            <div style={{ width: "100%" }}>
              <div>
                <img
                  src={NoResultFound}
                  alt={t("noResultsFound")}
                  className={styles.noResultImg}
                />
              </div>
              <div className={styles.noResultText}>
                <span>
                  {searchTerm?.trim() !== ""
                    ? t("noVariablesFound")
                    : t("NoVariablesPresent")}
                </span>
              </div>
            </div>
          </>
        ) : filteredRows?.length > 0 ? (
          <>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                borderBottom: "1px solid #D6D6D6",
                padding: "10px",
              }}
            >
              <Checkbox
                style={{
                  borderRadius: "1px",
                  padding: "0",
                }}
                disabled={isReadOnly}
                checked={isAllSelect}
                onChange={selectAllData}
              />
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                }}
              >
                <p
                  style={{
                    fontSize: "11px",
                    color: "black",
                    marginLeft: "15px",
                  }}
                >
                  {t("selectAll")}
                </p>
              </div>
            </div>
            <div
              style={{
                overflowY: "scroll",
                height: `calc(${windowInnerHeight}px - ${headerHeight} - ${
                  filteredRows?.length === 0 && searchTerm?.trim() !== ""
                    ? props.isDrawerExpanded
                      ? "19rem"
                      : "7.5rem"
                    : props.isDrawerExpanded
                    ? "26rem"
                    : "14.5rem"
                })`,
                scrollbarColor: "#dadada #fafafa",
                scrollbarWidth: "thin",
              }}
            >
              {filteredRows.map((variable) => {
                return (
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      borderBottom: "1px solid #D6D6D6",
                      padding: "5px 10px 5px 10px",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                      }}
                    >
                      <Checkbox
                        onChange={() => handleCheckChange(variable)}
                        checked={variable.isChecked}
                        style={{
                          borderRadius: "1px",
                          padding: "0",
                        }}
                        disabled={isReadOnly}
                      />
                      <div
                        style={{
                          display: "flex",
                          flexDirection: "column",
                          marginLeft: "15px",
                        }}
                      >
                        <p style={{ fontSize: "11px", color: "black" }}>
                          {variable.VarName}
                        </p>
                        <span style={{ fontSize: "10px", color: "#B2B1B9" }}>
                          {variable.SysName}
                        </span>
                      </div>
                    </div>
                    <p
                      style={{
                        fontSize: "10px",
                        color: "black",
                        textTransform: "uppercase",
                      }}
                    >
                      {getVariableType(variable.VarType)}
                    </p>
                  </div>
                );
              })}
            </div>
          </>
        ) : null}
      </div>
      {filteredRows?.length === 0 ? null : (
        <div
          style={{
            display: "flex",
            alignItems: "right",
            padding: "5px 10px 5px 10px",
            justifyContent: "end",
            backgroundColor: "#F8F8F8",
          }}
        >
          {props.isDrawerExpanded ? null : (
            <Button
              variant="outlined"
              onClick={() => props.setShowVariablesModal(false)}
              id="close_AddVariableModal_CallActivity"
              disabled={isReadOnly}
            >
              {t("cancel")}
            </Button>
          )}
          <Button
            id="add_AddVariableModal_CallActivity"
            onClick={() => addVariablesToList()}
            variant="contained"
            color="primary"
            disabled={isReadOnly}
          >
            {t("add")}
          </Button>
        </div>
      )}
    </div>
  );
}

const mapStateToProps = (state) => {
  return {
    isDrawerExpanded: state.isDrawerExpanded.isDrawerExpanded,
  };
};

export default connect(mapStateToProps, null)(VariableList);
