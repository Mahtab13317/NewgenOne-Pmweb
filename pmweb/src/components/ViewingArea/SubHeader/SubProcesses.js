// #BugID - 120987
// #BugDescription - Handled the functionality when more than 3 process will open after 3rd process rest tab will be shown in a dropdown.

import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import CallActivityLogo from "../../../assets/bpmnViewIcons/CallActivity.svg";
// import SubprocessLogo from "../../../assets/bpmnViewIcons/EmbeddedSubprocess.svg";
import { useHistory } from "react-router-dom";
import { connect } from "react-redux";
import * as actionCreators from "../../../redux-store/actions/processView/actions.js";
import Tooltip from "@material-ui/core/Tooltip";
import { withStyles } from "@material-ui/core/styles";
import { store, useGlobalState } from "state-pool";
import { RTL_DIRECTION } from "../../../Constants/appConstants";

function SubProcesses(props) {
  let { t } = useTranslation();
  const direction = `${t("HTML_DIR")}`;
  const history = useHistory();
  const { callActivity } = props;
  const [openableCallAct, setOpenableCallAct] = useState(0);
  const arrProcessesData = store.getState("arrProcessesData");
  const [localArrProcessesData, setLocalArrProcessesData] =
    useGlobalState(arrProcessesData);
  const openProcessesArr = store.getState("openProcessesArr");
  const [localOpenProcessesArr, setLocalOpenProcessesArr] =
    useGlobalState(openProcessesArr);
  const ToolDescription = withStyles(() => ({
    tooltip: {
      fontSize: "12px",
      letterSpacing: "0px",
      lineHeight: "1rem",
      color: "#FFFFFF",
      backgroundColor: "#414141",
      boxShadow: "0px 3px 6px #00000029",
      border: "none !important",
      padding: "0.5vw 1vw",
    },

    arrow: {
      "&:before": {
        backgroundColor: "#414141",
        border: "none !important",
        zIndex: "100",
      },
    },
  }))(Tooltip);

  const loadedProcessData = store.getState("loadedProcessData");
  const [localLoadedProcessData, setlocalLoadedProcessData] =
    useGlobalState(loadedProcessData);

  const openSubProcess = (el) => {
    props.openProcessClick(
      el.AssociatedProcess.Associated_ProcessDefId,
      el.AssociatedProcess.Associated_ProjectName,
      "R",
      el.AssociatedProcess.Associated_VersionNo,
      el.AssociatedProcess.Associated_ProcessName
    );
    props.openTemplate(null, null, false);
    setlocalLoadedProcessData(null);
    history.push("/process");
  };

  // code added on 28 Feb 2023 for BugId 124049
  const openAllSubProcess = () => {
    let subprocessArr = [];
    let processOpened = false,
      processOpeningObj = {};
    let tempArrProcessesData = [];
    let tempOpenProcessesArr = [...localOpenProcessesArr];
    callActivity?.forEach((el) => {
      if (
        el.AssociatedProcess !== undefined &&
        el.AssociatedProcess?.Associated_ProcessDefId !== "" &&
        !subprocessArr.includes(el.AssociatedProcess.Associated_ProcessDefId)
      ) {
        if (!processOpened) {
          processOpeningObj = {
            processDefId: el.AssociatedProcess.Associated_ProcessDefId,
            projectName: el.AssociatedProcess.Associated_ProjectName,
            processType: "R",
            versionNo: el.AssociatedProcess.Associated_VersionNo,
            processName: el.AssociatedProcess.Associated_ProcessName,
          };
          props.openProcessClick(
            processOpeningObj.processDefId,
            processOpeningObj.projectName,
            processOpeningObj.processType,
            processOpeningObj.versionNo,
            processOpeningObj.processName
          );
          props.openTemplate(null, null, false);
          setlocalLoadedProcessData(null);
        }
        if (
          !tempOpenProcessesArr.includes(
            `${el.AssociatedProcess.Associated_ProcessDefId}#R`
          )
        ) {
          subprocessArr.push(el.AssociatedProcess.Associated_ProcessDefId);
          tempArrProcessesData.splice(0, 0, {
            ProcessDefId: el.AssociatedProcess.Associated_ProcessDefId,
            ProcessType: "R",
            ProcessName: el.AssociatedProcess.Associated_ProcessName,
            ProjectName: el.AssociatedProcess.Associated_ProjectName,
            VersionNo: el.AssociatedProcess.Associated_VersionNo,
            ProcessVariantType: "S",
            isProcessActive: !processOpened,
          });
          tempOpenProcessesArr.splice(
            0,
            0,
            `${el.AssociatedProcess.Associated_ProcessDefId}#R`
          );
        }
        processOpened = true;
      }
    });
    let temp = [...localArrProcessesData];
    if (processOpened) {
      localArrProcessesData?.forEach((el, idx) => {
        temp[idx].isProcessActive = false;
      });
    }
    setLocalArrProcessesData([...tempArrProcessesData, ...temp]);
    setLocalOpenProcessesArr(tempOpenProcessesArr);
  };

  // code added on 28 Feb 2023 for BugId 124049
  useEffect(() => {
    if (callActivity?.length > 0) {
      let count = 0;
      callActivity?.forEach((el) => {
        if (
          el.AssociatedProcess !== undefined &&
          el.AssociatedProcess?.Associated_ProcessDefId !== ""
        ) {
          count++;
        }
      });
      setOpenableCallAct(count);
    }
  }, [callActivity]);

  return (
    <React.Fragment>
      <div className="modalDivOnClick">
        <p className="modalActivityTitle">
          {t("callActivity")}
          {openableCallAct > 1 ? (
            <span className="openAllModalActivity" onClick={openAllSubProcess}>
              {t("openall")}
            </span>
          ) : null}
        </p>
        {callActivity.length > 0 ? (
          <div style={{ display: "flex", flexDirection: "column" }}>
            {callActivity?.map((el) => {
              return (
                <div
                  className="row"
                  style={{ alignItems: "center", marginBottom: "5px" }}
                >
                  <img
                    src={CallActivityLogo}
                    width="15px"
                    height="15px"
                    alt="Call Activity"
                  />

                  {el.AssociatedProcess === undefined ||
                  el.AssociatedProcess.Associated_ProcessDefId === "" ? (
                    <p
                      className={
                        direction === RTL_DIRECTION
                          ? "subProcessActivityNameDisableArabic"
                          : "subProcessActivityNameDisable"
                      }
                    >
                      {el.ActivityName} ({t("ProcessNotAttached")})
                    </p>
                  ) : (
                    <ToolDescription
                      arrow
                      title={
                        t("AssociatedProcess") +
                        " : " +
                        el.AssociatedProcess.Associated_ProcessName
                      }
                      placement="right"
                    >
                      <p
                        className={
                          direction === RTL_DIRECTION
                            ? "subProcessActivityNameArabic"
                            : "subProcessActivityName"
                        }
                        onClick={() => openSubProcess(el)}
                      >
                        {el.ActivityName}
                      </p>
                    </ToolDescription>
                  )}
                </div>
              );
            })}
          </div>
        ) : (
          <p className="noProcessAdded">
            <i>{t("noProcessAdded")}</i>
          </p>
        )}

        {/*<div className="subProcessDiv">
          <p className="modalActivityTitle">{t("embededSubProcess")}</p>*/}
        {/* code edited on 22 Feb 2023 for BugId 124053*/}
        {/* {embededSubProcess.length > 0 ? (
            <div style={{ display: "flex", flexDirection: "column" }}>
              {embededSubProcess &&
                embededSubProcess.map((el) => {
                  return (
                    <div
                      className="row"
                      style={{ alignItems: "center", marginBottom: "5px" }}
                    >
                      <img
                        src={SubprocessLogo}
                        width="15px"
                        height="15px"
                        alt=""
                      />
                      <p className="subProcessActivityName">
                        {el.ActivityName}
                      </p>
                    </div>
                  );
                })}
            </div>
          ) : (
            <p className="noProcessAdded">
              <i>{t("noProcessAdded")}</i>
            </p>
          )}
        </div>*/}
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

export default connect(null, mapDispatchToProps)(SubProcesses);
