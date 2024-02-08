import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import emptyStatePic from "../../../../assets/ProcessView/EmptyState.svg";
import styles from "./rule.module.css";
import { Button } from "@material-ui/core";
import { isProcessReadOnly } from "../../../../utility/CommonFunctionCall/CommonFunctionCall";

function NoRuleScreen(props) {
  let { t } = useTranslation();
  const { isReadOnly, calledFrom } = props;
  const [isDisable, setIsDisable] = useState(false);

  useEffect(() => {
    if (isProcessReadOnly(props.processType)) {
      setIsDisable(true);
    } else {
      setIsDisable(false);
    }
  }, [props.processType]);

  return (
    <div
      className={styles.noRuleScreen}
      style={{
        top:
          calledFrom === "variable"
            ? "15%"
            : calledFrom === "doc"
            ? "25%"
            : "17%",
        left: calledFrom === "variable" ? "35%" : "38%",
      }}
    >
      <img src={emptyStatePic} alt={t("noRuleAdded")} />
      <p className={styles.noRuleAddedString}>
        {t("noRuleAdded")}{" "}
        {isDisable && !isReadOnly ? t("pleaseAddRule") : null}
      </p>
      {isDisable && !isReadOnly ? (
        <Button
          className={styles.addRuleButton}
          onClick={() => props.handleScreen()}
          id="pmweb_NoRuleScreen_addRule"
        >
          {t("add") + " " + t("rule")}
        </Button>
      ) : null}
    </div>
  );
}

export default NoRuleScreen;
