import React, { useEffect, useState } from "react";
import PropTypes from "prop-types";
import SearchBox from "../../UI/Search Component/index";
import { makeStyles, Typography } from "@material-ui/core";
// import { Spinner } from 'component/Loader';
import processIcon from "../../assets/HomePage/processHeader.svg";
import ProcessIconTable from "../../assets/HomePage/process.svg";
import { Select, MenuItem } from "@material-ui/core";
import { tileProcess } from "../../utility/HomeProcessView/tileProcess";
import { useTranslation } from "react-i18next";
import "./index.css";

const useStyles = makeStyles((theme) => ({
  root: {
    width: "100%",
  },
  subRoot: {
    width: "100%",
    height: "100%",
    marginBottom: "100px",
  },

  comp: {
    display: "flex",
    alignItems: "center",
    background: "white",
    marginBottom: "4px",
    boxShadow: "none",
    width: "100%",
    transition: "all 100ms ease-in",
    "&:hover": {
      backgroundColor: "rgba(0, 0, 0, 0.04)",
    },
  },

  spinner: {
    height: "600px",
  },

  heading: {
    display: "flex",
    paddingLeft: (props) => (props.direction === "ltr" ? "8px" : "none"),
    width: "100%",
  },

  headerRightWrapper: {
    display: "flex",
    flexWrap: "wrap",
    marginLeft: (props) => (props.direction === "ltr" ? "auto" : "none"),
  },

  buttonWrapper: {
    margin: "0px 16px",
    height: "27.5px",
    width: "138px",
    backgroundColor: theme.palette.common.white,
  },
  headingText: {
    color: "rgba(0, 0, 0, 0.87)",
    fontSize: "0.75rem",
    fontWeight: 600,
    lineHeight: "1.5rem",
    height: "30px",
    paddingTop: "4px",
    paddingRight: (props) => (props.direction !== "ltr" ? "30px" : "none"),
    paddingLeft: "10px",
  },

  icon: {
    marginRight: (props) =>
      props.direction === "ltr" ? theme.spacing(2) : "none",
  },

  iconImg: {
    minWidth: "4.5%",
    width: "4.5%",
    paddingLeft: "10px",
    lineHeight: "0",
  },

  separetorHeading: {
    fontSize: "12px",
    fontWeight: "600",
    margin: (props) =>
      props.direction === "ltr" ? "15px 0px 15px 53px" : "15px 53px 15px 0px",
  },
  title: {
    height: "22px",
    textAlign: "left",
    font: "normal normal 600 16px/22px Open Sans",
    letterSpacing: "0px",
    color: "#000000",
    opacity: "1",
    marginLeft: "0",
    marginBottom: "0",
  },
  sticky: {
    display: "flex",
    justifyContent: "space-between",
    paddingTop: "15px",
    width: "100%",
    flexWrap: "wrap",
    zIndex: 99,
    background: "#f8f8f8",
    position: "sticky",
    top: "55px",
    boxShadow: "0px 3px 6px #00000029",
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    paddingTop: "15px",
    width: "100%",
    flexWrap: "wrap",
    zIndex: 99,
    background: "#f8f8f8",
  },

  select: {
    width: "138px",
    height: "28px",
    background: "#FFFFFF 0% 0% no-repeat padding-box",
    font: "normal normal normal 12px/17px Open Sans",
    border: "1px solid #C4C4C4",
    borderRadius: "2px",
    opacity: "1",
    marginLeft: (props) => (props.direction !== "rtl" ? "10px" : "none"),
    marginRight: (props) => (props.direction === "rtl" ? "10px" : "none"),
  },
  dropdownData: {
    // width: "45px",
    height: "17px",
    textAlign: "left",
    font: "normal normal normal 12px/17px Open Sans",
    letterSpacing: "0px",
    color: "#000000",
    opacity: "1",
    marginTop: "8px",
    paddingLeft: "10px !important",
    marginLeft: "0px",
  },
}));

