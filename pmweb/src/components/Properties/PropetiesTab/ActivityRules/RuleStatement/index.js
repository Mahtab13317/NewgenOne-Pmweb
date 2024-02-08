import React, { useState, useEffect } from "react";
import { LightTooltip } from "../../../../../UI/StyledTooltip";
import { useTranslation } from "react-i18next";
import styles from "./index.module.css";
import DragIndicatorIcon from "@material-ui/icons/DragIndicator";
import clsx from "clsx";
import { RTL_DIRECTION } from "../../../../../Constants/appConstants";

function RuleStatement(props) {
  let { t } = useTranslation();
  const direction = `${t("HTML_DIR")}`;
  const {
    index,
    rules,
    isRuleBeingCreated,
    buildRuleStatement,
    shortenRuleStatement,
    registeredFunctions,
    registeredOptionsLabelsData,
    calledFromAction,
    isOtherwiseSelected,
    action,
    // added on 15/10/23 for BugId 138871
    cellActivityType,
    cellActivitySubType,
    isRuleInCreation,
    isDraggable = true,
    isReadOnly
    // till here BugId 138871
  } = props;

  const [ruleDescription, setRuleDescription] = useState("");
  const [showDragIcon, setShowDragIcon] = useState(false);

  // Function that runs when rules, registeredFunctions or registeredOptionsLabelsData changes.
  useEffect(() => {
    if (rules) {
      setRuleDescription(buildRuleStatement(index));
    }
  }, [rules, registeredFunctions, registeredOptionsLabelsData]);

  return (
    <div
      className={clsx(styles.flexRow, styles.ruleStatementDiv)}
      // modified on 15/10/23 for BugId 138871
      //  onMouseOver={() => setShowDragIcon(true)}
      // onMouseLeave={() => setShowDragIcon(false)}
      onMouseOver={() => {
        if (isDraggable && !isReadOnly) setShowDragIcon(true);
      }}
      onMouseLeave={() => {
        if (isDraggable && !isReadOnly) setShowDragIcon(false);
      }}
      // till here BugId 138871
    >
      {!isRuleBeingCreated && (
        <>
          {!isOtherwiseSelected && showDragIcon && !isReadOnly ? (
            <DragIndicatorIcon
              // {...provided.dragHandleProps}
              style={{
                // modified on 15/10/23 for BugId 138871
                // marginInlineEnd: "0.5vw",
                marginInlineStart: "-0.25vw",
                marginInlineEnd: "0.175vw",
                // till here BugId 138871
                color: "#606060",
                height: "1.5rem",
                width: "1.5rem",
              }}
            />
          ) : (
            // modified on 15/10/23 for BugId 138871
            // <p className={styles.ruleOrderNo}>{index + 1}.</p>
            <p className={styles.ruleOrderNo}>
              {cellActivityType === 7 &&
              cellActivitySubType === 1 &&
              isRuleInCreation
                ? index
                : index + 1}
              .
            </p>
            // till here BugId 138871
          )}
        </>
      )}
      {isRuleBeingCreated ? (
        <>
          {isRuleBeingCreated ? (
            <p>{calledFromAction ? t("newAction") : t("newRule")}</p>
          ) : (
            <div style={{ display: "flex", flexDirection: "column" }}>
              {calledFromAction && (
                <p
                  style={{
                    fontWeight: "600",
                    direction: "ltr",
                    textAlign: direction === RTL_DIRECTION ? "right" : "left",
                  }}
                >
                  {action.actionName}
                </p>
              )}
              <p
                style={{
                  direction: "ltr",
                  textAlign: direction === RTL_DIRECTION ? "right" : "left",
                }}
              >
                {shortenRuleStatement(ruleDescription, 65)}
              </p>
            </div>
          )}
        </>
      ) : (
        <LightTooltip
          id="ES_Tooltip"
          arrow={true}
          enterDelay={500}
          placement="bottom"
          title={ruleDescription}
        >
          {isRuleBeingCreated ? (
            <p>{calledFromAction ? t("newAction") : t("newRule")}</p>
          ) : (
            <div style={{ display: "flex", flexDirection: "column" }}>
              {calledFromAction && (
                <p
                  style={{
                    fontWeight: "600",
                    direction: "ltr",
                    textAlign: direction === RTL_DIRECTION ? "right" : "left",
                  }}
                >
                  {action.actionName}
                </p>
              )}
              <p
                style={{
                  direction: "ltr",
                  textAlign: direction === RTL_DIRECTION ? "right" : "left",
                }}
              >
                {shortenRuleStatement(ruleDescription, 65)}
              </p>
            </div>
          )}
        </LightTooltip>
      )}
    </div>
  );
}

export default RuleStatement;
