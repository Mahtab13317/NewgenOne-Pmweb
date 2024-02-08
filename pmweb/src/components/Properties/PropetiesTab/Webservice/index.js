// Changes made to solve bug ID 110921
// WebServices: On opening the properties of Webservice it keeps on loading
// Changes made to fix Bug 111083 - webservice -> no validation message for webservice and the fields should have a mandatory mark as given in design
// #BugID - 115280
// #BugDescription - Added validation for JMS/SOAP target.
import React, { useEffect, useState } from "react";
import axios from "axios";
import { store, useGlobalState } from "state-pool";

import { MenuItem, CircularProgress, useMediaQuery } from "@material-ui/core";
import "./index.css";
import { useDispatch, useSelector, connect } from "react-redux";
import ServiceAndMethods from "./webservice&Methods.js";
import { setActivityPropertyChange } from "../../../../redux-store/slices/ActivityPropertyChangeSlice";
import {
  ActivityPropertySaveCancelValue,
  setSave,
} from "../../../../redux-store/slices/ActivityPropertySaveCancelClicked";
import Modal from "../../../../UI/Modal/Modal.js";
import {
  RTL_DIRECTION,
  propertiesLabel,
} from "../../../../Constants/appConstants";
import {
  SERVER_URL,
  ENDPOINT_GET_WEBSERVICE,
} from "../../../../Constants/appConstants";
import Mapping from "./mapping.js";
import { setToastDataFunc } from "../../../../redux-store/slices/ToastDataHandlerSlice";
import { useTranslation } from "react-i18next";
import CatalogScreenModal from "./CatalogScreenModal";
import {
  isProcessDeployedFunc,
  isReadOnlyFunc,
} from "../../../../utility/CommonFunctionCall/CommonFunctionCall";
import { LatestVersionOfProcess } from "../../../../utility/abstarctView/checkLatestVersion";
import CustomizedDropdown from "../../../../UI/Components_With_ErrrorHandling/Dropdown";

