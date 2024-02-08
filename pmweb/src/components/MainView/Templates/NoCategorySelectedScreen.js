import React from "react";
import { useTranslation } from "react-i18next";
import emptyStatePic from "../../../assets/ProcessView/EmptyState.svg";
import styles from "./template.module.css";

function NoCategorySelectedScreen() {
  let { t } = useTranslation();

  return (
    <div className={styles.noSelectedCategoryScreen}>
      <img src={emptyStatePic} alt= {t("noCategorySelected")}/>
      <p className={styles.noSelectedCategoryString}>
        {t("noCategorySelected")}
      </p>
    </div>
  );
}

export default NoCategorySelectedScreen;
