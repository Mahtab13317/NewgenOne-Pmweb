import React, { useState, useEffect } from "react";
import PropTypes from "prop-types";
import clsx from "clsx";
import {
  makeStyles,
  Select,
  MenuItem,
  Grid,
  useMediaQuery,
} from "@material-ui/core";
import Table from "@material-ui/core/Table";
import TableBody from "@material-ui/core/TableBody";
import TableCell from "@material-ui/core/TableCell";
import TableContainer from "@material-ui/core/TableContainer";
import TableHead from "@material-ui/core/TableHead";
import Divider from "@material-ui/core/Divider";
import ExpandMoreOutlinedIcon from "@material-ui/icons/ExpandMoreOutlined";
import TableRow from "@material-ui/core/TableRow";
import TableSortLabel from "@material-ui/core/TableSortLabel";
import Paper from "@material-ui/core/Paper";
import { useTranslation } from "react-i18next";
import SearchBox from "../../UI/Search Component";
import { tileProcess } from "../../utility/HomeProcessView/tileProcess";
import "./index.css";
import { connect, useDispatch } from "react-redux";
import * as actionCreators from "../../redux-store/actions/processView/actions.js";
import { useHistory } from "react-router-dom";
import NoResultFound from "../..//assets/NoSearchResult.svg";
import {
  PMWEB,
  PROCESSTYPE_REGISTERED,
  RTL_DIRECTION,
  SERVER_URL_LAUNCHPAD,
} from "../../Constants/appConstants";
import UnpinIcon from "../../../src/assets/abstractView/Icons/PinnedIcon.svg"; //Changes made to solve Bug 133535
import PinIcon from "../../../src/assets/abstractView/Icons/DefaultStatePin.svg";
import PinIconBlue from "../../../src/assets/abstractView/Icons/ActiveStatePin.svg";
import axios from "axios";
import { setToastDataFunc } from "../../redux-store/slices/ToastDataHandlerSlice";
import { LightTooltip } from "../../UI/StyledTooltip";
import secureLocalStorage from "react-secure-storage";
import CustomizedDropdown from "../Components_With_ErrrorHandling/Dropdown";
import { v4 as uuidv4 } from "uuid";

function descendingComparator(a, b, orderBy) {
  if (b[orderBy] < a[orderBy]) {
    return -1;
  }
  if (b[orderBy] > a[orderBy]) {
    return 1;
  }
  return 0;
}

function getComparator(order, orderBy) {
  return order === "desc"
    ? (a, b) => descendingComparator(a, b, orderBy)
    : (a, b) => -descendingComparator(a, b, orderBy);
}

function stableSort(array, comparator) {
  const stabilizedThis = array.map((el, index) => [el, index]);
  stabilizedThis.sort((a, b) => {
    const order = comparator(a[0], b[0]);
    if (order !== 0) return order;
    return a[1] - b[1];
  });
  return stabilizedThis.map((el) => el[0]);
}

