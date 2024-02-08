export const giveCompleteRights =(fullRightCheck,activity)=>{
    activity["Modify"] = fullRightCheck;
    activity["View"] = fullRightCheck;
  }