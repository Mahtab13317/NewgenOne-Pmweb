import React, { useState, useEffect, useRef } from "react";
import { CircularProgress, useTheme, useMediaQuery } from "@material-ui/core";
import Modal from "../../UI/Modal/Modal";
import { useGlobalState, store } from "state-pool";
import { useTranslation } from "react-i18next";
import axios from "axios";
import styles from "./ViewForms.module.css";
import {
  BASE_URL,
  ENDPOINT_GET_FORMASSOCIATIONS,
  PROCESSTYPE_LOCAL,
  SERVER_URL,
} from "../../Constants/appConstants.js";
import LayoutSelection from "./LayoutSelection/LayoutSelection.js";
import RuleListForm from "./RuleListForm/RuleListForm.js";
import MockSvg from "../../assets/MockSvg.svg";
import { useDispatch, useSelector } from "react-redux";
import {
  InitialRenderSliceValue,
  setValueInitialRender,
} from "../../redux-store/slices/InitialRenderSlice";
import { setToastDataFunc } from "../../redux-store/slices/ToastDataHandlerSlice";

function ViewsForms(props) {
  let { t } = useTranslation();
  const initialRenderBoolean = useSelector(InitialRenderSliceValue);
  const dispatch = useDispatch();
  const refDiv = useRef(null);

  const loadedProcessData = store.getState("loadedProcessData"); //current processdata clicked
  const [localLoadedProcessData] = useGlobalState(loadedProcessData);
  const formsList = store.getState("allFormsList");

  const [allGlobalFormsList, setallGlobalFormsList] = useGlobalState(formsList);

  const [layoutSelectionFlow, setlayoutSelectionFlow] = useState(false);
  const [allFormsList, setallFormsList] = useState([]);
  const [isSingleFormAttached, setisSingleFormAttached] = useState(false);
  const [spinner, setspinner] = useState(true);
  const [formAssociationData, setformAssociationData] = useGlobalState(
    "allFormAssociationData"
  );
  const [formIdtoDisplay, setformIdtoDisplay] = useState();
  const [rulesModalOpen, setrulesModalOpen] = useState(false);
  const [selectedFormBox, setSelectedFormBox] = useState(0);
  const { isReadOnly } = props;

  const theme = useTheme();
  const matchesTab = useMediaQuery(theme.breakpoints.down("md"));

  const getAllForms = async () => {
    let processType;
    switch (localLoadedProcessData?.ProcessType) {
      case "L":
        processType = "local";
        break;
      case "R":
        processType = "registered";
        break;
      case "RC":
        processType = "registered";
        break;
      case "E":
        processType = "registered";
        break;
      case "EC":
        processType = "registered";
        break;
      default:
        processType = "local";
    }
    try {
      const res = await axios.get(
        BASE_URL +
          `/process/${processType}/getFormlist/${localLoadedProcessData?.ProcessDefId}`
      );
      //code changes for 131976
      // if (res.data.length > 0) {
      dispatch(setValueInitialRender(false));
      // }
      setallFormsList([
        { formId: -1, formName: "HTML", deviceType: "H" },
        ...res.data,
      ]);
      setallGlobalFormsList([
        { formId: -1, formName: "HTML", deviceType: "H" },
        ...res.data,
      ]);
    } catch (err) {
      console.log(err);
          //code added for bug id 138998 on 27-10

      dispatch(
        setToastDataFunc({
          message: err?.response?.data?.errorMsg,
          severity: "error",
          open: true,
        })
      );
    }
  };

  const getFormDetailsById = (id) => {
    let temp = {};
    allGlobalFormsList.some((form) => {
      if (form.formId + "" == id + "") {
        temp = form;
        return true;
      }
    });

    return temp;
  };

  useEffect(() => {
    // code edited on 5 Dec 2022 for BugId 120080
    if (localLoadedProcessData) {
      getAllForms();
    }
    setspinner(true);
  }, [localLoadedProcessData?.ProcessDefId]);

  const getProcessType = (processType) => {
    let temp;
    switch (processType) {
      case "L":
        temp = "L";
        break;
      case "R":
        temp = "R";
        break;
      case "LC":
        temp = "L";
        break;
      default:
        temp = "R";
    }
    return temp;
  };

  useEffect(() => {
    const getFormAssocData = async () => {
      const res = await axios.get(
        SERVER_URL +
          `${ENDPOINT_GET_FORMASSOCIATIONS}/${
            localLoadedProcessData.ProcessDefId
          }/${getProcessType(localLoadedProcessData.ProcessType)}`
      );
      if (res?.data?.FormAssociations?.formsInfos?.length === 0) {
        setlayoutSelectionFlow(true);
      } else {
        setformIdtoDisplay(res?.data?.FormAssociations?.formsInfos[0]?.formId);
      }

      setformAssociationData(res?.data?.FormAssociations?.formsInfos);
      setspinner(false);
    };
    // code edited on 5 Dec 2022 for BugId 120080
    if (localLoadedProcessData?.ProcessDefId) {
      getFormAssocData();
    }
  }, [localLoadedProcessData?.ProcessDefId]); // code edited on 5 Dec 2022 for BugId 120080

  const getFormId = () => {
    if (formAssociationData?.length > 0) {
      const result = formAssociationData?.every(
        (assocData) => +assocData.formId === +formAssociationData[0]?.formId
      );

      if (result === true && formAssociationData[0]?.formId) {
        handleViewForm(+formAssociationData[selectedFormBox]?.formId);
        //  setformIdtoDisplay(+formAssociationData[0]?.formId);
        setisSingleFormAttached(true);
      } else {
        setisSingleFormAttached(false);
        // setformIdtoDisplay(+formAssociationData[0]?.formId);
        handleViewForm(+formAssociationData[selectedFormBox]?.formId);
      }
    }
  };

  useEffect(() => {
    getFormId();
  }, [
    spinner,
    refDiv.current,
    selectedFormBox,
    formIdtoDisplay,
    layoutSelectionFlow,
  ]);
  useEffect(() => {
    if (formAssociationData?.length > 0) {
      setformIdtoDisplay(formAssociationData[selectedFormBox]?.formId);
    }
  }, [selectedFormBox, formAssociationData]);

  const handleViewForm = (formId) => {
    if (formAssociationData?.length > 0 && !!formId && formId > -1) {
      let passedData = {
        // applicationId: activeId,
        component: "preview",
        containerId: "mf_forms_home_show",
        formDefId: +formId,
        processId: +localLoadedProcessData?.ProcessDefId, // code edited on 13 Dec 2022 for BugId 120080
        // formName: obj.value.formName,
        // formType: props.formType,
        formPageType: "Processes",

        device: "web", // code added on 05-10-23 for BugId 136219
        statusType: localLoadedProcessData?.ProcessType, // code edited on 13 Dec 2022 for BugId 120080
      };
      window.loadFormBuilderPreview(passedData, "mf_forms_home_show");
    }
  };

  const displayFormMicrofrontend = (index) => {
    setSelectedFormBox(index);

    handleViewForm(+formAssociationData[index]?.formId);
    // setformIdtoDisplay(formAssociationData[index]?.formId)
  };

  const closeModal = () => {
    dispatch(setValueInitialRender(false));
    setlayoutSelectionFlow(false);
    setSelectedFormBox(0);
    // handleViewForm(formAssociationData[0]?.formId);
  };

  return (
    <>
      <div style={{ height: "82vh", width: "100vw" }}>
        {spinner ? (
          <div
            style={{
              display: "flex",
              width: "100%",
              height: "100%",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <CircularProgress />
          </div>
        ) : (
          <>
            <div
              style={{
                display: "flex",
                flexDirection: "row",
                alignItems: "center",
                width: "100%",
                //height: "8%",
                // marginLeft: "10px",
                fontSize: "var(--subtitle_text_font_size)",
                fontFamily: "Open Sans",
                paddingBlock: "5px",
                paddingInline: "10px",
                boxShadow: "0px 3px 6px #00000029",
                marginBottom: "10px",
              }}
            >
              <p style={{ fontWeight: "500" }}>{t("form")}: </p>
              <p style={{ fontWeight: "600", marginInline: "1rem" }}>
                {isSingleFormAttached
                  ? getFormDetailsById(
                      formAssociationData[selectedFormBox]?.formId
                    ).formName
                  : "Workstep wise Forms"}
              </p>
              {/* code edited on 5 Dec 2022 for BugId 120080  */}
              {localLoadedProcessData?.ProcessType === PROCESSTYPE_LOCAL &&
              !isReadOnly ? (
                <button
                  style={{
                    cursor: "pointer",
                  }}
                  className="secondary"
                  onClick={() => setlayoutSelectionFlow(true)}
                  id="pmweb_viewForm_changeBtn"
                >
                  {t("change")}
                </button>
              ) : null}
              {/* code edited on 5 Dec 2022 for BugId 120080  */}
              {localLoadedProcessData?.ProcessType === PROCESSTYPE_LOCAL &&
              !isReadOnly ? (
                <button
                  style={{
                    cursor: "pointer",
                  }}
                  className="secondary"
                  onClick={() => setrulesModalOpen(true)}
                  id="pmweb_viewForm_formRuleBtn"
                >
                  {t("formRules")}
                </button>
              ) : null}
            </div>

            {rulesModalOpen ? (
              <Modal
                show={rulesModalOpen}
                backDropStyle={{ backgroundColor: "transparent" }}
                style={{
                  width: "85vw",
                  height: matchesTab ? "65vh" : "90vh",
                  // left: props.isDrawerExpanded ? "23%" : "53%",
                  top: "50%",
                  left: "50%",
                  position: "fixed",
                  padding: "0",
                  boxShadow: "none",
                  transform: "translate(-50%,-50%)",
                }}
                modalClosed={() => setrulesModalOpen(false)}
                children={
                  <RuleListForm
                    closeModal={() => setrulesModalOpen(false)}
                    // direction={direction}
                  />
                }
              />
            ) : null}

            {!(layoutSelectionFlow || initialRenderBoolean) ? (
              <div style={{ height: "90%", width: "100%" }}>
                {formAssociationData?.length === 0 ? (
                  <div
                    style={{
                      display: "flex",
                      width: "100%",
                      height: "100%",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: "var(--title_text_font_size)",
                      fontWeight: "bold",
                      flexDirection: "column",
                    }}
                  >
                    <img
                      src={MockSvg}
                      alt={t("associateFormsPlease")}
                      style={{
                        width: "100px",
                        height: "100px",

                        marginBottom: "20px",
                      }}
                    />
                    {t("associateFormsPlease")}
                  </div>
                ) : (
                  <>
                    {isSingleFormAttached ? (
                      <>
                        {formIdtoDisplay == "-1" ? (
                          <div
                            style={{
                              width: "100%",
                              height: "100%",
                              overflow: "hidden",
                              display: "flex",
                              justifyContent: "center",
                              alignItems: "center",
                              fontSize: "var(--subtitle_text_font_size)",
                            }}
                          >
                            {t("htmlFormToBeShownHere")}
                          </div>
                        ) : (
                          <div
                            ref={refDiv}
                            id="mf_forms_home_show"
                            style={{
                              width: "100%",
                              height: "100%",
                              overflow: "hidden",
                            }}
                          ></div>
                        )}
                      </>
                    ) : (
                      <div style={{ display: "flex", flexDirection: "row" }}>
                        <div className={styles.workstepFormAssocTable}>
                          <div
                            style={{
                              width: "100%",
                              minHeight: "5rem",

                              display: "flex",
                              flexDirection: "row",
                              justifyContent: "space-between",
                              alignItems: "center",
                              fontSize: "var(--base_text_font_size)",
                              fontWeight: "600",
                            }}
                          >
                            <p>{t("workstepName")}</p>
                            <p>{t("associatedForm")}</p>
                          </div>
                          {formAssociationData?.map((assocData, index) => (
                            <div
                              style={{
                                width: "100%",
                                minHeight: "3.5rem",

                                display: "flex",
                                flexDirection: "row",
                                justifyContent: "space-between",
                                alignItems: "center",
                                fontSize: "var(--base_text_font_size)",
                                border:
                                  index === selectedFormBox
                                    ? "1px solid #0172C6"
                                    : "1px solid transparent",
                                background:
                                  index === selectedFormBox
                                    ? "#0172C61A"
                                    : "white",
                                paddingInline: "15px",
                                cursor: "pointer",
                              }}
                              onClick={() => displayFormMicrofrontend(index)}
                              id={`pmweb_viewForm_assocData_${index}`}
                              tabIndex={0}
                              onKeyUp={(e) => {
                                if (e.key === "Enter") {
                                  displayFormMicrofrontend(index);
                                }
                              }}
                            >
                              <p style={{ fontWeight: "600" }}>
                                {assocData.activity.actName}
                              </p>
                              <p style={{ opacity: "0.7" }}>
                                {getFormDetailsById(assocData.formId).formName}
                              </p>
                            </div>
                          ))}
                        </div>
                        {formIdtoDisplay == -1 && (
                          <div
                            style={{
                              width: "60%",
                              height: "100%",
                              overflow: "hidden",
                              display: "flex",
                              justifyContent: "center",
                              alignItems: "center",
                              fontSize: "var(--subtitle_text_font_size)",
                            }}
                          >
                            {t("htmlFormToBeShownHere")}
                          </div>
                        )}

                        <div
                          id="mf_forms_home_show"
                          style={{
                            width: "60%",
                            height: "100%",
                            overflow: "hidden",
                            display: formIdtoDisplay == "-1" ? "none" : "flex",
                          }}
                        ></div>
                      </div>
                    )}
                  </>
                )}
              </div>
            ) : (
              <Modal
                show={
                  !isReadOnly && (layoutSelectionFlow || initialRenderBoolean)
                }
                // backDropStyle={{ backgroundColor: "transparent" }}
                style={{
                  width: "95vw",
                  height: "90vh",
                  // left: props.isDrawerExpanded ? "23%" : "53%",
                  top: "50%",
                  left: "50%",
                  padding: "0",
                  boxShadow: "none",
                  transform: "translate(-50%,-50%)",
                  border: "none",
                }}
                modalClosed={() => closeModal()}
                children={
                  <LayoutSelection
                    allFormsList={allFormsList}
                    closeModal={() => closeModal()}
                    // getFormId={getFormId}
                    getFormId={getFormId}
                    handleViewForm={handleViewForm}
                    setisSingleFormAttached={setisSingleFormAttached}
                    setformIdtoDisplay={setformIdtoDisplay}
                    setSelectedFormBox={setSelectedFormBox}
                  />
                }
              />
            )}
          </>
        )}
      </div>
    </>
  );
}

export default ViewsForms;
