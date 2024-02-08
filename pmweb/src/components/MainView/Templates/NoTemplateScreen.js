import React from "react";
import { useTranslation } from "react-i18next";
import emptyStatePic from "../../../assets/icons/NoTemplateFound.svg";
import styles from "./template.module.css";

function NoTemplateScreen() {
  let { t } = useTranslation();

  return (
    <div className={styles.noSelectedCategoryScreen}>
      {/* Changes made to solve Bug 121780 */}
      <img
        src={emptyStatePic}
        style={{ height: "200px" }}
        alt={t("noTemplateScreen")}
      />
      <p className={styles.noSelectedCategoryString}>{t("noTemplateScreen")}</p>
    </div>
  );
}

export default NoTemplateScreen;
