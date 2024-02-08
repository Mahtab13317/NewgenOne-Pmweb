import React from "react";
import DropdownWithIcon from "../../DropdownWithIcon";
import { getActivityProps } from "../../../../utility/abstarctView/getActivityProps";

function SetIconWithActivityType(props) {
  const getActivityIcon = (actType, actSubType) => {
    let icon = getActivityProps(actType, actSubType)[0];
    return icon;
  };

  const [activityAndIconPair, setactivityAndIconPair] = React.useState([]);

  React.useEffect(() => {
    let actList = [];
    props.activityList.forEach((item) => {
      const activityWithIcon = {
        icon: getActivityIcon(item.ActivityType, item.ActivitySubType),
        name: item.ActivityName,
        id: item.ActivityId,
      };
      actList = [...actList, activityWithIcon];
    });
    setactivityAndIconPair(actList);
  }, [props.activityList]);

  return (
    <DropdownWithIcon
      id={props.id}
      ariaLabel={props.ariaLabel}
      disabled={props.disabled}
      selectedActivity={props.selectedActivity}
      activityInfo={activityAndIconPair}
      getSelectedActivity={props.getSelectedActivity}
    />
  );
}

export default SetIconWithActivityType;
