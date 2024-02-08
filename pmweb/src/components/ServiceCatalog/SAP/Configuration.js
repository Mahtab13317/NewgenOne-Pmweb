import React, { useState, useEffect } from "react";
import styles from "./index.module.css";
import arabicStyles from "./arabicStyles.module.css";
import emptyStatePic from "../../../assets/ProcessView/EmptyState.svg";
import SearchComponent from "../../../UI/Search Component/index";
import { useTranslation } from "react-i18next";
import axios from "axios";
import { useDispatch } from "react-redux";
import { setToastDataFunc } from "../../../redux-store/slices/ToastDataHandlerSlice";
import { CircularProgress, Typography } from "@material-ui/core";
import {
  ADD_CONSTANT,
  DELETE_CONSTANT,
  ENDPOINT_REGISTER_SAP,
  MODIFY_CONSTANT,
  RTL_DIRECTION,
  SERVER_URL,
  STATE_ADDED,
  STATE_CREATED,
  STATE_EDITED,
} from "../../../Constants/appConstants";
import SapList from "./SapList";
import SapForm from "./SapForm";
import { store, useGlobalState } from "state-pool";
import {
  containsText,
  getCommonRegErrorMsg,
  getGenErrMsg,
  getIncorrectLenErrMsg,
  restrictSpecialCharacter,
} from "../../../utility/CommonFunctionCall/CommonFunctionCall";
import { PMWEB_REGEX, validateRegex } from "../../../validators/validator";

