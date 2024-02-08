export const syncViewWithModify = (
  newState,
  check_type,
  todo_idx,
  activity_id
) => {
  newState.TodoGroupLists.map((group, groupIndex) => {
    group.ToDoList[todo_idx].Activities.map((activity) => {
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
  });
};

export const syncViewWithModifySetAll = (newState, check_type, doc_idx) => {
  if (
    check_type === "Modify" &&
    newState.TodoGroupLists.map(
      (group, groupIndex) =>
        group.ToDoList[doc_idx].AllTodoRights[check_type] === true
    )
  ) {
    newState.TodoGroupLists.map(
      (group, groupIndex) =>
        (group.ToDoList[doc_idx].AllTodoRights["View"] = true)
    );
  }
  if (
    check_type === "View" &&
    newState.TodoGroupLists.map(
      (group) => group.ToDoList[doc_idx].AllTodoRights[check_type] === false
    )
  ) {
    newState.TodoGroupLists.map(
      (group) => (group.ToDoList[doc_idx].AllTodoRights["Modify"] = false)
    );
  }
};

export const syncViewWithModifyForActivity = (
  newState,
  check_type,
  checkTypeValue,
  activity_id,
  setChecks
) => {
  newState.TodoGroupLists.map((group) =>
    group.ToDoList.map((docType) => {
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
    })
  );
};
