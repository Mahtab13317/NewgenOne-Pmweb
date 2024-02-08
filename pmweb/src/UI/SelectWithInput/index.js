import React, { useState, useEffect, useRef } from "react";
import TextField from "@material-ui/core/TextField";
import Autocomplete, {
  createFilterOptions,
} from "@material-ui/lab/Autocomplete";
import styles from "./index.module.css";
import arabicStyles from "./arabicStyles.module.css";
import "./common.css";
import "./commonArabic.css";
import { CONSTANT, RTL_DIRECTION, SPACE } from "../../Constants/appConstants";
import { useTranslation } from "react-i18next";
import { TRIGGER_CONSTANT } from "../../Constants/triggerConstants";
import { FieldValidations } from "../../utility/FieldValidations/fieldValidations";
import clsx from "clsx";
import { Paper, Popper, makeStyles, useMediaQuery } from "@material-ui/core";
import { DatePickers } from "../DatePicker/DatePickers";
import { isArabicLocaleSelected } from "../../utility/CommonFunctionCall/CommonFunctionCall";

//func for handling filtering in options
const filter = createFilterOptions();

/*
  Here, 
  state=>{
    1.selectedValue state is used to store the value of selected option.
    2.options is the array list of dropdown options.
    3.isConstantAdded is used to tell whether the selected value is from list of options or some constant value
    4.constantValue is used to store the constant value entered
  }
  props=>{
    1.dropdownOptions is the array of options in select optionList.
    2.optionKey -> key which is used to display option from options array
    5.showEmptyString -> whether empty string should be added as option in select
    6.showConstValue -> whether constant should be added as option in select
    7.setIsConstant -> to know whether the selected value is from list of options or some constant value
    8.setValue -> get value of selected option or constant value entered
    9. constType-> shows the type of constant i.e. text,number etc.
  }
  */

// #BugID - 113782
// #BugDescription - Validation for projectname to prevent numeric at begining added
// #BugID - 115919
// #BugDescription - Validation for timer for numeric values are added

const useStyles = makeStyles({
  endAdornment: {
    left: (props) =>
      props.direction === RTL_DIRECTION ? "0 !important" : "unset !important",
    right: (props) =>
      props.direction === RTL_DIRECTION ? "unset !important" : "0 !important",
    display: "flex",
    justifyContent: "end",
    alignItems: "center",
    height: "100%",
  },
  // added on 14/09/23 for BugId 136860
  noOptions: {
    height: "var(--line_height)",
    padding: "0 0.5vw !important",
    display: "flex",
    alignItems: "center",
    justifyContent: (props) =>
      props.direction === RTL_DIRECTION ? "end" : "start",
  },
});

