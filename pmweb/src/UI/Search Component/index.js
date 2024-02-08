import React, { useState, useEffect } from "react";
import PropTypes from "prop-types";
import { makeStyles } from "@material-ui/core/styles";
import InputBase from "@material-ui/core/InputBase";
import { validateRegex } from "../../validators/validator";
import { useTranslation } from "react-i18next";
import { RTL_DIRECTION } from "../../Constants/appConstants";
import Close from "../../assets/close.png";
import Lens from "../../assets/lens.png";
import "./index.css";
import { IconButton } from "@material-ui/core";

const useStyles = makeStyles((theme) => ({
  searchBox: (props) => {
    return {
      //code added on 21 June 2022 for BugId 110814
      cursor: "text",
      position: "relative",
      marginLeft: 0,
      display: "flex",
      maxWidth: props.width ? props.width : "289px",
      background: "#FFFFFF",
      border: "1px solid #d7d7d7",
      borderRadius: "2px",
      height: props.height,
      // width: props.width ? props.width : "289px",
      // [theme.breakpoints.up("sm")]: {
      //   maxWidth: props.width ? props.width : "289px",
      // },
      width: props.width ? props.width : "13vw",
      "@media (min-width: 600px) and (max-width: 1100px)": {
        width: props.width ? props.width : "16vw",
      },
    };
  },
  searchIcon: {
    position: "absolute",
    right: (props) => (props.direction === RTL_DIRECTION ? "unset" : "0.5rem"),
    left: (props) => (props.direction === RTL_DIRECTION ? "0.5rem" : "unset"),
    height: "100%",
    display: "grid",
    placeItems: "center",
    cursor: "pointer",
  },
  cancelIcon: {
    position: "absolute",
    top: "50%",
    right: (props) => (props.direction === RTL_DIRECTION ? "unset" : "2rem"),
    left: (props) => (props.direction === RTL_DIRECTION ? "1.5rem" : "unset"), //Changes made to solve Bug 137374
    transform: "translateY(-50%)",
    display: "grid",
    placeItems: "center",
    cursor: "pointer",
  },
  inputRoot: {
    color: "inherit",
  },

  inputInput: {
    padding: theme.spacing(0.5, 1),
    //code added on 16 June 2022 for BugId 110814
    cursor: "text",
    marginTop: "1px",
    fontSize: "12px",
    height: "5px",
    marginBottom: "2px",
    //background: "#fff",
    transition: theme.transitions.create("width"),
    overflow: "hidden",
    whiteSpace: "nowrap",
    textOverflow: "ellipsis",
    "&::placeholder": {
      fontSize: "12px",
      textOverflow: "ellipsis",
    },
  },
  popoverBlock: {
    position: "absolute",
    top: "30px",
    left: "-1px",
    width: (props) => (props.width ? props.width : "200px"),
    boxShadow: " 0px 3px 6px #00000029",
    border: "1px solid #d7d7d7",
    borderRadius: "2px",
    zIndex: 999,
    opacity: 1,
    background: "#fff",
    maxHeight: "250px",
    overflowY: "auto",
  },
  popoverItem: {
    listStyle: "none",
    margin: 0,
    padding: "0 0 4px",
    "& li": {
      fontSize: "12px",
      overflow: "hidden",
      textOverflow: "ellipsis",
      whiteSpace: "nowrap",
      textAlign: "left",
      padding: "5.5px 8px",
      cursor: "pointer",
      "&.heading": {
        fontWeight: 600,
        color: "#000",
      },
    },
  },
  listItem: {
    background: "#fff",
    transition: "all 100ms ease-in",
    "&:hover": {
      background: "#F0F0F0",
    },
  },
}));

