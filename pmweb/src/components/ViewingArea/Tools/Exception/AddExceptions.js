// #BugID - 110097
// #BugDescription - validation for exception name length has been added.
// #BugID - 109977
// #BugDescription - validation for exception duplicate name has been added.
// #BugID - 110089
// #BugDescription - 	Data not clearing to add new Exception after clicking on Add another button has been fixed
// Changes made to solve Bug 115524 - Exception: blank screen with not found message appears while pressing enter button in the exception field
// Changes made to solve Bug 126087 - document type>>message is inappropriate while named with special charcaters.
import React, { useState, useEffect, useRef } from "react";
import "../Interfaces.css";
import { useTranslation } from "react-i18next";
import dropdown from "../../../../assets/subHeader/dropdown.svg";
import AddToListDropdown from "../../../../UI/AddToListDropdown/AddToListDropdown";
import axios from "axios";
import {
  RTL_DIRECTION,
  ENDPOINT_ADD_GROUP,
  SERVER_URL,
  ENGLISH_US_LOCALE,
  SPACE,
  ARABIC_LOCALE,
  ARABIC_SA_LOCALE,
} from "../../../../Constants/appConstants";
import { connect } from "react-redux";
import "./Exception.css";
import styles from "../DocTypes/index.module.css";
import CloseIcon from "@material-ui/icons/Close";
import arabicStyles from "../DocTypes/arabicStyles.module.css";
import { FieldValidations } from "../../../../utility/FieldValidations/fieldValidations";
import { decode_utf8 } from "../../../../utility/UTF8EncodeDecoder";
import secureLocalStorage from "react-secure-storage";
import { IconButton } from "@material-ui/core";
//import FocusTrap from "focus-trap-react";
import { FocusTrap } from "@mui/base";
import { isArabicLocaleSelected } from "../../../../utility/CommonFunctionCall/CommonFunctionCall";

