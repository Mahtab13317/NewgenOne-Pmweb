import React from "react";
import { useTranslation } from "react-i18next";
import { getVariableType } from "../../../../utility/ProcessSettings/Triggers/getVariableType";
import styles from "./index.module.css";
import "../common.css";
import PublicIcon from "@material-ui/icons/Public";
import Tooltip from "@material-ui/core/Tooltip";
import { withStyles } from "@material-ui/core/styles";
import ParamDivOnHover from "../ParamDivOnHover";
import {
  GLOBAL_SCOPE,
  RTL_DIRECTION,
  SYSTEM_DEFINED_SCOPE,
} from "../../../../Constants/appConstants";
import arabicStyles from "./arabicStyles.module.css";
import { LightTooltip } from "../../../../UI/StyledTooltip";

function SystemDefined(props) {
  let { t } = useTranslation();
  const direction = `${t("HTML_DIR")}`;
  let { methodList } = props;

  const ParamTooltip = withStyles((theme) => ({
    tooltip: {
      background: "#FFFFFF 0% 0% no-repeat padding-box",
      boxShadow: "0px 3px 6px #00000029",
      border: "1px solid #70707075",
      font: "normal normal normal 12px/17px Open Sans",
      letterSpacing: "0px",
      color: "#000000",
      zIndex: "100",
      transform: "translate3d(0px, -0.125rem, 0px) !important",
    },
    arrow: {
      "&:before": {
        backgroundColor: "#FFFFFF !important",
        border: "1px solid #70707075 !important",
        zIndex: "100",
      },
    },
  }))(Tooltip);

  return (
    <div className={styles.mainDiv}>
      <div className={styles.headerDiv}>
        <p
          className={
            direction === RTL_DIRECTION ? arabicStyles.iconDiv : styles.iconDiv
          }
        ></p>
        <p
          className={
            direction === RTL_DIRECTION
              ? arabicStyles.variableName
              : styles.variableName
          }
        >
          {t("applicationName")}
        </p>
        <p
          className={
            direction === RTL_DIRECTION
              ? arabicStyles.dataType
              : styles.dataType
          }
        >{`${t("method")} ${t("name")}`}</p>
        <p
          className={
            direction === RTL_DIRECTION
              ? arabicStyles.variableLength
              : styles.variableLength
          }
        >
          {t("returnType")}
        </p>
        <p
          className={
            direction === RTL_DIRECTION
              ? arabicStyles.variableLength
              : styles.variableLength
          }
        ></p>
      </div>
      <div className={styles.bodyDiv}>
        {methodList
          ?.filter((e) => e.AppType === SYSTEM_DEFINED_SCOPE)
          .map((d) => {
            return (
              <div className={styles.dataDiv}>
                <p
                  className={
                    direction === RTL_DIRECTION
                      ? arabicStyles.iconDiv
                      : styles.iconDiv
                  }
                >
                  {d.MethodType === GLOBAL_SCOPE ? (
                    <ParamTooltip
                      enterDelay={500}
                      arrow
                      placement="bottom"
                      title={t("globalMethod")}
                    >
                      <PublicIcon className={styles.globalVarIcon} />
                    </ParamTooltip>
                  ) : null}
                </p>
                <p
                  className={
                    direction === RTL_DIRECTION
                      ? arabicStyles.variableNameData
                      : styles.variableNameData
                  }
                >
                  {d.AppName}
                </p>
                <LightTooltip title={d.MethodName}>
                  <p
                    className={
                      direction === RTL_DIRECTION
                        ? arabicStyles.dataTypeValue
                        : styles.dataTypeValue
                    }
                    style={{
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                      overflow: "hidden",
                    }} //code added on 23-09-23 for bugId: 138197
                  >
                    {d.MethodName}
                  </p>
                </LightTooltip>
                <p
                  className={
                    direction === RTL_DIRECTION
                      ? arabicStyles.variableLengthData
                      : styles.variableLengthData
                  }
                >
                  {d.ReturnType.trim() !== ""
                    ? getVariableType(d.ReturnType)
                    : t("Void")}
                </p>
                <p
                  className={
                    direction === RTL_DIRECTION
                      ? arabicStyles.variableLengthData
                      : styles.variableLengthData
                  }
                >
                  {d.Parameter?.length > 0 ? (
                    d.Parameter.length > 1 ? (
                      <ParamTooltip
                        enterDelay={500}
                        arrow
                        placement={
                          direction === RTL_DIRECTION ? "left" : "right"
                        }
                        title={
                          <React.Fragment>
                            <ParamDivOnHover parameters={d.Parameter} />
                          </React.Fragment>
                        }
                      >
                        <span
                          className={
                            direction === RTL_DIRECTION
                              ? arabicStyles.paramCount
                              : styles.paramCount
                          }
                        >
                          {t("accepts")} {d.Parameter.length} {t("parameters")}
                        </span>
                      </ParamTooltip>
                    ) : (
                      <ParamTooltip
                        enterDelay={500}
                        arrow
                        placement={
                          direction === RTL_DIRECTION ? "left" : "right"
                        }
                        title={
                          <React.Fragment>
                            <ParamDivOnHover parameters={d.Parameter} />
                          </React.Fragment>
                        }
                      >
                        <span
                          className={
                            direction === RTL_DIRECTION
                              ? arabicStyles.paramCount
                              : styles.paramCount
                          }
                        >
                          {t("accepts")} 1 {t("parameter")}
                        </span>
                      </ParamTooltip>
                    )
                  ) : null}
                </p>
              </div>
            );
          })}
      </div>
    </div>
  );
}

export default SystemDefined;
