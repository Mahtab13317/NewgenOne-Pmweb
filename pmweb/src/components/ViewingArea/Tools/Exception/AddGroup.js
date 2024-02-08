import React, { useEffect, useState } from "react";
import "../Interfaces.css";
import { useTranslation } from "react-i18next";
import "./Exception.css";
import styles from "../DocTypes/index.module.css";
import CloseIcon from "@material-ui/icons/Close";
import arabicStyles from "../DocTypes/arabicStyles.module.css";
import {
  ARABIC_LOCALE,
  ARABIC_SA_LOCALE,
  RTL_DIRECTION,
  SPACE,
} from "../../../../Constants/appConstants";
import { FieldValidations } from "../../../../utility/FieldValidations/fieldValidations";
import { useDispatch } from "react-redux";
import { setToastDataFunc } from "../../../../redux-store/slices/ToastDataHandlerSlice";
//import FocusTrap from "focus-trap-react";
import { IconButton } from "@material-ui/core";
import { FocusTrap } from "@mui/base";
import secureLocalStorage from "react-secure-storage";
import { addSpacesBetweenCharacters } from "../../../../UI/ValidationMessageProvider";
import { isArabicLocaleSelected } from "../../../../utility/CommonFunctionCall/CommonFunctionCall";

function AddGroup(props) {
  const dispatch = useDispatch();
  let { t } = useTranslation();
  const direction = `${t("HTML_DIR")}`;
  const [nameInput, setNameInput] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const locale = secureLocalStorage.getItem("locale");

  const setNameFunc = (e) => {
    validateData(e, "jhsghcwhcv");
    /*Bug 110099 no character limit is available for naming the Group on Exception Screen
    [09-03-2023] Put the check for the length */
    if (e.target.value.length < 51) {
      setNameInput(e.target.value);
    } else {
      dispatch(
        setToastDataFunc({
          message: t("groupNameLimit"),
          severity: "error",
          open: true,
        })
      );
    }
  };

  const groupInputRef = React.createRef();

  useEffect(() => {
    if (props.groupName == "") {
      setNameInput(props.groupName);
      props.setGroupName(null);
    }
  }, [props.groupName]);

  useEffect(() => {
    let groupExists = false;
    props.groupsList &&
      props.groupsList.map((group) => {
        if (group.GroupName == nameInput) {
          groupExists = true;
        }
      });
    if (props.bGroupExists) {
      props.setbGroupExists(groupExists);
    }
  }, [props.groupName, props.groupsList, nameInput]);

  const containsSpecialChars = (str) => {
    if (isArabicLocaleSelected()) {
      const regex = new RegExp("[&*|:'\"<>?////]+");
      return !regex.test(str);
    } else {
      const regex = new RegExp(/^[A-Za-z][^\\\/\:\*\?\"\<\>\|\'\&]*$/gm);
      return regex.test(str);
    }
  };

  const validateData = (e, val) => {
    if (!containsSpecialChars(e.target.value)) {
      let msgToShow = "";
      if (isArabicLocaleSelected()) {
        msgToShow = `${t("groupName")}${SPACE}${t(
          "cannotContain"
        )}${SPACE}${addSpacesBetweenCharacters("&*|:'\"<>?/")}${SPACE}${t(
          "charactersInIt"
        )}`;
      } else {
        msgToShow = `${t("AllCharactersAreAllowedExcept")} \\ / : * ? " < > | ' &  ${t("AndFirstCharacterShouldBeAlphabet")}`;
      }
      setErrorMsg(msgToShow);
    } else {
      setErrorMsg("");
    }
    if (e.target.value == "") {
      setErrorMsg(false);
    }
  };

  useEffect(() => {
    const close = (e) => {
      if (e.keyCode === 27) {
        {
          props.handleClose();
        }
      }
    };
    window.addEventListener("keydown", close);
    return () => window.removeEventListener("keydown", close);
  }, []);

  return (
    <FocusTrap open>
      <div
        className="addDocs"
        style={{ direction: direction == RTL_DIRECTION ? "rtl" : "ltr" }}
      >
        {/*code edited on 1 Aug 2022 for BugId 112553 */}
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
          <IconButton
            id="pmweb_AddGroup_Close"
            className={styles.iconButton}
            onClick={() => props.handleClose()}
            tabIndex={0}
            aria-label="Close"
            aria-description="Closes the window"
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                props.handleClose();
                e.stopPropagation();
              }
            }}
            disableFocusRipple
            disableRipple
          >
            <CloseIcon className={styles.closeIcon} />
          </IconButton>
        </div>
        <div
          className={styles.modalSubHeader}
          style={{ paddingBottom: "2rem" }}
        >
          <label
            //className={styles.modalLabel}

            className="fieldlabel"
            htmlFor="pmweb_AddGroup_groupNameInput_exception"
          >
            {t("groupName")}
            <span className={styles.starIcon}>*</span>
          </label>
          <form>
            <input
              ref={groupInputRef}
              id="pmweb_AddGroup_groupNameInput_exception"
              value={nameInput}
              onChange={(e) => setNameFunc(e)}
              className={styles.modalInput}
              onPaste={(e) => {
                setTimeout(() => validateData(e, "Trigger_Name"), 200);
              }}
              onKeyPress={(e) => {
                if (e.charCode == "13") {
                  e.preventDefault();
                } else {
                  /*Bug 110099 no character limit is available for naming the Group on Exception Screen
                [09-03-2023] Corrected the parameter from 50 to 51 as it is excluded one */
                  FieldValidations(e, 150, groupInputRef.current, 51);
                }
              }}
            />
          </form>
          {errorMsg ? (
            <p
              style={{
                color: "red",
                fontSize: "var(--sub_text_font_size)",
                marginTop: "-0.75rem",
                marginBottom: "0.5rem",
                display: "block",
              }}
            >
              {errorMsg}
            </p>
          ) : (
            ""
          )}
          {props.bGroupExists ? (
            <span
              style={{
                color: "red",
                fontSize: "var(--sub_text_font_size)",
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
                fontSize: "var(--sub_text_font_size)",
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
            /*  className={
            direction === RTL_DIRECTION
              ? arabicStyles.cancelButton
              : styles.cancelButton
          }*/
            onClick={() => props.handleClose()}
            className="tertiary"
            id="pmweb_AddGroup_Cancel"
            type="button"
          >
            {t("cancel")}
          </button>

          <button
            id="pmweb_AddGroup_addAnotherDocTypes_Button"
            onClick={(e) =>
              props.addGroupToList(
                nameInput,
                "addAnother",
                props.newGroupToMove,
                errorMsg
              )
            }
            disabled={errorMsg || nameInput == "" ? true : false}
            className={styles.okButton}
            // className="primary"
            type="button"
          >
            {t("addAnother")}
          </button>

          <button
            id="pmweb_AddGroup_addNclose_AddDocModal_Button"
            disabled={errorMsg || nameInput == "" ? true : false}
            onClick={() =>
              props.addGroupToList(
                nameInput,
                "add",
                props.newGroupToMove,
                errorMsg
              )
            }
            className={styles.okButton}
            // className="primary"
            type="button"
          >
            {t("add&Close")}
          </button>
        </div>
      </div>
    </FocusTrap>
  );
}

export default AddGroup;
