import React, { useEffect, useState } from "react";
import {
  ERROR_INCORRECT_FORMAT,
  ERROR_INCORRECT_VALUE,
  ERROR_MANDATORY,
  ERROR_RANGE,
  ERROR_SPACE_ALLOWED,
} from "../../../Constants/appConstants";
import { validateRegex } from "../../../validators/validator";
import styles from "./index.module.css";
import clsx from "clsx";

function TextInput(props) {
  const {
    maxLength,
    ariaLabel,
    readOnlyCondition,
    inlineErrorStyles,
    inputRef,
    onKeyPress,
  } = props;
  const [showMsg, setShowMsg] = useState(false);

  useEffect(() => {
    validateFunc(props.inputValue);
  }, [props.inputValue, props.errorStatement]);

  useEffect(() => {
    if (showMsg) {
      document.querySelector(`#${props.idTag}`).classList.add("fieldWithError");
    } else {
      document
        .querySelector(`#${props.idTag}`)
        .classList.remove("fieldWithError");
    }
  }, [showMsg]);

  const validateFunc = (inputVal) => {
    let showError = false;
    switch (props.errorType) {
      case ERROR_MANDATORY:
        showError =
          inputVal?.trim() === "" ||
          inputVal === undefined ||
          inputVal === null;
        break;
      case ERROR_RANGE:
        showError =
          inputVal &&
          (inputVal < props.rangeVal?.start || inputVal > props.rangeVal?.end);
        break;
      case ERROR_INCORRECT_FORMAT:
        showError = inputVal && !validateRegex(inputVal, props.regexStr);
        break;
      case ERROR_SPACE_ALLOWED:
        showError =
          inputVal === "" || inputVal === undefined || inputVal === null;
        break;
      case ERROR_INCORRECT_VALUE:
        showError = true;
        break;
      default:
        break;
    }
    setShowMsg(showError);
  };

  return (
    <div>
      <input
        {...props}
        maxLength={maxLength}
        disabled={readOnlyCondition}
        value={props.inputValue}
        id={props.idTag}
        aria-label={ariaLabel ? ariaLabel : "input"}
        onBlur={props.onBlurEvent}
        onChange={props.onChangeEvent}
        name={props.name}
        className={`${props.classTag} ${
          showMsg
            ? props.errorSeverity === "error"
              ? styles.errorInput
              : null
            : null
        }`}
        style={
          showMsg && props.inlineError
            ? { ...props.style, marginBottom: "0" }
            : { ...props.style }
        }
        type={props.type}
        ref={inputRef}
        onKeyPress={onKeyPress}
        onPaste={props.onPaste}
        autoComplete="off"
        min={props.type === "number" ? "0" : ""}
      />
      {props.inlineError && showMsg ? (
        <p
          className={
            props.errorSeverity === "error"
              ? clsx(styles.errorStatement, inlineErrorStyles)
              : null
          }
        >
          {props.errorStatement}
        </p>
      ) : null}
    </div>
  );
}

export default TextInput;
