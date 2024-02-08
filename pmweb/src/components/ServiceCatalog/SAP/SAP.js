import React from "react";
import Tab from "../../../UI/Tab/Tab";
import { useTranslation } from "react-i18next";
import styles from "./index.module.css";
import Configuration from "./Configuration";
import Function from "./Function";

function SAP() {
  let { t } = useTranslation();
  const mainTabElements = [<Function />, <Configuration />];
  const mainTabLabels = [t("Functions"), t("Configuration")];
  return (
    <div className={styles.mainSAPDiv}>
      <Tab
        tabType={`${styles.mainTab} mainTab_sc`}
        tabBarStyle={styles.mainTabBarStyle}
        oneTabStyle={styles.mainOneTabStyle}
        TabNames={mainTabLabels}
        TabElement={mainTabElements}
      />
    </div>
  );
}

export default SAP;