function Configuration(props) {
  let { t } = useTranslation();
  const direction = `${t("HTML_DIR")}`;
  const dispatch = useDispatch();
  const loadedProcessData = store.getState("loadedProcessData");
  const [localLoadedProcessData] = useGlobalState(loadedProcessData);
  const [spinner, setspinner] = useState(true);
  const [configurationList, setConfigurationList] = useState([]);
  const [changedSelection, setChangedSelection] = useState(null);
  const [selected, setSelected] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterData, setFilterData] = useState(null);
  const [btnDisable, setBtnDisable] = useState(true);

  useEffect(() => {
    axios
      .get(
        SERVER_URL +
          ENDPOINT_REGISTER_SAP +
          "/" +
          localLoadedProcessData.ProcessDefId +
          "/" +
          localLoadedProcessData.ProcessType
      )
      .then((res) => {
        let configList = [...res.data];
        let tempConfList = [];

        configList?.forEach((el) => {
          tempConfList.push({
            ...el,
            status: STATE_ADDED,
          });
        });
        setConfigurationList(tempConfList);
        setFilterData(tempConfList);
        setSelected(tempConfList[0]);
        setspinner(false);
      });
  }, []);

  //Added on 08/09/2023, bug_id:136147
  useEffect(() => {
    const filteredRows = configurationList?.filter((el) =>
      containsText(el.configurationName, searchTerm)
    );
    //setConfigurationList(filteredRows);
    setFilterData(filteredRows);
  }, [configurationList, searchTerm]);
  //till here for bug_id:136147

  const addNewSapFunction = () => {
    let temp = [...configurationList];
    let indexVal;
    let maxId = 0;
    //to remove existing temporary SAP from list, before adding new temporary SAP
    temp?.forEach((webS, index) => {
      if (webS.status && webS.status === STATE_CREATED) {
        indexVal = index;
      }
      if (maxId < webS.iConfigurationId) {
        maxId = webS.iConfigurationId;
      }
    });
    if (indexVal >= 0) {
      temp.splice(indexVal, 1);
    }
    temp.splice(0, 0, {
      configurationName: t("newConfiguration"),
      iConfigurationId: maxId + 1,
      status: STATE_CREATED,
    });
    setSelected(temp[0]);
    setConfigurationList(temp);
  };

  const handleSapservice = (statusConstant) => {
    let json = {
      /* strSAPAuthCred: changedSelection.authCred,
      configurationName: changedSelection.configuration,
      rfchostNameRequired: changedSelection.rfchostNameRequired,
      functionName: null,
      saplanguage: changedSelection.language,
      sapitsserver: changedSelection.itsServer,
      rfchostName: changedSelection.rfcHostname,
      sapclient: changedSelection.clientName,
      sapuserName: changedSelection.userName,
      saphostName: changedSelection.hostName,
      saphttpport: changedSelection.httpPort,
      sapprotocol: changedSelection.protocol,
      sapinstanceNo: changedSelection.instanceNo, */
      processDefId: localLoadedProcessData.ProcessDefId,
      processState: localLoadedProcessData.ProcessType,
      sapHostName: changedSelection.hostName,
      rfcHostName: changedSelection.rfcHostname,
      sapClient: changedSelection.clientName,
      sapUserName: changedSelection.userName,
      // modified on 31/10/23 for checkmarx -- client privacy violation
      // sapAuthCred: changedSelection.password,
      sapAuthCred: changedSelection.authCred,
      // till here
      sapLanguage: changedSelection.language,
      sapInstanceNo: changedSelection.instanceNo,
      sapHTTPPort: changedSelection.httpPort,
      sapProtocol: changedSelection.protocol,
      sapITSServer: changedSelection.itsServer,
      configurationId: selected.iConfigurationId,
      configurationName: changedSelection.configuration,
    };
    if (statusConstant === ADD_CONSTANT) {
      if (
        changedSelection.configuration === "" ||
        changedSelection.hostName === "" ||
        changedSelection.clientName === "" ||
        // modified on 31/10/23 for checkmarx -- client privacy violation
        // changedSelection.password === "" ||
        changedSelection.authCred === "" ||
        // till here
        changedSelection.language === "" ||
        changedSelection.instanceNo === "" ||
        changedSelection.httpPort === ""
      ) {
        dispatch(
          setToastDataFunc({
            message: t("mandatoryErrorStatement"),
            severity: "error",
            open: true,
          })
        );
      } else {
        let tempConfig = [...configurationList];
        const updatedList = tempConfig.filter(
          (d) => d.configurationName === changedSelection.configuration
        );
        // Modified on 26/10/2023, bug_id:136130
        // let isValid = true;
        let errorMsg = "";
        const restrictChars = `<>\|/":?*`;
        const regexVal = "[*|\\\\:'\"<>?//]+";
        // isValid = restrictSpecialCharacter(changedSelection.configuration, regexVal);
        if (
          !restrictSpecialCharacter(changedSelection.configuration, regexVal)
        ) {
          errorMsg = getCommonRegErrorMsg("sapConfig", t, restrictChars);
          dispatch(
            setToastDataFunc({
              message: errorMsg,
              severity: "error",
              open: true,
            })
          );
        } else if (
          !validateRegex(
            changedSelection.hostName,
            PMWEB_REGEX.IpAddressIpV4
          ) &&
          !validateRegex(changedSelection.hostName, PMWEB_REGEX.DomainName)
        ) {
          dispatch(
            setToastDataFunc({
              message: getGenErrMsg("sapHostName", "shouldIPDomain", t),
              severity: "error",
              open: true,
            })
          );
        } else if (
          !validateRegex(
            changedSelection.hostName,
            PMWEB_REGEX.IpAddressIpV4
          ) &&
          !validateRegex(changedSelection.hostName, PMWEB_REGEX.DomainName)
        ) {
          dispatch(
            setToastDataFunc({
              message: getGenErrMsg("sapHostName", "shouldIPDomain", t),
              severity: "error",
              open: true,
            })
          );
        }
        // modified on 31/10/23 for checkmarx -- client privacy violation
        // else if (changedSelection.password?.length > 512) {
        else if (changedSelection.authCred?.length > 512) {
          dispatch(
            setToastDataFunc({
              message: getIncorrectLenErrMsg("sapPassword", 512, t),
              severity: "error",
              open: true,
            })
          );
        }
        // till here
        else if (
          !validateRegex(changedSelection.language, PMWEB_REGEX.LanguageLocale)
        ) {
          dispatch(
            setToastDataFunc({
              message: getGenErrMsg("language", "Invalid", t),
              severity: "error",
              open: true,
            })
          );
        } else if (changedSelection.clientName?.length > 3) {
          dispatch(
            setToastDataFunc({
              message: getIncorrectLenErrMsg("sapClient", 3, t),
              severity: "error",
              open: true,
            })
          );
        } else if (changedSelection.instanceNo.length > 2) {
          dispatch(
            setToastDataFunc({
              message: getIncorrectLenErrMsg("intanceNumber", 2, t),
              severity: "error",
              open: true,
            })
          );
        } else if (changedSelection.httpPort > 65535) {
          dispatch(
            setToastDataFunc({
              message: t("portRange"),
              severity: "error",
              open: true,
            })
          );
        } else if (updatedList?.length > 0) {
          dispatch(
            setToastDataFunc({
              message: `${t("Configuration")} ${t(
                "withTheSameNameAlreadyExists"
              )}`,
              severity: "error",
              open: true,
            })
          );
          //till here for bug_id:136130
        } else {
          axios.post(SERVER_URL + ENDPOINT_REGISTER_SAP, json).then((res) => {
            if (res?.status === 200) {
              let tempConfig = [...configurationList];
              let newObj = {
                configurationName: changedSelection.configuration,
                functionName: selected.functionName,
                iConfigurationId: selected.iConfigurationId,
                rfchostName: selected.rfchostName,
                rfchostNameRequired: res.data.rfchostNameRequired,
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
              /*  let newObj={
              processDefId: localLoadedProcessData.ProcessDefId,
              processState: localLoadedProcessData.ProcessType,
              iConfigurationId: selected.iConfigurationId,
              strSAPAuthCred: "system123#",
              status: "",
              functionName: null,
              configurationName: "sapConfig2",
              rfchostNameRequired: false,
              saphostName: "sapHostNew",
              sapclient: "C2",
              saplanguage: "english",
              sapuserName: "sapUser1",
              sapinstanceNo: "03",
              sapprotocol: "HTTP",
              sapitsserver: "E",
              saphttpport: "8080",
              rfchostName: ""
          }; */
              tempConfig[0] = {
                ...newObj,
                status: STATE_ADDED,
              };
              setSelected((prev) => {
                let temp = { ...prev, ...newObj };
                temp.status = STATE_ADDED;
                return temp;
              });

              setConfigurationList(tempConfig);
            }
          });
        }
      }
    } else if (statusConstant === MODIFY_CONSTANT) {
      if (
        changedSelection.configuration === "" ||
        changedSelection.hostName === "" ||
        changedSelection.clientName === "" ||
        // modified on 31/10/23 for checkmarx -- client privacy violation
        // changedSelection.password === "" ||
        changedSelection.authCred === "" ||
        // till here
        changedSelection.language === "" ||
        changedSelection.instanceNo === "" ||
        changedSelection.httpPort === ""
      ) {
        dispatch(
          setToastDataFunc({
            message: t("mandatoryErrorStatement"),
            severity: "error",
            open: true,
          })
        );
      } else {
        /*   axios
          .put(SERVER_URL + ENDPOINT_REGISTER_SAP, json, {
            headers: {
              encryptionToken: tk,
            },
          })
          .then((res) => {
            if (res.data.Status === 0) {
            }
          }); */
        axios.put(SERVER_URL + ENDPOINT_REGISTER_SAP, json).then((res) => {
          let tempConfig = [...configurationList];
          let currPos = 0;
          tempConfig.forEach((data, i) => {
            if (+data.iConfigurationId === +selected.iConfigurationId) {
              currPos = i;
              data.configurationName = changedSelection.configuration;
              data.functionName = selected.functionName;
              data.iConfigurationId = selected.iConfigurationId;
              data.rfchostName = selected.rfchostName;
              data.rfchostNameRequired = res.data.rfchostNameRequired;
              data.sapclient = changedSelection.clientName;
              data.saphostName = changedSelection.hostName;
              data.saphttpport = changedSelection.httpPort;
              data.sapinstanceNo = changedSelection.instanceNo;
              data.sapitsserver = changedSelection.itsServer;
              data.saplanguage = changedSelection.language;
              data.sapprotocol = changedSelection.protocol;
              data.sapuserName = selected.sapuserName;
              data.status = selected.status;
              data.strSAPAuthCred = null;
            }
          });
          setSelected(tempConfig[currPos]);
          setConfigurationList(tempConfig);
        });
      }
    } else if (statusConstant === DELETE_CONSTANT) {
      let tempConfig = [...configurationList];
      const updatedList = tempConfig.filter(
        (d) => +d.iConfigurationId !== +selected.iConfigurationId
      );

      let json = {
        //iConfigurationId: selected.iConfigurationId,
        processDefId: localLoadedProcessData.ProcessDefId,
        processState: localLoadedProcessData.ProcessType,
        configurationId: selected.iConfigurationId,
      };
      /* axios
        .delete(SERVER_URL + ENDPOINT_REGISTER_SAP, {
          data: json,
          headers: { "Access-Control-Allow-Origin": "*" },
        }) */
      axios
        .delete(SERVER_URL + ENDPOINT_REGISTER_SAP, {
          data: json,
        })
        .then(() => {
          setConfigurationList(updatedList);
          setSelected(updatedList[0]);
        });
    }
  };

  const cancelAddConfig = () => {
    let temp = [...configurationList];
    temp.splice(0, 1);
    setSelected(temp[0]);
    setConfigurationList(temp);
  };

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
      ) : configurationList?.length > 0 ? (
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
                  {t("toolbox.serviceCatalogSap.configuration")}
                </p>
                <button
                  className={styles.secondaryBtn}
                  onClick={addNewSapFunction}
                  id="sap_catalog_addNewBtn"
                >
                  {t("addWithPlusIcon")} {t("New")}
                </button>
              </div>
              <div className={styles.searchHeader}>
                <div style={{ flex: "1" }}>
                  <SearchComponent
                    width="90%"
                    height="var(--line_height)"
                    onSearchChange={(val) => setSearchTerm(val)}
                    clearSearchResult={() => setSearchTerm("")}
                  />
                </div>
                {
                  //Modified on 07/09/2023, bug_id:136156
                }
                {/* <img
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
                <SapList
                  list={filterData}
                  selected={selected}
                  selectionFunc={setSelected}
                />
              ) : (
                <Typography style={{ padding: "0 0.75vw 0" }}>
                  {t("noSearchResult")}
                </Typography>
              )}
              {
                //till here for bug_id:136147
              }

              {/*   <SapList
                  list={filterData}
                  selected={selected}
                  selectionFunc={setSelected}
                /> */}
            </div>
            <div className={styles.formDiv}>
              <SapForm
                selected={selected}
                setSelected={setSelected}
                setChangedSelection={setChangedSelection}
                btnDisable={btnDisable}
                setBtnDisable={setBtnDisable}
              />
            </div>
          </div>
          <div
            className={
              direction === RTL_DIRECTION ? arabicStyles.footer : styles.footer
            }
          >
            {/*  {selected?.status === STATE_ADDED ? (
              <button
                className={`${styles.cancelBtn} ${styles.pd025}`}
                onClick={() => handleSapservice(DELETE_CONSTANT)}
                id="webS_deleteBtn"
              >
                {t("delete")}
              </button>
            ) : selected?.status === STATE_EDITED ? (
              <React.Fragment>
                <button
                  className={`${styles.cancelBtn} ${styles.pd025}`}
                  onClick={cancelEditConfiguration}
                  id="webS_discardBtn"
                >
                  {t("discard")}
                </button>
                <button
                  className={`${styles.primaryBtn} ${styles.pd025}`}
                  onClick={() => handleSapservice(MODIFY_CONSTANT)}
                  id="webS_saveChangeBtn"
                >
                  {t("saveChanges")}
                </button>
              </React.Fragment>
            ) : (
              <React.Fragment>
                <button
                  className={`${styles.cancelBtn} ${styles.pd025}`}
                  onClick={cancelAddConfig}
                  id="webS_discardAddBtn"
                >
                  {t("discard")}
                </button>
                <button
                  className={`${styles.primaryBtn} ${styles.pd025}`}
                  onClick={() => handleSapservice(ADD_CONSTANT)}
                  id="webS_addBtn"
                >
                  {t("Add SAP")}
                </button>
              </React.Fragment>
            )} */}
            {selected?.status === STATE_ADDED ||
            selected?.status === STATE_EDITED ? (
              <>
                <button
                  className={`${styles.cancelBtn} ${styles.pd025}`}
                  onClick={() => handleSapservice(DELETE_CONSTANT)}
                  id="webS_deleteBtn_sap_config"
                >
                  {t("delete")}
                </button>
                <button
                  className={`${styles.primaryBtn} ${styles.pd025}`}
                  onClick={() => handleSapservice(MODIFY_CONSTANT)}
                  id="webS_saveChangeBtn_sap_config"
                >
                  {t("saveChanges")}
                </button>{" "}
              </>
            ) : (
              <>
                <button
                  className={`${styles.cancelBtn} ${styles.pd025}`}
                  onClick={cancelAddConfig}
                  id="webS_discardAddBtn_sap_config"
                >
                  {t("discard")}
                </button>
                <button
                  className={`${styles.primaryBtn} ${styles.pd025}`}
                  onClick={() => handleSapservice(ADD_CONSTANT)}
                  id="webS_addBtn_sap_config"
                  disabled={btnDisable}
                >
                  {t("addSAP")}
                </button>
              </>
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
                id="sap_catalog_config_noImg"
              />
            </div>
            <button
              className={styles.noDataBtn}
              onClick={addNewSapFunction}
              id="sap_catalog_blank_addNewBtn"
            >
              {t("addWithPlusIcon")} {t("New")}
            </button>
          </div>
        </>
      )}
    </div>
  );
}

export default Configuration;
