// #BugID - 121526
// #BugDescription - Handled the function to generate the logs

// #BugID - 126288
// #BugDescription - Added the loader in project list while response is coming

import React, { useState, useEffect } from "react";
import classes from "./AuditLogs.module.css";
import { useTranslation } from "react-i18next";
import ExpandMoreIcon from "@material-ui/icons/ExpandMore";
import Table from "@material-ui/core/Table";
import TableBody from "@material-ui/core/TableBody";
import TableCell from "@material-ui/core/TableCell";
import TableContainer from "@material-ui/core/TableContainer";
import TableHead from "@material-ui/core/TableHead";
import TableRow from "@material-ui/core/TableRow";
import Paper from "@material-ui/core/Paper";
import { DatePickers } from "../../../UI/DatePicker/DatePickers";
import {
  CircularProgress,
  MenuItem,
  Grid,
  useMediaQuery,
} from "@material-ui/core";
import moment from "moment";
import clsx from "clsx";
import {
  ENDPOINT_GETAUDITLOG,
  SERVER_URL,
  ENDPOINT_GETALLVERSIONS,
  SEVEN,
  FIFTEEN,
  THIRTY,
  ENDPOINT_GETPROJECTLIST_DRAFTS,
  ENDPOINT_GETPROJECTLIST_DEPLOYED,
  ENDPOINT_PROCESSLIST,
  RTL_DIRECTION,
  APP_HEADER_HEIGHT,
} from "../../../Constants/appConstants";
import axios from "axios";
import { tileProcess } from "../../../utility/HomeProcessView/tileProcess";
import { useDispatch, useSelector } from "react-redux";
import { setToastDataFunc } from "../../../redux-store/slices/ToastDataHandlerSlice";
import { store, useGlobalState } from "state-pool";
import CustomizedDropdown from "../../../UI/Components_With_ErrrorHandling/Dropdown";
import NoLogsFoundIcon from "../../../assets/AuditLogs/NoAuditLogsFound.svg";
import NoLogsPresentIcon from "../../../assets/AuditLogs/NoAuditLogsPresent.svg";
import {
  convertDateFormat,
  convertToArabicDateTime,
} from "../../../UI/DatePicker/DateInternalization";

