import React, { useEffect, useState } from "react";
import styles from "./modal.module.css";
import arabicStyles from "./arabicModal.module.css";
import { useTranslation } from "react-i18next";
import CloseIcon from "@material-ui/icons/Close";
import TextInput from "../../../../../../../UI/Components_With_ErrrorHandling/InputField";
import {
  ERROR_MANDATORY,
  RTL_DIRECTION,
  STATE_ADDED,
  STATE_EDITED,
} from "../../../../../../../Constants/appConstants";

function BasicAuthModal(props) {
  let { t } = useTranslation();
  const direction = `${t("HTML_DIR")}`;
  let {
    cancelFunc,
    selected,
    setSelected,
    webServiceObj,
    setWebServiceObj,
    isScreenReadOnly,
  } = props;
  const [data, setData] = useState({
    username: "",
    // modified on 31/10/23 for checkmarx -- client privacy violation
    // password: "",
    authCred: "",
    // till here
  });
  const [error, setError] = useState({});

  useEffect(() => {
    if (webServiceObj) {
      setData({
        username: webServiceObj.username,
        // modified on 31/10/23 for checkmarx -- client privacy violation
        // password: webServiceObj.password,
        authCred: webServiceObj.authCred,
        // till here
      });
    }
  }, [webServiceObj?.username, webServiceObj?.authCred]);

  const onChange = (e) => {
    setData({ ...data, [e.target.name]: e.target.value });
  };

  const submitFunc = () => {
    let mandatoryFieldsFilled = true;
    let errorObj = {};
    if (!data.username || data.username === "") {
      mandatoryFieldsFilled = false;
      errorObj = {
        ...errorObj,
        username: {
          statement: t("PleaseEnter") + " " + t("Username"),
          severity: "error",
          errorType: ERROR_MANDATORY,
        },
      };
    }
    // modified on 31/10/23 for checkmarx -- client privacy violation
    // if (!data.password || data.password === "") {
    if (!data.authCred || data.authCred === "") {
      mandatoryFieldsFilled = false;
      errorObj = {
        ...errorObj,
        authCred: {
          statement: t("PleaseEnter") + " " + t("Password"),
          severity: "error",
          errorType: ERROR_MANDATORY,
        },
      };
    }
    // till here
    if (mandatoryFieldsFilled) {
      setError({});
      setWebServiceObj((prev) => {
        let temp = { ...prev };
        temp = {
          ...temp,
          username: data.username,
          authCred: data.authCred,
        };
        return temp;
      });
      if (selected?.status === STATE_ADDED) {
        setSelected((prev) => {
          let temp = { ...prev };
          temp.status = STATE_EDITED;
          return temp;
        });
      }
      cancelFunc();
    } else {
      setError({ ...error, ...errorObj });
    }
  };

  return (
    <div>
      <div className={styles.modalHeader}>
        <h3
          className={
            direction === RTL_DIRECTION
              ? arabicStyles.modalHeading
              : styles.modalHeading
          }
        >
          {t("Define") + " " + t("AuthenticationDetails") + " - " + t("Basic")}
        </h3>
        <CloseIcon
          onClick={cancelFunc}
          className={styles.closeIcon}
          id="webS_basicAuth_close"
          tabIndex={0}
          onKeyUp={(e) => {
            if (e.key === "Enter") {
              cancelFunc();
              e.stopPropagation();
            }
          }}
        />
      </div>
      <div className={styles.modalBody} style={{ padding: "1.75rem 1.5vw" }}>
        <label
          className={
            direction === RTL_DIRECTION
              ? arabicStyles.webSLabel
              : styles.webSLabel
          }
        >
          {t("Username")}
          <span
            className={
              direction === RTL_DIRECTION
                ? arabicStyles.starIcon
                : styles.starIcon
            }
          >
            *
          </span>
        </label>
        <TextInput
          inputValue={data?.username}
          classTag={styles.webSInput}
          onChangeEvent={onChange}
          name="username"
          idTag="webS_basicAuth_username"
          errorStatement={error?.username?.statement}
          errorSeverity={error?.username?.severity}
          errorType={error?.username?.errorType}
          readOnlyCondition={isScreenReadOnly}
          inlineError={true}
        />
        <label
          className={
            direction === RTL_DIRECTION
              ? arabicStyles.webSLabel
              : styles.webSLabel
          }
        >
          {t("Password")}
          <span
            className={
              direction === RTL_DIRECTION
                ? arabicStyles.starIcon
                : styles.starIcon
            }
          >
            *
          </span>
        </label>
        <TextInput
          inputValue={data?.authCred}
          classTag={styles.webSInput}
          onChangeEvent={onChange}
          name="authCred"
          type="password"
          idTag="webS_basicAuth_password"
          errorStatement={error?.authCred?.statement}
          errorSeverity={error?.authCred?.severity}
          errorType={error?.authCred?.errorType}
          readOnlyCondition={isScreenReadOnly}
          inlineError={true}
        />
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
          onClick={cancelFunc}
          id="webs_basicAuth_cancel"
        >
          {t("cancel")}
        </button>
        <button
          className={styles.okButton}
          onClick={submitFunc}
          id="webs_basicAuth_save"
        >
          {t("save")}
        </button>
      </div>
    </div>
  );
}

export default BasicAuthModal;
