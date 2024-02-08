import React from "react";
import styles from "./index.module.css";
import arabicStyles from "./arabicStyles.module.css";
import { useTranslation } from "react-i18next";
import emptyStatePic from "../../../../../../assets/ProcessView/EmptyState.svg";
import { RTL_DIRECTION } from "../../../../../../Constants/appConstants";

function ProcessAssociation(props) {
  let { t } = useTranslation();
  const direction = `${t("HTML_DIR")}`;
  let { processAssociation } = props;

  return (
    <div className={styles.webSProcessAssociation}>
      {processAssociation?.length > 0 ? (
        <React.Fragment>
          <label
            className={
              direction === RTL_DIRECTION
                ? arabicStyles.webSHeadLabel
                : styles.webSHeadLabel
            }
          >
            {t("ObjectDependencies")}
          </label>
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
              {/*code added on 14 Sep 2022 for BugId 111023 */}
              {processAssociation?.map((item) => {
                return (
                  <div
                    className={
                      direction === RTL_DIRECTION
                        ? arabicStyles.PA_tableRow
                        : styles.PA_tableRow
                    }
                  >
                    <span className={styles.nameDiv}>
                      {item.ObjectTypeName}
                    </span>
                    <span className={styles.typeDiv}>{item.ObjectType}</span>
                    <span className={styles.assocDiv}>{item.Assoc}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </React.Fragment>
      ) : (
        <div className={styles.noProcessAssociationScreen}>
          <img src={emptyStatePic} alt={t("noProcessAssociation")} />
          <p className={styles.noProcessAssociationString}>
            {t("noProcessAssociation")}
          </p>
        </div>
      )}
    </div>
  );
}

export default ProcessAssociation;
