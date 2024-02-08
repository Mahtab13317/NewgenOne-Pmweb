import React, { useState, useEffect } from "react";
import { Card, CardContent, Grid } from "@material-ui/core";
import "./PinnedProcessTile.css";
import { tileProcess } from "../../utility/HomeProcessView/tileProcess";
import processIcon from "../../assets/HomePage/HS_Process.svg";
import { useTranslation } from "react-i18next";
import { useHistory } from "react-router-dom";
import { connect } from "react-redux";
import * as actionCreators from "../../redux-store/actions/processView/actions.js";
import { Draggable } from "react-beautiful-dnd";
import pinnedIcon from "../../assets/abstractView/Icons/PinnedIcon.svg";
import pinIconBlue from "../../../src/assets/abstractView/Icons/ActiveStatePin.svg";
import { LightTooltip } from "../../UI/StyledTooltip";
import { RTL_DIRECTION } from "../../Constants/appConstants";
import { convertToArabicDateTime } from "../DatePicker/DateInternalization";
import { shortenRuleStatement } from "../../utility/CommonFunctionCall/CommonFunctionCall";

function PinnedProcessTile(props) {
  let { t } = useTranslation();
  const { index } = props;
  const [pinnedImageBlue, setPinnedImageBlue] = useState(false);
  var processType = t(tileProcess(props.processType)[1]); //used for convertion of type
  var backgroundColor = tileProcess(props.processType)[4]; //used fpr the color of processType

  const history = useHistory();

  const clickCard = () => {
    props.openProcessClick(
      props.id,
      props.projectName,
      props.processType,
      props.versionNo,
      props.name
    );
    props.openTemplate(null, null, false);
    history.push("/process");
  };
  const direction = `${t("HTML_DIR")}`;

  useEffect(() => {
    let inp = document.getElementById(`${props.id}`);
    inp.addEventListener("keydown", function (e) {
      if (e.keyCode === 13) {
        clickCard();
      }
    });
  });

  return (
    <div>
      {/* Draggable makes the individual pinned tile draggable. */}
      <Draggable draggableId={props.name} key={props.name} index={index}>
        {(provided) => (
          <Card
            variant="outlined"
            className="cardPinned"
            id={props.id}
            onClick={clickCard}
            {...provided.draggableProps}
            {...provided.dragHandleProps}
            ref={provided.innerRef}
          >
            <CardContent className="pinnedCardContent">
              <div className="row processNameDiv" style={{ width: "100%" }}>
                <div style={{ display: "flex", width: "100%" }}>
                  <div
                    className="logoDiv"
                    style={{
                      marginRight: direction === RTL_DIRECTION ? "3px" : null,
                    }}
                  >
                    {/* Changes made to solve Bug 124292  */}
                    <img
                      src={processIcon}
                      className="fileLogo"
                      alt="Process Icon"
                      style={{
                        transform:
                          direction === RTL_DIRECTION ? "scaleX(-1)" : null,
                      }}
                    />
                  </div>

                  <div className="titleDiv">
                    <p className="titlePinned">
                      <Grid
                        container
                        xs={12}
                        spacing={1}
                        justifyContent="space-between"
                      >
                        <Grid item xs={8}>
                          {/* added on 14/10/2023 for bug_id: 139182 */}
                          {/* <span className="titlePinnedName">{props.name}</span> */}
                          <LightTooltip
                            placement="bottom"
                            title={props.name}
                            arrow={true}
                          >
                            <div className="titlePinnedName">
                              {shortenRuleStatement(props.name, 12)}
                            </div>
                          </LightTooltip>
                        </Grid>
                        <Grid item xs={2}>
                          <span className="version">
                            {t("v")}
                            {props.versionNo}
                          </span>
                        </Grid>
                        <Grid item xs={2}>
                          <span className="pinIcon">
                            <LightTooltip
                              id="pinnedProcess_Tooltip"
                              arrow={true}
                              enterDelay={500}
                              placement="bottom-start"
                              title={t("UnpinProcess")}
                            >
                              {/* Changes made to solve Bug 133535 */}
                              <img
                                className="fileLogo"
                                onClick={props.handleUnpin}
                                src={pinnedImageBlue ? pinIconBlue : pinnedIcon}
                                onMouseEnter={() => setPinnedImageBlue(true)}
                                onMouseLeave={() => setPinnedImageBlue(false)}
                                id={`pmweb_pinnedProcess_pinIcon_${props.index}`}
                                style={{
                                  color: "#0f7ac9",
                                  width: "1.25rem",
                                  height: "1.25rem",
                                  marginTop: "0px",
                                  transform:
                                    direction === RTL_DIRECTION
                                      ? "scaleX(-1)"
                                      : null,
                                }}
                              />
                            </LightTooltip>
                          </span>
                        </Grid>
                      </Grid>
                    </p>
                    {/* added on 14/10/2023 for bug_id: 139182 */}
                    {/* <p className="processCat">{props.projectName}</p> */}
                    <LightTooltip
                      placement="bottom"
                      title={props.projectName}
                      arrow={true}
                    >
                      <div className="titlePinnedName">
                        {shortenRuleStatement(props.projectName, 12)}
                      </div>
                    </LightTooltip>
                  </div>
                </div>
              </div>
              <div
                className="pinnedProcessAlignment row"
                style={{
                  margin:
                    direction === RTL_DIRECTION
                      ? "0 1.25vw 0.5rem 0"
                      : "0 0 0.5rem 1.25vw",
                  display: "flex",
                  // flexDirection:
                  //   direction === RTL_DIRECTION ? "row-reverse" : "row",
                  justifyContent: direction === RTL_DIRECTION ? "start" : null,
                }}
              >
                <span>
                  <img
                    style={{ height: "0.75rem", width: "0.75rem" }}
                    src={t(tileProcess(props.processType)[0])}
                    alt="Process Status"
                  />
                </span>
                <p className="processStatus">
                  {processType}{" "}
                  {tileProcess(props.processType)[8]
                    ? `(${t("Checked")})`
                    : null}
                </p>
              </div>
              <div
                className="pinnedProcessAlignment row"
                style={{
                  margin:
                    direction === RTL_DIRECTION
                      ? "0 1.25vw 0.5rem 0"
                      : "0 0 0.5rem 1.25vw",
                }}
              >
                <p className="processModification">
                  {/* modified on 27/09/2023 for BugId 136677 */}
                  {/* {t("lastOpened")} {props.accessedDate},{props.accessedTime} */}
                  {t("lastOpened")}{" "}
                  {convertToArabicDateTime(props.accessedDate)}
                  {/* till here BugId 136677 */}
                </p>
              </div>
            </CardContent>
          </Card>
        )}
      </Draggable>
    </div>
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

export default connect(null, mapDispatchToProps)(PinnedProcessTile);
