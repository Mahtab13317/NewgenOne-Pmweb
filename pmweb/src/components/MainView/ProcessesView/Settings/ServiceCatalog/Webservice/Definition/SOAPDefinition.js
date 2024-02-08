import React, { useEffect, useState } from "react";
import styles from "../index.module.css";
import arabicStyles from "../arabicStyles.module.css";
import { useTranslation } from "react-i18next";
import TextInput from "../../../../../../../UI/Components_With_ErrrorHandling/InputField";
import { MenuItem } from "@material-ui/core";
import CustomizedDropdown from "../../../../../../../UI/Components_With_ErrrorHandling/Dropdown";
import {
  DOMAIN_DROPDOWN,
  ENDPOINT_FETCH_DETAILS,
  ERROR_INCORRECT_FORMAT,
  ERROR_MANDATORY,
  RTL_DIRECTION,
  SERVER_URL,
  STATE_ADDED,
  STATE_CREATED,
  STATE_EDITED,
} from "../../../../../../../Constants/appConstants";
import "../index.css";
import axios from "axios";
import { useDispatch } from "react-redux";
import { setToastDataFunc } from "../../../../../../../redux-store/slices/ToastDataHandlerSlice";
import { validateRegex } from "../../../../../../../validators/validator";
import { useRef } from "react";

