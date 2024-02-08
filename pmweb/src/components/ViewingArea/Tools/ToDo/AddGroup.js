import React, { useState, useEffect } from "react";
import "../Interfaces.css";
import { useTranslation } from "react-i18next";
import styles from "../DocTypes/index.module.css";
import CloseIcon from "@material-ui/icons/Close";
import arabicStyles from "../DocTypes/arabicStyles.module.css";
import {
  RTL_DIRECTION,
  ARABIC_LOCALE,
  ARABIC_SA_LOCALE,
} from "../../../../Constants/appConstants";
import secureLocalStorage from "react-secure-storage";
import { isArabicLocaleSelected } from "../../../../utility/CommonFunctionCall/CommonFunctionCall";

function AddGroup(props) {
  let { t } = useTranslation();
  const direction = `${t("HTML_DIR")}`;
  const [nameInput, setNameInput] = useState("");
  const locale = secureLocalStorage.getItem("locale");

  const setNameFunc = (e) => {
    setNameInput(e.target.value);
  };
  const [errorMsg, setErrorMsg] = useState("");
  useEffect(() => {
    if (props.groupName == "") {
      setNameInput(props.groupName);
      props.setGroupName(null);
    }
  }, [props.groupName]);

  const containsSpecialChars = (str) => {
    if (isArabicLocaleSelected()) {
      const regex = new RegExp("[&*|:'\"<>?////]+");
      return !regex.test(str);
    } else {
      const regex = new RegExp(
        /^[A-Za-z][A-Za-z0-9_\-\.\!\@\$\{\}\(\)\^\%\`\=\;\,\[\]\~]*$/gm
      );

      return regex.test(str);
    }
  };

  const validateData = (e, val) => {
    let isValid = true;
    if (!containsSpecialChars(e.target.value)) {
      setErrorMsg(
        `${val} can only start with alphanumeric characters and /\:*?"<>|&'#+ are not allowed at any place.`
      );

      isValid = false;
    }
  };

  return (
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
          {t("addGroup")}
        </h3>
        <CloseIcon
          onClick={() => props.handleClose()}
          className={styles.closeIcon}
        />
      </div>
      <div className={styles.modalSubHeader} style={{ paddingBottom: "2rem" }}>
        <label className={styles.modalLabel}>
          {t("groupName")}
          <span className={styles.starIcon}>*</span>
        </label>
        <form>
          <input
            id="todo_groupNameId"
            value={nameInput}
            onChange={(e) => setNameFunc(e)}
            className={styles.modalInput}
            onPaste={(e) => {
              setTimeout(() => validateData(e, "Trigger_Name"), 200);
            }}
          />
        </form>
        <p>"Soihgdwhjegdhfjhewfb</p>
        {props.bGroupExists ? (
          <span
            style={{
              color: "red",
              fontSize: "10px",
              marginTop: "-0.25rem",
              marginBottom: "0.5rem",
              display: "block",
            }}
          >
            {t("GroupAlreadyExists")}
          </span>
        ) : null}
        {props.showGroupNameError ? (
          <span
            style={{
              color: "red",
              fontSize: "10px",
              marginTop: "-0.25rem",
              marginBottom: "0.5rem",
              display: "block",
            }}
          >
            {t("filltheName")}
          </span>
        ) : null}
      </div>
      <div
        className={
          direction === RTL_DIRECTION
            ? arabicStyles.modalFooter
            : styles.modalFooter
        }
      >
        <button
          className={
            direction === RTL_DIRECTION
              ? arabicStyles.cancelButton
              : styles.cancelButton
          }
          onClick={() => props.handleClose()}
        >
          {t("cancel")}
        </button>

        <button
          id="addAnotherDocTypes_Button"
          onClick={(e) => props.addGroupToList(nameInput, "addAnother")}
          className={styles.okButton}
        >
          {t("addAnother")}
        </button>

        <button
          id="addNclose_AddDocModal_Button"
          onClick={(e) => props.addGroupToList(nameInput, "add")}
          className={styles.okButton}
        >
          {t("add&Close")}
        </button>
      </div>
    </div>
  );
}

export default AddGroup;
