// #BugID - 115465 112538
// #BugDescription - the deletion of constants already handled.
// #BugID - 112538
// #BugDescription - Feature has been removed. No need of it now
import React, { useState, useEffect, useRef } from "react";
import styles from "./index.module.css";
import arabicStyles from "./ArabicStyles.module.css";
import {
  SERVER_URL,
  ENDPOINT_ADD_CONSTANT,
  ENDPOINT_MODIFY_CONSTANT,
  ENDPOINT_REMOVE_CONSTANT,
  RTL_DIRECTION,
  PROCESSTYPE_REGISTERED,
  SPACE,
} from "../../../Constants/appConstants";
import axios from "axios";
import { LatestVersionOfProcess } from "../../../utility/abstarctView/checkLatestVersion";
import { useTranslation } from "react-i18next";
import { Icon, InputBase, Tooltip, useMediaQuery } from "@material-ui/core";
import DeleteOutlinedIcon from "@material-ui/icons/DeleteOutlined";
import CircularProgress from "@material-ui/core/CircularProgress";
import EmptyStateIcon from "../../../assets/ProcessView/EmptyState.svg";
import { useGlobalState } from "state-pool";
import EditIcon from "@material-ui/icons/Edit";
import { FieldValidations } from "../../../utility/FieldValidations/fieldValidations";
import { setToastDataFunc } from "../../../redux-store/slices/ToastDataHandlerSlice";
import ConstantsIcon from "../../../assets/DataModalIcons/DML_Constant.png";
import { useDispatch } from "react-redux";
import clsx from "clsx";
import { truncateString } from "../../../utility/CommonFunctionCall/CommonFunctionCall";
import { IconButton } from "@mui/material";
import { LightTooltip } from "../../../UI/StyledTooltip";

