import React, { useState, useEffect } from "react";
import Modal from "../../../../UI/Modal/Modal.js";
import SystemUpdateAltIcon from "@material-ui/icons/SystemUpdateAlt";
import DeleteOutlineIcon from "@material-ui/icons/DeleteOutline";
import Rule from "./Rule";
import { useGlobalState, store } from "state-pool";
import styles from "./initial.module.css";
import CircularProgress from "@material-ui/core/CircularProgress";
import AddAttachmentModal from "./AddAttachmentModal";
import { LatestVersionOfProcess } from "../../../../utility/abstarctView/checkLatestVersion.js";
import {
  RULE_TYPE,
  STATUS_TYPE_TEMP,
  STATUS_TYPE_ADDED,
  ENDPOINT_UPLOAD_ATTACHMENT,
  propertiesLabel,
  ENDPOINT_DOWNLOAD_ATTACHMENT,
  RTL_DIRECTION,
  PMWEB_CONTEXT,
} from "../../../../Constants/appConstants";
import { connect, useDispatch } from "react-redux";
import { useTranslation } from "react-i18next";
import { setActivityPropertyChange } from "../../../../redux-store/slices/ActivityPropertyChangeSlice.js";
import axios from "axios";
import arabicStyles from "./arabicStyles.module.css";
import TabsHeading from "../../../../UI/TabsHeading/index.js";
import {
  isReadOnlyFunc,
  validateUploadedFile,
} from "../../../../utility/CommonFunctionCall/CommonFunctionCall.js";
import { LightTooltip } from "../../../../UI/StyledTooltip/index.js";
import DOMPurify from "dompurify";
import { Grid } from "@material-ui/core";
import { setToastDataFunc } from "../../../../redux-store/slices/ToastDataHandlerSlice.js";

