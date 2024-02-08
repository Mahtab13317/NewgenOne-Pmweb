import React from "react";
import styles from "./index.module.css";
import arabicStyles from "./arabicStyles.module.css";
import { useTranslation } from "react-i18next";
import { RTL_DIRECTION } from "../../Constants/appConstants";
import CloseIcon from "@material-ui/icons/Close";
import { useSelector } from "react-redux";
import { IconButton, Tooltip } from "@material-ui/core";
//import FocusTrap from "focus-trap-react";
import { FocusTrap } from "@mui/base";

function ObjectDependencies(props) {
  let { t } = useTranslation();
  const direction = `${t("HTML_DIR")}`;
  let { processAssociation, cancelFunc } = props;
  const errorMessage = useSelector(
    (state) => state.activityReducer.errorMessage
  );

  return (
    <FocusTrap open>
      <div>
        <div className={styles.modalHeader}>
          <h3
            className={
              direction === RTL_DIRECTION
                ? arabicStyles.modalHeading
                : styles.modalHeading
            }
          >
            {t("ObjectDependencies")}
          </h3>
          <IconButton
            id="pmweb_ObjectDep_Close"
            className={styles.iconButton}
            tabIndex={0}
            onKeyUp={(e) => {
              if (e.key === "Enter") {
                cancelFunc();
                e.stopPropagation();
              }
            }}
            onClick={cancelFunc}
            disableFocusRipple
            disableTouchRipple
            aria-label="Close"
          >
            <CloseIcon className={styles.closeIcon} />
          </IconButton>
        </div>
        <p className={styles.modalSubHeading}>
          {errorMessage || t("objectDependencyStmt")}
        </p>
        <div className={styles.webS_PA_table}>
          <div
            className={
              direction === RTL_DIRECTION
                ? arabicStyles.PA_tableHeader
                : styles.PA_tableHeader
            }
          >
            <span className={styles.nameDiv}>
              {t("Object")} {t("name")}
            </span>
            <span className={styles.typeDiv}>{t("type")}</span>
            <span className={styles.assocDiv}>{t("Association")}</span>
          </div>
          <div className={styles.PA_tableBody}>
            {processAssociation?.map((item) => {
              return (
                <div
                  className={
                    direction === RTL_DIRECTION
                      ? arabicStyles.PA_tableRow
                      : styles.PA_tableRow
                  }
                >
                  <Tooltip title={item.ObjectTypeName}>
                    <span className={styles.nameDiv}>
                      {item.ObjectTypeName}
                    </span>
                  </Tooltip>{" "}
                  {/*Added code for bug 135817 on 06-09-23*/}
                  <Tooltip title={item.ObjectType}>
                    <span className={styles.typeDiv}>{item.ObjectType}</span>
                  </Tooltip>
                  <Tooltip title={item.Assoc}>
                    <span className={styles.assocDiv}>{item.Assoc}</span>
                  </Tooltip>{" "}
                  {/*Till here*/}
                </div>
              );
            })}
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
            id="pmweb_ObjectDep_Close"
          >
            {t("Close")}
          </button>
        </div>
      </div>
    </FocusTrap>
  );
}

export default ObjectDependencies;
