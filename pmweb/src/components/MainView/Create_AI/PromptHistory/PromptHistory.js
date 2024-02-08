import React from "react";
import "./prompthistory.css";
import { Grid, Typography } from "@mui/material";
import { makeStyles } from "@material-ui/core";
import { useTranslation } from "react-i18next";
import { useDispatch, useSelector } from "react-redux";
import { APP_HEADER_HEIGHT } from "../../../../Constants/appConstants";
import {
  promptHistoryValue,
  setSelectedGeneratedPreview,
} from "../../../../redux-store/slices/MarvinPromtHistorySlice";
import { convertToDbDateFormat } from "../../../../UI/DatePicker/global/helperFunction";
import { convertToArabicDateTime } from "../../../../UI/DatePicker/DateInternalization";
import { LightTooltip } from "../../../../UI/StyledTooltip";
const useStyles = makeStyles(() => ({
  promptHistoryContainer: {
    padding: "5px",
    height: (props) =>
      `calc(${props.windowInnerHeight}px - ${APP_HEADER_HEIGHT} - 200px)`,
    overflowY: "auto",
    "&::-webkit-scrollbar": {
      backgroundColor: "transparent",
      width: "0.375rem",
      height: "1.125rem",
    },
    "&::-webkit-scrollbar-thumb": {
      backgroundColor: "transparent",
      borderRadius: "0.313rem",
    },

    "&:hover::-webkit-scrollbar": {
      overflowY: "visible",
      width: "0.375rem",
      height: "1.125rem",
    },
    "&:hover::-webkit-scrollbar-thumb": {
      background: "#8c8c8c 0% 0% no-repeat padding-box",
      borderRadius: "0.313rem",
    },
  },
  processnametitle: {
    color: "#000",
    fontFamily: "Open Sans",
    fontSize: "12px",
    fontStyle: "normal",
    fontWeight: 400,
  },
  categoryDetails: {
    color: "#606060",
    fontFamily: "Open Sans",
    fontSize: "10px",
    fontStyle: "normal",
    fontWeight: 600,
  },
  timestamp: {
    color: "#606060",
    fontFamily: "Open Sans",
    fontSize: "12px",
    fontStyle: "normal",
    fontWeight: 600,
    direction: (props) => props.direction,
  },
}));
const PromtHistory = ({ marvinGeneratedProcess }) => {
  const { selectedGeneratedPreview, isLoadingPreviewProcessData } =
    useSelector(promptHistoryValue);
  const { templates } = marvinGeneratedProcess;
  let { t } = useTranslation();
  const dispatch = useDispatch();
  const direction = `${t("HTML_DIR")}`;
  const windowInnerHeight = useSelector(
    (state) => state.setWindowInnerHeight.windowInnerHeight
  );
  const classes = useStyles({ direction, windowInnerHeight });
  const getSegments = (segments) => {
    let str = "";
    if (segments.length > 0) {
      str =
        str +
        segments.map((segment, index) => {
          return `/Step ${index + 1} - ${segment.name}`;
        });
    }
    return str;
  };
  const getCategoryAndGeography = (template) => {
    let str = `(${template?.name}`;

    if (template?.inputParams?.category) {
      str = str + ` / ${template?.inputParams?.category}`;
    }
    if (template?.inputParams?.geography) {
      str = str + ` / ${template?.inputParams?.geography}`;
    }
    str = str + " )";
    return str;
  };
  const handleSelectProcessPreview = (preview) => {
    dispatch(setSelectedGeneratedPreview(preview));
  };
  const getTimeFunc = (timeStamp) => {
    let date = new Date(timeStamp);
    let newDate = convertToDbDateFormat(date, "longDate");
    return convertToArabicDateTime(newDate);
  };

  const getTitle = (template) => {
    const title =
      template?.name + getSegments(template?.templateIdentifier || []);
    if (title.length > 120) {
      return title.substring(0, 120) + "...";
    }
    return title;
  };

  return (
    <div style={{ marginBottom: "20px" }}>
      <div
        className="processNameContainer"
        style={{ border: "1px solid lightgrey" }}
      >
        <h6 className="processNamePromptHistory">
          {marvinGeneratedProcess?.name}
        </h6>
      </div>
      <div className="timeline-container">
        <div className="timeline-item-first">
          <div
            className="timeline-start-dot"
            style={{ marginTop: "-55px" }}
          ></div>
        </div>
      </div>
      {templates.length > 0 &&
        templates.map((template, index) => (
          <div className="timeline-container" key={index}>
            <div className="timeline-item">
              <div className="timeline-dot"></div>
              <div className="timeline-card" style={{ marginTop: "15px" }}>
                <div
                  className={
                    selectedGeneratedPreview?.id === template.id
                      ? "timeline-content-selected"
                      : "timeline-content"
                  }
                  onClick={
                    selectedGeneratedPreview?.id === template.id ||
                    isLoadingPreviewProcessData
                      ? null
                      : () => handleSelectProcessPreview(template)
                  }
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      if (
                        selectedGeneratedPreview?.id !== template.id ||
                        isLoadingPreviewProcessData
                      ) {
                        handleSelectProcessPreview(template);
                      }
                    }
                  }}
                >
                  {/*} <h2>{event?.title || ""}</h2>
                  <p>{event?.description || ""}</p>
        <span className="timeline-date">{event?.date || ""}</span>*/}
                  <Grid container direction={"column"} spacing={1}>
                    <Grid item>
                      <LightTooltip
                        arrow={true}
                        enterDelay={500}
                        placement="top-start"
                        title={
                          template?.name +
                          getSegments(template?.templateIdentifier || [])
                        }
                      >
                        <Typography className={classes.processnametitle}>
                          {getTitle(template)}
                        </Typography>
                      </LightTooltip>
                    </Grid>
                    <Grid item>
                      <Typography className={classes.categoryDetails}>
                        {getCategoryAndGeography(template)}
                      </Typography>
                    </Grid>
                    <Grid
                      item
                      style={{ marginTop: "4px", marginInlineEnd: "auto" }}
                    >
                      <Typography className={classes.timestamp}>
                        {getTimeFunc(template.updatedAt)}
                      </Typography>
                    </Grid>
                  </Grid>
                </div>
              </div>
            </div>
          </div>
        ))}
    </div>
  );
};

export default PromtHistory;
