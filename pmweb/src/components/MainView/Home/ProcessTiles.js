import React, { useEffect } from "react";
import { useTranslation } from "react-i18next";
import "./Home.css";
import DashboardTile from "../../../UI/DashboardTiles/index";
import { connect } from "react-redux";
import * as actionCreators from "../../../redux-store/actions/processView/actions.js";
import axios from "axios";
import { SERVER_URL } from "../../../Constants/appConstants";
import { tileProcess } from "../../../utility/HomeProcessView/tileProcess";

function ProcessTiles(props) {
  let { t } = useTranslation();

  useEffect(() => {
    axios
      .get(SERVER_URL + `/getprocessTypeList`)
      .then((res) => {
        if (res.status === 200) {
          let processTypeList = res.data.Processes;
          props.processTileList(processTypeList);
        }
      })
      .catch((err) => console.log(err));
  }, []);

  let tileData = props.processTypeList;

  let tileList =
    tileData &&
    tileData.map((data, index) => {
      let tileProcessData = tileProcess(data.ProcessType);

      return {
        title: data.Count,
        description: {
          label: t(tileProcessData[1]),
          value: "",
          subLabel: t(tileProcessData[2]),
        },
        img_info: {
          background_color: tileProcessData[3],
          url: tileProcessData[0],
        },
        hover_border_color: tileProcessData[6],
        processTileCode: data.ProcessType,
        processTileIndex: index,
      };
    });

  let tileDataUi = (
    <DashboardTile
      tileList={tileList}
      width={"12.92vw"}
      height={"72px"}
      direction={`${t("HTML_DIR")}`}
    />
  );

  return <div className="row">{tileDataUi}</div>;
}

// Sent ProcessTiles List at Home into the Store so as to use the lsit inside ProcessesView
const mapDispatchToProps = (dispatch) => {
  return {
    processTileList: (list) => dispatch(actionCreators.processTileList(list)),
  };
};

// Fetched ProcessTiles List from the Store which is dispatched above to paint it on home screen.
const mapStateToProps = (state) => {
  return {
    processTypeList: state.processTypesReducer.tileData,
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(ProcessTiles);
