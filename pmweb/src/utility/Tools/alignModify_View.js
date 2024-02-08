export const syncViewWithModify = (
  newState,
  check_type,
  doc_idx,
  activity_id
) => {
  newState.DocumentTypeList[doc_idx].Activities.map((activity) => {
    if (activity.ActivityId == activity_id) {
      activity[check_type] = !activity[check_type];
    }
    if (check_type === "Modify" && activity[check_type] === true) {
      activity["View"] = true;
    }
    if (check_type === "View" && activity[check_type] === false) {
      activity["Modify"] = false;
    }
  });
};

export const syncViewWithModifySetAll = (newState, check_type, doc_idx) => {
  if (
    check_type === "Modify" &&
    newState.DocumentTypeList[doc_idx].SetAllChecks[check_type] === true
  ) {
    newState.DocumentTypeList[doc_idx].SetAllChecks["View"] = true;
  }
  if (
    check_type === "View" &&
    newState.DocumentTypeList[doc_idx].SetAllChecks[check_type] === false
  ) {
    newState.DocumentTypeList[doc_idx].SetAllChecks["Modify"] = false;
  }
};

export const syncViewWithModifyForActivity = (
  newState,
  check_type,
  checkTypeValue,
  activity_id,
  setChecks
) => {
  newState.DocumentTypeList.map((docType) => {
    docType.Activities.map((activity) => {
      if (activity.ActivityId == activity_id) {
        activity[check_type] = checkTypeValue;
      }
      if (check_type === "Modify" && activity[check_type] === true) {
        activity["View"] = true;
        setChecks((prev) => {
          return {
            ...prev,
            View: true,
          };
        });
      }
      if (check_type === "View" && activity[check_type] === false) {
        activity["Modify"] = false;
        setChecks((prev) => {
          return {
            ...prev,
            Modify: false,
          };
        });
      }
    });
  });
};
