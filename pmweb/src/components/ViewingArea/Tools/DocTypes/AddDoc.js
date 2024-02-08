// Changes made to solve Bug 126087 - document type>>message is inappropriate while named with special charcaters.
import React, { useState, useEffect, useRef } from "react";
import "./DocTypes.css";
import styles from "./index.module.css";
import { useTranslation } from "react-i18next";
import { RTL_DIRECTION } from "../../../../Constants/appConstants";
import CloseIcon from "@material-ui/icons/Close";
import arabicStyles from "./arabicStyles.module.css";
import CheckboxField from "../../../../UI/InputFields/CheckboxFields/CheckboxField";
import { FieldValidations } from "../../../../utility/FieldValidations/fieldValidations";
import { decode_utf8 } from "../../../../utility/UTF8EncodeDecoder";
import { IconButton, CircularProgress } from "@material-ui/core";
import { FocusTrap } from "@mui/base";
import {
  insertNewlineAtCursor,
  isArabicLocaleSelected,
} from "../../../../utility/CommonFunctionCall/CommonFunctionCall";

function AddDoc(props) {
  let { t } = useTranslation();
  const { spinner, isReadOnly } = props;
  const direction = `${t("HTML_DIR")}`;
  const [nameInput, setNameInput] = useState("");
  const [descInput, setDescInput] = useState("");
  const [docNameError, setdocNameError] = useState(false);
  const [lenghtExceed, setLengthExceed] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const docNameRef = useRef();
  const textareaRef = useRef(null);

  // Added on 12-09-23 for Bug 135469
  useEffect(() => {
    const textareaElement = textareaRef.current;

    // Added event listener for focusing on the textarea
    const handleFocus = () => {
      setIsFocused(true);
    };

    // Added event listener for blurring from the textarea
    const handleBlur = () => {
      setIsFocused(false);
    };

    // Add event listener for keydown in the textarea
    const handleKeyDown = (event) => {
      if (event.key === "Enter" && !event.shiftKey && isFocused) {
        // If Enter is pressed without Shift and the textarea is focused, do nothing
        event.preventDefault();
      } else if (
        event.key === "Enter" &&
        event.shiftKey
        // (event.key === "Enter" && event.altKey)
      ) {
        // If Shift+Enter is pressed, add a new line to the textarea
        event.preventDefault();
        const val = insertNewlineAtCursor(textareaRef);
        setDescInput(val);
      }
    };

    textareaElement.addEventListener("focus", handleFocus);
    textareaElement.addEventListener("blur", handleBlur);
    textareaElement.addEventListener("keydown", handleKeyDown);

    return () => {
      // Removed event listeners when the component unmounts
      textareaElement.removeEventListener("focus", handleFocus);
      textareaElement.removeEventListener("blur", handleBlur);
      textareaElement.removeEventListener("keydown", handleKeyDown);
    };
  }, [isFocused]);
  // Till here for Bug 135469

  const handleChange = (e) => {
    const { name, checked } = e.target;
    switch (name) {
      case "isMandatory":
        setIsMandatory({ ...isMandatory, value: checked });
        break;
      default:
        break;
    }
  };
  const makingCheckboxFields = (name, value, label) => {
    return {
      name,
      value,
      label,
      onChange: handleChange,
    };
  };
  const [isMandatory, setIsMandatory] = useState(
    makingCheckboxFields("isMandatory", props?.isMandatory, t("isMandatory"))
  );
  // Added on 04-09-2023 to resolve the bug id 138080
  const containsSpecialChars = (str) => {
    if (isArabicLocaleSelected()) {
      var regex = new RegExp('[#*|\\\\:"<>?,//]+');
      return !regex.test(str);
    } else {
      var regex = new RegExp('^[A-Za-z][^*:|\\\\<>?,/"]*$');
    }
    return regex.test(str);
  };
  // Added on 04-09-2023 to resolve the bug id 138080
  const validateData = (e) => {
    setLengthExceed(false);

    if (e.target.value === "") {
      // props.setShowDocNameError(true);
      setdocNameError(false);
      return false;
    }
    if (e.target.value.length > 50) {
      setLengthExceed(true);
    } else if (!containsSpecialChars(e.target.value)) {
      if (isArabicLocaleSelected()) {
        setdocNameError(true);
        setNameInput(e.target.value);
        return false;
      } else {
        setdocNameError(true);
        setNameInput(e.target.value);
        return false;
      }
    } else {
      setdocNameError(false);
      setLengthExceed(false);
    }
  };

  const setNameFunc = (e, refName) => {
    // let returnValue = true;
    // Changes on 27-09-2023 to resolve the bug id 138080
    // setLengthExceed(false);
    // if (e.target.value.length>50) {
    //   setLengthExceed(true);
    //   return false;
    // }
    // for (let i = 0; i < e.target.value.length; i++) {
    //   const KeyID = e.target.value.charCodeAt(i);

    //   if (
    //     KeyID == 47 ||
    //     KeyID == 92 ||
    //     KeyID == 58 ||
    //     KeyID == 42 ||
    //     KeyID == 44 ||
    //     KeyID == 63 ||
    //     KeyID == 34 ||
    //     KeyID == 35 ||
    //     KeyID == 60 ||
    //     KeyID == 62 ||
    //     KeyID == 124
    //     // Changes on 27-09-2023 to resolve the bug id 138080
    //     // e.target.value.length + 1 >= 50
    //   ) {
    //     returnValue = false;
    //   } else returnValue = true;
    //   //modified on 26/8/2019,bug_id:86178
    //   //if( textBoxElem.value.length+1==0 && !((KeyID>64 && KeyID < 91) || (KeyID>96 && KeyID < 123)))
    //   if (
    //     e.target.value.length + 1 == 0 &&
    //     !(
    //       (KeyID > 64 && KeyID < 91) ||
    //       (KeyID > 96 && KeyID < 123) ||
    //       (KeyID >= 48 && KeyID <= 57)
    //     )
    //   ) {
    //     returnValue = false;
    //     e.preventDefault();
    //   }

    //   if (returnValue === false) {
    //     setdocNameError(true);
    //     setNameInput(e.target.value);
    //     return false;
    //   } else {
    //     setdocNameError(false);
    //     setLengthExceed(false);
    //   }
    // }

    if (e.target.value !== "" && props.setShowDocNameError) {
      props.setShowDocNameError(false);
    }
    setNameInput(e.target.value);
    // Changes made to solve bug ID 109986
    props.docData?.DocumentTypeList?.forEach((type) => {
      if (props.setbDocExists) {
        if (type.DocName.toLowerCase() == e.target.value) {
          props.setbDocExists(true);
        } else {
          props.setbDocExists(false);
        }
      }
    });
  };
  const setDescFunc = (e) => {
    setDescInput(e.target.value);
  };
  useEffect(() => {
    if (props.docNameToModify) {
      //Modified  on 09/08/2023, bug_id:134070
      //document.getElementById("DocDescInput").focus();
      document.getElementById("pmweb_docType_addDoc_DocDescInput").focus();
      document.getElementById(
        "pmweb_docType_addDoc_DocNameInput"
      ).disabled = true;
    }
  }, []);

  useEffect(() => {
    if (props.docDescToModify) {
      setDescInput(decode_utf8(props.docDescToModify));
    }
    if (props.docNameToModify) {
      setNameInput(props.docNameToModify);
    }
    if (typeof props.isMandatory === "boolean") {
      setIsMandatory({ ...isMandatory, value: props.isMandatory });
    }
  }, [props.docDescToModify, props.docNameToModify, props.isMandatory]);

  // code added on 2 August 2022 for BugId 112251
  useEffect(() => {
    if (props.addAnotherDoc) {
      setNameInput("");
      setDescInput("");
      setIsMandatory({ ...isMandatory, value: false });
      props.setAddAnotherDoc(false);
    }
  }, [props.addAnotherDoc]);

  // useEffect(() => {
  //   const close = (e) => {
  //     if (e.keyCode === 27) {
  //       props.handleClose();
  //     }
  //   };
  //   window.addEventListener("keydown", close);
  //   return () => window.removeEventListener("keydown", close);
  // }, []);

  // Modified on 12-09-23 for Bug 135469
  const handleAddAnother = (e) => {
    if (e.key === "Enter" && e.shiftKey) {
      e.preventDefault();
    } else if (e.key === "Enter" && !docNameError) {
      props.addDocToList(nameInput, descInput, "addAnother", isMandatory.value);
      e.stopPropagation();
    }
    if (e.keyCode === 27) {
      props.handleClose();
    }
  };

  useEffect(() => {
    document.addEventListener("keydown", handleAddAnother);
    return () => document.removeEventListener("keydown", handleAddAnother);
  }, [handleAddAnother]);

  // Till here for Bug 135469

  return (
    <FocusTrap open>
      <div
        className="addDocs"
        style={{ direction: direction == RTL_DIRECTION ? "rtl" : "ltr" }}
      >
        <div className={styles.modalHeader}>
          <h3
            className={
              direction === RTL_DIRECTION
                ? arabicStyles.modalHeading
                : styles.modalHeading
            }
          >
            {props.docNameToModify ? t("DocumentDetails") : t("addDocuments")}
          </h3>
          <IconButton
            onClick={() => props.handleClose()}
            id="pmweb_docType_AddDoc_Close"
            tabIndex={0}
            onKeyUp={(e) => {
              if (e.key === "Enter") {
                props.handleClose();
                e.stopPropagation();
              }
            }}
            className={styles.iconButton}
            disableFocusRipple
            disableTouchRipple
            aria-label="Close"
          >
            <CloseIcon className={styles.closeIcon} />
          </IconButton>
        </div>
        <div className={styles.modalSubHeader}>
          <label
            className={styles.modalLabel}
            htmlFor="pmweb_docType_addDoc_DocNameInput"
          >
            {t("documentType")}
            <span className={styles.starIcon}>*</span>
          </label>
          {/*code removed on 2 Aug 2023 for Bug 132210 - document type>>getting not found when added document with enter button */}
          <input
            id="pmweb_docType_addDoc_DocNameInput"
            value={nameInput}
            onChange={(e) => {
              validateData(e);
              setNameFunc(e, docNameRef.current);
            }}
            autoFocus={true}
            className={styles.modalInput}
            ref={docNameRef}
            onKeyPress={(e) => FieldValidations(e, 177, docNameRef.current, 50)}
          />
          {props.showDocNameError ? (
            <span
              style={{
                color: "red",
                fontSize: "10px",
                marginTop: "-1.25rem",
                marginBottom: "0.5rem",
                display: "block",
              }}
            >
              {t("filltheDocumentName")}
            </span>
          ) : null}
          {docNameError ? (
            <span
              style={{
                color: "red",
                fontSize: "10px",
                marginTop: "-1.25rem",
                marginBottom: "0.5rem",
                display: "block",
              }}
            >
              {t("docNameError")}
            </span>
          ) : // Changes on 27-09-2023 to resolve the bug id 138080
          lenghtExceed ? (
            <span
              style={{
                color: "red",
                fontSize: "10px",
                marginTop: "-1.25rem",
                marginBottom: "0.5rem",
                display: "block",
              }}
            >
              {t("docLengthLimit")}
            </span>
          ) : null}
          {props.bDocExists ? (
            <span
              style={{
                color: "red",
                fontSize: "var(--base_text_font_size)",
                marginTop: "-1.25rem",
                marginBottom: "0.5rem",
                display: "block",
              }}
            >
              {t("docAlreadyExists")}
            </span>
          ) : null}
          <label
            className={styles.modalLabel}
            htmlFor="pmweb_docType_addDoc_DocDescInput"
          >
            {t("description")}
          </label>
          <textarea
            id="pmweb_docType_addDoc_DocDescInput"
            ref={textareaRef}
            value={descInput}
            onChange={(e) => setDescFunc(e)}
            className={styles.modalTextArea}
            disabled={props.docNameToModify ? true : false}
          />
          <CheckboxField
            {...isMandatory}
            disabled={props.docNameToModify ? true : false}
          />
        </div>
        <div
          className={
            direction === RTL_DIRECTION
              ? arabicStyles.modalFooter
              : styles.modalFooter
          }
        >
          {props.docNameToModify ? null : (
            <button
              className={
                direction === RTL_DIRECTION
                  ? arabicStyles.cancelButton
                  : styles.cancelButton
              }
              onClick={() => props.handleClose()}
              id="pmweb_docType_addDoc_Cancel"
            >
              {t("cancel")}
            </button>
          )}
          {props.docNameToModify ? null : (
            <button
              id="pmweb_docType_addDoc_addNclose_AddDocModal_Button"
              // Modified on 15-01-24 for Bug 142600
              disabled={
                docNameError ||
                isReadOnly ||
                spinner?.addAndClose ||
                spinner?.addAnother
              }
              // Till here for Bug 142600
              onClick={(e) =>
                props.addDocToList(
                  nameInput,
                  descInput,
                  "add",
                  isMandatory.value
                )
              }
              className={styles.secondaryBtn}
              tabIndex={0}
              style={{ cursor: docNameError ? "default" : "pointer" }}
            >
              {/* Added on 14-01-24 for Bug 142600 */}
              {spinner?.addAndClose && (
                <CircularProgress
                  color="#FFFFFF"
                  style={{
                    height: "1rem",
                    width: "1rem",
                  }}
                />
              )}
              {/* Till here for Bug 142600 */}
              {t("add&Close")}
            </button>
          )}
          {props.docNameToModify ? null : (
            <button
              id="pmweb_docType_addDoc_addAnotherDocTypes_Button"
              // Modified on 15-01-24 for Bug 142600
              disabled={
                docNameError ||
                isReadOnly ||
                spinner?.addAnother ||
                spinner?.addAndClose
              }
              // Till here for Bug 142600
              onClick={(e) =>
                props.addDocToList(
                  nameInput,
                  descInput,
                  "addAnother",
                  isMandatory.value
                )
              }
              className={styles.okButton}
              onKeyUp={(e) => handleAddAnother(e)}
              style={{ cursor: docNameError ? "default" : "pointer" }}
            >
              {/* Added on 14-01-24 for Bug 142600 */}
              {spinner?.addAnother && (
                <CircularProgress
                  color="#FFFFFF"
                  style={{
                    height: "1rem",
                    width: "1rem",
                  }}
                />
              )}
              {/* Till here for Bug 142600 */}
              {t("addAnother")}
            </button>
          )}
          {props.docNameToModify ? (
            <button
              /* onClick={(e) => {
              props.modifyDescription(
                nameInput,
                descInput,
                props.docIdToModify
              );
            }}*/
              onClick={() => props.handleClose()}
              className={styles.okButton}
              id="pmweb_docType_addDoc_OkBtn"
            >
              {"Okay"}
            </button>
          ) : null}
        </div>
      </div>
    </FocusTrap>
  );
}

export default AddDoc;
