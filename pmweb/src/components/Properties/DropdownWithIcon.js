import React from "react";
import MenuItem from "@material-ui/core/MenuItem";
import Select from "@material-ui/core/Select";
import ExpandMoreIcon from "@material-ui/icons/ExpandMore";
import { useTranslation } from "react-i18next";
import { makeStyles } from "@material-ui/core";
import { RTL_DIRECTION } from "../../Constants/appConstants";

const useStyles = makeStyles({
  icon: {
    left: (props) => (props.direction === RTL_DIRECTION ? "0px" : "unset"),
    right: (props) => (props.direction === RTL_DIRECTION ? "unset" : "0px"),
  },
});
function DropdownWithIcon({ activityInfo, ...props }) {
  let { t } = useTranslation();
  const direction = `${t("HTML_DIR")}`;

  const classes = useStyles({ direction });
  const [selectedValue, setselectedValue] = React.useState(0);
  const getSelectedActivity = (e) => {
    setselectedValue(e.target.value);
    props.getSelectedActivity(e.target.value);
  };

  React.useEffect(() => {
    if (props.selectedActivity) {
      setselectedValue(props.selectedActivity);
    } else return;
  }, [props.selectedActivity]);

  //code edited on 12 Dec 2022 for BugId 115388
  return (
    <Select
      disabled={props.disabled}
      IconComponent={ExpandMoreIcon}
      style={{
        width: "95%",
        height: "var(--line_height)",
        fontSize: "var(--base_text_font_size)",
        fontFamily: "var(--font_family)",
        border: "1px solid #d7d7d7",
      }}
      classes={{ icon: classes.icon }}
      MenuProps={{
        anchorOrigin: {
          vertical: "bottom",
          horizontal: "left",
        },
        transformOrigin: {
          vertical: "top",
          horizontal: "left",
        },
        getContentAnchorEl: null,
        PaperProps: {
          style: {
            maxHeight: "15rem",
          },
        },
      }}
      inputProps={{ id: props.id, "aria-label": props?.ariaLabel }}
      value={selectedValue}
      onChange={getSelectedActivity}
    >
      <MenuItem
        value={0}
        style={{
          width: "100%",
          height: "var(--line_height)",
          direction: direction === RTL_DIRECTION ? "rtl" : "ltr",
        }}
      >
        <p
          style={{
            fontSize: "var(--base_text_font_size)",
          }}
        >
          -- {t("selectWorkstep")} --
        </p>
      </MenuItem>
      {activityInfo.map((item) => {
        return (
          <MenuItem
            style={{
              width: "100%",
              height: "var(--line_height)",
              fontSize: "var(--base_font_text_size)",
              direction: direction === RTL_DIRECTION ? "rtl" : "ltr",
            }}
            value={item.id}
          >
            <div
              style={{
                display: "flex",
                flexDirection: "row",
                width: "100%",
                justifyContent: direction === RTL_DIRECTION ? "right" : null,
              }}
            >
              <img
                src={item.icon}
                style={{
                  height: "1.25rem",
                  width: "1.25rem",
                }}
                alt="Item"
              />
              <p
                style={{
                  marginInline: "0.4rem",
                  fontSize: "var(--base_font_text_size)",
                }}
              >
                {item.name}
              </p>
            </div>
          </MenuItem>
        );
      })}
    </Select>
  );
}

export default DropdownWithIcon;
