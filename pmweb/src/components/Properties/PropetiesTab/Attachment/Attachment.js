// Changes made to solve Bug 123515 - Process Designer-icons related- UX and UI bugs
import React, { useState, useEffect } from "react";
import Modal from "../../../../UI/Modal/Modal.js";
import DeleteOutlineIcon from "@material-ui/icons/DeleteOutline";
import { useGlobalState, store } from "state-pool";
import styles from "./attachment.module.css";
import CircularProgress from "@material-ui/core/CircularProgress";
import AddAttachmentModal from "../InitialRule/AddAttachmentModal";
import DownloadIcon from "../../../../../src/assets/abstractView/Icons/Download.svg";
import {
  ATTACHMENT_TYPE,
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
import arabicStyles from "../InitialRule/arabicStyles.module.css";
import {
  isReadOnlyFunc,
  validateUploadedFile,
} from "../../../../utility/CommonFunctionCall/CommonFunctionCall.js";
import EmptyStateIcon from "../../../../assets/ProcessView/EmptyState.svg";
import * as actionCreators from "../../../../redux-store/actions/Properties/showDrawerAction.js";
import { LatestVersionOfProcess } from "../../../../utility/abstarctView/checkLatestVersion.js";
import DOMPurify from "dompurify";
import { LightTooltip } from "../../../../UI/StyledTooltip/index.js";
import { IconButton } from "@material-ui/core";
import { setToastDataFunc } from "../../../../redux-store/slices/ToastDataHandlerSlice.js";

function Attachment(props) {
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
      let docList =
        localLoadedActivityPropertyData?.ActivityProperty?.m_objPMAttachmentDetails?.attachmentList?.filter(
          (doc) =>
            doc.sAttachType === ATTACHMENT_TYPE &&
            (doc.status === STATUS_TYPE_TEMP ||
              doc.status === STATUS_TYPE_ADDED)
        );
      setAttachList(docList ? docList : []);
    }
  }, [localLoadedActivityPropertyData]);

  const handleOpen = () => {
    if (!props.isDrawerExpanded) {
      props.expandDrawer(true);
    }
    setShowAttach(true);
  };

  const handleClose = () => {
    setShowAttach(false);
  };

  const handleRemoveFields = (i) => {
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
        [propertiesLabel.attachments]: {
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
      axios({
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
    // Modified on 09-10-23 for Bug 139151
    if (!validateUploadedFile(selectedFile?.value?.size, 30)) {
      let n = selectedFile.value.name.lastIndexOf(".");
      let result = selectedFile.value.name.substring(n + 1);
      let payload = {
        processDefId: props.openProcessID,
        docName: selectedDocumentName.value,
        docExt: result,
        actId: props.cellID,
        actName: props.cellName,
        sAttachName: description.value,
        sAttachType: ATTACHMENT_TYPE,
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
          [propertiesLabel.attachments]: {
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
    // Till here for Bug 139151
  };

  return (
    <div>
      {spinner ? (
        <CircularProgress style={{ marginTop: "30vh", marginLeft: "40%" }} />
      ) : (
        <div
          className={`${styles.initialRule} ${
            props.isDrawerExpanded ? styles.expandedView : styles.collapsedView
          }`}
        >
          {attachList?.length > 0 ? (
            <>
              <div className={`${styles.attachmentHeader} row`}>
                <p className={styles.addAttachHeading}>{t("Attachment(s)")}</p>
                {!isReadOnly && (
                  <button
                    onClick={handleOpen}
                    className={
                      direction === RTL_DIRECTION
                        ? arabicStyles.addAttachBtn
                        : styles.addAttachBtn
                    }
                    id="pmweb_Attachment_AddAttachment_button"
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
                  {attachList?.map((item, i) => (
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
                        style={{
                          width: "10%",
                          display: "flex",
                          flexDirection: "row",
                        }}
                      >
                        {/* <SystemUpdateAltIcon
                            className={styles.downloadIcon}
                            onClick={() => handleDownload(item.docId)}
                          /> */}
                        {!isReadOnly && (
                          <LightTooltip
                            id="Download_Attachment_Tooltip"
                            arrow={true}
                            placement="bottom-start"
                            title={t("download")}
                          >
                            <img
                              className={styles.downloadIcon}
                              src={DownloadIcon}
                              alt="Download"
                              onClick={() => handleDownload(item.docId)}
                              id="pmweb_Attachment_downloadicon_img"
                              tabIndex={0}
                              onKeyDown={(e) =>
                                e.key === "Enter" && handleDownload(item.docId)
                              }
                              aria-label={`${t("attachmentName")}: ${
                                item.docName
                              } ${t("Discription")}: ${
                                item.sAttachName
                              } Download`}
                            />
                          </LightTooltip>
                        )}
                        {!isReadOnly && (
                          <LightTooltip
                            id="Delete_Attachment_Tooltip"
                            arrow={true}
                            placement="bottom-start"
                            title={t("delete")}
                          >
                            <IconButton
                              onClick={() => handleRemoveFields(item.docId)}
                              tabIndex={0}
                              onKeyDown={(e) =>
                                e.key === "Enter" &&
                                handleRemoveFields(item.docId)
                              }
                              aria-label={`${t("attachmentName")}: ${
                                item.docName
                              } ${t("Discription")}: ${
                                item.sAttachName
                              } Delete`}
                              className={styles.iconButton}
                              disableFocusRipple
                              disableTouchRipple
                              disableRipple
                            >
                              <DeleteOutlineIcon
                                className={styles.deleteIcon1}
                              />
                            </IconButton>
                          </LightTooltip>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </>
          ) : (
            <div className="center">
              <div className={styles.emptyStateMainDiv}>
                <img
                  className={styles.emptyStateImage}
                  src={EmptyStateIcon}
                  alt={t("createAttachments")}
                  style={{
                    marginTop: "6rem",
                  }}
                />
                {!isReadOnly ? (
                  <p className={styles.emptyStateHeading}>
                    {t("createAttachments")}
                  </p>
                ) : null}
                <p className={styles.emptyStateText}>
                  {t("noAttachAdded")}
                  {isReadOnly ? "." : t("pleaseCreateAttachments")}
                </p>
              </div>
              {!isReadOnly && (
                <button
                  onClick={handleOpen}
                  className={
                    direction === RTL_DIRECTION
                      ? arabicStyles.addNewAttachBtn
                      : styles.addNewAttachBtn
                  }
                  id="pmweb_Attachment_addnewAttchbtn_button"
                >
                  {t("addAttachment")}
                </button>
              )}
            </div>
          )}

          {showAttach ? (
            <Modal
              show={showAttach}
              style={{
                // width: "40vw",
                // left: "30%",
                top: "28%",
                padding: "0",
              }}
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

const mapDispatchToProps = (dispatch) => {
  return {
    expandDrawer: (flag) => dispatch(actionCreators.expandDrawer(flag)),
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(Attachment);
