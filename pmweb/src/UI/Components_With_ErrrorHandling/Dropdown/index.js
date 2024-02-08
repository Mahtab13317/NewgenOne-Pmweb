// #BugID - 115569
// #BugDescription - template save error issue resolved.

// #BugID - 120111
// #BugDescription - single and double quotes validation added.

import React, { useState, useEffect } from "react";
import Select from "@material-ui/core/Select";
import styles from "./index.module.css";
import clsx from "clsx";
import { useTranslation } from "react-i18next";
import {
  CONSTANT,
  RTL_DIRECTION,
  SPACE,
} from "../../../Constants/appConstants";
import { makeStyles, MenuItem } from "@material-ui/core";
import { TRIGGER_CONSTANT } from "../../../Constants/triggerConstants";
import "./index.css";
import { DatePickers } from "../../DatePicker/DatePickers";
import { FieldValidations } from "../../../utility/FieldValidations/fieldValidations";
import { setToastDataFunc } from "../../../redux-store/slices/ToastDataHandlerSlice";
import { useDispatch } from "react-redux";
import {
  getIncorrectRegexErrMsg,
  isArabicLocaleSelected,
} from "../../../utility/CommonFunctionCall/CommonFunctionCall";

const useStyles = makeStyles({
  selectMenu: {
    padding: "0rem 0rem",
  },
  select: {
    width: "100%",
    font: "normal normal normal var(--base_text_font_size)/17px Open Sans",
    borderRadius: "2px",
    opacity: "1",
    textAlign: (props) =>
      props.direction === RTL_DIRECTION ? "right" : "left",
    "&$select": {
      paddingRight: (props) =>
        props.direction === RTL_DIRECTION ? "0.5vw" : "1.75vw",
      paddingLeft: (props) =>
        props.direction === RTL_DIRECTION ? "1.75vw" : "0.5vw",
    },
    "&::before": {
      display: "none",
    },
    "&::after": {
      display: "none",
    },
  },
  selectDrop: {
    height: "var(--line_height)",
    background: "#FFFFFF 0% 0% no-repeat padding-box",
    border: "1px solid #d7d7d7",
  },
  icon: {
    left: (props) => (props.direction === RTL_DIRECTION ? "0px" : "unset"),
    right: (props) => (props.direction === RTL_DIRECTION ? "unset" : "0px"),
  },
});

