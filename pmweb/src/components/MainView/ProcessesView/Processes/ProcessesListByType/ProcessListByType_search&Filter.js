// Changes made to solve Bug with ID 115457 -> Process Searching: search result result should refresh after erasing the entry of the search field
//Changes made to solve Bug 112902 - Enabled process -> Group by project is not working
import React, { useState } from "react";
import SearchProcess from "../../../../../UI/Search Component/index";
import { useTranslation } from "react-i18next";
import "../../Projects/projects.css";
import ProcessListByTypeTable from "./ProcessesListByTypeTable";
import { tileProcess } from "../../../../../utility/HomeProcessView/tileProcess.js";
import FilterImage from "../../../../../assets/ProcessView/PT_Sorting.svg";
import { connect, useSelector } from "react-redux";
import SortingModal from "../ProcessesListByProject/sortByModal.js";
import Modal from "../../../../../UI/Modal/Modal";
import {
  APP_HEADER_HEIGHT,
  RTL_DIRECTION,
} from "../../../../../Constants/appConstants";

function ProcessListByType_TableNSearchNSortNFilter(props) {
  let { t } = useTranslation();
  const direction = `${t("HTML_DIR")}`;
  const [pinToTopcheck, setPinToTopCheck] = useState(true);
  const [showSortingModal, setShowSortingModal] = useState(false);
  let [searchTerm, setSearchTerm] = useState("");
  const [selectionOne, setSelectionOne] = useState(2);
  const [selectionTwo, setSelectionTwo] = useState(0);
  const [filteredLength, setfilteredLength] = useState(null);
  /* changes added for bug_id: 134226 */
  const windowInnerHeight = useSelector(
    (state) => state.setWindowInnerHeight.windowInnerHeight
  );
  let Pending =
    props.selectedProcessCode == ("RP" || "EP")
      ? tileProcess(props.selectedProcessCode)[2]
      : "";

  const GetSortingOptions = (selectedSortBy, selectedSortOrder) => {
    setSelectionOne(selectedSortBy);
    setSelectionTwo(selectedSortOrder);
  };

  const clearSearchResult = () => {
    setSearchTerm("");
  };
  const handleKeySort = (e) => {
    if (e.keyCode === 13) {
      setShowSortingModal(true);
      e.stopPropagation();
    }
  };

  return (
    <div className="processName_Filters_Table">
      <div className="processName_Search_Filters">
        <p className="processName_Search_FiltersHeading">
          {t("processList.All")}{" "}
          {props.selectedProcessCode
            ? t(tileProcess(props.selectedProcessCode)[1]) + " " + Pending
            : ""}{" "}
          {props.selectedProcessCode ? "" : t("processView.Processes")} (
          {/* {props.selectedProcessCount}) */}
          {filteredLength})
        </p>
        <div className="filterBox">
          <SearchProcess
            id="ProcessesTab_searchProcess"
            setSearchTerm={setSearchTerm}
            clearSearchResult={clearSearchResult}
            searchIconAlign="right"
            placeholder="Search"
            style={{
              width: "160px",
              minWidth: "200px",
              border: "1px solid #c8c6a7",
              backgroundColor: "white",
              color: "black",
            }}
          />
          <div
            className="filterButton"
            type="button"
            onClick={() => setShowSortingModal(true)}
            onKeyDown={(e) => handleKeySort(e)}
            tabIndex={0}
          >
            <img
              src={FilterImage}
              style={{ width: "100%" }}
              alt={t("filterImg")}
            />
          </div>
          {showSortingModal ? (
            <Modal
              show={showSortingModal}
              backDropStyle={{ backgroundColor: "transparent" }}
              style={{
                top: "22%",
                // left: "84%",
                left: direction === RTL_DIRECTION ? "2%" : "84%",
                width: "200px",
                height: "195px",
                padding: "5px",
                zIndex: "1500",
                boxShadow: "0px 3px 6px #00000029",
                border: "1px solid #D6D6D6",
                borderRadius: "3px",
              }}
              modalClosed={() => setShowSortingModal(false)}
              children={<SortingModal getSortingOptions={GetSortingOptions} />}
            />
          ) : null}
        </div>
      </div>

      {pinToTopcheck ? (
        <div
          className="pinnedAtTop_Table"
          style={{
            height: `calc(${windowInnerHeight}px - ${APP_HEADER_HEIGHT} - 14rem)`,
          }}
        >
          <h4
            style={{
              fontWeight: "600",
              display:
                props.pinnedDataList?.filter((data) => {
                  return data.Type == props.selectedProcessCode;
                }).length > 0
                  ? ""
                  : "none",
            }}
          >
            {t("processList.pinnedProcesses")}
          </h4>

          {props.pinnedDataList?.filter((data) => {
            return data.Type == props.selectedProcessCode;
          }).length > 0 && (
            <ProcessListByTypeTable
              searchTerm={searchTerm}
              tabValue={props.tabValue}
              selectedProcessTile={props.selectedProcessTile}
              selectedProcessCount={props.selectedProcessCount}
              selectedProcessCode={props.selectedProcessCode}
              showTableHead={true}
              selectionOne={selectionOne}
              selectionTwo={selectionTwo}
              setfilteredLength={setfilteredLength}
              processList={props.pinnedDataList?.filter((data) => {
                return data.Type == props.selectedProcessCode;
              })}
            />
          )}
          <h4
            style={{
              fontWeight: "600",
              display:
                props.pinnedDataList?.filter((data) => {
                  return data.Type == props.selectedProcessCode;
                }).length > 0
                  ? ""
                  : "none",
            }}
          >
            {t("processList.otherProcesses")}
          </h4>
          <ProcessListByTypeTable
            selectionOne={selectionOne}
            selectionTwo={selectionTwo}
            tabValue={props.tabValue}
            selectedProcessTile={props.selectedProcessTile}
            selectedProcessCount={props.selectedProcessCount}
            searchTerm={searchTerm}
            selectedProcessCode={props.selectedProcessCode}
            showTableHead={false}
            processList={props.processList}
            setfilteredLength={setfilteredLength}
          />
        </div>
      ) : (
        <ProcessListByTypeTable
          selectedProcessCode={props.selectedProcessCode}
          maxHeightofTable="440px"
          tabValue={props.tabValue}
          selectedProcessTile={props.selectedProcessTile}
          selectedProcessCount={props.selectedProcessCount}
          showTableHead={true}
          selectionOne={selectionOne}
          selectionTwo={selectionTwo}
          processList={props.processList}
          setfilteredLength={setfilteredLength}
        />
      )}
    </div>
  );
}

const mapStateToProps = (state) => {
  return {
    selectedTabAtNavPanel: state.selectedTabAtNavReducer.selectedTab,
    defaultProcessTileIndex:
      state.defaultProcessTileReducer.defaultProcessTileIndex,
    clickedProcessTileAtHome:
      state.clickedProcessTileReducer.selectedProcessTile,
  };
};

export default connect(
  mapStateToProps,
  null
)(ProcessListByType_TableNSearchNSortNFilter);
