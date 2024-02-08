// #BugID - 118751
// #BugDescription - Added tootltip for delete and remove and handled the bydefault feature list to prevent the deletion.
// #Date - 11 November 2022
import React, { useState, useEffect } from "react";
import CircularProgress from "@material-ui/core/CircularProgress";
import AddOutlinedIcon from "@material-ui/icons/AddOutlined";
import ClearOutlinedIcon from "@material-ui/icons/ClearOutlined";
import axios from "axios";
import {
  SERVER_URL,
  ENDPOINT_GET_PROCESS_FEATURES,
  ENDPOINT_INCLUDE_PROCESS_FEATURE,
  ENDPOINT_EXCLUDE_PROCESS_FEATURE,
  MAX_AVAILABLE_FEATURES_ID,
  ENDPOINT_POST_REGISTER_WINDOW,
  PROCESSTYPE_REGISTERED,
} from "../../../Constants/appConstants";
import "./index.css";
import { useTranslation } from "react-i18next";
import FeatureListing from "../../../UI/FeatureListing";
import { store, useGlobalState } from "state-pool";
import Modal from "../../../UI/Modal/Modal";
import FeatureModal from "./FeatureModal/index";
import { Tooltip, useMediaQuery } from "@material-ui/core";
import { LatestVersionOfProcess } from "../../../utility/abstarctView/checkLatestVersion";
import notAllowedIcon from "../../../assets/ProcessView/not-allowed.svg";
import ActionIcon from "../../../assets/ProcessFeature/Action.svg";
import ArchiveIcon from "../../../assets/ProcessFeature/Archive.svg";
import CustomIcon from "../../../assets/ProcessFeature/Custom.svg";
import DocumentIcon from "../../../assets/ProcessFeature/Document.svg";
import DynamicCaseIcon from "../../../assets/ProcessFeature/DynamicCase.svg";
import ExceptionIcon from "../../../assets/ProcessFeature/Exception.svg";
import FormViewIcon from "../../../assets/ProcessFeature/Formview.svg";
import MobileIcon from "../../../assets/ProcessFeature/Mobile.svg";
import PrintFaxEmailIcon from "../../../assets/ProcessFeature/PrintFaxEmail.svg";
import SAPGUIAdapterIcon from "../../../assets/ProcessFeature/SAP.svg";
import ScanToolIcon from "../../../assets/ProcessFeature/ScanTool.svg";
import ToDoIcon from "../../../assets/ProcessFeature/ToDo.svg";
import { isProcessDeployedFunc } from "../../../utility/CommonFunctionCall/CommonFunctionCall";

