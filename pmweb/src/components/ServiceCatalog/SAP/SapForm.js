import React, { useEffect, useRef, useState } from "react";
import styles from "./index.module.css";
import arabicStyles from "./arabicStyles.module.css";
import { useTranslation } from "react-i18next";
import { Checkbox } from "@material-ui/core";
import { FormControlLabel, Radio, RadioGroup } from "@material-ui/core";
import emptyStatePic from "../../../assets/ProcessView/EmptyState.svg";
import {
  ERROR_INCORRECT_VALUE,
  ERROR_RANGE,
  RTL_DIRECTION,
  STATE_ADDED,
  STATE_CREATED,
  STATE_EDITED,
} from "../../../Constants/appConstants";
import { PMWEB_REGEX, validateRegex } from "../../../validators/validator";
import TextInput from "../../../UI/Components_With_ErrrorHandling/InputField";
import { FieldValidations } from "../../../utility/FieldValidations/fieldValidations";
import {
  getCommonRegErrorMsg,
  getGenErrMsg,
  getIncorrectLenErrMsg,
  restrictSpecialCharacter,
} from "../../../utility/CommonFunctionCall/CommonFunctionCall";

function SapForm(props) {
  let { t } = useTranslation();
  const direction = `${t("HTML_DIR")}`;
  let { selected, setChangedSelection, setSelected } = props;
  const [error, setError] = useState({});
  const [rfcCheck, setRfcCheck] = useState(false);

  const [sapConfigObj, setsapConfigObj] = useState({
    configuration: "",
    hostName: "",
    clientName: "",
    userName: "",
    // modified on 31/10/23 for checkmarx -- client privacy violation
    // password: "",
    authCred: "",
    // till here
    language: "",
    instanceNo: "",
    httpPort: "",
    protocol: "HTTP",
    itsServer: "E",
    rfchostNameRequired: rfcCheck,
    rfcHostname: "",
  });

  const configRef = useRef();
  const userRef = useRef();
  const langRef = useRef();
  const intsanceRef = useRef();
  const clientRef = useRef();
  const portRef = useRef();

  useEffect(() => {
    if (selected) {
      setRfcCheck(selected?.rfchostNameRequired);
      if (selected.status === STATE_ADDED || selected.status === STATE_EDITED) {
        setsapConfigObj({
          configuration: selected?.configurationName,
          hostName: selected.saphostName,
          clientName: selected.sapclient,
          //userName: selected?.sapuserName,
          userName: selected?.sapuserName || sapConfigObj?.userName, //Modified on 19/10/2023, bug_id:136189
          // modified on 31/10/23 for checkmarx -- client privacy violation
          // password: "",
          authCred: "",
          // till here
          language: selected.saplanguage,
          instanceNo: selected.sapinstanceNo,
          httpPort: selected.saphttpport,
          protocol: selected.sapprotocol,
          itsServer: selected.sapitsserver,
          rfchostNameRequired: selected?.rfchostNameRequired,
          rfcHostname: selected?.rfchostName,
        });
        if (
          selected?.rfchostName &&
          (selected?.rfchostName !== "" || selected?.rfchostName !== null)
        ) {
          setRfcCheck(true);
        }
      } else if (selected.status === STATE_CREATED) {
        setsapConfigObj({
          configuration: "",
          hostName: "",
          clientName: "",
          userName: "",
          // modified on 31/10/23 for checkmarx -- client privacy violation
          // password: "",
          authCred: "",
          // till here
          language: "",
          instanceNo: "",
          httpPort: "",
          protocol: "HTTP",
          itsServer: "E",
          rfchostNameRequired: rfcCheck,
          rfcHostname: "",
        });
      }
    }
  }, [selected]);

  useEffect(() => {
    // setRfcCheck(selected?.rfchostNameRequired);
    setChangedSelection((prev) => {
      let temp = { ...prev };
      temp = { ...temp, ...sapConfigObj };
      return temp;
    });
  }, [sapConfigObj]);

  const onChange = (e) => {
    let tempSapConfig = { ...sapConfigObj };
    props?.setBtnDisable(false);
    // Modified on 28/09/2023, bug_id:136130,136138
    let isValid = true;
    let errorMsg = "";
    if (e.target.name === "configuration") {
      const restrictChars = `<>\|/":?*`;
      const regexVal = "[*|\\\\:'\"<>?//]+";
      isValid = restrictSpecialCharacter(e.target.value, regexVal);
      if (!isValid) {
        errorMsg = getCommonRegErrorMsg("sapConfig", t, restrictChars);
        let errorObj = null;
        errorObj = {
          ...errorObj,
          configuration: {
            statement: errorMsg,
            severity: "error",
            errorType: ERROR_INCORRECT_VALUE,
          },
        };
        setError({ ...error, ...errorObj });
        props?.setBtnDisable(true);
      } else if (e.target.value.length > 64) {
        errorMsg = getIncorrectLenErrMsg("sapConfig", 64, t);
        let errorObj = null;
        errorObj = {
          ...errorObj,
          configuration: {
            statement: errorMsg,
            severity: "error",
            errorType: ERROR_INCORRECT_VALUE,
          },
        };
        setError({ ...error, ...errorObj });
        props?.setBtnDisable(true);
      } else {
        tempSapConfig[e.target.name] = e.target.value;
        setError({});
      }
    } else if (e.target.name === "userName") {
      if (e.target.value.length > 255) {
        errorMsg = getIncorrectLenErrMsg("sapUserName", 255, t);
        let errorObj = null;
        errorObj = {
          ...errorObj,
          userName: {
            statement: errorMsg,
            severity: "error",
            errorType: ERROR_INCORRECT_VALUE,
          },
        };
        setError({ ...error, ...errorObj });
      } else {
        tempSapConfig[e.target.name] = e.target.value;
        setError({});
      }
    } else {
      tempSapConfig[e.target.name] = e.target.value;
      if (e.target.name === "hostName") {
        if (
          !validateRegex(e.target.value, PMWEB_REGEX.IpAddressIpV4) &&
          !validateRegex(e.target.value, PMWEB_REGEX.DomainName)
        ) {
          props?.setBtnDisable(true);
          let errorObj = null;
          errorObj = {
            ...errorObj,
            hostName: {
              statement: getGenErrMsg("sapHostName", "shouldIPDomain", t),
              severity: "error",
              errorType: ERROR_INCORRECT_VALUE,
            },
          };
          setError({ ...error, ...errorObj });
        } else {
          props?.setBtnDisable(false);
          setError({});
        }
      }
      if (e.target.name === "rfcHostname") {
        if (
          !validateRegex(e.target.value, PMWEB_REGEX.IpAddressIpV4) &&
          !validateRegex(e.target.value, PMWEB_REGEX.DomainName)
        ) {
          props?.setBtnDisable(true);
          let errorObj = null;
          errorObj = {
            ...errorObj,
            rfcHostname: {
              statement: getGenErrMsg(
                "toolbox.serviceCatalogSap.rfcHostname",
                "shouldIPDomain",
                t
              ),
              severity: "error",
              errorType: ERROR_INCORRECT_VALUE,
            },
          };
          setError({ ...error, ...errorObj });
        } else {
          props?.setBtnDisable(false);
          setError({});
        }
      }
      // modified on 31/10/23 for checkmarx -- client privacy violation
      // if (e.target.name === "password") {
      if (e.target.name === "authCred") {
        if (e.target.value.length > 512) {
          errorMsg = getIncorrectLenErrMsg("sapPassword", 512, t);
          let errorObj = null;
          errorObj = {
            ...errorObj,
            authCred: {
              statement: errorMsg,
              severity: "error",
              errorType: ERROR_INCORRECT_VALUE,
            },
          };
          setError({ ...error, ...errorObj });
          props?.setBtnDisable(true);
        } else {
          props?.setBtnDisable(false);
          setError({});
        }
      }
      // till here
      if (e.target.name === "language") {
        if (!validateRegex(e.target.value, PMWEB_REGEX.LanguageLocale)) {
          let errorObj = null;
          errorObj = {
            ...errorObj,
            language: {
              statement: getGenErrMsg("language", "Invalid", t),
              severity: "error",
              errorType: ERROR_INCORRECT_VALUE,
            },
          };
          setError({ ...error, ...errorObj });
          props?.setBtnDisable(true);
        } else if (e.target.value.length > 10) {
          errorMsg = getIncorrectLenErrMsg("language", 10, t);
          let errorObj = null;
          errorObj = {
            ...errorObj,
            language: {
              statement: errorMsg,
              severity: "error",
              errorType: ERROR_INCORRECT_VALUE,
            },
          };
          setError({ ...error, ...errorObj });
          props?.setBtnDisable(true);
        } else {
          setError({});
          props?.setBtnDisable(false);
        }
      }

      if (e.target.name === "instanceNo") {
        if (e.target.value.length > 2) {
          errorMsg = getIncorrectLenErrMsg("intanceNumber", 2, t);
          let errorObj = null;
          errorObj = {
            ...errorObj,
            instanceNo: {
              statement: errorMsg,
              severity: "error",
              errorType: ERROR_INCORRECT_VALUE,
            },
          };
          setError({ ...error, ...errorObj });
          props?.setBtnDisable(true);
        } else {
          setError({});
          props?.setBtnDisable(false);
        }
      }

      if (e.target.name === "clientName") {
        if (e.target.value.length > 3) {
          errorMsg = getIncorrectLenErrMsg("sapClient", 3, t);
          let errorObj = null;
          errorObj = {
            ...errorObj,
            clientName: {
              statement: errorMsg,
              severity: "error",
              errorType: ERROR_INCORRECT_VALUE,
            },
          };
          setError({ ...error, ...errorObj });
          props?.setBtnDisable(true);
        } else {
          props?.setBtnDisable(false);
          setError({});
        }
      }

      if (e.target.name === "httpPort") {
        if (e.target.value > 65535) {
          let errorObj = null;
          errorObj = {
            ...errorObj,
            portId: {
              statement: t("portRange"),
              severity: "error",
              errorType: ERROR_RANGE,
            },
          };
          setError({ ...error, ...errorObj });
          props?.setBtnDisable(true);
        } else {
          setError({});
          props?.setBtnDisable(false);
        }
      }
    }

    //till her for bug id:136130,136138

    //tempSapConfig[e.target.name] = e.target.value;
    tempSapConfig.rfchostNameRequired = rfcCheck;
    setsapConfigObj(tempSapConfig);
    if (selected?.status === STATE_ADDED) {
      setSelected((prev) => {
        let temp = { ...prev };
        temp.status = STATE_EDITED;
        return temp;
      });
    }
  };

  const changeRFC = (e) => {
    setRfcCheck(e.target.checked);
  };

  useEffect(() => {
    setRfcCheck(selected?.rfchostNameRequired);
  }, []);

  return (
    <div className={styles.webSDefinition}>
      {!selected ? (
        <div>
          <img
            src={emptyStatePic}
            alt={t("noConfigurationAdded")}
            id="sap_catalog_config_noImg"
          />
        </div>
      ) : (
        <div>
          <label
            className={
              direction === RTL_DIRECTION
                ? arabicStyles.webSLabel
                : styles.webSLabel
            }
          >
            {t("sapConfig")}
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
            inputValue={sapConfigObj?.configuration}
            classTag={styles.webSInput}
            onChangeEvent={onChange}
            name="configuration"
            idTag="Sap_configuration"
            readOnlyCondition={selected?.status == STATE_ADDED ? true : false}
            //Added on 28/09/2023, bug_id:136130
            inputRef={configRef}
            errorStatement={error?.configuration?.statement}
            errorSeverity={error?.configuration?.severity}
            errorType={error?.configuration?.errorType}
            inlineError={true}
            onKeyPress={(e) => FieldValidations(e, 63, configRef.current, 63)}
            //till here for bug id: 136130
          />

          <label
            className={
              direction === RTL_DIRECTION
                ? arabicStyles.webSLabel
                : styles.webSLabel
            }
          >
            {t("sapHostName")}
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
            inputValue={sapConfigObj?.hostName}
            classTag={styles.webSInput}
            onChangeEvent={onChange}
            name="hostName"
            idTag="Sap_hostName_config"
            errorStatement={error?.hostName?.statement}
            errorSeverity={error?.hostName?.severity}
            errorType={error?.hostName?.errorType}
            inlineError={true}
            //readOnlyCondition={selected?.status == STATE_ADDED ? true : false}
          />

          <div
            className={
              direction === RTL_DIRECTION ? arabicStyles.rfc : styles.rfc
            }
          >
            <FormControlLabel
              control={
                <Checkbox
                  name="RFC"
                  id="isRFCCheckConfig"
                  color="primary"
                  onChange={changeRFC}
                  checked={rfcCheck}
                />
              }
              className={
                direction === RTL_DIRECTION
                  ? arabicStyles.rfcCheckbox
                  : styles.rfcCheckbox
              }
              label={t("toolbox.serviceCatalogSap.rfcHostname")}
              //disabled={selected?.status == STATE_ADDED ? true : false}
            />

            {rfcCheck ? (
              <TextInput
                classTag={styles.webSInput}
                name="rfcHostname"
                idTag="rfcHostConfig"
                inputValue={sapConfigObj?.rfcHostname}
                onChangeEvent={onChange}
                errorStatement={error?.rfcHostname?.statement}
                errorSeverity={error?.rfcHostname?.severity}
                errorType={error?.rfcHostname?.errorType}
                inlineError={true}
                //readOnlyCondition={selected?.status == STATE_ADDED ? true : false}
              />
            ) : (
              ""
            )}
          </div>

          <label
            className={
              direction === RTL_DIRECTION
                ? arabicStyles.webSLabel
                : styles.webSLabel
            }
          >
            {t("sapUserName")}
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
            inputValue={sapConfigObj?.userName}
            classTag={styles.webSInput}
            onChangeEvent={onChange}
            name="userName"
            idTag="Sap_userName_config"
            inputRef={userRef}
            errorStatement={error?.userName?.statement}
            errorSeverity={error?.userName?.severity}
            errorType={error?.userName?.errorType}
            inlineError={true}
            onKeyPress={(e) => FieldValidations(e, 173, userRef.current, 255)} // Added on 20/10/2023, bug_id:136130,136138
            //readOnlyCondition={selected?.status == STATE_ADDED ? true : false}
          />

          <label
            className={
              direction === RTL_DIRECTION
                ? arabicStyles.webSLabel
                : styles.webSLabel
            }
          >
            {t("sapPassword")}
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
          {/* modified on 31/10/23 for checkmarx -- client privacy violation*/}
          <TextInput
            // inputValue={sapConfigObj?.password}
            // name="password"
            // errorStatement={error?.password?.statement}
            // errorSeverity={error?.password?.severity}
            // errorType={error?.password?.errorType}
            inputValue={sapConfigObj?.authCred}
            classTag={styles.webSInput}
            onChangeEvent={onChange}
            name="authCred"
            type="password" //Modified on 02/08/2023, bug_id:133619
            idTag="Sap_password_config"
            errorStatement={error?.authCred?.statement}
            errorSeverity={error?.authCred?.severity}
            errorType={error?.authCred?.errorType}
            inlineError={true}
            //readOnlyCondition={selected?.status == STATE_ADDED ? true : false}
          />
          {/* till here */}
          <div className="row">
            <div>
              <label
                className={
                  direction === RTL_DIRECTION
                    ? arabicStyles.webSLabel
                    : styles.webSLabel
                }
              >
                {t("language")}
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
                inputValue={sapConfigObj?.language}
                classTag={styles.webSInputInstance}
                onChangeEvent={onChange}
                name="language"
                idTag="Sap_language_config"
                //readOnlyCondition={selected?.status == STATE_ADDED ? true : false}
                inputRef={langRef} // Added on 20/10/2023, bug_id:136130,136138
                errorStatement={error?.language?.statement}
                errorSeverity={error?.language?.severity}
                errorType={error?.language?.errorType}
                inlineError={true}
                onKeyPress={(e) =>
                  FieldValidations(e, 104, langRef.current, 10)
                } // Added on 20/10/2023, bug_id:136130,136138
              />
            </div>
            {/*  <div style={{ marginLeft: "1rem" }}>
          <label
            className={
              direction === RTL_DIRECTION
                ? arabicStyles.webSLabel
                : styles.webSLabel
            }
          >
            {t("sapClient")}
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
            inputValue={sapConfigObj?.clientName}
            classTag={styles.webSInput}
            onChangeEvent={onChange}
            name="clientName"
            idTag="Sap_clientName"
            readOnlyCondition={selected?.status == STATE_ADDED ? true : false}
          />
        </div> */}
            <div style={{ marginInlineStart: "1rem" }}>
              <label
                className={
                  direction === RTL_DIRECTION
                    ? arabicStyles.webSLabel
                    : styles.webSLabel
                }
              >
                {t("instanceNumber")}
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
                inputValue={sapConfigObj?.instanceNo}
                classTag={styles.webSInputInstance}
                onChangeEvent={onChange}
                name="instanceNo"
                idTag="Sap_instanceNo_config"
                type="number"
                //readOnlyCondition={selected?.status == STATE_ADDED ? true : false}
                inputRef={intsanceRef} // Added on 20/10/2023, bug_id:136130,136138
                errorStatement={error?.instanceNo?.statement}
                errorSeverity={error?.instanceNo?.severity}
                errorType={error?.instanceNo?.errorType}
                inlineError={true}
                onKeyPress={(e) =>
                  FieldValidations(e, 3, intsanceRef.current, 3)
                } // Added on 20/10/2023, bug_id:136130,136138
              />
            </div>
          </div>
          <label
            className={
              direction === RTL_DIRECTION
                ? arabicStyles.webSLabel
                : styles.webSLabel
            }
          >
            {t("sapClient")}
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
            inputValue={sapConfigObj?.clientName}
            classTag={styles.webSInput}
            onChangeEvent={onChange}
            name="clientName"
            idTag="Sap_clientName_config"
            type="number"
            // readOnlyCondition={selected?.status == STATE_ADDED ? true : false}
            inputRef={clientRef} // Added on 20/10/2023, bug_id:136130,136138
            errorStatement={error?.clientName?.statement}
            errorSeverity={error?.clientName?.severity}
            errorType={error?.clientName?.errorType}
            inlineError={true}
            onKeyPress={(e) => FieldValidations(e, 3, clientRef.current, 4)} // Added on 20/10/2023, bug_id:136130,136138
          />
          <label
            className={
              direction === RTL_DIRECTION
                ? arabicStyles.webSLabel
                : styles.webSLabel
            }
          >
            {t("httpPort")}
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
            inputValue={sapConfigObj?.httpPort}
            classTag={styles.webSInput}
            onChangeEvent={onChange}
            name="httpPort"
            idTag="Sap_httpPort_config"
            type="number"
            rangeVal={{ start: 0, end: 65535 }}
            inputRef={portRef} // Added on 20/10/2023, bug_id:136130,136138
            errorStatement={error?.portId?.statement}
            errorSeverity={error?.portId?.severity}
            errorType={error?.portId?.errorType}
            inlineError={true}
            onKeyPress={(e) => FieldValidations(e, 3, portRef.current, 6)} // Added on 20/10/2023, bug_id:136130,136138
            //readOnlyCondition={selected?.status == STATE_ADDED ? true : false}
          />

          <div className="row">
            <div>
              <label
                className={
                  direction === RTL_DIRECTION
                    ? arabicStyles.webSLabel
                    : styles.webSLabel
                }
              >
                {t("sapProtocol")}
              </label>

              <RadioGroup
                name="protocol"
                className={
                  direction === RTL_DIRECTION
                    ? arabicStyles.webS_radioDiv
                    : styles.webS_radioDiv
                }
                value={sapConfigObj?.protocol}
                onChange={onChange}
              >
                <FormControlLabel
                  value={"HTTP"}
                  control={<Radio />}
                  label={t("HTTP")}
                  id="webS_ManualOpt"
                  className={
                    direction === RTL_DIRECTION
                      ? arabicStyles.webS_radioButton
                      : styles.webS_radioButton
                  }
                  // disabled={selected?.status == STATE_ADDED ? true : false}
                />
                <FormControlLabel
                  value={"HTTPS"}
                  control={<Radio />}
                  label={t("HTTPS")}
                  id="webS_LoadOpt"
                  className={
                    direction === RTL_DIRECTION
                      ? arabicStyles.webS_radioButton
                      : styles.webS_radioButton
                  }
                  disabled={selected?.status == STATE_ADDED ? true : false}
                />
              </RadioGroup>
            </div>
            <div style={{ marginLeft: "3rem" }}>
              <label
                className={
                  direction === RTL_DIRECTION
                    ? arabicStyles.webSLabel
                    : styles.webSLabel
                }
              >
                {t("sapItsServer")}
              </label>

              <RadioGroup
                name="itsServer"
                className={
                  direction === RTL_DIRECTION
                    ? arabicStyles.webS_radioDiv
                    : styles.webS_radioDiv
                }
                value={sapConfigObj?.itsServer}
                onChange={onChange}
              >
                <FormControlLabel
                  value={"E"}
                  control={<Radio />}
                  label={t("embedded")}
                  id="webS_ManualOpt"
                  className={
                    direction === RTL_DIRECTION
                      ? arabicStyles.webS_radioButton
                      : styles.webS_radioButton
                  }
                  //disabled={selected?.status == STATE_ADDED ? true : false}
                />
                <FormControlLabel
                  value={"S"}
                  control={<Radio />}
                  label={t("standalone")}
                  id="webS_LoadOpt"
                  className={
                    direction === RTL_DIRECTION
                      ? arabicStyles.webS_radioButton
                      : styles.webS_radioButton
                  }
                  // disabled={selected?.status == STATE_ADDED ? true : false}
                />
              </RadioGroup>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default SapForm;
