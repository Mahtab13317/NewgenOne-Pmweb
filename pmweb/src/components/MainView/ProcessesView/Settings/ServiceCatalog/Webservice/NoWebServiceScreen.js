import React from "react";
import { useTranslation } from "react-i18next";
import emptyStatePic from "../../../../../../assets/ProcessView/EmptyState.svg";
import { Button } from "@material-ui/core";
import styles from "./index.module.css";

function NoWebServiceScreen(props) {
  let { t } = useTranslation();

  return (
    <div className={styles.noWebSScreen}>
      <div>
        <img src={emptyStatePic} alt={t("noWebServiceAdded")}/>
        <p className={styles.nowebSAddedString}>{t("noWebServiceAdded")}</p>
      </div>
      <Button
        className={styles.addWebSButton}
        onClick={() => props.addNewWebservice()}
        id="noWebServiceScreen_add_btn"
      >
        {t("add") + " " + t("webService")}
      </Button>
    </div>
  );
}

export default NoWebServiceScreen;
