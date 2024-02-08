import React from "react";
import { withStyles } from "@material-ui/core/styles";
import { makeStyles } from "@material-ui/core/styles";
import Menu from "@material-ui/core/Menu";
import MenuItem from "@material-ui/core/MenuItem";
import { useTranslation } from "react-i18next";
import { RTL_DIRECTION } from "../../Constants/appConstants";
// const StyledMenu = withStyles({
//   paper: {
//     border: "1px solid #d3d4d5",
//     color: "#000000",
//     fontFamily: "var(--font_family)",
//     fontSize: "var(--base_text_font_size)",
//     marginLeft: "0.5rem",
//     "& ul": {
//       paddingRight: "0px !important",
//     },
//   },
// })((props) => (
//   <Menu
//     elevation={0}
//     getContentAnchorEl={null}
//     anchorOrigin={{
//       vertical: "bottom",
//       horizontal: "center",
//     }}
//     transformOrigin={{
//       vertical: "top",
//       horizontal: "right",
//     }}
//     {...props}
//   />
// ));

// const StyledMenuItem = withStyles((theme) => ({
//   root: {
//     "&:focus": {
//       backgroundColor: "#F8F8F8 0% 0% no-repeat padding-box",
//     },
//   },
// }))(MenuItem);

// const useStyles = makeStyles({
//   listItemGutters: {
//     paddingLeft: "8px",
//     paddingRight: "8px",
//   },
// });

export default function CustomizedMenus(props) {
  const {
    anchorEl = null,
    handleClose = () => {},
    options = [],
    defaultSelection = 0,
  } = props;

  const StyledMenu = withStyles({
    paper: {
      border: "1px solid #d3d4d5",
      color: "#000000",
      fontFamily: "var(--font_family)",
      fontSize: "var(--base_text_font_size)",
      marginLeft: "0.5rem",
      "& ul": {
        paddingRight: "0px !important",
      },
    },
  })((props) => (
    <Menu
      elevation={0}
      getContentAnchorEl={null}
      anchorOrigin={{
        vertical: "bottom",
        horizontal: "center",
      }}
      transformOrigin={{
        vertical: "top",
        // horizontal: "right",
        horizontal: direction === RTL_DIRECTION ? "left" : "right",
      }}
      {...props}
    />
  ));

  const StyledMenuItem = withStyles((theme) => ({
    root: {
      "&:focus": {
        backgroundColor: "#F8F8F8 0% 0% no-repeat padding-box",
      },
    },
  }))(MenuItem);

  const useStyles = makeStyles({
    listItemGutters: {
      paddingLeft: "8px",
      paddingRight: "8px",
    },
  });
  const classes = useStyles();
  let { t } = useTranslation();
  const direction = `${t("HTML_DIR")}`;

  const [selectedItem, setSelectedIndex] = React.useState(defaultSelection);

  const handleMenuItemClick = (evt, optionId, callbackFunction) => {
    setSelectedIndex(optionId);
    if (callbackFunction) {
      callbackFunction(optionId);
    }
    handleClose();
  };

  return (
    <div>
      <StyledMenu
        id="customized-menu"
        anchorEl={anchorEl}
        keepMounted
        open={Boolean(anchorEl)}
        onClose={handleClose}
        MenuListProps={{ disablePadding: true }}
      >
        {options.map((option, index) => (
          <StyledMenuItem
            key={option.id + "-" + index}
            id={`pmweb_${index}`}
            selected={option.id === selectedItem}
            ListItemClasses={{ gutters: classes.listItemGutters }}
            onClick={(event) =>
              handleMenuItemClick(event, option.id, option.callbackFunction)
            }
            style={props.style}
            className="pinnedListDropdown"
          >
            {option.value}
          </StyledMenuItem>
        ))}
      </StyledMenu>
    </div>
  );
}
