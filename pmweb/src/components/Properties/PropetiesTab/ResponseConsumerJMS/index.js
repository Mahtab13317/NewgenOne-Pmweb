import React, { useState, useEffect } from "react";

import { useDispatch } from "react-redux";

import Modal from "../../../../UI/Modal/Modal.js";

import "../../Properties.css";

import { store, useGlobalState } from "state-pool";

import { connect } from "react-redux";
import { useTranslation } from "react-i18next";
import "./index.css";
import { withStyles, makeStyles } from "@material-ui/core/styles";

import TableCell from "@material-ui/core/TableCell";

import TableRow from "@material-ui/core/TableRow";

import "./index.css";

import JMS_XML from "./jmsXML.js";
import TableResponseConsumer from "./TableResponseConsumer.js";

import { LatestVersionOfProcess } from "../../../../utility/abstarctView/checkLatestVersion";
import { isReadOnlyFunc } from "../../../../utility/CommonFunctionCall/CommonFunctionCall";

const useStyles = makeStyles({
  table: {
    height: 40,
  },
  tableContainer: {
    padding: 5,
  },
  tableRow: {
    height: 40,
  },
  tableHeader: {
    fontWeight: 600,
    fontSize: 14,
    padding: 0,
  },
  tableBodyCell: {
    fontSize: 12,
    padding: 0,
  },
  checkboxRow: {
    padding: 0,
  },
  tableBodyCellVariables: {
    fontSize: 12,
    padding: 0,
  },
});

function ResponseConsumerJMS(props) {
  let { t } = useTranslation();

  const [showXMLModal, setShowXMLModal] = useState(false);
  const loadedProcessData = store.getState("loadedProcessData");
  const [localLoadedProcessData, setlocalLoadedProcessData] =
    useGlobalState(loadedProcessData);
  const [destinationName, setDestinationName] = useState("");
  const loadedActivityPropertyData = store.getState("activityPropertyData");
  const [localLoadedActivityPropertyData, setlocalLoadedActivityPropertyData] =
    useGlobalState(loadedActivityPropertyData);
  let isReadOnly =
    props.openTemplateFlag ||
    LatestVersionOfProcess(localLoadedProcessData?.Versions) !==
      +localLoadedProcessData?.VersionNo || // modified on 05/09/2023 for BugId 136103
    isReadOnlyFunc(
      localLoadedProcessData,
      props.cellCheckedOut,
      props.cellLaneId
    ); //code updated on 26 September 2022 for BugId 115467

  useEffect(() => {
    if (localLoadedActivityPropertyData?.Status === 0) {
      setDestinationName(
        localLoadedActivityPropertyData?.ActivityProperty?.consumerInfo
          ?.destinationName
      );
    }
  }, [localLoadedActivityPropertyData]);

  return (
    <div>
      <div style={{ padding: "var(--spacing_v) 0.5vw" }}>
        <p className="requestConsumerHead">{t("resConsumerJms")}</p>
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            margin: "1rem 0",
          }}
        >
          <p
            style={{
              fontSize: "var(--base_text_font_size)",
              color: "#606060",
              fontWeight: "500",
            }}
          >
            {t("destinationName")}
          </p>
          <div
            style={{
              display: "flex",
              gap: "1vw",
              alignItems: "center",
              width: props.isDrawerExpanded ? "50%" : "100%",
            }}
          >
            <input
              className="webserviceLocation"
              disabled={isReadOnly}
              value={destinationName}
              style={{ width: "70%" }}
            />
            <button
              style={{
                minWidth: "5vw",
                width: "30%",
                cursor: "pointer",
              }}
              // disabled
              disabled={destinationName?.trim()?.length === 0 || isReadOnly}
              onClick={() => setShowXMLModal(true)}
            >
              {t("InputXML")}
            </button>
          </div>
        </div>
      </div>
      <div style={{ padding: "0.5rem 0.5vw" }}>
        <TableResponseConsumer isReadOnly={isReadOnly} />
      </div>

      {showXMLModal ? (
        <Modal
          show={showXMLModal}
          backDropStyle={{ backgroundColor: "transparent" }}
          style={{
            zIndex: "1500",
            boxShadow: "0px 3px 6px #00000029",
            border: "1px solid #D6D6D6",
            borderRadius: "2px",
            // width: "438px",
            height: "295px",
          }}
          modalClosed={() => setShowXMLModal(false)}
          children={
            <JMS_XML
              setShowXMLModal={setShowXMLModal}
              isReadOnly={isReadOnly}
            />
          }
        ></Modal>
      ) : null}
    </div>
  );
}
const mapStateToProps = (state) => {
  return {
    showDrawer: state.showDrawerReducer.showDrawer,
    cellID: state.selectedCellReducer.selectedId,
    cellName: state.selectedCellReducer.selectedName,
    cellType: state.selectedCellReducer.selectedType,
    cellActivityType: state.selectedCellReducer.selectedActivityType,
    cellActivitySubType: state.selectedCellReducer.selectedActivitySubType,
    isDrawerExpanded: state.isDrawerExpanded.isDrawerExpanded,
    openTemplateFlag: state.openTemplateReducer.openFlag,
  };
};

export default connect(mapStateToProps, null)(ResponseConsumerJMS);
