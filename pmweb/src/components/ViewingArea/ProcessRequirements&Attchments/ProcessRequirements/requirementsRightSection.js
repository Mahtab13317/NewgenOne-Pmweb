// #BugID - 119365
// #BugDescription - Handled checks for attachList and add feature to show proper attachlist after atatchment.
import React, { useEffect, useState } from "react";
import SunEditor from "../../../../UI/SunEditor/SunTextEditor";
import "./index.css";
import { useDispatch } from "react-redux";
import Modal from "../../../../UI/Modal/Modal.js";
import DeleteOutlineIcon from "@material-ui/icons/DeleteOutline";
import styles from "../../../../components/Properties/PropetiesTab/InitialRule/initial.module.css";
import AddAttachmentModal from "../../../../components/Properties/PropetiesTab/InitialRule/AddAttachmentModal.js";
import {
  RULE_TYPE,
  SERVER_URL,
  ENDPOINT_UPLOAD_ATTACHMENT,
  propertiesLabel,
  ENDPOINT_DOWNLOAD_ATTACHMENT,
  RTL_DIRECTION,
  ENDPOINT_REGISTER_PROCESS,
  PROCESSTYPE_DEPLOYED,
  PROCESSTYPE_REGISTERED,
} from "../../../../Constants/appConstants";
import { connect } from "react-redux";
import { useTranslation } from "react-i18next";
import { setActivityPropertyChange } from "../../../../redux-store/slices/ActivityPropertyChangeSlice.js";
import axios from "axios";
import { setToastDataFunc } from "../../../../redux-store/slices/ToastDataHandlerSlice";
import arabicStyles from "../../../../components/Properties/PropetiesTab/InitialRule/arabicStyles.module.css";
import {
  encode_utf8,
  decode_utf8,
} from "../../../../utility/UTF8EncodeDecoder";
import DownloadIcon from "../../../../../src/assets/abstractView/Icons/Download.svg";
import DOMPurify from "dompurify";
import clsx from "clsx";
import { LightTooltip } from "../../../../UI/StyledTooltip";
import { IconButton } from "@material-ui/core";
import { validateUploadedFile } from "../../../../utility/CommonFunctionCall/CommonFunctionCall";
// --------------