function SelectWithInput(props) {
  let { t } = useTranslation();
  const direction = `${t("HTML_DIR")}`;
  const classes = useStyles({ direction });
  const [selectedValue, setSelectedValue] = useState(null); //-->selectedValue
  const [options, setOptions] = useState([]);
  const [isConstantAdded, setIsConstantAdded] = useState(false);
  const [constantValue, setConstantValue] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const smallScreen = useMediaQuery("(max-width: 999px)");
  let constantOption = props.constantOptionStatement
    ? t(props.constantOptionStatement)
    : t(CONSTANT);
  // const [constantType, setConstantType] = useState(null); // State that stores the variable type of the constant selected.
  const disableType = props.isConstant && !props.error ? true : false;
  const inputRef = useRef();
  const autoCompleteRef = useRef();

  // Added on 07-09-2023 fro BUGID: 130821
  const containsSpecialChars = (str) => {
    if (isArabicLocaleSelected()) {
      let regex = new RegExp("[&*|:'\"<>?////]+");
      return !regex.test(str);
    } else {
      let regex = new RegExp(/^[A-Za-z][^\\\/\:\*\?\"\<\>\|\'\&]*$/gm);
      return regex.test(str);
    }
  };

  const validateData = (e, val) => {
    if (!containsSpecialChars(e.target.value)) {
      if (isArabicLocaleSelected()) {
        setErrorMessage(
          `${val}${SPACE}${t("cannotContain")}${SPACE}&*|\:'"<>?/${SPACE}${t(
            "charactersInIt"
          )}`
        );
      } else {
        setErrorMessage(
          `${t("AllCharactersAreAllowedExcept")}${SPACE}&*|\:'"<>?/${SPACE}${t(
            "AndFirstCharacterShouldBeAlphabet"
          )}
        `
        );
      }
    } else {
      setErrorMessage("");
    }
    if (e.target.value == "") {
      setErrorMessage(false);
    }
  };

  useEffect(() => {
    if (
      props.value ||
      props.value === 0 ||
      (props.value && props.value === "" && props.showEmptyString)
    ) {
      if (props.isConstant) {
        setSelectedValue(
          props.optionKey
            ? { [props.optionKey]: constantOption }
            : constantOption
        );
        setIsConstantAdded(true);
        setConstantValue(props.value);
      } else {
        setIsConstantAdded(false);
        setConstantValue("");
        if (props.value && props.value === "") {
          setSelectedValue(props.optionKey ? { [props.optionKey]: "" } : "");
        } else {
          setSelectedValue(props.value);
        }
      }
    } else {
      setSelectedValue(null);
      setConstantValue("");
      if (props.isConstant) {
        setIsConstantAdded(true);
      } else {
        setIsConstantAdded(false);
      }
    }
  }, [props.value, props.isConstant]);

  useEffect(() => {
    let localDropdownArr = props.dropdownOptions
      ? [...props.dropdownOptions]
      : [];

    if (props.showEmptyString) {
      //add empty string option to options list if props.showEmptyString is true
      localDropdownArr.splice(
        0,
        0,
        props.optionKey ? { [props.optionKey]: "" } : ""
      );
      if (props.showConstValue) {
        localDropdownArr.splice(
          1,
          0,
          props.optionKey
            ? { [props.optionKey]: constantOption }
            : constantOption
        );
      }
    } else if (props.showConstValue) {
      //add constant option to options list if props.showConstValue is true
      localDropdownArr.splice(
        0,
        0,
        props.optionKey ? { [props.optionKey]: constantOption } : constantOption
      );
    }
    setOptions(localDropdownArr);
  }, [props.dropdownOptions]);

  // Function that runs when the constType prop changes.
  /*  useEffect(() => {
    if (props.constType !== "") {
      let type = "";
      switch (props.constType) {
        case "10":
          type = "text";
          break;
        case "3":
        case "4":
        case "6":
          type = "number";
          break;
        case "8":
          type = "date";
          break;
        default:
          type = "text";
          break;
      }
      setConstantType(type);
    }
  }, [props.constType]); */

  const Select = () => {
    return (
      <>
        <label style={{ display: "none" }} htmlFor={`${props.id}`}>
          Input
        </label>
        <Autocomplete
          // code added on 21-10-23 for Bug 137447
          PopperComponent={({ children, ...popperProps }) => (
            <div
              {...popperProps}
              style={{
                zIndex: "9999",
                maxHeight: "200px",
                overflowY: "auto",
                position: "absolute",
                top: "var(--line_height)",
                left: "0",
                width: "100%",
              }}
            >
              {children}
            </div>
          )}
          // changes on 25-10-2023to resolve the bug Id 139106
          openText={t("open")}
          closeText={t("Close")}
          // Till here for Bug 137447
          value={isConstantAdded ? "" : selectedValue}
          onKeyPress={(e) => {
            if (props.optionKey === "ProjectName") {
              FieldValidations(e, 150, autoCompleteRef.current, 60);
            }
          }}
          classes={{
            endAdornment: classes.endAdornment,
            noOptions: classes.noOptions, // added on 14/09/23 for BugId 136860
          }}
          onChange={(e, newValue) => {
            if (newValue && newValue.inputValue && props.showConstValue) {
              // Create a new value from the user input
              setConstantValue(newValue.inputValue);
              setIsConstantAdded(true);
              setSelectedValue(
                props.optionKey
                  ? {
                      [props.optionKey]: constantOption,
                    }
                  : constantOption
              );
            } else {
              if (
                (props.optionKey ? newValue[props.optionKey] : newValue) ===
                  constantOption &&
                props.showConstValue
              ) {
                setIsConstantAdded(true);
                setConstantValue("");
              } else {
                setIsConstantAdded(false);
                setSelectedValue(newValue);
                setConstantValue("");
              }
            }
          }}
          filterOptions={(filterOptions, params) => {
            const filtered = filter(filterOptions, params);
            // Suggest the creation of a new value
            if (params.inputValue.trim() !== "" && props.showConstValue) {
              filtered.push(
                props.optionKey
                  ? {
                      inputValue: params.inputValue,
                      [props.optionKey]: params.inputValue,
                    }
                  : {
                      inputValue: params.inputValue,
                      title: params.inputValue,
                    }
              );
            }

            return filtered;
          }}
          className={
            props.selectWithInput
              ? props.selectWithInput
              : styles.selectWithInput
          }
          id={props.id}
          disabled={props.disabled}
          options={options}
          getOptionLabel={(option) => {
            // Value selected with enter, right from the input
            if (typeof option === "string") {
              //unused
              return option;
            }
            // Add "xxx" option created dynamically
            if (option.inputValue && props.showConstValue) {
              return option.inputValue;
            }

            if (
              (props.optionKey ? option[props.optionKey] : option) ===
                constantOption &&
              props.showConstValue
            ) {
              return "";
            }
            // Regular option
            return props.optionKey ? option[props.optionKey] : option;
          }}
          disableClearable
          renderOption={(option) => {
            return (
              <div
                className={
                  direction === RTL_DIRECTION
                    ? arabicStyles.selectWithInputOptions
                    : styles.selectWithInputOptions
                }
              >
                {option.inputValue && props.showConstValue ? (
                  <div className={styles.AddToConst}>
                    <p>{option.inputValue}</p>
                    <p>
                      {props.constantStatement
                        ? t("addAs") + " " + t(props.constantStatement)
                        : t("addAsConstant")}
                    </p>
                  </div>
                ) : props.optionKey ? (
                  <span
                    style={
                      option[props.optionKey] === constantOption
                        ? { ...props.optionStyles }
                        : {}
                    }
                  >
                    {option[props.optionKey]}
                  </span>
                ) : (
                  <span
                    style={
                      option === constantOption ? { ...props.optionStyles } : {}
                    }
                  >
                    {option}
                  </span>
                )}
              </div>
            );
          }}
          renderInput={(params) => (
            <TextField
              {...params}
              className={
                direction === RTL_DIRECTION
                  ? props.inputClass
                    ? `${props.inputClass} selectWithInputTextField_arabic`
                    : `${styles.selectWithInputTextField} selectWithInputTextField_arabic`
                  : props.inputClass
                  ? `${props.inputClass} selectWithInputTextField`
                  : `${styles.selectWithInputTextField} selectWithInputTextField`
              }
              inputRef={autoCompleteRef}
              variant="outlined"
              disabled={disableType}
              error={props.error ? props.error : false}
              helperText={props.helperText ? props.helperText : ""}
              FormHelperTextProps={{
                style: {
                  margin: 0,
                  fontSize: "10px",
                  fontWeight: 600,
                  color: props.error ? "rgb(181,42,42)" : "#606060",
                },
              }}
            />
          )}
          noOptionsText={t("noOptions")} // added on 14/09/23 for BugId 136860
        />
      </>
    );
  };

  useEffect(() => {
    if (isConstantAdded && props.showConstValue) {
      if (constantValue !== props.value) {
        //set focus on the constant input field
        document
          .getElementById(`input_with_select_${props.id ? props.id : null}`)
          ?.focus();
        //if value is constant, then set constant value to props.setValue and true to props.setIsConstant
        props.setValue(constantValue, true);
        props.setIsConstant && props.setIsConstant(true);
      }
    } else {
      //if value is not constant, then set selected option value to props.setValue and false to props.setIsConstant
      if (
        selectedValue !== props.value &&
        selectedValue !== constantOption &&
        selectedValue
      ) {
        props.setValue(selectedValue, false);
        props.setIsConstant && props.setIsConstant(false);
      }
    }
  }, [isConstantAdded, selectedValue, constantValue]);

  return (
    <div id={props.id} style={{ width: props.width || null }}>
      {(props.showConstValue &&
        selectedValue &&
        (props.optionKey ? selectedValue[props.optionKey] : selectedValue) ===
          constantOption) ||
      isConstantAdded ? (
        //code rendered when constant value is to be entered
        <div className="relative">
          {!props.isConstantIcon && (
            <label
              className={
                direction === RTL_DIRECTION
                  ? arabicStyles.constantIcon
                  : styles.constantIcon
              }
            >
              {t(TRIGGER_CONSTANT)}
            </label>
          )}
          <label
            style={{ display: "none" }}
            htmlFor={`pmweb_input_with_select_${props.id ? props.id : null}`}
          >
            Input
          </label>
          {props.type === "date" ? (
            <DatePickers
              name={props.name}
              onChange={(e) => {
                console.log("ACC3", e.target.value);
                setConstantValue(e.target.value);
              }}
              timeFormat={false}
              value={constantValue}
              disabled={props.disabled}
              width="100%"
              height="var(--line_height)"
              required={props.required}
              id={`pmweb_input_with_select_${props.id ? props.id : null}`}
              className={
                direction === RTL_DIRECTION
                  ? props.constantInputClass
                    ? clsx(props.constantInputClass, styles.input)
                    : arabicStyles.multiSelectConstInput
                  : props.constantInputClass
                  ? clsx(props.constantInputClass, styles.input)
                  : styles.multiSelectConstInput
              }
            />
          ) : (
            <input
              id={`pmweb_input_with_select_${props.id ? props.id : null}`}
              autofocus
              type={props.type ? props.type : "text"}
              value={constantValue}
              className={
                direction === RTL_DIRECTION
                  ? props.constantInputClass
                    ? clsx(props.constantInputClass, styles.input)
                    : arabicStyles.multiSelectConstInput
                  : props.constantInputClass
                  ? clsx(
                      props.constantInputClass,
                      styles.multiSelectConstInput,
                      styles.input
                    )
                  : styles.multiSelectConstInput
              }
              // added on 25-09-2023 for bug_id: 138129
              style={{
                width: "74%",
                //top:"7%", // code added on 23-10-23 for bug: 135406
                // Changes on 21-10-2023 to resolve the bug Id 135525
                marginInlineStart: smallScreen ? "0.25rem" : null,
                maxHeight: props.constHeight ? "2.2rem" : "none",
              }}
              //till here
              disabled={props.disabled}
              onBlur={props.onBlur}
              onChange={(e) => {
                console.log("ACC1", e.target.value);
                if (props.optionKey === "ProjectName") {
                  // modified on 18-10-2023 fro BUGID: 136508
                  if (isArabicLocaleSelected) {
                    validateData(e, t("ProjectName"));
                    setConstantValue(e.target.value);
                  } else {
                    if (
                      !isNaN(e.target.value.charAt(0)) &&
                      e.target.value?.trim() !== ""
                    ) {
                      e.preventDefault();
                    } else {
                      validateData(e, t("ProjectName"));
                      setConstantValue(e.target.value);
                    }
                  }
                }
                //Added on 11/09/2023, bug_id:136570
                else {
                  setConstantValue(e.target.value);
                }
                //till here for bug_id:136570
              }}
              ref={inputRef}
              // type="number" for input is not supported in mozilla
              // code added to prevent chars in input of number type in mozilla
              onKeyPress={(e) => {
                if (props.type === "number") {
                  FieldValidations(e, 3, inputRef.current, 30);
                }
                if (props.optionKey === "ProjectName") {
                  // modified on 18-10-2023 fro BUGID: 136508
                  if (isArabicLocaleSelected) {
                    FieldValidations(e, 150, inputRef.current, 60);
                  } else {
                    if (
                      !isNaN(e.target.value.charAt(0)) &&
                      e.target.value != ""
                    ) {
                      e.preventDefault();
                    } else {
                      FieldValidations(e, 150, inputRef.current, 61);
                    }
                  }
                }
              }}
              // commented on 07-09-2023 fro BUGID: 130821
              // onPaste={(e) => {
              //   if (props.optionKey === "ProjectName") {
              //     validateData(e, "Project Name");
              //   }
              // }}
            />
          )}

          {Select()}
        </div>
      ) : (
        <div className="relative">{Select()}</div>
      )}
      {errorMessage !== "" ? (
        <p
          style={{
            color: "rgb(181,42,42)",
            fontSize: "12px",
            fontWeight: "500",
            // marginInline: "10px",
          }}
        >
          {errorMessage}
        </p>
      ) : null}
    </div>
  );
}

export default SelectWithInput;
