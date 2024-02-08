// Changes made to solve Bug 116388 - Call Activity: Add document button is not working in Expanded mode
import React, { useEffect, useState } from "react";
import { connect, useDispatch, useSelector } from "react-redux";
import ReusableInputs from "./reusables/reusableInputs_Doc";
import "../../../Properties/PropetiesTab/callActivity/commonCallActivity.css";
import Modal from "../../../../UI/Modal/Modal.js";
import DocList from "./reusables/docList.js";
import { store, useGlobalState } from "state-pool";
import TabsHeading from "../../../../UI/TabsHeading/index.js";
import { isReadOnlyFunc } from "../../../../utility/CommonFunctionCall/CommonFunctionCall.js";
import {
  RTL_DIRECTION,
  headerHeight,
  propertiesLabel,
} from "../../../../Constants/appConstants.js";
import { setActivityPropertyChange } from "../../../../redux-store/slices/ActivityPropertyChangeSlice.js";
import { CircularProgress, Grid } from "@material-ui/core";
import { ActivityPropertySaveCancelValue } from "../../../../redux-store/slices/ActivityPropertySaveCancelClicked.js";
import { setToastDataFunc } from "../../../../redux-store/slices/ToastDataHandlerSlice";
import { LatestVersionOfProcess } from "../../../../utility/abstarctView/checkLatestVersion";
import { useTranslation } from "react-i18next";

