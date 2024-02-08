import React from "react";
import styles from "./index.module.css";
import { useTranslation } from "react-i18next";
import EmptyStateIcon from "../../../../../../../assets/ProcessView/EmptyState.svg";

function NoRulesScreen(props) {
  const { isProcessReadOnly } = props;
  let { t } = useTranslation();

  return (
    <div className={styles.emptyStateMainDiv}>
      <img
        className={styles.emptyStateImage}
        src={EmptyStateIcon}
        alt={t("emptyState")}
        style={{
          marginTop: "4rem",
        }}
      />
      {!isProcessReadOnly ? (
        <p className={styles.emptyStateHeading}>{t("createRules")}</p>
      ) : null}
      <p className={styles.emptyStateText}>
        {t("noRulesAdded")}
        {isProcessReadOnly ? "." : t("pleaseCreateRules")}
      </p>
    </div>
  );
}

export default NoRulesScreen;
