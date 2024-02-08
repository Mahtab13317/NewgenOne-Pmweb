import React from "react";
import { useTranslation } from "react-i18next";
import styles from "./index.module.css";

function TemplatePropertiesScreen(props) {
  let { t } = useTranslation();
  let { selectedTemplate } = props;

  return (
    <React.Fragment>
      <label className={styles.propsLabel}>{t("ProductName")}</label>
      <p className={styles.propsValue}>{selectedTemplate.ProductName}</p>
      <label className={styles.propsLabel}>{t("CategoryName")}</label>
      <p className={styles.propsValue}>{selectedTemplate.CategoryName}</p>
      <label className={styles.propsLabel}>{t("ReportName")}</label>
      <p className={styles.propsValue}>{selectedTemplate.ReportName}</p>
      <label className={styles.propsLabel}>{t("CommunicationGroupName")}</label>
      <p className={styles.propsValue}>
        {selectedTemplate.CommunicationGroupName}
      </p>
      <label className={styles.propsLabel}>{t("Discription")}</label>
      <p className={styles.propsValue}>{selectedTemplate.Description}</p>
      <label className={styles.propsLabel}>{t("VersionNumber")}</label>
      <p className={styles.propsValue}>
        {(+selectedTemplate.ReportVersions).toFixed(1)}
      </p>
    </React.Fragment>
  );
}

export default TemplatePropertiesScreen;
