export const isActivityModifyDisabled = (activityType, subActivityType) => {
  return (
    (activityType === 2 && subActivityType === 1) ||
    (activityType === 2 && subActivityType === 2)||
    (activityType === 3 && subActivityType === 1)
  );
};
