// Changes made to solve 111172 - Trigger Type: Title is incorrect, it should be Execution Http Path instead of Invalid Execution Http Path
import React, { useState, useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";
import styles from "./index.module.css";
import { InputBase, Tooltip } from "@material-ui/core";
import { useDispatch, useSelector } from "react-redux";
import {
  APP_HEADER_HEIGHT,
  ENDPOINT_GET_REGISTER_TRIGGER,
  SERVER_URL,
  SPACE,
} from "../../../Constants/appConstants";
import cancelIcon from "../../../assets/abstractView/RedDelete.svg";
import axios from "axios";
import { setToastDataFunc } from "../../../redux-store/slices/ToastDataHandlerSlice";
import { REGEX, validateRegex } from "../../../validators/validator";
import clsx from "clsx";
import { FieldValidations } from "../../../utility/FieldValidations/fieldValidations";
import EmptyStateIcon from "../../../assets/ProcessView/EmptyState.svg";
import {
  isArabicLocaleSelected,
  isProcessDeployedFunc,
  restrictSpecialCharacter,
} from "../../../utility/CommonFunctionCall/CommonFunctionCall";
import { store, useGlobalState } from "state-pool";
import { EditIcon } from "../../../utility/AllImages/AllImages";

function TriggerType(props) {
  let { t } = useTranslation();
  const [allTrigers, setallTrigers] = useState([]);
  const [edited, setedited] = useState(null);
  const [registerNewBtn, setRegisterNewBtn] = useState(false);
  const [registerBtn, setRegisterBtn] = useState(false);
  const [data, setdata] = useState({
    triggerTypeName: "",
    triggerPropertyPath: "",
    triggerExecutionPath: "",
    tableNames: "",
  });
  const [originalData, setoriginalData] = useState([]);
  const dispatch = useDispatch();
  const [error, setError] = useState({});
  const fieldTypeRef = useRef();
  const propertyPathRef = useRef();
  const executionPathRef = useRef();
  const triggerTableNameRef = useRef();
  const windowInnerHeight = useSelector(
    (state) => state.setWindowInnerHeight.windowInnerHeight
  );
  const loadedProcessData = store.getState("loadedProcessData");
  const [localLoadedProcessData] = useGlobalState(loadedProcessData);
  let { isReadOnly } = props;
  isReadOnly = isReadOnly || isProcessDeployedFunc(localLoadedProcessData);

  const registerNewLocalHandler = () => {
    setRegisterBtn(true);
    //Hide RegisterNew Button
    setRegisterNewBtn(false);
  };

  //code updated on 28 Feb 2023 for BugId 110823
  const registerNew = () => {
    let isMandatoryFilled = false,
      error = {},
      otherError = false;
    // added on 10/10/23 for BugId 139253
    if (!data.triggerTypeName || data.triggerTypeName?.trim() === "") {
      isMandatoryFilled = true;
      error = { ...error, triggerTypeName: true };
    }
    if (!data.triggerPropertyPath || data.triggerPropertyPath?.trim() === "") {
      isMandatoryFilled = true;
      error = { ...error, triggerPropertyPath: true };
    }
    if (
      !data.triggerExecutionPath ||
      data.triggerExecutionPath?.trim() === ""
    ) {
      isMandatoryFilled = true;
      error = { ...error, triggerExecutionPath: true };
    }
    if (!data.tableNames || data.tableNames?.trim() === "") {
      isMandatoryFilled = true;
      error = { ...error, tableNames: true };
    }
    if (isMandatoryFilled) {
      dispatch(
        setToastDataFunc({
          message: t("mandatoryErrorStatement"),
          severity: "error",
          open: true,
        })
      );
    } else {
      if (!validatePaths(data.triggerPropertyPath)) {
        otherError = true;
        dispatch(
          setToastDataFunc({
            message: t("propertyPathError"),
            severity: "error",
            open: true,
          })
        );
      } else if (!validatePaths(data.triggerExecutionPath)) {
        otherError = true;
        dispatch(
          setToastDataFunc({
            message: t("executionHttpPath"),
            severity: "error",
            open: true,
          })
        );
      } else if (!validateRegex(data.tableNames, REGEX.AlphaNumUsDashSpace)) {
        otherError = true;
        dispatch(
          setToastDataFunc({
            message: t("onlyUnderscoreIsAllowedInTableName"),
            severity: "error",
            open: true,
          })
        );
      }
    }

    let isExist = false;
    for (let index in allTrigers) {
      if (allTrigers[index].triggerTypeName === data.triggerTypeName) {
        isExist = true;
        break;
      }
    }
    if (isExist) {
      dispatch(
        setToastDataFunc({
          message: t("triggerName") + SPACE + t("alreadyExist"),
          severity: "error",
          open: true,
        })
      );
    }

    // added on 10/10/23 for BugId 139253
    if (Object.keys(error)?.length === 0 && !isExist && !otherError) {
      let jsonBody = {
        triggerTypeName: data.triggerTypeName,
        triggerPropertyPath: data.triggerPropertyPath,
        triggerExecutionPath: data.triggerExecutionPath,
        tableNames: data.tableNames,
      };
      axios
        .post(SERVER_URL + ENDPOINT_GET_REGISTER_TRIGGER, jsonBody)
        .then((res) => {
          if (res.status === 200) {
            let temp = [...allTrigers];
            temp.push(jsonBody);
            setallTrigers(temp);
            setoriginalData(temp);
            setdata({
              triggerTypeName: "",
              triggerPropertyPath: "",
              triggerExecutionPath: "",
              tableNames: "",
            });
            setRegisterBtn(false);

            //Showing RegisterNew Button
            setRegisterNewBtn(true);
          }
        });
    } else {
      setError(error);
    }
  };

  const cancelHandler = () => {
    setRegisterBtn(false);
    setRegisterNewBtn(true);
    setdata({
      triggerTypeName: "",
      triggerPropertyPath: "",
      triggerExecutionPath: "",
      tableNames: "",
    });
  };

  useEffect(() => {
    axios
      .get(SERVER_URL + ENDPOINT_GET_REGISTER_TRIGGER)
      .then((res) => {
        if (res.status === 204) {
          setallTrigers([]);
          setoriginalData([]);
        } else {
          setallTrigers(res.data);
          setoriginalData(res.data);
        }
      })
      .catch(() => console.log("error"));

    //Showing the RegisterNew Button
    setRegisterNewBtn(true);
  }, []);

  const validateSpecialCharacter = (value, type, fname) => {
    let obj = { msg: "", isValid: true };
    // if(type=="triggerExecutionPath"){
    //   let regex = new RegExp("^(https?|ftp):\/\/[^\s/$.?#].[^\s]*$");
    //     obj.isValid = regex.test(value);
    //     obj.msg =  t("executionHttpPath");
    // }
    // else if (type=="triggerPropertyPath"){
    //   let regex = new RegExp("^(https?|ftp):\/\/[^\s/$.?#].[^\s]*$");
    //   obj.isValid = regex.test(value);
    //   obj.msg =  t("propertyPathError");
    // }
    let restrictChars = ``;
    if (isArabicLocaleSelected()) {
      if (type === 116) {
        restrictChars = ~`!@#$%^&*()+={}[]|";'<>?,`;
        obj.isValid = restrictSpecialCharacter(
          value,
          "[~`!@#$%^&*()+={}\\[\\]|\";'<>?,]+"
        );
        obj.msg = `${t(fname)}${SPACE}${t(
          "cannotContain"
        )}${SPACE}${restrictChars}${SPACE}${t("charactersInIt")}`;
      }
      if (type === 150) {
        restrictChars = `&*|\\:"'<>?/`;
        obj.isValid = restrictSpecialCharacter(value, "[&*|\\\\:'\"<>?//]+");
        obj.msg = `${t(fname)}${SPACE}${t(
          "cannotContain"
        )}${SPACE}${restrictChars}${SPACE}${t("charactersInIt")}`;
      }

      if (type === 151) {
        restrictChars = `~!@#$%^&*()-+={}[]|\\:";'<>?,./`;
        obj.isValid = restrictSpecialCharacter(
          value,
          "[~`!@#$%^&*()\\-+={}\\[\\]|\\\\:\";'<>?,.//]+"
        );
        obj.msg = `${t(fname)}${SPACE}${t(
          "cannotContain"
        )}${SPACE}${restrictChars}${SPACE}${t("charactersInIt")}`;
      }
    } else {
      if (type === 116) {
        let regex = new RegExp("^[A-Za-z][\\w-:.\\\\/]*$");
        obj.isValid = regex.test(value);
        obj.msg = `${t(
          "AllCharactersAreAllowedExcept"
        )}${SPACE}_-.:,\\/${SPACE}${t(
          "AndFirstCharacterShouldBeAlphanumeric"
        )}`;
      }
      if (type === 150) {
        let regex = new RegExp(/^[A-Za-z][^\\\/\:\*\?\"\<\>\|\'\&]*$/gm);
        obj.isValid = regex.test(value);
        obj.msg = `${t(
          "AllCharactersAreAllowedExcept"
        )}${SPACE}/\:*?"<>|&'#+,.${SPACE}${t(
          "AndFirstCharacterShouldBeAlphabet"
        )}`;
      }
      if (type === 151) {
        var regex = /^[a-zA-Z\d\_]+$/i;
        obj.isValid = regex.test(value);
        obj.msg = `${t("usernameErrorMsg")}${SPACE}${t(
          "AndFirstCharacterShouldBeAlphanumeric"
        )}`;
      }
    }
    return obj;
  };

  // Changes made to solve Bug 139368
  const validatePaths = (value, type) => {
    let regex = new RegExp("^(https?|ftp)://[^\\s/$.?#].[^\\s]*$");
    return regex.test(value);
  };

  const onDataChange = (e, type, fname) => {
    let errorObj = { ...error };
    // added on 10/10/23 for BugId 139253
    if (!e.target.value || e.target.value?.trim() === "") {
      errorObj = { ...errorObj, [e.target.name]: true };
    } else {
      let validObj = "";
      validObj = validateSpecialCharacter(e.target.value, type, fname);
      if (!validObj.isValid && e.target.value.length > 0) {
        errorObj = { ...errorObj, [e.target.name]: true };
        dispatch(
          setToastDataFunc({
            message: validObj.msg,
            severity: "error",
            open: true,
          })
        );
      } else {
        delete errorObj[e.target.name];
      }
    }
    setdata({ ...data, [e.target.name]: e.target.value });
    setError(errorObj);
  };

  const editDataHandler = (index, e, type, fname) => {
    let errorObj = { ...error };
    // added on 10/10/23 for BugId 139253
    if (!e.target.value || e.target.value?.trim() === "") {
      errorObj = { ...errorObj, [e.target.name]: true };
    } else {
      let validObj = "";
      validObj = validateSpecialCharacter(e.target.value, type, fname);
      if (!validObj.isValid && e.target.value.length > 0) {
        errorObj = { ...errorObj, [e.target.name]: true };
        dispatch(
          setToastDataFunc({
            message: validObj.msg,
            severity: "error",
            open: true,
          })
        );
      } else {
        delete errorObj[e.target.name];
      }
    }
    let temp = JSON.parse(JSON.stringify(allTrigers));
    temp[index][e.target.name] = e.target.value;
    setallTrigers(temp);
    setError(errorObj);
  };

  const cancelChanges = (index) => {
    let temp = JSON.parse(JSON.stringify(allTrigers));
    temp[index] = JSON.parse(JSON.stringify(originalData[index]));
    setallTrigers(temp);
    setedited(null);
  };

  const saveChanges = (index) => {
    let isMandatoryFilled = false,
      error = {},
      otherError = false;
    // added on 10/10/23 for BugId 139253
    if (
      !allTrigers[index].triggerTypeName ||
      allTrigers[index].triggerTypeName?.trim() === ""
    ) {
      isMandatoryFilled = true;
      error = { ...error, triggerTypeName: true };
    }
    if (
      !allTrigers[index].triggerPropertyPath ||
      allTrigers[index].triggerPropertyPath?.trim() === ""
    ) {
      isMandatoryFilled = true;
      error = { ...error, triggerPropertyPath: true };
    }
    if (
      !allTrigers[index].triggerExecutionPath ||
      allTrigers[index].triggerExecutionPath?.trim() === ""
    ) {
      isMandatoryFilled = true;
      error = { ...error, triggerExecutionPath: true };
    }
    if (
      !allTrigers[index].tableNames ||
      allTrigers[index].tableNames?.trim() === ""
    ) {
      isMandatoryFilled = true;
      error = { ...error, tableNames: true };
    }
    if (isMandatoryFilled) {
      dispatch(
        setToastDataFunc({
          message: t("mandatoryErrorStatement"),
          severity: "error",
          open: true,
        })
      );
    } else {
      if (
        allTrigers[index].triggerPropertyPath &&
        !validatePaths(
          allTrigers[index].triggerPropertyPath,
          "propertyPathError"
        )
      ) {
        otherError = true;
        dispatch(
          setToastDataFunc({
            message: t("propertyPathError"),
            severity: "error",
            open: true,
          })
        );
      } else if (
        allTrigers[index].triggerExecutionPath &&
        !validatePaths(
          allTrigers[index].triggerExecutionPath,
          "executionHttpPath"
        )
      ) {
        otherError = true;
        dispatch(
          setToastDataFunc({
            message: t("executionHttpPath"),
            severity: "error",
            open: true,
          })
        );
      } else if (
        !validateRegex(allTrigers[index].tableNames, REGEX.AlphaNumUsDashSpace)
      ) {
        otherError = true;
        dispatch(
          setToastDataFunc({
            message: t("onlyUnderscoreIsAllowedInTableName"),
            severity: "error",
            open: true,
          })
        );
      }
    }
    // added on 10/10/23 for BugId 139253
    if (Object.keys(error)?.length === 0 && !otherError) {
      // Changes made to solve Bug 136163, Bug 139367, Bug 139368
      let jsonBody = {
        triggerTypeName: allTrigers[index].triggerTypeName,
        triggerPropertyPath: allTrigers[index].triggerPropertyPath,
        triggerExecutionPath: allTrigers[index].triggerExecutionPath,
        tableNames: allTrigers[index].tableNames,
      };
      axios
        .put(SERVER_URL + ENDPOINT_GET_REGISTER_TRIGGER, jsonBody)
        .then((res) => {
          if (res.status === 200) {
            setedited(null);
          }
        });
    } else {
      setError(error);
    }
  };

  const deleteHandler = (deletedTriggerName) => {
    let json = {
      triggerTypeName: deletedTriggerName,
    };
    axios
      .delete(SERVER_URL + ENDPOINT_GET_REGISTER_TRIGGER, {
        data: json,
        headers: { "Content-Type": "application/json" },
      })
      .then((res) => {
        if (res.status === 200) {
          let temp = JSON.parse(JSON.stringify(allTrigers));
          let deletedIndex = "";
          temp.forEach((element, index) => {
            if (element.triggerTypeName === deletedTriggerName) {
              deletedIndex = index;
            }
          });
          temp.splice(deletedIndex, 1);
          setallTrigers(temp);
        }
      });
  };

  return (
    /*Bug 117802 :[14-02-2023] Updated the screen */
    <div
      className={styles.mainDiv}
      style={{
        // changes added for bug_id: 134226
        height: `calc(${windowInnerHeight}px - ${APP_HEADER_HEIGHT} - 8rem)`,
        overflowY: "auto"
      }}
    >
      <div>
        <p className={styles.mainHeading}>{t("triggerTypes")}</p>
        <p className={styles.subheader}>{t("listOfTrigger")}</p>
      </div>
      <div className={styles.tableHeadingBar}>
        <div className={styles.gridContainer}>
          <p className={styles.tableHeaders}>{t("triggerType")}</p>
          <p className={styles.tableHeaders}>{t("propertyHttpPath")}</p>
          <p className={styles.tableHeaders}>{t("exeHttpPath")}</p>
          <p className={styles.tableHeaders}>{t("tableName")}</p>
          {registerNewBtn && !isReadOnly && (
            <p className={styles.flexRow}>
              <button
                id="pmweb_TriggerType_AddRegisterStripBtn"
                className={styles.registerNewButton}
                onClick={registerNewLocalHandler}
              >
                {t("registerNew")}
              </button>
            </p>
          )}
        </div>
      </div>
      {registerBtn && (
        <div className={clsx(styles.rowDiv, styles.newItemDiv)}>
          <div className={styles.gridContainer}>
            <React.Fragment>
              <InputBase
                id="pmweb_TriggerType_TriggerTypeName"
                inputProps={{
                  "aria-label": "Trigger type",
                }}
                className={styles.gridItem}
                variant="outlined"
                style={{
                  border: error?.triggerTypeName
                    ? "1px solid #b52a2a"
                    : "1px solid #c4c4c4",
                }}
                value={data?.triggerTypeName}
                name="triggerTypeName"
                onChange={(e) => {
                  onDataChange(e, 150, "triggerType");
                }}
                inputRef={fieldTypeRef}
                onKeyPress={(e) =>
                  FieldValidations(e, 150, fieldTypeRef.current, 50)
                }
              />
              <InputBase
                id="pmweb_TriggerType_PropertyPath"
                inputProps={{
                  "aria-label": "Property HTTP Path",
                }}
                className={styles.gridItem}
                variant="outlined"
                style={{
                  border: error?.triggerPropertyPath
                    ? "1px solid #b52a2a"
                    : "1px solid #c4c4c4",
                }}
                value={data?.triggerPropertyPath}
                name="triggerPropertyPath"
                onChange={(e) => {
                  onDataChange(e, 116, "propertyHttpPath");
                }}
                //onChange={onDataChange}
                inputRef={propertyPathRef}
                onKeyPress={(e) =>
                  FieldValidations(e, 116, propertyPathRef.current, 255)
                }
              />
              <InputBase
                id="pmweb_TriggerType_ExecutionPath"
                inputProps={{
                  "aria-label": "Execution HTTP Path",
                }}
                className={styles.gridItem}
                variant="outlined"
                style={{
                  border: error?.triggerExecutionPath
                    ? "1px solid #b52a2a"
                    : "1px solid #c4c4c4",
                }}
                value={data?.triggerExecutionPath}
                name="triggerExecutionPath"
                onChange={(e) => {
                  onDataChange(e, 116, "exeHttpPath");
                }}
                //onChange={onDataChange}
                inputRef={executionPathRef}
                onKeyPress={(e) =>
                  FieldValidations(e, 116, executionPathRef.current, 255)
                }
              />
              <InputBase
                id="pmweb_TriggerType_TableName"
                inputProps={{
                  "aria-label": "Table Name",
                }}
                className={styles.gridItem}
                variant="outlined"
                style={{
                  border: error?.tableNames
                    ? "1px solid #b52a2a"
                    : "1px solid #c4c4c4",
                }}
                value={data?.tableNames}
                name="tableNames"
                onChange={(e) => {
                  onDataChange(e, 151, "tableName");
                }}
                inputRef={triggerTableNameRef}
                onKeyPress={(e) =>
                  FieldValidations(e, 151, triggerTableNameRef.current, 255)
                }
              />
              <div className={styles.flexRow}>
                <button
                  id="pmweb_TriggerType_CancelBtn"
                  className={styles.cancelButton}
                  onClick={cancelHandler}
                >
                  {t("cancel")}
                </button>
                <button
                  id="pmweb_TriggerType_RegisterTriggerBtn"
                  className={styles.registerNewButton}
                  onClick={registerNew}
                  disabled={Object.keys(error)?.length > 0}
                >
                  {t("register")}
                </button>
              </div>
            </React.Fragment>
          </div>
        </div>
      )}
      {allTrigers && allTrigers.length === 0 && !registerBtn ? (
        <div className={styles.emptyStateMainDiv}>
          <img
            className={styles.emptyStateImage}
            src={EmptyStateIcon}
            alt={t("emptyState")}
          />
          {!isReadOnly ? (
            <p className={styles.emptyStateHeading}>
              {t("registerTriggerType")}
            </p>
          ) : null}
          <p className={styles.emptyStateText}>
            {t("noTriggerTypeCreated")}
            {!isReadOnly ? t("createTriggerTypeUsingTable") : "."}
          </p>
        </div>
      ) : (
        <>
          {allTrigers?.map((val, index) => {
            return (
              <div className={styles.rowDiv}>
                <div className={styles.gridContainer}>
                  <InputBase
                    id={`pmweb_TriggerType_TriggerTypeNameData${index}`}
                    inputProps={{
                      "aria-label": "Trigger Type",
                    }}
                    disabled={val.triggerTypeName ? true : false}
                    style={{
                      border: val.triggerTypeName ? "0" : "1px solid #c4c4c4",
                    }}
                    className={styles.gridItem}
                    variant="outlined"
                    name="triggerTypeName"
                    value={val.triggerTypeName}
                    onChange={(e) => {
                      editDataHandler(index, e);
                      setedited(index);
                    }}
                  />
                  <InputBase
                    id={`pmweb_TriggerType_PropertyPathData${index}`}
                    inputProps={{
                      "aria-label": "Property HTTP Path",
                    }}
                    className={styles.gridItem}
                    style={{
                      border: error?.triggerPropertyPath
                        ? "1px solid #b52a2a"
                        : "1px solid #c4c4c4",
                    }}
                    variant="outlined"
                    value={val.triggerPropertyPath}
                    name="triggerPropertyPath"
                    onChange={(e) => {
                      editDataHandler(index, e, "triggerPropertyPath", "none");
                      setedited(index);
                    }}
                  />
                  <InputBase
                    id={`pmweb_TriggerType_ExecutionPathData${index}`}
                    inputProps={{
                      "aria-label": "Execution HTTP Path",
                    }}
                    className={styles.gridItem}
                    style={{
                      border: error?.triggerExecutionPath
                        ? "1px solid #b52a2a"
                        : "1px solid #c4c4c4",
                    }}
                    variant="outlined"
                    value={val.triggerExecutionPath}
                    name="triggerExecutionPath"
                    onChange={(e) => {
                      editDataHandler(index, e, "triggerExecutionPath", "none");
                      setedited(index);
                    }}
                  />
                  <InputBase
                    id={`pmweb_TriggerType_TableNameData${index}`}
                    inputProps={{
                      "aria-label": "Table Name",
                    }}
                    style={{
                      border: error?.tableNames
                        ? "1px solid #b52a2a"
                        : "1px solid #c4c4c4",
                    }}
                    className={styles.gridItem}
                    variant="outlined"
                    value={val.tableNames}
                    name="tableNames"
                    onChange={(e) => {
                      editDataHandler(index, e);
                      setedited(index);
                    }}
                  />
                  <div>
                    {edited === index ? (
                      <div className={styles.flexRow}>
                        <button
                          id={`pmweb_TriggerType_CancelChangesBtn${index}`}
                          className={styles.cancelButton}
                          onClick={() => cancelChanges(index)}
                        >
                          {t("cancel")}
                        </button>
                        <button
                          id={`pmweb_TriggerType_SaveChangesBtn${index}`}
                          className={styles.registerNewButton}
                          onClick={() => saveChanges(index)}
                        >
                          {t("save")}
                        </button>
                      </div>
                    ) : (
                      <div className={styles.flexRow}>
                        {/*  <img
                        src={cancelIcon}
                        onClick={() => deleteHandler(val.triggerTypeName)}
                        className={styles.stopTriggerIcon}
                      /> */}
                        {
                          //code updated on 20 Feb 2023 for BugId 120108
                        }
                        {!isReadOnly && (
                          <Tooltip title="Edit" arrow>
                            <EditIcon
                              id={`pmweb_TriggerType_DeleteTriggerTypeIcon${index}`}
                              onClick={() => {
                                setedited(index);
                                document
                                  .getElementById(
                                    `pmweb_TriggerType_PropertyPathData${index}`
                                  )
                                  .focus();
                              }}
                              className={styles.stopTriggerIcon}
                            />
                          </Tooltip>
                        )}
                        {!isReadOnly && (
                          <Tooltip title="Delete" arrow>
                            <img
                              id={`pmweb_TriggerType_DeleteTriggerTypeIcon${index}`}
                              src={cancelIcon}
                              onClick={() => deleteHandler(val.triggerTypeName)}
                              className={styles.stopTriggerIcon}
                              title={t("delete")}
                              alt={t("DELETE")}
                            />
                          </Tooltip>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </>
      )}
    </div>
  );
}

export default TriggerType;
