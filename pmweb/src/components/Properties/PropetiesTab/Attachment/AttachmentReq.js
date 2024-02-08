// Changes made to solve Bug 120008 - Deployed version: able to requirement and attachment in deployed section with out checkout
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
  SERVER_URL,
  ENDPOINT_UPLOAD_ATTACHMENT,
  ENDPOINT_DOWNLOAD_ATTACHMENT,
  RTL_DIRECTION,
  ENDPOINT_SAVE_ATTACHMENT,
} from "../../../../Constants/appConstants";
import { connect, useDispatch } from "react-redux";
import { useTranslation } from "react-i18next";
import axios from "axios";
import arabicStyles from "../InitialRule/arabicStyles.module.css";
import {
  isReadOnlyFunc,
  validateUploadedFile,
} from "../../../../utility/CommonFunctionCall/CommonFunctionCall.js";
import { LatestVersionOfProcess } from "../../../../utility/abstarctView/checkLatestVersion.js";
import DOMPurify from "dompurify";
import { LightTooltip } from "../../../../UI/StyledTooltip/index.js";
import { IconButton } from "@material-ui/core";
import { setToastDataFunc } from "../../../../redux-store/slices/ToastDataHandlerSlice.js";

function AttachmentReq(props) {
  let { t } = useTranslation();
  const dispatch = useDispatch();
  const direction = `${t("HTML_DIR")}`;
  const loadedProcessData = store.getState("loadedProcessData");
  const [localLoadedProcessData] = useGlobalState(loadedProcessData);
  const [showAttach, setShowAttach] = useState(false);
  const [attachList, setAttachList] = useState([]);
  const [spinner, setspinner] = useState(true);
  const [addAtmntSpinner, setAddAtmntSpinner] = useState(false);
  let isReadOnly =
    props.isReadOnly ||
    props.openTemplateFlag ||
    isReadOnlyFunc(
      localLoadedProcessData,
      props.cellCheckedOut,
      props.cellLaneId
    ) ||
    LatestVersionOfProcess(localLoadedProcessData?.Versions) !==
      +localLoadedProcessData?.VersionNo; // modified on 05/09/2023 for BugId 136103;

  useEffect(() => {
    if (!!props.ignoreSpinner && localLoadedProcessData?.ProcessDefId) {
      setspinner(false);
      // code edited on 13 April 2023 for BugId 126814
      const url =
        SERVER_URL +
        ENDPOINT_SAVE_ATTACHMENT +
        "/" +
        localLoadedProcessData?.ProcessDefId +
        "/" +
        localLoadedProcessData?.ProcessType;
      axios
        .get(url)
        .then(function (response) {
          const tempAttachList = response?.data?.Attachments?.map((item, i) => {
            return {
              docExt: null,
              docId: item.DocId,
              docName: item.DocName,
              requirementId: null,
              sAttachName: item.AttachmentName,
              sAttachType: item.AttachmentType,
              status: item.Status,
            };
          });
          setAttachList(tempAttachList);
          props.RAPayload(tempAttachList);
        })
        .catch(function (error) {
          console.log(error);
        });
    }
  }, [props.ignoreSpinner, localLoadedProcessData?.ProcessDefId]);

  const handleOpen = () => {
    setShowAttach(true);
  };

  const handleClose = () => {
    setShowAttach(false);
  };

  const handleRemoveFields = (i) => {
    const values = JSON.parse(JSON.stringify(attachList));
    values?.forEach((val) => {
      if (val.docId === i) {
        val.status = "D";
      }
    });
    setAttachList(values);

    props.RAPayload(values);
  };
  const handleDownload = (docId) => {
    let payload = {
      processDefId: props?.openProcessID,
      docId: docId,
      repoType: props?.openProcessType,
    };

    try {
      const response = axios({
        method: "POST",
        url: SERVER_URL + ENDPOINT_DOWNLOAD_ATTACHMENT,
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
    // Modified on 28-09-23 for Bug 136215
    if (!validateUploadedFile(selectedFile?.value?.size, 30)) {
      let n = selectedFile.value.name.lastIndexOf(".");
      let result = selectedFile.value.name.substring(n + 1);

      let payload = {
        processDefId: props?.openProcessID,
        docName: selectedDocumentName?.value,
        docExt: result,
        actId: props?.cellID,
        actName: props?.cellName,
        sAttachName: description?.value,
        sAttachType: ATTACHMENT_TYPE,
        repoType: props?.openProcessType,
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
          url: SERVER_URL + ENDPOINT_UPLOAD_ATTACHMENT,
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
                docId: response?.data?.Output?.docId,
                docName: response?.data?.Output?.docName,
                requirementId: response?.data?.Output?.reqId,
                sAttachName: response?.data?.Output?.sAttachName,
                sAttachType: response?.data?.Output?.sAttachType,
                status: "T",
              },
            ];
          });
          /*code added on 12 July 2023 for BugId 132145 - oracle>> user is getting the error of no 
        loader on add attachment and user is able to add same name attachment docs */
          setAddAtmntSpinner(false);
          if (props.ignoreSpinner) {
            const tempAttachList = [
              ...attachList,
              {
                docExt: result,
                docId: response?.data?.Output?.docId,
                docName: response?.data?.Output?.docName,
                requirementId: response?.data?.Output?.reqId,
                sAttachName: response?.data?.Output?.sAttachName,
                sAttachType: response?.data?.Output?.sAttachType,
                status: "S",
              },
            ];
            props.RAPayload(tempAttachList);
          }
        }
      } catch (error) {
        setAddAtmntSpinner(false);
        console.log(error);
      }
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
    // Till here for Bug 136215
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
          <div className={`${styles.attachmentHeader} row`}>
            <p className={styles.addAttachHeading}>{t("attachedRule")}</p>
            {isReadOnly || props.openProcessType == "R" ? null : (
              <button
                onClick={handleOpen}
                className={
                  direction === RTL_DIRECTION
                    ? arabicStyles.addAttachBtn
                    : styles.addAttachBtn
                }
                id="pmweb_AttachmentReq_AddAttachment_button"
              >
                {t("addAttachment")}
              </button>
            )}
          </div>
          {/* changes added for bug_id: 134226 */}
          <div style={{ maxHeight: "25rem", overflow: "auto" }}>
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
                      el.sAttachType === ATTACHMENT_TYPE &&
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
                              alt={t("download")}
                              onClick={() => handleDownload(item.docId)}
                              tabIndex={0}
                              onKeyDown={(e) =>
                                e.key === "Enter" && handleDownload(item.docId)
                              }
                              aria-label={`${t("attachmentName")} : ${
                                item.docName
                              } ${t("Discription")} : ${
                                item.sAttachName
                              } Download`}
                            />
                          </LightTooltip>
                        )}
                        {!isReadOnly && (
                          <LightTooltip
                            id={`Delete_Attachment_Tooltip_${item.docId}`}
                            arrow={true}
                            placement="bottom-start"
                            title={t("delete")}
                          >
                            <IconButton
                              onClick={() => handleRemoveFields(item.docId)}
                              id={`pmweb_AttachmentReq_deleteicon_${item.docId}`}
                              tabIndex={0}
                              onKeyDown={(e) =>
                                e.key === "Enter" &&
                                handleRemoveFields(item.docId)
                              }
                              className={styles.iconButton}
                              aria-label={`${t("attachmentName")} : ${
                                item.docName
                              } ${t("Discription")} : ${
                                item.sAttachName
                              } Delete`}
                              disableTouchRipple
                              disableFocusRipple
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
          </div>
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
export default connect(mapStateToProps, null)(AttachmentReq);
