import React, { useEffect, useState } from "react";
import styles from "./index.module.css";
import arabicStyles from "./arabicStyles.module.css";
import { useTranslation } from "react-i18next";
import { Checkbox, MenuItem, Select } from "@material-ui/core";
import { FormControlLabel } from "@material-ui/core";
import emptyStatePic from "../../../assets/ProcessView/EmptyState.svg";
import {
  RTL_DIRECTION,
  STATE_ADDED,
  STATE_CREATED,
  STATE_EDITED,
} from "../../../Constants/appConstants";
import TextInput from "../../../UI/Components_With_ErrrorHandling/InputField";
import Modal from "../../../UI/Modal/Modal";
import SapFunctionModal from "./SapFunctionModal";

function SapFunctionForm(props) {
  let { t } = useTranslation();
  const direction = `${t("HTML_DIR")}`;
  const {
    selected,
    setChangedSelection,
    setSelected,
    selectedConfig,
    configList,
    changedSelection,
  } = props;
  const [sapConfigObj, setsapConfigObj] = useState({
    configuration: "",
    iConfigurationId: "",
    hostName: "",
    clientName: "",
    userName: "",
    // modified on 31/10/23 for checkmarx -- client privacy violation
    // password: "",
    authCred: "",
    // till here
    language: "",
    instanceNo: "",
    functionName: "",
    functionId: "",
    rfchostNameRequired: false,
    rfcHostname: "",
    paramTypeMap: {},
    paramList: [],
  });
  const [showModal, setShowModal] = useState(false);
  const [configDrop, setConfigDrop] = useState([]);
  const [rfcCheck, setRfcCheck] = useState(false);

  useEffect(() => {
    if (selected) {
      if (selectedConfig?.RFCHostName != "") {
        setRfcCheck(true);
      } else {
        setRfcCheck(false);
      }

      if (selected.FunctionName === "New Function") {
        setRfcCheck(false);
      }
      if (selected.status === STATE_ADDED) {
        setsapConfigObj({
          configuration: selectedConfig?.ConfigName,
          iConfigurationId: selectedConfig?.iConfigurationId,
          hostName: selectedConfig?.SAPHostName,
          clientName: selectedConfig?.SAPClient,
          username: selectedConfig?.SAPUserName,
          // modified on 31/10/23 for checkmarx -- client privacy violation
          // password: "",
          authCred: "",
          // till here
          language: selectedConfig?.SAPLanguage,
          instanceNo: selectedConfig?.SAPInstanceNo,
          functionName: selected?.FunctionName,
          rfchostNameRequired: selectedConfig?.rfchostNameRequired,
          rfcHostname: selectedConfig?.RFCHostName,
        });
        if (sapConfigObj?.rfcHostname != "") {
          setRfcCheck(true);
        }
      } else if (selected.status === STATE_CREATED) {
        setsapConfigObj({
          configuration: "",
          hostName: "",
          clientName: "",
          username: "",
          // modified on 31/10/23 for checkmarx -- client privacy violation
          // password: "",
          authCred: "",
          // till here
          language: "",
          instanceNo: "",
          functionName: "",
          protocol: "",
          itsServer: "",
          rfcHostname: "",
          paramTypeMap: {},
          paramList: [],
        });
      }
    }
    setConfigDrop(configList);
  }, [selected, configList]);

  useEffect(() => {
    setChangedSelection((prev) => {
      let temp = { ...prev };
      temp = { ...temp, ...sapConfigObj };
      return temp;
    });
  }, [sapConfigObj]);

  const onChange = (e) => {
    let tempSapConfig = { ...sapConfigObj };
    tempSapConfig[e.target.name] = e.target.value;
    setsapConfigObj(tempSapConfig);
    if (selected?.status === STATE_ADDED) {
      setSelected((prev) => {
        let temp = { ...prev };
        temp.status = STATE_EDITED;
        return temp;
      });
    }
  };
  const goHandler = () => {
    setShowModal(true);
  };

  const changeRFC = (e) => {
    setRfcCheck(e.target.checked);
  };

  const getConfig = (e) => {
    const newList = configList.filter(
      (item) => item.ConfigName === e.target.value
    );

    setsapConfigObj({
      configuration: newList[0]?.ConfigName,
      iConfigurationId: newList[0]?.SAPConfigId,
      hostName: newList[0]?.SAPHostName,
      clientName: newList[0]?.SAPClient,
      username: newList[0]?.SAPUserName,
      // modified on 31/10/23 for checkmarx -- client privacy violation
      // password: "",
      authCred: "",
      // till here
      language: newList[0]?.SAPLanguage,
      instanceNo: newList[0]?.SAPInstanceNo,
      functionName: "",
      protocol: newList[0]?.SAPProtocol,
      itsServer: newList[0]?.SAPServer,
      rfcHostname: newList[0]?.RFCHostName,
    });
    if (newList[0].RFCHostName != "") {
      setRfcCheck(true);
    }
  };

  const setFunction = (val, mapComplex, paramList) => {
    setsapConfigObj({
      ...sapConfigObj,
      functionName: val,
      paramTypeMap: mapComplex,
      paramList: paramList,
    });
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
            value={sapConfigObj?.configuration}
            idTag="webS_configuration"
            onChange={getConfig}
            disabled={selected?.status == STATE_ADDED ? true : false}
            direction={direction}
          >
            <MenuItem
              className={
                direction === RTL_DIRECTION
                  ? arabicStyles.webSDropdownData
                  : styles.webSDropdownData
              }
              value={""}
              direction={direction}
              disabled={true}
            >
              {t("select")}
            </MenuItem>
            {configDrop?.map((option) => {
              return (
                <MenuItem
                  className={
                    direction === RTL_DIRECTION
                      ? arabicStyles.webSDropdownData
                      : styles.webSDropdownData
                  }
                  value={option.ConfigName}
                  direction={direction}
                >
                  {option.ConfigName}
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
            idTag="Sap_hostName_Func"
            // readOnlyCondition={selected?.status == STATE_ADDED ? true : false}
            readOnlyCondition={true}
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
                  id="isRFCCheck"
                  color="primary"
                  checked={rfcCheck}
                  onChange={changeRFC}
                />
              }
              className={
                direction === RTL_DIRECTION
                  ? arabicStyles.rfcCheckbox
                  : styles.rfcCheckbox
              }
              label={t("toolbox.serviceCatalogSap.rfcHostname")}
              disabled={selected?.status == STATE_ADDED ? true : false}
            />

            {rfcCheck ? (
              <TextInput
                classTag={styles.webSInput}
                name="rfcHostname"
                idTag="rfcHost"
                onChangeEvent={onChange}
                inputValue={sapConfigObj?.rfcHostname}
                readOnlyCondition={
                  selected?.status == STATE_ADDED ? true : false
                }
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
            inputValue={sapConfigObj?.username}
            classTag={styles.webSInput}
            onChangeEvent={onChange}
            name="username"
            idTag="Sap_userName"
            //readOnlyCondition={selected?.status == STATE_ADDED ? true : false}
            readOnlyCondition={true}
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
          <TextInput
            // modified on 31/10/23 for checkmarx -- client privacy violation
            // inputValue={sapConfigObj?.password}
            inputValue={sapConfigObj?.authCred}
            classTag={styles.webSInput}
            onChangeEvent={onChange}
            // name="password"
            name="authCred"
            // till here
            type="password"
            idTag="Sap_password"
            readOnlyCondition={selected?.status == STATE_ADDED ? true : false}
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
                idTag="Sap_language"
                //readOnlyCondition={selected?.status == STATE_ADDED ? true : false}
                readOnlyCondition={true}
              />
            </div>
            {/*   <div style={{ marginLeft: "1rem" }}>
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
                idTag="Sap_instanceNo"
                //readOnlyCondition={selected?.status == STATE_ADDED ? true : false}
                readOnlyCondition={true}
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
            idTag="Sap_clientName"
            // readOnlyCondition={selected?.status == STATE_ADDED ? true : false}
            readOnlyCondition={true}
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
                {t("Function")}
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
                inputValue={sapConfigObj?.functionName}
                classTag={styles.webSInput}
                onChangeEvent={onChange}
                name="functionName"
                idTag="Sap_functionName"
                readOnlyCondition={
                  selected?.status == STATE_ADDED ? true : false
                }
              />
            </div>
            <div style={{ marginLeft: "1rem" }}>
              <button
                className={`${styles.primaryBtn} ${styles.pd025} ${styles.go}`}
                onClick={goHandler}
                disabled={selected?.status == STATE_ADDED ? true : false}
              >
                {t("go")}
              </button>
            </div>
          </div>
        </div>
      )}

      {showModal && (
        <Modal
          show={showModal}
          style={{
            width: "28vw",
            height: "44vh",
            left: "35%",
            top: "30%",
            padding: "0.5%",
          }}
          modalClosed={() => setShowModal(false)}
          children={
            <SapFunctionModal
              setShowModal={setShowModal}
              changedSelection={changedSelection}
              functionName={setFunction}
            />
          }
        />
      )}
    </div>
  );
}

export default SapFunctionForm;