function IncludeFeature(props) {
  let { t } = useTranslation();
  const [isLoading, setIsLoading] = useState(true);
  const [usedFeatures, setUsedFeatures] = useState([]);
  const [availableFeatures, setAvailableFeatures] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const direction = `${t("HTML_DIR")}`;
  const [allData, setallData] = useState([]);
  const [isDisable, setIsDisable] = useState(false);
  const loadedProcessData = store.getState("loadedProcessData");
  const [localLoadedProcessData] = useGlobalState(loadedProcessData);
  const [addNew, setaddNew] = useState(false);
  const [selected, setselected] = useState(null);
  const { isReadOnly } = props;
  const isZoomedIn = useMediaQuery("(max-width:800px)");

  const byDefaultFeatures = [
    t("action"),
    t("formView"),
    t("exceptions"),
    t("document"),
    t("archive"),
    t("printFaxEmail"),
    t("scanTool"),
    t("mobile"),
    t("dynamicCase"),
    // "Exception",
    t("todoListFeature"),
  ];

  const defaultFeatureIcons = [
    { featureName: t("action"), featureIcon: ActionIcon },
    { featureName: t("formView"), featureIcon: FormViewIcon },
    { featureName: t("exceptions"), featureIcon: ExceptionIcon },
    { featureName: t("document"), featureIcon: DocumentIcon },
    { featureName: t("archive"), featureIcon: ArchiveIcon },
    { featureName: t("printFaxEmail"), featureIcon: PrintFaxEmailIcon },
    { featureName: t("scanTool"), featureIcon: ScanToolIcon },
    { featureName: t("mobile"), featureIcon: MobileIcon },
    { featureName: t("dynamicCase"), featureIcon: DynamicCaseIcon },
    { featureName: t("todoListFeature"), featureIcon: ToDoIcon },
    { featureName: t("sapGuiAdapter"), featureIcon: SAPGUIAdapterIcon },
  ];

  useEffect(() => {
    if (
      props.openProcessType === PROCESSTYPE_REGISTERED ||
      props.openProcessType === "RC" ||
      LatestVersionOfProcess(localLoadedProcessData?.Versions) !==
        +localLoadedProcessData?.VersionNo
    ) {
      setIsDisable(true);
    } else {
      setIsDisable(false);
    }
  }, [props.openProcessType]);

  // Function to add a feature to the used features list.
  const handleAddFeature = (index) => {
    const [addFeature] = availableFeatures.splice(index, 1);
    setAvailableFeatures([...availableFeatures]);
    addFeature.Included = true;
    usedFeatures.splice(0, 0, addFeature);
    setUsedFeatures(usedFeatures);
    const outputArray = getOutputArray(addFeature);
    updateProcessFeatureCall(outputArray, ENDPOINT_INCLUDE_PROCESS_FEATURE);
  };

  // Function to remove a feature from the used features list.
  const handleRemoveFeature = (index) => {
    const [removeFeature] = usedFeatures.splice(index, 1);
    setUsedFeatures([...usedFeatures]);
    removeFeature.Included = false;
    availableFeatures.splice(0, 0, removeFeature);
    setAvailableFeatures(availableFeatures);
    const outputArray = getOutputArray(removeFeature);
    updateProcessFeatureCall(outputArray, ENDPOINT_EXCLUDE_PROCESS_FEATURE);
  };

  // Function to get the output array to be sent in the post body of the add and remove feature APIs.
  const getOutputArray = (featureObject) => {
    let dataArray = [];
    let outputArray = [];
    dataArray.push(featureObject);
    const tempArray = dataArray;
    tempArray.forEach((element) => {
      outputArray.push({
        isIncluded: element.Included,
        intefaceDefInfo: {
          interfaceId: element.InterfaceId,
          interfaceName: element.WindowName,
          clientInvocation: element.ClientInvocation,
          buttonName: element.ButtonName,
          menuName: element.MenuName,
          executeClass: element.ExecuteClass,
          executeClassWeb: element.ExecuteClassWeb,
          tableName: element.TableNames,
        },
      });
    });
    return outputArray;
  };
  // Function to handle API call for both add and remove feature functions.
  const updateProcessFeatureCall = (outputArray, url) => {
    const { openProcessID, openProcessName } = props;
    const changedDataObject = {
      processDefId: openProcessID,
      processName: openProcessName,
      versionType: "0",
      includedWinList: outputArray,
    };
    axios
      .post(SERVER_URL + url, changedDataObject)
      .then()
      .catch((err) => console.log(err));
  };

  // Function that gets the icon from defaultFeatureIcons array based on featureName provided as parameter.
  const getIconFromArray = (windowName) => {
    let icon = CustomIcon;
    defaultFeatureIcons?.forEach((element) => {
      if (element.featureName === windowName) {
        icon = element.featureIcon;
      }
    });
    return icon;
  };

  // Use Effect function runs for the initial render of the component.
  useEffect(() => {
    // code edited on 7 Nov 2022 for BugId 116221
    if (localLoadedProcessData?.ProcessDefId) {
      axios
        .get(
          SERVER_URL +
            `${ENDPOINT_GET_PROCESS_FEATURES}/${localLoadedProcessData.ProcessDefId}/${localLoadedProcessData.ProcessType}/S`
        )
        .then((res) => {
          if (res.status === 200) {
            setallData(res.data.GlobalInterfaceData);
            let used = res.data.GlobalInterfaceData?.filter((d) => {
              return d.Included === true;
            });
            setUsedFeatures([...used]);
            let available = res.data.GlobalInterfaceData?.filter((d) => {
              return d.Included === false;
            });

            if (!localLoadedProcessData?.SAPRequired) {
              available = available.filter(
                (d) => d.MenuName !== "SAPGUIAdapter"
              );
            }
            setAvailableFeatures([...available]);
            setIsLoading(false);
          }
        })
        .catch(() => setIsLoading(false));
    }
  }, [addNew, localLoadedProcessData?.ProcessDefId]);

  useEffect(() => {
    setIsLoading(true);
  }, [localLoadedProcessData?.ProcessDefId]);

  //code edited on 22 July 2022 for BugId 110821
  const handleDeleteFeature = (el, list, setFunc) => {
    let json = {
      interfaceId: el.InterfaceId,
      interfaceName: el.MenuName,
    };
    axios
      .delete(SERVER_URL + ENDPOINT_POST_REGISTER_WINDOW, {
        data: json,
        headers: { "Content-Type": "application/json" },
      })
      .then((res) => {
        if (res.status === 200) {
          let temp = [...list];
          temp.forEach((val, index) => {
            if (val.InterfaceId == el.InterfaceId) {
              temp.splice(index, 1);
            }
          });
          setFunc(temp);
        }
      })
      .catch((err) => console.log(err));
  };

  const EditUseFeature = (d) => {
    setselected(d);
  };

  if (isLoading) {
    return <CircularProgress className="circular-progress" />;
  } else
    return (
      <div
        style={{
          padding: "0.5rem",
          backgroundColor: "#f8f8f8",
          height: "78vh",
        }}
      >
        <div style={{ marginTop: "0.125rem" }}>
          <p
            className="process-features-heading"
            style={{
              margin: direction === "rtl" ? "0 1vw 0 0" : "0 0 0 1vw",
              textAlign: direction === "rtl" ? "right" : "left",
            }}
          >
            {t("processFeaturesHeading")}
          </p>

          {!isProcessDeployedFunc(localLoadedProcessData) && !isReadOnly && (
            <button
              id="pmweb_ProcessFeature_RegisterFeatureBtn"
              class="register-feature-button"
              style={{
                margin: direction === "rtl" ? "0 0 0 3.75rem" : "0 3.75rem 0 0",
                float: direction === "rtl" ? "left" : "right",
                cursor: "pointer",
              }}
              onClick={() => setIsModalOpen(true)}
            >
              <span> {t("registerFeatureButton")}</span>
            </button>
          )}

          {isModalOpen && (
            <Modal
              show={isModalOpen}
              /*code edited for Bug 124514 - register feature window is not appearing fully on the screen to register feature*/
              style={{
                top: isZoomedIn ? "8%" : "24%",
                padding: "0",
              }}
            >
              <FeatureModal
                setIsModalOpen={setIsModalOpen}
                setaddNew={setaddNew}
                allData={allData}
              />
            </Modal>
          )}

          <p
            className="process-features-description"
            style={{
              margin: direction === "rtl" ? "1.5% 1vw 0 0" : "1.5% 0 0 1vw",
              textAlign: direction === "rtl" ? "right" : "left",
            }}
          >
            {t("processFeatureDescription")}
          </p>
        </div>
        <div
          className="used-features-main-div"
          style={{
            margin:
              direction === "rtl" ? "0.875rem 1vw 0 0" : "0.875rem 0 0 1vw",
          }}
        >
          <div style={{ margin: "0rem 0.1rem 0rem 0.1rem" }}>
            <p
              style={{ textAlign: direction === "rtl" ? "right" : null }}
              className="used-features-heading"
            >
              {t("usedFeaturesHeading")}
            </p>
            <div className="used-features">
              {usedFeatures && usedFeatures.length === 0 ? (
                <div className="available-features-empty">
                  {t("usedFeaturesEmptyMessage")}
                </div>
              ) : (
                <div>
                  {usedFeatures?.map((d, index) => {
                    return (
                      <div
                        id={`pmweb_ProcessFeature_UsedFeaturesList${index}`}
                        className="used-features-subdiv"
                      >
                        <FeatureListing
                          maxAvailableFeaturesId={MAX_AVAILABLE_FEATURES_ID}
                          menuName={d.WindowName}
                          description={d.Description}
                          interfaceId={d.InterfaceId}
                          onClick={() => EditUseFeature(d)}
                          icon={getIconFromArray(d.WindowName)}
                          index={index}
                        />
                        {!isDisable && !isReadOnly ? (
                          <>
                            {
                              //code updated on 28 Nov 2022 for BugId 119831
                            }
                            {/*   {
                                byDefaultFeatures.includes(d.WindowName) ? (
                                ""
                              ) : (
                                <Tooltip title="Delete" arrow>
                                  <img
                                    className="remove-feature-icon"
                                    src={notAllowedIcon}
                                    style={{
                                      height: "1.3rem",
                                      width: "1.3rem",
                                      margin: "1.2rem .5rem 1.031rem auto",
                                    }}
                                    alt="Delete"
                                    onClick={() =>
                                      //code added on 22 July 2022 for BugId 110821
                                      handleDeleteFeature(
                                        d,
                                        usedFeatures,
                                        setUsedFeatures
                                      )
                                    }
                                    title="Delete"
                                  />
                                </Tooltip>
                              )
                              } */}
                            <Tooltip title={t("remove")} arrow>
                              <ClearOutlinedIcon
                                id="pmweb_ProcessFeature_RemoveFeatureBtn"
                                tabIndex={0}
                                onClick={() => handleRemoveFeature(index)}
                                className="remove-feature-icon"
                                title={t("remove")}
                              />
                            </Tooltip>
                          </>
                        ) : null}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
          <div style={{ margin: "0rem 0.2rem 0rem 0.2rem" }}>
            <p
              style={{
                textAlign: direction === "rtl" ? "right" : null,
                margin:
                  direction === "rtl"
                    ? "0.375rem 1.75rem 0.875rem 0"
                    : "0.375rem 0 0.875rem 1.75rem",
              }}
              className="available-features-heading"
            >
              {t("availableFeaturesHeading")}
            </p>
            <div
              className="available-features"
              style={{
                margin:
                  direction === "rtl" ? "0rem 1.75rem 0 0" : "0 0 0 1.75rem",
              }}
            >
              {availableFeatures && availableFeatures.length === 0 ? (
                <div
                  className="available-features-empty"
                  style={{ textAlign: direction === "rtl" ? "right" : "left" }}
                >
                  {t("availableFeaturesEmptyMessage")}
                </div>
              ) : (
                <div>
                  {availableFeatures?.map((d, index) => {
                    return (
                      <div
                        id={`pmweb_ProcessFeature_AvailableFeatureDiv${index}`}
                        className="available-features-subdiv"
                      >
                        <FeatureListing
                          maxAvailableFeaturesId={MAX_AVAILABLE_FEATURES_ID}
                          menuName={d.WindowName}
                          description={d.Description}
                          interfaceId={d.InterfaceId}
                          onClick={() => EditUseFeature(d)}
                          icon={getIconFromArray(d.WindowName)}
                          index={index}
                        />

                        {!isDisable ? (
                          <React.Fragment>
                            {/*****************************************************************************************
                             * @author asloob_ali BUG ID : 115860 Features || Mobile on services is not appearing
                             *  Resolution : restricted user to not delete default features.
                             *  Date : 19/09/2022             ****************/}
                            {d.InterfaceId > 12 && (
                              <>
                                {byDefaultFeatures?.includes(d.WindowName) ? (
                                  ""
                                ) : (
                                  <Tooltip title={t("delete")} arrow>
                                    <img
                                      id="pmweb_ProcessFeature_DeleteFeatureBtn"
                                      className="remove-feature-icon"
                                      style={{
                                        height: "1.3rem",
                                        width: "1.3rem",
                                        margin: "1.2rem .5rem 1.031rem auto",
                                      }}
                                      alt={t("delete")}
                                      src={notAllowedIcon}
                                      tabIndex={0}
                                      onClick={() =>
                                        //code added on 22 July 2022 for BugId 110821
                                        handleDeleteFeature(
                                          d,
                                          availableFeatures,
                                          setAvailableFeatures
                                        )
                                      }
                                      title={t("delete")}
                                    />
                                  </Tooltip>
                                )}
                              </>
                            )}
                            {!isReadOnly && (
                              <Tooltip title={t("add")} arrow>
                                <AddOutlinedIcon
                                  id="pmweb_ProcessFeature_AddFeatureBtn"
                                  className="add-feature-icon"
                                  onClick={() => handleAddFeature(index)}
                                  style={{
                                    color: "#0072C6",
                                    height: "1.688rem",
                                    width: "1.688rem",
                                    margin: "0.781rem .5rem 1.031rem 1rem",
                                  }}
                                />
                              </Tooltip>
                            )}
                          </React.Fragment>
                        ) : null}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
        {selected ? (
          <Modal
            show={selected}
            /*code edited for Bug 124514 - register feature window is not appearing fully on the screen to register feature*/
            style={{
              width: "30%",
              left: "40%",
              top: "24%",
              padding: "0",
            }}
          >
            <FeatureModal
              setIsModalOpen={() => setselected(null)}
              setaddNew={setaddNew}
              allData={allData}
              type="Edit"
              selected={selected}
            />
          </Modal>
        ) : null}
      </div>
    );
}

export default IncludeFeature;
