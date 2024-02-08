import { FormControlLabel, Radio, RadioGroup } from "@material-ui/core";
import React, { useEffect, useState, useRef } from "react";
import {
  GLOBAL_SCOPE,
  LOCAL_SCOPE,
  RTL_DIRECTION,
  STATE_CREATED,
  WEBSERVICE_REST,
  WEBSERVICE_SOAP,
} from "../../../../../../../Constants/appConstants";
import styles from "../index.module.css";
import arabicStyles from "../arabicStyles.module.css";
import { useTranslation } from "react-i18next";
import SOAPDefinition from "./SOAPDefinition";
import RESTDefinition from "./RESTDefinition";
import { useMediaQuery } from "@material-ui/core";

function WebServiceDefinition(props) {
  let { t } = useTranslation();
  const direction = `${t("HTML_DIR")}`;
  let {
    selected,
    setChangedSelection,
    setSelected,
    error,
    setError,
    isScreenReadOnly,
  } = props;
  const [webServiceType, setWebServiceType] = useState(WEBSERVICE_SOAP);
  const readOnlyProcess = selected?.status !== STATE_CREATED;
  const WebserviceRefSoap = useRef();
  const WebserviceRefRest = useRef();
  const smallScreen = useMediaQuery("(max-width:1282px)");
  const smallScreen2 = useMediaQuery("(max-width:810px)");

  useEffect(() => {
    setChangedSelection((prev) => {
      let temp = { ...prev };
      temp.webserviceType = webServiceType;
      return temp;
    });
  }, [webServiceType]);

  useEffect(() => {
    if (selected) {
      setWebServiceType(selected.webserviceType);
    }
  }, [selected]);

  return (
    <div
      className={styles.webSDefinitionDiv}
      /* Changes modified to solve Bug 138199  */

      /*  style={
        props.scope === LOCAL_SCOPE
          ? {
              height:
                props.callLocation === "webServicePropTab"
                  ? "50vh"
                  : "60vh",
            }
          : {}
      }*/
      style={
        props.scope === LOCAL_SCOPE
          ? {
              height:
                props.callLocation === "webServicePropTab"
                  ? smallScreen
                    ? "42vh"
                    : "50vh"
                      // Changes to resolve the bug Id 134119
                  :smallScreen2?"65vh":smallScreen?"56vh": "60vh",
            }
          : {}
      }
    >
      <label
        className={
          direction === RTL_DIRECTION
            ? arabicStyles.webSHeadLabel
            : styles.webSHeadLabel
        }
      >
        <span>{t("Scope")}:</span>{" "}
        <span>
          {props.scope === GLOBAL_SCOPE
            ? t("global")
            : selected?.status === STATE_CREATED
            ? t("Local")
            : (selected?.webserviceType === WEBSERVICE_SOAP &&
                selected?.MethodType === GLOBAL_SCOPE) ||
              (selected?.webserviceType === WEBSERVICE_REST &&
                selected?.RestScopeType === GLOBAL_SCOPE)
            ? t("global")
            : t("Local")}
        </span>
      </label>
      <label
        className={
          direction === RTL_DIRECTION
            ? arabicStyles.webSLabel
            : styles.webSLabel
        }
      >
        {t("webService")} {t("type")}
      </label>
      <RadioGroup
        name="webserviceType"
        className={
          direction === RTL_DIRECTION
            ? arabicStyles.webS_radioDiv
            : styles.webS_radioDiv
        }
        value={webServiceType}
        onChange={(e) => {
          setWebServiceType(e.target.value);
        }}
        // ref={WebserviceRef}
        // onKeyUp={(e) => {
        //   if (e.key === "Enter") {
        //     WebserviceRef.current.click();
        //     e.stopPropagation();
        //   }
        // }}
      >
        <FormControlLabel
          value={WEBSERVICE_SOAP}
          control={<Radio />}
          disabled={readOnlyProcess}
          label={t("SOAP")}
          id="pmweb_webserviceType_SOAPOpt"
          className={
            direction === RTL_DIRECTION
              ? arabicStyles.webS_radioButton
              : styles.webS_radioButton
          }
          // tabIndex={readOnlyProcess ? -1 : 0}
          ref={WebserviceRefSoap}
          onKeyUp={(e) => {
            if (e.key === "Enter") {
              WebserviceRefSoap.current.click();
              e.stopPropagation();
            }
          }}
        />
        <FormControlLabel
          value={WEBSERVICE_REST}
          control={<Radio />}
          disabled={readOnlyProcess}
          label={t("RESTful")}
          id="pmweb_webserviceType_RESTOpt"
          className={
            direction === RTL_DIRECTION
              ? arabicStyles.webS_radioButton
              : styles.webS_radioButton
          }
          // tabIndex={readOnlyProcess ? -1 : 0}
          ref={WebserviceRefRest}
          onKeyUp={(e) => {
            if (e.key === "Enter") {
              WebserviceRefRest.current.click();
              e.stopPropagation();
            }
          }}
        />
      </RadioGroup>
      {webServiceType === WEBSERVICE_SOAP ? (
        <SOAPDefinition
          selected={selected}
          setChangedSelection={setChangedSelection}
          setSelected={setSelected}
          error={error}
          setError={setError}
          isScreenReadOnly={isScreenReadOnly}
        />
      ) : (
        <RESTDefinition
          selected={selected}
          setChangedSelection={setChangedSelection}
          setSelected={setSelected}
          error={error}
          isScreenReadOnly={isScreenReadOnly}
          scope={props?.scope}
        />
      )}
    </div>
  );
}

export default WebServiceDefinition;
