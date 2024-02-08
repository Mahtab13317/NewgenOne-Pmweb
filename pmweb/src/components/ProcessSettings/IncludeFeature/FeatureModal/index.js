// #BugID - 111753,110819
// #BugDescription - Validated the feture modal fields.
// #Date - 18 Nov 2022
import React, { useEffect, useState, useRef } from "react";
import styles from "./index.module.css";
import clsx from "clsx";
import { Divider } from "@material-ui/core";
import { Close } from "@material-ui/icons/";
import { useTranslation } from "react-i18next";
import { useDispatch } from "react-redux";
import axios from "axios";
import {
  ARABIC_REGEX1,
  ARABIC_REGEX2,
  ARABIC_REGEX3,
  ARABIC_REGEX4,
  ENDPOINT_POST_REGISTER_WINDOW,
  ENGLISH_REGEX1,
  ENGLISH_REGEX2,
  ENGLISH_REGEX3,
  ENGLISH_REGEX4,
  RTL_DIRECTION,
  SERVER_URL,
} from "../../../../Constants/appConstants";
import { setToastDataFunc } from "../../../../redux-store/slices/ToastDataHandlerSlice";
import { REGEX, validateRegex } from "../../../../validators/validator";
import { FieldValidations } from "../../../../utility/FieldValidations/fieldValidations";
import ValidationMessageProvider from "../../../../UI/ValidationMessageProvider";
import secureLocalStorage from "react-secure-storage";
import {
  isArabicLocaleSelected,
  truncateString,
} from "../../../../utility/CommonFunctionCall/CommonFunctionCall";
// import { handleModalKeyDown } from "../../../../utility/CommonFunctionCall/CommonFunctionCall";

