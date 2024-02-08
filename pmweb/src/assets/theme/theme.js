import { createMuiTheme } from "@material-ui/core/styles";
const orange = "#FF6600";
const orange2 = "#FD6620";
const dark = "#222222";
const blue = "#0072C6";
const lightblue = "#E5F1F9";
const blue2 = "#57A5DE";
const dodgerBlue = "#19B5FE";
//const lightSkyBlue = "#0072C614";
const lightSkyBlue = "#E5F1F9";

/**
 * const primary1={
 * main:'#0072C6',
 * onHover:'#005EA3',
 * onSelection:"#E5F1F9"
 * }
 * const primary2={
 * main:'#FF6600',
 * onHover:'#F26100',
 * onSelection:"#FFEFE5"
 * }.
 * const alertColor:{
 * error:'#D53D3D',
 * warning:'#AD6503',
 * success:'#0D6F08'
 *
 * }
 *
 *
 *
 *
 *
 *
 *
 *
 *
 */

export default createMuiTheme({
  overrides: {
    MuiOutlinedInput: {
      input: {
        padding: "6.5px 6px",
        height: "28px",
      },
      multiline: {
        padding: "6.5px 6px",
        border: `0px solid #CECECE`,
      },
      root: {
        borderRadius: "2px !important", // code edited on 19 Dec 2022 for BugId 120726
        border: `1px solid #CECECE !important`, // code edited on 19 Dec 2022 for BugId 120726
      },
      adornedStart: {
        paddingInlineStart: "9px",
      },

      "& focus": {
        border: `0px solid #CECECE !important`,
      },
      notchedOutline: {
        border: "0 !important",
        borderRadius: "0 !important",
      },
      "& Mui-focused": {
        border: `0px solid #CECECE !important`,
      },
    },
    MuiSelect: {
      select: {
        "&:focus": {
          backgroundColor: "transparent !important",
        },
        color: "#000000",
        "&$disabled": {
          color: "#000000",
        },
      },
      selectMenu: {
        /* Commented as because of this padding, dropdown was looking distorted on focus while using tab. */
        // padding: "0.25rem 0.5vw",
        alignItems: "center",
      },
      /*added for dropdown icon in Select*/
      icon: {
        top: "calc(50% - 10px)",
        width: "1.5rem",
        height: "1.5rem",
      },
    },
    MuiButton: {
      root: {
        "&$disabled": {
          pointerEvents: "none",
          cursor: "default",
          backgroundColor: "transparent",
          opacity: 0.9,
          //color: "#000000",
        },
        minWidth: 35,
        minHeight: 28,
        padding: "5px 8px 6px 8px",
        borderRadius: 2,
        //fontSize: 12,
      },
      sizeSmall: {
        fontSize: 12,
        fontWeight: "bold",
      },
      label: {
        fontSize: 12,
        fontWeight: 600,
      },
    },
    // code added on 29 Oct 2022 for BugId 116837
    MuiBox: {
      root: {
        margin: "0",
        padding: "0",
      },
    },
    // code added on 29 Oct 2022 for BugId 116837
    MuiTab: {
      wrapper: {
        flexDirection: "row",
      },
    },
    MuiTabs: {
      indicator: {
        backgroundColor: "var(--selected_tab_color)",
        height: "2.5px",
      },
    },
    MuiCheckbox: {
      root: {
        margin: "0.5rem 0.5vw",
        padding: "0px",
        fontSize: "var(--base_text_font_size)",
        "&$checked": {
          color: "var(--checkbox_color) !important",
        },
        "&$disabled": {
          color: "rgba(0, 0, 0, 0.26) !important",
        },
        "& svg": {
          width: "1.25rem !important",
          height: "1.25rem !important",
        },
        "&$focused": {
          outline: "2px solid var(--button_color) !important",
          borderRadius: "2px !important",
        },
        colorSecondary: {
          "&$checked": {
            "&.Mui-focusVisible": {
              outline: "2px solid var(--button_color) !important",
              borderRadius: "2px !important",
            },
          },
          "&.Mui-focusVisible": {
            outline: "2px solid var(--button_color) !important",
            borderRadius: "2px !important",
          },
        },
        colorPrimary: {
          "&$checked": {
            "&.Mui-focusVisible": {
              outline: "2px solid var(--button_color) !important",
              borderRadius: "2px !important",
            },
          },
          "&.Mui-focusVisible": {
            outline: "2px solid var(--button_color) !important",
            borderRadius: "2px !important",
          },
        },
      },
    },
    MuiRadio: {
      root: {
        margin: "0.5rem 0.5vw",
        padding: "0px",
        fontSize: "var(--base_text_font_size)",
        "&$checked": {
          color: "var(--radio_color) !important",
        },
        "&$disabled": {
          color: "rgba(0, 0, 0, 0.26) !important",
        },

        colorSecondary: {
          "&$checked": {
            "&.Mui-focusVisible": {
              outline: "2px solid var(--button_color) !important",
              borderRadius: "2px !important",
            },
          },
          "&.Mui-focusVisible": {
            outline: "2px solid var(--button_color) !important",
            borderRadius: "2px !important",
          },
        },
        colorPrimary: {
          "&$checked": {
            "&.Mui-focusVisible": {
              outline: "2px solid var(--button_color) !important",
              borderRadius: "2px !important",
            },
          },
          "&.Mui-focusVisible": {
            outline: "2px solid var(--button_color) !important",
            borderRadius: "2px !important",
          },
        },
      },
      "& svg": {
        width: "1.25rem !important",
        height: "1.25rem !important",
      },
      "&$focused": {
        outline: "2px solid var(--button_color) !important",
        borderRadius: "2px !important",
      },
    },
    MuiTypography: {
      root: {
        fontSize: "var(--base_text_font_size)",
      },
    },
    MuiInput: {
      underline: {
        "&::before": {
          content: "none",
          border: "0",
        },
        "&::after": {
          border: "0",
        },
      },
    },
    MuiMenu: {
      paper: {
        /*added to give border to all dropdowns*/
        border: "1px solid #d7d7d7 !important",
        boxShadow: "rgb(0 0 0 / 16%) 0px 3px 6px !important",
      },
    },
    MuiPopover: {
      paper: {
        "&::-webkit-scrollbar": {
          backgroundColor: "transparent",
          width: "0.5rem",
          height: "0.5rem",
        },
        "&::-webkit-scrollbar-thumb": {
          background: "#dadada 0% 0% no-repeat padding-box !important",
          borderRadius: "0.313rem",
          border: "0",
        },
        /*code added on 7 April 2023 for BugId 126290*/
        scrollbarColor: "#dadada #fafafa",
        scrollbarWidth: "thin",
      },
    },
    PrivateTabIndicator: {
      vertical: {
        right: "unset",
        left: "0",
        width: "3px",
      },
    },
    MuiAutocomplete: {
      inputRoot: {
        padding: "0 !important",
        height: "var(--line_height)",
      },
      endAdornment: {
        right: "5px !important",
        "& svg": {
          width: "1.5rem",
          height: "1.5rem",
        },
      },
      popupIndicator: {
        padding: "0 !important",
        margin: "0 !important",
      },
      popper: {
        boxShadow: "rgb(0 0 0 / 16%) 0px 3px 6px !important",
        border: "1px solid #c4c4c4 !important",
        "& div": {
          margin: "0",
          padding: "0",
        },
        "& ul": {
          padding: "0",
          maxHeight: "8rem",
          minHeight: "1.5rem",
          overflowY: "auto",
          backgroundColor: "white",
          "&::-webkit-scrollbar": {
            backgroundColor: "transparent",
            width: "0.5rem",
            height: "0.5rem",
          },
          "&::-webkit-scrollbar-thumb": {
            background: "#dadada 0% 0% no-repeat padding-box !important",
            borderRadius: "0.313rem",
            border: "0",
          },
          /*code added on 7 April 2023 for BugId 126290*/
          scrollbarColor: "#dadada #fafafa",
          scrollbarWidth: "thin",
        },
        "& ul li": {
          padding: "0.25rem 0.75vw",
          height: "var(--line_height)",
          minHeight: "1.25rem",
        },
      },
    },
    MuiIconButton: {
      label: {
        width: "fit-content",
        position: "relative",
      },
    },
    MuiGrid: {
      container: {
        "&::-webkit-scrollbar": {
          backgroundColor: "transparent",
          width: "0.375rem",
          height: "0.6rem",
        },
        "&::-webkit-scrollbar-thumb": {
          background: "transparent !important",
          borderRadius: "0.313rem",
          border: "0",
        },
        "&:hover::-webkit-scrollbar-thumb": {
          background: "#dadada 0% 0% no-repeat padding-box !important",
          borderRadius: "0.313rem",
          border: "0",
        },
        /*code added on 7 April 2023 for BugId 126290*/
        scrollbarColor: "#dadada #fafafa",
        scrollbarWidth: "thin",
      },
    },
    MuiDrawer: {
      root: {
        "& ::-webkit-scrollbar": {
          backgroundColor: "transparent",
          width: "0.375rem",
          height: "0.6rem",
        },
        "& ::-webkit-scrollbar-thumb": {
          background: "transparent !important",
          borderRadius: "0.313rem",
          border: "0",
        },
        "& :hover::-webkit-scrollbar-thumb": {
          background: "#dadada 0% 0% no-repeat padding-box !important",
          borderRadius: "0.313rem",
          border: "0",
        },
        "scrollbar-color": "#dadada #fafafa",
        "scrollbar-width": "thin",
      },
    },
    MuiListItem: {
      root: {
        "&$.MuiListItem": {
          selected: {
            background: "var(--dropdown_selection_color) !important",
          },
        },
      },
    },
    MuiInputBase: {
      input: {
        textOverflow: "ellipsis",
      },
    },
    MuiFormControlLabel: {
      root: {
        marginInlineStart: "-0.5vw",
        marginInlineEnd: "1vw",
      },
    },
    MuiAlert: {
      root: {
        display: "flex",
        alignItems: "center",
      },
    },
    MuiTabScrollButton: {
      root: {
        "&$disabled": {
          width: "0px",
        },
      },
    },
    MuiAccordionSummary: {
      content: {
        margin: "0.5rem 0",
        "&$expanded": {
          margin: "0.5rem 0",
        },
      },
      expandIcon: {
        padding: "0.5rem 0.5vw",
        margin: "0",
      },
    },
  },
  palette: {
    common: {
      dark: `${dark}`,
      orange: `${orange2}`,
      blue: `${blue}`,
    },

    primary: {
      main: `${blue}`,
      light: `${lightSkyBlue}`,
      secondary: `${lightblue}`,
    },
    secondary: {
      main: `${orange2}`,
    },
  },
  typography: {
    button: {
      textTransform: "none",
      fontSize: 12,
    },
    lineHeight: 17,
    fontSize: "var(--base_text_font_size)",
    fontWeightRegular: 500,
    htmlFontSize: 15,
    fontFamily: ["Open Sans", "sans-serif"].join(","),
  },
  shadows: ["none"],
  breakpoints: {
    values: {
      xs: 0,
      sm: 700,
      md: 1000,
      lg: 1200,
      xl: 1536,
    },
  },
  props: {
    /*MuiButtonBase: {
      // The properties to apply
      disableRipple: true, // No more ripple, on the whole application!
    },*/
  },
});
