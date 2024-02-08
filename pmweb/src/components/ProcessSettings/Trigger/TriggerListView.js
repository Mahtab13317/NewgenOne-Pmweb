import React from "react";
import { useTranslation } from "react-i18next";
import { triggerTypeOptions } from "../../../utility/ProcessSettings/Triggers/triggerTypeOptions";
import FlashOnIcon from "@material-ui/icons/FlashOn";
import styles from "./trigger.module.css";
import { LightTooltip } from "../../../UI/StyledTooltip";
import { shortenRuleStatement } from "../../../utility/CommonFunctionCall/CommonFunctionCall";
import NoResultFound from "../../../assets/NoSearchResult.svg";
import { RTL_DIRECTION } from "../../../Constants/appConstants";

function TriggerListView(props) {
  let { t } = useTranslation();
  const direction = `${t("HTML_DIR")}`;
  let { addedTriggerTypes, triggerData, onFieldSelection, selectedField } =
    props;

  return (
    <div className={styles.triggerListView}>
      {addedTriggerTypes?.length > 0 ? (
        addedTriggerTypes.map((option) => {
          return (
            <div className={styles.triggerTypeList}>
              <p className={styles.triggerTypeHeading}>
                {t(triggerTypeOptions(option)[0])}
              </p>
              {triggerData?.map((trigger) => {
                if (trigger.TriggerType === option) {
                  return (
                    <div
                      id={`pmweb_triggerList_listItem_${trigger.TriggerId}`}
                      onClick={() => onFieldSelection(trigger)}
                      className="njfbh"
                      //Provided KeyDown Event for WCAG Keyboard Accessibility
                      onKeyDown={(e) =>
                        e.key === "Enter" && onFieldSelection(trigger)
                      }
                    >
                      {/* Changes made to solve Bug 135962  */}
                      <LightTooltip
                        id="pmweb_projectname_Tooltip"
                        arrow={true}
                        enterDelay={500}
                        placement="bottom-start"
                        title={trigger.TriggerName}
                      >
                        <span
                          className={
                            selectedField?.id === trigger.TriggerId
                              ? `${styles.triggerListRow} ${styles.selectedTriggerListRow}`
                              : styles.triggerListRow
                          }
                          //Provided TabIndex for WCAG Keyboard Accessibility
                          tabIndex={0}
                          //Provided aria-description for better description
                          aria-description={`${t(
                            triggerTypeOptions(option)[0]
                          )} Group`}
                        >
                          <FlashOnIcon className={styles.FlashOnIcon} />
                          {shortenRuleStatement(trigger.TriggerName, 25)}
                          {/* till here dated 5thSept */}
                        </span>
                      </LightTooltip>
                    </div>
                  );
                }
              })}
            </div>
          );
        })
      ) : (
        // Changes made to solve Bug 139593
        <>
          <img
            src={NoResultFound}
            className ={
              direction == RTL_DIRECTION
                ? styles.triggerListViewArabicImage
                : styles.triggerListViewImage
            }
            alt={t("noResultsFound")}
          />
          <p
            // style={{
            //   fontSize: "var(--base_text_font_size)",
            //   position: "absolute",
            //   left: direction == RTL_DIRECTION ? "85%" : "6%",
            //   top: "68%",
            // }}
            className ={
              direction == RTL_DIRECTION
                ? styles.triggerListViewArabicText
                : styles.triggerListViewImageText
            }
          >
            {t("noSearchResult")}
          </p>
        </>
        // till here dated 16thOct
      )}
    </div>
  );
}

export default TriggerListView;
