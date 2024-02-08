// #BugID - 122528
// #BugDescription - On deployed process add trigger button has been disabled.
import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import emptyStatePic from "../../../assets/ProcessView/EmptyState.svg";
import { Button, ClickAwayListener, useMediaQuery } from "@material-ui/core";
import { triggerTypeName } from "../../../utility/ProcessSettings/Triggers/triggerTypeOptions";
import ButtonDropdown from "../../../UI/ButtonDropdown";
import styles from "./trigger.module.css";
import { STATE_CREATED } from "../../../Constants/appConstants";
import clsx from "clsx";

function NoTriggerScreen(props) {
  let { t } = useTranslation();
  const {
    hideLeftPanel,
    setTypeInput,
    setTriggerData,
    setSelectedField,
    typeList,
    isReadOnly,
  } = props;
  const [showTypeOption, setShowTypeOptions] = useState(false);
  const smallScreen = useMediaQuery("(max-width: 999px)");
  const createNewTrigger = (triggerType) => {
    setShowTypeOptions(false);
    setTypeInput(triggerType);
    let newId = 1;
    setTriggerData((prev) => {
      let newData = [];
      if (prev.length > 0) {
        newData = [...prev];
      }
      newData.push({
        TriggerId: newId,
        TriggerName: t("newTrigger"),
        TriggerType: triggerType,
        status: STATE_CREATED,
      });
      return newData;
    });
    setSelectedField({
      id: newId,
      name: t("newTrigger"),
      type: triggerType,
      status: STATE_CREATED,
    });
  };

  return (
    <div
      className={
        isReadOnly
          ? clsx(
              styles.deployedNoTriggerScreen,
              hideLeftPanel && styles.displayCenter
            )
          : clsx(styles.noTriggerScreen, hideLeftPanel && styles.displayCenter)
      }
    >
      {!hideLeftPanel ? (
        <div>
          <img src={emptyStatePic} alt={t("noTriggerAdded")} />
          <p className={styles.notriggerAddedString}>{t("noTriggerAdded")}</p>
        </div>
      ) : null}
      {isReadOnly ? null : (
        <ClickAwayListener onClickAway={() => setShowTypeOptions(false)}>
          <Button
            className={styles.addTriggerButton}
            onClick={() => setShowTypeOptions(true)}
            id="pmweb_noTriggerScreen_add_btn"
            disabled={isReadOnly ? true : false}
          >
            {t("add") + " " + t("trigger")}
            <ButtonDropdown
              open={showTypeOption}
              dropdownOptions={typeList}
              onSelect={createNewTrigger}
              optionRenderFunc={triggerTypeName}
              id="pmweb_noTrigger_add_dropdown"
              // modified on 12-10-2023 for bug_id: 138223
              // style={{maxHeight: "16rem"}}
              style={{ maxHeight: "22vh", width: smallScreen ? "17vw" : "14vw" }}
              disabled={isReadOnly ? true : false}
            />
          </Button>
        </ClickAwayListener>
      )}
    </div>
  );
}

export default NoTriggerScreen;
