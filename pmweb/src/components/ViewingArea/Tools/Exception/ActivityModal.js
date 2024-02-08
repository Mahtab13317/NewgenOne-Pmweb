import React, { useEffect, useRef, useState } from "react";
import Checkbox from "@material-ui/core/Checkbox";
import FormControlLabel from "@material-ui/core/FormControlLabel";
import { useTranslation } from "react-i18next";
import { DisableCheckBox } from "../../../../utility/Tools/DisableFunc";
import { RTL_DIRECTION } from "../../../../Constants/appConstants";

function ActivityModal(props) {
  let { t } = useTranslation();
  const direction = `${t("HTML_DIR")}`;
  const [checks, setChecks] = useState({
    View: false,
    Raise: false,
    Respond: false,
    Clear: false,
  });
  const viewRef = useRef();
  const respondRef = useRef();
  const raiseRef = useRef();
  const clearRef = useRef();

  const DisableRaise = [
    { activityType: 2, subActivity: 1 },
    { activityType: 3, subActivity: 1 },
    { activityType: 2, subActivity: 2 },
    { activityType: 11, subActivity: 1 },
  ];

  const DisableRespond = [
    { activityType: 2, subActivity: 1 },
    { activityType: 3, subActivity: 1 },
    { activityType: 2, subActivity: 2 },
    { activityType: 11, subActivity: 1 },
    { activityType: 1, subActivity: 1 }, //Start Event
    { activityType: 1, subActivity: 3 },
  ];

  const DisableClear = [
    { activityType: 2, subActivity: 1 },
    { activityType: 3, subActivity: 1 },
    { activityType: 2, subActivity: 2 },
    { activityType: 11, subActivity: 1 },
    { activityType: 1, subActivity: 1 }, //Start Event
    { activityType: 1, subActivity: 3 },
  ];

  const changeChecks = (check_type) => {
    checks[check_type] = !checks[check_type];
    props.updateActivitySetAllChecks(
      check_type,
      props.activityId,
      checks[check_type],
      checks,
      setChecks,
      props.activityIndex
    );
  };

  useEffect(() => {
    // modified on 20/10/23 for BugId 137188
    // const temp = [t("view"), t("raise"), t("respond"), t("clear")];
    const temp = ["View", "Raise", "Respond", "Clear"];
    if (props.fullRightCheckOneActivity) {
      setChecks({
        View: true,
        Raise: true,
        Respond: true,
        Clear: true,
      });
    } else if (!props.fullRightCheckOneActivity) {
      temp.forEach((value) => {
        let defaultArray = [];
        props.docTypeList &&
          props.docTypeList.ExceptionGroups.map((group, groupIndex) => {
            group.ExceptionList.map((type) => {
              type.Activities.map((activity) => {
                if (activity.ActivityId == props.activityId) {
                  defaultArray.push(activity[value]);
                }
              });
            });
          });

        if (defaultArray.includes(false)) {
          setChecks((prevData) => {
            let newData = { ...prevData };
            newData[value] = false;
            return newData;
          });
        } else {
          setChecks((prevData) => {
            let newData = { ...prevData };
            newData[value] = true;
            return newData;
          });
        }
      });
    }
  }, []);

  return (
    <div
      // modified on 27/10/23 for BugId 112560
      // className="activityModal"
      className={
        direction === RTL_DIRECTION ? "activityModalAr" : "activityModal"
      }
      //onKeyDown :- For Closing the ActivityModal on Escape, as we are using FocusTrap
      onKeyDown={(e) => e.key === "Escape" && props.handleClose()}
    >
      <div className="actModalCheckboxes">
        <FormControlLabel
          control={
            <Checkbox
              name="checkedF"
              id="pmweb_oneActivity_modalView_exception"
            />
          }
          label={t("view")}
          checked={checks["View"]}
          onChange={() => changeChecks("View")}
          // tabIndex={0}
          ref={viewRef}
          onKeyUp={(e) => {
            if (e.key === "Enter") {
              viewRef.current.click();
              e.stopPropagation();
            }
          }}
          id="pmweb_oneActivity_modalView_exception"
        />
        <FormControlLabel
          checked={
            DisableCheckBox(DisableRaise, props) ? false : checks["Raise"]
          }
          disabled={DisableCheckBox(DisableRaise, props) ? true : false}
          onChange={() => changeChecks("Raise")}
          ref={raiseRef}
          onKeyUp={(e) => {
            if (e.key === "Enter") {
              raiseRef.current.click();
              e.stopPropagation();
            }
          }}
          control={
            <Checkbox
              name="checkedF"
              id="pmweb_oneActivity_modalRaise_exception"
            />
          }
          label={t("raise")}
          id="pmweb_oneActivity_modalRaise_exception"
        />
        <FormControlLabel
          control={
            <Checkbox
              name="checkedF"
              id="pmweb_oneActivity_modalRespond_exception"
            />
          }
          onChange={() => changeChecks("Respond")}
          ref={respondRef}
          onKeyUp={(e) => {
            if (e.key === "Enter") {
              respondRef.current.click();
              e.stopPropagation();
            }
          }}
          disabled={DisableCheckBox(DisableRespond, props) ? true : false}
          label={t("respond")}
          checked={
            DisableCheckBox(DisableRespond, props) ? false : checks["Respond"]
          }
          id="pmweb_oneActivity_modalRespond_exception"
        />
        <FormControlLabel
          checked={
            DisableCheckBox(DisableClear, props) ? false : checks["Clear"]
          }
          disabled={DisableCheckBox(DisableClear, props) ? true : false}
          onChange={() => changeChecks("Clear")}
          ref={clearRef}
          onKeyUp={(e) => {
            if (e.key === "Enter") {
              clearRef.current.click();
              e.stopPropagation();
            }
          }}
          control={
            <Checkbox
              name="checkedF"
              id="pmweb_oneActivity_modalClear_exception"
            />
          }
          label={t("clear")}
          id="pmweb_oneActivity_modalClear_exception"
        />
      </div>
    </div>
  );
}

export default ActivityModal;
