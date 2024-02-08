import React, { useState, useEffect, useRef } from "react";
import Checkbox from "@material-ui/core/Checkbox";
import FormControlLabel from "@material-ui/core/FormControlLabel";
import "../Interfaces.css";
import { useTranslation } from "react-i18next";
import {
  isActivityRestricted,
  restrictAct,
} from "../../../../utility/Tools/DisableFunc";
import { isProcessReadDeployedFunc } from "../../../../utility/CommonFunctionCall/CommonFunctionCall";

function CheckBoxes(props) {
  let { t } = useTranslation();
  const [allRights, setAllRights] = useState(false);
  const [checks, setChecks] = useState({
    View: false,
    Modify: false,
  });

  const allRightRef = useRef();
  const viewRightRef = useRef();
  const modifyRightRef = useRef();
  const { processType, isReadOnly } = props;
  const isProcessReadOnly =
    isReadOnly || isProcessReadDeployedFunc(processType);
  const AllRights = [
    { activityType: 1, subActivity: 2 },
    { activityType: 26, subActivity: 1 },
    { activityType: 10, subActivity: 1 },
    { activityType: 20, subActivity: 1 },
    { activityType: 22, subActivity: 1 },
    { activityType: 31, subActivity: 1 },
    { activityType: 29, subActivity: 1 },
    { activityType: 10, subActivity: 4 },
    { activityType: 33, subActivity: 1 },
    { activityType: 27, subActivity: 1 },
    { activityType: 19, subActivity: 1 },
    { activityType: 21, subActivity: 1 },
    { activityType: 5, subActivity: 1 },
    { activityType: 6, subActivity: 1 },
    { activityType: 5, subActivity: 2 },
    { activityType: 6, subActivity: 2 },
    { activityType: 7, subActivity: 1 },
    { activityType: 34, subActivity: 1 },
    { activityType: 1, subActivity: 1 },
    { activityType: 1, subActivity: 3 },
    { activityType: 10, subActivity: 3 },
    { activityType: 10, subActivity: 7 },
    { activityType: 3, subActivity: 1 },
  ];
  const TempView = [
    { activityType: 1, subActivity: 1 },
    { activityType: 1, subActivity: 3 },
    { activityType: 10, subActivity: 3 },
    { activityType: 10, subActivity: 7 },
    { activityType: 3, subActivity: 1 },
  ];

  const TempModify = [
    { activityType: 1, subActivity: 1 },
    { activityType: 1, subActivity: 3 },
    { activityType: 10, subActivity: 3 },
    { activityType: 10, subActivity: 7 },
    { activityType: 3, subActivity: 1 },
  ];

  const changeChecks = (check_type) => {
    if (props.type === "set-all") {
      props.updateAllTodoRights(
        checks[check_type],
        check_type,
        props.docIdx,
        props.groupIndex
      );
    } else {
      props.toggleSingleChecks(
        checks,
        check_type,
        props.activityIndex,
        props.activityId,
        props.groupIndex
      );
    }
  };

  useEffect(() => {
    // // For each activity checkboxes
    let activityInDocType = false;
    if (props.toDoData && props.type == "activity") {
      let activities =
        props.toDoData.TodoGroupLists[props.groupIndex].ToDoList[
          props.activityIndex
        ];
      activities.Activities.map((activity) => {
        if (activity.ActivityId == props.activityId) {
          if (
            restrictAct(props.activityType, props.subActivity)
              ? activity["View"] === false
              : Object.values(activity).includes(false)
          ) {
            setAllRights(false);
          } else {
            setAllRights(true);
          }
        }
        if (activity.ActivityId == props.activityId) {
          activityInDocType = true;
          setChecks(() => {
            return {
              View: activity.View,
              Modify: restrictAct(props.activityType, props.subActivity)
                ? false
                : activity.Modify,
            };
          });
        }
      });
      if (!activityInDocType) {
        setChecks(() => {
          return {
            View: false,
            Modify: false,
          };
        });
      }
    }

    // For setAll checkBoxes
    if (props.type === "set-all" && props.toDoData) {
      let setobj =
        props.toDoData.TodoGroupLists[props.groupIndex].ToDoList[props.docIdx]
          .AllTodoRights;
      // .map(type=>{
      if (
        restrictAct(props.activityType, props.subActivity)
          ? setobj["View"] === false
          : Object.values(setobj).includes(false)
      ) {
        setAllRights(false);
      } else {
        setAllRights(true);
      }
      // })
      let doc =
        props.toDoData &&
        props.toDoData.TodoGroupLists[props.groupIndex].ToDoList[props.docIdx]
          .AllTodoRights;
      setChecks(() => {
        return {
          View: doc.View,
          Modify: restrictAct(props.activityType, props.subActivity)
            ? false
            : doc.Modify,
        };
      });
    }
  }, [props.toDoData]);

  const handleAllRightsCheck = () => {
    setAllRights(!allRights);
    if (props.activityId) {
      if (props.handleGroupCheckOneColumn) {
        props.handleGroupCheckOneColumn(
          props.groupIndex,
          props.activityId,
          !allRights
        );
      } else {
        props.handleAllChecks(
          !allRights,
          props.groupIndex,
          props.activityIndex,
          props.activityId,
          props.activityType,
          props.subActivity
        );
      }
    } else {
      props.GiveCompleteRights(props.docIdx, props.groupIndex, !allRights);
    }
  };

  return (
    <div style={{ display: "flex" }}>
      <div className="checkBoxesThree">
        <FormControlLabel
          control={
            <Checkbox
              // id="allRight_todo"
              id={`pmweb_toDo_checkBoxes_${props.title}_allRight_checkBox`}
              name="checkedF"
              tabIndex={0}
            />
          }
          // Changes to resolve the bug Id 136530
          label={t("allRights")}
          checked={allRights}
          disabled={isProcessReadOnly ? true : false}
          onChange={handleAllRightsCheck}
          ref={allRightRef}
          onKeyUp={(e) => {
            if (e.key === "Enter") {
              allRightRef.current.click();
              e.stopPropagation();
            }
          }}
          id={`pmweb_toDo_checkBoxes_${props.title}_allRight`}
          aria-description={props.ariaDescription ? props.ariaDescription : ""}
        />
        <FormControlLabel
          control={
            <Checkbox
              // id="viewRight_exception"
              id={`pmweb_toDo_checkBoxes_${props.title}_viewRight_checkBox`}
              name="checkedF"
              tabIndex={0}
            />
          }
          label={t("view")}
          checked={checks.View}
          disabled={isProcessReadOnly ? true : false}
          style={{ marginLeft: "1px" }}
          onChange={() => changeChecks("View")}
          ref={viewRightRef}
          onKeyUp={(e) => {
            if (e.key === "Enter") {
              viewRightRef.current.click();
              e.stopPropagation();
            }
          }}
          id={`pmweb_toDo_checkBoxes_${props.title}_viewRight`}
          aria-description={props.ariaDescription ? props.ariaDescription : ""}
        />
        <FormControlLabel
          checked={checks.Modify}
          disabled={
            isProcessReadOnly || isActivityRestricted(props) ? true : false
          }
          style={{ marginLeft: "2px" }}
          onChange={() => changeChecks("Modify")}
          ref={modifyRightRef}
          onKeyUp={(e) => {
            if (e.key === "Enter") {
              modifyRightRef.current.click();
              e.stopPropagation();
            }
          }}
          id={`pmweb_toDo_checkBoxes_${props.title}_modifyRight`}
          control={
            <Checkbox
              // id="modifyRight_exception"
              id={`pmweb_toDo_checkBoxes_${props.title}_modifyRight_checkBox`}
              name="checkedF"
              tabIndex={0}
            />
          }
          label={t("modify")}
          aria-description={props.ariaDescription ? props.ariaDescription : ""}
        />
      </div>
    </div>
  );
}

export default CheckBoxes;
