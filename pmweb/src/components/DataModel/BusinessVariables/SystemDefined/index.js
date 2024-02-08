import React from "react";
import { useTranslation } from "react-i18next";
import { useGlobalState } from "state-pool";
import { RTL_DIRECTION } from "../../../../Constants/appConstants";
import { getVariableTypeByScope } from "../../../../utility/DataModel/QueueVariables";
import { getVariableType } from "../../../../utility/ProcessSettings/Triggers/getVariableType";
import styles from "./index.module.css";
import arabicStyles from "./ArabicStyles.module.css";

function SystemDefined(props) {
  let { t } = useTranslation();
  const direction = `${t("HTML_DIR")}`;
  const [variableDefinition] = useGlobalState("variableDefinition");
  return (
    <div className={styles.mainDiv}>
      <div className={styles.headerDiv}>
        <p
          className={
            direction === RTL_DIRECTION
              ? arabicStyles.variableName
              : styles.variableName
          }
        >
          {t("variableName")}
        </p>
        <p
          className={
            direction === RTL_DIRECTION
              ? arabicStyles.dataType
              : styles.dataType
          }
        >
          {t("dataType")}
        </p>
        <p
          className={
            direction === RTL_DIRECTION
              ? arabicStyles.variableLength
              : styles.variableLength
          }
        >
          {t("length")}
        </p>
      </div>
      <div className={styles.dataMainDiv}>
        {variableDefinition
          ?.filter((e) => e.VariableScope === "M" || e.VariableScope === "S")
          ?.filter((e) =>
            e.VariableName.toLowerCase().includes(props.searchKey.toLowerCase())
          )
          ?.map((d) => {
            return (
              <div className={styles.dataDiv}>
                <p
                  className={
                    direction === RTL_DIRECTION
                      ? arabicStyles.variableNameData
                      : styles.variableNameData
                  }
                >
                  {d.VariableName}
                </p>
                <p
                  className={
                    direction === RTL_DIRECTION
                      ? arabicStyles.dataTypeValue
                      : styles.dataTypeValue
                  }
                >
                  {getVariableType(d.VariableType)}
                </p>
                <p
                  className={
                    direction === RTL_DIRECTION
                      ? arabicStyles.variableLengthData
                      : styles.variableLengthData
                  }
                >
                  {d.VariableLength}
                </p>
                {d.VariableScope === "M" ? (
                  <p className={styles.modifiableVariableType}>
                    <span className={styles.modifiableText}>
                      {t(getVariableTypeByScope(d.VariableScope))}
                    </span>
                  </p>
                ) : (
                  <p className={styles.nonModifiable}>
                    <span className={styles.nonModifiableText}>
                      {t(getVariableTypeByScope(d.VariableScope))}
                    </span>
                  </p>
                )}

                <p
                  className={
                    direction === RTL_DIRECTION
                      ? arabicStyles.defaultValueData
                      : styles.defaultValueData
                  }
                >
                  {d.DefaultValue && `${t("defaultValue")} : ${d.DefaultValue}`}
                </p>
              </div>
            );
          })}
      </div>
    </div>
  );
}

export default SystemDefined;
