import React, { useMemo } from "react";
//import { clsx, IconButton, makeStyles, Tooltip, useTranslation } from 'component';
import clsx from "clsx";
import { IconButton, makeStyles, Tooltip } from "@material-ui/core";
import { useTranslation } from "react-i18next";
import SearchIcon from "@material-ui/icons/Search";
import AddIcon from "@material-ui/icons/Add";
import EditIcon from "@material-ui/icons/Edit";
import DeleteIcon from "@material-ui/icons/Delete";
import MoreVertIcon from "@material-ui/icons/MoreVert";
import MoreHorizIcon from "@material-ui/icons/MoreHoriz";
import ArrowBackIosIcon from "@material-ui/icons/ArrowBackIos";
import ArrowForwardIosIcon from "@material-ui/icons/ArrowForwardIos";
import CachedIcon from "@material-ui/icons/Cached";
import LaunchIcon from "@material-ui/icons/Launch";
import ExpandMoreIcon from "@material-ui/icons/ExpandMore";
import LockOutlinedIcon from "@material-ui/icons/LockOutlined";
import GetAppSharpIcon from "@material-ui/icons/GetAppSharp";
import PrintOutlinedIcon from "@material-ui/icons/PrintOutlined";
import VerticalAlignBottomIcon from "@material-ui/icons/VerticalAlignBottom";
import FilterListIcon from "@material-ui/icons/FilterList";
import Filter1Icon from "@material-ui/icons/Filter1";
import BarChartIcon from "@material-ui/icons/BarChart";
import DehazeIcon from "@material-ui/icons/Dehaze";
import CancelIcon from "@material-ui/icons/Cancel";
import AccountTreeIcon from "@material-ui/icons/AccountTree";
import DragIndicatorIcon from "@material-ui/icons/DragIndicator";
import CloseIcon from "@material-ui/icons/Close";
import CheckBoxOutlineBlankIcon from "@material-ui/icons/CheckBoxOutlineBlank";
import CheckBoxIcon from "@material-ui/icons/CheckBox";
import CheckIcon from "@material-ui/icons/Check";
import SyncAltIcon from "@material-ui/icons/SyncAlt";
import FormatAlignJustifyIcon from "@material-ui/icons/FormatAlignJustify";
import FormatAlignLeftIcon from "@material-ui/icons/FormatAlignLeft";
import FormatAlignRightIcon from "@material-ui/icons/FormatAlignRight";
import Language from "@material-ui/icons/Language";
import Settings from "@material-ui/icons/Settings";
import RefreshOutlinedIcon from "@material-ui/icons/RefreshOutlined";
import ArrowBackIcon from "@material-ui/icons/ArrowBack";
import PhoneAndroidIcon from "@material-ui/icons/PhoneAndroid";
import LaptopMacOutlinedIcon from "@material-ui/icons/LaptopMacOutlined";
import TabletAndroidOutlinedIcon from "@material-ui/icons/TabletAndroidOutlined";
const components = {
  SearchIcon: SearchIcon,
  AddIcon: AddIcon,
  EditIcon: EditIcon,
  DeleteIcon: DeleteIcon,
  LaunchIcon: LaunchIcon,
  CachedIcon: CachedIcon,
  ArrowBackIosIcon: ArrowBackIosIcon,
  ArrowForwardIosIcon: ArrowForwardIosIcon,
  MoreVertIcon: MoreVertIcon,
  MoreHorizIcon: MoreHorizIcon,
  ExpandMoreIcon: ExpandMoreIcon,
  LockOutlinedIcon: LockOutlinedIcon,
  GetAppSharpIcon: GetAppSharpIcon,
  PrintOutlinedIcon: PrintOutlinedIcon,
  VerticalAlignBottomIcon: VerticalAlignBottomIcon,
  FilterListIcon: FilterListIcon,
  Filter1Icon: Filter1Icon,
  BarChartIcon: BarChartIcon,
  Language: Language,
  DehazeIcon: DehazeIcon,
  CancelIcon: CancelIcon,
  AccountTreeIcon: AccountTreeIcon,
  DragIndicatorIcon: DragIndicatorIcon,
  CloseIcon: CloseIcon,
  CheckBoxIcon: CheckBoxIcon,
  CheckBoxOutlineBlankIcon: CheckBoxOutlineBlankIcon,
  CloseIcon: CloseIcon,
  CheckIcon: CheckIcon,
  FormatAlignJustifyIcon: FormatAlignJustifyIcon,
  FormatAlignLeftIcon: FormatAlignLeftIcon,
  FormatAlignRightIcon: FormatAlignRightIcon,
  SyncAltIcon: SyncAltIcon,
  Settings: Settings,
  RefreshOutlinedIcon: RefreshOutlinedIcon,
  ArrowBackIcon: ArrowBackIcon,
  PhoneAndroidIcon: PhoneAndroidIcon,
  LaptopMacOutlinedIcon,
  TabletAndroidOutlinedIcon,
};
const useStyles = makeStyles((theme) => ({
  selected: {
    //  border:"0.083rem solid grey",
    borderRadius: 1,
  },
  iconStyle: {
    padding: "0rem 0.25rem 0rem 0.167rem !important",
    margin: "0rem !important",
  },
}));

