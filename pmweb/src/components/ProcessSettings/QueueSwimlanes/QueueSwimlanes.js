// #BugID - 121208
// #BugDescription - Swimlane selection issue has been fixed.

import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import Table from "@material-ui/core/Table";
import TableBody from "@material-ui/core/TableBody";
import TableCell from "@material-ui/core/TableCell";
import TableContainer from "@material-ui/core/TableContainer";
import TableHead from "@material-ui/core/TableHead";
import TableRow from "@material-ui/core/TableRow";
import Paper from "@material-ui/core/Paper";
import styles from "./QueueSwimlanes.module.css";
import { store, useGlobalState } from "state-pool";
import MenuItem from "@material-ui/core/MenuItem";
import { LatestVersionOfProcess } from "../../../utility/abstarctView/checkLatestVersion";
import {
  ENDPOINT_DEFAULTQUEUE,
  SERVER_URL,
  PROCESSTYPE_REGISTERED,
  headerHeight,
} from "../../../Constants/appConstants";
import axios from "axios";
import { CircularProgress } from "@material-ui/core";
import CustomizedDropdown from "../../../UI/Components_With_ErrrorHandling/Dropdown";
import { useSelector } from "react-redux";

function QueueSwimlanes(props) {
  let { t } = useTranslation();
  const loadedProcessData = store.getState("loadedProcessData");
  const [localLoadedProcessData, setlocalLoadedProcessData] =
    useGlobalState(loadedProcessData);
  const [isLoading, setIsLoading] = useState(true);
  const [defaultDropdown, setdefaultDropdown] = useState([]);
  const { isReadOnly } = props;
  // changes added for bug_id: 134226
  const windowInnerHeight = useSelector(
    (state) => state.setWindowInnerHeight.windowInnerHeight
  );

  useEffect(() => {
    async function fetchDefaultValuesForLanes() {
      const res = await axios.get(
        `${SERVER_URL}${ENDPOINT_DEFAULTQUEUE}/${localLoadedProcessData.ProcessDefId}/${localLoadedProcessData.ProcessType}`
      );
      if (res.status === 200 && res.data.Status === 0) {
        // modified on 13/10/23 for BugId 139486
        /*const lanesWithoutTaskLane = localLoadedProcessData?.Lanes?.filter(
          (item) => item.LaneId !== -99
        ).map((lane) => {
          res.data?.LaneQueueConfig.forEach((queueInfo) => {
            if (lane.LaneId + "" === queueInfo.LaneId + "") {
              lane.DefaultQueue = queueInfo.DefaultQueue;
              setdefaultDropdown((defaultDropdown) => [
                ...defaultDropdown,
                queueInfo.DefaultQueue,
              ]);
            }
          });
          return lane;
        });*/
        let tempProcessData = JSON.parse(
          JSON.stringify(localLoadedProcessData)
        );
        let tempLanes = JSON.parse(JSON.stringify(tempProcessData?.Lanes));
        tempLanes = tempLanes
          // commented on 04/11/23 for BugId 140635
          // ?.filter((item) => item.LaneId !== -99)
          ?.map((lane) => {
            // condition added on 04/11/23 for BugId 140635
            if (+lane.LaneId !== -99) {
              let tempLane = [...res.data?.LaneQueueConfig];
              tempLane?.forEach((queueInfo) => {
                if (+lane.LaneId === +queueInfo?.LaneId) {
                  lane.DefaultQueue = queueInfo?.DefaultQueue;
                  setdefaultDropdown((defaultDropdown) => [
                    ...defaultDropdown,
                    queueInfo?.DefaultQueue,
                  ]);
                }
              });
            }
            return lane;
          });
        tempProcessData.Lanes = [...tempLanes];
        setlocalLoadedProcessData(tempProcessData);
        setIsLoading(false);
      }
    }
    if (localLoadedProcessData?.ProcessDefId) {
      fetchDefaultValuesForLanes();
    }
  }, [localLoadedProcessData?.ProcessDefId]);

  useEffect(() => {
    setIsLoading(true);
  }, [localLoadedProcessData?.ProcessDefId]);

  const checkIfActCanHaveOwnQueue = (actType, actSubType) => {
    return (
      (+actType === 26 && +actSubType === 1) ||
      (+actType === 10 && +actSubType === 7) ||
      (+actType === 10 && +actSubType === 3)
    );
  };

  const handleChange = async (event, row, id) => {
    const res = await axios.post(SERVER_URL + ENDPOINT_DEFAULTQUEUE, {
      processDefId: localLoadedProcessData.ProcessDefId,
      laneName: row.LaneName,
      laneId: row.LaneId,
      m_bDefaultQueueActs: event.target.value === "N" ? false : true,
    });
    if (res.status === 200) {
      let data = [...defaultDropdown];
      data[id] = event.target.value;
      setdefaultDropdown(data);
      if (event.target.value === "Y") {
        let temp = global.structuredClone(localLoadedProcessData);
        temp.Lanes = temp?.Lanes?.map((lane) => {
          if (+lane.LaneId === +row.LaneId) {
            lane.DefaultQueue = event.target.value;
          }
          return lane;
        });
        let queueArr = temp.Queue.map((el) => +el.QueueId);
        let minQueueId = Math.min(...queueArr);
        let activitiesInLaneSorted = [];
        temp?.MileStones?.forEach((mile) => {
          mile?.Activities?.forEach((act) => {
            if (+act.LaneId === +row.LaneId) {
              activitiesInLaneSorted.push(act);
            }
          });
        });

        activitiesInLaneSorted?.sort((a, b) => {
          return a.ActivityId < b.ActivityId ? -1 : 1;
        });

        activitiesInLaneSorted = activitiesInLaneSorted?.map((act) => {
          if (
            checkIfActCanHaveOwnQueue(act.ActivityType, act.ActivitySubType)
          ) {
            minQueueId = minQueueId - 1;
            act.QueueId = minQueueId;
            temp.Queue.push({
              QueueFilter: "",
              OrderBy: "2",
              AllowReassignment: "N",
              UG: [],
              FilterOption: "0",
              RefreshInterval: "0",
              QueueId: minQueueId + "",
              SortOrder: "",
              QueueName: `${localLoadedProcessData.ProcessName}_${act.ActivityName}`,
              QueueDescription: "Process Modeler generated Default Queue",
              QueueType: "F",
              FilterValue: "",
            });
          }
          return act;
        });
        temp.MileStones = temp.MileStones?.map((mile) => {
          mile.Activities = mile.Activities?.map((act) => {
            if (+act.LaneId === +row.LaneId) {
              activitiesInLaneSorted.forEach((el) => {
                if (el.ActivityId === act.ActivityId) act = el;
              });
            }
            return act;
          });
          return mile;
        });

        setlocalLoadedProcessData(temp);
      }
    }
  };

  if (isLoading) {
    return <CircularProgress className="circular-progress" />;
  } else {
    return (
      <div
        className={styles.modaldiv}
        style={{
          // changes added for bug_id: 134226
          height: `calc(${windowInnerHeight}px - ${headerHeight} - 2rem)`,
        }}
      >
        <p className={styles.heading}>{t("defaultQueuesForActivity")}</p>
        <TableContainer
          className={styles.queuetable}
          component={Paper}
          style={{ width: "100%" }}
        >
          <Table>
            <TableHead className={styles.tableHead}>
              <TableRow style={{ maxHeight: "2rem" }}>
                <TableCell width="5%" style={{ padding: "0" }} align="center">
                  <p className={styles.tableCellText}>{t("slNo")}</p>
                </TableCell>
                <TableCell width="5%" style={{ padding: "0" }} align="left">
                  <p className={styles.tableCellText}>{t("swimlaneName")}</p>
                </TableCell>
                <TableCell width="10%" style={{ padding: "0" }} align="center">
                  <p className={styles.tableCellText}>{t("defaultQueue")}</p>
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {localLoadedProcessData?.Lanes?.filter(
                (item) => item.LaneId !== -99
              )?.map((row, index) => (
                <TableRow className={styles.tableRow} key={index + 1}>
                  <TableCell
                    style={{ padding: "0.5rem 0 0.5rem 0" }}
                    width="5%"
                    align="center"
                    component="th"
                    scope="row"
                  >
                    {index + 1}
                  </TableCell>
                  <TableCell
                    style={{ padding: "0.5rem 0 0.5rem 0" }}
                    width="5%"
                    align="left"
                  >
                    <p className={styles.tableCellBody}>{row.LaneName}</p>
                  </TableCell>
                  <TableCell
                    style={{ padding: "0.5rem 0 0.5rem 0" }}
                    width="10%"
                    align="center"
                  >
                    <CustomizedDropdown
                      id="pmweb_QueueSwimlane_DefaultQueueDropdown"
                      variant="outlined"
                      inputProps={{
                        "aria-label": "Default Queue",
                      }}
                      //autoWidth
                      value={defaultDropdown[index]}
                      onChange={(e) => handleChange(e, row, index)}
                      className={styles.dropDown}
                      disabled={
                        isReadOnly ||
                        props.processType === PROCESSTYPE_REGISTERED ||
                        props.processType === "RC" ||
                        LatestVersionOfProcess(
                          localLoadedProcessData?.Versions
                        ) !== +localLoadedProcessData?.VersionNo
                          ? true
                          : ""
                      }
                    >
                      <MenuItem
                        style={{ width: "100%", margin: "0.5rem 0" }}
                        value={"N"}
                      >
                        <p
                          style={{
                            font: "normal normal normal var(--base_text_font_size)/17px var(--font_family)",
                          }}
                        >
                          {t("swimLaneQueue")}
                        </p>
                      </MenuItem>
                      <MenuItem
                        style={{ width: "100%", margin: "0.5rem 0" }}
                        value={"Y"}
                      >
                        <p
                          style={{
                            font: "normal normal normal var(--base_text_font_size)/17px var(--font_family)",
                          }}
                        >
                          {t("activitySpecificQueue")}
                        </p>
                      </MenuItem>
                    </CustomizedDropdown>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </div>
    );
  }
}

export default QueueSwimlanes;
