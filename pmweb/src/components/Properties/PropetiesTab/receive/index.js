import React, { useState, useEffect } from "react";
import clsx from "clsx";
import { Radio, MenuItem } from "@material-ui/core";
import styles from "./index.module.css";
import "../../Properties.css";
import { store, useGlobalState } from "state-pool";
import { useTranslation } from "react-i18next";
import { propertiesLabel } from "../../../../Constants/appConstants";
import { connect, useDispatch } from "react-redux";
import CustomizedDropdown from "../../../../UI/Components_With_ErrrorHandling/Dropdown";
import { setActivityPropertyChange } from "../../../../redux-store/slices/ActivityPropertyChangeSlice";
import TabsHeading from "../../../../UI/TabsHeading";
import { isReadOnlyFunc } from "../../../../utility/CommonFunctionCall/CommonFunctionCall";
import { LatestVersionOfProcess } from "../../../../utility/abstarctView/checkLatestVersion";

function ReceiveInvocation(props) {
  let { t } = useTranslation();
  const dispatch = useDispatch();
  const globalActivityData = store.getState("activityPropertyData");
  const [localActivityPropertyData, setLocalActivityPropertyData] =
    useGlobalState(globalActivityData);
  const loadedProcessData = store.getState("loadedProcessData");
  const [localLoadedProcessData] = useGlobalState(loadedProcessData);
  const [replyActivities, setReplyActivities] = useState([]); // State that stores the list of all reply type activities.
  const [invocationType, setInvocationType] = useState(t("ReplyImmediate")); // State that stores the invocation type.
  const [selectedReplyActivityId, setSelectedReplyActivityId] = useState(0); // State that stores the selected reply activity id.
  let isReadOnly =
    props.openTemplateFlag ||
    isReadOnlyFunc(
      localLoadedProcessData,
      props.cellCheckedOut,
      props.cellLaneId
    ) ||
    LatestVersionOfProcess(localLoadedProcessData?.Versions) !==
      +localLoadedProcessData?.VersionNo; // modified on 05/09/2023 for BugId 136103;

  // Function that runs when the loadedProcessData value changes.
  useEffect(() => {
    setReplyActivities(getReplyTypeActivities());
  }, []);

  // Function that runs when the component loads.
  useEffect(() => {
    if (globalActivityData?.value?.ActivityProperty?.actAssocId === 0) {
      setSelectedReplyActivityId("");
      setInvocationType(t("ReplyImmediate"));
    } else {
      setInvocationType(t("ReplyAfterCompletion"));
      // getReplyTypeActivities()?.map((replyActivity) => {
      getReplyTypeActivities()?.forEach((replyActivity) => {
        if (
          replyActivity.activityId ===
          globalActivityData?.value?.ActivityProperty?.actAssocId
        ) {
          setSelectedReplyActivityId(replyActivity?.activityId);
        }
      });
    }
  }, [globalActivityData]);

  // Function that returns the list of all reply type activities with its activity name and activity id.
  const getReplyTypeActivities = () => {
    let tempArr = [];
    localLoadedProcessData?.MileStones?.map((mile) => {
      mile?.Activities?.map((activity) => {
        if (activity.ActivityType === 26 && activity.ActivitySubType === 1) {
          tempArr.push({
            activityName: activity.ActivityName,
            activityId: activity.ActivityId,
          });
        }
      });
    });
    return tempArr;
  };

  // Function that runs when the user changes the invocation type radio value.
  const handleRadioChange = (value) => {
    setInvocationType(value);
    if (value === t("ReplyAfterCompletion")) {
      setGlobalData(value, getFirstElementId());
      setSelectedReplyActivityId(getFirstElementId());
    } else {
      setGlobalData(value);
    }
  };

  // Function that returns the id for the first element in the list of reply activities.
  const getFirstElementId = () => {
    let firstElementId = "";
    firstElementId = replyActivities && replyActivities[0]?.activityId;
    return firstElementId;
  };

  // Function to set global data when the user does any action.
  const setGlobalData = (type, value) => {
    let temp = JSON.parse(JSON.stringify(localActivityPropertyData));
    if (type === t("ReplyImmediate")) {
      temp.ActivityProperty.actAssocId = 0;
    } else {
      if (value !== "") {
        temp.ActivityProperty.actAssocId = value;
      }
    }
    setLocalActivityPropertyData(temp);
    dispatch(
      setActivityPropertyChange({
        [propertiesLabel.receive]: { isModified: true, hasError: false },
      })
    );
  };

  return (
    <>
      <TabsHeading heading={props?.heading} />
      <div className="receiveInvocation">
        <p className={styles.heading}>{t("InvocationType")}</p>
        <div className={styles.invocationTypeDiv}>
          <div className={styles.flexRow} style={{ alignItems: "center" }}>
            <Radio
              id="pmweb_recieve_reply_immediate_radio"
              checked={invocationType === t("ReplyImmediate")}
              onChange={() => handleRadioChange(t("ReplyImmediate"))}
              value={t("ReplyImmediate")}
              disabled={isReadOnly}
              size="small"
            />
            <p className={styles.labelStyles} id="reply_immediate_label">
              {t("ReplyImmediate")}
            </p>
          </div>
          <div className={styles.flexRow} style={{ alignItems: "center" }}>
            <Radio
              id="pmweb_recieve_reply_after_completion_radio"
              checked={invocationType === t("ReplyAfterCompletion")}
              onChange={() => handleRadioChange(t("ReplyAfterCompletion"))}
              value={t("ReplyAfterCompletion")}
              disabled={isReadOnly}
              size="small"
            />
            <p className={styles.labelStyles} id="reply_after_completion_label">
              {t("ReplyAfterCompletion")}
            </p>
          </div>
        </div>
        <div>
          <div className={clsx(styles.flexRow, styles.replyActivityDiv)}>
            {invocationType === t("ReplyAfterCompletion") && (
              <div
                className={styles.flexRow}
                style={{
                  width: props.isDrawerExpanded ? "40%" : "100%",
                  alignItems: "center",
                }}
              >
                <p className={styles.subHeading}>
                  {t("replyActivities")}
                  <span className={styles.asterisk}>*</span>
                </p>

                <CustomizedDropdown
                  id="pmweb_receive_reply_activities_dropdown"
                  className={styles.dropdownInput}
                  value={selectedReplyActivityId}
                  onChange={(event) => {
                    setSelectedReplyActivityId(event.target.value);
                    setGlobalData(invocationType, event.target.value);
                  }}
                  disabled={isReadOnly}
                  isNotMandatory={false}
                >
                  {replyActivities?.map((reply) => {
                    return (
                      <MenuItem
                        value={reply.activityId}
                        className={styles.menuItemStyles}
                      >
                        {reply.activityName}
                      </MenuItem>
                    );
                  })}
                </CustomizedDropdown>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

const mapStateToProps = (state) => {
  return {
    isDrawerExpanded: state.isDrawerExpanded.isDrawerExpanded,
    cellCheckedOut: state.selectedCellReducer.selectedCheckedOut,
    cellLaneId: state.selectedCellReducer.selectedActLaneId,
    openTemplateFlag: state.openTemplateReducer.openFlag,
  };
};

export default connect(mapStateToProps, null)(ReceiveInvocation);