/*code edited on 6 Sep 2022 for BugId 115378 */
function MessageDocMapping(props) {
  const dispatch = useDispatch();
  let { t } = useTranslation();
  const direction = `${t("HTML_DIR")}`;
  const loadedProcessData = store.getState("loadedProcessData");
  const [showDocsModal, setShowDocsModal] = useState(false);
  const [localLoadedProcessData] = useGlobalState(loadedProcessData);
  const loadedActivityPropertyData = store.getState("activityPropertyData");
  const [localLoadedActivityPropertyData, setlocalLoadedActivityPropertyData] =
    useGlobalState(loadedActivityPropertyData);
  const [docList, setDocList] = useState(null);
  const [spinner, setSpinner] = useState(true);
  const saveCancelStatus = useSelector(ActivityPropertySaveCancelValue);
  const [showRedBorder, setShowRedBorder] = useState(false);
    // changes added for bug_id: 134226
  const windowInnerHeight = useSelector(
    (state) => state.setWindowInnerHeight.windowInnerHeight
  );
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
    if (saveCancelStatus.SaveClicked) {
      docList?.forEach((el) => {
        if (!el.mappedFieldName || el.mappedFieldName?.trim() === "") {
          setShowRedBorder(true);
        }
      });
    }
  }, [saveCancelStatus.SaveClicked]);

  useEffect(() => {
    let tempIncomingDocsList = [];
    let forwardIncomingDocsList =
      localLoadedActivityPropertyData?.ActivityProperty?.pMMessageEnd
        ?.m_arrFwdDocMapping;
    forwardIncomingDocsList?.forEach((variable) => {
      tempIncomingDocsList.push({
        DocName: variable.importedFieldName,
        mappedFieldName: variable.mappedFieldName,
        isChecked: true,
      });
    });
    setDocList(tempIncomingDocsList);
    setSpinner(false);
    let isValid = validateFunction();
    if (!isValid) {
      dispatch(
        setActivityPropertyChange({
          [propertiesLabel.fwdDocMapping]: {
            isModified: true,
            hasError: true,
          },
        })
      );
      if (saveCancelStatus.SaveClicked) {
        setShowRedBorder(true);
      }
    }
  }, [localLoadedActivityPropertyData]);

  const validateFunction = () => {
    // Changes made to solve 116398 Call Activity: without making any changes save button is getting enabled
    let isValid = true;
    localLoadedActivityPropertyData?.ActivityProperty?.pMMessageEnd?.m_arrFwdDocMapping?.forEach(
      (el) => {
        if (!el.mappedFieldName || el.mappedFieldName?.trim() === "") {
          isValid = false;
        }
      }
    );
    return isValid;
  };

  const deleteVariablesFromList = (variablesToDelete) => {
    //Deleting documents from the right Panel
    let tempDocsList = [...docList];
    let tempDocsList_Filtered = tempDocsList.filter((variable) => {
      return variablesToDelete !== variable;
    });
    setDocList(tempDocsList_Filtered);

    //Deleting Document from getActivityAPI Call
    let tempLocalState = { ...localLoadedActivityPropertyData };
    let forwardIncomingDocsList =
      localLoadedActivityPropertyData?.ActivityProperty?.pMMessageEnd
        ?.m_arrFwdDocMapping;
    forwardIncomingDocsList?.map((document, index) => {
      if (document.importedFieldName === variablesToDelete.DocName) {
        forwardIncomingDocsList.splice(index, 1);
      }
    });
    tempLocalState.ActivityProperty.pMMessageEnd.m_arrFwdDocMapping = [
      ...forwardIncomingDocsList,
    ];
    setlocalLoadedActivityPropertyData(tempLocalState);
    dispatch(
      setActivityPropertyChange({
        [propertiesLabel.fwdDocMapping]: { isModified: true, hasError: false },
      })
    );
  };

  const content = () => {
    return (
      <div
        style={{
          backgroundColor: props.isDrawerExpanded ? "white" : null,
          width: props.isDrawerExpanded ? "75%" : "auto",
          padding: "7px",
        }}
      >
        <div className="forwardMapping_VariablesLabel">
          <p style={{ fontSize: "12px", color: "#606060", fontWeight: "600" }}>
            {t("frwdMapping")}
          </p>
          {!isReadOnly && (
            <p
              style={{
                fontSize: "var(--base_text_font_size)",
                color: "var(--link_color)",
                cursor: "pointer",
                fontWeight: "500",
              }}
              onClick={() =>
                localLoadedActivityPropertyData?.ActivityProperty?.pMMessageEnd?.processId?.trim() !==
                ""
                  ? setShowDocsModal(true)
                  : dispatch(
                      setToastDataFunc({
                        message: t("pleaseSelectDeployedProcessName"),
                        severity: "error",
                        open: true,
                      })
                    )
              }
            >
              {props.isDrawerExpanded ? null : t("addDocumentsMultiple")}
            </p>
          )}
        </div>
        {docList.length > 0 ? (
          <>
            {
              // Modified on 08/10/2023, bug_id:135147
            }
            {/*  <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                width: props.isDrawerExpanded ? "80.5%" : "100%",
                // padding: "0.5vw 0.5vw", //For Bug 134656 we have provided this resolution by giving padding of 0.5vw
              }}
            >
              <div
                style={{
                  // flex: "0.5 1 0%",
                  marginRight: "5px",
                  width: props.isDrawerExpanded ? "285px" : "155px",
                  height: "38px",
                  borderRadius: "1px",
                  opacity: "1",
                  backgroundColor: "#F4F4F4",
                  display: "flex",
                  flexDirection: "column",
                  padding:
                    direction === RTL_DIRECTION
                      ? "0px 14px 0px 0px"
                      : "0px 0px 0px 14px", //For Bug 134656 we have provided this resolution by giving padding of 14px
                }}
              >
                <p
                  style={{
                    fontSize: "var(--base_text_font_size)",
                    color: "#000000",
                  }}
                >
                  {t("targetProcess")}
                </p>
                <p
                  style={{
                    fontSize: "var(--base_text_font_size)",
                    color: "#000000",
                  }}
                >
                  {
                    localLoadedActivityPropertyData?.ActivityProperty
                      ?.pMMessageEnd?.processName
                  }
                </p>
              </div>
              
              <div
                style={{
                  // flex: "0.5 1 0%",
                  width: props.isDrawerExpanded ? "285px" : "155px",
                  height: "38px",
                  borderRadius: "1px",
                  opacity: "1",
                  backgroundColor: "#F4F4F4",
                  display: "flex",
                  flexDirection: "column",
                  padding:
                    direction === RTL_DIRECTION
                      ? "0px 5px 0px 0px"
                      : "0px 0px 0px 5px",
                }}
              >
                <p
                  style={{
                    fontSize: "var(--base_text_font_size)",
                    color: "#000000",
                  }}
                >
                  {" "}
                  {t("currentProcess")}
                </p>
                <p
                  style={{
                    fontSize: "var(--base_text_font_size)",
                    color: "#000000",
                  }}
                >
                 {localLoadedProcessData.ProcessName}
                </p>
              </div>
             
            </div> */}
            {
              //till her for bug_id:135147
            }
            {
              //code added on 28 Nov 2022 for BugId 116427
            }
            {/* <div className="callActList" style={{ width: props.isDrawerExpanded ? "850px" : "null" }}>
              {docList?.map((doc,index) => {
                return (
                  <ReusableInputs
                    document={doc}
                    docList={docList}
                    deleteVariablesFromList={deleteVariablesFromList}
                    isReadOnly={isReadOnly}
                    setDocList={setDocList}
                    showRedBorder={showRedBorder}
                    index={index}
                  />
                );
              })}
            </div> */}
            {
              // Modified on 08/10/2023, bug_id:135147
            }
            <Grid container spacing={1} style={{ margin: "0" }}>
              <Grid item xs={5}>
                <div
                  style={{
                    // flex: "0.5 1 0%",
                    // marginRight: "5px",
                    // width: props.isDrawerExpanded ? "285px" : "155px",
                    height: "38px",
                    borderRadius: "1px",
                    opacity: "1",
                    backgroundColor: "#F4F4F4",
                    // display: "flex",
                    // flexDirection: "column",
                    padding:
                      direction === RTL_DIRECTION
                        ? "0px 14px 0px 0px"
                        : "0px 0px 0px 14px", //For Bug 134656 we have provided this resolution by giving padding of 14px
                  }}
                >
                  <p
                    style={{
                      fontSize: "var(--base_text_font_size)",
                      color: "#000000",
                    }}
                  >
                    {t("targetProcess")}
                  </p>
                  <p
                    style={{
                      fontSize: "var(--base_text_font_size)",
                      color: "#000000",
                    }}
                  >
                    {
                      localLoadedActivityPropertyData?.ActivityProperty
                        ?.pMMessageEnd?.processName
                    }
                  </p>
                </div>
              </Grid>
              <Grid item xs={1}>
                <span style={{ display: "none" }}>xs=4</span>
              </Grid>
              <Grid item xs={5}>
                <div
                  style={{
                    // flex: "0.5 1 0%",
                    //width: props.isDrawerExpanded ? "285px" : "155px",
                    height: "38px",
                    borderRadius: "1px",
                    opacity: "1",
                    backgroundColor: "#F4F4F4",
                    padding:
                      direction === RTL_DIRECTION
                        ? "0px 14px 0px 0px"
                        : "0px 0px 0px 14px",

                    // padding:
                    //   direction === RTL_DIRECTION
                    //     ? "0px 5px 0px 0px"
                    //     : "0px 0px 0px 5px",
                  }}
                >
                  <p
                    style={{
                      fontSize: "var(--base_text_font_size)",
                      color: "#000000",
                    }}
                  >
                    {" "}
                    {t("currentProcess")}
                  </p>
                  <p
                    style={{
                      fontSize: "var(--base_text_font_size)",
                      color: "#000000",
                    }}
                  >
                    {localLoadedProcessData.ProcessName}
                  </p>
                </div>
              </Grid>
              <Grid item xs={1}>
                <span style={{ display: "none" }}>xs=4</span>
              </Grid>
            </Grid>
            <Grid container spacing={1} style={{ margin: "0" }}>
              {/* <Grid item xs={5}>
                <div>xs=8</div>
              </Grid>
              <Grid item xs={2}>
                <div>xs=4</div>
              </Grid>
              <Grid item xs={5}>
                <div>xs=4</div>
              </Grid> */}
              {docList?.map((doc, index) => {
                return (
                  <ReusableInputs
                    document={doc}
                    docList={docList}
                    deleteVariablesFromList={deleteVariablesFromList}
                    isReadOnly={isReadOnly}
                    setDocList={setDocList}
                    showRedBorder={showRedBorder}
                    index={index}
                  />
                );
              })}
            </Grid>
            {
              //till her for bug_id:135147
            }
          </>
        ) : (
          <p
            className={
              props.isDrawerExpanded
                ? direction === RTL_DIRECTION
                  ? "noMappingPresentArabic"
                  : "noMappingPresent"
                : "noMappingPresent_expanded"
            }
            style={props.isDrawerExpanded ? {} : { left: "10%" }}
          >
            {t("addDocsMessage")}
          </p>
        )}

        {showDocsModal && !props.isDrawerExpanded ? (
          <Modal
            show={showDocsModal}
            backDropStyle={{ backgroundColor: "transparent" }}
            style={{
              top: "0%",

              // left: direction == RTL_DIRECTION?"100%":"-85%",  //Changes made to solve Bug 138564
              // modified on 17/10/2023 for bug_id: 138128
              // left: direction == RTL_DIRECTION ? "100%" : "-85%",
              left: direction == RTL_DIRECTION ? "100%" : "unset",
              right: direction === RTL_DIRECTION ? "unset" : "100%",
              position: "absolute",
              width: "25.35vw",
              zIndex: "1500",
              boxShadow: "0px 3px 6px #00000029",
              border: "0",
              borderLeft: "1px solid #D6D6D6",
              borderRadius: "2px",
              padding: "0",
              height: `calc(${windowInnerHeight}px - ${headerHeight})`,
            }}
            modalClosed={() => setShowDocsModal(false)}
            children={
              <DocList
                tabType="ForwardDocMapping"
                setShowDocsModal={setShowDocsModal}
                docList={docList}
                setDocList={setDocList}
                isReadOnly={isReadOnly}
              />
            }
          ></Modal>
        ) : null}
      </div>
    );
  };

  return spinner ? (
    <CircularProgress style={{ marginTop: "30vh", marginLeft: "40%" }} />
  ) : (
    <div>
      <TabsHeading heading={props?.heading} />
      {props.isDrawerExpanded ? (
        <div style={{ display: "flex", gap: "1vw", padding: "0 0.5vw" }}>
          <div
            style={{
              width: "24%",
              boxShadow: "0px 3px 6px #00000029",
              border: "1px solid #D6D6D6",
              borderRadius: "3px",
              padding: "0",
              height: `calc((${windowInnerHeight}px - ${headerHeight}) - 11.5rem)`,
            }}
          >
            <DocList
              tabType="ForwardDocMapping"
              setShowDocsModal={setShowDocsModal}
              docList={docList}
              setDocList={setDocList}
              isReadOnly={isReadOnly}
            />
          </div>
          {content()}
        </div>
      ) : (
        content()
      )}
    </div>
  );
}

const mapStateToProps = (state) => {
  return {
    isDrawerExpanded: state.isDrawerExpanded.isDrawerExpanded,
    cellCheckedOut: state.selectedCellReducer.selectedCheckedOut,
    cellLaneId: state.selectedCellReducer.selectedActLaneId,
    openTemplateFlag: state.openTemplateReducer.openFlag,
  };
};

export default connect(mapStateToProps, null)(MessageDocMapping);
