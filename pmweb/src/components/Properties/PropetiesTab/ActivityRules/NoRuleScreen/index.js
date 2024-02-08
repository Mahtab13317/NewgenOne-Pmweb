import React from "react";
import styles from "./index.module.css";
import { useTranslation } from "react-i18next";
import EmptyStateIcon from "../../../../../assets/ProcessView/EmptyState.svg";

function NoRulesScreen(props) {
  const { isProcessReadOnly } = props;
  let { t } = useTranslation();

  return (
    <div className={styles.emptyStateMainDiv}>
      <img
        className={styles.emptyStateImage}
        src={EmptyStateIcon}
        alt={t("emptyState")}
        style={{ marginTop: props.calledFromAction ? "4rem" : "6rem" }}
      />
      {!isProcessReadOnly ? (
        props.calledFromAction ? (
          <p className={styles.emptyStateHeading}>{t("createAction")}</p>
        ) : (
          <p className={styles.emptyStateHeading}>{t("createRules")}</p>
        )
      ) : null}
      <p className={styles.emptyStateText}>
        {props.calledFromAction ? t("noActionAdded") : t("noRulesAdded")}
        {isProcessReadOnly
          ? "."
          : props.calledFromAction
          ? t("pleaseCreateAction")
          : t("pleaseCreateRules")}
      </p>
    </div>
  );
}

export default NoRulesScreen;
