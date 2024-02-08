import React, { useEffect, useState, useRef } from "react";
import styles from "../index.module.css";
import arabicStyles from "../arabicStyles.module.css";
import { useTranslation } from "react-i18next";
import { FormControlLabel, Radio, RadioGroup } from "@material-ui/core";
import {
  RTL_DIRECTION,
  STATE_CREATED,
  WEBSERVICE_REST_LOAD,
  WEBSERVICE_REST_MANUAL,
} from "../../../../../../../Constants/appConstants";
import REST_Load from "./REST_Load";
import REST_Manual from "./REST_Manual";

function RESTDefinition(props) {
  let { t } = useTranslation();
  const direction = `${t("HTML_DIR")}`;
  let { selected, setSelected, setChangedSelection, error, isScreenReadOnly } =
    props;
  const [webServiceType, setWebServiceType] = useState(WEBSERVICE_REST_MANUAL);

  const ManualRef = useRef();
  const LoadTempRef = useRef();

  useEffect(() => {
    setChangedSelection((prev) => {
      let temp = { ...prev };
      temp.restCreationMode = webServiceType;
      return temp;
    });
  }, [webServiceType]);

  useEffect(() => {
    if (selected) {
      if (selected.status !== STATE_CREATED) {
        setWebServiceType(selected.RestCreationMode);
      } else {
        setWebServiceType(WEBSERVICE_REST_MANUAL);
      }
    }
  }, [selected]);

  return (
    <div className={styles.webSDefinition}>
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
      >
        <FormControlLabel
          value={WEBSERVICE_REST_MANUAL}
          control={<Radio />}
          label={t("Manual")}
          id="pmweb_webS_ManualOpt"
          disabled={isScreenReadOnly}
          className={
            direction === RTL_DIRECTION
              ? arabicStyles.webS_radioButton
              : styles.webS_radioButton
          }
          tabIndex={isScreenReadOnly ? -1 : 0}
          ref={ManualRef}
          onKeyUp={(e) => {
            if (e.key === "Enter") {
              ManualRef.current.click();
              e.stopPropagation();
            }
          }}
        />
        <FormControlLabel
          value={WEBSERVICE_REST_LOAD}
          control={<Radio />}
          label={t("LoadTemplate")}
          id="pmweb_webS_LoadOpt"
          disabled={isScreenReadOnly}
          className={
            direction === RTL_DIRECTION
              ? arabicStyles.webS_radioButton
              : styles.webS_radioButton
          }
          tabIndex={isScreenReadOnly ? -1 : 0}
          ref={LoadTempRef}
          onKeyUp={(e) => {
            if (e.key === "Enter") {
              LoadTempRef.current.click();
              e.stopPropagation();
            }
          }}
        />
      </RadioGroup>
      {webServiceType === WEBSERVICE_REST_MANUAL ? (
        <REST_Manual
          selected={selected}
          setSelected={setSelected}
          setChangedSelection={setChangedSelection}
          error={error}
          isScreenReadOnly={isScreenReadOnly}
          scope={props?.scope}
        />
      ) : (
        <REST_Load />
      )}
    </div>
  );
}

export default RESTDefinition;
