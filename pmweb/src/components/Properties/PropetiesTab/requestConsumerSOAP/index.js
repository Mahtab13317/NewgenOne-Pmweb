import React, { useState, useEffect } from "react";
import {
  Radio,
  RadioGroup,
  FormControlLabel,
  FormControl,
} from "@material-ui/core";
import { useDispatch } from "react-redux";

import TableRequestConsumer from "./TableRequestConsumer.js";
import "../../Properties.css";
import { Select, MenuItem } from "@material-ui/core";
import { store, useGlobalState } from "state-pool";

import { connect } from "react-redux";
import { useTranslation } from "react-i18next";
import "./index.css";
import { makeStyles } from "@material-ui/core/styles";

import "./index.css";

import TabsHeading from "../../../../UI/TabsHeading";
import { LatestVersionOfProcess } from "../../../../utility/abstarctView/checkLatestVersion";

const useStyles = makeStyles({
  table: {
    // width: props.isDrawerExpanded? '100%': 324,
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
});

function RequestConsumerSoap(props) {
  let { t } = useTranslation();

  const loadedProcessData = store.getState("loadedProcessData");
  const [localLoadedProcessData, setlocalLoadedProcessData] =
    useGlobalState(loadedProcessData);
  const loadedActivityPropertyData = store.getState("activityPropertyData");
  const [localLoadedActivityPropertyData, setlocalLoadedActivityPropertyData] =
    useGlobalState(loadedActivityPropertyData);
  const [replyActivities, setReplyActivities] = useState([]);
  const [chosenReply, setChosenReply] = useState();
  const [invocationType, setInvocationType] = useState(null);
  let isReadOnly =
    props.openTemplateFlag ||
    LatestVersionOfProcess(localLoadedProcessData?.Versions) !==
      +localLoadedProcessData?.VersionNo; // modified on 05/09/2023 for BugId 136103;
  const handleChange = (event) => {
    setInvocationType(event.target.value);
  };
  const OnReplySelect = (e) => {
    setChosenReply(e.target.value);
  };

  const [webserviceLocation, setWebserviceLocation] = useState(null);

  useEffect(() => {
    let temp =
      localLoadedActivityPropertyData?.ActivityProperty?.requestConsumerSOAP
        ?.webServLoc;
    setWebserviceLocation(temp);

    if (
      localLoadedActivityPropertyData?.ActivityProperty?.requestConsumerSOAP
        ?.invocationType === "RI"
    ) {
      setChosenReply("");
      setInvocationType(t("ReplyImmediate"));
    } else {
      replyActivities.map((replyActivity) => {
        if (
          replyActivity.ActivityId ==
          localLoadedActivityPropertyData?.ActivityProperty?.requestConsumerSOAP
            ?.m_intReplyAct
        ) {
          setChosenReply(replyActivity.activityName);
          setInvocationType(t("ReplyAfterCompletion"));
        }
      });
    }
  }, [replyActivities]);

  useEffect(() => {
    let tempData = [];
    loadedProcessData?.value?.MileStones?.map((mile) => {
      mile?.Activities?.map((activity) => {
        if (activity.ActivityType == 26 && activity.ActivitySubType == 1) {
          tempData.push({
            activityName: activity.ActivityName,
            activityId: activity.ActivityId,
          });
        }
      });
    });
    setReplyActivities(tempData);
  }, [loadedProcessData]);

  return (
    <div>
      <TabsHeading heading={props?.heading} />
      <div style={{ padding: "0px 10px 10px 10px" }}>
        <p className="requestConsumerHead">Request Consumer Soap</p>
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            marginBottom: "10px",
          }}
        >
          <p
            style={{
              fontSize: "12px",
              color: "#606060",
              fontWeight: "500",
              marginLeft: "5px",
            }}
          >
            Webservice Location
          </p>
          <input
            aria-label={`${webserviceLocation}`}
            value={webserviceLocation}
            className="webserviceLocation"
            disabled={isReadOnly}
          />
        </div>
        <div className="receiveInvocation">
          <p style={{ fontSize: "12px", color: "#606060" }}>Invocation Type</p>
          <FormControl component="fieldset">
            <RadioGroup
              id="receive_RadioGroup"
              onChange={handleChange}
              aria-label="gender"
              defaultValue={
                localLoadedActivityPropertyData?.ActivityProperty
                  ?.requestConsumerSOAP?.invocationType == "RI"
                  ? t("ReplyImmediate")
                  : t("ReplyAfterCompletion")
              }
              name="radio-buttons-group"
              disabled={isReadOnly}
            >
              <FormControlLabel
                id="receive_Radio_replyImmediate"
                value={t("ReplyImmediate")}
                control={<Radio size="small" />}
                label={t("ReplyImmediate")}
                disabled={isReadOnly}
              />
              <FormControlLabel
                id="receive_Radio_replyAfterCompletion"
                value={t("ReplyAfterCompletion")}
                control={<Radio size="small" />}
                label={t("ReplyAfterCompletion")}
                disabled={isReadOnly}
              />
              {invocationType == t("ReplyAfterCompletion") ? (
                <Select
                  onChange={(e) => OnReplySelect(e)}
                  className="receive_select"
                  value={chosenReply}
                  MenuProps={{
                    anchorOrigin: {
                      vertical: "bottom",
                      horizontal: "left",
                    },
                    transformOrigin: {
                      vertical: "top",
                      horizontal: "left",
                    },
                    getContentAnchorEl: null,
                  }}
                  disabled={isReadOnly}
                >
                  {replyActivities.map((reply) => {
                    return (
                      <MenuItem
                        id="replyType_activitiesList"
                        value={reply.activityName}
                      >
                        <p id="reply_activityName">{reply.activityName}</p>
                      </MenuItem>
                    );
                  })}
                </Select>
              ) : null}
            </RadioGroup>
          </FormControl>
        </div>
      </div>
      <TableRequestConsumer isReadOnly={isReadOnly} />
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

export default connect(mapStateToProps, null)(RequestConsumerSoap);