function SOAPDefinition(props) {
  let { t } = useTranslation();
  const dispatch = useDispatch();
  const direction = `${t("HTML_DIR")}`;
  let {
    selected,
    setChangedSelection,
    setSelected,
    error,
    setError,
    isScreenReadOnly,
  } = props;
  const [webServiceObj, setWebServiceObj] = useState({
    alias: "",
    domain: "",
    description: "",
    wsdl_url: "",
    webServiceName: "",
    methodName: {},
  });
  const [detailsFetched, setDetailsFetched] = useState(false);
  const [appList, setAppList] = useState([]);
  const [methodList, setMethodList] = useState([]);

  const scrollToBottomRef = useRef();

  useEffect(() => {
    if (selected) {
      setDetailsFetched(false);
      if (selected.status === STATE_ADDED) {
        let tempMethodList = [
          {
            methodName: selected.MethodName,
            dataStructure: selected.DataStructure,
            param: selected.Parameter,
            returnType: selected.ReturnType,
            appType: selected.AppType,
            appName: selected.AppName,
          },
        ];
        setAppList([selected.AppName]);
        setMethodList(tempMethodList);
        setWebServiceObj({
          alias: selected.AliasName,
          domain: selected.Domain,
          description: selected.Description,
          wsdl_url: selected.WSDLLocation,
          webServiceName: selected.AppName,
          methodName: tempMethodList[0],
        });
      } else if (selected.status === STATE_CREATED) {
        setAppList([]);
        setMethodList([]);
        setWebServiceObj({
          alias: "",
          domain: "",
          description: "",
          wsdl_url: "",
          webServiceName: "",
          methodName: {},
        });
      }
    }
  }, [selected]);

  useEffect(() => {
    setChangedSelection((prev) => {
      let temp = { ...prev };
      temp = { ...temp, ...webServiceObj };
      return temp;
    });
  }, [webServiceObj]);

  const onChange = (e) => {
    let tempWebService = { ...webServiceObj };
    tempWebService[e.target.name] = e.target.value;
    setWebServiceObj(tempWebService);
    if (selected?.status === STATE_ADDED) {
      setSelected((prev) => {
        let temp = { ...prev };
        temp.status = STATE_EDITED;
        return temp;
      });
    }
  };

  // Function to scroll to bottom of the div after completion of API.
  const scrollToBottom = () => {
    if (scrollToBottomRef.current) {
      scrollToBottomRef.current.scrollIntoView({
        behavior: "smooth",
        block: "end",
        inline: "nearest",
      });
    }
  };

  const fetchDetailsFunc = () => {
    if (!webServiceObj?.wsdl_url || webServiceObj?.wsdl_url?.trim() === "") {
      setError({
        wsdl_url: {
          statement: t("PleaseEnter") + " " + t("ValidWSDLPath"),
          severity: "error",
          errorType: ERROR_MANDATORY,
        },
      });
    } else if (
      // Modified on 20-09-23 for Bug 137828
      !validateRegex(webServiceObj.wsdl_url?.toLowerCase(), `\\?wsdl$`)
      // Till here for Bug 137828
    ) {
      setError({
        wsdl_url: {
          statement: t("WSDL_URL") + " " + t("isIncorrect"),
          severity: "error",
          errorType: ERROR_INCORRECT_FORMAT,
        },
      });
    } else {
      let json = {
        wsdlLocation: webServiceObj.wsdl_url,
        m_strSOAPGlblFlag: props.scope,
      };
      axios.post(SERVER_URL + ENDPOINT_FETCH_DETAILS, json).then((res) => {
        //code edited on 14 Oct 2022 for BugId 117175
        if (res?.data?.Status === 0) {
          setError({});
          if (res.data?.WSDetails) {
            let websArr = [...res.data.WSDetails];
            let appName = [],
              methodName = [];
            websArr?.forEach((li) => {
              appName.push(li.AppName);
              methodName.push({
                methodName: li.MethodName,
                dataStructure: li.MethodDataStructure,
                param: li.MethodParam,
                returnType: li.ReturnType,
                appType: li.AppType,
                appName: li.AppName,
              });
            });
            setAppList(appName);
            setMethodList(methodName);
            setWebServiceObj({
              ...webServiceObj,
              webServiceName: appName[0],
              methodName: methodName[0],
            });
            setDetailsFetched(true);
            scrollToBottom();
          } else {
            dispatch(
              setToastDataFunc({
                message: `${t("requestedOperationFailed")}`,
                severity: "error",
                open: true,
              })
            );
          }
        }
      });
    }
  };

  return (
    <div className={styles.webSDefinition} ref={scrollToBottomRef}>
      <label
        className={
          direction === RTL_DIRECTION
            ? arabicStyles.webSLabel
            : styles.webSLabel
        }
      >
        {t("Alias")}
      </label>
      <TextInput
        inputValue={webServiceObj?.alias}
        classTag={styles.webSInput}
        readOnlyCondition={isScreenReadOnly}
        onChangeEvent={onChange}
        name="alias"
        idTag="pmweb_webS_alias"
        role="input"
        aria-description="Alias input button"
      />
      <label
        className={
          direction === RTL_DIRECTION
            ? arabicStyles.webSLabel
            : styles.webSLabel
        }
      >
        {t("Domain")}
      </label>
      {/* <Select
        className={`webSSelect ${
          direction === RTL_DIRECTION
            ? arabicStyles.webSSelect
            : styles.webSSelect
        }`}
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
        disabled={isScreenReadOnly}
        name="domain"
        style={{
          backgroundColor: isScreenReadOnly ? "#f3f3f3" : "#fff",
          border: isScreenReadOnly ? "1px solid #d7d7d7" : "1px solid #c4c4c4",
          cursor: isScreenReadOnly ? "default !important" : "pointer",
        }}
        value={webServiceObj.domain}
        idTag="webS_domain"
        onChange={onChange}
      >
        <MenuItem
          className={
            direction === RTL_DIRECTION
              ? arabicStyles.webSDropdownData
              : styles.webSDropdownData
          }
          value={""}
        >
          {""}
        </MenuItem>
        {DOMAIN_DROPDOWN.map((option) => {
          return (
            <MenuItem
              className={
                direction === RTL_DIRECTION
                  ? arabicStyles.webSDropdownData
                  : styles.webSDropdownData
              }
              value={option}
            >
              {option}
            </MenuItem>
          );
        })}
      </Select> */}
      <CustomizedDropdown
        variant="outlined"
        defaultValue={"defaultValue"}
        role="select"
        ariaDescription="Domain select dropdown"
        value={webServiceObj.domain}
        name="domain"
        id="pmweb_webS_domain"
        disabled={isScreenReadOnly}
        onChange={onChange}
        isNotMandatory={true}
        className={`webSSelect ${
          direction === RTL_DIRECTION
            ? arabicStyles.webSSelect
            : styles.webSSelect
        }`}
        style={{
          backgroundColor: isScreenReadOnly ? "#f3f3f3" : "#fff",
          border: isScreenReadOnly ? "1px solid #d7d7d7" : "1px solid #c4c4c4",
          cursor: isScreenReadOnly ? "default !important" : "pointer",
        }}
      >
        {DOMAIN_DROPDOWN.map((option) => {
          return (
            <MenuItem
              className={
                direction === RTL_DIRECTION
                  ? arabicStyles.webSDropdownData
                  : styles.webSDropdownData
              }
              id={`pmweb_webS_domain_${option}`}
              value={option}
            >
              {t(option)}
            </MenuItem>
          );
        })}
      </CustomizedDropdown>
      <label
        className={
          direction === RTL_DIRECTION
            ? arabicStyles.webSLabel
            : styles.webSLabel
        }
        htmlFor="pmweb_webS_description"
      >
        {t("description")}
      </label>
      <textarea
        value={webServiceObj?.description}
        className={styles.webSTextArea}
        disabled={isScreenReadOnly}
        onChange={onChange}
        name="description"
        id="pmweb_webS_description"
        role="input"
        aria-roledescription="Description Input"
      />
      <label
        className={
          direction === RTL_DIRECTION
            ? arabicStyles.webSLabel
            : styles.webSLabel
        }
      >
        {t("WSDL_URL")}
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
      <div
        className="flex alignStart"
        style={{
          display: "flex",
          justifyContent: "space-between",
          width: "98%",
        }}
      >
        <div style={{ width: "100%" }}>
          <TextInput
            inputValue={webServiceObj?.wsdl_url}
            type="input"
            classTag={styles.webSInput}
            onChangeEvent={onChange}
            name="wsdl_url"
            idTag="pmweb_webS_wsdl_url"
            regexStr={`\\?wsdl$`}
            readOnlyCondition={selected?.status !== STATE_CREATED}
            errorStatement={error?.wsdl_url?.statement}
            errorSeverity={error?.wsdl_url?.severity}
            errorType={error?.wsdl_url?.errorType}
            inlineError={true}
            ariaLabel="wsdl_url"
          />
        </div>
        <button
          className={`${
            selected?.status !== STATE_CREATED
              ? styles.disabledBtn
              : styles.secondaryBtn
          } ${styles.mb1} `}
          onClick={fetchDetailsFunc}
          disabled={selected?.status !== STATE_CREATED}
          id={`pmweb_webS_fetchDetails_${props.scope}`}
          style={{
            minWidth: "8rem",
            maxWidth: "12rem",
            marginLeft: direction === RTL_DIRECTION ? "unset" : "1vw",
          }}
        >
          {t("fetchDetails")}
        </button>
      </div>
      <label
        className={
          direction === RTL_DIRECTION
            ? arabicStyles.webSLabel
            : styles.webSLabel
        }
      >
        {t("webService")} {t("name")}
      </label>
      {/* <Select
        className={`${!detailsFetched ? "webSSelect_disabled" : "webSSelect"} ${
          direction === RTL_DIRECTION
            ? arabicStyles.webSSelect
            : styles.webSSelect
        }`}
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
        disabled={!detailsFetched || isScreenReadOnly}
        style={{
          backgroundColor:
            !detailsFetched || isScreenReadOnly ? "#f3f3f3" : "#fff",
          border:
            !detailsFetched || isScreenReadOnly
              ? "1px solid #d7d7d7"
              : "1px solid #c4c4c4",
          cursor:
            !detailsFetched || isScreenReadOnly
              ? "default !important"
              : "pointer",
          color:
            !detailsFetched || isScreenReadOnly ? "#727272 !important" : "#000",
        }}
        name="webServiceName"
        value={webServiceObj.webServiceName}
        onChange={onChange}
        id="webS_webServiceName"
      >
        {appList.map((opt) => {
          return (
            <MenuItem
              className={
                direction === RTL_DIRECTION
                  ? arabicStyles.webSDropdownData
                  : styles.webSDropdownData
              }
              value={opt}
            >
              {opt}
            </MenuItem>
          );
        })}
      </Select> */}
      <CustomizedDropdown
        variant="outlined"
        defaultValue={"defaultValue"}
        name="webServiceName"
        value={webServiceObj.webServiceName}
        onChange={onChange}
        id="pmweb_webS_webServiceName"
        isNotMandatory={true}
        ariaLabel="Select webservice Name"
        disabled={!detailsFetched || isScreenReadOnly}
        className={`${!detailsFetched ? "webSSelect_disabled" : "webSSelect"} ${
          direction === RTL_DIRECTION
            ? arabicStyles.webSSelect
            : styles.webSSelect
        }`}
        style={{
          backgroundColor:
            !detailsFetched || isScreenReadOnly ? "#f0f0f0" : "#fff",
          border:
            !detailsFetched || isScreenReadOnly
              ? "1px solid #d7d7d7"
              : "1px solid #c4c4c4",
          cursor:
            !detailsFetched || isScreenReadOnly
              ? "default !important"
              : "pointer",
          color: "#000000 !important",
        }}
      >
        {appList.map((opt) => {
          return (
            <MenuItem
              className={
                direction === RTL_DIRECTION
                  ? arabicStyles.webSDropdownData
                  : styles.webSDropdownData
              }
              value={opt}
              id={`pmweb_webS_webServiceName_${opt}`}
            >
              {opt}
            </MenuItem>
          );
        })}
      </CustomizedDropdown>
      <label
        className={
          direction === RTL_DIRECTION
            ? arabicStyles.webSLabel
            : styles.webSLabel
        }
      >
        {t("method")} {t("name")}
      </label>
      {/* <Select
        className={`${!detailsFetched ? "webSSelect_disabled" : "webSSelect"} ${
          direction === RTL_DIRECTION
            ? arabicStyles.webSSelect
            : styles.webSSelect
        }`}
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
        disabled={!detailsFetched || isScreenReadOnly}
        style={{
          backgroundColor:
            !detailsFetched || isScreenReadOnly ? "#f3f3f3" : "#fff",
          border:
            !detailsFetched || isScreenReadOnly
              ? "1px solid #d7d7d7"
              : "1px solid #c4c4c4",
          cursor:
            !detailsFetched || isScreenReadOnly
              ? "default !important"
              : "pointer",
        }}
        name="methodName"
        value={webServiceObj.methodName}
        onChange={onChange}
        id="webS_methodName"
      >
        {methodList
          ?.filter((el) => el.appName === webServiceObj.webServiceName)
          .map((opt1) => {
            return (
              <MenuItem
                className={
                  direction === RTL_DIRECTION
                    ? arabicStyles.webSDropdownData
                    : styles.webSDropdownData
                }
                value={opt1}
              >
                {opt1.methodName}
              </MenuItem>
            );
          })}
      </Select> */}
      <CustomizedDropdown
        variant="outlined"
        defaultValue={"defaultValue"}
        ariaLabel="Select method name"
        isNotMandatory={true}
        className={`${!detailsFetched ? "webSSelect_disabled" : "webSSelect"} ${
          direction === RTL_DIRECTION
            ? arabicStyles.webSSelect
            : styles.webSSelect
        }`}
        disabled={!detailsFetched || isScreenReadOnly}
        style={{
          backgroundColor:
            !detailsFetched || isScreenReadOnly ? "#f0f0f0" : "#fff",
          border:
            !detailsFetched || isScreenReadOnly
              ? "1px solid #d7d7d7"
              : "1px solid #c4c4c4",
          cursor:
            !detailsFetched || isScreenReadOnly
              ? "default !important"
              : "pointer",
          color:
            !detailsFetched || isScreenReadOnly ? "#000000 !important" : "#000",
        }}
        name="methodName"
        value={webServiceObj.methodName}
        onChange={onChange}
        id="pmweb_webS_methodName"
      >
        {methodList
          ?.filter((el) => el.appName === webServiceObj.webServiceName)
          .map((opt1) => {
            return (
              <MenuItem
                className={
                  direction === RTL_DIRECTION
                    ? arabicStyles.webSDropdownData
                    : styles.webSDropdownData
                }
                id={`pmweb_webS_methodName_${opt1}`}
                value={opt1}
              >
                {opt1.methodName}
              </MenuItem>
            );
          })}
      </CustomizedDropdown>
    </div>
  );
}

export default SOAPDefinition;