export const IconsButton = ({
  type,
  disabled = false,
  color = "",
  ...rest
}) => {
  const classes = useStyles();
  const TagName =
    components[type] == null ? components["AddIcon"] : components[type];
  return (
    <IconButton
      className={clsx(classes.iconStyle, "non-button", "icon-button")}
      disabled={disabled}
      color={color}
      {...rest}
    >
      <TagName disabled={disabled} {...rest} />
    </IconButton>
  );
};
export const IconImage = ({
  url,
  width = "15",
  height = "10",
  disabled = false,
  tooltipLabel = "",
  selected = false,
  refItem = null,
  className = "",
  border = false,
  hideThemeClasses = false,
  alt = "img",
  onClick,
  clickAllowed = true,
  tabIndex = "",
  errorImg = "",
  disableRipple = false,
  customCursor = "default",
  rotateIcon = true, // pass false to restrict icon rotation in RTL view.
  id = "",
  ...rest
}) => {
  const classes = useStyles();
  const { t } = useTranslation();
  const direction = useMemo(() => t("HTML_DIR"), [t]);
  // Function to convert pixel to rem
  const cssFile = getComputedStyle(document.body)
    .getPropertyValue(`--base_text_font_size`)
    .slice(0, -2);
  function Conversion(pixels) {
    const pixel = pixels.toString();
    const numPixel = pixel.slice(-2) == "px" ? pixel.slice(0, -2) : pixel;
    // let remLenght = numPixel/(Number(cssFile));
    let remLenght = numPixel / 12;
    return remLenght;
  }
  const remWidth = width != "" ? Conversion(width) + "rem" : "";
  const remHeight = height != "" ? Conversion(height) + "rem" : "";
  return (
    <Tooltip arrow title={tooltipLabel}>
      {clickAllowed ? (
        <IconButton
          aria-label="application-name"
          disabled={disabled}
          {...rest}
          classes={{ root: selected ? classes.selected : "" }}
          className={
            hideThemeClasses
              ? className
              : clsx("non-button", "icon-button", className)
          }
          style={{
            backgroundColor: selected ? "#ffffff" : "",
            cursor: customCursor ? customCursor : "",
            ...rest?.style,
          }}
          onClick={onClick}
          disableRipple={disableRipple}
        >
          <img
            ref={refItem}
            src={`${url}`}
            style={{
              cursor: clickAllowed ? "pointer" : "default",
              width: remWidth,
              height: remHeight,
              border: border ? "1px solid #F0F0F0" : "",
              transform:
                direction === "rtl" && rotateIcon ? "scaleX(-1)" : null,
            }}
            alt={alt}
            // onClick={onClick}
            tabIndex={tabIndex}
            onError={
              errorImg &&
              (({ currentTarget }) => {
                currentTarget.onerror = null; // prevents looping
                currentTarget.src = `${errorImg}`;
              })
            }
          />{" "}
          {/*please do not use attributes width and height as it will pass values in px only*/}
        </IconButton>
      ) : (
        <img
          // aria-label={'application-name'}
          // aria-expanded="false"
          ref={refItem}
          src={`${url}`}
          style={{
            cursor: clickAllowed ? "pointer" : "default",
            width: remWidth,
            height: remHeight,
            border: border ? "1px solid #F0F0F0" : "",
            transform: direction === "rtl" && rotateIcon ? "scaleX(-1)" : null,
          }}
          alt={alt}
          // onClick={onClick}
          tabIndex={tabIndex}
          onError={
            errorImg &&
            (({ currentTarget }) => {
              currentTarget.onerror = null; // prevents looping
              currentTarget.src = `${errorImg}`;
            })
          }
        />
      )}
    </Tooltip>
  );
};
