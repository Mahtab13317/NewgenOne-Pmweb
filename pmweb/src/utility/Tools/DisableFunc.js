import {
  invalidTodoActivities,
  restrictedTodoActivities,
} from "../../Constants/appConstants";

// Function that tells if activity is restricted or not based on activity type and sub activity type.
export const restrictAct = (actType, subActType) => {
  let isActRestricted = false;
  restrictedTodoActivities?.forEach((act) => {
    if (act.activityType === actType && act.subActivity === subActType) {
      isActRestricted = true;
    }
  });
  return isActRestricted;
};

// Function that tells if activity is restricted or not.
export const isActivityRestricted = (props) => {
  let isActRestricted = false;
  restrictedTodoActivities?.forEach((act) => {
    if (
      act.activityType === props.activityType &&
      act.subActivity === props.subActivity
    ) {
      isActRestricted = true;
    }
  });
  return isActRestricted;
};

export const DisableCheckBox = (activity, props) => {
  let temp = false;
  activity.forEach((act) => {
    if (
      act.activityType === props.activityType &&
      act.subActivity === props.subActivity
    ) {
      temp = true;
    }
  });
  return temp;
};

export const disableToDoChecks = (props, type) => {
  let temp = false;
  if (
    (props?.activityType === 2 ||
      props?.activityType === 3 ||
      props?.activityType === 11) &&
    type === "Modify"
  ) {
    temp = true;
  }
  return temp;
};

export const isValidTodoAct = (actId, actSubId) => {
  let valid = false;
  invalidTodoActivities?.forEach((el) => {
    if (!(+el.activityId === +actId && +el.subActivityId === +actSubId)) {
      valid = true;
    }
  });
  return valid;
};

export const disableExpChecks = (activityType, type) => {
  let temp = false;
  if (
    (activityType === 2 || activityType === 3 || activityType === 11) &&
    (type === "Raise" || type === "Respond" || type === "Clear")
  ) {
    temp = true;
  } else if (activityType === 1 && (type === "Respond" || type === "Clear")) {
    temp = true;
  }
  return temp;
};
