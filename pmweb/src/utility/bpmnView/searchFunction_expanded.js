export const searchFunc_expanded = (inputVal) => {
  let validSubActivity = [];
  let userInput = inputVal?.toUpperCase();
  let activities = document.querySelectorAll(".mainMenu");
  const activitiesToArray = Array.apply(null, activities);
  let subActivities = document.querySelectorAll(".subActivities");
  const subActivitiesToArray = Array.apply(null, subActivities);
  if (userInput !== "") {
    activitiesToArray.forEach((activity) => {
      activity.style.display = "none";
    });
    subActivitiesToArray.forEach((subAct) => {
      subAct.style.display = "none";
      subAct.parentElement.style.display = "none";
    });

    subActivitiesToArray.forEach((subactivity) => {
      let idx = subactivity.className.indexOf("_");
      let subActivityClass = subactivity.className.slice(idx + 1, idx + 4);

      // modified on 31/08/2023 for BugId 135520
      if (subactivity.textContent.toUpperCase().indexOf(userInput) > -1) {
        validSubActivity.push(subActivityClass);
        subactivity.style.display = "flex";
        subactivity.parentElement.style.display = "block";
      }
    });
    activitiesToArray.forEach((activity) => {
      validSubActivity.forEach((subActivity) => {
        if (activity.className.includes(subActivity)) {
          activity.style.display = "flex";
        }
      });
    });
  } else {
    activitiesToArray.forEach((activity) => {
      activity.style.display = "flex";
    });
    subActivitiesToArray.forEach((subAct) => {
      subAct.style.display = "flex";
      subAct.parentElement.style.display = "block";
    });
  }
};
