import React from "react";
import { useTranslation } from "react-i18next";
import emptyStatePic from "../../../assets/ProcessView/EmptyState.svg";
import styles from "./trigger.module.css";
import { RTL_DIRECTION } from "../../../Constants/appConstants";

function NoSelectedTriggerScreen() {
  let { t } = useTranslation();
  const direction = `${t("HTML_DIR")}`;

  return (
    <div
      className={styles.noSelectedTriggerScreen}
      style={{ right: direction === RTL_DIRECTION ? "55%" : "30%" }} //Changes made to solve Bug 139368
    >
      <img src={emptyStatePic} alt={t("noTriggerSelected")} />
      <p className={styles.notriggerAddedString}>{t("noTriggerSelected")}</p>
    </div>
  );
}

export default NoSelectedTriggerScreen;