function FeatureModal(props) {
  let { t } = useTranslation();
  const direction = `${t("HTML_DIR")}`;
  const { allData } = props;
  const [featureName, setfeatureName] = useState(null);
  const [propertyPath, setpropertyPath] = useState(null);
  const [tableName, settableName] = useState(null);
  const [executionPath, setexecutionPath] = useState(null);
  const [menuName, setmenuName] = useState(null);
  const dispatch = useDispatch();

  const featureNameHandler = (e) => {
    setfeatureName(truncateString(e?.target?.value, 255));
  };
  const propertyPathHandler = (e) => {
    setpropertyPath(truncateString(e?.target?.value, 255));
  };
  const tableNameHandler = (e) => {
    settableName(truncateString(e?.target?.value, 255));
  };
  const executionPathHandler = (e) => {
    setexecutionPath(truncateString(e?.target?.value, 255));
  };
  const menuNameHandler = (e) => {
    setmenuName(truncateString(e.target.value, 50));
  };

  const featureNameRef = useRef();
  const propertyInterfaceRef = useRef();
  const tableNameRef = useRef();
  const executionNameRef = useRef();
  const menuNameRef = useRef();
  const [errorStates, setErrorStates] = useState({
    featureName: false,
    propertyHttpPath: false,
    tableName: false,
    executionHttpPath: false,
    menuName: false,
  });

  useEffect(() => {
    if (props.selected && props.type === "Edit") {
      settableName(props.selected.TableNames);
      setfeatureName(props.selected.WindowName);
      setpropertyPath(props.selected.ClientInvocation);
      setexecutionPath(props.selected.ExecuteClassWeb);
      setmenuName(props.selected.MenuName);
    }
  }, [props.selected]);

  // Function that checks if the regex has special characters or not.
  const containsSpecialChars = (str, regex1, regex2) => {
    if (isArabicLocaleSelected()) {
      var regexAr = new RegExp(regex1);
      return regexAr.test(str);
    } else {
      var regex2En = new RegExp(regex2);
      return !regex2En.test(str);
    }
  };

  // Function to validate onPaste event.
  const validateData = (e, fieldName, arabicRegex, englishRegex) => {
    if (
      containsSpecialChars(e.target.value?.trim(), arabicRegex, englishRegex)
    ) {
      setErrorStates((prevState) => {
        return { ...prevState, [fieldName]: true };
      });
    } else {
      setErrorStates((prevState) => {
        return { ...prevState, [fieldName]: false };
      });
    }
    if (e.target.value === "") {
      setErrorStates((prevState) => {
        return { ...prevState, [fieldName]: false };
      });
    }
  };

  const registerHandler = () => {
    //Modified on 30/07/2023, bug_id:133180
    //Modified on 30/07/2023, bug_id:133178

    /*   if (
      featureName === "" ||
      featureName === null ||
      propertyPath === "" ||
      propertyPath === null ||
      executionPath === "" ||
      executionPath === null ||
      tableName === "" ||
      tableName === null ||
      menuName === "" ||
      menuName === null
    ) {
      dispatch(
        setToastDataFunc({
          message: t("missingRequiredInformation"),
          severity: "error",
          open: true,
        })
      );
      return false;
    }
 */

    if (featureName === "" || featureName === null) {
      dispatch(
        setToastDataFunc({
          message: t("featureNameMsg"),
          severity: "error",
          open: true,
        })
      );
      return false;
    }

    if (propertyPath === "" || propertyPath === null) {
      dispatch(
        setToastDataFunc({
          message: t("propertyPathMsg"),
          severity: "error",
          open: true,
        })
      );
      return false;
    }

    if (
      propertyPath &&
      propertyPath.indexOf("http://") !== 0 &&
      propertyPath &&
      propertyPath.indexOf("https://") !== 0
    ) {
      dispatch(
        setToastDataFunc({
          message: t("propertyPathError"),
          severity: "error",
          open: true,
        })
      );
      return false;
    }

    if (tableName === "" || tableName === null) {
      dispatch(
        setToastDataFunc({
          message: t("tableNameMsg"),
          severity: "error",
          open: true,
        })
      );
      return false;
    }

    if (executionPath === "" || executionPath === null) {
      dispatch(
        setToastDataFunc({
          message: t("executionPathMsg"),
          severity: "error",
          open: true,
        })
      );
      return false;
    }

    if (
      executionPath &&
      executionPath.indexOf("http://") !== 0 &&
      executionPath &&
      executionPath.indexOf("https://") !== 0
    ) {
      dispatch(
        setToastDataFunc({
          message: t("executionHttpPath"),
          severity: "error",
          open: true,
        })
      );
      return false;
    }

    if (menuName === "" || menuName === null) {
      dispatch(
        setToastDataFunc({
          message: t("menuNameMsg"),
          severity: "error",
          open: true,
        })
      );
      return false;
    }

    if (!validateRegex(tableName, REGEX.AlphaNumUsDashSpace)) {
      dispatch(
        setToastDataFunc({
          message: t("onlyUnderscoreIsAllowedInTableName"),
          severity: "error",
          open: true,
        })
      );
      return false;
    }

    let isExist = false;
    allData.map((el) => {
      if (el.WindowName === featureName) {
        isExist = true;
      }
    });
    if (isExist) {
      dispatch(
        setToastDataFunc({
          message: t("duplicateFeatureNameMsg"),
          severity: "error",
          open: true,
        })
      );
      return false;
    }

    let jsonBody = {
      interfaceName: featureName,
      clientInvocation: propertyPath,
      menuName: menuName,
      executeClassWeb: executionPath,
      tableName: tableName,
    };

    axios
      .post(SERVER_URL + ENDPOINT_POST_REGISTER_WINDOW, jsonBody)
      .then((res) => {
        props.setIsModalOpen(false);
        props.setaddNew(true);
      });
  };

  console.log("444", "DATA", {
    interfaceName: featureName,
    clientInvocation: propertyPath,
    menuName: menuName,
    executeClassWeb: executionPath,
    tableName: tableName,
  });

  const editHandler = () => {
    //Added on 30/07/2023, bug_id:133180
    //Modified on 30/07/2023, bug_id:133178

    if (featureName === "" || featureName === null) {
      dispatch(
        setToastDataFunc({
          message: t("featureNameMsg"),
          severity: "error",
          open: true,
        })
      );
      return false;
    }

    if (propertyPath === "" || propertyPath === null) {
      dispatch(
        setToastDataFunc({
          message: t("propertyPathMsg"),
          severity: "error",
          open: true,
        })
      );
      return false;
    }

    if (
      propertyPath &&
      propertyPath.indexOf("http://") !== 0 &&
      propertyPath &&
      propertyPath.indexOf("https://") !== 0
    ) {
      dispatch(
        setToastDataFunc({
          message: t("propertyPathError"),
          severity: "error",
          open: true,
        })
      );
    }

    if (tableName === "" || tableName === null) {
      dispatch(
        setToastDataFunc({
          message: t("tableNameMsg"),
          severity: "error",
          open: true,
        })
      );
      return false;
    }

    if (executionPath === "" || executionPath === null) {
      dispatch(
        setToastDataFunc({
          message: t("executionPathMsg"),
          severity: "error",
          open: true,
        })
      );
      return false;
    }

    if (
      executionPath &&
      executionPath.indexOf("http://") !== 0 &&
      executionPath &&
      executionPath.indexOf("https://") !== 0
    ) {
      dispatch(
        setToastDataFunc({
          message: t("executionHttpPath"),
          severity: "error",
          open: true,
        })
      );
    }

    if (menuName === "" || menuName === null) {
      dispatch(
        setToastDataFunc({
          message: t("menuNameMsg"),
          severity: "error",
          open: true,
        })
      );
      return false;
    }

    if (!validateRegex(tableName, REGEX.AlphaNumUsDashSpace)) {
      dispatch(
        setToastDataFunc({
          message: t("onlyUnderscoreIsAllowedInTableName"),
          severity: "error",
          open: true,
        })
      );
      return false;
    }

    let isExist = false;
    allData.map((el) => {
      if (el.MenuName === featureName) {
        isExist = true;
      }
    });
    if (isExist) {
      dispatch(
        setToastDataFunc({
          message: t("duplicateFeatureNameMsg"),
          severity: "error",
          open: true,
        })
      );
      return false;
    } else {
      let jsonBody = {
        interfaceName: featureName,
        clientInvocation: propertyPath,
        menuName: menuName,
        executeClassWeb: executionPath,
        tableName: tableName,
        interfaceId: props.selected.InterfaceId,
      };

      axios
        .put(SERVER_URL + ENDPOINT_POST_REGISTER_WINDOW, jsonBody)
        .then((res) => {
          props.setIsModalOpen(false);
          props.setaddNew(true);
        });
    }
  };

  const DeleteHandler = () => {
    props.setIsModalOpen(false);
  };

  // Function that is called when Enter key or Esc key is pressed.
  const handleKeyDown = (e) => {
    if (e.keyCode === 13) {
      registerHandler();
    } else if (e.keyCode === 27) {
      props.setIsModalOpen(false);
      e.stopPropagation();
    }
  };

  // Function that runs when the handleKeyDown value changes.
  useEffect(() => {
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);

  return (
    <React.Fragment>
      <div className={styles.mainDiv}>
        <div className={clsx(styles.flexRow, styles.modalHeadingDiv)}>
          <p className={styles.modalHeading}>
            {props.type === "Edit" ? t("editFeature") : t("registerFeature")}
          </p>
          <Close
            tabIndex={0}
            id="pmweb_FeatureModal_CloseModalIcon"
            className={styles.closeIcon}
            onClick={() => props.setIsModalOpen(false)}
            fontSize="small"
            onKeyDown={(e) => {
              if (e.keyCode === 13) {
                props.setIsModalOpen(false);
                e.stopPropagation();
              }
            }}
          />
        </div>
        <Divider className={styles.modalDivider} />
        <div className={styles.modalBodyDiv}>
          <div>
            {/* Added on 7/9/2023 for BUGID: 135911 */}
            <label
              className={styles.labelTittle}
              htmlFor="pmweb_FeatureModal_FeatureName"
            >
              {t("featureName")}
              <span className={styles.markerColor}>*</span>
            </label>
            <input
              className={styles.input}
              value={featureName}
              onChange={(e) => {
                validateData(e, "featureName", ARABIC_REGEX1, ENGLISH_REGEX1);
                featureNameHandler(e);
              }}
              id="pmweb_FeatureModal_FeatureName"
              ref={featureNameRef}
              onKeyPress={(e) =>
                FieldValidations(e, 150, featureNameRef.current, 255)
              }
            />
            {errorStates?.featureName && (
              <ValidationMessageProvider
                fieldName={"featureName"}
                charactersRestricted={`&*|\:"'<>?/`}
                validationType={0}
              />
            )}
          </div>

          <div className={styles.item}>
            {/* Added on 7/9/2023 for BUGID: 135911 */}
            <label
              className={styles.labelTittle}
              htmlFor="pmweb_FeatureModal_PropertyPathInterface"
            >
              {t("propertyInterface")}
              <span className={styles.markerColor}>*</span>
            </label>
            <input
              className={styles.input}
              value={propertyPath}
              onChange={(e) => {
                validateData(
                  e,
                  "propertyHttpPath",
                  ARABIC_REGEX2,
                  ENGLISH_REGEX2
                );
                propertyPathHandler(e);
              }}
              id="pmweb_FeatureModal_PropertyPathInterface"
              ref={propertyInterfaceRef}
              onKeyPress={(e) =>
                FieldValidations(e, 116, propertyInterfaceRef.current, 255)
              }
            />
            {errorStates?.propertyHttpPath && (
              <ValidationMessageProvider
                fieldName={"propertyHttpPathName"}
                charactersRestricted={"~`!@#$%^&*()+={}[]|\";'<>?,"}
                validationType={0}
              />
            )}
          </div>

          <div className={styles.item}>
            {/* Added on 7/9/2023 for BUGID: 135911 */}
            <label
              className={styles.labelTittle}
              htmlFor="pmweb_FeatureModal_TableName"
            >
              {t("tableName")}
              <span className={styles.markerColor}>*</span>
            </label>
            <input
              className={styles.input}
              value={tableName}
              onChange={(e) => {
                validateData(e, "tableName", ARABIC_REGEX3, ENGLISH_REGEX3);
                tableNameHandler(e);
              }}
              id="pmweb_FeatureModal_TableName"
              ref={tableNameRef}
              onKeyPress={(e) =>
                FieldValidations(e, 151, tableNameRef.current, 255)
              }
            />
            {errorStates?.tableName && (
              <ValidationMessageProvider
                fieldName={"tableName"}
                charactersRestricted={`~\`!@#$%^&*()-+={}[]|\:";'<>?,./`}
                validationType={0}
              />
            )}
          </div>

          <div className={styles.item}>
            {/* Added on 7/9/2023 for BUGID: 135911 */}
            <label
              className={styles.labelTittle}
              htmlFor="pmweb_FeatureModal_ExecutionName"
            >
              {t("executionInterfrance")}
              <span className={styles.markerColor}>*</span>
            </label>
            <input
              className={styles.input}
              value={executionPath}
              onChange={(e) => {
                validateData(
                  e,
                  "executionHttpPath",
                  ARABIC_REGEX2,
                  ENGLISH_REGEX2
                );
                executionPathHandler(e);
              }}
              id="pmweb_FeatureModal_ExecutionName"
              ref={executionNameRef}
              onKeyPress={(e) =>
                FieldValidations(e, 116, executionNameRef.current, 255)
              }
            />
            {errorStates?.executionHttpPath && (
              <ValidationMessageProvider
                fieldName={"exeHttpPathName"}
                charactersRestricted={"~`!@#$%^&*()+={}[]|\";'<>?,"}
                validationType={0}
              />
            )}
          </div>

          <div className={styles.item}>
            {/* Added on 7/9/2023 for BUGID: 135911 */}
            <label
              className={styles.labelTittle}
              htmlFor="pmweb_FeatureModal_MenuName"
            >
              {t("menuName")}
              <span className={styles.markerColor}>*</span>
            </label>
            <input
              className={styles.input}
              value={menuName}
              onChange={(e) => {
                validateData(e, "menuName", ARABIC_REGEX4, ENGLISH_REGEX4);
                menuNameHandler(e);
              }}
              id="pmweb_FeatureModal_MenuName"
              ref={menuNameRef}
              onKeyPress={(e) =>
                FieldValidations(e, 150, menuNameRef.current, 50)
              }
            />
            {errorStates?.menuName && (
              <ValidationMessageProvider
                fieldName={"menuName"}
                charactersRestricted={`&*|\:"'<>?/</>`}
                validationType={0}
              />
            )}
          </div>
        </div>
        <div
          className={styles.footerDiv}
          style={{
            padding: direction === RTL_DIRECTION ? "0.5rem 1.2rem" : "0.5rem 0", //Changes made to solve Bug 139415
          }}
        >
          <div className={styles.footer}>
            {props.type == "Edit" ? (
              <button
                tabIndex={0}
                id="pmweb_FeatureModal_DiscardBtn"
                className="cancel"
                onClick={DeleteHandler}
              >
                {t("discard")}
              </button>
            ) : (
              <button
                tabIndex={0}
                id="pmweb_FeatureModal_CancelBtn"
                className="cancel"
                onClick={() => props.setIsModalOpen(false)}
              >
                {t("cancel")}
              </button>
            )}
            {props.type == "Edit" ? (
              <button
                tabIndex={0}
                id="pmweb_FeatureModal_EditBtn"
                className="create"
                onClick={editHandler}
              >
                {t("saveChanges")}
              </button>
            ) : (
              <button
                tabIndex={0}
                id="pmweb_FeatureModal_RegisterBtn"
                className="create"
                onClick={registerHandler}
                name="registerBtn"
                disabled={
                  errorStates.executionHttpPath ||
                  errorStates.featureName ||
                  errorStates.menuName ||
                  errorStates.propertyHttpPath ||
                  errorStates.tableName
                }
              >
                {t("register")}
              </button>
            )}
          </div>
        </div>
      </div>
    </React.Fragment>
  );
}

export default FeatureModal;