function Webservice(props) {
  let { t } = useTranslation();
  const direction = `${t("HTML_DIR")}`;
  const dispatch = useDispatch();
  const loadedActivityPropertyData = store.getState("activityPropertyData");
  const [localLoadedActivityPropertyData, setlocalLoadedActivityPropertyData] =
    useGlobalState(loadedActivityPropertyData);
  const loadedProcessData = store.getState("loadedProcessData");
  const [localLoadedProcessData] = useGlobalState(loadedProcessData);
  const [webServicesList, setWebServicesList] = useState([]);
  const [serviceNameClicked, setServiceNameClicked] = useState(null);
  const [methodsList, setMethodsList] = useState([]);
  const [selectedWebService, setSelectedWebService] = useState(null);
  const [selectedMethod, setSelectedMethod] = useState(null);
  const [associations, setAssociations] = useState([]);
  const [showMapping, setShowMapping] = useState(false);
  const [associateButtonClicked, setAssociateButtonClicked] = useState(false);
  const saveCancelStatus = useSelector(ActivityPropertySaveCancelValue);
  const [showCatelogScreen, setShowCatelogScreen] = useState(false);
  const [spinner, setspinner] = useState(true);
  //code added on 22 Aug 2022 for BugId 112019
  const [value, setValue] = useState(0); // Function to handle tab change.
  let isReadOnly =
    props.openTemplateFlag ||
    LatestVersionOfProcess(localLoadedProcessData?.Versions) !==
      +localLoadedProcessData?.VersionNo || // modified on 05/09/2023 for BugId 136103
    isReadOnlyFunc(
      localLoadedProcessData,
      props.cellCheckedOut,
      props.cellLaneId
    );

  useEffect(() => {
    if (saveCancelStatus.SaveOnceClicked) {
      // code added on 22 July 2022 for BugId 112019
      let isValidObj = validateFunc();
      if (!isValidObj.isValid && isValidObj.type === "JMS") {
        //code added on 22 Aug 2022 for BugId 112019
        dispatch(
          setToastDataFunc({
            message: `${t("selectJMS")}`,
            severity: "error",
            open: true,
          })
        );
      } else if (!isValidObj.isValid && isValidObj.type === "FW") {
        //code added on 22 Aug 2022 for BugId 112019
        setValue(0);
        dispatch(
          setToastDataFunc({
            message: `${t("PleaseDefineAtleastOneForwardMapping")}`,
            severity: "error",
            open: true,
          })
        );
      } else if (!isValidObj.isValid && isValidObj.type === "RW") {
        //code added on 22 Aug 2022 for BugId 112019
        setValue(1);
        dispatch(
          setToastDataFunc({
            message: `${t("PleaseDefineAtleastOneReverseMapping")}`,
            severity: "error",
            open: true,
          })
        );
      }
      dispatch(setSave({ SaveClicked: false }));
    } else if (saveCancelStatus.CancelClicked) {
      // code added on 30 August 2022 for BugId 113881
      setSelectedWebService(null);
      setSelectedMethod(null);
      setShowMapping(false);
      setAssociateButtonClicked(false);
      dispatch(setSave({ CancelClicked: false }));
    }
  }, [saveCancelStatus.SaveClicked, saveCancelStatus.CancelClicked]);

  useEffect(() => {
    // commented on 04/10/23 for BugId 133154
    // if (localLoadedActivityPropertyData?.Status === 0) {
    //   setspinner(false);
    // }
    let temp = [];
    localLoadedActivityPropertyData?.ActivityProperty?.webserviceInfo?.objWebServiceDataInfo?.map(
      (info) => {
        temp.push({
          method: info.methodName,
          webservice: info.webserviceName,
          id: info.methodIndex,
        });
      }
    );
    setAssociations(temp);
    let isValidObj = {};
    isValidObj = validateFunc();
    if (isValidObj && !isValidObj.isValid) {
      dispatch(
        setActivityPropertyChange({
          [propertiesLabel.webService]: { isModified: true, hasError: true },
        })
      );
    }
  }, [localLoadedActivityPropertyData]);

  useEffect(() => {
    if (localLoadedProcessData?.ProcessDefId)
      axios
        .get(
          SERVER_URL +
            ENDPOINT_GET_WEBSERVICE +
            localLoadedProcessData?.ProcessDefId
        )
        .then((res) => {
          let tempServices = [];
          res?.data?.Methods?.Webservice?.forEach((service) => {
            tempServices.push(service);
          });
          setWebServicesList(tempServices);
          // added on 04/10/23 for BugId 133154
          setspinner(false);
        })
        // added on 04/10/23 for BugId 133154
        .catch((err) => {
          console.log(err);
          setspinner(false);
        });
    //Modified on 26/09/2023, bug_id:135588,139752
    let tempObj = JSON.parse(JSON.stringify(localLoadedActivityPropertyData));
    tempObj.ActivityProperty.actGenPropInfo.m_bBulkFormView = false;
    tempObj.ActivityProperty.actGenPropInfo.m_bFormView = false;
    setlocalLoadedActivityPropertyData(tempObj);
    //till here for bug_id:135588
  }, []);

  useEffect(() => {
    let temp = [];
    webServicesList.map((method) => {
      if (method.AppName == selectedWebService) {
        temp.push(method);
      }
    });
    setMethodsList(temp);
  }, [selectedWebService]);

  const associateServiceNMethod = () => {
    setAssociateButtonClicked(true);
    if (selectedWebService && selectedMethod) {
      // -------------------------------
      let combExists = false;
      // Not allowing addition of already existing webservice and method combination
      // Changes made to solve bug ID 110921
      localLoadedActivityPropertyData?.ActivityProperty?.webserviceInfo?.objWebServiceDataInfo?.map(
        (el) => {
          if (
            el.methodName == selectedMethod &&
            el.webserviceName == selectedWebService
          ) {
            combExists = true;
            dispatch(
              setToastDataFunc({
                message: t("CombAlreadyExists"),
                severity: "error",
                open: true,
              })
            );
          }
        }
      );

      if (!combExists) {
        //code edited on 20 June 2022 for BugId 111107
        let methodIndex;
        webServicesList?.map((method) => {
          if (method.AppName == selectedWebService) {
            methodIndex = method.MethodIndex;
          }
        });
        // Saving Data
        // code edited on 30 August 2022 for BugId 113881
        let temp = JSON.parse(JSON.stringify(localLoadedActivityPropertyData));
        if (temp?.ActivityProperty?.webserviceInfo) {
          if (temp.ActivityProperty.webserviceInfo?.objWebServiceDataInfo) {
            temp.ActivityProperty.webserviceInfo.objWebServiceDataInfo.push({
              asynchActId: "0",
              fwdParamMapList: [],
              invocationType: "F",
              methodIndex: methodIndex,
              methodName: selectedMethod,
              proxyEnabled: "F",
              revParamMapList: [],
              timeoutInterval: "10",
              webserviceName: selectedWebService,
            });
          } else {
            temp.ActivityProperty.webserviceInfo = {
              ...temp.ActivityProperty.webserviceInfo,
              objWebServiceDataInfo: [
                {
                  asynchActId: "0",
                  fwdParamMapList: [],
                  invocationType: "F",
                  methodIndex: methodIndex,
                  methodName: selectedMethod,
                  proxyEnabled: "F",
                  revParamMapList: [],
                  timeoutInterval: "10",
                  webserviceName: selectedWebService,
                },
              ],
            };
          }
        } else {
          temp.ActivityProperty = {
            ...temp.ActivityProperty,
            webserviceInfo: {
              objWebServiceDataInfo: [
                {
                  asynchActId: "0",
                  fwdParamMapList: [],
                  invocationType: "F",
                  methodIndex: methodIndex,
                  methodName: selectedMethod,
                  proxyEnabled: "F",
                  revParamMapList: [],
                  timeoutInterval: "10",
                  webserviceName: selectedWebService,
                },
              ],
            },
          };
        }
        setShowMapping(false); //Added on 02/11/2023, bug_id:140353
        setlocalLoadedActivityPropertyData(temp);
        // --------------------------
        dispatch(
          setActivityPropertyChange({
            [propertiesLabel.webService]: {
              isModified: true,
              hasError: false,
            },
          })
        );
      }
    }
  };

  const validateFunc = () => {
    let isValid = true;
    let type = null;
    let newAssociateList = localLoadedActivityPropertyData?.ActivityProperty
      ?.webserviceInfo?.objWebServiceDataInfo
      ? [
          ...localLoadedActivityPropertyData.ActivityProperty.webserviceInfo
            .objWebServiceDataInfo,
        ]
      : [];
    newAssociateList?.forEach((el) => {
      if (isValid) {
        if (!el.fwdParamMapList) {
          isValid = false;
          type = "FW";
        } else if (el.fwdParamMapList) {
          let minMapping = false;
          el.fwdParamMapList?.forEach((ele) => {
            if (ele.mapField) {
              minMapping = true;
            }
          });
          if (!minMapping) {
            isValid = false;
            type = "FW";
          }
        }
        //code edited on 22 Aug 2022 for BugId 112019
        if (el.invocationType == "A" && el.asynchActId == "0") {
          isValid = false;
          type = "JMS";
        } else if (
          el.invocationType !== "F" &&
          isValid &&
          !el.revParamMapList
        ) {
          isValid = false;
          type = "RW";
        } else if (el.invocationType !== "F" && isValid && el.revParamMapList) {
          let minMapping = false;
          el.revParamMapList?.forEach((ele) => {
            if (ele.mapField) {
              minMapping = true;
            }
          });
          if (!minMapping) {
            isValid = false;
            type = "RW";
          }
        }
      }
    });
    if (isValid) {
      return {
        isValid: true,
      };
    } else {
      return {
        isValid: false,
        type: type,
      };
    }
  };

  const LandOnCatelogHandler = () => {
    setShowCatelogScreen(true);
  };

  const handleAssociationDelete = (row) => {
    let tempVariablesList = [...associations];
    let tempVariablesList_Filtered = tempVariablesList.filter((variable) => {
      return variable.id !== row.id;
    });
    setShowMapping(false); //Modified on 02/11/2023, bug_id:140353
    if (tempVariablesList_Filtered?.length === 0) {
      // setShowMapping(false); //Modified on 02/11/2023, bug_id:140353
      setServiceNameClicked(null);
    }
    setAssociations(tempVariablesList_Filtered);
    // Delete association permanently from get Activity Call
    // code edited on 30 August 2022 for BugId 113881
    let temp = JSON.parse(JSON.stringify(localLoadedActivityPropertyData));
    let idx = null;
    temp?.ActivityProperty?.webserviceInfo?.objWebServiceDataInfo?.forEach(
      (el, index) => {
        if (el.methodIndex === row.id) {
          idx = index;
        }
      }
    );
    temp.ActivityProperty.webserviceInfo.objWebServiceDataInfo.splice(idx, 1);
    setlocalLoadedActivityPropertyData(temp);
    dispatch(
      setActivityPropertyChange({
        [propertiesLabel.webService]: { isModified: true, hasError: false },
      })
    );
  };

  const tabLandscape = useMediaQuery(
    "(min-width: 999px) and (max-width: 1280px)"
  );
  /*code changes on 21 June 2022 for BugId 110907 */
  return (
    <div>
      {/*code edited on 22 July 2022 for BugId 111320 */}
      {spinner ? (
        <CircularProgress
          style={{ marginTop: "30vh", marginInlineStart: "40%" }}
        />
      ) : (
        <div
          style={{
            display: "flex",
            borderRight:
              props.isDrawerExpanded && showMapping
                ? "1px solid #CECECE"
                : "none",
          }}
        >
          <div
            style={{
              borderRight: "1px solid #F4F4F4",
              width: props.isDrawerExpanded && showMapping ? "50%" : "100%",
            }}
          >
            <div style={{ padding: "0.5rem 1vw" }}>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  // justifyContent: "space-between",
                  marginBottom: "1rem",
                  // width: "22vw",
                }}
              >
                <p
                  style={{
                    fontSize: "var(--subtitle_text_font_size)",
                    color: "#000000",
                    fontWeight: "700",
                    marginInlineEnd: "1rem",
                  }}
                >
                  {t("webService")}
                </p>
                {!isProcessDeployedFunc(localLoadedProcessData) &&
                  !isReadOnly && (
                    <p
                      style={{
                        fontSize: "var(--base_text_font_size)",
                        color: "var(--link_color)",
                        fontWeight: "600",
                        cursor: "pointer",
                      }}
                      onClick={() => {
                        LandOnCatelogHandler();
                      }}
                      className="icon"
                      id="pmweb_webService_goToCatalog"
                      tabIndex={0}
                      onKeyUp={(e) => {
                        if (e.key === "Enter") {
                          LandOnCatelogHandler();
                          e.stopPropagation();
                        }
                      }}
                    >
                      {/*code edited on 21 June 2022 for BugId 110908*/}
                      {t("GoToCatalog")}
                    </p>
                  )}
              </div>
              <div
                style={{
                  display: props.isDrawerExpanded ? "flex" : "block",
                  alignItems: props.isDrawerExpanded ? "start" : "normal",
                  // gap: "1vw",
                  gap: "1rem",
                }}
              >
                <div
                  style={{
                    marginBottom: "1rem",
                    flex: props.isDrawerExpanded ? null : 1,
                    width: props.isDrawerExpanded ? "40%" : null,
                  }}
                >
                  <label
                    style={{
                      fontSize: "var(--base_text_font_size)",
                      color: "#886F6F",
                      width: "100%",
                    }}
                    htmlFor="pmweb_webService_webService"
                  >
                    {t("webService")}
                    <span className="starIcon">*</span>
                  </label>
                  {/* <Select
                    className="select_webService"
                    onChange={(e) => {
                      // code edited on 30 August 2022 for BugId 113881
                      setSelectedWebService(e.target.value);
                      setAssociateButtonClicked(false);
                    }}
                    style={{
                      fontSize: "var(--base_text_font_size)",
                      // width: props.isDrawerExpanded ? "22vw" : "100%",
                      width: "100%",
                      marginLeft: "1px",
                    }}
                    value={selectedWebService}
                    disabled={isReadOnly}
                    MenuProps={{
                      // Bug 126235 - webservice>>dropdown should open in downward direction
                      // only as scroll bar is already available
                      // [05-04-2023] Added style-> maxHeight
                      style: { maxHeight: "50vh" },
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
                    {webServicesList?.map((list) => {
                      return (
                        <MenuItem
                          key={list.AppName}
                          value={list.AppName}
                          style={{
                            fontSize: "var(--base_text_font_size)",
                            padding: "4px",
                          }}
                        >
                          {list.AppName}
                        </MenuItem>
                      );
                    })}
                  </Select> */}
                  <CustomizedDropdown
                    variant="outlined"
                    isMandatory={true}
                    className="select_webService"
                    ariaLabel="Select webservice"
                    id="pmweb_webService_webService"
                    onChange={(e) => {
                      // code edited on 30 August 2022 for BugId 113881
                      setSelectedWebService(e.target.value);
                      setAssociateButtonClicked(false);
                    }}
                    style={{
                      fontSize: "var(--base_text_font_size)",
                      // width: props.isDrawerExpanded ? "22vw" : "100%",
                      width: "100%",
                      marginLeft: "1px",
                    }}
                    value={selectedWebService}
                    disabled={isReadOnly}
                  >
                    {webServicesList?.map((list) => {
                      return (
                        <MenuItem
                          key={list.AppName}
                          value={list.AppName}
                          style={{
                            fontSize: "var(--base_text_font_size)",
                            padding: "4px",
                            justifyContent:
                              direction === RTL_DIRECTION ? "end" : null,
                          }}
                        >
                          {list.AppName}
                        </MenuItem>
                      );
                    })}
                  </CustomizedDropdown>
                </div>

                <div
                  style={{
                    marginBottom: "1rem",
                    display: "flex",
                    flexDirection: "column",
                    flex: props.isDrawerExpanded ? null : 1,
                    width: props.isDrawerExpanded ? "30%" : null,
                  }}
                >
                  <label
                    style={{
                      fontSize: "var(--base_text_font_size)",
                      color: "#886F6F",
                      width: "100%",
                    }}
                  >
                    {t("method")}
                    <span className="starIcon">*</span>
                  </label>
                  {/* <Select
                    className="select_webService"
                    onChange={(e) => setSelectedMethod(e.target.value)}
                    style={{
                      fontSize: "var(--base_text_font_size)",
                      border:
                        !selectedMethod && associateButtonClicked
                          ? "1px solid red"
                          : "1px solid #CECECE",
                      // width: props.isDrawerExpanded ? "22vw" : "100%",
                      width: "100%",
                    }}
                    value={selectedMethod}
                    disabled={selectedWebService || !isReadOnly ? false : true}
                    MenuProps={{
                      // Bug 126235 - webservice>>dropdown should open in downward direction
                      // only as scroll bar is already available
                      // [05-04-2023] Added style-> maxHeight
                      style: { maxHeight: "50vh" },
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
                    {methodsList &&
                      methodsList.map((method) => {
                        return (
                          <MenuItem
                            key={method.MethodName}
                            value={method.MethodName}
                            style={{
                              fontSize: "var(--base_text_font_size)",
                              padding: "4px",
                            }}
                          >
                            {method.MethodName}
                          </MenuItem>
                        );
                      })}
                  </Select> */}
                  <CustomizedDropdown
                    variant="outlined"
                    isMandatory={true}
                    className="select_webService"
                    ariaLabel="select method"
                    onChange={(e) => setSelectedMethod(e.target.value)}
                    id="pmweb_webService_methodDropdown"
                    style={{
                      fontSize: "var(--base_text_font_size)",
                      border:
                        !selectedMethod && associateButtonClicked
                          ? "1px solid red"
                          : "1px solid #CECECE",
                      // width: props.isDrawerExpanded ? "22vw" : "100%",
                      width: "100%",
                    }}
                    value={selectedMethod}
                    disabled={selectedWebService || !isReadOnly ? false : true}
                  >
                    {methodsList &&
                      methodsList.map((method) => {
                        return (
                          <MenuItem
                            key={method.MethodName}
                            value={method.MethodName}
                            style={{
                              fontSize: "var(--base_text_font_size)",
                              padding: "4px",
                              justifyContent:
                                direction === RTL_DIRECTION ? "end" : null,
                            }}
                          >
                            {method.MethodName}
                          </MenuItem>
                        );
                      })}
                  </CustomizedDropdown>
                  {!selectedMethod && associateButtonClicked ? (
                    <span
                      style={{ fontSize: "11px", color: "rgb(181, 42, 42)" }}
                    >
                      {t("PleaseSelectMethod")}
                    </span>
                  ) : null}
                </div>

                <div
                  style={{
                    display: "flex",
                    justifyContent: props.isDrawerExpanded ? "start" : "end",
                    flex: props.isDrawerExpanded ? null : 2,
                    width: props.isDrawerExpanded ? "30%" : null,
                    marginTop: "1rem",
                  }}
                >
                  {!isReadOnly && (
                    <button
                      className={
                        isReadOnly
                          ? "disabledButton_webSProp"
                          : "associateButton_webSProp"
                      }
                      onClick={() => associateServiceNMethod()}
                      id="pmweb_webService_associateBtn"
                      disabled={isReadOnly}
                    >
                      {t("associate")}
                    </button>
                  )}
                </div>
              </div>
            </div>
            {/* ---------------------------- */}
            <div style={{ padding: "0 1vw" }}>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                }}
              >
                <p
                  style={{
                    fontSize: "1.05rem",
                    color: "#000000",
                    fontWeight: "600",
                  }}
                >
                  {t("AssociatedWebservicesandMethods")}
                </p>
              </div>
            </div>
            <ServiceAndMethods
              showMapping={showMapping}
              setShowMapping={setShowMapping}
              associations={associations}
              setAssociations={setAssociations}
              isDrawerExpanded={props.isDrawerExpanded}
              setServiceNameClicked={setServiceNameClicked}
              handleAssociationDelete={handleAssociationDelete}
              isReadOnly={isReadOnly}
            />
            {/* ----------------------------------- */}
          </div>
          {props.isDrawerExpanded && showMapping ? (
            <Mapping
              serviceNameClicked={serviceNameClicked}
              combinations={
                localLoadedActivityPropertyData?.ActivityProperty
                  ?.webserviceInfo?.objWebServiceDataInfo
              }
              completeList={webServicesList}
              value={value}
              setValue={setValue}
              isReadOnly={isReadOnly}
            />
          ) : null}
        </div>
      )}
      {showCatelogScreen ? (
        <Modal
          show={showCatelogScreen}
          style={{
            // changes added for bug_id: 134226
            // changes modified for bug_id: 138199
            // top:  "8%",

            top: tabLandscape ? "2%" : "8%",
            left: "10%",
            width: "80%",
            zIndex: "1500",
            boxShadow: "0px 3px 6px #00000029",
            padding: "0",
          }}
          children={
            // code edited on 20 June 2022 for BugId 110910
            <CatalogScreenModal
              closeFunc={() => setShowCatelogScreen(false)}
              isReadOnly={isReadOnly}
              onKeyUp={(e) => {
                if (e.key === "Enter") {
                  setShowCatelogScreen(false);
                  e.stopPropagation();
                }
              }}
            />
          }
        ></Modal>
      ) : null}
    </div>
  );
}
const mapStateToProps = (state) => {
  return {
    isDrawerExpanded: state.isDrawerExpanded.isDrawerExpanded,
    openProcessID: state.openProcessClick.selectedId,
    cellCheckedOut: state.selectedCellReducer.selectedCheckedOut,
    cellLaneId: state.selectedCellReducer.selectedActLaneId,
    openTemplateFlag: state.openTemplateReducer.openFlag,
  };
};

export default connect(mapStateToProps, null)(Webservice);
