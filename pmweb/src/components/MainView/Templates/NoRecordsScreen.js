import React from "react";
import { useTranslation } from "react-i18next";
import styles from "./template.module.css";

function NoRecordsScreen() {
  let { t } = useTranslation();

  return <div className={styles.noRecordDiv}>{t("noRecords")}</div>;
}

export default NoRecordsScreen;
