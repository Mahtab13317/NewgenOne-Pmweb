import React, { useState, useEffect } from "react";
import styles from "./index.module.css";
import arabicStyles from "./arabicStyles.module.css";
import SearchComponent from "../../../UI/Search Component/index";
import { useTranslation } from "react-i18next";
import axios from "axios";
import { store, useGlobalState } from "state-pool";
import { useDispatch } from "react-redux";
import { setToastDataFunc } from "../../../redux-store/slices/ToastDataHandlerSlice";
import { CircularProgress, Typography } from "@material-ui/core";
import emptyStatePic from "../../../assets/ProcessView/EmptyState.svg";
import {
  ADD_CONSTANT,
  DELETE_CONSTANT,
  ENDPOINT_SAP_FUNCTION,
  ENDPOINT_SAVE_FUNCTION_SAP,
  MODIFY_CONSTANT,
  RTL_DIRECTION,
  SERVER_URL,
  STATE_ADDED,
  STATE_CREATED,
  STATE_EDITED,
} from "../../../Constants/appConstants";
import SapFunctionList from "./SapFunctionList";
import SapFunctionForm from "./SapFunctionForm";
import { containsText } from "../../../utility/CommonFunctionCall/CommonFunctionCall";

function Function(props) {
  let { t } = useTranslation();
  const direction = `${t("HTML_DIR")}`;
  const loadedProcessData = store.getState("loadedProcessData");
  const [localLoadedProcessData, setlocalLoadedProcessData] =
    useGlobalState(loadedProcessData);
  const dispatch = useDispatch();
  const [spinner, setspinner] = useState(true);
  const [functionList, setfunctionList] = useState([]);
  const [configList, setConfigList] = useState([]);
  const [selected, setSelected] = useState(null);
  const [changedSelection, setChangedSelection] = useState(null);
  const [selectedConfig, setSelectedConfig] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterData, setFilterData] = useState(null);

  useEffect(() => {
    axios
      .get(
        SERVER_URL +
          ENDPOINT_SAP_FUNCTION +
          "/" +
          localLoadedProcessData.ProcessDefId +
          "/" +
          localLoadedProcessData.ProcessType
      )
      .then((res) => {
        setConfigList(res.data.SAPConfig);
        let sapFuncList = [...res.data.SAPFunctions];
        let tempFuncList = [];

        sapFuncList?.forEach((el) => {
          tempFuncList.push({
            ...el,
            status: STATE_ADDED,
          });
        });

        setfunctionList(tempFuncList);
        setFilterData(tempFuncList);
        if (tempFuncList?.length > 0) {
          setSelected(tempFuncList[0]);
          setSelectedConfig(() => {
            let temp = null;
            res?.data?.SAPConfig?.forEach((con) => {
              if (con.SAPConfigId === tempFuncList[0].SAPConfigId) {
                temp = con;
              }
            });
            return temp;
          });
        }
        setspinner(false);
      });
  }, []);

  const addNewSapFunction = () => {
    let temp = [...functionList];
    let indexVal;
    //code added on 16 June 2022 for BugId 110949
    let maxId = +localLoadedProcessData.MaxMethodIndex + 1;
    //to remove existing temporary SAP from list, before adding new temporary SAP
    temp?.forEach((webS, index) => {
      if (webS.status && webS.status === STATE_CREATED) {
        indexVal = index;
      }
    });
    if (indexVal >= 0) {
      temp.splice(indexVal, 1);
    }
    temp.splice(0, 0, {
      FunctionName: t("toolbox.serviceCatalogSap.newFunction"),
      FunctionID: maxId,
      status: STATE_CREATED,
    });
    setSelected(temp[0]);
    setfunctionList(temp);
  };

  const handleFunctionSAP = (statusConstant) => {
    let paramTypeMap = {},
      isValid = true;
    let paramList = [];
    /* selected?.ComplexParamType?.forEach((el) => {
      paramTypeMap = {
        ...paramTypeMap,
        [el.Name]: {
          paramName: el.Name,
          unbounded: el.Unbounded,
          paramType: el.Type,
          paramTypeName: el.TypeName,
          optional: el.Optional,
        },
      };
    });
    if (selected?.ParameterDetails?.length > 0) {
      paramList = selected?.ParameterDetails?.map((el) => {
        return {
          paramIndex: el.Index,
          paramName: el.Name,
          unbounded: el.Unbounded,
          parameterType: el.ParameterType,
          paramType: el.Type,
          paramTypeName: el.TypeName,
          optional: el.Optional,
        };
      });
    } else {
      paramList = [];
    } */

    let json = {
      processDefId: localLoadedProcessData.ProcessDefId,
      methodIndex: selected?.FunctionID,
      functionName: changedSelection.functionName,
      objSAPConfiguration: {
        iConfigurationId: parseInt(changedSelection.iConfigurationId),
      },
      status: statusConstant,
      paramList: changedSelection?.paramList,
      mapComplexParamType: changedSelection?.paramTypeMap,
    };

    if (
      selected?.status == STATE_CREATED &&
      (changedSelection.configuration === "" ||
        changedSelection.hostName === "" ||
        changedSelection.clientName === "" ||
        // modified on 31/10/23 for checkmarx -- client privacy violation
        // changedSelection.password === "" ||
        changedSelection.authCred === "" ||
        // till here
        changedSelection.language === "" ||
        changedSelection.instanceNo === "" ||
        changedSelection.username === "")
    ) {
      isValid = false;
      dispatch(
        setToastDataFunc({
          message: t("mandatoryErrorStatement"),
          severity: "error",
          open: true,
        })
      );
    }
    if (isValid) {
      axios.post(SERVER_URL + ENDPOINT_SAVE_FUNCTION_SAP, json).then((res) => {
        if (res.status === 200) {
          let tempConfig = [...configList];
          let tempFuncList = [...functionList];
          if (statusConstant === ADD_CONSTANT) {
            let newObj = {
              configurationName: changedSelection.configuration,
              functionName: selected.functionName,
              iConfigurationId: selected.iConfigurationId,
              rfchostName: selected.rfchostName,
              rfchostNameRequired: selected.rfchostNameRequired,
              sapclient: changedSelection.clientName,
              saphostName: changedSelection.hostName,
              saphttpport: changedSelection.httpPort,
              sapinstanceNo: changedSelection.instanceNo,
              sapitsserver: changedSelection.itsServer,
              saplanguage: changedSelection.language,
              sapprotocol: changedSelection.protocol,
              sapuserName: selected.sapuserName,
              status: selected.status,
              strSAPAuthCred: null,
            };
            let newFunc = {
              FunctionID: selected?.FunctionID,
              FunctionName: changedSelection.functionName,

              SAPConfigId: parseInt(changedSelection.iConfigurationId),

              status: statusConstant,
              ParameterDetails: paramList,
              mapComplexParamType: paramTypeMap,
            };
            tempConfig[0] = {
              ...newObj,
              status: STATE_ADDED,
            };
            tempFuncList[0] = {
              ...newFunc,
              status: STATE_ADDED,
            };
            setSelected((prev) => {
              let temp = { ...prev, ...newFunc };
              temp.status = STATE_ADDED;
              return temp;
            });

            setSelectedConfig((prev) => {
              let temp = { ...prev, ...newObj };
              temp.status = STATE_ADDED;
              return temp;
            });
            //code added on 16 June 2022 for BugId 110949
            let temp = JSON.parse(JSON.stringify(localLoadedProcessData));
            temp.MaxMethodIndex = parseInt(temp.MaxMethodIndex) + 1;
            setlocalLoadedProcessData(temp);
            setConfigList(tempConfig);
            setfunctionList(tempFuncList);
          } else if (statusConstant === MODIFY_CONSTANT) {
          } else if (statusConstant === DELETE_CONSTANT) {
            /* let tempConfig = [...configList];
            let tempFuncList = [...functionList]; */
            const updatedList = tempFuncList.filter(
              (d) => +d.FunctionID !== +selected?.FunctionID
            );
            setSelected(updatedList[0]);
            //setSelectedConfig(tempConfig[0]);
            setfunctionList(updatedList);
          }
        }
      });
    }
  };
  const cancelEditWebservice = () => {};
  const cancelAddSAPFunction = () => {
    let temp = [...functionList];
    temp.splice(0, 1);
    setSelected(temp[0]);
    setfunctionList(temp);
  };

  //Added on 08/09/2023, bug_id:136147
  useEffect(() => {
    const filteredRows = functionList?.filter((el) =>
      containsText(el.FunctionName, searchTerm)
    );
    setFilterData(filteredRows);
  }, [searchTerm, functionList]);
  //till here for bug_id:136147

  return (
    <div className={styles.mainWrappingDiv} style={{ height: "73vh" }}>
      {spinner ? (
        <CircularProgress
          style={
            direction === RTL_DIRECTION
              ? { marginTop: "30vh", marginRight: "50%" }
              : { marginTop: "30vh", marginLeft: "50%" }
          }
        />
      ) : functionList?.length > 0 ? (
        <React.Fragment>
          <div className={styles.mainDiv}>
            <div className={styles.listDiv}>
              <div className={styles.listHeader}>
                <p
                  className={
                    direction === RTL_DIRECTION
                      ? arabicStyles.listHeading
                      : styles.listHeading
                  }
                >
                  {t("Functions")}
                </p>
                <button
                  className={styles.secondaryBtn}
                  onClick={addNewSapFunction}
                  id="sap_catalog_func_addNewBtn"
                >
                  {t("addWithPlusIcon")} {t("New")}
                </button>
              </div>
              <div className={styles.searchHeader}>
                <div style={{ flex: "1" }}>
                  <SearchComponent width="90%" height="var(--line_height)" />
                </div>
                {
                  //Modified on 07/09/2023, bug_id:136156
                }

                {/*  <img
                  src={Filter}
                  className={styles.filterIcon}
                  alt={t("filterImg")}
                /> */}
                {
                  //till here for bug_id:136156
                }
              </div>
              {
                //Modified on 08/09/2023, bug_id:136147
              }
              {filterData?.length > 0 ? (
                <SapFunctionList
                  list={filterData}
                  selected={selected}
                  selectionFunc={(val) => {
                    setSelected(val);
                    setSelectedConfig(() => {
                      let temp = null;
                      configList?.forEach((con) => {
                        if (con.SAPConfigId === val.SAPConfigId) {
                          temp = con;
                        }
                      });
                      return temp;
                    });
                  }}
                  id="sapcatalaog_functionlist"
                />
              ) : (
                <Typography style={{ padding: "0 0.75vw 0" }}>
                  {t("noSearchResult")}
                </Typography>
              )}
              {
                //till here for bug_id:136147
              }
              {/* <SapFunctionList
                list={functionList}
                selected={selected}
                selectionFunc={(val) => {
                  setSelected(val);
                  setSelectedConfig(() => {
                    let temp = null;
                    configList?.forEach((con) => {
                      if (con.SAPConfigId === val.SAPConfigId) {
                        temp = con;
                      }
                    });
                    return temp;
                  });
                }}
                id="sapcatalaog_functionlist"
              /> */}
            </div>
            <div className={styles.formDiv}>
              <SapFunctionForm
                selected={selected}
                setSelected={setSelected}
                setChangedSelection={setChangedSelection}
                selectedConfig={selectedConfig}
                configList={configList}
                changedSelection={changedSelection}
                id="sapcatalaog_functionform"
              />
            </div>
          </div>
          <div
            className={
              direction === RTL_DIRECTION ? arabicStyles.footer : styles.footer
            }
          >
            {selected?.status === STATE_ADDED ? (
              <button
                className={`${styles.cancelBtn} ${styles.pd025}`}
                onClick={() => handleFunctionSAP(DELETE_CONSTANT)}
                id="webS_deleteBtn"
              >
                {t("delete")}
              </button>
            ) : selected?.status === STATE_EDITED ? (
              <React.Fragment>
                <button
                  className={`${styles.cancelBtn} ${styles.pd025}`}
                  onClick={cancelEditWebservice}
                  id="webS_discardBtn"
                >
                  {t("discard")}
                </button>
                <button
                  className={`${styles.primaryBtn} ${styles.pd025}`}
                  onClick={() => handleFunctionSAP(MODIFY_CONSTANT)}
                  id="webS_saveChangeBtn"
                >
                  {t("saveChanges")}
                </button>
              </React.Fragment>
            ) : (
              <React.Fragment>
                <button
                  className={`${styles.cancelBtn} ${styles.pd025}`}
                  onClick={cancelAddSAPFunction}
                  id="webS_discardAddBtn"
                >
                  {t("discard")}
                </button>
                <button
                  className={`${styles.primaryBtn} ${styles.pd025}`}
                  onClick={() => handleFunctionSAP(ADD_CONSTANT)}
                  id="webS_addBtn"
                >
                  {t("RegisterSap")}
                </button>
              </React.Fragment>
            )}
          </div>
        </React.Fragment>
      ) : (
        <>
          <div className={styles.noData}>
            <div>
              <img
                src={emptyStatePic}
                alt={t("noConfigurationAdded")}
                id="sap_catalog_func_noImg"
              />
            </div>

            <button
              className={styles.noDataBtn}
              onClick={addNewSapFunction}
              id="sap_catalog_func_new_addNewBtn"
            >
              {t("addWithPlusIcon")} {t("New")}
            </button>
          </div>
        </>
      )}
    </div>
  );
}

export default Function;
