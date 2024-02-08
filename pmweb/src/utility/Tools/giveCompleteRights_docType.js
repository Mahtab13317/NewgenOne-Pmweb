export const giveCompleteRights = (fullRightCheck, activity) => {
  activity["Add"] = fullRightCheck;
  activity["View"] = fullRightCheck;
  activity["Modify"] = fullRightCheck;
  activity["Delete"] = fullRightCheck;
  activity["Download"] = fullRightCheck;
  activity["Print"] = fullRightCheck;
};