const RecentActivity = (props) => {
  let { t } = useTranslation();
  const {
    loading = false,
    isSearch = true,
    recentList = [],
    headerData = [],
    isSticky = true,
    disableImg = false,
    searchingKey = "name",
    direction = "ltr",
    imageInfo = {
      path: `${process.env.REACT_APP_CONTEXT_PATH}/icons/`,
      ext: ".svg",
    },
  } = props;
  const classes = useStyles({ direction });
  const [data, setData] = useState();
  const [updateData, setUpdatedData] = useState(recentList);
  const [goingUp, setGoingUp] = useState(false);
  const [stick, setStick] = useState(false);
  const dropdown = [
    { Name: "L" },
    { Name: "R" },
    { Name: "RP" },
    { Name: "E" },
    { Name: "EP" },
  ];

  useEffect(() => {
    let newData = [];
    let obj = {};
    let obj1 = {};
    let arCom = [];

    updateData.forEach((categoryList) => {
      // no. api rows
      obj = {
        category: categoryList.category,
        value: [],
      };
      categoryList.value.forEach((valueItem) => {
        // no. of object inside each category
        headerData.forEach((ele) => {
          arCom.push(ele.component(valueItem)); //passing the object to each header object
        });

        obj1 = {
          img_type: valueItem.img_type,
          component: (
            <div
              style={{
                display: "inline-flex",
                position: "relative",
                width: "100%",
              }}
            >
              {arCom &&
                arCom.map((item, index) => {
                  if (index + 1 !== headerData.length) {
                    return item;
                  } else {
                    return item;
                  }
                })}
            </div>
          ),
        };
        arCom = [];
        obj.value.push(obj1);
      });
      newData.push(obj);
    });

    setData(newData);
  }, [updateData]);

  // useEffect(() => {
  //   const header = document.getElementById("myHeader");
  //   const sticky = header.offsetTop - 55;
  //   // window.addEventListener("scroll",
  //   const scrollCallBack =  () => {
  //     debugger
  //     if (window.pageYOffset > sticky) {
  //       debugger
  //       setGoingUp(true)
  //     } else {
  //       setGoingUp(false)
  //     }
  //   };
  //   window.addEventListener("scroll",  scrollCallBack)
  //   return () => {
  //     window.removeEventListener("scroll", scrollCallBack);
  //   };
  // }, []);

  useEffect(() => {
    const header = document.getElementById("myHeader");
    const sticky = header.offsetTop - 55;
    const scrollCallBack = window.addEventListener("scroll", () => {
      if (isSticky) {
        if (window.pageYOffset > sticky) {
          setGoingUp(true);
          if (header.getBoundingClientRect().top === 55) {
            setStick(true);
          } else {
            setStick(false);
          }
        } else {
          setGoingUp(false);
        }
      }
    });
    return () => {
      window.removeEventListener("scroll", scrollCallBack);
    };
  }, []);

  const onSearchSubmit = (obj) => {
    let ar = [];
    recentList &&
      recentList.map((category) => {
        let searchedVal = category.value?.filter((val) => {
          return val[searchingKey].toLowerCase().includes(obj.searchString);
        });
        if (searchedVal.length > 0) {
          ar.push({
            ...category,
            value: searchedVal,
          });
        }
      });
    setUpdatedData(ar);
  };
  const clearSearchResult = () => {
    setUpdatedData(recentList);
  };

  const onSelect = (e) => {
    var selected = e.target.value;
    if (selected !== "defaultValue") {
      var filterarr = [];
      recentList &&
        recentList.map((list) => {
          var arrayObj = [];

          list.value &&
            list.value.map((x) => {
              if (x.status === selected) {
                arrayObj.push(x);
              }
            });

          filterarr.push({
            ...list,
            value: arrayObj,
          });
        });
      setUpdatedData(filterarr);
    } else {
      setUpdatedData(recentList);
    }
  };

  return (
    <div className={classes.root}>
      {loading ? (
        <div className={classes.spinner}>{/*<Spinner />*/}</div>
      ) : (
        <div className={classes.subRoot}>
          <div
            id="myHeader"
            className={goingUp ? classes.sticky : classes.header}
          >
            <Typography className={classes.title} noWrap={true}>
              {" "}
              {t("recent")}
            </Typography>
            <div className={classes.headerRightWrapper}>
              {isSearch ? (
                <SearchBox
                  height="28px"
                  title={"CategoryTable"}
                  width="150px"
                  onSearchSubmit={() => onSearchSubmit(recentList)}
                  clearSearchResult={clearSearchResult}
                  name="search"
                  placeholder={"Search Here"}
                />
              ) : null}
              <Select
                className={classes.select}
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
                }}
                defaultValue={"defaultValue"}
                onChange={onSelect}
              >
                <MenuItem
                  className={classes.dropdownData}
                  style={{ marginTop: ".5px" }}
                  value="defaultValue"
                >
                  {t("allStatus")}
                </MenuItem>
                {dropdown &&
                  dropdown.map((x) => {
                    return (
                      <MenuItem
                        className={classes.dropdownData}
                        key={x.Name}
                        value={x.Name}
                      >
                        {tileProcess(x.Name)[1]}
                        {x.Name == "RP" || x.Name == "EP" ? (
                          <img
                            style={{ marginLeft: "5px" }}
                            src={t(tileProcess(x.Name)[5])}
                            alt={t("img")}
                          />
                        ) : (
                          ""
                        )}
                      </MenuItem>
                    );
                  })}
              </Select>
            </div>

            <div className={classes.heading}>
              {disableImg ? null : (
                <div className={classes.iconImg}>
                  <img
                    src={processIcon}
                    alt="file"
                    style={{ marginTop: "3px" }}
                  />
                </div>
              )}
              <div
                style={{
                  display: "inline-flex",
                  width: "100%",
                }}
              >
                {headerData &&
                  headerData.map((item, index) => (
                    <Typography
                      className={classes.headingText}
                      key={index}
                      noWrap={true}
                      style={{ width: item.width }}
                    >
                      {item.category}
                    </Typography>
                  ))}
              </div>
            </div>
          </div>
          {data?.map((item, index) => {
            return (
              <div key={index}>
                <Typography
                  className={item.category ? classes.separetorHeading : ""}
                  noWrap={true}
                >
                  {" "}
                  {item.value.length > 0 ? item.category : null}
                </Typography>
                {item?.value?.map((res, index) => {
                  return (
                    <React.Fragment key={index} index={index}>
                      <div className={classes.comp}>
                        <div className={classes.iconImg}>
                          {disableImg === true ? null : (
                            <img src={ProcessIconTable} alt="file" />
                          )}
                        </div>
                        {res.component}
                      </div>
                    </React.Fragment>
                  );
                })}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

RecentActivity.propTypes = {
  loading: PropTypes.bool.isRequired,
  isSearch: PropTypes.bool,
  recentList: PropTypes.array.isRequired,
  headerData: PropTypes.array.isRequired,
  disableImg: PropTypes.bool.isRequired,
  imageInfo: PropTypes.object.isRequired,
};

export default RecentActivity;
