// Changes made to solve Bug 113392 - Version history: while opening the previous version from the version history the screen loads forever
import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import styles from "./versionHistory.module.css";
import { Card, CardContent } from "@material-ui/core";
import { styled } from "@material-ui/core/styles";
import Table from "@material-ui/core/Table";
import TableBody from "@material-ui/core/TableBody";
import TableCell, { tableCellClasses } from "@material-ui/core/TableCell";
import TableContainer from "@material-ui/core/TableContainer";
import TableHead from "@material-ui/core/TableHead";
import TableRow from "@material-ui/core/TableRow";
import Paper from "@material-ui/core/Paper";
import { useHistory } from "react-router-dom";
import { connect } from "react-redux";
import * as actionCreators from "../../../../redux-store/actions/processView/actions.js";
import { store, useGlobalState } from "state-pool";
import { CloseIcon } from "../../../../utility/AllImages/AllImages";
import clsx from "clsx";
import axios from "axios";
import {
  PROCESSTYPE_REGISTERED,
  PROCESSTYPE_REGISTERED_CHECKED,
  SERVER_URL,
} from "../../../../Constants/appConstants";

const StyledTableCell = styled(TableCell)(({ theme }) => ({}));

const StyledTableRow = styled(TableRow)(({ theme }) => ({
  "&:nth-of-type(odd)": {
    backgroundColor: theme.palette.action.hover,
  },
  // hide last border
  "&:last-child td, &:last-child th": {
    border: 0,
  },
}));

function createData(VersionName, processDefId, LastModifiedOn, LastModifiedBy) {
  return { VersionName, processDefId, LastModifiedOn, LastModifiedBy };
}

function VersionHistory(props) {
  let { t } = useTranslation();
  const history = useHistory();
  const loadedProcessData = store.getState("loadedProcessData");
  const [localLoadedProcessData, setlocalLoadedProcessData] =
    useGlobalState(loadedProcessData);

  const rows =
    props.versionList &&
    props.versionList
      .map((val) => {
        return createData(
          val.VersionNo,
          val.ProcessDefId,
          val.LastModifiedOn,
          val.LastModifiedBy
        );
      })
      .sort((a, b) => parseFloat(b.VersionName) - parseFloat(a.VersionName));

  const [maxVersion, setMaxVersion] = useState(null);

  const openSelectProcess = (ProcessDefId, versionNo) => {
    setlocalLoadedProcessData(null);
    props.openProcessClick(
      ProcessDefId,
      props.projectName,
      props.processType,
      versionNo,
      props.ProcessName
    );
    props.openTemplate("", "", false);
    history.push("/process");
    props.setModalClosed();
  };

  const closeHandler = () => {
    props.setModalClosed(false);
  };

  useEffect(() => {
    const ids = rows.map((object) => {
      return +object.VersionName;
    });
    const max = Math.max(...ids);
    setMaxVersion(max);
  }, []);

  const setAsLatestVersion = (pid, version, pname) => {
    axios
      .post(SERVER_URL + "/saveLatest", {
        processDefId: pid,
        version: version,
        processName: pname,
      })

      .then((response) => {
        if (response?.status === 200) {
          openSelectProcess(
            response?.data?.ProcessDefId,
            response?.data?.VersionNo
          );
        }
      });
  };

  const isDeployedProcess = () => {
    //in case of deployed process, setaslatest option should not be available
    return (
      localLoadedProcessData?.ProcessType === PROCESSTYPE_REGISTERED ||
      localLoadedProcessData?.ProcessType === PROCESSTYPE_REGISTERED_CHECKED
    );
  };
  return (
    <React.Fragment>
      {/*Bug 113407 : [14-02-2023] Made the changes as per the wireframe*/}
      <div className={styles.mainDiv}>
        <div className={styles.flexRow}>
          <p className={styles.tittle}>
            {t("VersionHistory")} : {props.ProcessName}
          </p>
          {/* <div style={{ margin: "2rem 2rem 1rem 2rem" }}>
            <p className={styles.tittle}>
              {t("VersionHistory")} : {props.ProcessName}
            </p>
          </div> */}
          <p className={styles.close} onClick={closeHandler}>
            <CloseIcon />
          </p>
        </div>
        <div className={styles.tableOutline}>
          <div className={styles.header}>
            <div className={styles.grid}>
              <p className={clsx(styles.column, styles.versionHeader)}>
                {t("versionName")}
              </p>
              <p className={clsx(styles.column, styles.versionHeaderModify)}>
                {t("lastModifyOn")}
              </p>
              <p className={clsx(styles.column, styles.versionHeader)}></p>
            </div>
          </div>
          <TableContainer component={Paper} className={styles.tableContainer}>
            <Table aria-label="customized table" className={styles.table}>
              {
                /* Hiding the Table Header*/
                //code added on 20 Feb 2023 for BugId 120570
              }

              {/* <TableHead className={styles.thead}>
                <TableRow>
                  <StyledTableCell className={styles.versionHeader}>
                    {t("versionName")}
                  </StyledTableCell>
                  <StyledTableCell className={styles.versionHeader}>
                    {t("lastModifyOn")}
                  </StyledTableCell>
                  <StyledTableCell
                    className={styles.versionHeader}
                  ></StyledTableCell>
                </TableRow>
              </TableHead> */}
              <TableBody>
                {rows &&
                  rows.map((row) => {
                    return (
                      <StyledTableRow
                        key={row.name}
                        className={styles.particularRow}
                      >
                        <StyledTableCell
                          align="left"
                          style={{
                            fontWeight: "600",
                          }}
                        >
                          {row.VersionName}
                        </StyledTableCell>

                        <StyledTableCell align="center">
                          {row.LastModifiedOn} {t("by")} {row.LastModifiedBy}
                        </StyledTableCell>

                        <StyledTableCell
                          className={styles.openBtn}
                          align="left"
                          onClick={() =>
                            openSelectProcess(row.processDefId, row.VersionName)
                          }
                        >
                          {t("OPEN")}
                        </StyledTableCell>
                        {+row.VersionName !== maxVersion &&
                        !isDeployedProcess() ? (
                          <StyledTableCell
                            className={styles.openBtn}
                            align="left"
                            onClick={() =>
                              setAsLatestVersion(
                                row?.processDefId,
                                row?.VersionName,
                                props?.ProcessName
                              )
                            }
                          >
                            {t("setAsLatest")}
                          </StyledTableCell>
                        ) : (
                          <StyledTableCell></StyledTableCell>
                        )}
                      </StyledTableRow>
                    );
                  })}
              </TableBody>
            </Table>
          </TableContainer>
        </div>
      </div>
    </React.Fragment>
  );
}

const mapDispatchToProps = (dispatch) => {
  return {
    openProcessClick: (id, name, type, version, processName) =>
      dispatch(
        actionCreators.openProcessClick(id, name, type, version, processName)
      ),
    openTemplate: (id, name, flag) =>
      dispatch(actionCreators.openTemplate(id, name, flag)),
  };
};

export default connect(null, mapDispatchToProps)(VersionHistory);