function AuditLogs({ readOnly }) {
  const loadedProcessData = store.getState("loadedProcessData");
  const [localLoadedProcessData] = useGlobalState(loadedProcessData);

  let { t } = useTranslation();
  const direction = `${t("HTML_DIR")}`;
  const dispatch = useDispatch();
  const [fromDate, setfromDate] = useState("");
  const [toDate, settoDate] = useState("");
  const [selectedDateRangeOption, setselectedDateRangeOption] = useState(SEVEN);
  const [allProcessList, setallProcessList] = useState([]);
  const [selectedProcessId, setselectedProcessId] = useState("");
  const [filterBy, setfilterBy] = useState("");
  const [auditLogData, setauditLogData] = useState([]);
  const [generateButtonClicked, setgenerateButtonClicked] = useState(false);
  const [showNoAuditLogScreen, setshowNoAuditLogScreen] = useState(false);
  const [versionList, setversionList] = useState([]);
  const [projectList, setprojectList] = useState([]);
  const [selectedVersion, setselectedVersion] = useState("");
  const [selectedProject, setselectedProject] = useState("");
  const [spinner, setSpinner] = useState(false);
  // changes added for bug_id: 134226
  const smallScreen = useMediaQuery("(max-width: 999px)");
  const windowInnerHeight = useSelector(
    (state) => state.setWindowInnerHeight.windowInnerHeight
  );
  // let offsetHeight = document.getElementById('divHeight').offsetHeight;
  // console.log("height", offsetHeight);

  useEffect(() => {
    if (t("HTML_DIR") !== "rtl") moment.locale("en");
  }, []);

  useEffect(() => {
    const dataForProcessSpecific = async () => {
      if (!!readOnly && localLoadedProcessData !== null) {
        setfilterBy(localLoadedProcessData.ProcessType);
        let endpoint =
          localLoadedProcessData.ProcessType === "L"
            ? ENDPOINT_GETPROJECTLIST_DRAFTS
            : ENDPOINT_GETPROJECTLIST_DEPLOYED;
        const projList = await axios.get(SERVER_URL + endpoint);
        if (projList.status === 200) {
          setprojectList(projList.data?.Projects);
          setselectedProject(localLoadedProcessData.ProjectId);
        }
        const res = await axios.get(
          SERVER_URL +
            ENDPOINT_PROCESSLIST +
            "/" +
            localLoadedProcessData.ProcessType +
            "/" +
            localLoadedProcessData.ProjectId
        );
        if (res.status === 200) {
          setallProcessList(res.data?.Processes);
          setselectedProcessId(localLoadedProcessData.ProcessDefId);
        }
        const versionRes = await axios.get(
          SERVER_URL +
            `${ENDPOINT_GETALLVERSIONS}/${localLoadedProcessData.ProcessName}/${localLoadedProcessData.ProcessType}`
        );
        if (versionRes.data.Status === 0) {
          setversionList(versionRes.data.Versions);
          setselectedVersion(localLoadedProcessData.VersionNo);
        }
      }
    };
    if (localLoadedProcessData?.ProcessDefId) {
      dataForProcessSpecific();
    }
  }, [readOnly, localLoadedProcessData]);

  useEffect(() => {
    if (moment(fromDate).diff(moment(toDate), "days") > 0) {
      dispatch(
        setToastDataFunc({
          message: t("endDateBeforeError"),
          severity: "error",
          open: true,
        })
      );
      settoDate("");
    }
    if (
      moment(fromDate).diff(new Date(), "days") > 0 ||
      moment(toDate).diff(new Date(), "days") > 0
    ) {
      if (moment(fromDate).diff(new Date(), "days") > 0) {
        dispatch(
          setToastDataFunc({
            message: t("fromDateLargerCurrentDate"),
            severity: "error",
            open: true,
          })
        );
        setfromDate("");
      } else {
        dispatch(
          setToastDataFunc({
            message: t("endDateLargerCurrentDate"),
            severity: "error",
            open: true,
          })
        );

        settoDate("");
      }
    }
  }, [fromDate, toDate]);

  useEffect(() => {
    if (selectedDateRangeOption === SEVEN) {
      settoDate(convertDateFormat(moment()));
      setfromDate(convertDateFormat(moment().subtract(7, "d")));
    } else if (selectedDateRangeOption === FIFTEEN) {
      settoDate(convertDateFormat(moment()));
      setfromDate(convertDateFormat(moment().subtract(15, "d")));
    } else if (selectedDateRangeOption === THIRTY) {
      settoDate(convertDateFormat(moment()));
      setfromDate(convertDateFormat(moment().subtract(30, "d")));
    } else {
      settoDate("");
      setfromDate("");
    }
  }, [selectedDateRangeOption]);
  /* const [flag, setflag] = useState({ dateType: "", boolean: false });*/
  const setDate = (e) => {
    if (e.target.name === "from") {
      setfromDate(e.target.value);
      /* setflag((prevState) => {
        return { ...prevState, boolean: false };
      });*/
    } else {
      settoDate(e.target.value);
      /* setflag((prevState) => {
        return { ...prevState, boolean: false };
      });*/
    }
  };

  const dropdownDatePicker = [
    { value: SEVEN, name: t("last7Days") },
    { value: FIFTEEN, name: t("last15Days") },
    { value: THIRTY, name: t("last30Days") },
    { value: "-1", name: t("customDateRange") },
  ];
  const dateRangeHandler = (e) => {
    setselectedDateRangeOption(e.target.value);
    setauditLogData([]);
  };

  const filterByDropdownMenu = [
    { value: "L", name: t("draft") },
    { value: "R", name: t("deployed") },
  ];

  const getProcessDetails = (id) => {
    let data = {};

    allProcessList.forEach((item) => {
      if (item.ProcessDefId === id) {
        data = {
          ProjectId: item.ProjectId,
          ProjectName: item.ProjectName,
          ProcessType: item.ProcessType,
          ProcessName: item.ProcessName,
        };
      }
    });

    return data;
  };

  const getProjectName = (projId) => {
    let data = "";

    projectList.forEach((item) => {
      if (item.ProjectId === projId) {
        data = item.ProjectName;
      }
    });

    return data;
  };

  const getType = () => {
    if (!!getProcessDetails(selectedProcessId).ProcessName) {
      if (selectedVersion !== "1.0") return 3;
      else return 1;
    } else return 0;
  };

  async function fetchData(resetLastAudit) {
    let selectedProcessName = getProcessDetails(selectedProcessId).ProcessName;
    const lastAuditLog =
      auditLogData.length > 0 && !resetLastAudit
        ? auditLogData[auditLogData.length - 1].LogId
        : " ";
    if (fromDate !== "" && toDate !== "") {
      // modified on 21/09/23 for BugId 136677
      const data = await axios.get(
        SERVER_URL +
          ENDPOINT_GETAUDITLOG +
          // `?startDate=${moment(fromDate).format("YYYY-MM-DD")}&endDate=${moment(toDate).format("YYYY-MM-DD")}&processType=${filterBy}&projectId=${selectedProject}&projectName=${getProjectName(
          `?startDate=${fromDate}&endDate=${toDate}&processType=${filterBy}&projectId=${selectedProject}&projectName=${getProjectName(
            selectedProject
          )}&batch=N${
            !!selectedProcessName ? `&processName=${selectedProcessName}` : ""
          }&lastVal=${lastAuditLog}&version=${selectedVersion}&type=${getType()}`
      );
      // till here BugId 136677
      if (data.data?.AuditLog?.Audit.length !== 0) {
        setshowNoAuditLogScreen(false);
        setauditLogData((prevState) =>
          prevState.concat(data.data["AuditLog"]["Audit"])
        );
      } else if (
        data.data["AuditLog"]["Audit"].length === 0 &&
        auditLogData.length === 0
      )
        setshowNoAuditLogScreen(true);
    }
  }

  const handleScroll = async (e) => {
    /* code edited on 17 Aug 2023 for BugId 131971 - audit logs>>audit logs is 
    not showing all the logs */
    if (e?.target) {
      const hasReachedBottom =
        e.target.scrollHeight - e.target.scrollTop === e.target.clientHeight;
      if (hasReachedBottom) {
        fetchData(false);
      } else return;
    } else return;
  };

  const getProcessInfoFromId = (id) => {
    let temp;
    allProcessList.forEach((item) => {
      if (item.ProcessDefId === id) {
        temp = item;
      }
    });
    return temp;
  };

  const processClickHandler = async (e) => {
    setselectedProcessId(e.target.value);
    const res = await axios.get(
      SERVER_URL +
        `${ENDPOINT_GETALLVERSIONS}/${
          getProcessInfoFromId(e.target.value).ProcessName
        }/${getProcessInfoFromId(e.target.value).ProcessType}`
    );
    if (res.data.Status === 0) {
      setversionList(res.data.Versions);
      setselectedVersion(res.data?.Versions[0].VersionNo);
    } else return;
  };

  // code edited on 01  Dec 2022 for BugId 119950
  const statusHandler = async (val) => {
    setfilterBy(val);
    setselectedProject("");
    setselectedProcessId("");
    setselectedVersion("");
    setSpinner(true);

    let endpoint =
      val === "L"
        ? ENDPOINT_GETPROJECTLIST_DRAFTS
        : ENDPOINT_GETPROJECTLIST_DEPLOYED;
    const res = await axios.get(SERVER_URL + endpoint);
    if (res.status === 200) {
      setprojectList(res.data?.Projects);
      setSpinner(false);
    }
  };

  const projectHandler = async (val) => {
    setselectedProject(val);

    //Setting the selectedProcessId to ""
    setselectedProcessId("");
    const res = await axios.get(
      SERVER_URL + ENDPOINT_PROCESSLIST + "/" + filterBy + "/" + val
    );
    if (res.status === 200) {
      setallProcessList(res.data?.Processes);
    }
  };

  const replaceDotToUnderScore = (str) => {
    return str.replaceAll(".", "_");
  };

  return (
    <div
      className={classes.wrapperDiv}
      style={{
        /* code edited on 17 Aug 2023 for BugId 131971 - audit logs>>audit logs is 
        not showing all the logs */
        width: localLoadedProcessData?.ProcessDefId ? "84vw" : "100%",
        padding: localLoadedProcessData?.ProcessDefId
          ? "0 1vw 1rem"
          : "2rem 1vw",
      }}
    >
      <div className={classes.heading}>
        <p className={classes.bold}>{t("auditLogs")}</p>
        <div className={classes.toolbox}>
          {/*code updated on 30 September 2022 for BugId 116351*/}
          <div
            style={{
              display: "flex",
              flexDirection: "row",
              flexWrap: "wrap",
            }}
            id="divHeight"
          >
            {/* added grid for responsiveness */}
            <Grid container spacing={1} xs={12}>
              <Grid item xs={6} md={2}>
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    // height: "36px",
                    marginRight:
                      selectedDateRangeOption === "-1" ? "0px" : "0px",
                  }}
                >
                  <p className={classes.toolboxHeading}>{t("dateRange")}</p>
                  <CustomizedDropdown
                    IconComponent={ExpandMoreIcon}
                    style={{
                      // width: "15.5rem",
                      // minHeight: "2.5rem",
                      height: "30px",
                      width: "100%",
                    }}
                    variant="outlined"
                    value={selectedDateRangeOption}
                    onChange={dateRangeHandler}
                    isNotMandatory={true}
                    ariaLabel="Select Date range"
                    id="pmweb_AuditLogs_dateRange"
                    //autoWidth
                  >
                    {dropdownDatePicker.map((item) => {
                      return (
                        <MenuItem
                          key={item.value}
                          value={item.value}
                          style={{
                            justifyContent:
                              direction === RTL_DIRECTION ? "end" : "start",
                          }}
                          id={`pmweb_AuditLogs_dateRange_${item.value}`}
                        >
                          <p className={classes.tableCellBody}>{item.name}</p>
                        </MenuItem>
                      );
                    })}
                  </CustomizedDropdown>
                </div>
              </Grid>

              {selectedDateRangeOption === "-1" ? (
                <Grid item className="auditGrids">
                  <div
                    style={{
                      /* code edited on 17 Aug 2023 for BugId 131971 - audit logs>>audit logs is 
                    not showing all the logs */
                      display: "flex",
                      flexDirection: "row",
                      // marginInline: "8px",  //Changes made to solve Bug 134147
                      alignItems: "center",
                      fontFamily: "Open Sans",
                      fontSize: "0.875rem",
                      fontWeight: "400",
                      gap: "1rem",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        cursor: "pointer",
                        justifyContent: "center",
                      }}
                    >
                      <label
                        className={classes.toolboxHeading}
                        htmlFor="pmweb_AuditLogs_from"
                      >
                        {t("from")}
                      </label>
                      <div className={classes.calender}>
                        <DatePickers
                          name="from"
                          onChange={(e) => setDate(e)}
                          timeFormat={false}
                          value={fromDate}
                          id="pmweb_AuditLogs_from"
                          width="100%"
                        />
                      </div>
                    </div>
                    <div
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        cursor: "pointer",
                        justifyContent: "center",
                      }}
                    >
                      <label
                        htmlFor="pmweb_AuditLogs_to"
                        className={classes.toolboxHeading}
                      >
                        {t("to")}
                      </label>

                      <div className={classes.calender}>
                        <DatePickers
                          //name={flag.dateType}
                          name="to"
                          onChange={(e) => setDate(e)}
                          timeFormat={false}
                          value={toDate}
                          id="pmweb_AuditLogs_to"
                          width="100%"
                        />
                      </div>
                    </div>
                  </div>
                </Grid>
              ) : null}

              <Grid item xs={4} md={2}>
                {/* style={{ marginInline: "1.5rem" }} */}
                <div>
                  <p className={classes.toolboxHeading}>{t("status")}</p>
                  <CustomizedDropdown
                    IconComponent={ExpandMoreIcon}
                    style={{
                      // width: "180px",
                      height: "30px",
                      width: "100%",
                    }}
                    variant="outlined"
                    value={filterBy}
                    onChange={(e) => statusHandler(e.target.value)}
                    disabled={readOnly}
                    isNotMandatory={true}
                    // ariaLabel= "Select Status"
                    ariaLabel="Select Date range"
                    id="pmweb_AuditLogs_status"
                  >
                    {filterByDropdownMenu.map((item) => {
                      return (
                        <MenuItem
                          key={item.value}
                          value={item.value}
                          style={{
                            justifyContent:
                              direction === RTL_DIRECTION ? "end" : "start",
                          }}
                          id={`pmweb_AuditLogs_status_${item.value}`}
                        >
                          <div
                            style={{
                              display: "flex",
                              flexDirection: "row",
                              alignItems: "center",
                            }}
                          >
                            <p
                              className={classes.iconForProcessType}
                              style={{
                                backgroundColor: tileProcess(item.value)[4],
                              }}
                            ></p>

                            <p className={classes.tableCellBody}>
                              {" "}
                              {item.name}{" "}
                            </p>
                          </div>
                        </MenuItem>
                      );
                    })}
                  </CustomizedDropdown>
                </div>
              </Grid>
              <Grid item xs={4} md={2}>
                {/* style={{ marginInline: "1.5rem" }} */}
                <div>
                  <p className={classes.toolboxHeading}>{t("project")}</p>
                  <CustomizedDropdown
                    IconComponent={ExpandMoreIcon}
                    style={{
                      // width: "180px",
                      width: "100%",
                      height: "30px",
                    }}
                    variant="outlined"
                    value={selectedProject}
                    onChange={(e) => projectHandler(e.target.value)}
                    disabled={filterBy === "" || !!readOnly}
                    isNotMandatory={true}
                    id="pmweb_AuditLogs_Project"
                    ariaLabel="Select Project"
                  >
                    {spinner ? (
                      <>
                        <MenuItem>
                          <CircularProgress
                            style={{
                              width: "2rem",
                              height: "2rem",
                            }}
                          />
                        </MenuItem>
                      </>
                    ) : (
                      projectList?.map((item) => {
                        return (
                          <MenuItem
                            key={item.ProjectId}
                            value={item.ProjectId}
                            style={{
                              justifyContent:
                                direction === RTL_DIRECTION ? "end" : "start",
                            }}
                            id={`pmweb_AuditLogs_Project_${item.ProjectId}`}
                          >
                            <div
                              style={{
                                display: "flex",
                                flexDirection: "row",
                                alignItems: "center",
                              }}
                            >
                              <p className={classes.tableCellBody}>
                                {" "}
                                {item.ProjectName}{" "}
                              </p>
                            </div>
                          </MenuItem>
                        );
                      })
                    )}
                  </CustomizedDropdown>
                </div>
              </Grid>
              <Grid item xs={4} md={2}>
                <div
                  style={{
                    // marginInline: "1.5rem",
                    marginLeft: localLoadedProcessData?.ProcessDefId
                      ? "0rem"
                      : "0rem",
                    // 1rem
                  }}
                >
                  <p className={classes.toolboxHeading}>{t("processC")}</p>
                  <CustomizedDropdown
                    IconComponent={ExpandMoreIcon}
                    style={{
                      // width: "180px",
                      width: "100%",
                      height: "30px",
                      overflow: "hidden !important",
                    }}
                    variant="outlined"
                    value={selectedProcessId}
                    onChange={(e) => {
                      processClickHandler(e);
                      setauditLogData([]);
                      setgenerateButtonClicked(false);
                    }}
                    disabled={selectedProject === "" || !!readOnly}
                    isNotMandatory={true}
                    id="pmweb_AuditLogs_processC"
                    ariaLabel="Select Process"
                  >
                    {/* <MenuItem value="">
                  {" "}
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "row",
                      alignItems: "center",
                      height: "1.2rem",
                    }}
                  >
                    <p className={classes.tableCellBody}> </p>
                  </div>
                </MenuItem> */}
                    {allProcessList?.map((item) => {
                      return (
                        <MenuItem
                          key={item.ProcessDefId}
                          value={item.ProcessDefId}
                          style={{
                            justifyContent:
                              direction === RTL_DIRECTION ? "end" : "start",
                          }}
                          id={`pmweb_AuditLogs_processC_${item.ProcessDefId}`}
                        >
                          <div
                            style={{
                              display: "flex",
                              flexDirection: "row",
                              alignItems: "center",
                              height: "1.2rem",
                            }}
                          >
                            <p
                              className={classes.iconForProcessType}
                              style={{
                                backgroundColor: tileProcess(
                                  item.ProcessType
                                )[4],
                              }}
                            ></p>
                            <p className={classes.tableCellBody}>
                              {" "}
                              {item.ProcessName}
                            </p>
                          </div>
                        </MenuItem>
                      );
                    })}
                  </CustomizedDropdown>
                </div>
              </Grid>
              <Grid item xs={4} md={2}>
                <div
                  style={{
                    // marginRight: "20px",
                    display: "flex",
                    flexDirection: "column",
                  }}
                >
                  <p
                    className={classes.toolboxHeading}
                    style={{ whiteSpace: "nowrap" }}
                  >
                    {t("Version")}
                  </p>
                  <CustomizedDropdown
                    IconComponent={ExpandMoreIcon}
                    style={{
                      // width: "80px",
                      width: "100%",
                      height: "30px",
                    }}
                    variant="outlined"
                    value={selectedVersion}
                    onChange={(e) => {
                      setselectedVersion(e.target.value);
                      setauditLogData([]);
                      setshowNoAuditLogScreen(false);
                    }}
                    disabled={selectedProcessId === "" || !!readOnly}
                    isNotMandatory={true}
                    id="pmweb_AuditLogs_version"
                    ariaLabel="Select Version"
                  >
                    {versionList.map((item) => (
                      <MenuItem
                        value={item.VersionNo}
                        style={{
                          justifyContent:
                            direction === RTL_DIRECTION ? "end" : "start",
                        }}
                        id={`pmweb_AuditLogs_version_${replaceDotToUnderScore(
                          item.VersionNo
                        )}`}
                      >
                        <p className={classes.tableCellBody}>
                          {t(item.VersionNo)}
                        </p>
                      </MenuItem>
                    ))}
                  </CustomizedDropdown>
                </div>
              </Grid>
              <Grid item xs={4} md={2}>
                <div>
                  <button
                    onClick={() => {
                      setauditLogData([]);
                      fetchData(true);
                      setgenerateButtonClicked(true);
                    }}
                    id="pmweb_AuditLogs_fetch"
                    style={{
                      marginInline: localLoadedProcessData?.ProcessDefId
                        ? "0rem !important"
                        : "2rem !important",
                    }}
                    className={classes.generateButton}
                    disabled={filterBy === "" || selectedProject === ""}
                  >
                    <p className={classes.generateText}>{t("generate")}</p>
                  </button>
                </div>
              </Grid>
            </Grid>
          </div>
        </div>
      </div>
      {!showNoAuditLogScreen ? (
        generateButtonClicked ? (
          <div
            className={classes.tableContainer}
            style={{ height: readOnly ? "70vh" : "100%" }}
          >
            <TableContainer
              className={classes.queuetable}
              onScroll={handleScroll}
              component={Paper}
              style={{
                //modified on 29-9-2023 for bug_id:134148
                // height: selectedDateRangeOption === "-1" ? "70%" : "75%",
                // changes added for bug_id: 134226
                height: smallScreen
                  ? `calc(${windowInnerHeight}px - ${APP_HEADER_HEIGHT} - 22rem)`
                  : `calc(${windowInnerHeight}px - ${APP_HEADER_HEIGHT} - 14rem)`,
              }}
            >
              <Table style={{ width: "100%" }}>
                <TableHead className={classes.tableHead}>
                  <TableRow
                    style={{
                      maxHeight: "2rem",
                    }}
                  >
                    <TableCell
                      width="25%"
                      //Bug 121795 - Audit Logs
                      //04-04-2023 - Corrected for Point 5
                      //style={{ paddingTop: "0.5rem", paddingBottom: "0.5rem" }}
                      align="left"
                    >
                      <p className={classes.tableCellText}>{t("Time")}</p>
                    </TableCell>
                    <TableCell
                      width="25%"
                      //Bug 121795 - Audit Logs
                      //04-04-2023 - Corrected for Point 5
                      //style={{ paddingBottom: "0" }}
                      align="left"
                    >
                      <p className={classes.tableCellText}>{t("action")}</p>
                    </TableCell>

                    <TableCell
                      width="25%"
                      //Bug 121795 - Audit Logs
                      //04-04-2023 - Corrected for Point 5
                      //style={{ paddingBottom: "0" }}
                      align="left"
                    >
                      <p className={classes.tableCellText}>{t("Version")}</p>
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {auditLogData.map((item) => {
                    return (
                      <TableRow className={classes.tableRow}>
                        <TableCell
                          width="25%"
                          align="left"
                          component="th"
                          scope="row"
                        >
                          <p className={classes.tableCellBody}>
                            {/*modified on 27/09/2023 for BugId 136677 */}
                            {/* {moment(item.ActionDateTime).format(
                              `${DATE_FORMAT}, ${TIME_FORMAT}`
                            )} */}
                            {convertToArabicDateTime(item.ActionDateTime)}
                            {/*till here BugId 136677 */}
                          </p>
                        </TableCell>
                        <TableCell width="25%" align="left">
                          <p className={classes.tableCellBody}>
                            {t("User")}: {item.UserName} : {item.ActionName}
                          </p>
                        </TableCell>
                        <TableCell width="25%" align="left">
                          <p className={classes.tableCellBody}>
                            {selectedVersion}
                          </p>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </TableContainer>
          </div>
        ) : (
          <div className={clsx(classes.tableCellBody, classes.noLogsDiv)}>
            <img
              src={NoLogsPresentIcon}
              style={{
                transform: direction === RTL_DIRECTION ? "scaleX(-1)" : null,
              }}
              alt={t("noLogsGenerated")}
            />
            <p className={classes.helperTextForImage}>{t("noLogsGenerated")}</p>
          </div>
        )
      ) : (
        <div className={clsx(classes.tableCellBody, classes.noLogsDiv)}>
          <img
            src={NoLogsFoundIcon}
            style={{
              transform: direction === RTL_DIRECTION ? "scaleX(-1)" : null,
            }}
            alt={t("noAuditLogsFound")}
          />
          <p className={classes.helperTextForImage}>{t("noAuditLogsFound")}</p>
        </div>
      )}
    </div>
  );
}
export default AuditLogs;
