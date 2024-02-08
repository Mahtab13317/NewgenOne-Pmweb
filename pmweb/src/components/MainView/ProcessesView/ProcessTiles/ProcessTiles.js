import React, { useState, useEffect } from "react";
import "./ProcessesTiles.css";
import { useTranslation } from "react-i18next";
import { tileProcess } from "../../../../utility/HomeProcessView/tileProcess";
import { connect } from "react-redux";
import * as actionCreators from "../../../../redux-store/actions/processView/actions.js";
import { RTL_DIRECTION } from "../../../../Constants/appConstants";

function ProcessTypes(props) {
  let { t } = useTranslation();
  const direction = `${t("HTML_DIR")}`;
  let nonZeroProcessTile_Index = -1;

  props.processTypeList?.map((type, index) => {
    if (type.Count != 0 && nonZeroProcessTile_Index == -1)
      nonZeroProcessTile_Index = props.selectedTile
        ? props.clickedProcessTileAtHome.processTileIndex
        : index;
  });
  let [nonZeroProcessTileIndex, setnonZeroProcessTileIndex] = useState(
    nonZeroProcessTile_Index
  );

  useEffect(() => {
    props.defaultProcessTileIndex(nonZeroProcessTileIndex);
  }, []);

  // code added on 06 June 2023 for BugId 119488 and BugId 127429
  useEffect(() => {
    setnonZeroProcessTileIndex(-1);
  }, [props.tabValue]);

  // code added on 22 June 2022 for BugId 111210
  useEffect(() => {
    setnonZeroProcessTileIndex(props.selectedProcessTile);
  }, [props.selectedProcessTile]);

  let sendSelectedProcessTile = (
    selectedProcessTileCode,
    selectedProcessTileCount,
    selectedProcessTileIndex
  ) => {
    props.setSelectedProjectId(null);
    setnonZeroProcessTileIndex(selectedProcessTileIndex);
    return props.getSelectedProcessTile(
      selectedProcessTileCode,
      selectedProcessTileCount,
      selectedProcessTileIndex
    );
  };
  const handleKeyDown = (
    e,
    selectedProcessTileCode,
    selectedProcessTileCount,
    selectedProcessTileIndex
  ) => {
    if (e.keyCode === 13) {
      sendSelectedProcessTile(
        selectedProcessTileCode,
        selectedProcessTileCount,
        selectedProcessTileIndex
      );
      e.stopPropagation();
    }
  };

  // React.useEffect(() => {
  //   document.addEventListener("keydown", handleKeyDown);
  //   return () => document.removeEventListener("keydown", handleKeyDown);
  // }, [handleKeyDown]);

  return (
    <div className="processTypeTable" style={{ direction: direction }}>
      {props.processTypeList?.map((type, index) => {
        return (
          <div
            className={`oneRow ${
              nonZeroProcessTileIndex === index && !props.selectedProjectId
                ? "selectedRow"
                : ""
            }`}
            onClick={() =>
              sendSelectedProcessTile(type.ProcessType, type.Count, index)
            }
            onKeyDown={(e) =>
              handleKeyDown(e, type.ProcessType, type.Count, index)
            }
            tabIndex={0}
            id={`pmweb_processesTab_${type.ProcessType}`}
          >
            <p
              className="oneRowProcessType"
              style={{
                // flexDirection:
                //   direction === RTL_DIRECTION ? "row-reverse" : "row",
              }}
            >
              <img
                className="processDotColor"
                src={tileProcess(type?.ProcessType)[0]}
                alt="Process Type Color"
              />
              <span
                style={{
                  marginInlineStart: direction === RTL_DIRECTION ? "5px" : null,
                }}
              >
                {t(tileProcess(type.ProcessType)[1])}
                {t(tileProcess(type.ProcessType)[5]) ? (
                  <p style={{ display: "inline", marginLeft: "4px" }}>
                    Waiting
                  </p>
                ) : null}{" "}
              </span>
            </p>
            <div className="processTypeCount">
              <span>{type.Count}</span>
            </div>
          </div>
        );
      })}
    </div>
  );
}
const mapStateToProps = (state) => {
  return {
    selectedTile: state.clickedProcessTileReducer.selectedProcessTile,
    clickedProcessTileAtHome:
      state.clickedProcessTileReducer.selectedProcessTile,
    selectedTabAtNavPanel: state.selectedTabAtNavReducer.selectedTab,
  };
};

const mapDispatchToProps = (dispatch) => {
  return {
    defaultProcessTileIndex: (defaultProcessTileIndex) =>
      dispatch(actionCreators.defaultProcessTileIndex(defaultProcessTileIndex)),
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(ProcessTypes);
