import React from "react";
import Tab from "../../../../../UI/Tab/Tab";
import { useTranslation } from "react-i18next";
import styles from "./index.module.css";
import "./index.css";
import Webservice from "./Webservice";
import { GLOBAL_SCOPE } from "../../../../../Constants/appConstants";
import External from "../../../../ServiceCatalog/External";
import BusinessFunction from "../BusinessFunction";

function ServiceCatalog() {
  let { t } = useTranslation();
  const mainTabElements = [
    <Webservice scope={GLOBAL_SCOPE} isReadOnly={false} />,
    <External scope={GLOBAL_SCOPE} />,
    <BusinessFunction scope={GLOBAL_SCOPE} isReadOnly={false} />,
  ];
  const mainTabLabels = [t("webService"), t("catalog"), t("businessFunction")];

  return (
    <div className={styles.mainDiv} id="scrollable-auto-tab">
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

export default ServiceCatalog;
