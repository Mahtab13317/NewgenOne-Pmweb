import React, { useEffect, useRef, useState } from "react";
import styles from "../index.module.css";
import arabicStyles from "../arabicStyles.module.css";
import { Checkbox, FormControlLabel, MenuItem, Grid } from "@material-ui/core";
import { useTranslation } from "react-i18next";
import TextInput from "../../../../../../../UI/Components_With_ErrrorHandling/InputField";
import Modal from "../../../../../../../UI/Modal/Modal.js";
import {
  AUTH_TYPE_DROPDOWN,
  BASIC_AUTH,
  DEFINE_AUTH_DETAILS,
  DEFINE_PARAM,
  DEFINE_REQUEST_BODY,
  DEFINE_RESPONSE_BODY,
  DOMAIN_DROPDOWN,
  MEDIA_TYPE_DROPDOWN,
  OPERATION_DROPDOWN,
  STATE_ADDED,
  STATE_CREATED,
  STATE_EDITED,
  TOKEN_BASED_AUTH,
  Y_FLAG,
  NO_AUTH,
  RTL_DIRECTION,
} from "../../../../../../../Constants/appConstants";
import DefineParamModal from "./DefineParamModal";
import {
  getAuthenticationCode,
  getResReqCode,
} from "../../../../../../../utility/ServiceCatalog/Webservice";
import DefineRequestModal from "./DefineRequestModal";
import DefineResponseModal from "./DefineResponseModal";
import BasicAuthModal from "./BasicAuthModal";
import TokenAuthModal from "./TokenAuthModal";
import "../index.css";
import CustomizedDropdown from "../../../../../../../UI/Components_With_ErrrorHandling/Dropdown";