function EnhancedTableHead(props) {
  // Changes made to fix bug with ID 110676

  // Changes made to fix bug with ID 120189
  let { t } = useTranslation();
  const direction = `${t("HTML_DIR")}`;
  const { headCells, hideHeader, setCategoryLength } = props;
  const { classes, order, orderBy, onRequestSort } = props;
  const dropdown = [{ Name: "L" }, { Name: "R" }, { Name: "E" }];
  const [selectedStatus, setSelectedStatus] = useState("defaultValue");
  const [searchString, setSearchString] = useState("");
  const [callFilter, setCallFilter] = useState(false);
  const createSortHandler = (property) => (event) => {
    onRequestSort(event, property);
  };

  useEffect(() => {
    if (callFilter) {
      onSearchSubmit(searchString || "");
      setCallFilter(false);
    }
  }, [callFilter]);


  // Changes made to solve Bug 139810
  useEffect(() => {
    if (props.filterValue || props.rows.length>0) {
      onSearchSubmit("");
    }
  }, [props.filterValue, props.rows]);

  const onSearchSubmit = (searchVal) => {
    let arr = [];

    setCategoryLength(0);
    props.rows.map((elem) => {
      let row_count = 0;
      arr.push({
        category: elem.category ? elem.category : null,
        categoryLength: elem.value.length,
      });
      setCategoryLength((prev) => {
        return prev + 1;
      });
      elem.value.map((val) => {
        if (
          val[props.searchProps.searchingKey]
            .toLowerCase()
            .includes(searchVal.toLowerCase())
        ) {
          if (
            selectedStatus === "defaultValue" ||
            val.status === selectedStatus ||
            (val.status === "EC" && selectedStatus === "E") ||
            (val.status === "RC" && selectedStatus === "R")
          ) {
            row_count = row_count + 1;
            arr.push(val);
          }
        }
      });
      if (row_count === 0) {
        arr.pop();
        setCategoryLength((prev) => {
          return prev - 1;
        });
      }
    });

    //  props.setSplicedRows(arr.slice(0, 20));
    setSearchString(searchVal);
    props.setSubRows(arr);
    props.setSplicedRows(arr);
    props?.setFilterValue(false);
  };

  /*const clearResult = () => {
    let arr = [];
    props.rows.map((elem) => {
      arr.push({
        category: elem.category ? elem.category : null,
        categoryLength: elem.value.length,
      });
      setCategoryLength((prev) => {
        return prev + 1;
      });
      elem.value.map((item) => {
        arr.push(item);
      });
    });
    props.setSubRows(arr);
    props.setSplicedRows(arr.slice(0, 20));
  };

  const onSelect = (e) => {
    var selected = e.target.value;
    setSelectedStatus("defaultValue");
    setCategoryLength(0);
    if (selected !== "defaultValue") {
      var arr = [];
      props.rows.map((elem) => {
        let row_count = 0;
        arr.push({
          category: elem.category ? elem.category : null,
          categoryLength: elem.value.length,
        });
        setCategoryLength((prev) => {
          return prev + 1;
        });
        elem.value.map((val) => {
          if (selected == "E") {
            if (val.status == "E") {
              row_count = row_count + 1;
              arr.push(val);
            }
          } else {
            if (val.status === selected) {
              row_count = row_count + 1;
              arr.push(val);
            }
          }
        });
        if (row_count === 0) {
          arr.pop();
          setCategoryLength((prev) => {
            return prev - 1;
          });
        }
      });
      props.setSubRows(arr);
      props.setSplicedRows(arr.slice(0, 20));
    } else {
      clearResult();
    }
  };
*/

  const clearResult = () => {
    onSearchSubmit("");
  };
  const onSelect = (e) => {
    const { value } = e.target;
    setSelectedStatus(value);
    setCategoryLength(0);
    setCallFilter(true);
  };
  return (
    <div className={classes.headerDiv}>
      <div className={classes.heading}>
        <Grid container justifyContent="space-between" xs={12}>
          <Grid item xs={4} md={6}>
            <div style={{ display: "flex" }}>
              <span className={classes.recentTitle}>
                {/*Bug 110808 : Changed the Recents to Recent as per new terminologies */}
                {`${t("recent")}`}
              </span>
              <span className={classes.recentTitle}>({props.rowCount})</span>
            </div>
          </Grid>
          {/*code edited on 2 March 2023 for BugId 121591 - Search here, all statuses won't be coming in case no item is present */}
          <Grid item xs={8} md={6}>
            {props.rows.length > 0 && (
              <div className={classes.headerRightWrapper}>
                <Grid
                  container
                  alignItems="center"
                  spacing={1}
                  justifyContent="space-between"
                >
                  <Grid
                    item
                    xs={6}
                    sm={8}
                    style={{ display: "flex", justifyContent: "end" }}
                  >
                    {props.isSearch ? (
                      <SearchBox
                        height="2.7rem"
                        width="150px"
                        title={"TabularData"}
                        onSearchChange={onSearchSubmit}
                        clearSearchResult={clearResult}
                        name="search"
                        placeholder={t("Search Here")}
                        searchTerm={searchString}
                      />
                    ) : null}
                  </Grid>
                  <Grid item xs={6} sm={4}>
                    {/* <Select
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
                  onChange={(e) => onSelect(e)}
                >
                  <MenuItem
                    className={`tableSelect`}
                    classes={{
                      root: classes.dropdownData,
                      selected: classes.selectedDropData,
                    }}
                    style={{ marginTop: ".5px" }}
                    value="defaultValue"
                  >
                    {t("allStatus")}
                  </MenuItem>
                  {dropdown?.map((x) => {
                    return (
                      <MenuItem
                        className={`tableSelect`}
                        classes={{
                          root: classes.dropdownData,
                          selected: classes.selectedDropData,
                        }}
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
                </Select> */}
                    <CustomizedDropdown
                      // IconComponent={ExpandMoreIcon}
                      variant="outlined"
                      style={{ width: "100%" }}
                      defaultValue="defaultValue"
                      value={selectedStatus}
                      onChange={onSelect}
                      isNotMandatory={true}
                      // name="Filter process type"
                      direction={direction}
                      id="pmweb_Home_recent_StatusDropdown"
                    >
                      <MenuItem
                        className={`tableSelect`}
                        classes={{
                          root: classes.dropdownData,
                          selected: classes.selectedDropData,
                        }}
                        style={{
                          marginTop: ".5px",
                          justifyContent:
                            direction === RTL_DIRECTION ? "end" : null,
                        }}
                        value="defaultValue"
                        id="pmweb_Home_recent_allStatus"
                      >
                        <p
                          style={{
                            // textAlign: "left",
                            textAlign:
                              direction === RTL_DIRECTION ? "right" : "left",
                            whiteSpace: "nowrap",
                          }}
                        >
                          {t("allStatus")}
                        </p>
                      </MenuItem>
                      {dropdown?.map((x) => {
                        return (
                          <MenuItem
                            className={`tableSelect`}
                            classes={{
                              root: classes.dropdownData,
                              selected: classes.selectedDropData,
                            }}
                            style={{
                              marginTop: ".5px",
                              justifyContent:
                                direction === RTL_DIRECTION ? "end" : null,
                            }}
                            key={x.Name}
                            id={`pmweb_home_recent_${x.Name}`}
                            value={x.Name}
                          >
                            <p
                              style={{
                                // textAlign: "left",
                                textAlign:
                                  direction === RTL_DIRECTION
                                    ? "right"
                                    : "left",
                                whiteSpace: "nowrap",
                              }}
                            >
                              {t(tileProcess(x.Name)[1])}
                            </p>

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
                    </CustomizedDropdown>
                  </Grid>
                </Grid>
              </div>
            )}
          </Grid>
        </Grid>
      </div>
      {props.splicedRows.length > 0 ? (
        <TableHead
          ref={props.headRef}
          classes={{ root: classes.tableHeadRoot }}
          style={hideHeader ? { display: "none" } : {}}
        >
          <TableRow className="commonTabularRow">
            {headCells.map((headCell, index) => (
              <TableCell
                key={headCell.id}
                // align="left"
                aria-label="header icon"
                align={direction === RTL_DIRECTION ? "right" : "left"}
                classes={{
                  root: clsx({
                    [classes.rootHeadCell]: true,
                    [classes.projectNameCell]: index === 0,
                    [classes.ownedByCell]: index === 1,
                  }),
                }}
                //classes = {{root : classes.rootHeadCell}}
                //headCell.disablePadding ? 'none' : 'default'
                style={{ width: headCell.width, ...headCell.styleTdCell }}
                sortDirection={orderBy === headCell.id ? order : false}
              >
                {headCell.sort === true ? (
                  <TableSortLabel
                    active={true} //{orderBy === headCell.id}
                    direction={orderBy === headCell.id ? order : "asc"}
                    classes={{
                      root: classes.tableSortLabelRoot,
                      icon: classes.tableSortLableIcon,
                    }}
                    onClick={createSortHandler(headCell.id)}
                    IconComponent={ExpandMoreOutlinedIcon}
                  >
                    {headCell.label}
                    {orderBy === headCell.id ? (
                      <span className={classes.visuallyHidden}>
                        {order === "desc"
                          ? "sorted descending"
                          : "sorted ascending"}
                      </span>
                    ) : null}
                  </TableSortLabel>
                ) : (
                  <p style={{ margin: "0" }}> {headCell.label} </p>
                )}
              </TableCell>
            ))}
          </TableRow>
        </TableHead>
      ) : null}
    </div>
  );
}

EnhancedTableHead.propTypes = {
  classes: PropTypes.object.isRequired,
  onRequestSort: PropTypes.func.isRequired,
  // order: PropTypes.oneOf(['asc', 'desc']).isRequired,
  //orderBy: PropTypes.string.isRequired,
};

const useStyles = makeStyles({
  root: {
    width: "100%",
    //height : '80%',
    //overflow : 'auto',
    //position: 'relative',
  },
  heading: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    paddingBottom: "1rem",
  },
  headerRightWrapper: {
    display: "flex",
    flexWrap: "wrap",
    marginLeft: (props) => (props.direction === "ltr" ? "auto" : "none"),
  },
  dropdownData: {
    textAlign: "left",
    color: "#000000",
    margin: "0",
    padding: "0.25rem 0.5rem",
    fontSize: "var(--base_text_font_size)",
    fontFamily: "var(--font_family)",
  },
  selectedDropData: {
    backgroundColor: "var(--dropdown_selection_color) !important",
    color: "white",
  },
  tableHeadRoot: {
    // position : 'fixed'
  },
  tableBodyRoot: {
    //  position : 'fixed',
    // height : '390px',
    // overflowY : 'auto',
    // position:'relative'
    cursor: "pointer",
  },
  headerDiv: {
    position: "sticky",
    top: "-3%",
    paddingTop: "1rem",
    background: "#F8F8F8",
  },
  recentTitle: {
    font: "normal normal 600 var(--title_text_font_size)/22px var(--font_family)",
    color: "#000000",
    height: "22px",
    // textAlign: "left",
    textAlign: (props) => (props.direction === "rtl" ? "right" : "left"),
    marginLeft: 0,
    marginBottom: 0,
    letterSpacing: 0,
  },
  // paginationRoot : {
  //   position : 'fixed'
  // },
  // paginationActions : {
  //   marginLeft : '0px',
  //   marginRight : '20px'
  // },
  // paginationToolbar : {
  //   '&	.MuiTablePagination-caption:first-of-type':{
  //     display : 'none'
  //   },
  //   '& .MuiTablePagination-spacer' :{
  //     display : 'none'
  //   },
  //   display : 'flex',
  //   justifyContent : 'center'
  // },
  // paginationInput : {
  //   display : 'none',
  // },
  rootHeadCell: {
    // position : 'absolute',
    // top : '0px',
    // left : '0px',
    fontFamily: "Open Sans , sans-serif",
    fontWeight: 600,
    fontSize: "0.75rem",
    color: "#000000",
    borderBottom: "0px",
    padding: "0",
    paddingLeft: "4px",
    backgroundColor: "#F8F8F8",
  },
  projectNameCell: {
    minWidth: "200px",
  },
  ownedByCell: {
    minWidth: "100px",
  },
  // processCountCell : {
  //   width : '100%',
  // },
  paper: {
    width: "100%",
    position: "relative",
    boxShadow: "none",
    //marginBottom: theme.spacing(2),
  },
  tableContainerRoot: {
    // modified on 23/10/2023 for bug_id: 134226
    // maxHeight: "100vh",
    // maxHeight: (props) => props.maxHeight || "100vh",
    maxHeight: (props) =>
      props.smallScreen1
        ? "50vh"
        : props.smallScreen2
        ? "28vh"
        : props.maxHeight,
    marginBottom: (props) =>
      props.smallScreen1 ? null : props.smallScreen2 ? "5vh" : null,
    // till here for bug_id: 134226
    //     overflowY : 'auto'
    "&::-webkit-scrollbar": {
      width: "0.5rem" /* width of scrollbar in y axis */,
      height: "0.5rem" /*width of scrollbar in x axis*/,
    },

    "&::-webkit-scrollbar-track": {
      background: "#eceff1" /* color of the tracking area */,
      borderRadius: "10px",
    },

    "&::-webkit-scrollbar-thumb": {
      backgroundColor: "#c4c4c4" /* color of the scroll thumb */,
      borderRadius: "10px" /* roundness of the scroll thumb */,
      border: "1px solid #f8f8f8" /* creates padding around scroll thumb */,
    },
  },
  table: {
    minWidth: "100%",
    maxWidth: "100%",
  },
  tableCellRoot: {
    fontFamily: "var(--font_family)",
    borderBottom: "0px",
    padding: "8px 2px",
    paddingLeft: "3px",
    marginRight: "14px",
  },
  selectedTableRow: {
    background: "#FF660026 0% 0% no-repeat padding-box",
    opacity: 1,
    "& .Mui-focusVisible ": {
      background: "#F8F8F8",
    },
  },
  selectedTableRowRoot: {
    "&:focus-visible": {
      border: `1px solid var(--brand_color1) !important`,
      background: "#FF660026 0% 0% no-repeat padding-box",
      opacity: 1,
    },
  },
  select: {
    width: "138px",
    height: "2.7rem",
    background: "#FFFFFF 0% 0% no-repeat padding-box",
    font: "normal normal normal 12px/17px Open Sans",
    border: "1px solid #d7d7d7",
    borderRadius: "2px",
    opacity: "1",
    textAlign: "left",
    marginLeft: (props) =>
      props.direction !== RTL_DIRECTION ? "10px" : "none",
    marginRight: (props) =>
      props.direction === RTL_DIRECTION ? "10px" : "none",
    "& .MuiSelect-select": {
      paddingRight: (props) =>
        props.direction === RTL_DIRECTION ? "0.5rem" : "unset",
    },
    "& .MuiSelect-icon": {
      left: (props) => (props.direction === RTL_DIRECTION ? "0" : "unset"),
      right: (props) => (props.direction !== RTL_DIRECTION ? "0" : "unset"),
      height: "1.5rem",
      width: "1.5rem",
      top: "calc(50% - 0.75rem)",
    },
    "&::before": {
      display: "none",
    },
    "&::after": {
      display: "none",
    },
  },
  visuallyHidden: {
    border: 0,
    clip: "rect(0 0 0 0)",
    height: 1,
    margin: -1,
    overflow: "hidden",
    padding: 0,
    position: "absolute",
    top: 20,
    width: 1,
  },
  tableSortLabelRoot: {
    flexDirection: "row-reverse",
  },
  tableSortLableIcon: {
    fontSize: "30px",
  },
  separatorHeading: {
    display: "flex",
    paddingTop: "1.25rem",
    paddingBottom: "1.25rem",
    overflow: "hidden",
    textAlign: "left",
    whiteSpace: "nowrap",
    background: "#F8F8F8",
    textOverflow: "ellipsis",
    fontSize: "var(--subtitle_text_font_size)",
    fontWeight: "600",
  },
});

function TabularData(props) {
  // pass  divider as true through props to show didvider ,  ans pass style object to styleDivider prop if you need to apply style to it
  // heideHeader when true hides the header , default false i.e. header will be shown
  // batchSize gives the now of rows in a single page , default 50
  // maxHeight if given , restricts the height of whole table
  // extendHeight when false, will mwke height of table body maximum enought to adjust all rows , when no of rows is less than
  // rows visible without scroll.
  // also to get height, pass function to prop getHeightOfTable, then height will be passed as parameter to this function and called
  const {
    extendHeight = true,
    hideHeader = false,
    batchSize = 50,
    maxHeight = null,
  } = props;
  const rootRef = React.useRef(null),
    headRef = React.useRef(null),
    bodyRef = React.useRef(null),
    paginationRef = React.useRef(null);
  let { t } = useTranslation();
  const direction = `${t("HTML_DIR")}`;
  const smallScreen1 = useMediaQuery("(max-width: 999px)");
  const smallScreen2 = useMediaQuery("(max-width: 1199px)");
  const dispatch = useDispatch();
  const classes = useStyles({
    direction,
    maxHeight: props.maxHeight,
    smallScreen1: smallScreen1,
    smallScreen2: smallScreen2,
  });
  const [order, setOrder] = React.useState("asc");
  const [orderBy, setOrderBy] = React.useState("projectName");
  const [rowSelected, setRowSelected] = React.useState(null);
  const [categoryLength, setCategoryLength] = React.useState(0);
  const [subRows, setSubRows] = useState([]);
  const [splicedRows, setSplicedRows] = useState([]);
  const [page, setPage] = React.useState(0);
  const [rowsPerPage, setRowsPerPage] = React.useState(batchSize);
  const [pinnedImageBlue, setPinnedImageBlue] = useState(false);
  const [filterValue, setFilterValue] = useState(false);
  const handleRequestSort = (event, property) => {
    const isAsc = orderBy === property && order === "asc";
    setOrder(isAsc ? "desc" : "asc");
    setOrderBy(property);
  };

  // useEffect(() => {
  //   let arr = [];
  //   props.rows.map((elem) => {
  //     setCategoryLength((prev) => {
  //       return prev + 1;
  //     });
  //     arr.push({
  //       category: elem.category ? elem.category : null,
  //       categoryLength: elem.value.length,
  //     });
  //     elem.value.map((item) => {
  //       arr.push(item);
  //     });
  //   });
  //   setSubRows(arr);
  //   setSplicedRows(arr.slice(0, 20));
  // }, [props.rows]);

  const history = useHistory();

  const handleRowClick = (event, rowId) => {
    setRowSelected(rowId);
    props.openProcessClick(
      rowId.ProcessId,
      rowId.parent,
      rowId.status === "E" ? PROCESSTYPE_REGISTERED : rowId.status, //for handling header changes
      rowId.version,
      rowId.name
    );
    props.openTemplate(null, null, false);
    history.push("/process");
  };

  const handleKeyUp = (event, row) => {
    if (event.key === "Enter") {
      handleRowClick(event, row);
      event.stopPropagation();
    }
  };

  React.useEffect(() => {
    document.getElementById("tableContainer").onscroll = function (event) {
      if (this.scrollTop >= this.scrollHeight - this.clientHeight) {
        //User reached bottom of table after scroll
        //Logic to call web services to get next set of data
        const timeout = setTimeout(() => {
          setSplicedRows((prev) => subRows.slice(0, prev.length + 20));
        }, 500); //timeout set to load new rows
        return () => clearTimeout(timeout);
      }
    };
  });

  const [pinnedProcessDefIdArr, setpinnedProcessDefIdArr] = useState([]);
  const [showPinBoolean, setshowPinBoolean] = useState();

  useEffect(() => {
    async function getPinned() {
      const res = await axios.get(SERVER_URL_LAUNCHPAD + "/pinnedList/1");

      res?.data?.forEach((data) => {
        setpinnedProcessDefIdArr((prev) => {
          let temp = [...prev];
          temp.push(data.Id + "");
          return temp;
        });
      });
    }
    getPinned();
  }, []);

  useEffect(() => {
    if (pinnedProcessDefIdArr.includes(rowSelected?.ProcessId + ""))
      setshowPinBoolean(false);
    else setshowPinBoolean(true);
  }, [rowSelected?.ProcessId]);

  const handlePinUnpin = async (e, row) => {
    //need to integrate api
    e.stopPropagation();
    if (pinnedProcessDefIdArr.includes(row?.ProcessId + "")) {
      const res = await axios.post(SERVER_URL_LAUNCHPAD + "/unpin", {
        status: row.status,
        id: row.ProcessId,
        applicationName: PMWEB,
        type: "P",
        applicationId: "1",
        userId: +secureLocalStorage.getItem("user_id"),
      });
      if (res.status === 200) {
        let temp = global.structuredClone(props.pinnedList);
        const newPinnedArr = temp.filter((proc) => proc.Id != row.ProcessId);
        props.setpinnedDataList(newPinnedArr);
        setpinnedProcessDefIdArr((prev) => {
          let temp = [...prev];
          temp.splice(temp.indexOf(row?.ProcessId + ""), 1);
          return temp;
        });
        dispatch(
          setToastDataFunc({
            // message: "Process successfully unpinned",
            message: t("processSuccessfullyUnpinned"),
            severity: "success",
            open: true,
          })
        );
        setFilterValue(true);
      }
    } else {
      const res = await axios.post(SERVER_URL_LAUNCHPAD + "/pin", {
        name: row.name,
        type: "P",
        parent: row.allData.parentName,
        editor: row.allData.editor,
        status: row.status, //same for temp
        creationDate: row.allData.creationDateTime,
        modificationDate: row.allData.modificationDateTime,
        accessedDate: row.allData.accessedDateTime, //same as it is temp.
        applicationName: PMWEB, //hardcoded (const file)
        id: row.ProcessId + "",
        version: Number.parseFloat(row.version).toPrecision(2) + "",
        statusMessage: "Created",
        applicationId: "1",
        parentId: row.allData.parentId + "",
        parentStatus: row.status,
        parentType: "PR",
        userId: +secureLocalStorage.getItem("user_id"),
      });
      if (res.status === 200) {
        let temp = global.structuredClone(props.pinnedList);
        temp.push({
          ParentId: +row.allData.parentId,
          Status: row.status,
          // modified on 27/09/2023 for BugId 136677
          // CreationDate: moment(row.allData.creationDateTime).format("Do MMM"),
          // ModificationTime: moment(row.allData.modificationDateTime).format(
          //   "h:mm a"
          // ),
          // AccessedDate: moment(row.allData.accessedDateTime).format("Do MMM"),
          // ModificationDate: moment(row.allData.modificationDateTime).format(
          //   "Do MMM"
          // ),
          // AccessedTime: moment(row.allData.accessedDateTime).format("h:mm a"),
          // CreationTime: moment(row.allData.creationDateTime).format("h:mm a"),
          CreationDateTime: row.allData.creationDateTime,
          CreationTime: row.allData.creationTime,
          CreationDate: row.allData.creationDate,
          ModificationTime: row.allData.modificationTime,
          ModificationDate: row.allData.modificationDate,
          ModificationDateTime: row.allData.modificationDateTime,
          AccessedDateTime: row.allData.accessedDateTime,
          AccessedTime: row.allData.accessedTime,
          AccessedDate: row.allData.accessedDate,
          // till here BugId 136677
          OrderId: Math.max(...props.pinnedList.map((proc) => +proc.Id)) + 1,
          Name: row.name,
          StatusMessage: "Created",
          ImageBuffer: "",
          Parent: row.allData.parentName,
          Type: "P",
          Version: Number.parseFloat(row.version).toPrecision(2) + "",
          UserId: "",
          SameDate: "true",
          Id: +row.ProcessId,
          ApplicationId: 1,
          Editor: row.Editor,
        });
        props.setpinnedDataList(temp);
        setpinnedProcessDefIdArr((prev) => {
          let temp = [...prev];
          temp.push(row?.ProcessId + "");
          return temp;
        });
        dispatch(
          setToastDataFunc({
            // message: "Process successfully pinned",
            message: t("processSuccessfullyPinned"),
            severity: "success",
            open: true,
          })
        );
        setFilterValue(true);
      }
    }
  };

  return (
    <div
      className={classes.root}
      ref={rootRef}
      style={maxHeight !== null ? { maxHeight: maxHeight } : {}}
    >
      <Paper className={classes.paper}>
        <EnhancedTableHead
          classes={classes}
          order={order}
          orderBy={orderBy}
          filterValue={filterValue}
          setFilterValue={setFilterValue}
          isSearch={props.isSearch}
          onRequestSort={handleRequestSort}
          rowCount={
            subRows.length > categoryLength
              ? subRows.length - categoryLength
              : 0
          }
          headCells={props.tableHead}
          headRef={headRef}
          rows={props.rows}
          count={props.rowNo}
          hideHeader={hideHeader}
          searchProps={props.searchProps}
          setSubRows={setSubRows}
          splicedRows={splicedRows}
          setSplicedRows={setSplicedRows}
          setCategoryLength={setCategoryLength}
        />
        <TableContainer
          classes={{ root: classes.tableContainerRoot }}
          id="tableContainer"
        >
          {splicedRows.length > 0 ? (
            <>
              {splicedRows.map((row, index) => {
                return (
                  <>
                    {row.categoryLength > 0 ? (
                      row.category || row.category === null ? (
                        index === 0 ? null : (
                          <div
                            className={
                              row.category ? classes.separatorHeading : ""
                            }
                            noWrap={true}
                          >
                            {" "}
                            {t(row.category)}
                          </div>
                        )
                      ) : null
                    ) : extendHeight || props.rows.length !== 0 ? (
                      <Table
                        className={classes.table}
                        aria-labelledby="tableContainer"
                        aria-label="enhanced table"
                      >
                        <TableBody
                          ref={bodyRef}
                          classes={{ root: classes.tableBodyRoot }}
                        >
                          <tr aria-label="row divider">
                            <td colspan={props.tableHead.length}>
                              {props.divider ? (
                                <Divider
                                  style={
                                    props.styleDivider ? props.styleDivider : {}
                                  }
                                />
                              ) : null}
                            </td>
                          </tr>

                          <TableRow
                            classes={{
                              selected: classes.selectedTableRow,
                              root: classes.selectedTableRowRoot,
                            }}
                            hover
                            onMouseEnter={() => setRowSelected(row)}
                            onMouseLeave={() => setRowSelected(null)}
                            onClick={(event) => handleRowClick(event, row)}
                            // role="checkbox"
                            id={`pmweb_home_recent_table_${index}`}
                            key={row.rowId}
                            tabindex={0}
                            onKeyUp={(e) => {
                              handleKeyUp(e, row);
                            }}
                          >
                            {props.tableHead.map((headCell, index) => {
                              if (index === 0) {
                                return (
                                  <TableCell
                                    key={headCell.id + row.rowId}
                                    component="th"
                                    scope="row"
                                    padding="none"
                                    classes={{
                                      root: classes.tableCellRoot,
                                    }}
                                    style={{
                                      width: headCell.width,
                                      ...headCell.styleTdCell,
                                    }}
                                  >
                                    {row[headCell.id]}
                                  </TableCell>
                                );
                              } else {
                                return (
                                  <TableCell
                                    key={headCell.id + row.rowId}
                                    // align="left"
                                    align={
                                      direction === RTL_DIRECTION
                                        ? "right"
                                        : "left"
                                    }
                                    classes={{
                                      root: classes.tableCellRoot,
                                    }}
                                    style={{
                                      width: headCell.width,
                                      ...headCell.styleTdCell,
                                    }}
                                  >
                                    <div
                                      style={{
                                        display: "flex",
                                        flexDirection: "row",
                                        // justifyContent:
                                        //   direction === RTL_DIRECTION
                                        //     ? "end"
                                        //     : "space-between",
                                      }}
                                    >
                                      <div
                                        style={{
                                          display: "flex",
                                          flexDirection: "row",
                                          // width: "100%",
                                          justifyContent:
                                            direction === RTL_DIRECTION
                                              ? "end"
                                              : "space-between",
                                        }}
                                      >
                                        {row[headCell.id]}
                                        {/* <div
                                      style={{
                                        background: "red",
                                        width: "1.5rem",
                                        height: "1.5rem",
                                      }}
                                      onClick={() =>
                                        pinUnpinHandler(
                                          showPinBoolean ? 12 : 11
                                        )
                                      }
                                    > */}
                                      </div>
                                      {/* </div> */}
                                      <div>
                                        {headCell.id === "LU" ? (
                                          <>
                                            {/* Changes made to solve Bug 124292  */}
                                            <LightTooltip
                                              id="actName_Tooltip"
                                              arrow={true}
                                              enterDelay={500}
                                              placement="bottom-start"
                                              title={
                                                showPinBoolean
                                                  ? t("PinProcess")
                                                  : t("UnpinProcess")
                                              }
                                            >
                                              {/* Changes made to solve Bug 133535 */}
                                              <img
                                                src={
                                                  showPinBoolean &&
                                                  !pinnedImageBlue
                                                    ? PinIcon
                                                    : pinnedImageBlue
                                                    ? PinIconBlue
                                                    : UnpinIcon
                                                }
                                                onMouseEnter={() =>
                                                  setPinnedImageBlue(true)
                                                }
                                                onMouseLeave={() =>
                                                  setPinnedImageBlue(false)
                                                }
                                                // till here dated 8thSept
                                                style={{
                                                  width: "1.25rem",
                                                  height: "1.25rem",
                                                  marginRight: "0.9375rem",
                                                  transform:
                                                    direction === RTL_DIRECTION
                                                      ? "scaleX(-1)"
                                                      : null,
                                                  display:
                                                    row.ProcessId ===
                                                      rowSelected?.ProcessId &&
                                                    !row.status.includes("C")
                                                      ? ""
                                                      : "none",
                                                }}
                                                alt="Pin or Unpin process"
                                                id={`pmweb_home_recent_pinIcon_${uuidv4()}`}
                                                onClick={(e) =>
                                                  handlePinUnpin(e, row)
                                                }
                                              />
                                            </LightTooltip>
                                          </>
                                        ) : null}
                                      </div>
                                    </div>
                                  </TableCell>
                                );
                              }
                            })}
                          </TableRow>
                        </TableBody>
                      </Table>
                    ) : null}
                  </>
                );
              })}
            </>
          ) : (
            /*code edited on 2 March 2023 for BugId 121591 - No data present in the recent illustration is coming too big, should be reduced by at least 40-50%, and the description text is missing too */
            <div
              style={{
                width: "25%",
                left: "35%",
                top: "20vh",
                position: "absolute",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: "0.25rem",
              }}
            >
              <img
                src={NoResultFound}
                style={{
                  width: "80%",
                  aspectRatio: "1",
                  transform: direction === RTL_DIRECTION ? "scaleX(-1)" : null,
                }}
                alt="No recent processes"
              />
              <span
                style={{
                  font: "normal normal 500 var(--base_text_font_size)/17px var(--font_family)",
                  color: "#6C6C6C",
                }}
              >
                {t("noRecentProcesses")}{" "}
                {/* added on 19/9/2023 for bug_id: 136368 */}
              </span>
            </div>
          )}
        </TableContainer>
        {props.rows.length > rowsPerPage
          ? null
          : // <TablePagination
            //   ref = {paginationRef}
            //   classes = {{root : classes.paginationRoot ,
            //     actions : classes.paginationActions,
            //     toolbar : classes.paginationToolbar,
            //     input : classes.paginationInput
            //   }}
            //   //rowsPerPageOptions={[10, 25 , 50, 75, 100]}
            //   component="div"
            //   count={props.rows.length}
            //   rowsPerPage={rowsPerPage}
            //   page={page}
            //   onChangePage={handleChangePage}
            //   onChangeRowsPerPage={handleChangeRowsPerPage}
            // />
            null}
      </Paper>
      {/* <FormControlLabel
        control={<Switch checked={dense} onChange={handleChangeDense} />}
        label="Dense padding"
      /> */}
    </div>
  );
}

const mapStateToProps = (state) => {
  return {
    pinnedList: state.processTypesReducer.pinnedData,
  };
};

const mapDispatchToProps = (dispatch) => {
  return {
    openProcessClick: (id, name, type, version, processName) =>
      dispatch(
        actionCreators.openProcessClick(id, name, type, version, processName)
      ),
    openTemplate: (id, name, flag) =>
      dispatch(actionCreators.openTemplate(id, name, flag)),
    setpinnedDataList: (list) => dispatch(actionCreators.pinnedDataList(list)),
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(TabularData);
