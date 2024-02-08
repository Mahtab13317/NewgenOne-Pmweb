// Code changed to solve - Unable to deploy process if we validate it first - 111108 and
// View Details link while Deploying not working - 110762
// Changes made to solve Bug 115320 - Validate process: the output error window does not have scroll bar to view all the error/warning present in process
// #BugID - 120855
// #BugDescription - Issue has been fixed.
//Changes made to solve Bug 123515 -Process Designer-icons related- UX and UI bugs

import React, { useState, useEffect } from "react";
import axios from "axios";
import CloseIcon from "@material-ui/icons/Close";
import { withStyles } from "@material-ui/core/styles";
import LinearProgress from "@material-ui/core/LinearProgress";
import WarningIcon from "@material-ui/icons/Warning";
import Button from "@material-ui/core/Button";
import RemoveIcon from "@material-ui/icons/Remove";
import CheckBoxOutlineBlankIcon from "@material-ui/icons/CheckBoxOutlineBlank";
import deploy from "../../../../../assets/Header/DM_Deploy_Task_white.svg";
import "./index.css";
import Modal from "../../../../../UI/Modal/Modal.js";
import {
  ENDPOINT_VALIDATEPROCESS,
  SERVER_URL,
  MENUOPTION_DEPLOY,
  userRightsMenuNames,
} from "../../../../../Constants/appConstants";
import { connect, useSelector } from "react-redux";
import { useTranslation } from "react-i18next";
import DeployProcess from "../../../../../components/DeployProcess/DeployProcess.js";
import ProcessDeployment from "../../ProcessValidation/ProcessDeployment/DeploySucessModal.js";
import { UserRightsValue } from "../../../../../redux-store/slices/UserRightsSlice";
import { getMenuNameFlag } from "../../../../../utility/UserRightsFunctions";
import { useGlobalState, store } from "state-pool";

