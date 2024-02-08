// #BugID - 109986
// #BugDescription - validation for ToDO duplicate name length has been added.
// Changes made to solve Bug 115775 - Todo: blank screen with not found message appears while pressing enter button in the Todo field
// Changes made to solve Bug 126087 - document type>>message is inappropriate while named with special charcaters.
import React, { useEffect, useRef, useState } from "react";
import "../Interfaces.css";
import { useTranslation } from "react-i18next";
import Checkbox from "@material-ui/core/Checkbox";
import FormControlLabel from "@material-ui/core/FormControlLabel";
import { MenuItem, CircularProgress } from "@material-ui/core";
import RadioGroups from "./RadioButtonsGroup";
import dropdown from "../../../../assets/subHeader/dropdown.svg";
import AddToListDropdown from "../../../../UI/AddToListDropdown/AddToListDropdown";
import { RTL_DIRECTION, SPACE } from "../../../../Constants/appConstants";
import styles from "../DocTypes/index.module.css";
import CloseIcon from "@material-ui/icons/Close";
import arabicStyles from "../DocTypes/arabicStyles.module.css";
import "../Exception/Exception.css";
import { FieldValidations } from "../../../../utility/FieldValidations/fieldValidations";
import { decode_utf8 } from "../../../../utility/UTF8EncodeDecoder";
import { FocusTrap } from "@mui/base";
import { addSpacesBetweenCharacters } from "../../../../UI/ValidationMessageProvider";
import CustomizedDropdown from "../../../../UI/Components_With_ErrrorHandling/Dropdown";
import {
  insertNewlineAtCursor,
  isArabicLocaleSelected,
  isEnglishLocaleSelected,
} from "../../../../utility/CommonFunctionCall/CommonFunctionCall";