function CustomizedDropdown(props) {
  const {
    id,
    disabled,
    className,
    value,
    onOpen,
    onChange,
    children,
    validationBoolean,
    showAllErrorsSetterFunc,
    isNotMandatory,
    isConstant,
    showConstValue,
    setIsConstant,
    menuItemStyles,
    constType,
    name,
    hideDefaultSelect,
    onError,
    defaultValue,
    inputProps,
    inputId,
    ariaLabel,
    numberOfOptions,
    noOptionsMessage,
    inputType,
    showUnselectOption,
    unselectOptionValue,
  } = props;
  let { t } = useTranslation();
  const direction = `${t("HTML_DIR")}`;
  const [showError, setShowError] = useState(false); // Boolean to show error statement.
  const [constVal, setConstVal] = useState("");
  const [selectedValue, setSelectedValue] = useState(null); // State that stores the selected value.
  const [constantType, setConstantType] = useState(null); // State that stores the variable type of the constant selected.
  const [maxLengthAllowed, setMaxLengthAllowed] = useState(255); // State that stores the maximum length allowed for constant field according to the variable type.
  const menuProps = {
    anchorOrigin: {
      vertical: "bottom",
      horizontal: "left",
    },
    transformOrigin: {
      vertical: "top",
      horizontal: "left",
    },
    getContentAnchorEl: null,
    PaperProps: {
      style: {
        maxHeight: props.maxHeight ? props.maxHeight : "15rem",
        // maxWidth: props.maxWidth ? props.maxWidth : "100%"
      },
    },
  };
  const classes = useStyles({ direction });
  const dispatch = useDispatch();

  // Function that runs when the constType prop changes.
  useEffect(() => {
    if (constType !== "") {
      let type = "";
      let lengthAllowed = "";
      switch (constType) {
        case "10":
          type = "text";
          break;
        case "3":
        case "4":
        case "6":
        case "11":
          type = "number";
          break;
        case "8":
        case "15":
          type = "date";
          break;
        default:
          type = "text";
          break;
      }
      // Switch case added for setting max length allowed for constant input field.
      switch (constType) {
        case "10":
          lengthAllowed = 255;
          break;
        case "11":
          lengthAllowed = 10;
          break;
        case "3":
          lengthAllowed = 5;
          break;
        case "4":
          lengthAllowed = 19;
          break;
        case "6":
          lengthAllowed = 50;
          break;
        default:
          lengthAllowed = 255;
          break;
      }
      setMaxLengthAllowed(lengthAllowed);
      setConstantType(type);
    }
  }, [constType]);

  // Function that runs when the validationBoolean prop changes.
  useEffect(() => {
    if (validationBoolean && !isNotMandatory) {
      isValueEmpty(value);
    } else {
      setShowError(false);
    }
  }, [validationBoolean]);

  useEffect(() => {
    if (isConstant) {
      setSelectedValue(CONSTANT);
      setConstVal(value);
    } else {
      setSelectedValue(value);
      setConstVal("");
    }
  }, [value]);

  // Function that runs when the showError state changes.
  useEffect(() => {
    if (showError && !isNotMandatory) {
      showAllErrorsSetterFunc &&
        showAllErrorsSetterFunc((prevState) => {
          return prevState || true;
        });
    } else {
      showAllErrorsSetterFunc &&
        showAllErrorsSetterFunc((prevState) => {
          return prevState;
        });
    }
  }, [showError]);

  // Function to check if the dropdown value is empty or not.
  const isValueEmpty = (valueSelected) => {
    if (
      (!valueSelected || (valueSelected === CONSTANT && validationBoolean)) &&
      !isNotMandatory
    ) {
      setShowError(true);
    } else {
      setShowError(false);
    }
  };

  // Function that runs when the user closes the list of dropdown options by clicking away from the dropdown.
  const onCloseHandler = (event) => {
    if (!value && !isNotMandatory) {
      setShowError(true);
    } else {
      setShowError(false);
    }
  };

  // Function that runs when the user changes the selected value in a dropdown.
  const onChangeHandler = (event, type) => {
    if (
      event.target.value === "'" ||
      ((typeof event.target.value === "string" ||
        event.target.value instanceof String) &&
        event.target.value?.includes("'"))
    ) {
      return false;
    }

    if (
      (typeof event.target.value === "string" ||
        event.target.value instanceof String) &&
      event.target.value?.includes('"')
    ) {
      return false;
    }

    if (showConstValue) {
      if (type === "C") {
        if (event.target.value?.length <= maxLengthAllowed) {
          setConstVal(event.target.value);
          onChange(event, true);
          if (
            setIsConstant &&
            setIsConstant !== null &&
            setIsConstant !== undefined
          ) {
            setIsConstant(true);
          }
        } else {
          if (onError && onError !== null && onError !== undefined)
            onError(`Max length Allowed is: ${maxLengthAllowed}`);
        }
      } else {
        onChange(event, false);
        if (
          setIsConstant &&
          setIsConstant !== null &&
          setIsConstant !== undefined
        ) {
          setIsConstant(false);
        }
        setSelectedValue(event.target.value);
      }
    } else {
      onChange(event);
      setSelectedValue(event.target.value);
    }
    isValueEmpty(event.target.value);
  };

  //Bug 126315 - email>>improper message is appearing while entering special character
  //[10-04-2023] handling the onPaste Event in case of number
  // modified on 11/09/2023 for BugId 136715

  const onKeyPress = (evt) => {
    if (constantType === "number" && props.reference) {
      //code added for bug id 135861 on 11-09-23
      if (props.isFloat) {
        FieldValidations(evt, 6, props.reference?.current, maxLengthAllowed);
      } else {
        FieldValidations(evt, 3, props.reference?.current, maxLengthAllowed);
      }
    }
    // added on 18/10/23 for BugId 139012
    if (constantType === "text" && props.reference) {
      FieldValidations(evt, 63, props.reference?.current, maxLengthAllowed);
    }
    //added on 27-9-2023 for bug_id: 135687
    if (inputType === "valuedropdown" && props.reference) {
      FieldValidations(evt, 10, props.reference?.current, maxLengthAllowed);
    }
    // till here for bug_id: 135687
    // added for bug_id: 135699 on 10-5-2023
    if (inputType === "assignTo" && props.reference) {
      FieldValidations(evt, 170, props.reference?.current, maxLengthAllowed);
    }
    // till here for bug_id: 135699
    // added on 30-10-2023 for bug_id: 140273
    if (inputType === "template" && props.reference) {
      FieldValidations(
        evt,
        150,
        props.reference?.current,
        props.maxLengthAllowedinTemplate
      );
    }
    // till here for bug_id: 140273
  };

  //Bug 126315 - email>>improper message is appearing while entering special character
  //[10-04-2023] handling the onPaste Event in case of number
  const onPaste = (evt) => {
    if (constantType === "number") {
      let isNum = /^\d+$/.test(evt.clipboardData.getData("Text"));
      if (!isNum) evt.preventDefault();
    }
    // added on 18/10/23 for BugId 139012
    if (constantType === "text" && props.reference) {
      let text = evt.clipboardData.getData("Text");
      const regex = new RegExp('^[^<>\\\\|/":?*]+$');
      if (text.length > maxLengthAllowed) {
        evt.preventDefault();
        dispatch(
          setToastDataFunc({
            message: t("ruleValueMsg"),
            severity: "error",
            open: true,
          })
        );
      } else if (!regex.test(text)) {
        evt.preventDefault();
        let errMsg = "";
        if (isArabicLocaleSelected()) {
          errMsg =
            t("value") +
            SPACE +
            t("cannotContain") +
            SPACE +
            `< > \\ | / " : ? *`;
        } else {
          errMsg =
            t("AllCharactersAreAllowedExcept") +
            SPACE +
            `< > \\ | / " : ? *` +
            SPACE +
            t("in") +
            SPACE +
            t("value") +
            ".";
        }
        dispatch(
          setToastDataFunc({
            message: errMsg,
            severity: "error",
            open: true,
          })
        );
      }
    }
  };

  return (
    // code edited on 11 July 2023 for BugId 131963 and BugId 132015
    <div className="relative" style={{ ...props.relativeStyle }}>
      {showConstValue && selectedValue === CONSTANT && (
        // code edited on 11 July 2023 for BugId 131963 and BugId 132015
        <div className="w100" id="dropdownErrorId">
          {/* <span className={styles.constantIcon}>{t(TRIGGER_CONSTANT)}</span> */}
          <label
            // style={{ display: "none" }}
            className={styles.constantIcon}
          >
            {t(TRIGGER_CONSTANT)}
          </label>
          <label
            style={{ display: "none" }}
            htmlFor={`input_with_${id ? id : null}`}
          >
            Default label
          </label>
          {constantType === "date" ? (
            <DatePickers
              name={name}
              onChange={(e) => {
                // code added on 1 March 2023 for BugId 121556
                if (props.validateConstField) {
                  let valid = props.validateConstField(e);
                  if (valid) {
                    onChangeHandler(e, "C");
                  }
                } else {
                  onChangeHandler(e, "C");
                }
              }}
              timeFormat={false}
              value={constVal}
              disabled={disabled}
              id={`input_with_${id ? id : null}`}
              className={
                direction === RTL_DIRECTION
                  ? styles.selectConstInputAr
                  : styles.selectConstInput
              }
              width="100%"
              height="var(--line_height)"
            />
          ) : (
            <input
              id={`input_with_${id ? id : null}`}
              aria-label={`input_with_${id ? id : null}`}
              className={
                direction === RTL_DIRECTION
                  ? styles.selectConstInputAr
                  : styles.selectConstInput
              }
              type={constantType}
              value={constVal}
              name={name}
              maxLength={maxLengthAllowed}
              onChange={(e) => {
                // code added on 1 March 2023 for BugId 121556
                if (props.validateConstField) {
                  let valid = props.validateConstField(e);
                  if (valid) {
                    onChangeHandler(e, "C");
                  }
                } else {
                  onChangeHandler(e, "C");
                }
              }}
              onPaste={
                // added on 30-10-2023 for bug_id: 140273
                inputType === "template" ? null : onPaste
              } //Bug 126315 - email>>improper message is appearing while entering special character
              disabled={disabled}
              ref={props.reference}
              onKeyPress={props.onKeyPress ? props.onKeyPress : onKeyPress} //Bug 126315 - email>>improper message is appearing while entering special character
            />
          )}
        </div>
      )}
      <Select
        id={id}
        name={name}
        disabled={disabled}
        classes={{ icon: classes.icon, select: classes.select }}
        className={clsx(
          className,
          classes.selectDrop,
          styles.height,
          showError && styles.showRedBorder
        )}
        inputProps={{
          ...inputProps,
          "aria-labelledby": id,
          id: id,
          "aria-label":
            selectedValue === CONSTANT ||
            selectedValue === "" ||
            selectedValue === null
              ? ariaLabel
              : `${ariaLabel} selected ${selectedValue}`,
          // "aria-label": ariaLabel
        }}
        style={{ ...props.style }}
        // aria-roledescription={props.ariaDescription}
        aria-description={props.ariaDescription}
        // tabIndex={0}
        onOpen={onOpen}
        defaultValue={defaultValue}
        MenuProps={menuProps}
        value={
          selectedValue === CONSTANT ||
          selectedValue === "" ||
          selectedValue === null
            ? "DropDownDefaultValue"
            : selectedValue
        }
        onChange={(event) => onChangeHandler(event, "S")}
        onClose={(event) => onCloseHandler(event)}
      >
        {numberOfOptions !== undefined && numberOfOptions < 1 && (
          <MenuItem
            value={"NoRecordsPresent"}
            id="pmweb_NoRecordsPresent"
            style={{
              width: "100%",
              height: "var(--line_height)",
              justifyContent: direction === RTL_DIRECTION ? "end" : "start",
            }}
            disabled
          >
            <p
              style={{
                font: "1rem Open Sans",
                textAlign: direction === RTL_DIRECTION ? "right" : "left",
              }}
              // aria-hidden={true}
            >
              {noOptionsMessage}
            </p>
          </MenuItem>
        )}
        {/*Bug 121795 Audit Logs : [06-03-2023] Added a Select as default MenuItem*/}
        {!hideDefaultSelect && selectedValue !== CONSTANT && (
          <MenuItem
            //code modified for bug id 130972 on 26-10-23
            // value={"DropDownDefaultValue"}
            value={unselectOptionValue || "DropDownDefaultValue"}
            id="pmweb_defaultValue"
            style={{
              width: "100%",
              height: "var(--line_height)",
              justifyContent: direction === RTL_DIRECTION ? "end" : "start",
            }}
            disabled={!showUnselectOption}
          >
            <p
              style={{
                font: "1rem Open Sans",
                textAlign: direction === RTL_DIRECTION ? "right" : "left",
              }}
              // aria-hidden={true}
            >
              -- {t("select")} --
            </p>
          </MenuItem>
        )}
        {showConstValue && (
          <MenuItem
            className={menuItemStyles ? menuItemStyles : styles.menuItemStyles}
            key={CONSTANT}
            id={`pmweb_${CONSTANT}`}
            value={CONSTANT}
            style={{
              justifyContent: direction === RTL_DIRECTION ? "end" : null,
            }}
          >
            {props?.dropdownType === "template" ? (
              <a style={{ color: "var(--link_color)" }}>{t("addCategory")}</a>
            ) : (
              t(CONSTANT)
            )}
          </MenuItem>
        )}
        {children}
      </Select>
    </div>
  );
}

export default CustomizedDropdown;