function InitialRule(props) {
  let { t } = useTranslation();
  const dispatch = useDispatch();
  const direction = `${t("HTML_DIR")}`;
  const [showAttach, setShowAttach] = useState(false);
  const localActivityPropertyData = store.getState("activityPropertyData");
  const [spinner, setspinner] = useState(true);
  const [localLoadedActivityPropertyData, setlocalLoadedActivityPropertyData] =
    useGlobalState(localActivityPropertyData);
  const loadedProcessData = store.getState("loadedProcessData");
  const [localLoadedProcessData] = useGlobalState(loadedProcessData);
  const [attachList, setAttachList] = useState([]);
  const [addAtmntSpinner, setAddAtmntSpinner] = useState(false);
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
    if (localLoadedActivityPropertyData?.Status === 0) {
      setspinner(false);
    }
    if (
      localLoadedActivityPropertyData?.ActivityProperty
        ?.m_objPMAttachmentDetails
    ) {
      setAttachList(
        localLoadedActivityPropertyData?.ActivityProperty
          ?.m_objPMAttachmentDetails?.attachmentList
      );
    }
  }, [localLoadedActivityPropertyData]);

  const handleOpen = () => {
    setShowAttach(true);
  };

  const handleClose = () => {
    setShowAttach(false);
  };

  const handleRemoveFields = (i) => {
    const values = [...attachList];
    values.forEach((val) => {
      if (val.docId === i) {
        val.status = "D";
      }
    });
    setAttachList(values);

    let tempPropertyData = { ...localLoadedActivityPropertyData };
    let attachTempList = [
      ...tempPropertyData?.ActivityProperty?.m_objPMAttachmentDetails
        ?.attachmentList,
    ];
    attachTempList?.forEach((el, idx) => {
      if (el.docId === i) {
        tempPropertyData.ActivityProperty.m_objPMAttachmentDetails.attachmentList[
          idx
        ].status = "D";
      }
    });
    setlocalLoadedActivityPropertyData(tempPropertyData);
    dispatch(
      setActivityPropertyChange({
        [propertiesLabel.initialRules]: {
          isModified: true,
          hasError: false,
        },
      })
    );
  };

  const handleDownload = (docId) => {
    let payload = {
      processDefId: props.openProcessID,
      docId: docId,
      repoType: props.openProcessType,
    };
    try {
      const response = axios({
        method: "POST",
        url: `${PMWEB_CONTEXT}` + ENDPOINT_DOWNLOAD_ATTACHMENT,
        data: payload,
        responseType: "blob",
      }).then((res) => {
        const url = window.URL.createObjectURL(
          new Blob([res.data], {
            type: res.headers["content-type"],
          })
        );
        var filenameRegex = /filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/;
        var matches = filenameRegex.exec(res.headers["content-disposition"]);
        const link = document.createElement("a");
        link.href = url;
        link.setAttribute("download", matches[1].replace(/['"]/g, "")); //or any other extension
        // document.body.appendChild(link);
        // link.click();
        const sanitizedHref = DOMPurify.sanitize(link.href);
        link.href = sanitizedHref;
        link.click();
      });
    } catch (error) {
      console.log(error);
    }
  };

  const handleAddAttachment = async (
    selectedFile,
    selectedDocumentName,
    description
  ) => {
    // Modified on 03-10-23 for Bug 138656
    if (!validateUploadedFile(selectedFile?.value?.size, 30)) {
      var n = selectedFile.value.name.lastIndexOf(".");
      var result = selectedFile.value.name.substring(n + 1);

      let payload = {
        processDefId: props.openProcessID,
        docName: selectedDocumentName.value,
        docExt: result,
        actId: props.cellID,
        actName: props.cellName,
        sAttachName: description.value,
        sAttachType: RULE_TYPE,
        repoType: props.openProcessType,
      };

      const formData = new FormData();

      formData.append("file", selectedFile.value);
      formData.append(
        "attachInfo",
        new Blob([JSON.stringify(payload)], {
          type: "application/json",
        })
      );

      try {
        const response = await axios({
          method: "post",
          url: `${PMWEB_CONTEXT}` + ENDPOINT_UPLOAD_ATTACHMENT,
          data: formData,
          headers: {
            "Content-Type": "multipart/form-data",
          },
        });
        if (response.status === 200 && response.data.Output) {
          handleClose();
          setAttachList((prev) => {
            return [
              ...prev,
              {
                docExt: result,
                docId: response.data.Output.docId,
                docName: response.data.Output.docName,
                requirementId: response.data.Output.reqId,
                sAttachName: response.data.Output.sAttachName,
                sAttachType: response.data.Output.sAttachType,
                status: "T",
              },
            ];
          });
          /*code added on 12 July 2023 for BugId 132145 - oracle>> user is getting the error of no 
        loader on add attachment and user is able to add same name attachment docs */
          setAddAtmntSpinner(false);
          let tempPropertyData = { ...localLoadedActivityPropertyData };
          tempPropertyData.ActivityProperty.m_objPMAttachmentDetails.attachmentList =
            [
              ...tempPropertyData.ActivityProperty.m_objPMAttachmentDetails
                .attachmentList,
              {
                docExt: result,
                docId: response.data.Output.docId,
                docName: response.data.Output.docName,
                requirementId: response.data.Output.reqId,
                sAttachName: response.data.Output.sAttachName,
                sAttachType: response.data.Output.sAttachType,
                status: "T",
              },
            ];
          setlocalLoadedActivityPropertyData(tempPropertyData);
        }
      } catch (error) {
        setAddAtmntSpinner(false);
        console.log(error);
      }

      dispatch(
        setActivityPropertyChange({
          [propertiesLabel.initialRules]: {
            isModified: true,
            hasError: false,
          },
        })
      );
    } else {
      setAddAtmntSpinner(false);
      dispatch(
        setToastDataFunc({
          message: t("fileExceedsMaxSizeMessage"),
          severity: "error",
          open: true,
        })
      );
    }
    // Till here for Bug 138656
  };

  return (
    <div>
      <TabsHeading heading={props.heading} />
      {spinner ? (
        <CircularProgress style={{ marginTop: "30vh", marginLeft: "40%" }} />
      ) : (
        <div
          className={`${styles.initialRule} ${
            props.isDrawerExpanded ? styles.expandedView : styles.collapsedView
          }`}
          /* code added on 6 July 2023 for issue - save and discard button hide 
          issue in case of tablet(landscape mode)*/
          // style={{
          //   maxHeight: `calc((${window.innerHeight}px - ${headerHeight}) - 21rem)`,
          // }}
        >
          <div className={`${styles.attachmentHeader} row`}>
            <p className={styles.addAttachHeading}>{t("attachedRule")}</p>
            {!isReadOnly && (
              <button
                id={"pmweb_InitialRule_AddAttachBtn"}
                onClick={handleOpen}
                className={
                  direction === RTL_DIRECTION
                    ? arabicStyles.addAttachBtn
                    : styles.addAttachBtn
                }
              >
                {t("addAttachment")}
              </button>
            )}
          </div>
          <table className={styles.tableDiv}>
            <thead className={styles.tableHeader}>
              <tr className={styles.tableHeaderRow}>
                <td
                  className={`${styles.attachDiv} ${
                    direction === RTL_DIRECTION
                      ? arabicStyles.divHead
                      : styles.divHead
                  }`}
                >
                  {t("attachmentName")}
                </td>
                <td
                  className={`${styles.descDiv} ${
                    direction === RTL_DIRECTION
                      ? arabicStyles.divHead
                      : styles.divHead
                  }`}
                >
                  {t("Discription")}
                </td>
                <td
                  className={`${
                    direction === RTL_DIRECTION
                      ? arabicStyles.iconDiv
                      : styles.iconDiv
                  } ${
                    direction === RTL_DIRECTION
                      ? arabicStyles.divHead
                      : styles.divHead
                  }`}
                ></td>
              </tr>
            </thead>
            <tbody>
              {attachList
                ?.filter(
                  (el) =>
                    el.sAttachType === RULE_TYPE &&
                    (el.status === STATUS_TYPE_TEMP ||
                      el.status === STATUS_TYPE_ADDED)
                )
                ?.map((item, i) => (
                  <tr className={styles.tableRow}>
                    <td
                      className={`${styles.attachDiv} ${
                        direction === RTL_DIRECTION
                          ? arabicStyles.divBody
                          : styles.divBody
                      }`}
                    >
                      {item.docName}
                    </td>
                    <td
                      className={`${styles.descDiv} ${
                        direction === RTL_DIRECTION
                          ? arabicStyles.divBody
                          : styles.divBody
                      }`}
                    >
                      {item.sAttachName}
                    </td>
                    <td
                      className={`${
                        direction === RTL_DIRECTION
                          ? arabicStyles.iconDiv
                          : styles.iconDiv
                      } ${
                        direction === RTL_DIRECTION
                          ? arabicStyles.divBody
                          : styles.divBody
                      }`}
                    >
                      {/*Added code on 8-9-2023 for bug 135667*/}
                      <Grid container>
                        <Grid item>
                          <LightTooltip
                            id="download_Tooltip"
                            arrow={true}
                            enterDelay={500}
                            placement="bottom-start"
                            title="Download"
                          >
                            <SystemUpdateAltIcon
                              id={`pmweb_InitialRule_DownloadIcon_${item.docId}`}
                              className={styles.downloadIcon}
                              onClick={() => handleDownload(item.docId)}
                            />
                          </LightTooltip>
                        </Grid>

                        <Grid item></Grid>
                        {!isReadOnly && (
                          <LightTooltip
                            id="delete_Tooltip"
                            arrow={true}
                            enterDelay={500}
                            placement="bottom-start"
                            title="Delete"
                          >
                            <DeleteOutlineIcon
                              id={`pmweb_InitialRule_DeleteOutlineIcon_${item.docId}`}
                              tabIndex={0}
                              className={styles.deleteIcon1}
                              onClick={() => handleRemoveFields(item.docId)}
                              onKeyDown={(e) => {
                                if (e.key === "Enter") {
                                  handleRemoveFields(item.docId);
                                  e.stopPropagation();
                                }
                              }}
                            />
                          </LightTooltip>
                        )}
                      </Grid>
                      {/*Till here*/}
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
          <Rule isReadOnly={isReadOnly} />

          {showAttach ? (
            <Modal
              show={showAttach}
              style={{
                // width: "40vw",
                // left: "30%",
                top: "20%",
                padding: "0",
              }}
              //commented below line for bug_id: 138720
              // modalClosed={handleClose}
              children={
                <AddAttachmentModal
                  handleClose={handleClose}
                  handleAddAttachment={handleAddAttachment}
                  setAddAtmntSpinner={setAddAtmntSpinner}
                  addAtmntSpinner={addAtmntSpinner}
                />
              }
            />
          ) : null}
        </div>
      )}
    </div>
  );
}

const mapStateToProps = (state) => {
  return {
    isDrawerExpanded: state.isDrawerExpanded.isDrawerExpanded,
    openProcessID: state.openProcessClick.selectedId,
    cellID: state.selectedCellReducer.selectedId,
    cellName: state.selectedCellReducer.selectedName,
    openProcessType: state.openProcessClick.selectedType,
    cellCheckedOut: state.selectedCellReducer.selectedCheckedOut,
    cellLaneId: state.selectedCellReducer.selectedActLaneId,
    openTemplateFlag: state.openTemplateReducer.openFlag,
  };
};
export default connect(mapStateToProps, null)(InitialRule);
