import React from "react";
import c_Names from "classnames";
import "./ProcessTemplate.css";
import "./ProcessTemplateArabic.css";
import { getActivityProps } from "../../utility/abstarctView/getActivityProps";
import { useTranslation } from "react-i18next";
import { RTL_DIRECTION } from "../../Constants/appConstants";

function TemplateMileStone(props) {
  let { t } = useTranslation();
  const direction = `${t("HTML_DIR")}`;
  return (
    <div
      className="mileStoneTempPosition"
      style={{ ...props.mileStoneTempStyle }}
    >
      {props.milestone &&
        props.milestone.slice(0, 4).map((mile, index) => {
          return (
            <div
              className="templateCombo"
              style={{ ...props.templateComboStyle }}
            >
              <div
                className={c_Names({
                  milestoneArrowFullTemplate:
                    index === 0 && direction !== RTL_DIRECTION,
                  milestoneArrowTemplate:
                    index !== 0 && direction !== RTL_DIRECTION,
                  milestoneArrowTemplateArabic:
                    index !== 0 && direction === RTL_DIRECTION,
                  milestoneArrowFullTemplateArabic:
                    index === 0 && direction === RTL_DIRECTION,
                })}
              >
                {mile.MileStoneName}
              </div>

              <div>
                {mile.Activities &&
                  mile.Activities.slice(0, 5).map((activity) => {
                    return (
                      <div
                        className={
                          direction !== RTL_DIRECTION
                            ? "templateActivity"
                            : "templateActivityArabic"
                        }
                        style={{
                          backgroundColor: getActivityProps(
                            activity.ActivityType,
                            activity.ActivitySubType
                          )[3],
                        }}
                      >
                        {activity.ActivityName}
                      </div>
                    );
                  })}
              </div>
            </div>
          );
        })}
    </div>
  );
}

export default TemplateMileStone;
