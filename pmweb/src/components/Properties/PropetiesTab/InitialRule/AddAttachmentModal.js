// Changes made to solve bugID - 110890 (Validation message should be aligned properly)

import React, { useRef, useState, useEffect } from "react";
import { CircularProgress, IconButton, TextField } from "@material-ui/core";
import CloseIcon from "@material-ui/icons/Close";
import styles from "./AddAttachmentModal.module.css";
import { useTranslation } from "react-i18next";
import Field from "../../../../UI/InputFields/TextField/Field";
import { store, useGlobalState } from "state-pool";
import { ATTACHMENT_TYPE } from "../../../../Constants/appConstants";
import { FieldValidations } from "../../../../utility/FieldValidations/fieldValidations";
import { PMWEB_ARB_REGEX, PMWEB_REGEX } from "../../../../validators/validator";
import { FocusTrap } from "@mui/base";
import { checkRegex } from "../../../../utility/CommonFunctionCall/CommonFunctionCall";

const makeInputFields = (value) => {
  return { value, error: false, helperText: "" };
};

function AddAttachmentModal(props) {
  let { t } = useTranslation();
  const fileRef = useRef();
  const documentNameRef = useRef();
  const documentDescRef = useRef();
  let {
    handleClose,
    handleAddAttachment,
    setAddAtmntSpinner,
    addAtmntSpinner,
  } = props;
  const [selectedDocumentName, setSelectedDocumentName] = useState(
    makeInputFields("")
  );
  const localActivityPropertyData = store.getState("activityPropertyData");
  const [localLoadedActivityPropertyData] = useGlobalState(
    localActivityPropertyData
  );
  const [selectedFile, setSelectedFile] = useState(makeInputFields(null));
  const [description, setDescription] = useState(makeInputFields(""));
  const allowedExtension =
    /(\.doc|\.docx|\.jpeg|\.pdf|\.xls|\.png|\.zip|\.xlsx)$/i;

  const handleChangeValues = (e) => {
    const { name, value } = e.target;
    let error = "";
    switch (name) {
      case "DocumentName":
        /* code edited on 4 August 2023 for Bug 132148 - oracle>>on adding long description and 
        name of attachment in the add attachment then the user is getting no operation performed */
        if (!value) {
          error = t("attachmentEmptyError");
        } else if (value.length > 40) {
          error = t("max40CharAllowed");
        }
        // modified on 12/9/2023 for BugId 136543 and BugId 137004 and BugId 136975, 136964
        // else if (!validateRegex(value, PMWEB_REGEX.AttachmentName)) {
        else if (
          !checkRegex(
            value,
            PMWEB_REGEX.AttachmentName,
            PMWEB_ARB_REGEX.AttachmentName
          )
        ) {
          error = t("attachmentNameValidation");
        }
        //till here
        setSelectedDocumentName({
          ...selectedDocumentName,
          value,
          error: error ? true : false,
          helperText: error,
        });
        break;
      case "Description":
        /* code edited on 4 August 2023 for Bug 132148 - oracle>>on adding long description and 
        name of attachment in the add attachment then the user is getting no operation performed */
        if (value.length > 255) {
          error = t("max255CharAllowed");
        }
        setDescription({
          ...description,
          value,
          error: error ? true : false,
          helperText: error,
        });
        break;
      case "FileName":
        if (!value) {
          error = `${t("attachmentEmptyError")}`;
        }
        setSelectedFile({
          ...selectedFile,
          value,
          error: error ? true : false,
          helperText: error,
        });
        break;
      default:
        return;
    }
  };

  // Function that is called when Enter key or Esc key is pressed.
  const handleKeyDown = (e) => {
    if (e.keyCode === 13) {
      addAttachmentFunc();
    } else if (e.keyCode === 27) {
      handleClose();
      e.stopPropagation();
    }
  };

  // Function that runs when the handleKeyDown value changes.
  useEffect(() => {
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);

  const handleChange = (e) => {
    const file = e.target.files[0];

    // modified on 15/09/23 for BugId 137004
    //setSelectedFile({ ...selectedFile, value: file });
    let error = null;
    if (!file) {
      error = `${t("attachmentEmptyError")}`;
    }
    setSelectedFile({
      ...selectedFile,
      value: file,
      error: error ? true : false,
      helperText: error,
    });
    // till here BugId 137004
  };

  const validateFields = () => {
    let selFileErr = "";
    let docNameErr = "";

    if (selectedFile.value == null) {
      selFileErr = `${t("fileError")}`;
    } else if (!allowedExtension.exec(selectedFile.value.name)) {
      selFileErr = `${t("invalidType")}`;
    }
    setSelectedFile({
      ...selectedFile,
      error: selFileErr ? true : false,
      helperText: selFileErr,
    });

    if (!selectedDocumentName.value) {
      docNameErr = `${t("attachmentEmptyError")}`;
    }
    // code added on 5 Dec 2022 for BugId 120046
    if (docNameErr?.trim() === "" && localLoadedActivityPropertyData) {
      let sameName = false,
        attachType = null;
      localLoadedActivityPropertyData?.ActivityProperty?.m_objPMAttachmentDetails?.attachmentList?.forEach(
        (doc) => {
          let docName = doc.docName?.split(".")?.[0];
          if (docName === selectedDocumentName.value && doc.status !== "D") {
            sameName = true;
            attachType = doc.sAttachType;
          }
        }
      );
      if (sameName) {
        docNameErr =
          attachType === ATTACHMENT_TYPE
            ? `${t("attachmentSameNameError")}`
            : `${t("ruleSameNameError")}`;
      }
    }
    setSelectedDocumentName({
      ...selectedDocumentName,
      error: docNameErr ? true : false,
      helperText: docNameErr,
    });

    return selFileErr || docNameErr ? false : true;
  };

  const addAttachmentFunc = () => {
    let isValid = validateFields();
    if (
      !selectedDocumentName.error &&
      !description.error &&
      !selectedFile.error &&
      isValid
    ) {
      /*code added on 12 July 2023 for BugId 132145 - oracle>> user is getting the error of no 
        loader on add attachment and user is able to add same name attachment docs */
      setAddAtmntSpinner(true);
      handleAddAttachment(selectedFile, selectedDocumentName, description);
    }
  };

  return (
    <FocusTrap open>
      <div>
        <div className={styles.modalHeader}>
          <h3 className={styles.modalHeading}>{t("addAttachment")}</h3>
          <IconButton
            tabIndex={0}
            onClick={handleClose}
            className={styles.iconButton}
            id={"pmweb_AddAttachmentModal_CloseIcon"}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                handleClose();
                e.stopPropagation();
              }
            }}
            aria-label="Close"
            aria-description="Closes the window"
            disableFocusRipple
            disableTouchRipple
          >
            <CloseIcon
              className={styles.closeIcon}
              style={{ color: "black" }}
            />
          </IconButton>
        </div>
        <div className={styles.modalBody}>
          <div className={styles.invocationDiv}>
            <div className={styles.file}>
              <div className={styles.inputDiv}>
                <Field
                  ariaLabel={"FileName"}
                  id={"pmweb_AddAttachmentModal_AttachFileName"}
                  name="FileName"
                  required={true}
                  label={t("fileName")}
                  value={selectedFile.value?.name}
                  onChange={handleChangeValues}
                  error={selectedFile.error}
                  helperText={selectedFile.helperText}
                  onClick={() => fileRef.current.click()}
                  disabled={true}
                />
              </div>
              <button
                id="pmweb_AddAttachmentModal_ChooseFile_Btn"
                className={styles.chooseButton}
                onClick={() => fileRef.current.click()}
                aria-label="Choose File Button"
              >
                {t("chooseFile")}
              </button>
              <input
                name="inputFile"
                id="pmweb_AddAttachmentModal_InputFile"
                ref={fileRef}
                aria-label="inputFile"
                onChange={handleChange}
                type="file"
                hidden
              />
            </div>
          </div>
          <div className={styles.invocationDiv}>
            <div className={styles.inputDiv}>
              <Field
                id="pmweb_AddAttachmentModal_AttachDocumentName"
                name="DocumentName"
                required={true}
                label={t("documentName")}
                value={selectedDocumentName.value}
                onChange={handleChangeValues}
                error={selectedDocumentName.error}
                helperText={selectedDocumentName.helperText}
                inputRef={documentNameRef}
                onKeyPress={(e) =>
                  /* code edited on 4 August 2023 for Bug 132148 - oracle>>on adding long 
                description and name of attachment in the add attachment then the user is 
                getting no operation performed */
                  FieldValidations(e, 157, documentNameRef.current, 40)
                }
                aria-label="Document Name Field"
              />
            </div>
          </div>
          <div className={styles.invocationDiv}>
            <label
              className={styles.modalLabel}
              htmlFor="pmweb_AddAttachmentModal_Description"
            >
              {t("Discription")}
            </label>
            <div className={styles.file}>
              {/* code edited on 4 August 2023 for Bug 132148 - oracle>>on adding long description 
            and name of attachment in the add attachment then the user is getting no operation 
            performed */}
              <TextField
                id="pmweb_AddAttachmentModal_Description"
                className={styles.modalInput1}
                name="Description"
                onChange={handleChangeValues}
                error={description.error}
                helperText={description.helperText}
                inputProps={{
                  "aria-label": "Description",
                }}
                FormHelperTextProps={{
                  style: {
                    marginLeft: 0,
                    marginTop: 0,
                    textAlign: "start",
                    fontSize: "10px",
                    fontWeight: 600,
                    color: description.error ? "#b52a2a" : "#606060",
                  },
                }}
                value={description.value}
                inputRef={documentDescRef}
                onKeyPress={(e) =>
                  FieldValidations(e, 142, documentDescRef.current, 255)
                }
              />
            </div>
          </div>
          <div className={styles.invocationDiv}>
            <span className={styles.modalLabel}>{t("note")}</span>
          </div>
        </div>

        <div className={styles.modalFooter}>
          <button
            className={styles.cancelButton}
            onClick={handleClose}
            id="pmweb_AddAttachmentModal_CancelBtn"
          >
            {t("cancel")}
          </button>
          <button
            id="pmweb_AddAttachmentModal_AddBtn"
            className={styles.okButton}
            onClick={addAttachmentFunc}
            //Modified on 04/09/2023, bug_id:135669
            /*disabled={
              addAtmntSpinner ||
              selectedFile.error
            }*/
            disabled={
              addAtmntSpinner ||
              description.error ||
              selectedDocumentName.error ||
              selectedFile.error
            }
            //till here for bug_id:135669
            style={{
              cursor:
                addAtmntSpinner ||
                description.error ||
                selectedDocumentName.error ||
                selectedFile.error
                  ? "default"
                  : "pointer",
            }}
          >
            {/*code edited on 12 July 2023 for BugId 132145 - oracle>> user is getting the error 
            of no loader on add attachment and user is able to add same name attachment docs */}
            {addAtmntSpinner ? (
              <>
                <CircularProgress
                  style={{
                    width: "1rem",
                    height: "1rem",
                    color: "white",
                  }}
                />
                {t("add")}
              </>
            ) : (
              t("add")
            )}
          </button>
        </div>
      </div>
    </FocusTrap>
  );
}
export default AddAttachmentModal;