function AddToDo(props) {
  let { t } = useTranslation();
  const associateFields = ["CalendarName", "Status"]; // code added on 05 Dec 2022 for BugId 120012
  const direction = `${t("HTML_DIR")}`;
  const [errorMsg, setErrorMsg] = useState("");
  const [nameInput, setNameInput] = useState("");
  const [descriptionInput, setDescriptionInput] = useState("");
  const [mandatoryValue, setMandatoryValue] = useState(false);
  const [todoTypeValue, setTodoTypeValue] = useState("M"); // code edited on 29 June 2023 for BugId 130728
  const [associateField, setAssociateField] = useState("defaultValue");
  const [selectedGroup, setselectedGroup] = useState([]);
  const [showGroupDropdown, setShowGroupDropdown] = useState(false);
  const [grpList, setgrpList] = useState([]);
  // const [todoNameError, setTodoExpNameError] = useState(false);
  const toDoRef = useRef();
  const mandatoryRef = useRef();
  const textareaRef = useRef(null);
  const [isFocused, setIsFocused] = useState(false);

  useEffect(() => {
    let tempGrpList =
      props.groups &&
      props.groups.map((val) => {
        return { ...val, id: val.GroupId };
      });
    setgrpList(tempGrpList);
  }, [props]);

  // Added on 05-10-23 for Bug 138722
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
      if (
        event.key === "Enter" &&
        !event.shiftKey &&
        !event.altKey &&
        isFocused
      ) {
        // If Enter is pressed without Shift or Alt and the textarea is focused, do nothing
        event.preventDefault();
      } else if (
        ((event.key === "Enter" && event.shiftKey) ||
          (event.key === "Enter" && event.altKey)) &&
        isFocused
      ) {
        // If Shift+Enter or Alt+Enter is pressed, add a new line to the textarea
        event.preventDefault();
        const val = insertNewlineAtCursor(textareaRef);
        setDescriptionInput(val);
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
  // Till here for Bug 138722

  const setNameFunc = (e) => {
    validateData(e, "jhsghcwhcv");
    let returnValue = true;
    if (isEnglishLocaleSelected()) {
      for (let i = 0; i < e.target.value.length; i++) {
        const KeyID = e.target.value.charCodeAt(i);

        if (
          (KeyID == 95 ||
            (KeyID > 64 && KeyID < 91) ||
            (KeyID > 96 && KeyID < 123) ||
            (KeyID >= 48 && KeyID < 58)) &&
          e.target.value.length + 1 < 257 //Added on 18th Mat 2023 to solve Bug 128178
        ) {
          //BUG ID 65788 :: 23/11/2016 ends
          returnValue = true;
        } else {
          returnValue = false;
        }
        /* if (
        e.target.value.length + 1 == 0 &&
        (KeyID == 35 || (KeyID >= 48 && KeyID < 58))
      )
      {
        returnValue = false;
      }
      else{
        returnValue = true;
      } */
        //lenght = 1

        // if (returnValue === false) {
        //   setTodoExpNameError(true);
        //   return false;
        // } else {
        //   setTodoExpNameError(false);
        // }
      }
    }
    props.setDisableAddBtn(null);
    setNameInput(e.target.value);
    if (e.target.value !== "") {
      if (props.setShowNameError) {
        props.setShowNameError(false);
      }
      // Changes made to solve bug ID 105828
      props?.toDoData?.TodoGroupLists?.map((group, groupIndex) => {
        group.ToDoList.map((todo) => {
          if (todo.ToDoName.toLowerCase() == e.target.value) {
            props.setbToDoExists(true);
          } else {
            props.setbToDoExists(false);
          }
        });
      });
    }
  };

  const onSelect = (e) => {
    props.setDisableAddBtn(null);
    props.selectedAssociateField(e.target.value);
    setAssociateField(e.target.value);
  };

  const setDescriptionFunc = (e) => {
    props.setDisableAddBtn(null);
    setDescriptionInput(e.target.value);
    if (e.target.value !== "" && props.setShowDescError) {
      props.setShowDescError(false);
    }
  };

  const handleTriggerSelection = (triggerName) => {
    props.selectedTriggerName(triggerName);
    if (triggerName !== "none" || triggerName) {
      props.setShowTriggerError(false);
    }
  };
  const handleToDoTypeSelection = (toDoType) => {
    props.selectedToDoType(toDoType);
  };

  const handleMandatoryValue = (e) => {
    // added on 08/01/24 for BugId 141670
    props.setDisableAddBtn(null);
    // till here BugId 141670
    props.handleMandatoryCheck(!mandatoryValue);
    setMandatoryValue(!mandatoryValue);
  };

  useEffect(() => {
    if (props.toDoNameToModify) {
      setNameInput(props.toDoNameToModify);
    }
    if (props.toDoDescToModify) {
      setDescriptionInput(decode_utf8(props.toDoDescToModify));
    }

    if (props.toDoMandatoryToModify) {
      setMandatoryValue(props.toDoMandatoryToModify);
    }

    if (props.toDoAssoFieldToModify) {
      setAssociateField(props.toDoAssoFieldToModify);
    }
  }, [
    props.toDoNameToModify,
    props.toDoDescToModify,
    props.toDoMandatoryToModify,
    props.toDoAssoFieldToModify,
  ]);

  // code added on 7 September 2022 for BugId 112250
  useEffect(() => {
    if (props.addAnotherTodo) {
      setNameInput("");
      setDescriptionInput("");
      setMandatoryValue(false);
      setAssociateField("defaultValue");
      setselectedGroup([]);
      setTodoTypeValue("M"); // code edited on 29 June 2023 for BugId 130728
    }
  }, [props.addAnotherTodo]);

  const onSelectGroup = (grp) => {
    setselectedGroup([grp.id]);
  };

  useEffect(() => {
    if (props.todoName == "") {
      setNameInput("");
      setDescriptionInput("");
      setMandatoryValue(false);
      setAssociateField("defaultValue");
      props.setTodoName(null);
    }
  }, [props.todoName]);

  const containsSpecialChars = (str) => {
    if (isArabicLocaleSelected()) {
      const regex = new RegExp("[&*|:'\"<>?////]+");
      return regex.test(str);
    } else {
      const regex = new RegExp(/^[A-Za-z][^\\\/\:\*\?\"\<\>\|\'\&]*$/gm);

      return !regex.test(str);
    }
  };

  // Changes made to solve Bug 130727
  const validateData = (e, val) => {
    if (containsSpecialChars(e.target.value)) {
      let msgToShow = "";
      if (isArabicLocaleSelected()) {
        msgToShow = `${t("todoName")}${SPACE}${t(
          "cannotContain"
        )}${SPACE}${addSpacesBetweenCharacters("&*|:'\"<>?/")}${SPACE}${t(
          "charactersInIt"
        )}`;
      } else {
        msgToShow = `${t(
          "AllCharactersAreAllowedExcept"
        )} \\ / : * ? " < > | ' &  ${t("AndFirstCharacterShouldBeAlphabet")}`;
      }
      setErrorMsg(msgToShow);
    } else {
      setErrorMsg("");
    }
    if (e.target.value == "") {
      setErrorMsg(false);
    }
  };

  const handleKeyAddClose = (e) => {
    //Modified on 12-10-23 for Bug 139371
    // Added on 05-10-23 for Bug 138722
    if ((e.key === "Enter" && e.shiftKey) || (e.key === "Enter" && e.altKey)) {
      e.preventDefault();
    }
    // Till here for Bug 138722
    else if (e.key === "Enter") {
      if (props.toDoNameToModify !== "") {
        props.setDisableAddBtn("modify");
        props.modifyToDoFromList(
          nameInput,
          props.groupId ? props.groupId : selectedGroup[0],
          descriptionInput,
          props.toDoIdToModify,
          mandatoryValue,
          associateField,
          todoTypeValue
        );
      } else {
        props.setDisableAddBtn("add");
        props.addToDoToList(
          nameInput,
          "addAnother",
          props.groupId ? props.groupId : selectedGroup[0], // code edited on 2 August 2022 for BugId 113565
          descriptionInput
        );
      }

      e.stopPropagation();
    }
    // Till here for Bug 139371

    if (e.keyCode === 27) {
      props.handleClose();
    }
  };

  React.useEffect(() => {
    document.addEventListener("keydown", handleKeyAddClose);
    return () => document.removeEventListener("keydown", handleKeyAddClose);
  }, [handleKeyAddClose]);

  return (
    <FocusTrap open>
      <div
        className="addToDo"
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
            {props.toDoNameToModify ? t("modifyToDo") : t("addToDo")}
          </h3>
          <CloseIcon
            onClick={() => {
              props.handleClose();
              props.setDisableAddBtn(true);
            }}
            tabIndex={0}
            onKeyUp={(e) => {
              if (e.key === "Enter") {
                props.handleClose();
                e.stopPropagation();
              }
            }}
            id="pmweb_toDo_AddtoDo_Close"
            className={styles.closeIcon}
            aria-label="Close"
            aria-description="Closes the Window"
          />
        </div>
        <div className={`${styles.modalSubHeader} flex`} style={{ gap: "2vw" }}>
          <div style={{ flex: "1.2" }}>
            <label
              className={styles.modalLabel}
              htmlFor="pmweb_toDo_AddtoDo_ToDoNameInput"
            >
              {t("todoName")}
              <span className={styles.starIcon}>*</span>
            </label>
            <form>
              {/*code added on 8 August 2022 for BugId 112903*/}
              <input
                id="pmweb_toDo_AddtoDo_ToDoNameInput"
                value={nameInput}
                onChange={(e) => setNameFunc(e)}
                className={styles.modalInput}
                ref={toDoRef}
                maxLength={255} //Code added to solve Bug 128178 dated 29thMay2023
                onPaste={(e) => {
                  setTimeout(() => validateData(e, "Todo_Name"), 255);
                }}
                onKeyPress={(e) => {
                  if (e.charCode == "13") {
                    e.preventDefault();
                  } else {
                    FieldValidations(e, 150, toDoRef.current, 255);
                  }
                }}
              />
            </form>
            {errorMsg ? (
              <p
                style={{
                  color: "rgb(181,42,42)",
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
            {props.showNameError ? (
              <span
                style={{
                  color: "rgb(181,42,42)",
                  fontSize: "10px",
                  marginTop: "-1rem",
                  marginBottom: "0.5rem",
                  display: "block",
                }}
              >
                {t("filltheName")}
              </span>
            ) : null}
            {/* {todoNameError ? (
            <span
              style={{
                color: "red",
                fontSize: "10px",
                marginTop: "-1rem",
                marginBottom: "0.5rem",
                display: "block",
              }}
            >
              {t("todoNameError")}
            </span>
          ) : null} */}
            {props.bToDoExists ? (
              <span
                style={{
                  color: "rgb(181,42,42)",
                  fontSize: "10px",
                  marginTop: "-1rem",
                  marginBottom: "0.5rem",
                  display: "block",
                }}
              >
                {t("todoAlreadyExists")}
              </span>
            ) : null}

            <label
              className={styles.modalLabel}
              htmlFor="pmweb_toDo_AddtoDo_ToDoDescInput"
            >
              {t("description")}
              <span className={styles.starIcon}>*</span>
            </label>
            <form>
              <textarea
                id="pmweb_toDo_AddtoDo_ToDoDescInput"
                value={descriptionInput}
                ref={textareaRef}
                onChange={(e) => setDescriptionFunc(e)}
                className={styles.modalTextArea}
              />
            </form>
            {props.showDescError ? (
              <span
                style={{
                  color: "rgb(181,42,42)",
                  fontSize: "10px",
                  marginTop: "-0.25rem",
                  marginBottom: "0.5rem",
                  display: "block",
                }}
              >
                {t("filltheDesc")}
              </span>
            ) : null}
            {props.calledFromWorkdesk ? (
              <div style={{ width: "100%", marginBottom: "0.5rem" }}>
                <label className={styles.modalLabel}>
                  {t("groupName")}
                  <span className={styles.starIcon}>*</span>
                </label>
                <div className="relative">
                  <button
                    className={styles.groupDropdown}
                    onClick={() => setShowGroupDropdown(true)}
                    id="pmweb_toDo_AddtoDo_GroupDropdown"
                  >
                    <span
                      style={{
                        fontSize: "12px",
                        position: "absolute",
                        top: "3%",
                        // right: direction == RTL_DIRECTION ? "2%" : "80%", code modified on 13-10-23 for bug 139496
                        right: direction == RTL_DIRECTION ? "2%" : "",
                      }}
                    >
                      {grpList?.map((item, index) => {
                        if (selectedGroup.includes(item.id)) {
                          return item.GroupName;
                        }
                      })}
                    </span>
                    <span
                      style={{
                        position: "absolute",
                        right: direction == RTL_DIRECTION ? "97%" : "2%",
                        top: "-8%",
                      }}
                    >
                      <img
                        src={dropdown}
                        style={{ width: "0.5rem", height: "0.5rem" }}
                        alt="dropdown"
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
                      labelKey="GroupName"
                      handleClickAway={() => setShowGroupDropdown(false)}
                      style={{ top: "100%", left: "0", width: "100%" }}
                      onKeydown={(val) => {
                        let maxId = 0;
                        grpList?.map((el) => {
                          if (+el.id > +maxId) {
                            maxId = el.id;
                          }
                        });
                        setselectedGroup([+maxId + 1]);
                        props.addGroupToList(val);
                      }} // funtion for api call
                      calledFromWorkdesk={true}
                      entityName={t("groupName")}
                    />
                  ) : null}
                </div>
              </div>
            ) : null}
            <div style={{ marginBottom: "0.5rem" }}>
              <FormControlLabel
                control={
                  <Checkbox
                    size="small"
                    checked={mandatoryValue}
                    style={{ marginInlineStart: "0" }}
                    onChange={(e) => handleMandatoryValue(e)}
                  />
                }
                className={styles.properties_radioButton}
                label={t("mandatory")}
                id="pmweb_toDo_AddtoDo_mandatory"
                ref={mandatoryRef}
                onKeyUp={(e) => {
                  if (e.key === "Enter") {
                    mandatoryRef.current.click();
                    e.stopPropagation();
                  }
                }}
              />
            </div>
            <label
              className={styles.modalLabel}
              htmlFor="pmweb_toDo_AddtoDo_associatedFieldSelect"
            >
              {t("associatedFeild")}
            </label>
            <CustomizedDropdown
              isNotMandatory
              hideDefaultSelect
              direction={direction === RTL_DIRECTION ? "rtl" : "ltr"}
              onChange={onSelect}
              inputProps={{
                id: "pmweb_toDo_AddtoDo_associatedFieldSelect",
              }}
              style={{
                border: "1px solid #c4c4c4",
                borderRadius: "2px",
                backgroundColor: "#fff",
                textAlign: direction === RTL_DIRECTION ? "right" : "left",
                font: "normal normal normal 12px/17px Open Sans !important",
                fontSize: "var(--base_text_font_size)",
                letterSpacing: " 0px",
                color: "#606060",
                margin: "0 0 0.5rem",
                width: "97%",
                padding: "0.125rem 0",
              }}
              MenuProps={{
                anchorOrigin: {
                  vertical: "bottom",
                  horizontal: "left",
                },
                transformOrigin: {
                  vertical: "top",
                  horizontal: "left",
                },
                getContentAnchorEl: null,
              }}
              value={associateField}
            >
              <MenuItem
                value="defaultValue"
                className={
                  direction == RTL_DIRECTION
                    ? styles.modalDropdownDataArabic
                    : styles.modalDropdownData
                }
              >
                {t("processView.noneWord")}
              </MenuItem>
              {associateFields.map((x) => {
                return (
                  <MenuItem
                    key={x}
                    value={x}
                    className={
                      direction == RTL_DIRECTION
                        ? styles.modalDropdownDataArabic
                        : styles.modalDropdownData
                    }
                  >
                    {x}
                  </MenuItem>
                );
              })}
            </CustomizedDropdown>
          </div>
          <div className="selectedToDoTypeDiv" style={{ flex: "1" }}>
            <label
              style={{
                marginInlineEnd: "1vw",
                marginInlineStart: "0.5vw",
              }}
              className={styles.modalLabel}
            >
              {t("type")}
            </label>
            <div className="radioGroupsDiv">
              <RadioGroups
                toDoToModifyTrigger={props.toDoToModifyTrigger}
                toDoTypeToModify={props.toDoTypeToModify}
                toDoPicklistToModify={props.toDoPicklistToModify}
                addPickList={props.addPickList}
                selectTrigger={props.selectTrigger}
                toDoType={handleToDoTypeSelection}
                selectedTrigger={handleTriggerSelection}
                triggerList={props.triggerList}
                todoName={props.todoName}
                setTodoName={props.setTodoName}
                setTodoTypeValue={setTodoTypeValue}
                pickList={props.pickList}
                setPickList={props.setPickList}
                addAnotherTodo={props.addAnotherTodo}
                setAddAnotherTodo={props.setAddAnotherTodo}
                setDisableAddBtn={props.setDisableAddBtn} //Changes made to solve Bug 141670
              />
            </div>
            {props.showTriggerError ? (
              <span
                style={{
                  color: "red",
                  fontSize: "10px",
                  marginTop: "-0.25rem",
                  marginBottom: "0.5rem",
                  display: "block",
                }}
              >
                {t("pleaseSelectTrigger")}
              </span>
            ) : null}
          </div>
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
            onClick={() => {
              props.handleClose();
              props.setDisableAddBtn(true);
            }}
            id="pmweb_toDo_close_AddTodoModal_Button"
          >
            {t("cancel")}
          </button>

          {props.toDoNameToModify ? null : (
            <button
              id="pmweb_toDo_addNclose_AddTodoModal_Button"
              disabled={errorMsg || props.disableAddBtn !== null}
              onClick={(e) => {
                props.setDisableAddBtn("add");
                props.addToDoToList(
                  nameInput,
                  "add",
                  props.groupId ? props.groupId : selectedGroup[0], // code edited on 2 August 2022 for BugId 113565
                  descriptionInput
                );
              }}
              onKeyUp={(e) => handleKeyAddClose(e)}
              className={styles.secondaryBtn}
            >
              {props.disableAddBtn === "add" && (
                <CircularProgress
                  color="#2274BC"
                  style={{
                    height: "1rem",
                    width: "1rem",
                  }}
                />
              )}
              {t("add&Close")}
            </button>
          )}

          {props.toDoNameToModify ? null : (
            <button
              id="pmweb_toDo_addAnotherTodo_Button"
              disabled={errorMsg || props.disableAddBtn !== null}
              onClick={(e) => {
                props.setDisableAddBtn("addAnother");
                props.addToDoToList(
                  nameInput,
                  "addAnother",
                  props.groupId ? props.groupId : selectedGroup[0], // code edited on 2 August 2022 for BugId 113565
                  descriptionInput
                );
              }}
              className={styles.okButton}
            >
              {props.disableAddBtn === "addAnother" && (
                <CircularProgress
                  color="#FFFFFF"
                  style={{
                    height: "1rem",
                    width: "1rem",
                  }}
                />
              )}
              {t("addAnother")}
            </button>
          )}

          {props.toDoNameToModify ? (
            <button
              disabled={errorMsg || props.disableAddBtn !== null}
              onClick={(e) => {
                props.setDisableAddBtn("modify");
                /*code added on 4 August 2022 for BugId 113920 */
                props.modifyToDoFromList(
                  nameInput,
                  props.groupId ? props.groupId : selectedGroup[0], // code edited on 2 August 2022 for BugId 113565
                  descriptionInput,
                  props.toDoIdToModify,
                  mandatoryValue,
                  associateField,
                  todoTypeValue
                );
              }}
              className={styles.okButton}
              id="pmweb_toDo_addNclose_AddTodoModal_ModifyButton"
            >
              {props.disableAddBtn === "modify" && (
                <CircularProgress
                  color="#FFFFFF"
                  style={{
                    height: "1rem",
                    width: "1rem",
                  }}
                />
              )}
              {t("modify")}
            </button>
          ) : null}
        </div>
      </div>
    </FocusTrap>
  );
}

export default AddToDo;