function DefinedConstants(props) {
  let { t } = useTranslation();
  const dispatch = useDispatch();
  const direction = `${t("HTML_DIR")}`;
  const { openProcessID, openProcessType, isReadOnly } = props;
  const [loadedProcessData, setLoadedProcessData] =
    useGlobalState("loadedProcessData");
  const [isLoading, setIsLoading] = useState(true);
  const [constantName, setConstantName] = useState("");
  const [defaultValue, setDefaultValue] = useState("");
  const [constantsArray, setConstantsArray] = useState([]);
  const [errorMsg, setErrorMsg] = useState("");
  const [errorMsgdefault, setErrorMsgDefault] = useState("");
  const [isProcessReadOnly, setIsProcessReadOnly] = useState(
    isReadOnly || false
  );
  const constantNameRef = useRef();
  const constantValueRef = useRef();
  const tabLandscape = useMediaQuery(
    "(min-width: 999px) and (max-width: 1280px)"
  );

  // Function that runs when the component mounts.
  useEffect(() => {
    if (
      openProcessType === PROCESSTYPE_REGISTERED ||
      openProcessType === "RC" ||
      LatestVersionOfProcess(loadedProcessData?.Versions) !==
        +loadedProcessData?.VersionNo
    ) {
      setIsProcessReadOnly(true);
    }
    if (loadedProcessData) {
      let modifiedConstant = loadedProcessData?.DynamicConstant?.map(
        (constant) => {
          return { isEditable: false, ...constant };
        }
      );
      if (
        !(constantsArray && constantsArray[0]?.hasOwnProperty("isEditable"))
      ) {
        setConstantsArray(modifiedConstant);
      }
      setIsLoading(false);
    }
  }, [openProcessType, loadedProcessData?.DynamicConstant]);

  // Function that handles the input given by the user for constant name.
  const handleConstantName = (event) => {
    //Modified on 05/09/2023, bug_id:135644
    if (event.target.value.length > 50) {
      setErrorMsg(`${t("max50CharAllowed")}`);
    } else {
      setErrorMsg("");
      validateData(event, t("constantName")); //Added on 4/9/2023 for bugID: 131266
      setConstantName(event.target.value);
    }
    //till here for bug_id:135644

    //Modified on 17/09/2023, bug_id:135653
    //validateData(event, t("constantName")); //Added on 4/9/2023 for bugID: 131266
    //setConstantName(event.target.value);
    //till here for bug_id:135653
  };

  // Function that handles the input given by the user for default name.
  const handleDefaultValue = (event) => {
    // Modified on 05-09-23 for Bug 135404
    // Modified on 05/09/2023, bug_id:135644
    // if (event.target.value.length > 255) {
    //   setErrorMsgDefault(`${t("defaultValue")}${SPACE}${t("lengthValString")}`);
    // } else {
    setErrorMsgDefault("");
    validateDatainDefaultValue(event, t("defaultValue")); //Added on 4/9/2023 for bugID: 131266
    setDefaultValue(truncateString(event?.target?.value, 255));
    // }
    // till here for Bug 135404.
    //till here for bug_id:135644

    /*  validateDatainDefaultValue(event, t("defaultValue")); //Added on 4/9/2023 for bugID: 131266
      setDefaultValue(event.target.value); */
  };

  // Function to check if the constant being made already exists or not.
  const isConstantAlreadyPresent = (constName) => {
    let isConstPresent = false;
    constantsArray?.forEach((element) => {
      if (element.ConstantName?.toLowerCase() === constName?.toLowerCase()) {
        isConstPresent = true;
      }
    });
    return isConstPresent;
  };

  // Function that runs when the user clicks on the create constant button.
  const handleCreateConstant = async () => {
    if (!isConstantAlreadyPresent(`CONST_${constantName?.trim()}`)) {
      const newConstantObject = {
        DefaultValue: defaultValue.trim(),
        ConstantName: `CONST_${constantName.trim()}`,
      };
      const changedObject = {
        processDefId: openProcessID,
        constantName: `CONST_${constantName.trim()}`,
        constantValue: defaultValue.trim(),
      };
      const response = await handleConstantApiCall(
        changedObject,
        ENDPOINT_ADD_CONSTANT
      );
      if (response?.data?.Status === 0) {
        setConstantsArray((prevState) => {
          let temp = [...prevState];
          temp?.splice(0, 0, newConstantObject);
          return temp;
        });
        let temp = JSON.parse(JSON.stringify(loadedProcessData));
        temp?.DynamicConstant?.splice(0, 0, newConstantObject);
        setLoadedProcessData(temp);
        setConstantName("");
        setDefaultValue("");
        dispatch(
          setToastDataFunc({
            message: t("constantAddedSuccessMsg"),
            severity: "success",
            open: true,
          })
        );
      }
    } else {
      //Changes made to solve Bug 121533
      dispatch(
        setToastDataFunc({
          message: t("dataModalConstantAlreadyExists"),
          severity: "error",
          open: true,
        })
      );
    }
  };

  // Function that runs when the user deletes a constant.
  const handleConstantDelete = async (index) => {
    let removedConstant;
    constantsArray?.forEach((element, ind) => {
      if (ind === index) {
        removedConstant = element;
      }
    });
    const changedObject = {
      processDefId: openProcessID,
      constantName: removedConstant?.ConstantName,
    };
    const response = await handleConstantApiCall(
      changedObject,
      ENDPOINT_REMOVE_CONSTANT
    );
    if (response?.data?.Status === 0) {
      setConstantsArray((prevState) => {
        let temp = [...prevState];
        [removedConstant] = temp?.splice(index, 1);
        return temp;
      });
      let temp = { ...loadedProcessData };
      temp?.DynamicConstant?.splice(index, 1);

      setLoadedProcessData(temp);
      dispatch(
        setToastDataFunc({
          message: t("constantDeleteSuccessMsg"),
          severity: "success",
          open: true,
        })
      );
    }
  };

  // Function that runs when the user changes the default value of an existing constant.
  const handleDefaultValueChange = (event, index) => {
    // Modified on 05-09-23 for Bug 135404
    setConstantsArray((prevState) => {
      let temp = [...prevState];
      temp[index].DefaultValue = truncateString(event?.target?.value, 255);
      return temp;
    });
    // Till here for Bug 135404.
  };

  // Function that checks if default value has been changed for a particular constant or not and does the API call accordingly.
  // const checkDefaultValueChange = (event, index) => {
  //   if (previousDefaultValue !== event.target.value) {
  //     const changedObject = {
  //       processDefId: openProcessID,
  //       constantName: constantsArray[index].ConstantName,
  //       constantValue: event.target.value.trim(),
  //     };
  //     let temp = { ...loadedProcessData };
  //     temp.DynamicConstant[index].DefaultValue = event.target.value;
  //     setLoadedProcessData(temp);
  //     handleConstantApiCall(changedObject, ENDPOINT_MODIFY_CONSTANT);
  //   }
  // };

  // Function that handles add, modify and delete api calls.
  const handleConstantApiCall = async (object, url) => {
    return await axios
      .post(SERVER_URL + url, object)
      .then()
      .catch((err) => console.log(err));
  };

  // Function that is called when user clicks on edit icon for any constant.
  const editConstData = (data) => {
    let temp = global.structuredClone(constantsArray);
    temp.forEach((cData) => {
      if (cData.ConstantName === data.ConstantName) {
        cData.isEditable = true;
      }
    });
    setConstantsArray(temp);
  };

  const modifyConstantHandler = async (data) => {
    const res = await axios.post(SERVER_URL + ENDPOINT_MODIFY_CONSTANT, {
      processDefId: +loadedProcessData.ProcessDefId,
      constantName: data.ConstantName,
      constantValue: data.DefaultValue,
    });
    if (res?.status === 200) {
      let temp = global.structuredClone(constantsArray);
      temp.forEach((cData) => {
        if (cData.ConstantName === data.ConstantName) {
          cData.isEditable = false;
        }
      });
      let tempProcessData = global.structuredClone(loadedProcessData);
      tempProcessData.DynamicConstant.forEach((cData) => {
        if (cData.ConstantName === data.ConstantName) {
          cData.DefaultValue = data.DefaultValue;
        }
      });
      setLoadedProcessData(tempProcessData);
      setConstantsArray([...temp]);
      dispatch(
        setToastDataFunc({
          message: t("constantModifiedSuccessMsg"),
          severity: "success",
          open: true,
        })
      );
    }
  };

  // Function that gets called when the user clicks on cancel button after clicking on edit icon.
  const cancelHandler = (data) => {
    let originalDefValue;
    let originalData = JSON.parse(
      JSON.stringify(loadedProcessData.DynamicConstant)
    );
    originalData.forEach((element) => {
      if (element.ConstantName === data.ConstantName) {
        originalDefValue = element.DefaultValue;
      }
    });
    let tempArr = JSON.parse(JSON.stringify(constantsArray));
    tempArr?.forEach((element) => {
      if (element.ConstantName === data.ConstantName) {
        element.isEditable = false;
        element.DefaultValue = originalDefValue;
      }
    });
    setConstantsArray(tempArr);
  };

  //Added on 4/9/2023 for bugID: 131266
  const containsSpecialChars = (str) => {
    var regex = new RegExp("^[^#&*+|\\\\:'\"<>?/]+$");
    return regex.test(str);
  };

  const validateData = (e, val) => {
    if (!containsSpecialChars(e.target.value)) {
      setErrorMsg(
        `${val}${SPACE}${t("cannotContain")}${SPACE}#&*+|\:'"<>?/${SPACE}${t(
          "charactersInIt"
        )}`
      );
    } else {
      setErrorMsg("");
    }
    if (e.target.value == "") {
      setErrorMsg(false);
    }
  };
  //Added on 4/9/2023 for bugID: 131266
  const containsSpecialCharsinDefaultValue = (str) => {
    var regex = new RegExp("^[^<>]+$");
    return regex.test(str);
  };
  const validateDatainDefaultValue = (e, val) => {
    if (!containsSpecialCharsinDefaultValue(e.target.value)) {
      setErrorMsgDefault(
        `${val}${SPACE}${t("cannotContain")}${SPACE}#&*+|\:'"<>?/${SPACE}${t(
          "charactersInIt"
        )}`
      );
    } else {
      setErrorMsgDefault("");
    }
    if (e.target.value == "") {
      setErrorMsgDefault(false);
    }
  };

  if (isLoading) {
    return <CircularProgress className="circular-progress" />;
  } else
    return (
      <div
        className={
          direction === RTL_DIRECTION ? arabicStyles.mainDiv : styles.mainDiv
        }
      >
        <div
          className={
            direction === RTL_DIRECTION
              ? clsx(arabicStyles.headingsDiv, styles.flexRow)
              : clsx(styles.headingsDiv, styles.flexRow)
          }
        >
          <div style={{ display: "flex", marginTop: "1px" }}>
            <img
              style={{ height: "100%", width: "100%" }}
              src={ConstantsIcon}
              alt={t("constants")}
            />
          </div>
          <p
            className={
              direction === RTL_DIRECTION
                ? arabicStyles.constantHeading
                : styles.constantHeading
            }
          >
            {t("constants")}
            {SPACE}
          </p>
          <p
            className={styles.countInHeading}
          >{`(${loadedProcessData?.DynamicConstant?.length})`}</p>
          {/* <button
            id="constants_audit_history_button"
            className={
              direction === RTL_DIRECTION
                ? arabicStyles.auditHistoryButton
                : styles.auditHistoryButton
            }
          >
            <div className={styles.buttonContent}>
              <DescriptionOutlinedIcon
                className={styles.auditButtonLogo}
                fontSize="small"
              />
              <p className={styles.auditButtonText}>{t("auditHistory")}</p>
            </div>
          </button>
          <div className={styles.moreOptionsIcon}>
            <MoreHorizOutlinedIcon id="constants_more_options" />
          </div> */}
        </div>
        <div
          className={
            direction === RTL_DIRECTION
              ? arabicStyles.subHeadingDiv
              : styles.subHeadingDiv
          }
        >
          {/* <Checkbox
            className={
              direction === RTL_DIRECTION
                ? arabicStyles.mainCheckBox
                : styles.mainCheckBox
            }
            checked={false}
            size="small"
          /> */}
          <p
            className={
              direction === RTL_DIRECTION
                ? arabicStyles.constantName
                : styles.constantName
            }
          >
            {t("constantName")}
          </p>
          <p
            className={
              direction === RTL_DIRECTION
                ? arabicStyles.defaultValue
                : styles.defaultValue
            }
          >
            {t("defaultValue")}
          </p>
        </div>
        <div
          className={
            direction === RTL_DIRECTION
              ? arabicStyles.inputDivs
              : styles.inputDivs
          }
        >
          <div className={styles.inputSubDivs}>
            <div
              className={styles.constantNameDiv}
              style={{ display: "flex", flexDirection: "column" }}
            >
              <label
                htmlFor={`pmweb_DefinedCons_input_${constantName}`}
                className="pmweb_sr_only"
              >
                {t("constantName")}
              </label>
              {/*Added on 8/9/2023 for bugID: 135405*/}
              <Tooltip title={constantName.length < 35 ? "" : constantName}>
                <span>
                  <InputBase
                    startAdornment={<div className={styles.prefix}>CONST_</div>}
                    id={`pmweb_DefinedCons_input_${constantName}`}
                    autoFocus
                    className={
                      direction === RTL_DIRECTION
                        ? arabicStyles.constantInputField
                        : styles.constantInputField
                    }
                    variant="outlined"
                    onChange={handleConstantName}
                    value={constantName}
                    disabled={isProcessReadOnly}
                    inputRef={constantNameRef}
                    onKeyPress={(e) =>
                      FieldValidations(e, 161, constantNameRef.current, 50)
                    }
                  />
                </span>
              </Tooltip>
              {/*Till here*/}
              {errorMsg ? (
                <p
                  style={{
                    color: "red",
                    fontSize: "var(--sub_text_font_size)",
                    marginBottom: "0.5rem",
                    display: "block",
                    marginInlineStart:
                      direction === RTL_DIRECTION ? "5%" : null,
                  }}
                >
                  {errorMsg}
                </p>
              ) : (
                ""
              )}
            </div>
            <div style={{ display: "flex", flexDirection: "column" }}>
              <label
                htmlFor={`pmweb_DefinedCons_input_value_${defaultValue}`}
                className="pmweb_sr_only"
              >
                {t("defaultValue")}
              </label>
              {/*Added on 8/9/2023 for bugID: 135405*/}
              <Tooltip title={defaultValue.length < 35 ? "" : defaultValue}>
                <span>
                  <InputBase
                    id={`pmweb_DefinedCons_input_value_${defaultValue}`}
                    className={
                      direction === RTL_DIRECTION
                        ? arabicStyles.defaultValueInputField
                        : styles.defaultValueInputField
                    }
                    variant="outlined"
                    onChange={handleDefaultValue}
                    value={defaultValue}
                    disabled={isProcessReadOnly}
                    inputRef={constantValueRef}
                    onKeyPress={(e) =>
                      FieldValidations(e, 10, constantValueRef.current, 255)
                    }
                  />
                </span>
              </Tooltip>
              {/*till here*/}
              {errorMsgdefault ? (
                <p
                  style={{
                    color: "red",
                    fontSize: "var(--sub_text_font_size)",
                    marginBottom: "0.5rem",
                    display: "block",
                    marginInlineStart:
                      direction === RTL_DIRECTION ? "5%" : null,
                  }}
                >
                  {errorMsgdefault}
                </p>
              ) : (
                ""
              )}
            </div>
          </div>
          <button
            id="pmweb_DefinedCons_create_constant_button"
            class={
              direction === RTL_DIRECTION
                ? arabicStyles.createConstantButton
                : styles.createConstantButton
            }
            disabled={
              constantName.trim() === "" ||
              defaultValue.trim() === "" ||
              errorMsg != "" ||
              errorMsgdefault != ""
            } //Modified on 05/09/2023, bug_id:135644
            /* disabled={constantName.trim() === "" || defaultValue.trim() === ""}*/
            onClick={handleCreateConstant}
            style={{
              display: isProcessReadOnly ? "none" : "",
            }}
          >
            <span>{t("createConstant")}</span>
          </button>
        </div>
        {constantsArray?.length === 0 ? (
          <div className={styles.emptyStateMainDiv}>
            <img
              className={styles.emptyStateImage}
              src={EmptyStateIcon}
              alt={t("emptyState")}
            />
            {!isProcessReadOnly ? (
              <p className={styles.emptyStateHeading}>{t("createConstants")}</p>
            ) : null}
            <p className={styles.emptyStateText}>
              {!isProcessReadOnly
                ? t("noConstantsPresentTillNow") +
                  "," +
                  t("pleaseCreateConstants")
                : t("noConstantsPresentTillNow") + "."}
            </p>
          </div>
        ) : (
          <div
            style={{
              height: tabLandscape ? "50vh" : "60vh",
              overflowY: "scroll",
              scrollbarColor: "#dadada #fafafa",
              scrollbarWidth: "thin",
            }}
          >
            {constantsArray?.map((d, index) => {
              return (
                <div
                  className={styles.constantsDataDiv}
                  style={{
                    background: d.isEditable ? "rgba(0, 114, 198, 0.1)" : "",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "row",
                      alignItems: "center",
                    }}
                  >
                    {/* Modified on 05-09-23 for Bug 135642 */}
                    <Tooltip
                      title={`${d.ConstantName}`}
                      arrow
                      placement="bottom-start"
                    >
                      <span>
                        <p
                          className={
                            direction === RTL_DIRECTION
                              ? arabicStyles.constantsNameData
                              : styles.constantsNameData
                          }
                        >
                          {d.ConstantName}
                        </p>
                      </span>
                    </Tooltip>
                    {/*Till here*/}
                    <label
                      htmlFor={`pmweb_DefinedCons__input_${index}`}
                      className="pmweb_sr_only"
                    >
                      {d.DefaultValue}
                    </label>
                    {/* Modified on 05-09-23 for Bug 135642 */}
                    <Tooltip
                      title={`${d.DefaultValue}`}
                      arrow
                      placement="bottom-start"
                    >
                      <span>
                        <InputBase
                          id={`pmweb_DefinedCons__input_${index}`}
                          //Modified  on 16/08/2023, bug_id:132156
                          // className={
                          //   direction === RTL_DIRECTION
                          //     ? arabicStyles.defaultValueData
                          //     : styles.defaultValueData
                          // }

                          className={
                            direction === RTL_DIRECTION
                              ? arabicStyles.defaultValueData
                              : `${styles.defaultValueData} ${
                                  !d.isEditable ? styles.editableData : null
                                }`
                          }
                          variant="outlined"
                          value={d.DefaultValue}
                          onChange={(event) =>
                            handleDefaultValueChange(event, index)
                          }
                          disabled={!d.isEditable}
                        />
                      </span>
                    </Tooltip>
                    {/*Till here*/}
                  </div>
                  {/**code modified for bug id 139482 
                  {!isReadOnly  && (
                   * 
                  */}
                  {!isReadOnly && !isProcessReadOnly && (
                    <div
                      style={{
                        display: "flex",
                        flexDirection: "row",
                        justifyContent: "end",
                        alignItems: "center",
                      }}
                    >
                      {!d.isEditable ? (
                        <LightTooltip
                          arrow={true}
                          placement="bottom-start"
                          title={t("edit")}
                        >
                          <EditIcon
                            classes={{
                              root:
                                direction === RTL_DIRECTION
                                  ? arabicStyles.infoIcon
                                  : styles.dataInfoIcon, // class name, e.g. `classes-nesting-root-x`
                            }}
                            fontSize="medium"
                            onClick={() => editConstData(d)}
                            id="pmweb_DefinedCons_editIcon"
                            tabindex={0}
                            onKeyUp={(e) => {
                              if (e.key === "Enter") {
                                editConstData(d);
                              }
                            }}
                          />
                        </LightTooltip>
                      ) : (
                        <div
                          style={{
                            display: "flex",
                            flexDirection: "row",
                            alignItems: "center",
                            justifyContent: "flex-end",
                            width: "100%",
                            marginTop: "10px",
                          }}
                        >
                          <button
                            className={styles.cancelButton}
                            onClick={() => {
                              cancelHandler(d);
                            }}
                            id="pmweb_DefinedCons_cancel"
                          >
                            {t("cancel")}
                          </button>
                          <button
                            // style={{
                            //   background:
                            //     d.variableId === modifyButtonDisableId
                            //       ? "#0072C6"
                            //       : "#0073c64c",
                            // }}
                            className={styles.updateButton}
                            onClick={() => modifyConstantHandler(d)}
                            // disabled={!d.variableId === modifyButtonDisableId}
                            id="pmweb_DefinedCons_update"
                          >
                            {t("update")}
                          </button>
                        </div>
                      )}
                      {!d.isEditable && (
                        <LightTooltip
                          arrow={true}
                          placement="bottom-start"
                          title={t("delete")}
                        >
                          <DeleteOutlinedIcon
                            id="pmweb_DefinedCons_delete_constant_button"
                            classes={{
                              root:
                                direction === RTL_DIRECTION
                                  ? arabicStyles.deleteIcon
                                  : styles.deleteIcon,
                            }}
                            onClick={() => handleConstantDelete(index)}
                            tabindex={0}
                            onKeyUp={(e) => {
                              if (e.key === "Enter") {
                                handleConstantDelete(index);
                              }
                            }}
                          />
                        </LightTooltip>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    );
}

export default DefinedConstants;
