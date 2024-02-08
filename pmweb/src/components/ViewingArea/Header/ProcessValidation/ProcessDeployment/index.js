import React from "react";
import "./index.css";
import CloseIcon from "@material-ui/icons/Close";
import { store, useGlobalState } from "state-pool";
import { useTranslation } from "react-i18next";

function DeployProcess(props) {
  let { t } = useTranslation();
  const loadedProcessData = store.getState("loadedProcessData");
  const [localLoadedProcessData] = useGlobalState(loadedProcessData);

  return (
    <div>
      <div
        style={{
          height: "15px",
          width: "100%",
          padding: "20px 12px 20px 18px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <p style={{ fontSize: "14px", fontWeight: "700" }}>Deploy Process</p>
        <CloseIcon
          onClick={() => props.setShowDeployModal(false)}
          style={{
            height: "13px",
            width: "13px",
            cursor: "pointer",
          }}
          id="pmweb_processDeployment_deployModalClose"
        />
      </div>
      <hr />
      <div
        style={{ display: "flex", flexDirection: "column", padding: "18px" }}
      >
        <p style={{ fontSize: "12px", color: "#606060", marginBottom: "2px" }}>
          {t("ProcessName")}
        </p>
        <p style={{ fontSize: "12px", color: "#000000", fontWeight: "600" }}>
          {localLoadedProcessData.ProcessName}
        </p>
        <p
          style={{
            fontSize: "12px",
            color: "#606060",
            margin: "20px 0px 5px 0px",
          }}
        >
          {t("comments")}
        </p>
        <textarea
          style={{
            width: "360px",
            height: "56px",
            border: "1px solid #CECECE",
          }}
        />
      </div>
      <div
        style={{
          width: "394px",
          height: "50px",
          backgroundColor: "#F5F5F5",
          position: "absolute",
          bottom: "0px",
        }}
      >
        <button
          onClick={() => props.setShowDeployModal(false)}
          style={{
            width: "54px",
            height: "28px",
            backgroundColor: "white",
            color: "grey",
            position: "absolute",
            right: "22%",
            top: "24%",
            border: "1px solid grey",
            cursor: "pointer",
          }}
          id="pmweb_processDeployment_deployModalButton"
        >
          {t("cancel")}
        </button>
        <button
          style={{
            width: "54px",
            height: "28px",
            backgroundColor: "#0072C6",
            color: "white",
            position: "absolute",
            right: "4%",
            top: "24%",
            border: "none",
            cursor: "pointer",
          }}
        >
          {t("Deploy")}
        </button>
      </div>
    </div>
  );
}

export default DeployProcess;
