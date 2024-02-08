import React, { useEffect, useState, useRef } from "react";
import Checkbox from "@material-ui/core/Checkbox";
import FormControlLabel from "@material-ui/core/FormControlLabel";
import { RTL_DIRECTION } from "../../../../Constants/appConstants";
import { useTranslation } from "react-i18next";

function ActivityModal(props) {
  let { t } = useTranslation();
  const direction = `${t("HTML_DIR")}`;
  const [checks, setChecks] = useState({
    View: false,
    Modify: false,
  });

  const viewRef = useRef();
  const modifyRef = useRef();

  const changeChecks = (check_type) => {
    checks[check_type] = !checks[check_type];
    props.updateActivityAllTodoRights(
      check_type,
      props.activityId,
      checks[check_type],
      setChecks,
      checks
    );
  };

  useEffect(() => {
    // modified on 20/10/23 for BugId 137188
    // const temp = [t("view"), t("Modify")];
    const temp = ["View", "Modify"];
    if (props.fullRightCheckOneActivity) {
      setChecks({
        View: true,
        Modify: true,
      });
    } else if (!props.fullRightCheckOneActivity) {
      temp.forEach((value) => {
        let defaultArray = [];
        props.docTypeList &&
          props.docTypeList.TodoGroupLists.forEach((group) => {
            group?.ToDoList?.forEach((type) => {
              type?.Activities.forEach((activity) => {
                if (+activity.ActivityId === +props.activityId) {
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
              id="oneActivity_modalView_todo"
              tabIndex={0}
            />
          }
          label="View"
          checked={checks["View"]}
          onChange={() => changeChecks("View")}
          tabIndex={-1}
          ref={viewRef}
          onKeyUp={(e) => {
            if (e.key === "Enter") {
              viewRef.current.click();
              e.stopPropagation();
            }
          }}
          id="pmweb_oneActivity_modalView_todo"
        />
        <FormControlLabel
          checked={
            (+props.activityType === 2 && +props.activitySubType === 1) ||
            (+props.activityType === 3 && +props.activitySubType === 1) ||
            (+props.activityType === 2 && +props.activitySubType === 2)
              ? false
              : checks["Modify"]
          }
          onChange={() => changeChecks("Modify")}
          control={
            <Checkbox
              name="checkedF"
              id="oneActivity_modalModify_todo"
              disabled={
                //Changes made to solve Bug 131928
                (+props.activityType === 2 && +props.activitySubType === 1) ||
                (+props.activityType === 3 && +props.activitySubType === 1) ||
                (+props.activityType === 2 && +props.activitySubType === 2)
              }
            />
          }
          label="Modify"
          id="pmweb_oneActivity_modalModify_todo"
        />
      </div>
    </div>
  );
}

export default ActivityModal;
