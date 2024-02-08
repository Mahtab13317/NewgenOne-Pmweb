// Changes made to solve Bug 116388 - Call Activity: Add document button is not working in Expanded mode
// #BugID - 123847
// #BugDescription - Handled function to show validation message.
import React, { useEffect, useState } from "react";
import { connect, useDispatch, useSelector } from "react-redux";
import ReusableInputs from "./reusables/reusableInputs_Doc.js";
import "./commonCallActivity.css";
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
import { CircularProgress, Grid, Typography } from "@material-ui/core";
import {
  ActivityPropertySaveCancelValue,
  setSave,
} from "../../../../redux-store/slices/ActivityPropertySaveCancelClicked.js";
import { setToastDataFunc } from "../../../../redux-store/slices/ToastDataHandlerSlice";
import { useTranslation } from "react-i18next";
import { LatestVersionOfProcess } from "../../../../utility/abstarctView/checkLatestVersion.js";

/*code edited on 6 Sep 2022 for BugId 115378 */
function ForwardMDoc(props) {
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
  //Added on 28/08/2023 for BUGID: 134217
    // changes added for bug_id: 134226
  const windowInnerHeight = useSelector(
    (state) => state.setWindowInnerHeight.windowInnerHeight
  );
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
      docList?.map((el) => {
        if (!el.mappedFieldName || el.mappedFieldName.trim() == "") {
          setShowRedBorder(true);
        }
      });

      let isValid = validateFunction();
      if (!isValid) {
        dispatch(
          setToastDataFunc({
            message: `${t("PleaseDefineAtleastOneForwardDoc")}`,
            severity: "error",
            open: true,
          })
        );
        setShowRedBorder(true);
      }
      dispatch(setSave({ SaveClicked: false }));
    }
  }, [saveCancelStatus.SaveClicked]);

  useEffect(() => {
    let tempIncomingDocsList = [];
    let forwardIncomingDocsList =
      localLoadedActivityPropertyData?.ActivityProperty?.SubProcess
        ?.fwdDocMapping;
    forwardIncomingDocsList?.map((variable) => {
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
  }, []);

  const validateFunction = () => {
    // Changes made to solve 116398 Call Activity: without making any changes save button is getting enabled
    let isValid = true;
    localLoadedActivityPropertyData?.ActivityProperty?.SubProcess?.fwdDocMapping?.map(
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
      localLoadedActivityPropertyData.ActivityProperty.SubProcess.fwdDocMapping;
    forwardIncomingDocsList?.map((document, index) => {
      if (document.importedFieldName == variablesToDelete.DocName) {
        forwardIncomingDocsList.splice(index, 1);
      }
    });
    tempLocalState.ActivityProperty.SubProcess.fwdDocMapping = [
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
          flex: "4",
          background: "white",
          overflowY: props.isDrawerExpanded ? "scroll" : "hidden",
          paddingLeft: "0.58vw",
        }}
      >
        <div>
          <div className="forwardMapping_VariablesLabel">
            <p
              style={{ fontSize: "12px", color: "#606060", fontWeight: "600" }}
            >
              {t("forwardMapping").toUpperCase()}
            </p>
            {!isReadOnly && (
              <p
                id="pmweb_ForwardMDoc_AddDocumentsText"
                style={{
                  fontSize: "var(--base_text_font_size)",
                  color: "var(--link_color)",
                  cursor: "pointer",
                  fontWeight: "500",
                }}
                onClick={() =>
                  localLoadedActivityPropertyData?.ActivityProperty?.SubProcess?.importedProcessDefId?.trim() !==
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
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  // width: props.isDrawerExpanded ? "64.5%" : "87%",
                  width:"100%",
                   padding: "1.5vh 0vw",
                }}
              >
                <div
                  // className={
                  //   props.isDrawerExpanded
                  //     ? "forwardMapping_VariablesHeader_expanded forwardMapping_VariablesHeader_expanded1"
                  //     : "forwardMapping_VariablesHeader"
                  // }
                  // style={{
                  //   marginRight: props.isDrawerExpanded ? "7%" : "10.5%",
                  // }}
                  style={{
                    flex: "1",
                    // marginRight: "5px",
                    // width: props.isDrawerExpanded ? "20.98vw" : "10.16vw",
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
                  <p className="targetProcess">{t("targetProcess")}</p>
                  <p className="processName_CallActivity">
                    {
                      localLoadedActivityPropertyData?.ActivityProperty
                        ?.SubProcess?.importedProcessName
                    }
                  </p>
                </div>
                <div style={{ flex: "0.2" }}></div>
                <div
                  // className={
                  //   props.isDrawerExpanded
                  //     ? "forwardMapping_VariablesHeader_expanded"
                  //     : "forwardMapping_VariablesHeader"
                  // }
                  style={{
                    flex: "1",
                    // width: props.isDrawerExpanded ? "285px" : "138px",
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
                  <p className="targetProcess">{t("currentProcess")}</p>
                  <p className="processName_CallActivity">
                    {localLoadedProcessData?.ProcessName}
                  </p>
                </div>
                <div style={{ flex: "0.2" }}></div>
              </div>
              {/*code added on 28 Nov 2022 for BugId 116427*/}
              <div className="callActList">
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
              </div>
            </>
          ) : (
            // <p
            //   className={
            //     props.isDrawerExpanded
            //       ? direction === RTL_DIRECTION
            //         ? "noMappingPresentArabic"
            //         : "noMappingPresent"
            //       : "noMappingPresent_expanded"
            //   }
            //   style={props.isDrawerExpanded ? {} : { left: "10%" }}
            // >
            //   {t("addDocsMessage")}
            // </p>
            <Grid
            container
            direction="column"
            justifyContent="center"
            alignItems="center"
          >
            <Grid item style={{ paddingTop: "20vh" }}>
              <Typography>{t("addDocsMessage")}</Typography>
            </Grid>
          </Grid>
          )}
          {showDocsModal && !props.isDrawerExpanded ? (
            <Modal
              show={showDocsModal}
              backDropStyle={{ backgroundColor: "transparent" }}
              style={{
                top: "0%",
                // modified on 17/10/2023 for bug_id: 138128
                // left: direction == RTL_DIRECTION ? "100%" : "-85%", //Modified on 12/09/2023, bug_id:136782
                left: direction == RTL_DIRECTION ? "100%" : "unset",
                right: direction === RTL_DIRECTION ? "unset" : "100%",
                // left: "-85%",
                position: "absolute",
                width: "25.35vw",
                zIndex: "1500",
                boxShadow: "0px 3px 6px #00000029",
                border: "0",
                borderLeft: "1px solid #D6D6D6",
                borderRadius: "2px",
                padding: "0",
                //Added on 28/08/2023 for BUGID: 134217
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
            className="leftSecWidth" //Changes made to solve Bug 134210
            style={{
              flex:"1.5 1 0%",
              boxShadow: "0px 3px 6px #00000029",
              border: "1px solid #D6D6D6",
              borderRadius: "3px",
              // padding: props.isDrawerExpanded ? "8px 0.5vw" : "0",
              height: window.innerWidth<1000?`calc((${windowInnerHeight}px - ${headerHeight}) - 11.8rem)` :"58.5vh",
              // height: `calc((${windowInnerHeight}px - ${headerHeight}) - 11.5rem)`,
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

export default connect(mapStateToProps, null)(ForwardMDoc);
