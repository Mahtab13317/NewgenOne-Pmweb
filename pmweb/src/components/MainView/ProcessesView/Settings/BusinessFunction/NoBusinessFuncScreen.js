import React from "react";
import { useTranslation } from "react-i18next";
import emptyStatePic from "../../../../../assets/ProcessView/EmptyState.svg";
import styles from "../ServiceCatalog/Webservice/index.module.css";

function NoBusinessFuncScreen(props) {
  let { t } = useTranslation();

  return (
    <div className={styles.noWebSScreen}>
      <div>
        <img src={emptyStatePic} alt={t("noBusinessFuncAdded")} />
        <p className={styles.nowebSAddedString}>{t("noBusinessFuncAdded")}</p>
      </div>
    </div>
  );
}

export default NoBusinessFuncScreen;