function REST_Manual(props) {
  let { t } = useTranslation();
  const direction = `${t("HTML_DIR")}`;
  let { selected, setSelected, setChangedSelection, error, isScreenReadOnly } =
    props;
  const [isProxyReq, setIsProxyReq] = useState(false);
  const [brmsRestService, setBRMSRestService] = useState(false);
  const [webServiceObj, setWebServiceObj] = useState({
    alias: "",
    domain: "",
    description: "",
    methodName: "",
    baseUri: "",
    operationType: "GET",
    authType: NO_AUTH,
    resMediaType: "X",
    reqMediaType: "X",
    resourcePath: "",
    username: "",
    // modified on 31/10/23 for checkmarx -- client privacy violation
    // password: "",
    authCred: "",
    // till here
    authUrl: "",
    authOperation: "GET",
    reqType: "X",
    resType: "X",
    dataList: [],
  });
  const [openModal, setOpenModal] = useState(null);
  const [maxDataId, setMaxDataId] = useState(0);
  const [inputParamList, setInputParamList] = useState([]);
  const [reqBodyList, setReqBodyList] = useState([]);
  const [resBodyList, setResBodyList] = useState([]);

  const BrmsRef = useRef();
  const isProxyRef = useRef();

  useEffect(() => {
    if (selected) {
      if (selected.status === STATE_ADDED) {
        setBRMSRestService(selected.BRMSEnabled === Y_FLAG);
        setIsProxyReq(selected.ProxyEnabled === Y_FLAG);
        setWebServiceObj({
          alias: selected.AliasName,
          domain: selected.Domain,
          description: selected.Description,
          methodName: selected.MethodName,
          baseUri: selected.BaseURI,
          operationType: selected.OperationType,
          authType: getAuthenticationCode(selected.AuthenticationType),
          resMediaType: selected.ResponseMediaType,
          reqMediaType: selected.RequestMediaType,
          resourcePath: selected.ResourcePath,
          maxDataStructId: selected.MaxDataStructId,
          username:
            getAuthenticationCode(selected.AuthenticationType) === BASIC_AUTH
              ? selected.UserName
              : "",
          // modified on 31/10/23 for checkmarx -- client privacy violation
          // password:
          authCred:
            getAuthenticationCode(selected.AuthenticationType) === BASIC_AUTH
              ? // modified on 05/12/23 for checkmarx -- client privacy violation
                //  selected.Password
                selected.AuthCred
              : "",
          // till here
          authUrl:
            getAuthenticationCode(selected.AuthenticationType) ===
            TOKEN_BASED_AUTH
              ? selected.AuthorizationURL
              : "",
          authOperation:
            getAuthenticationCode(selected.AuthenticationType) ===
            TOKEN_BASED_AUTH
              ? selected.AuthOperationType
              : "",
          reqType:
            getAuthenticationCode(selected.AuthenticationType) ===
            TOKEN_BASED_AUTH
              ? selected.RequestType
              : "",
          resType:
            getAuthenticationCode(selected.AuthenticationType) ===
            TOKEN_BASED_AUTH
              ? selected.ResponseType
              : "",
          dataList:
            getAuthenticationCode(selected.AuthenticationType) ===
            TOKEN_BASED_AUTH
              ? selected.ParamMapping
              : [],
        });
        setMaxDataId(selected.MaxDataStructId);
        setInputParamList(selected?.InputParameters?.PrimitiveComplexType);
        setReqBodyList(selected?.RequestBodyParameters?.NestedReqComplexType);
        setResBodyList(selected?.ResponseBodyParameters?.NestedResComplexType);
      } else if (selected.status === STATE_CREATED) {
        setBRMSRestService(false);
        setIsProxyReq(false);
        setWebServiceObj({
          alias: "",
          domain: "",
          description: "",
          methodName: "",
          baseUri: "",
          operationType: "GET",
          authType: NO_AUTH,
          resMediaType: "X",
          reqMediaType: "X",
          resourcePath: "",
          username: "",
          // modified on 31/10/23 for checkmarx -- client privacy violation
          // password:
          authCred: "",
          // till here
          authUrl: "",
          authOperation: "GET",
          reqType: "X",
          resType: "X",
          dataList: [],
        });
      }
    }
  }, [selected]);

  useEffect(() => {
    // code edited for BugId 113306 and BugId 113320
    setChangedSelection((prev) => {
      let temp = { ...prev };
      temp = {
        ...temp,
        ...webServiceObj,
        brmsEnabled: brmsRestService,
        proxyEnabled: isProxyReq,
        ResBodyParameters: resBodyList,
        ReqBodyParameters: reqBodyList,
        InputParameters: inputParamList,
      };
      return temp;
    });
  }, [
    webServiceObj,
    brmsRestService,
    isProxyReq,
    resBodyList,
    reqBodyList,
    inputParamList,
  ]);

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

  return (
    <div className={styles.webSDefinition}>
      <FormControlLabel
        control={
          <Checkbox
            checked={isProxyReq}
            onChange={(e) => {
              setIsProxyReq(e.target.checked);
            }}
            disabled={isScreenReadOnly}
            id="pmweb_webS_isProxyCheck"
            className={styles.omsTemplateCheckbox}
            tabIndex={isScreenReadOnly ? -1 : 0}
            ref={isProxyRef}
            onKeyUp={(e) => {
              if (e.key === "Enter") {
                isProxyRef.current.click();
                e.stopPropagation();
              }
            }}
          />
        }
        className={`${
          direction === RTL_DIRECTION
            ? arabicStyles.webS_radioButton
            : styles.webS_radioButton
        } block`}
        label={t("ProxyRequired")}
      />
      <FormControlLabel
        control={
          <Checkbox
            checked={brmsRestService}
            onChange={(e) => {
              setBRMSRestService(e.target.checked);
            }}
            disabled={isScreenReadOnly}
            id="pmweb_webS_isBRMS_Restservice"
            className={styles.omsTemplateCheckbox}
            tabIndex={isScreenReadOnly ? -1 : 0}
            ref={BrmsRef}
            onKeyUp={(e) => {
              if (e.key === "Enter") {
                BrmsRef.current.click();
                e.stopPropagation();
              }
            }}
          />
        }
        className={`${
          direction === RTL_DIRECTION
            ? arabicStyles.webS_radioButton
            : styles.webS_radioButton
        } block`}
        label={t("BRMS_RestService")}
      />
      <div className={styles.webSDefinition}>
        <label
          className={
            direction === RTL_DIRECTION
              ? arabicStyles.webSLabel
              : styles.webSLabel
          }
          htmlFor="pmweb_webS_alias_REST"
        >
          {t("Alias")}
        </label>
        <TextInput
          inputValue={webServiceObj?.alias}
          classTag={styles.webSInput}
          onChangeEvent={onChange}
          name="alias"
          idTag="pmweb_webS_alias_REST"
          readOnlyCondition={isScreenReadOnly}
        />
        <label
          className={
            direction === RTL_DIRECTION
              ? arabicStyles.webSLabel
              : styles.webSLabel
          }
          htmlFor="pmweb_webS_domain_REST"
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
          name="domain"
          value={webServiceObj.domain}
          style={{
            backgroundColor: isScreenReadOnly ? "#f3f3f3" : "#fff",
            border: isScreenReadOnly
              ? "1px solid #d7d7d7"
              : "1px solid #c4c4c4",
            cursor: isScreenReadOnly ? "default !important" : "pointer",
          }}
          onChange={onChange}
          disabled={isScreenReadOnly}
          id="webS_domain_REST"
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
                value={t(option)}
              >
                {t(option)}
              </MenuItem>
            );
          })}
        </Select> */}
        <CustomizedDropdown
          variant="outlined"
          defaultValue={"defaultValue"}
          isNotMandatory={true}
          className={`webSSelect ${
            direction === RTL_DIRECTION
              ? arabicStyles.webSSelect
              : styles.webSSelect
          }`}
          name="domain"
          value={webServiceObj.domain}
          style={{
            backgroundColor: isScreenReadOnly ? "#f3f3f3" : "#fff",
            border: isScreenReadOnly
              ? "1px solid #d7d7d7"
              : "1px solid #c4c4c4",
            cursor: isScreenReadOnly ? "default !important" : "pointer",
          }}
          onChange={onChange}
          disabled={isScreenReadOnly}
          id="pmweb_webS_domain_REST"
        >
          {DOMAIN_DROPDOWN.map((option) => {
            return (
              <MenuItem
                className={
                  direction === RTL_DIRECTION
                    ? arabicStyles.webSDropdownData
                    : styles.webSDropdownData
                }
                value={t(option)}
                id={`pmweb_webS_domain_REST_${t(option)}`}
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
          htmlFor="pmweb_webS_description_REST"
        >
          {t("description")}
        </label>
        <textarea
          value={webServiceObj?.description}
          className={styles.webSTextArea}
          onChange={onChange}
          name="description"
          disabled={isScreenReadOnly}
          id="pmweb_webS_description_REST"
        />
        <label
          className={
            direction === RTL_DIRECTION
              ? arabicStyles.webSLabel
              : styles.webSLabel
          }
          htmlFor="pmweb_webS_methodName_REST"
        >
          {t("endpointName")}
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
          inputValue={webServiceObj?.methodName}
          classTag={styles.webSInput}
          onChangeEvent={onChange}
          name="methodName"
          idTag="pmweb_webS_methodName_REST"
          errorStatement={error?.methodName?.statement}
          errorSeverity={error?.methodName?.severity}
          errorType={error?.methodName?.errorType}
          inlineError={true}
          readOnlyCondition={isScreenReadOnly}
        />
        <label
          className={
            direction === RTL_DIRECTION
              ? arabicStyles.webSLabel
              : styles.webSLabel
          }
          htmlFor="pmweb_webS_baseUri_REST"
        >
          {t("BaseURI")}
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
          inputValue={webServiceObj?.baseUri}
          classTag={styles.webSInput}
          onChangeEvent={onChange}
          name="baseUri"
          idTag="pmweb_webS_baseUri_REST"
          errorStatement={error?.baseUri?.statement}
          errorSeverity={error?.baseUri?.severity}
          errorType={error?.baseUri?.errorType}
          inlineError={true}
          readOnlyCondition={isScreenReadOnly}
        />
        <label
          className={
            direction === RTL_DIRECTION
              ? arabicStyles.webSLabel
              : styles.webSLabel
          }
          htmlFor="pmweb_webS_resourcePath_REST"
        >
          {t("ResourcePath")}
        </label>
        <TextInput
          inputValue={webServiceObj?.resourcePath}
          classTag={styles.webSInput}
          onChangeEvent={onChange}
          name="resourcePath"
          idTag="pmweb_webS_resourcePath_REST"
          readOnlyCondition={isScreenReadOnly}
        />
        <label
          className={
            direction === RTL_DIRECTION
              ? arabicStyles.webSLabel
              : styles.webSLabel
          }
          htmlFor="pmweb_webS_opType_REST"
        >
          {t("OperationType")}
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
          name="operationType"
          value={webServiceObj.operationType}
          onChange={onChange}
          style={{
            backgroundColor: isScreenReadOnly ? "#f3f3f3" : "#fff",
            border: isScreenReadOnly
              ? "1px solid #d7d7d7"
              : "1px solid #c4c4c4",
            cursor: isScreenReadOnly ? "default !important" : "pointer",
          }}
          disabled={isScreenReadOnly}
          id="webS_opType_REST"
        >
          {OPERATION_DROPDOWN.map((option1) => {
            return (
              <MenuItem
                className={
                  direction === RTL_DIRECTION
                    ? arabicStyles.webSDropdownData
                    : styles.webSDropdownData
                }
                value={t(option1)}
              >
                {t(option1)}
              </MenuItem>
            );
          })}
        </Select> */}
        <CustomizedDropdown
          variant="outlined"
          defaultValue={"defaultValue"}
          isNotMandatory={true}
          className={`webSSelect ${
            direction === RTL_DIRECTION
              ? arabicStyles.webSSelect
              : styles.webSSelect
          }`}
          name="operationType"
          value={webServiceObj.operationType}
          onChange={onChange}
          style={{
            backgroundColor: isScreenReadOnly ? "#f3f3f3" : "#fff",
            border: isScreenReadOnly
              ? "1px solid #d7d7d7"
              : "1px solid #c4c4c4",
            cursor: isScreenReadOnly ? "default !important" : "pointer",
          }}
          disabled={isScreenReadOnly}
          id="pmweb_webS_opType_REST"
        >
          {OPERATION_DROPDOWN.map((option1) => {
            return (
              <MenuItem
                className={
                  direction === RTL_DIRECTION
                    ? arabicStyles.webSDropdownData
                    : styles.webSDropdownData
                }
                value={t(option1)}
                id={`pmweb_webS_opType_REST_${t(option1)}`}
              >
                {t(option1)}
              </MenuItem>
            );
          })}
        </CustomizedDropdown>
        <div
          className="flex alignCenter"
          style={{
            display: "flex",
            justifyContent: "space-between",
            width: "100%",
          }}
        >
          <Grid container xs={12} spacing={1} justifyContent="space-between">
            <Grid item xs={6} md={4}>
              <div>
                <button
                  className={`${styles.secondaryBtn} ${styles.mb1} ${
                    styles.buttonsType
                  } ${
                    direction === RTL_DIRECTION ? arabicStyles.mr1 : styles.mr1
                  }`}
                  id="pmweb_webS_defineParam_REST"
                  onClick={() => setOpenModal(DEFINE_PARAM)}
                  style={{ maxWidth: "20rem", width: "100%" }}
                >
                  {t("Parameter")} {t("definition")}
                </button>
              </div>
            </Grid>
            <Grid item xs={6} md={4}>
              <button
                className={`${styles.secondaryBtn} ${styles.mb1} ${
                  styles.buttonsType
                } ${
                  direction === RTL_DIRECTION ? arabicStyles.mr1 : styles.mr1
                }`}
                id="pmweb_webS_reqBodydefine_REST"
                onClick={() => setOpenModal(DEFINE_REQUEST_BODY)}
                style={{ maxWidth: "20rem", width: "100%" }}
              >
                {t("RequestBody")} {t("definition")}
              </button>
            </Grid>
            <Grid item xs={6} md={4}>
              <button
                className={`${styles.secondaryBtn} ${styles.mb1} ${
                  styles.buttonsType
                } ${
                  direction === RTL_DIRECTION ? arabicStyles.mr1 : styles.mr1
                }`}
                id="pmweb_webS_resBodydefine_REST"
                onClick={() => setOpenModal(DEFINE_RESPONSE_BODY)}
                style={{ maxWidth: "20rem", width: "100%" }}
              >
                {t("ResponseBody")} {t("definition")}
              </button>
            </Grid>
          </Grid>
        </div>
        <div className="flex alignEnd" style={{ width: "98%" }}>
          <div className="flexColumn" style={{ width: "60%" }}>
            <label
              className={
                direction === RTL_DIRECTION
                  ? arabicStyles.webSLabel
                  : styles.webSLabel
              }
              htmlFor="pmweb_webS_authType_REST"
            >
              {t("AuthenticationType")}
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
              name="authType"
              value={webServiceObj.authType}
              onChange={onChange}
              style={{
                backgroundColor: isScreenReadOnly ? "#f3f3f3" : "#fff",
                border: isScreenReadOnly
                  ? "1px solid #d7d7d7"
                  : "1px solid #c4c4c4",
                cursor: isScreenReadOnly ? "default !important" : "pointer",
              }}
              disabled={isScreenReadOnly}
              id="webS_authType_REST"
            >
              {AUTH_TYPE_DROPDOWN.map((option) => {
                return (
                  <MenuItem
                    className={
                      direction === RTL_DIRECTION
                        ? arabicStyles.webSDropdownData
                        : styles.webSDropdownData
                    }
                    value={option}
                  >
                    {t(option)}
                  </MenuItem>
                );
              })}
            </Select> */}
            <CustomizedDropdown
              variant="outlined"
              defaultValue={"defaultValue"}
              isNotMandatory={true}
              className={`webSSelect ${
                direction === RTL_DIRECTION
                  ? arabicStyles.webSSelect
                  : styles.webSSelect
              }`}
              name="authType"
              value={webServiceObj.authType}
              onChange={onChange}
              style={{
                backgroundColor: isScreenReadOnly ? "#f3f3f3" : "#fff",
                border: isScreenReadOnly
                  ? "1px solid #d7d7d7"
                  : "1px solid #c4c4c4",
                cursor: isScreenReadOnly ? "default !important" : "pointer",
              }}
              disabled={isScreenReadOnly}
              id="pmweb_webS_authType_REST"
            >
              {AUTH_TYPE_DROPDOWN.map((option) => {
                return (
                  <MenuItem
                    className={
                      direction === RTL_DIRECTION
                        ? arabicStyles.webSDropdownData
                        : styles.webSDropdownData
                    }
                    value={option}
                    id={`pmweb_webS_authType_REST_${option}`}
                  >
                    {t(option)}
                  </MenuItem>
                );
              })}
            </CustomizedDropdown>
          </div>
          <button
            className={`${
              webServiceObj.authType === NO_AUTH
                ? styles.disabledBtn
                : styles.secondaryBtn
            } ${styles.mb1}`}
            onClick={() => setOpenModal(DEFINE_AUTH_DETAILS)}
            disabled={
              webServiceObj.authType === NO_AUTH ? true : isScreenReadOnly
            }
            id={`pmweb_webs_authenDetails_${props.scope}`}
            style={{
              height: "auto",
              minHeight: "1.5rem",
              width: "40%",
              minWidth: "17rem",
              marginLeft: direction === RTL_DIRECTION ? "unset" : "1vw",
            }}
          >
            {t("Define")} {t("AuthenticationDetails")}
          </button>
        </div>
        <label
          className={
            direction === RTL_DIRECTION
              ? arabicStyles.webSLabel
              : styles.webSLabel
          }
          htmlFor="pmweb_webS_reqMediaType_REST"
        >
          {t("RequestMediaType")}
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
          name="reqMediaType"
          value={webServiceObj.reqMediaType}
          disabled={isScreenReadOnly}
          style={{
            backgroundColor: isScreenReadOnly ? "#f3f3f3" : "#fff",
            border: isScreenReadOnly
              ? "1px solid #d7d7d7"
              : "1px solid #c4c4c4",
            cursor: isScreenReadOnly ? "default !important" : "pointer",
          }}
          onChange={onChange}
          id="webS_reqMediaType_REST"
        >
          {MEDIA_TYPE_DROPDOWN.map((opt) => {
            return (
              <MenuItem
                className={
                  direction === RTL_DIRECTION
                    ? arabicStyles.webSDropdownData
                    : styles.webSDropdownData
                }
                value={opt}
              >
                {t(getResReqCode(opt))}
              </MenuItem>
            );
          })}
        </Select> */}
        <CustomizedDropdown
          variant="outlined"
          defaultValue={"defaultValue"}
          isNotMandatory={true}
          className={`webSSelect ${
            direction === RTL_DIRECTION
              ? arabicStyles.webSSelect
              : styles.webSSelect
          }`}
          name="reqMediaType"
          value={webServiceObj.reqMediaType}
          disabled={isScreenReadOnly}
          style={{
            backgroundColor: isScreenReadOnly ? "#f3f3f3" : "#fff",
            border: isScreenReadOnly
              ? "1px solid #d7d7d7"
              : "1px solid #c4c4c4",
            cursor: isScreenReadOnly ? "default !important" : "pointer",
          }}
          onChange={onChange}
          id="pmweb_webS_reqMediaType_REST"
        >
          {MEDIA_TYPE_DROPDOWN.map((opt) => {
            return (
              <MenuItem
                className={
                  direction === RTL_DIRECTION
                    ? arabicStyles.webSDropdownData
                    : styles.webSDropdownData
                }
                value={opt}
                id={`pmweb_webS_reqMediaType_REST_${opt}`}
              >
                {t(getResReqCode(opt))}
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
          htmlFor="pmweb_webS_resMediaType_REST"
        >
          {t("ResponseMediaType")}
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
          name="resMediaType"
          value={webServiceObj.resMediaType}
          disabled={isScreenReadOnly}
          style={{
            backgroundColor: isScreenReadOnly ? "#f3f3f3" : "#fff",
            border: isScreenReadOnly
              ? "1px solid #d7d7d7"
              : "1px solid #c4c4c4",
            cursor: isScreenReadOnly ? "default !important" : "pointer",
          }}
          onChange={onChange}
          id="webS_resMediaType_REST"
        >
          {MEDIA_TYPE_DROPDOWN.map((opt1) => {
            return (
              <MenuItem
                className={
                  direction === RTL_DIRECTION
                    ? arabicStyles.webSDropdownData
                    : styles.webSDropdownData
                }
                value={opt1}
              >
                {t(getResReqCode(opt1))}
              </MenuItem>
            );
          })}
        </Select> */}
        <CustomizedDropdown
          variant="outlined"
          defaultValue={"defaultValue"}
          isNotMandatory={true}
          className={`webSSelect ${
            direction === RTL_DIRECTION
              ? arabicStyles.webSSelect
              : styles.webSSelect
          }`}
          name="resMediaType"
          value={webServiceObj.resMediaType}
          disabled={isScreenReadOnly}
          style={{
            backgroundColor: isScreenReadOnly ? "#f3f3f3" : "#fff",
            border: isScreenReadOnly
              ? "1px solid #d7d7d7"
              : "1px solid #c4c4c4",
            cursor: isScreenReadOnly ? "default !important" : "pointer",
          }}
          onChange={onChange}
          id="pmweb_webS_resMediaType_REST"
        >
          {MEDIA_TYPE_DROPDOWN.map((opt1) => {
            return (
              <MenuItem
                className={
                  direction === RTL_DIRECTION
                    ? arabicStyles.webSDropdownData
                    : styles.webSDropdownData
                }
                value={opt1}
                id={`pmweb_webS_resMediaType_REST_${opt1}`}
              >
                {t(getResReqCode(opt1))}
              </MenuItem>
            );
          })}
        </CustomizedDropdown>
      </div>

      {
        //code updated on 17 October 2022 for BugId 113905
        openModal === DEFINE_PARAM ? (
          <Modal
            show={openModal === DEFINE_PARAM}
            style={{
              // width: "55vw",
              // left: "25%",
              width: "70%",
              left: "15%",
              top: "22%",
              padding: "0",
            }}
            modalClosed={() => setOpenModal(null)}
            children={
              <DefineParamModal
                cancelFunc={() => setOpenModal(null)}
                selected={selected}
                setChangedSelection={setChangedSelection}
                setSelected={setSelected}
                maxDataId={maxDataId}
                setMaxDataId={setMaxDataId}
                inputParamList={inputParamList}
                setInputParamList={setInputParamList}
                isScreenReadOnly={isScreenReadOnly}
                id="ParameterDefinition"
                scope={props?.scope}
              />
            }
          />
        ) : null
      }
      {openModal === DEFINE_REQUEST_BODY ? (
        <Modal
          show={openModal === DEFINE_REQUEST_BODY}
          style={{
            width: "70%",
            left: "15%",
            top: "22%",
            padding: "0",
          }}
          modalClosed={() => setOpenModal(null)}
          children={
            <DefineRequestModal
              cancelFunc={() => setOpenModal(null)}
              selected={selected}
              setChangedSelection={setChangedSelection}
              setSelected={setSelected}
              maxDataId={maxDataId}
              setMaxDataId={setMaxDataId}
              reqBodyList={reqBodyList}
              setReqBodyList={setReqBodyList}
              isScreenReadOnly={isScreenReadOnly}
              id="ReqBodyDefinition"
              scope={props?.scope}
            />
          }
        />
      ) : null}
      {openModal === DEFINE_RESPONSE_BODY ? (
        <Modal
          show={openModal === DEFINE_RESPONSE_BODY}
          style={{
            // width: "80vw",
            // left: "13%",
            width: "70%",
            left: "15%",
            top: "22%",
            padding: "0",
          }}
          modalClosed={() => setOpenModal(null)}
          children={
            <DefineResponseModal
              cancelFunc={() => setOpenModal(null)}
              selected={selected}
              setChangedSelection={setChangedSelection}
              setSelected={setSelected}
              maxDataId={maxDataId}
              setMaxDataId={setMaxDataId}
              resBodyList={resBodyList}
              setResBodyList={setResBodyList}
              isScreenReadOnly={isScreenReadOnly}
              id="ResBodyDefinition"
              scope={props?.scope}
            />
          }
        />
      ) : null}
      {openModal === DEFINE_AUTH_DETAILS &&
      webServiceObj.authType === BASIC_AUTH ? (
        <Modal
          show={
            openModal === DEFINE_AUTH_DETAILS &&
            webServiceObj.authType === BASIC_AUTH
          }
          style={{
            // width: "30vw",
            // left: "40%",
            top: "26%",
            padding: "0",
          }}
          modalClosed={() => setOpenModal(null)}
          children={
            <BasicAuthModal
              cancelFunc={() => setOpenModal(null)}
              selected={selected}
              setSelected={setSelected}
              webServiceObj={webServiceObj}
              setWebServiceObj={setWebServiceObj}
              isScreenReadOnly={isScreenReadOnly}
              id="BasicAuth"
            />
          }
        />
      ) : null}
      {openModal === DEFINE_AUTH_DETAILS &&
      webServiceObj.authType === TOKEN_BASED_AUTH ? (
        <Modal
          show={
            openModal === DEFINE_AUTH_DETAILS &&
            webServiceObj.authType === TOKEN_BASED_AUTH
          }
          style={{
            width: "60vw",
            left: "22%",
            top: "20%",
            padding: "0",
          }}
          modalClosed={() => setOpenModal(null)}
          children={
            <TokenAuthModal
              cancelFunc={() => setOpenModal(null)}
              selected={selected}
              setSelected={setSelected}
              webServiceObj={webServiceObj}
              setWebServiceObj={setWebServiceObj}
              isScreenReadOnly={isScreenReadOnly}
              id="TokenAuth"
            />
          }
        />
      ) : null}
    </div>
  );
}

export default REST_Manual;