function ProcessValidation(props) {
  let { t } = useTranslation();
  const loadedProcessData = store.getState("loadedProcessData");
  const [localLoadedProcessData] = useGlobalState(loadedProcessData);
  const direction = `${t("HTML_DIR")}`;
  const userRightsValue = useSelector(UserRightsValue);
  const registerProcessRightsFlag = getMenuNameFlag(
    userRightsValue?.menuRightsList,
    userRightsMenuNames.registerProcess
  );

  const BorderLinearProgress = withStyles((theme) => ({
    root: {
      height: 10,
      borderRadius: 5,
      width: 405,
    },
    colorPrimary: {
      backgroundColor:
        theme.palette.grey[theme.palette.type === "light" ? 200 : 700],
    },
    bar: {
      borderRadius: 5,
      backgroundColor: "#619548",
    },
  }))(LinearProgress);

  let {
    errorVariables,
    setErrorVariables,
    warningVariables,
    setWarningVariables,
    stopValidateCall = false,
    hideDeployOption = false,
  } = props;
  const [isDrawerMinimised, setIsDrawerMinimised] = useState(false);
  const [showDeployModal, setShowDeployModal] = useState(false);
  const [showErrorTab, setShowErrorTab] = useState(false);
  const [action, setAction] = useState(null);
  const buttonFrom = "ValidationFooterDeploy";
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!stopValidateCall) {
      const obj = {
       // processDefId: props.openProcessID,
       processDefId: props.processDefId, //Modified on 22/01/2024 for bug_id:142453
        action: localLoadedProcessData?.CheckedOut === "Y" ? "CI" : "RE",
        processVariantType: "S",
      };
      axios.post(SERVER_URL + ENDPOINT_VALIDATEPROCESS, obj).then((res) => {
        let tempErrors = [];
        let tempWarnings = [];
        res &&
          res.data &&
          res?.data?.Error?.forEach((e) => {
            if (e.ErrorLevel === "E") {
              tempErrors.push(e);
            } else if (e.ErrorLevel === "W") {
              tempWarnings.push(e);
            }
          });
        setWarningVariables(tempWarnings);
        setErrorVariables(tempErrors);
        setShowErrorTab(tempErrors?.length > 0);
        setLoading(false);
      });
    } else {
      setLoading(false);
    }
  }, []);

  // code added on 6 April 2023 for BugId 125900
  useEffect(() => {
    if (errorVariables?.length > 0) {
      setShowErrorTab(true);
    } else {
      setShowErrorTab(false);
    }
  }, [errorVariables]);

  const showErrors = (v) => {
    return (
      <div
        style={{
          display: "flex",
          marginBottom: "10px",
        }}
      >
        <CloseIcon
          style={{
            height: "13px",
            width: "13px",
            cursor: "pointer",
            color: "red",
            marginTop: "3px",
          }}
        />
        <p style={{ fontSize: "12px", marginLeft: "10px" }}>
          {v.ValidationLevel}
        </p>
        <p style={{ fontSize: "12px", marginLeft: "25px" }}>{v.ErrorLabel}</p>
      </div>
    );
  };

  const showWarnings = (v) => {
    return (
      <div
        style={{
          display: "flex",
          marginBottom: "10px",
        }}
      >
        <WarningIcon
          style={{
            height: "14px",
            width: "15px",
            cursor: "pointer",
            color: "#F0A229",
          }}
        />
        <p style={{ fontSize: "12px", marginLeft: "10px" }}>
          {v.ValidationLevel}
        </p>
        <p style={{ fontSize: "12px", marginLeft: "25px" }}>{v.ErrorLabel}</p>
      </div>
    );
  };

  const validateProcessHandler = () => {
    // API Integration to Validate Process
    setLoading(true);
    const obj = {
      processDefId: props.openProcessID,
      action: "RE",
      processVariantType: "S",
    };

    axios.post(SERVER_URL + ENDPOINT_VALIDATEPROCESS, obj).then((res) => {
      if (res.status === 200) {
        let tempErrors = [];
        let tempWarnings = [];
        res?.data?.Error?.map((e) => {
          if (e.ErrorLevel == "E") {
            tempErrors.push(e);
          } else if (e.ErrorLevel == "W") {
            tempWarnings.push(e);
          }
        });
        setWarningVariables(tempWarnings);
        setErrorVariables(tempErrors);
        setLoading(false);
      }
    });
  };

  return (
    <div
      style={{
        height: isDrawerMinimised ? "50px" : "180px",
        direction: direction,
        borderTop: "1px solid rgba(0,0,0,0.1)",
      }}
    >
      {!loading ? (
        <>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              padding: "2px 10px",
            }}
          >
            <div
              style={{
                display: "flex",
                gap: "1vw",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <p style={{ fontSize: "14px", fontWeight: "700" }}>
                {t("Output")}
              </p>
              <p
                style={{
                  fontSize: "12px",
                  display: "flex",
                  alignItems: "center",
                  /*Bug 118750 : [08-02-2023] Added property "cursor:pointer" */
                  cursor: "pointer",
                  fontWeight: showErrorTab ? "600" : "400",
                  color: showErrorTab ? "var(--selected_tab_color)" : "#000",
                }}
                onClick={() => {
                  setShowErrorTab(true);
                }}
                id="pmweb_processProgress_showError"
              >
                {t("errors")}
                <CloseIcon
                  style={{
                    height: "12px",
                    width: "12px",
                    cursor: "pointer",
                    color: "red",
                    marginRight: "2px",
                  }}
                />
                ({errorVariables.length})
              </p>
              <p
                style={{
                  fontSize: "12px",
                  display: "flex",
                  alignItems: "center",
                  /*Bug 118750 : [08-02-2023] Added property "cursor:pointer" */
                  cursor: "pointer",
                  fontWeight: showErrorTab ? "400" : "600",
                  color: showErrorTab ? "#000" : "var(--selected_tab_color)",
                }}
                onClick={() => {
                  setShowErrorTab(false);
                }}
                id="pmweb_processProgress_showWarning"
              >
                {t("warnings")}
                <WarningIcon
                  style={{
                    height: "12px",
                    width: "12px",
                    cursor: "pointer",
                    color: "#F0A229",
                    marginRight: "2px",
                  }}
                />
                ({warningVariables.length})
              </p>
            </div>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap:
                  errorVariables.length === 0 && warningVariables.length === 0
                    ? null
                    : "0.5vw",
                justifyContent: "space-between",
              }}
            >
              {errorVariables.length === 0 &&
              warningVariables.length === 0 ? null : (
                <Button
                  style={{
                    width: "63px",
                    background: "#FFFFFF 0% 0% no-repeat padding-box",
                    border: "1px solid var(--link_color)",
                    borderRadius: "2px",
                    color: "var(--link_color)",
                    padding: "2px",
                    textTransform: "none",
                  }}
                  variant="outlined"
                  onClick={() => validateProcessHandler()}
                  id="pmweb_processProgress_validateProcess"
                >
                  {t("validate")}
                </Button>
              )}
              {errorVariables.length === 0 &&
              warningVariables.length === 0 ? null : isDrawerMinimised ? (
                <CheckBoxOutlineBlankIcon
                  style={{
                    cursor: "pointer",
                    height: "1.25rem",
                    width: "1.25rem",
                    border: "#707070",
                  }}
                  onClick={() => setIsDrawerMinimised(!isDrawerMinimised)}
                  id="pmweb_processProgress_drawerMinimised"
                />
              ) : (
                <RemoveIcon
                  style={{
                    cursor: "pointer",
                    height: "1.25rem",
                    width: "1.25rem",
                  }}
                  onClick={() => setIsDrawerMinimised(!isDrawerMinimised)}
                  id="pmweb_processProgress_drawerMaximised"
                />
              )}

              {registerProcessRightsFlag &&
              errorVariables.length === 0 &&
              warningVariables.length === 0 &&
              !hideDeployOption ? (
                <button
                  className="deployButton"
                  // onClick={() => setShowDeployModal(true)}
                  onClick={() => setAction(MENUOPTION_DEPLOY)}
                  id="pmweb_processProgress_deployButton"
                  disabled={props?.checkOutData === "Y"} //code edited on 13 Dec 2022 for BugId 118764
                >
                  <img
                    src={deploy}
                    style={{ width: "1.75rem", height: "1.75rem" }}
                    alt="Deploy"
                  />
                  <span className="deployText">{t("Deploy")}</span>
                </button>
              ) : null}

              {showDeployModal ? (
                <Modal
                  show={showDeployModal}
                  style={{
                    width: "395px",
                    height: "235px",
                    left: "40%",
                    top: "25%",
                    padding: "0",
                  }}
                  modalClosed={() => setShowDeployModal(false)}
                  id="pmweb_processProgress_deployModalClose"
                  children={
                    <ProcessDeployment
                      setShowDeployModal={setShowDeployModal}
                    />
                  }
                ></Modal>
              ) : null}
              <CloseIcon
                style={{
                  height: "1.5rem",
                  width: "1.5rem",
                  cursor: "pointer",
                }}
                onClick={() => props.toggleDrawer()}
                id="pmweb_processProgress_toggleDrawer"
              />
            </div>
          </div>
          <hr />
          {errorVariables.length === 0 && warningVariables.length === 0 ? (
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                flexDirection: "column",
                padding: "10px 10px 5px 10px",
                height: "85px",
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  width: "405px",
                }}
              >
                <p style={{ fontSize: "12px", color: "#606060" }}>
                  {t("processComplianceStore")}
                </p>
                <p style={{ fontSize: "12px", color: "#000000" }}>100%</p>
              </div>
              <BorderLinearProgress variant="determinate" value={100} />
              <p
                style={{
                  fontSize: "12px",
                  color: "#000000",
                  fontWeight: "700",
                }}
              >
                {t("processIsValid")}
              </p>
            </div>
          ) : (
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                padding: "10px",
                height: "10rem",
                overflow: "auto",
              }}
            >
              <div>
                {showErrorTab &&
                  errorVariables &&
                  errorVariables.map((v) => {
                    return showErrors(v);
                  })}
                {!showErrorTab &&
                  warningVariables &&
                  warningVariables.map((v) => {
                    return showWarnings(v);
                  })}
              </div>
              {localLoadedProcessData?.CheckedOut === "Y" ||
              hideDeployOption ? null : (
                <p
                  /* change made to make validate process screen responsive */
                  className="fillDeployProcess"
                  onClick={() => setAction(MENUOPTION_DEPLOY)}
                  style={{ right: direction === "rtl" ? "75%" : "25%" }}
                  id="pmweb_processProgress_menuoptionDeploy"
                >
                  {t("fillDeployProcess")}
                </p>
              )}
            </div>
          )}

          {action === MENUOPTION_DEPLOY ? (
            <Modal
              show={action === MENUOPTION_DEPLOY}
              style={{
                padding: "0",
                width: "40vw",
                height: "90vh",
                top: "5%",
              }}
              modalClosed={() => setAction(null)}
              children={
                <DeployProcess
                  showDeployModal={props.showDeployModal}
                  setShowDeployModal={props.setShowDeployModal}
                  setShowDeployFailModal={props.setShowDeployFailModal}
                  showDeployFailModal={props.showDeployFailModal}
                  toggleDrawer={() => props.toggleDrawer("bottom", false)}
                  setModalClosed={() => setAction(null)}
                  buttonFrom={buttonFrom}
                  setErrorVariables={setErrorVariables}
                  setWarningVariables={setWarningVariables}
                />
              }
            />
          ) : null}
        </>
      ) : (
        <div
          style={{
            fontSize: "var(--subtitle_text_font_size)",
            fontWeight: "500",
            margin: "80px auto",
          }}
        >
          <p style={{ marginLeft: "50%" }}>{t("loading")}</p>
        </div>
      )}
    </div>
  );
}

const mapStateToProps = (state) => {
  return {
    openProcessID: state.openProcessClick.selectedId,
    openProcessType: state.openProcessClick.selectedType,
  };
};

export default connect(mapStateToProps)(ProcessValidation);
