import React, { useEffect, useState } from "react";
import axios from "axios";
import { connect, useDispatch, useSelector } from "react-redux";
import { CircularProgress, MenuItem } from "@material-ui/core";
import Methods from "./methods.js";
import {
  SERVER_URL,
  ENDPOINT_GET_WEBSERVICE,
  propertiesLabel,
  RTL_DIRECTION,
} from "../../../../Constants/appConstants";
import { store, useGlobalState } from "state-pool";
import Mapping from "./mapping.js";
import "../Webservice/index.css";
import Modal from "../../../../UI/Modal/Modal.js";
import CatalogScreenModal from "../Webservice/CatalogScreenModal.js";
import { useTranslation } from "react-i18next";
import { setActivityPropertyChange } from "../../../../redux-store/slices/ActivityPropertyChangeSlice.js";
import { setToastDataFunc } from "../../../../redux-store/slices/ToastDataHandlerSlice.js";
import {
  ActivityPropertySaveCancelValue,
  setSave,
} from "../../../../redux-store/slices/ActivityPropertySaveCancelClicked.js";
import {
  isProcessDeployedFunc,
  isReadOnlyFunc,
} from "../../../../utility/CommonFunctionCall/CommonFunctionCall.js";
import { LatestVersionOfProcess } from "../../../../utility/abstarctView/checkLatestVersion.js";
import CustomizedDropdown from "../../../../UI/Components_With_ErrrorHandling/Dropdown/index.js";