function RequireRightSection(props) {
  let { t } = useTranslation();
  const dispatch = useDispatch();
  const direction = `${t("HTML_DIR")}`;
  const [showAttach, setShowAttach] = useState(false);
  const [attachList, setAttachList] = useState([]);
  const [addAtmntSpinner, setAddAtmntSpinner] = useState(false);
  const [saveCancelDisabled, setSaveCancelDisabled] = useState(true);
  const isReadOnly =
    props.isReadOnly ||
    props.openTemplateFlag ||
    props.openProcessType === PROCESSTYPE_DEPLOYED ||
    props.openProcessType === PROCESSTYPE_REGISTERED;

  // added on 20/10/23 for BugId 139684
  const setInitialValues = (completeSections, selectedOrder) => {
    completeSections?.forEach((section) => {
      if (
        +selectedOrder?.SectionLevel === 0 &&
        +section?.RequirementId === +selectedOrder?.RequirementId
      ) {
        setAttachList(section?.Attachment ? section.Attachment : []);
      } else if (+selectedOrder?.SectionLevel === 1) {
        section?.InnerRequirement?.forEach((inner) => {
          if (+inner?.RequirementId === +selectedOrder?.RequirementId) {
            setAttachList(inner?.Attachment ? inner.Attachment : []);
          }
        });
      } else if (+selectedOrder?.SectionLevel === 2) {
        section?.InnerRequirement?.forEach((inner) => {
          inner.InnerRequirement2?.forEach((pl) => {
            if (+pl.RequirementId === +selectedOrder?.RequirementId) {
              setAttachList(pl?.Attachment ? pl.Attachment : []);
            }
          });
        });
      } else {
        setAttachList(section?.Attachment ? section.Attachment : []);
      }
      setAttachList(selectedOrder?.Attachment);
    });
  };

  // code updated on 14 Nov 2022 for BugId 115553
  useEffect(() => {
    // modified on 20/10/23 for BugId 139684
    setInitialValues(props?.completeSections, props?.selectedOrder);
  }, [props?.selectedOrder, props?.completeSections]);

  const handleOpen = () => {
    setShowAttach(true);
  };

  const handleClose = () => {
    setShowAttach(false);
  };

  const handleRemoveFields = (i) => {
    let temp = global.structuredClone(props.selectedOrder);
    temp.Attachment.forEach((val) => {
      if (val.DocId === i) {
        val.Status = "D";
      }
    });
    props.setSelectedOrder(temp);
    let allSections = global.structuredClone(props.completeSections);
    allSections.forEach((sec) => {
      if (props.selectedOrder.SectionLevel === "0") {
        sec.Attachment.forEach((val) => {
          if (val.DocId === i) {
            val.Status = "D";
          }
        });
      } else if (props.selectedOrder.SectionLevel === "1") {
        if (sec.hasOwnProperty("InnerRequirement")) {
          sec?.InnerRequirement.forEach((innerReq) => {
            innerReq.Attachment.forEach((val) => {
              if (val.DocId === i) {
                val.Status = "D";
              }
            });
          });
        }
      } else {
        sec?.InnerRequirement.forEach((innerReq) => {
          if (sec.hasOwnProperty("InnerRequirement")) {
            innerReq.forEach((innerReq) => {
              if (innerReq.hasOwnProperty("InnerRequirement2")) {
                innerReq?.InnerRequirement2.forEach((innerReq2) => {
                  innerReq2.Attachment.forEach((val) => {
                    if (val.DocId === i) {
                      val.Status = "D";
                    }
                  });
                });
              }
            });
          }
        });
      }
    });
    props.setSections(allSections);
    // added on 20/10/23 for BugId 139684
    setSaveCancelDisabled(false);
  };

  const handleDownload = (docId) => {
    let payload = {
      processDefId: props.openProcessID,
      docId: docId,
      repoType: props.openProcessType,
    };

    axios({
      method: "POST",
      url: "/pmweb" + ENDPOINT_DOWNLOAD_ATTACHMENT,
      data: payload,
    }).then((res) => {
      if (res.status === 200) {
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
        dispatch(
          setToastDataFunc({
            message: t("fileImportSuccess"),
            severity: "success",
            open: true,
          })
        );
      }
    });
  };

  const handleAddAttachment = async (
    selectedFile,
    selectedDocumentName,
    description
  ) => {
    // Modified on 04-10-23 for Bug 138662
    if (!validateUploadedFile(selectedFile?.value?.size, 30)) {
      var n = selectedFile.value.name.lastIndexOf(".");
      var result = selectedFile.value.name.substring(n + 1);

      let payload = {
        processDefId: props.openProcessID,
        docName: selectedDocumentName.value,
        docExt: result,
        // actId: props.cellID,
        // actName: props.cellName,
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
          url: "/pmweb" + ENDPOINT_UPLOAD_ATTACHMENT,
          data: formData,
          headers: {
            "Content-Type": "multipart/form-data",
          },
        });
        if (response.status === 200 && response?.data?.Output) {
          handleClose();
          let resultObj = {
            docExt: result,
            DocId: response?.data?.Output?.docId,
            DocName: response?.data?.Output?.docName,
            requirementId: response?.data?.Output?.reqId,
            AttachmentName: response?.data?.Output?.sAttachName,
            sAttachType: response?.data?.Output?.sAttachType,
            status: "S",
          };
          let tempAttach = attachList?.length > 0 ? [...attachList] : [];
          tempAttach = [...tempAttach, resultObj];
          setAttachList(tempAttach);
          /*code added on 12 July 2023 for BugId 132145 - oracle>> user is getting the error of no 
        loader on add attachment and user is able to add same name attachment docs */
          setAddAtmntSpinner(false);
          let tempSelectedData = { ...props?.selectedOrder };
          tempSelectedData.Attachment = tempAttach;
          props.setSelectedOrder(tempSelectedData);
        }
      } catch (error) {
        setAddAtmntSpinner(false);
        dispatch(
          setToastDataFunc({
            message: "",
            severity: "error",
            open: true,
          })
        );
      }

      // added on 20/10/23 for BugId 139684
      if (props.fromArea === "activityLevel") {
        dispatch(
          setActivityPropertyChange({
            [propertiesLabel.initialRules]: {
              isModified: true,
              hasError: false,
            },
          })
        );
      } else {
        setSaveCancelDisabled(false);
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
    // Till here for Bug 138662
  };

  // code edited on 11 Jan 2023 for BugId 117908
  const changeFieldDetails = (e, name) => {
    if (name === "textOne") {
      props.setSelectedOrder((prev) => {
        let temp = { ...prev };
        temp.ReqDesc = e.target.innerHTML;
        return temp;
      });
    } else {
      props.setSelectedOrder((prev) => {
        let temp = { ...prev };
        temp.ReqImpl = e.target.innerHTML;
        return temp;
      });
    }

    if (props.fromArea == "activityLevel") {
      dispatch(
        setActivityPropertyChange({
          [propertiesLabel.initialRules]: {
            isModified: true,
            hasError: false,
          },
        })
      );
    }
  };

  //Added on 16/10/2023, bug_id:136034
  const textOneHandler = (e) => {
    const val = e?.target?.innerHTML;
    props.setSelectedOrder((prev) => {
      let temp = { ...prev };
      temp.ReqDesc = val;
      return temp;
    });
    if (props.fromArea === "activityLevel") {
      dispatch(
        setActivityPropertyChange({
          [propertiesLabel.initialRules]: {
            isModified: true,
            hasError: false,
          },
        })
      );
    } else {
      // added on 20/10/23 for BugId 139684
      setSaveCancelDisabled(false);
    }
  };

  const textTwoHandler = (e) => {
    const val = e?.target?.innerHTML;
    props.setSelectedOrder((prev) => {
      let temp = { ...prev };
      temp.ReqImpl = val;
      return temp;
    });
    if (props.fromArea === "activityLevel") {
      dispatch(
        setActivityPropertyChange({
          [propertiesLabel.initialRules]: {
            isModified: true,
            hasError: false,
          },
        })
      );
    } else {
      // added on 20/10/23 for BugId 139684
      setSaveCancelDisabled(false);
    }
  };
  //till here for bug_id:136034

  //Added on 13/10/2023, bug_id:136034
  const handleChange = (data, name) => {
    let hasUpdated = false;
    if (name === "textOne") {
      // added on 20/10/23 for BugId 139684
      if (data !== decode_utf8(props.originalSelOrder?.ReqDesc)) {
        hasUpdated = true;
      }
      props.setSelectedOrder((prev) => {
        let temp = { ...prev };
        temp.ReqDesc = data;
        return temp;
      });
    } else {
      // added on 20/10/23 for BugId 139684
      if (data !== decode_utf8(props.originalSelOrder?.ReqImpl)) {
        hasUpdated = true;
      }
      props.setSelectedOrder((prev) => {
        let temp = { ...prev };
        temp.ReqImpl = data;
        return temp;
      });
    }
    // added on 20/10/23 for BugId 139684
    if (hasUpdated) {
      if (props.fromArea === "activityLevel") {
        dispatch(
          setActivityPropertyChange({
            [propertiesLabel.initialRules]: {
              isModified: true,
              hasError: false,
            },
          })
        );
      } else {
        setSaveCancelDisabled(false);
      }
    }
  };

  useEffect(() => {
    if (props?.selectedOrder?.ReqDesc !== "") {
      props.setSelectedOrder((prev) => {
        let temp = { ...prev };
        temp.ReqDesc = decode_utf8(props?.selectedOrder?.ReqDesc);
        return temp;
      });
    }
    if (props?.selectedOrder?.ReqImpl !== "") {
      props.setSelectedOrder((prev) => {
        let temp = { ...prev };
        temp.ReqImpl = decode_utf8(props?.selectedOrder?.ReqImpl);
        return temp;
      });
    }
  }, []);

  //till here for bug_id:136034

  // code edited on 11 Jan 2023 for BugId 117908
  const saveChangesFunc = () => {
    let attachmentsList = attachList?.map((attach) => {
      return {
        docName: attach?.DocName,
        docId: attach?.DocId,
        status: attach?.Status ? attach?.Status : attach?.status,
        sAttachType: attach?.sAttachType,
        sAttachName: attach?.AttachmentName,
        requirementId: props?.selectedOrder?.RequirementId,
      };
    });

    let jsonBody = {
      processDefId: props?.openProcessID,
      processState: props?.openProcessType,
      reqList: [
        {
          reqName: props?.selectedOrder?.RequirementName,
          reqId: props?.selectedOrder?.RequirementId,
          reqDesc: encode_utf8(props?.selectedOrder?.ReqDesc),
          reqImpl: encode_utf8(props?.selectedOrder?.ReqImpl),
          priority: 1,
          attachmentList: attachmentsList,
        },
      ],
    };

    axios
      .post(SERVER_URL + ENDPOINT_REGISTER_PROCESS, jsonBody)
      .then((res) => {
        // added on 20/10/23 for BugId 139684
        setSaveCancelDisabled(true);
        dispatch(
          setToastDataFunc({
            message: res.data.Message,
            severity: "success",
            open: true,
          })
        );
      })
      .catch((err) => {
        console.log(err);
      });
  };

  // added on 20/10/23 for BugId 139684
  const discardChangesFunc = () => {
    setInitialValues(props?.completeSections, props?.originalSelOrder);
    props.setSelectedOrder((prev) => {
      let temp = { ...prev };
      temp.ReqDesc = decode_utf8(props?.originalSelOrder?.ReqDesc);
      temp.ReqImpl = decode_utf8(props?.originalSelOrder?.ReqImpl);
      return temp;
    });
    setSaveCancelDisabled(true);
  };

  return (
    <div>
      <div>
        <div
          style={{
            paddingLeft: "0.5vw",
          }}
        >
          <p
            style={{
              fontSize: "var(--title_text_font_size)",
              fontWeight: "600",
            }}
          >
            {props?.selectedOrder?.RequirementName}
          </p>
          <p
            style={{
              fontSize: "var(--base_text_font_size)",
              color: "#606060",
              marginBottom: "0.75rem",
            }}
          >
            {`${t("subsectionLevel")}: ${props?.selectedOrder?.SectionLevel}`}
          </p>
          <div style={{ height: "26vh" }}>
            <SunEditor
              id="textOne_description_sunEditor"
              width="100%"
              customHeight="6rem"
              placeholder={t("writeHerePlaceholder")}
              callLocation="processProperties"
              /*value={
                props?.selectedOrder?.ReqDesc !== undefined
                  ? decode_utf8(props?.selectedOrder?.ReqDesc)
                  : ""
              }*/
              value={decode_utf8(props?.selectedOrder?.ReqDesc)} //Modified on 16/10/2023, bug_id:136034
              //getValue={(e) => {changeFieldDetails(e, "textOne")}}
              getValue={(e) => textOneHandler(e)} //Modified on 17/10/2023, bug_id:136034
              zIndex="99" //Bug 117909 - [23-02-2023] Provided a zIndex
              disabled={isReadOnly}
              // idTag="textOne_description_sunEditor"
              handleChange={(e) => {
                handleChange(e, "textOne");
              }} //Modified on 16/10/2023, bug_id:136034
            />
          </div>
          <p
            style={{
              fontSize: "var(--subtitle_text_font_size)",
              // fontSize: "var(--title_text_font_size)",
              fontWeight: "600",
              margin: "1rem 0 0.75rem",
            }}
          >
            {t("implementationSummary")}
          </p>
          <div aria-label="textEditor" style={{ height: "26vh" }}>
            <SunEditor
              id="textTwo_description_sunEditor"
              width="100%"
              customHeight="6rem"
              placeholder={t("writeHerePlaceholder")}
              callLocation="processProperties"
              /*value={
                props?.selectedOrder?.ReqImpl !== undefined
                  ? decode_utf8(props?.selectedOrder?.ReqImpl)
                  : ""
              }
              getValue={(e) => {
                changeFieldDetails(e, "textTwo");
              }}*/
              value={decode_utf8(props?.selectedOrder?.ReqImpl)} //Modified on 16/10/2023, bug_id:136034
              getValue={(e) => textTwoHandler(e)} //Modified on 17/10/2023, bug_id:136034
              disabled={isReadOnly}
              handleChange={(e) => {
                handleChange(e, "textTwo"); //Modified on 17/10/2023, bug_id:136034
              }}
            />
          </div>
        </div>
        {/* ----------------------------Attachments Table------------------------------- */}
        <div
          className={`${styles.initialRule} ${
            props.isDrawerExpanded ? styles.expandedView : styles.collapsedView
          }`}
        >
          <div
            className={`${styles.attachmentHeader} row`}
            style={{ padding: "0.5rem 0 0 0.5vw" }}
          >
            <p className={styles.addAttachHeading}>{t("attachedRule")}</p>
            {!isReadOnly && (
              <button
                id={"pmweb_RequirementsRightSection_AddAttachment_Btn"}
                onClick={handleOpen}
                className={
                  direction === RTL_DIRECTION
                    ? arabicStyles.addAttachBtn
                    : styles.addAttachBtn
                }
                disabled={isReadOnly}
              >
                {t("addAttachment")}
              </button>
            )}
          </div>
          <table className={styles.tableDiv}>
            <thead className={styles.tableHeader}>
              <tr className={styles.tableHeaderRow}>
                <td
                  className={clsx(
                    styles.attachDiv,
                    direction === RTL_DIRECTION
                      ? arabicStyles.divHead
                      : styles.divHead
                  )}
                >
                  {t("attachmentName")}
                </td>
                <td
                  className={clsx(
                    styles.descDiv,
                    direction === RTL_DIRECTION
                      ? arabicStyles.divHead
                      : styles.divHead
                  )}
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
              {props.selectedOrder.Attachment?.filter(
                (el) =>
                  // el.AttachmentType === RULE_TYPE &&
                  // (el.Status === STATUS_TYPE_TEMP ||
                  //   el.Status === STATUS_TYPE_ADDED)
                  el.Status != "D"
              )?.map((item, i) => (
                <tr className={styles.tableRow}>
                  <td
                    className={`${styles.attachDiv} ${
                      direction === RTL_DIRECTION
                        ? arabicStyles.divBody
                        : styles.divBody
                    }`}
                  >
                    {item.DocName}
                  </td>
                  <td
                    className={`${styles.descDiv} ${
                      direction === RTL_DIRECTION
                        ? arabicStyles.divBody
                        : styles.divBody
                    }`}
                  >
                    {item.AttachmentName}
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
                      paddingLeft: "4vw",
                      width: "10%",
                      display: "flex",
                      flexDirection: "row",
                    }}
                  >
                    {/* <SystemUpdateAltIcon
                        className={styles.downloadIcon}
                        onClick={() => handleDownload(item.DocId)}
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
                          onClick={() => handleDownload(item.DocId)}
                          tabIndex={0}
                          onKeyDown={(e) =>
                            e.key === "Enter" && handleDownload(item.DocId)
                          }
                          aria-label={`${t("attachmentName")}: ${
                            item.DocName
                          } ${t("Discription")}: ${
                            item.AttachmentName
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
                          onClick={() => handleRemoveFields(item.DocId)}
                          id="pmweb_requirementRightSection_DeleteOutlineIcon"
                          tabIndex={0}
                          onKeyDown={(e) =>
                            e.key === "Enter" && handleRemoveFields(item.DocId)
                          }
                          aria-label={`${t("attachmentName")}: ${
                            item.DocName
                          } ${t("Discription")}: ${item.AttachmentName} Delete`}
                          className={styles.iconButton}
                          disableTouchRipple
                          disableFocusRipple
                          disableRipple
                        >
                          <DeleteOutlineIcon
                            className={styles.deleteIcon1}
                            style={{ color: "black" }}
                          />
                        </IconButton>
                      </LightTooltip>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {showAttach ? (
            <Modal
              show={showAttach}
              style={{
                // width: "40vw",
                // left: "30%",
                top: "20%",
                padding: "0",
              }}
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
        {/* ---------------------------------------------------------------------------------------------------- */}
      </div>
      {/* Strip------------------ */}
      {!isReadOnly && props?.fromArea === "ProcessLevel" ? (
        <div className={"propertiesFooterButtons"}>
          <button
            id="pmweb_RequirementsRightSection_PropertiesDiscardButton"
            disabled={saveCancelDisabled} // added on 20/10/23 for BugId 139684
            onClick={() => discardChangesFunc()} // added on 20/10/23 for BugId 139684
            className="properties_cancelButton"
          >
            {t("discard")}
          </button>
          <button
            id="pmweb_RequirementsRightSection_PropertiesSaveButton"
            disabled={saveCancelDisabled} // added on 20/10/23 for BugId 139684
            onClick={() => saveChangesFunc()} // added on 20/10/23 for BugId 139684
            className="properties_saveButton"
          >
            {t("saveChanges")}
          </button>
        </div>
      ) : null}
    </div>
  );
}

const mapStateToProps = (state) => {
  return {
    cellID: state.selectedCellReducer.selectedId,
    cellName: state.selectedCellReducer.selectedName,
    isDrawerExpanded: state.isDrawerExpanded.isDrawerExpanded,
    openProcessID: state.openProcessClick.selectedId,
    openProcessType: state.openProcessClick.selectedType,
    openTemplateFlag: state.openTemplateReducer.openFlag,
  };
};

export default connect(mapStateToProps, null)(RequireRightSection);
