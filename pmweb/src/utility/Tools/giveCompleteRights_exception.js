export const giveCompleteRights =(fullRightCheck,activity)=>{
    activity["View"] = fullRightCheck;
    activity["Raise"] = fullRightCheck;
    activity["Respond"] = fullRightCheck;
    activity["Clear"] = fullRightCheck;
  }