const SearchBox = (props) => {
  const {
    name,
    width,
    height = "2.7rem",
    placeholder = "Search",
    onSearchChange = null,
    onSearchSubmit = null,
    clearSearchResult = null,
    onKeyDownEventFunc = null,
    haveSuggestions = false,
    haveRecents = false,
    onLoadSuggestions = null,
    onLoadRecents = null,
    recentData = [],
    suggestionData = [],
    style = {},
    regex = null,
    ariaDescription,
  } = props;
  let { t } = useTranslation();
  const direction = `${t("HTML_DIR")}`;

  const classes = useStyles({ height, width, direction });

  const [searchValue, setSearchValue] = useState("");
  const [showSuggestion, setShowSuggestion] = useState(false);
  const [showRecents, setShowRecents] = useState(false);

  useEffect(() => {
    if (haveRecents) if (onLoadRecents !== null) onLoadRecents();
  }, []);

  useEffect(() => {
    function onClickEvent(event) {
      if (event?.currentTarget?.origin !== window.location.origin) {
        return;
      }

      let isEleFound = false;

      for (let i = 0; i < 4; i++) {
        const ele = event.path ? event.path[i] : null;
        if (ele && ele.id === `pmweb_searchBoxId_${props.title}`) {
          isEleFound = true;
          return;
        }
      }
      if (!isEleFound) {
        setShowRecents(false);
        setShowSuggestion(false);
      }
    }

    window.addEventListener("click", onClickEvent);

    return () => window.removeEventListener("click", onClickEvent);
  }, []);

  useEffect(() => {
    if (props.searchTerm || props.searchTerm === "") {
      setSearchValue(props.searchTerm);
    }
  }, [props.searchTerm]);

  const onKeyDownEvent = (event) => {
    if (event.keyCode === 13) {
      searchHandler();
    }
    if (onKeyDownEventFunc) {
      onKeyDownEventFunc(event);
    }
  };

  const onChangeHandler = (e) => {
    if (props.setSearchTerm) {
      props.setSearchTerm(e.target.value);
    }
    let isRegexPassed =
      regex !== null ? validateRegex(e.target.value, regex) : true; // to test the regex with the typed value

    if (isRegexPassed || e.target.value.length === 0) {
      //*  e.target.value.length === 0 -> this is used when you want delete the last charcter using backspace
      setSearchValue(e.target.value);
      if (onSearchChange !== null) onSearchChange(e.target.value);

      //hide recents when we start the typing
      if (haveRecents)
        setShowRecents(e.target.value.length === 0 ? true : false);

      //show suggestion when we start the typing
      if (haveSuggestions) {
        if (e.target.value.length > 2) {
          if (e.target.value.length % 3 === 0)
            if (onLoadSuggestions !== null) onLoadSuggestions(e.target.value);
          setShowSuggestion(true);
        } else {
          setShowSuggestion(false);
        }
      }
    }
  };

  const cancelHandler = () => {
    setSearchValue("");
    if (onSearchChange !== null) onSearchChange("");
    setShowSuggestion(false);

    if (haveRecents) {
      setShowRecents(true);
      if (onLoadRecents !== null) onLoadRecents();
    }
    if (clearSearchResult != null) clearSearchResult();
  };

  const searchHandler = (item) => {
    let val = document.getElementById(
      `pmweb_searchBoxInput_${props.title}`
    ).value;
    if (item !== undefined) {
      item = {
        ...item,
        searchString: val,
      };

      setSearchValue(item.label);
      setShowRecents(false);
      setShowSuggestion(false);
      if (onSearchSubmit !== null) onSearchSubmit(item);
    } else {
      if (onSearchSubmit !== null) onSearchSubmit({ searchString: val });
    }
  };

  const onFocusHandler = (event) => {
    if (haveRecents && searchValue.trim() === "") {
      setShowRecents(true);
    }
  };

  return (
    /* code edited on 1 April 2023 for BugId 126147 */
    <div className="searchComponent">
      <div
        className={classes.searchBox}
        style={{ width: width, ...style }}
        id={`pmweb_searchBoxId_${props.title}`}
        // tabIndex={0}
        aria-description={`Search in ${
          ariaDescription ? ariaDescription : props?.title
        }`}
      >
        {/* Changes on 12-09-2023 to resolve the bug Id 136558 */}
        <InputBase
          name={name}
          id={`pmweb_searchBoxInput_${props.title}`}
          placeholder={t("search") ? t("search") : ""} // Added translation in palceholder on 21-09-2023 for BugId:136571
          value={searchValue}
          classes={{
            root: classes.inputRoot,
            input: classes.inputInput,
          }}
          className="searchShivani"
          autoComplete="off"
          // Changes on 19-10-2023 to resolve the bug Id 139614
          style={{ width: `calc(${width} - 64px)` }}
          inputProps={{ "aria-label": "search" }}
          onFocus={onFocusHandler}
          onChange={onChangeHandler}
          onKeyDown={onKeyDownEvent}
          disabled={props.disabled ? props.disabled : null}
          title={searchValue}
        />

        {showRecents && recentData && recentData.length > 0 && (
          <div className={classes.popoverBlock}>
            <ul className={classes.popoverItem}>
              <li className="heading">{t("recentSearch")}</li>
              {recentData.map((item, index) => {
                return (
                  <React.Fragment key={item.id}>
                    <li
                      className={classes.listItem}
                      onClick={() => searchHandler(item)}
                      id={item.id}
                    >
                      {item.label}
                    </li>
                  </React.Fragment>
                );
              })}
            </ul>
          </div>
        )}
        {showSuggestion && suggestionData && suggestionData.length > 0 && (
          <div className={classes.popoverBlock}>
            <ul className={classes.popoverItem}>
              {suggestionData.map((item, index) => {
                return (
                  <React.Fragment key={item.id}>
                    <li
                      className={classes.listItem}
                      id={item.id}
                      onClick={() => searchHandler(item)}
                    >
                      {item.label}
                    </li>
                  </React.Fragment>
                );
              })}
            </ul>
          </div>
        )}
        {searchValue !== "" && (
          <div className={classes.cancelIcon} onClick={cancelHandler}>
            <IconButton
              onClick={() => {
                if (props.setSearchTerm) {
                  props.setSearchTerm("");
                }
              }}
              id="search_Close_Btn"
              // Changes to reolve the bug Id 139904
              title="Clear Search"
            >
              <img src={Close} alt="lens" width="16px" height="16px" />
            </IconButton>
          </div>
        )}
        <div
          className={classes.searchIcon}
          onClick={() => searchHandler()}
          id="search_Search_Btn"
        >
          <img src={Lens} alt="lens" width="16px" height="16px" />
        </div>
      </div>
    </div>
  );
};

export default SearchBox;

SearchBox.propTypes = {
  name: PropTypes.string,
  placeholder: PropTypes.string,
  width: PropTypes.string,
  height: PropTypes.string,
  onSearchChange: PropTypes.func,
  onSearchSubmit: PropTypes.func, // return object {id:"", label:"", searchString:""}
  clearSearchResult: PropTypes.func,

  haveSuggestions: PropTypes.bool,
  onLoadSuggestions: PropTypes.func,
  suggestionData: PropTypes.array,
  haveRecents: PropTypes.bool,
  onLoadRecents: PropTypes.func,
  recentData: PropTypes.array,

  regex: PropTypes.string, //validation framework
};
