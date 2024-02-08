import React from "react";
import { getVariableType } from "../../../utility/ProcessSettings/Triggers/getVariableType";
import { useTranslation } from "react-i18next";
import styles from "./index.module.css";
import arabicStyles from "./arabicStyles.module.css";
import { Checkbox } from "@material-ui/core";
import { RTL_DIRECTION } from "../../../Constants/appConstants";

function ParamDivOnHover(props) {
  let { t } = useTranslation();
  const direction = `${t("HTML_DIR")}`;
  return (
    <div className={styles.paramDiv} style={{direction : direction}}>
      <div className={styles.paramHeadDiv}>
        <span className={styles.paramName}>{t("name")}</span>
        <span className={styles.paramType}>{t("type")}</span>
        <span className={styles.paramArray}>{t("array")}</span>
      </div>
      <div className={styles.paramBodyDiv}>
        {props.parameters?.map((param) => {
          return (
            <div className={styles.paramRow}>
              <span className={styles.paramName}>{param.ParamName}</span>
              <span className={styles.paramType}>
                {getVariableType(param.ParamType)}
              </span>
              <span className={styles.paramArray}>
                <Checkbox
                  checked={param.Unbounded === "Y"}
                  disabled={true}
                  className={
                    direction === RTL_DIRECTION
                      ? arabicStyles.properties_radioButton
                      : styles.properties_radioButton
                  }
                  color="primary"
                />
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default ParamDivOnHover;