function Restful(props) {
  let { t } = useTranslation();
  const direction = `${t("HTML_DIR")}`;
  const dispatch = useDispatch();
  const [methodsList, setMethodsList] = useState([]);
  const [selectedMethod, setSelectedMethod] = useState(null);
  const [associations, setAssociations] = useState([]);
  const [showMapping, setShowMapping] = useState(false);
  const [methodClicked, setMethodClicked] = useState(null);
  const loadedActivityPropertyData = store.getState("activityPropertyData");
  const [localLoadedActivityPropertyData, setlocalLoadedActivityPropertyData] =
    useGlobalState(loadedActivityPropertyData);
  const loadedProcessData = store.getState("loadedProcessData"); //current processdata clicked
  const [localLoadedProcessData] = useGlobalState(loadedProcessData);
  const [showCatelogScreen, setShowCatelogScreen] = useState(false);
  const [associateButtonClicked, setAssociateButtonClicked] = useState(false);
  const saveCancelStatus = useSelector(ActivityPropertySaveCancelValue);
  const [value, setValue] = useState(0); // Function to handle tab change.
  const [spinner, setspinner] = useState(true);
  let isReadOnly =
    props.openTemplateFlag ||
    isReadOnlyFunc(
      localLoadedProcessData,
      props.cellCheckedOut,
      props.cellLaneId
    ) ||
    LatestVersionOfProcess(localLoadedProcessData?.Versions) !==
      +localLoadedProcessData?.VersionNo; // modified on 05/09/2023 for BugId 136103;

  useEffect(() => {
    if (saveCancelStatus.SaveClicked) {
      let isValidObj = validateFunc();
      if (!isValidObj.isValid && isValidObj.type === "FW") {
        setValue(0);
        dispatch(
          setToastDataFunc({
            message: `${t("PleaseDefineAtleastOneForwardMapping")}`,
            severity: "error",
            open: true,
          })
        );
      } else if (!isValidObj.isValid && isValidObj.type === "RW") {
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
    }
  }, [saveCancelStatus.SaveClicked, saveCancelStatus.CancelClicked]);

  useEffect(() => {
    if (localLoadedProcessData?.ProcessDefId) {
      axios
        .get(
          SERVER_URL +
            ENDPOINT_GET_WEBSERVICE +
            localLoadedProcessData?.ProcessDefId
        )
        .then((res) => {
          let tempMethods = [];
          res?.data?.Methods?.RESTMethods?.forEach((method) => {
            tempMethods.push(method);
          });
          setMethodsList(tempMethods);
          // added on 04/10/23 for BugId 133154
          setspinner(false);
        })
        // added on 04/10/23 for BugId 133154
        .catch((err) => {
          console.log(err);
          setspinner(false);
        });
    }
  }, []);

  useEffect(() => {
    let tempAssoc = [];
    methodsList?.map((method) => {
      localLoadedActivityPropertyData?.ActivityProperty?.restFullInfo?.assocMethodList?.map(
        (el) => {
          if (el.methodIndex == method.MethodIndex) {
            tempAssoc.push({
              method: method.MethodName,
              id: method.MethodIndex,
            });
          }
        }
      );
    });
    setAssociations(tempAssoc);
    let isValidObj = {};
    isValidObj = validateFunc();
    if (isValidObj && !isValidObj.isValid) {
      dispatch(
        setActivityPropertyChange({
          [propertiesLabel.Restful]: { isModified: true, hasError: true },
        })
      );
    }
  }, [methodsList, localLoadedActivityPropertyData]);

  const validateFunc = () => {
    let isValid = true;
    let type = null;
    let newAssociateList = localLoadedActivityPropertyData?.ActivityProperty
      ?.restFullInfo?.assocMethodList
      ? [
          ...localLoadedActivityPropertyData.ActivityProperty.restFullInfo
            .assocMethodList,
        ]
      : [];
    newAssociateList?.forEach((el) => {
      if (isValid) {
        if (!el.mappingInfoList) {
          isValid = false;
          type = "FW";
        } else if (el.mappingInfoList) {
          let minForMapping = false;
          let minRevMapping = false;
          el.mappingInfoList?.forEach((ele) => {
            if (ele.mappingType === "F") {
              minForMapping = true;
            }
            if (ele.mappingType === "R") {
              minRevMapping = true;
            }
          });
          if (!minForMapping) {
            isValid = false;
            type = "FW";
          } else if (!minRevMapping) {
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

  const associateMethod = () => {
    setAssociateButtonClicked(true);
    if (selectedMethod) {
      let combExists = false;
      // Not allowing addition of already existing webservice and method combination
      localLoadedActivityPropertyData?.ActivityProperty?.restFullInfo?.assocMethodList?.forEach(
        (el) => {
          if (el.methodIndex == selectedMethod) {
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
        let methodName;
        methodsList?.map((method) => {
          if (method.MethodIndex == selectedMethod) {
            methodName = method.MethodName;
          }
        });
        // Saving Data
        let temp = { ...localLoadedActivityPropertyData };
        if (temp?.ActivityProperty?.restFullInfo) {
          if (temp?.ActivityProperty?.restFullInfo?.assocMethodList) {
            temp.ActivityProperty.restFullInfo.assocMethodList.push({
              mappingInfoList: [],
              methodIndex: selectedMethod,
              methodName: methodName,
              timeoutInterval: "10",
            });
          } else {
            temp.ActivityProperty.restFullInfo = {
              ...temp.ActivityProperty.restFullInfo,
              assocMethodList: [
                {
                  mappingInfoList: [],
                  methodIndex: selectedMethod,
                  methodName: methodName,
                  timeoutInterval: "10",
                },
              ],
            };
          }
        } else {
          temp.ActivityProperty = {
            ...temp.ActivityProperty,
            restFullInfo: {
              assocMethodList: [
                {
                  mappingInfoList: [],
                  methodIndex: selectedMethod,
                  methodName: methodName,
                  timeoutInterval: "10",
                },
              ],
            },
          };
        }

        setlocalLoadedActivityPropertyData(temp);
        // --------------------------
        dispatch(
          setActivityPropertyChange({
            [propertiesLabel.Restful]: {
              isModified: true,
              hasError: false,
            },
          })
        );
      }
    }
    setShowMapping(false); //Added on 05/11/2023, bug_id:140353
  };

  const LandOnCatelogHandler = () => {
    setShowCatelogScreen(true);
  };

  const handleAssociationDelete = (row) => {
    let tempVariablesList = [...associations];
    let tempVariablesList_Filtered = tempVariablesList.filter((variable) => {
      return variable.id !== row.id;
    });
    setShowMapping(false); //Modified on 05/11/2023, bug_id:140353
    if (tempVariablesList_Filtered?.length === 0) {
      // setShowMapping(false);
      setMethodClicked(null);
    }
    // Delete association permanently from get Activity Call
    let temp = { ...localLoadedActivityPropertyData };
    let idx = null;
    temp?.ActivityProperty?.restFullInfo?.assocMethodList?.forEach(
      (el, index) => {
        if (el.methodIndex === row.id) {
          idx = index;
        }
      }
    );
    temp.ActivityProperty.restFullInfo.assocMethodList.splice(idx, 1);
    setlocalLoadedActivityPropertyData(temp);
    dispatch(
      setActivityPropertyChange({
        [propertiesLabel.Restful]: { isModified: true, hasError: false },
      })
    );
  };

  return (
    <div>
      {spinner ? (
        <CircularProgress
          style={{ marginTop: "30vh", marginInlineStart: "40%" }}
        />
      ) : (
        <div
          style={{
            display: "flex",
            borderInlineEnd:
              props.isDrawerExpanded && showMapping
                ? "1px solid #CECECE"
                : "none",
          }}
        >
          <div
            style={{
              borderInlineEnd: "1px solid #F4F4F4",
              width: props.isDrawerExpanded && showMapping ? "50%" : "100%",
            }}
          >
            <div style={{ padding: "0.5rem 1vw" }}>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  marginBottom: "1rem",
                }}
              >
                <p
                  style={{
                    fontSize: "var(--subtitle_text_font_size)",
                    color: "#000000",
                    fontWeight: "700",
                    lineHeight: "17px",
                  }}
                >
                  {t(props?.heading)}
                </p>
                {!isProcessDeployedFunc(localLoadedProcessData) && (
                  <p
                    style={{
                      fontSize: "var(--base_text_font_size)",
                      color: "var(--link_color)",
                      fontWeight: "600",
                      cursor: "pointer",
                      marginInlineStart: "1.5vw",
                    }}
                    onClick={() => LandOnCatelogHandler()}
                    id="pmweb_restful_goToCatalog"
                    tabIndex={0}
                    onKeyUp={(e) => {
                      if (e.key === "Enter") {
                        LandOnCatelogHandler();
                        e.stopPropagation();
                      }
                    }}
                    className="icon"
                  >
                    {t("GoToCatalog")}
                  </p>
                )}
              </div>
              <div
                style={{
                  display: props.isDrawerExpanded ? "flex" : "block",
                  alignItems: props.isDrawerExpanded ? "end" : "normal",
                  gap: "1vw",
                }}
              >
                <div
                  style={{
                    marginBottom: "1rem",
                    display: "flex",
                    flexDirection: "column",
                    flex: 1,
                  }}
                >
                  <p
                    style={{
                      fontSize: "var(--base_text_font_size)",
                      color: "#886F6F",
                      width: "100%",
                    }}
                  >
                    {t("method")}
                  </p>
                  {/* <Select
                  className="select_webService"
                  onChange={(e) => setSelectedMethod(e.target.value)}
                  style={{
                    fontSize: "var(--base_text_font_size)",
                    border:
                      !selectedMethod && associateButtonClicked
                        ? "1px solid red"
                        : "1px solid #CECECE",
                    width: props.isDrawerExpanded ? "22vw" : "100%",
                  }}
                  value={selectedMethod}
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
                    PaperProps: {
                      style: {
                        maxHeight: "10rem",
                      },
                    },
                  }}
                >
                  {methodsList?.map((method) => {
                    return (
                      <MenuItem
                        key={method.MethodIndex}
                        value={method.MethodIndex}
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
                    className="select_webService"
                    onChange={(e) => setSelectedMethod(e.target.value)}
                    ariaLabel="Select webservice"
                    id="pmweb_restful_methodDropdown"
                    style={{
                      fontSize: "var(--base_text_font_size)",
                      border:
                        !selectedMethod && associateButtonClicked
                          ? "1px solid red"
                          : "1px solid #CECECE",
                      width: props.isDrawerExpanded ? "22vw" : "100%",
                    }}
                    value={selectedMethod}
                    disabled={isReadOnly}
                  >
                    {methodsList?.map((method) => {
                      return (
                        <MenuItem
                          key={method.MethodIndex}
                          value={method.MethodIndex}
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
                </div>
                <div
                  style={{
                    display: "flex",
                    justifyContent: props.isDrawerExpanded ? "start" : "end",
                    flex: 3,
                    marginBottom: "0.5rem",
                  }}
                >
                  <button
                    className={
                      isReadOnly
                        ? "disabledButton_webSProp"
                        : "associateButton_webSProp"
                    }
                    disabled={isReadOnly}
                    onClick={() => associateMethod()}
                    id="pmweb_restful_associateBtn"
                  >
                    {t("associate")}
                  </button>
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
            <Methods
              methodsList={methodsList}
              showMapping={showMapping}
              setShowMapping={setShowMapping}
              associations={associations}
              setMethodClicked={setMethodClicked}
              isDrawerExpanded={props.isDrawerExpanded}
              handleAssociationDelete={handleAssociationDelete}
              isReadOnly={isReadOnly}
            />
          </div>
          {props.isDrawerExpanded && showMapping ? (
            <Mapping
              completeList={methodsList}
              methodClicked={methodClicked}
              combinations={
                localLoadedActivityPropertyData?.ActivityProperty?.restFullInfo
                  ?.assocMethodList
              }
              isReadOnly={isReadOnly}
              value={value}
              setValue={setValue}
            />
          ) : null}
        </div>
      )}
      {showCatelogScreen ? (
        <Modal
          show={showCatelogScreen}
          style={{
            top: "10%",
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

export default connect(mapStateToProps, null)(Restful);