function AddException(props) {
  let { t } = useTranslation();
  const direction = `${t("HTML_DIR")}`;
  const [nameInput, setNameInput] = useState("");
  const [descriptionInput, setDescriptionInput] = useState("");
  const [expModalHead, setExpModalHead] = useState("");
  const [selectedGroup, setselectedGroup] = useState([]);
  const [showGroupDropdown, setShowGroupDropdown] = useState(false);
  const [grpList, setgrpList] = useState([]);
  const [expNameError, setdExpNameError] = useState(false);
  const expNameRef = useRef();
  const locale = secureLocalStorage.getItem("locale");
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    let tempGrpList = props.groups?.map((val) => {
      return { ...val, id: val.GroupId };
    });
    setgrpList(tempGrpList);
  }, [props.groups]);

  const setNameFunc = (e) => {
    let returnValue = true;
    //Modified on 21/09/2023, bug_id:136630

    /*  if (locale === ENGLISH_US_LOCALE) {
      for (let i = 0; i < e.target.value.length; i++) {
        const KeyID = e.target.value.charCodeAt(i);

        if (
          (KeyID === 95 ||
            (KeyID > 64 && KeyID < 91) ||
            (KeyID > 96 && KeyID < 123) ||
            (KeyID >= 48 && KeyID < 58)) &&
          e.target.value.length + 1 < 50
        ) {
          //BUG ID 65788 :: 23/11/2016 ends
          returnValue = true;
        } else {
          returnValue = false;
        }
      

        if (returnValue === false) {
          setdExpNameError(true);
          return false;
        } else {
          setdExpNameError(false);
        }
      }
    } */
    /*till here for bug id 136630*/
    setNameInput(e.target.value);
    if (e.target.value !== "") {
      setNameInput(e.target.value);
      if (props.setShowNameError) {
        props.setShowNameError(false);
      }
      // Changes made to solve bug ID 109977
      props.expData?.ExceptionGroups?.map((group) => {
        group.ExceptionList.map((exception) => {
          if (exception.ExceptionName.toLowerCase() === e.target.value.trim()) {
            props.setbExpExists(true);
          } else {
            props.setbExpExists(false);
          }
        });
      });
    }
  };

  const setDescriptionFunc = (e) => {
    setDescriptionInput(e.target.value);
    if (e.target.value !== "" && props.setShowDescError) {
      props.setShowDescError(false);
    }
  };

  useEffect(() => {
    if (props.expName == "") {
      setNameInput("");
      setDescriptionInput("");
    }
  }, [props.expName]);

  useEffect(() => {
    if (props.expNameToModify) {
      document.getElementById("pmweb_exception_ExceptionDescInput")?.focus();
      document.getElementById(
        "pmweb_exception_ExceptionNameInput"
      ).disabled = true;
      setExpModalHead(`${t("ExceptionDetails")}`);
    } else {
      setExpModalHead(t("addException"));
    }
  }, []);

  useEffect(() => {
    if (props.expDescToModify) {
      setDescriptionInput(decode_utf8(props.expDescToModify));
    }
    if (props.expNameToModify) {
      setNameInput(props.expNameToModify);
    }
  }, [props.expDescToModify, props.expNameToModify]);

  useEffect(() => {
    if (props.addAnotherExp) {
      setNameInput("");
      setDescriptionInput("");
      setselectedGroup([]);
      props.setAddAnotherExp(false);
    }
  }, [props.addAnotherExp]);

  const onSelectGroup = (grp) => {
    setselectedGroup([grp.id]);
  };

  const handleCloseFunc = () => {
    props.handleClose();
    if (props.setShowNameError) {
      props.setShowNameError(false);
    }
    if (props.setShowDescError) {
      props.setShowDescError(false);
    }
    if (props.setbExpExists) {
      props.setbExpExists(false);
    }
  };

  // code edited on 7 Sep 2022 for BugId 114224
  const addnewGroup = (GroupToAdd) => {
    let exist = false;
    grpList?.map((group) => {
      if (group.GroupName.toLowerCase() === GroupToAdd.toLowerCase()) {
        exist = true;
      }
    });
    if (exist) {
      return;
    }
    if (GroupToAdd?.trim() !== "") {
      let maxGroupId = grpList.reduce(
        (acc, group) => (+acc > +group.GroupId ? acc : group.GroupId),
        0
      );
      axios
        .post(SERVER_URL + ENDPOINT_ADD_GROUP, {
          m_strGroupName: GroupToAdd,
          m_strGroupId: +maxGroupId + 1,
          interfaceType: "E",
          processDefId: props.openProcessID,
        })
        .then((res) => {
          if (res.data.Status == 0) {
            let tempData = [...grpList];
            tempData.push({
              GroupName: GroupToAdd,
              AllGroupRights: {
                Respond: true,
                View: true,
                Raise: false,
                Clear: false,
              },
              GroupId: +maxGroupId + 1,
              ExceptionList: [],
              id: +maxGroupId + 1,
            });
            setgrpList(tempData);
            setselectedGroup([+maxGroupId + 1]);
            setShowGroupDropdown(false);
          }
        });
    } else if (GroupToAdd?.trim() === "") {
      alert("Please enter Group Name");
      document.getElementById("groupNameInput_exception")?.focus();
    }
  };

  useEffect(() => {
    const close = (e) => {
      if (e.keyCode === 27) {
        {
          handleCloseFunc();
        }
      }
    };
    window.addEventListener("keydown", close);
    return () => window.removeEventListener("keydown", close);
  }, []);

  useEffect(() => {
    if (errorMsg != "") {
      setdExpNameError(false);
    }
  }, [errorMsg]);

  const containsSpecialChars = (str) => {
    if (isArabicLocaleSelected()) {
      var regex = new RegExp("[&*|\\\\:'\"<>?؟//]+");
      return !regex.test(str);
    } else {
      var regex = new RegExp("^[A-Za-z][^\\\\/:*?\"<>|'&]*$");
      return regex.test(str);
    }
  };

  const validateData = (e, val) => {
    if (!containsSpecialChars(e.target.value)) {
      if (isArabicLocaleSelected()) {
        setErrorMsg(
          `${val}${SPACE}${t("cannotContain")}${SPACE}&*|\:'"<>?/${SPACE}${t(
            "charactersInIt"
          )}`
        );
      } else {
        setErrorMsg(
          `${t("AllCharactersAreAllowedExcept")}${SPACE}&*|\:'"<>?/${SPACE}${t(
            "AndFirstCharacterShouldBeAlphabet"
          )}
        `
        );
      }
    } else if (e.target.value?.length > 50) {
      setErrorMsg(`${t("max50CharAllowed")}`);
    } else {
      setErrorMsg("");
    }
    if (e.target.value == "") {
      setErrorMsg("");
      setdExpNameError(false);
    }
  };

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
            {expModalHead}
          </h3>
          <IconButton
            onClick={() => handleCloseFunc()}
            id="pmweb_exception_addExceptionModal_Close"
            className={styles.iconButton}
            tabIndex={0}
            aria-label="Close"
            aria-description="Closes the window"
            onKeyUp={(e) => {
              if (e.key === "Enter") {
                handleCloseFunc();
                e.stopPropagation();
              }
            }}
            disableFocusRipple
            disableRipple
          >
            <CloseIcon className={styles.closeIcon} />
          </IconButton>
        </div>
        <div className={styles.modalSubHeader}>
          {props.calledFromWorkdesk ? (
            <div
              className="flex"
              style={{
                // width: "75%",
                justifyContent: "space-between",
                marginBottom: "1rem",
                alignItems: "center",
              }}
            >
              <label className={styles.modalLabel}>
                {t("groupName")}
                <span className={styles.starIcon}>*</span>
              </label>
              <div className="relative" style={{ flex: "2" }}>
                <button
                  className={styles.groupDropdown}
                  onClick={() => setShowGroupDropdown(true)}
                  style={{ width: "98%" }}
                  id="pmweb_exception_addExceptionModal_groupDropdown"
                >
                  <span style={{ fontSize: "var(--base_text_font_size)" }}>
                    {grpList?.map((item) => {
                      if (selectedGroup.includes(item.id)) {
                        return item.GroupName;
                      }
                    })}
                  </span>
                  <span
                    style={{
                      position: "absolute",
                      right: direction === RTL_DIRECTION ? "unset" : "0.5vw",
                      left: direction === RTL_DIRECTION ? "0.5vw" : "unset",
                      top: "-8%",
                    }}
                  >
                    <img
                      src={dropdown}
                      alt="dropdown"
                      style={{ width: "0.5rem", height: "0.5rem" }}
                    />
                  </span>
                </button>
                {showGroupDropdown ? (
                  <AddToListDropdown
                    processData={props.processData}
                    completeList={grpList}
                    checkedCheckBoxStyle="exceptionGroupChecked"
                    associatedList={selectedGroup}
                    checkIcon="exceptionGroup_checkIcon"
                    onChange={onSelectGroup}
                    addNewLabel={t("newGroup")}
                    noDataLabel={t("noGroupAdded")}
                    onKeydown={addnewGroup} // funtion for api call
                    labelKey="GroupName"
                    handleClickAway={() => setShowGroupDropdown(false)}
                    calledFromWorkdeskExp={true}
                    style={{ top: "100%", left: "0", width: "100%" }}
                    entityName={t("groupName")}
                  />
                ) : null}
              </div>
            </div>
          ) : null}
          <label
            className={styles.modalLabel}
            htmlFor="pmweb_exception_ExceptionNameInput"
          >
            {t("exceptionName")}
            <span className={styles.starIcon}>*</span>
          </label>
          <form>
            {/*code added on 8 August 2022 for BugId 112903*/}
            <input
              id="pmweb_exception_ExceptionNameInput"
              value={nameInput}
              onChange={(event) => {
                validateData(event, t("exceptionName"));
                setNameFunc(event);
              }}
              className={styles.modalInput}
              ref={expNameRef}
              onKeyPress={(e) => {
                if (e.charCode == "13") {
                  e.preventDefault();
                } else {
                  FieldValidations(e, 150, expNameRef.current, 50);
                }
              }}
            />
            {errorMsg ? (
              <p
                style={{
                  color: "red",
                  fontSize: "var(--sub_text_font_size)",
                  marginBottom: "0.5rem",
                  display: "block",
                  marginInlineStart: direction === RTL_DIRECTION ? "5%" : null,
                }}
              >
                {errorMsg}
              </p>
            ) : (
              ""
            )}
          </form>
          {props.showNameError ? (
            <span
              style={{
                color: "red",
                fontSize: "var(--sub_text_font_size)",
                marginTop: "-1rem",
                marginBottom: "0.5rem",
                display: "block",
              }}
            >
              {t("filltheName")}
            </span>
          ) : null}
          {expNameError ? (
            <span
              style={{
                color: "red",
                fontSize: "var(--sub_text_font_size)",
                marginTop: "-1rem",
                marginBottom: "0.5rem",
                display: "block",
              }}
            >
              {t("exceptionError")}
            </span>
          ) : null}
          {props.bExpExists ? (
            <span
              style={{
                color: "red",
                fontSize: "var(--sub_text_font_size)",
                marginTop: "-1rem",
                marginBottom: "0.5rem",
                display: "block",
              }}
            >
              {t("excepAlreadyExists")}
            </span>
          ) : null}
          <label
            className={styles.modalLabel}
            htmlFor="pmweb_exception_ExceptionDescInput"
          >
            {t("description")}
            <span className={styles.starIcon}>*</span>
          </label>
          <textarea
            id="pmweb_exception_ExceptionDescInput"
            value={descriptionInput}
            onChange={(e) => setDescriptionFunc(e)}
            className={styles.modalTextArea}
          />
          {props.showDescError ? (
            <span
              style={{
                color: "red",
                fontSize: "10px",
                marginTop: "-0.25rem",
                marginBottom: "0.5rem",
                display: "block",
              }}
            >
              {t("filltheDesc")}
            </span>
          ) : null}
        </div>
        <div
          className={
            direction === RTL_DIRECTION
              ? arabicStyles.modalFooter
              : styles.modalFooter
          }
          style={{ padding: "0.5rem 0" }}
        >
          <button
            className={
              direction === RTL_DIRECTION
                ? arabicStyles.cancelButton
                : styles.cancelButton
            }
            onClick={() => handleCloseFunc()}
            id="pmweb_exception_addException_Cancel"
          >
            {t("cancel")}
          </button>
          {props.expNameToModify ? null : (
            <button
              id="pmweb_exception_addNclose_AddDocModal_Button"
              onClick={(e) => {
                props.addExceptionToList(
                  nameInput,
                  "add",
                  props.groupId ? props.groupId : selectedGroup[0],
                  descriptionInput
                );
              }}
              className={styles.secondaryBtn}
              disabled={errorMsg} //Modified on 21/09/2023, bug_id:136630
            >
              {t("add&Close")}
            </button>
          )}
          {props.expNameToModify ? null : (
            <button
              id="pmweb_exception_addAnotherDocTypes_Button"
              onClick={(e) => {
                props.addExceptionToList(
                  nameInput,
                  "addAnother",
                  props.groupId ? props.groupId : selectedGroup[0],
                  descriptionInput
                );
              }}
              className={styles.okButton}
              disabled={errorMsg} //Modified on 21/09/2023, bug_id:136630
            >
              {t("addAnother")}
            </button>
          )}

          {props.expNameToModify ? (
            <button
              onClick={(e) => {
                props.modifyDescription(
                  nameInput,
                  props.groupId ? props.groupId : selectedGroup[0],
                  descriptionInput,
                  props.expIdToModify
                );
              }}
              id="pmweb_exception_modify_AddDocModal_Button"
              className={styles.okButton}
              disabled={errorMsg}
            >
              {t("modify")}
            </button>
          ) : null}
        </div>
      </div>
    </FocusTrap>
  );
}

const mapStateToProps = (state) => {
  return {
    openProcessID: state.openProcessClick.selectedId,
    openProcessName: state.openProcessClick.selectedProcessName,
    openProcessType: state.openProcessClick.selectedType,
  };
};

export default connect(mapStateToProps, null)(AddException);
