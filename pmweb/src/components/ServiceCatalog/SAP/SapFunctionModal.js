import React, { useState, useEffect } from "react";
import styles from "./index.module.css";
import arabicStyles from "./arabicStyles.module.css";
import CloseIcon from "@material-ui/icons/Close";
import { useTranslation } from "react-i18next";
import {
  CircularProgress,
  FormControlLabel,
  Radio,
  RadioGroup,
  TextField,
} from "@material-ui/core";
import {
  ENDPOINT_SAP_DETAIL,
  ENDPOINT_SAP_FUNCTION_METHOD,
  RTL_DIRECTION,
  SERVER_URL,
} from "../../../Constants/appConstants";
import { MenuItem, Select } from "@material-ui/core";
import TextInput from "../../../UI/Components_With_ErrrorHandling/InputField";
import axios from "axios";
import Autocomplete from "@material-ui/lab/Autocomplete";
import { makeStyles } from "@material-ui/core";
import "./sapModal.css";

const useStyles = makeStyles((theme) => ({}));

function SapFunctionModal(props) {
  const classes = useStyles();
  let { t } = useTranslation();
  const direction = `${t("HTML_DIR")}`;
  const [selctedRadio, setSelctedRadio] = useState("ListAll");
  const [allFunctionList, setAllFunctionList] = useState([]);
  const [allList, setallList] = useState(null);
  const [bussniessObj, setBussniessObj] = useState([]);
  const [businessObjectType, setbusinessObjectType] = useState(null);
  const [method, setmethod] = useState([]);
  const [selectedMethod, setselectedMethod] = useState(null);
  const [ABPAname, setABPAname] = useState("");
  const [functionSpinner, setFunctionSpinner] = useState(false);

  const cancelHandler = () => {
    props.setShowModal(false);
  };

  const createHandler = () => {
    let funcName = "";
    if (selctedRadio == "ListAll") {
      funcName = allList;
      // props.functionName(allList);
    } else {
      // props.functionName(ABPAname);
      funcName = ABPAname;
      //props.functionName(selectedMethod);
    }

    let json = {
      sapHostName: props.changedSelection.hostName,
      sapClient: props.changedSelection.clientName,
      sapUserName: props.changedSelection.username,
      // modified on 31/10/23 for checkmarx -- client privacy violation
      // sapAuthCred: props.changedSelection.password,
      sapAuthCred: props.changedSelection.authCred,
      // till here
      sapLanguage: props.changedSelection.language,
      sapInstanceNo: props.changedSelection.instanceNo,
      functionName: funcName,
    };
    axios
      .post(SERVER_URL + "/functionParameter?functionName=" + funcName, json)
      .then((res) => {
        //setmethod(res?.data?.ABAPFunction);
        props.functionName(
          funcName,
          res.data.mapComplexParamType,
          res.data.paramList
        );
      });

    props.setShowModal(false);
  };
  const radioBtnHandler = (e) => {
    setSelctedRadio(e.target.value);
  };

  const listAllHandler = (val) => {
    setallList(val.SAPFunctionModule);
  };

  const bussniessObjHandler = (e) => {
    setbusinessObjectType(e.target.value);
    let json = {
      /* strSAPHostName: props.changedSelection.hostName,
      strSAPClient: props.changedSelection.clientName,
      strSAPUserName: props.changedSelection.username,
      strSAPAuthCred: props.changedSelection.authCred,
      strSAPLanguage: props.changedSelection.language,
      strSAPInstanceNo: props.changedSelection.instanceNo, */
      sapHostName: props.changedSelection.hostName,
      sapClient: props.changedSelection.clientName,
      sapUserName: props.changedSelection.username,
      // modified on 31/10/23 for checkmarx -- client privacy violation
      // sapAuthCred: props.changedSelection.password,
      sapAuthCred: props.changedSelection.authCred,
      // till here
      sapLanguage: props.changedSelection.language,
      sapInstanceNo: props.changedSelection.instanceNo,
    };
    axios
      .post(SERVER_URL + ENDPOINT_SAP_FUNCTION_METHOD + e.target.value, json)
      .then((res) => {
        setmethod(res?.data?.ABAPFunction);
      });
  };
  const methodHandler = (e) => {
    setselectedMethod(e.target.value);
  };
  useEffect(() => {
    method?.map((el) => {
      if (el.MethodName == selectedMethod) {
        setABPAname(el.ABAPFunName);
      }
    });
  }, [selectedMethod, selctedRadio, ABPAname]);

  useEffect(() => {
    let json = {
      /* strSAPHostName: props.changedSelection.hostName,
      strSAPClient: props.changedSelection.clientName,
      strSAPUserName: props.changedSelection.username,
      strSAPAuthCred: props.changedSelection.authCred,
      strSAPLanguage: props.changedSelection.language,
      strSAPInstanceNo: props.changedSelection.instanceNo, */
      sapHostName: props.changedSelection.hostName,
      sapClient: props.changedSelection.clientName,
      sapUserName: props.changedSelection.username,
      // modified on 31/10/23 for checkmarx -- client privacy violation
      // sapAuthCred: props.changedSelection.password,
      sapAuthCred: props.changedSelection.authCred,
      // till here
      sapLanguage: props.changedSelection.language,
      sapInstanceNo: props.changedSelection.instanceNo,
    };
    if (selctedRadio == "ListAll") {
      setFunctionSpinner(true);
      axios
        .post(
          SERVER_URL + ENDPOINT_SAP_DETAIL + "?sapOption=" + selctedRadio,
          json
        )
        .then((res) => {
          if (res?.status === 200) {
            setAllFunctionList(res?.data?.SAPFunctionModules);
            setFunctionSpinner(false);
          }
        });
    } else {
      axios
        .post(
          SERVER_URL + ENDPOINT_SAP_DETAIL + "?sapOption=" + selctedRadio,
          json
        )
        .then((res) => {
          setBussniessObj(res?.data?.SAPBusinessObjects);
        });
    }
  }, [selctedRadio]);

  return (
    <React.Fragment>
      <div className="row">
        <p className="heading_create">{t("SAPFunction")}</p>
        <p
          className="close"
          onClick={cancelHandler}
          style={{ marginLeft: "auto", cursor: "pointer" }}
        >
          <CloseIcon />
        </p>
      </div>
      <hr className="hr" />

      <div style={{ marginTop: "1%" }}>
        <RadioGroup
          name="protocol"
          className={
            direction === RTL_DIRECTION
              ? arabicStyles.webS_radioDiv
              : styles.webS_radioDiv
          }
          value={selctedRadio}
          onChange={(e) => radioBtnHandler(e)}
        >
          <FormControlLabel
            value={"ListAll"}
            control={<Radio />}
            label={t("ListAll")}
            id="webS_ManualOpt"
            className={
              direction === RTL_DIRECTION
                ? arabicStyles.webS_radioButton
                : styles.webS_radioButton
            }
          />
          <FormControlLabel
            value={"BusinessObject"}
            control={<Radio />}
            label={t("bussinessObject")}
            id="webS_LoadOpt"
            className={
              direction === RTL_DIRECTION
                ? arabicStyles.webS_radioButton
                : styles.webS_radioButton
            }
          />
        </RadioGroup>
      </div>

      {selctedRadio == "ListAll" ? (
        <>
          <label
            className={
              direction === RTL_DIRECTION
                ? arabicStyles.webSLabel
                : styles.webSLabel
            }
          >
            {t("AvailableFunctionList")}
          </label>

          {!functionSpinner ? (
            <Autocomplete
              size="small"
              classes={classes}
              onChange={(event, newValue) => {
                listAllHandler(newValue);
              }}
              id="functionDropdown"
              name="configuration"
              options={allFunctionList}
              ListboxProps={{
                style: {
                  maxHeight: "350px",
                },
              }}
              getOptionLabel={(option) => option.SAPFunctionModule}
              renderInput={(params) => (
                <TextField {...params} variant="outlined" size="small" />
              )}
            />
          ) : (
            <CircularProgress
              style={{
                width: "2rem",
                height: "2rem",
              }}
            />
          )}
        </>
      ) : (
        <>
          <label
            className={
              direction === RTL_DIRECTION
                ? arabicStyles.webSLabel
                : styles.webSLabel
            }
          >
            {t("bussinessObjectType")}
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

          <Select
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
            name="configuration"
            value={businessObjectType}
            idTag="webS_configuration"
            onChange={bussniessObjHandler}
          >
            {bussniessObj?.length > 0 ? (
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
            ) : (
              <MenuItem>
                <CircularProgress
                  style={{
                    width: "2rem",
                    height: "2rem",
                  }}
                />
              </MenuItem>
            )}

            {bussniessObj?.map((option) => {
              return (
                <MenuItem
                  className={
                    direction === RTL_DIRECTION
                      ? arabicStyles.webSDropdownData
                      : styles.webSDropdownData
                  }
                  value={option.SAPBusinessObject}
                >
                  {option.SAPBusinessObject}
                </MenuItem>
              );
            })}
          </Select>

          <label
            className={
              direction === RTL_DIRECTION
                ? arabicStyles.webSLabel
                : styles.webSLabel
            }
          >
            {t("Method")}
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

          <Select
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
            name="configuration"
            value={selectedMethod}
            idTag="webS_configuration"
            onChange={methodHandler}
          >
            {method?.length > 0 ? (
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
            ) : (
              <MenuItem>
                <CircularProgress
                  style={{
                    width: "2rem",
                    height: "2rem",
                  }}
                />
              </MenuItem>
            )}

            {method?.map((option) => {
              return (
                <MenuItem
                  className={
                    direction === RTL_DIRECTION
                      ? arabicStyles.webSDropdownData
                      : styles.webSDropdownData
                  }
                  value={option.MethodName}
                >
                  {option.MethodName}
                </MenuItem>
              );
            })}
          </Select>

          <label
            className={
              direction === RTL_DIRECTION
                ? arabicStyles.webSLabel
                : styles.webSLabel
            }
          >
            {t("AbpsFunction")}
          </label>
          <TextInput
            classTag={styles.webSInput}
            inputValue={ABPAname}
            idTag="Sap_hostName"
          />
        </>
      )}

      <div className={styles.footerModal}>
        <button className="cancel" onClick={cancelHandler}>
          {t("cancel")}
        </button>
        <button
          className="create"
          style={{ marginRight: ".2rem" }}
          onClick={createHandler}
        >
          {t("Ok")}
        </button>
      </div>
    </React.Fragment>
  );
}

export default SapFunctionModal;
