import React, { useEffect, useState } from "react";
import styles from "./modal.module.css";
import arabicStyles from "./arabicModal.module.css";
import { useTranslation } from "react-i18next";
import CloseIcon from "@material-ui/icons/Close";
import TextInput from "../../../../../../../UI/Components_With_ErrrorHandling/InputField";
import {
  ERROR_MANDATORY,
  MEDIA_TYPE_DROPDOWN,
  OPERATION_DROPDOWN,
  RTL_DIRECTION,
  SCOPE_OPTIONS,
  STATE_ADDED,
  STATE_EDITED,
  TOKEN_TYPE_DROPDOWN,
} from "../../../../../../../Constants/appConstants";
import { MenuItem, Select } from "@material-ui/core";
import DeleteOutlineIcon from "@material-ui/icons/DeleteOutline";
import emptyStatePic from "../../../../../../../assets/ProcessView/EmptyState.svg";
import {
  getResReqCode,
  getScopeType,
  getTokenType,
} from "../../../../../../../utility/ServiceCatalog/Webservice";
import CustomizedDropdown from "../../../../../../../UI/Components_With_ErrrorHandling/Dropdown";

function TokenAuthModal(props) {
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
    authUrl: "",
    authOperation: "GET",
    reqType: "X",
    resType: "X",
    dataList: [],
  });
  const [input, setInput] = useState({
    variableName: "",
    controlType: "H",
    type: "I",
    defaultVal: "",
  });
  const [bShowInput, setShowInput] = useState(false);
  const [error, setError] = useState({});

  useEffect(() => {
    if (webServiceObj) {
      setData({
        authUrl: webServiceObj.authUrl,
        authOperation: webServiceObj.authOperation,
        reqType: webServiceObj.reqType,
        resType: webServiceObj.resType,
        dataList: webServiceObj.dataList,
      });
    }
  }, [webServiceObj]);

  const onChange = (e) => {
    setData({ ...data, [e.target.name]: e.target.value });
  };

  const onInputChange = (e) => {
    setInput({ ...input, [e.target.name]: e.target.value });
  };

  const addMember = () => {
    let temp = [...data.dataList];
    temp.push({
      ParamName: input.variableName,
      style: input.controlType,
      Value: input.defaultVal,
      mappedType: input.type,
    });
    setData({
      ...data,
      dataList: [...temp],
    });
    setShowInput(false);
    setInput({
      variableName: "",
      controlType: "H",
      type: "I",
      defaultVal: "",
    });
  };

  const removeMember = (index) => {
    let temp = JSON.parse(JSON.stringify(data.dataList));
    temp.splice(index, 1);
    setData({
      ...data,
      dataList: [...temp],
    });
  };

  const submitFunc = () => {
    let mandatoryFieldsFilled = true;
    let errorObj = {};
    if (!data.authUrl || data.authUrl === "") {
      mandatoryFieldsFilled = false;
      errorObj = {
        ...errorObj,
        authUrl: {
          statement: t("PleaseEnter") + " " + t("AuthorizationURL"),
          severity: "error",
          errorType: ERROR_MANDATORY,
        },
      };
    }
    if (mandatoryFieldsFilled) {
      setError({});
      setWebServiceObj((prev) => {
        let temp = { ...prev };
        temp = {
          ...temp,
          authUrl: data.authUrl,
          authOperation: data.authOperation,
          reqType: data.reqType,
          resType: data.resType,
          dataList: data.dataList,
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
          {t("Define") +
            " " +
            t("AuthenticationDetails") +
            " - " +
            t("TokenBased")}
        </h3>
        <CloseIcon onClick={cancelFunc} className={styles.closeIcon} 
        id={`pmweb_tokenAuth_Close`}
        tabIndex={0}
        onKeyUp={(e)=>{
          if(e.key === "Enter"){
            cancelFunc();
            e.stopPropagation();
          }
        }}
        />
      </div>
      <div>
        <div className={styles.tokenHeader}>
          <div className={styles.tokenHeaderInput}>
            <label
              className={
                direction === RTL_DIRECTION
                  ? arabicStyles.webSLabel
                  : styles.webSLabel
              }
            >
              {t("AuthorizationURL")}
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
              inputValue={data?.authUrl}
              classTag={styles.webSInput}
              onChangeEvent={onChange}
              name="authUrl"
              idTag="webS_TokenAuth_authUrl"
              errorStatement={error?.authUrl?.statement}
              errorSeverity={error?.authUrl?.severity}
              errorType={error?.authUrl?.errorType}
              readOnlyCondition={isScreenReadOnly}
              inlineError={true}
            />
          </div>
          <div className={styles.tokenHeaderDrop}>
            <label
              className={
                direction === RTL_DIRECTION
                  ? arabicStyles.webSLabel
                  : styles.webSLabel
              }
            >
              {t("OperationType")}
            </label>
            <CustomizedDropdown
              className={`webSSelect ${
                direction === RTL_DIRECTION
                  ? arabicStyles.webSSelect
                  : styles.webSSelect
              }`}
              variant="outlined"
              name="authOperation"
              value={data.authOperation}
              disabled={isScreenReadOnly}
              onChange={onChange}
              id="pmweb_webS_TokenAuth_authOp"
            >
              {OPERATION_DROPDOWN.map((option) => {
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
            </CustomizedDropdown>
          </div>
          <div className={styles.tokenHeaderDrop}>
            <label
              className={
                direction === RTL_DIRECTION
                  ? arabicStyles.webSLabel
                  : styles.webSLabel
              }
            >
              {t("RequestMediaType")}
            </label>
            <CustomizedDropdown
              className={`webSSelect ${
                direction === RTL_DIRECTION
                  ? arabicStyles.webSSelect
                  : styles.webSSelect
              }`}
              variant="outlined"
              name="reqType"
              value={data.reqType}
              disabled={isScreenReadOnly}
              onChange={onChange}
              id="pmweb_webS_TokenAuth_reqType"
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
            </CustomizedDropdown>
          </div>
          <div className={styles.tokenHeaderDrop}>
            <label
              className={
                direction === RTL_DIRECTION
                  ? arabicStyles.webSLabel
                  : styles.webSLabel
              }
            >
              {t("ResponseMediaType")}
            </label>
            <CustomizedDropdown
              className={`webSSelect ${
                direction === RTL_DIRECTION
                  ? arabicStyles.webSSelect
                  : styles.webSSelect
              }`}
              variant="outlined"
              name="resType"
              value={data.resType}
              disabled={isScreenReadOnly}
              onChange={onChange}
              id="pmweb_webS_TokenAuth_resType"
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
            </CustomizedDropdown>
          </div>
        </div>
        <div className={styles.tokenBody}>
          {data?.dataList?.length > 0 || bShowInput ? (
            <table>
              <thead className={styles.dataTableHead}>
                <tr className="w100">
                  <th
                    className={styles.dataTableHeadCell}
                    style={{ width: "25%" }}
                  >
                    <p
                      className={
                        direction === RTL_DIRECTION
                          ? arabicStyles.dataTableHeadCellContent
                          : styles.dataTableHeadCellContent
                      }
                    >
                      {t("variableName")}
                      <span
                        className={
                          direction === RTL_DIRECTION
                            ? arabicStyles.starIcon
                            : styles.starIcon
                        }
                      >
                        *
                      </span>
                    </p>
                  </th>
                  <th
                    className={styles.dataTableHeadCell}
                    style={{ width: "21%" }}
                  >
                    <p
                      className={
                        direction === RTL_DIRECTION
                          ? arabicStyles.dataTableHeadCellContent
                          : styles.dataTableHeadCellContent
                      }
                    >
                      {t("ControlType")}
                    </p>
                  </th>
                  <th
                    className={styles.dataTableHeadCell}
                    style={{ width: "21%" }}
                  >
                    <p
                      className={
                        direction === RTL_DIRECTION
                          ? arabicStyles.dataTableHeadCellContent
                          : styles.dataTableHeadCellContent
                      }
                    >
                      {t("type")}
                    </p>
                  </th>
                  <th
                    className={styles.dataTableHeadCell}
                    style={{ width: "15%" }}
                  >
                    <p
                      className={
                        direction === RTL_DIRECTION
                          ? arabicStyles.dataTableHeadCellContent
                          : styles.dataTableHeadCellContent
                      }
                      style={{ textAlign: "center" }}
                    >
                      {t("defaultValue")}
                      <span
                        className={
                          direction === RTL_DIRECTION
                            ? arabicStyles.starIcon
                            : styles.starIcon
                        }
                      >
                        *
                      </span>
                    </p>
                  </th>
                  <th
                    className={styles.dataTableHeadCell}
                    style={{ width: "18%" }}
                  >
                    {bShowInput || isScreenReadOnly ? null : (
                      <p
                        className={styles.dataEntryAddBtnHeader}
                        onClick={() => {
                          setShowInput(true);
                        }}
                        id={`${props.id}_all`}
                      >
                        {t("+Variable")}
                      </p>
                    )}
                  </th>
                </tr>
              </thead>
              <tbody className={styles.dataTableBody}>
                {bShowInput ? (
                  <tr
                    className={`${styles.dataTableRow} w100`}
                    style={{ background: "#0072C61A" }}
                  >
                    <td
                      className={styles.dataTableBodyCell}
                      style={{ width: "25%" }}
                    >
                      <input
                        className={
                          direction === RTL_DIRECTION
                            ? arabicStyles.inputField
                            : styles.inputField
                        }
                        name="variableName"
                        value={input.variableName}
                        onChange={onInputChange}
                        id="webS_TokenAuth_varName"
                      />
                    </td>
                    <td
                      className={styles.dataTableBodyCell}
                      style={{ width: "21%" }}
                    >
                      <Select
                        className={
                          direction === RTL_DIRECTION
                            ? arabicStyles.selectField
                            : styles.selectField
                        }
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
                        value={input.controlType}
                        name="controlType"
                        onChange={onInputChange}
                        id="webS_TokenAuth_controlType"
                      >
                        {SCOPE_OPTIONS.map((opt) => {
                          return (
                            <MenuItem
                              className={
                                direction === RTL_DIRECTION
                                  ? arabicStyles.dropdownData
                                  : styles.dropdownData
                              }
                              value={opt}
                            >
                              {t(getScopeType(opt))}
                            </MenuItem>
                          );
                        })}
                      </Select>
                    </td>
                    <td
                      className={styles.dataTableBodyCell}
                      style={{ width: "21%" }}
                    >
                      <Select
                        className={
                          direction === RTL_DIRECTION
                            ? arabicStyles.selectField
                            : styles.selectField
                        }
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
                        value={input.type}
                        name="type"
                        onChange={onInputChange}
                        id="webS_TokenAuth_type"
                      >
                        {TOKEN_TYPE_DROPDOWN.map((opt) => {
                          return (
                            <MenuItem
                              className={
                                direction === RTL_DIRECTION
                                  ? arabicStyles.dropdownData
                                  : styles.dropdownData
                              }
                              value={opt}
                            >
                              {t(getTokenType(opt))}
                            </MenuItem>
                          );
                        })}
                      </Select>
                    </td>
                    <td
                      className={styles.dataTableBodyCell}
                      style={{ width: "15%" }}
                    >
                      <input
                        className={
                          direction === RTL_DIRECTION
                            ? arabicStyles.inputField
                            : styles.inputField
                        }
                        name="defaultVal"
                        value={input.defaultVal}
                        onChange={onInputChange}
                        id="webS_TokenAuth_defaultVal"
                      />
                    </td>
                    <td
                      className={styles.dataTableBodyCell}
                      style={{ width: "18%", textAlign: "center" }}
                    >
                      <button
                        className={
                          direction === RTL_DIRECTION
                            ? arabicStyles.closeButton
                            : styles.closeButton
                        }
                        onClick={() => {
                          setShowInput(false);
                          setInput({
                            variableName: "",
                            controlType: "H",
                            type: "I",
                            defaultVal: "",
                          });
                        }}
                        id="webS_TokenAuth_cancelIpt"
                      >
                        {t("cancel")}
                      </button>
                      <button
                        className={
                          input.variableName?.trim() === "" ||
                          input.defaultVal?.trim() === ""
                            ? styles.dataEntryDisableBtnHeader
                            : styles.dataEntryAddBtnHeader
                        }
                        id="webS_TokenAuth_addIpt"
                        onClick={addMember}
                        disabled={
                          input.variableName?.trim() === "" ||
                          input.defaultVal?.trim() === ""
                        }
                      >
                        {t("add")}
                      </button>
                    </td>
                  </tr>
                ) : null}
                {data?.dataList?.map((option, index) => {
                  return (
                    <tr className={`${styles.dataTableRow} w100`}>
                      <td
                        className={styles.dataTableBodyCell}
                        style={{ width: "25%" }}
                      >
                        <span
                          className={
                            direction === RTL_DIRECTION
                              ? arabicStyles.normalSpan
                              : styles.normalSpan
                          }
                        >
                          {option.ParamName}
                        </span>
                      </td>
                      <td
                        className={styles.dataTableBodyCell}
                        style={{ width: "21%" }}
                      >
                        <span
                          className={
                            direction === RTL_DIRECTION
                              ? arabicStyles.normalSpan
                              : styles.normalSpan
                          }
                        >
                          {getScopeType(option.style)}
                        </span>
                      </td>
                      <td
                        className={styles.dataTableBodyCell}
                        style={{ width: "21%" }}
                      >
                        <span
                          className={
                            direction === RTL_DIRECTION
                              ? arabicStyles.normalSpan
                              : styles.normalSpan
                          }
                        >
                          {getTokenType(option.mappedType)}
                        </span>
                      </td>
                      <td
                        className={styles.dataTableBodyCell}
                        style={{ width: "15%" }}
                      >
                        <span
                          className={
                            direction === RTL_DIRECTION
                              ? arabicStyles.normalSpan
                              : styles.normalSpan
                          }
                        >
                          {option.Value}
                        </span>
                      </td>
                      <td
                        className={styles.dataTableBodyCell}
                        style={{ width: "18%" }}
                      >
                        {!isScreenReadOnly && (
                          <button
                            className={`${styles.dataEntryAddBtnBody}`}
                            id={`${props.id}_item${index}`}
                            onClick={() => removeMember(index)}
                          >
                            <DeleteOutlineIcon className={styles.moreBtn} />
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          ) : (
            <div className={styles.noDefinedParamScreen}>
              <div>
                <img src={emptyStatePic} alt={t("noDefinedParam")}/>
                <p className={styles.noDefinedParamString}>
                  {t("noDefinedParam")}
                </p>
              </div>
              {!isScreenReadOnly && (
                <button
                  className={styles.primaryBtn}
                  id="noDefinedParam_TA_btn"
                  onClick={() => {
                    setShowInput(true);
                  }}
                >
                  {t("addVariable")}
                </button>
              )}
            </div>
          )}
        </div>
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
          id="webS_TokenAuth_cancel"
        >
          {t("cancel")}
        </button>
        <button
          className={styles.okButton}
          onClick={submitFunc}
          id="webS_TokenAuth_OK"
        >
          {t("save")}
        </button>
      </div>
    </div>
  );
}

export default TokenAuthModal;
