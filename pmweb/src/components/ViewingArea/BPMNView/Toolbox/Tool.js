// #BugID - 122812
// #BugDescription - Handled the scroll bar issue on bpmn view for global task template list

import React, { useEffect, createRef } from "react";
import Tooltip from "@material-ui/core/Tooltip";
import { withStyles } from "@material-ui/core/styles";
import { addVertexFromToolbox } from "../../../../utility/bpmnView/addVertexFromToolbox";
import { useTranslation } from "react-i18next";
import "./Tool.css";
import { useDispatch } from "react-redux";

function Tool(props) {
  let { t } = useTranslation();
  const dispatch = useDispatch();
  const toolRef = createRef(null);
  const ToolDescription = withStyles((theme) => ({
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

  let onDragStart = (e, actType, actSubType, boolean) => {
    e.dataTransfer.setData("iActivityID", actType);
    e.dataTransfer.setData("iSubActivityID", actSubType);
    e.dataTransfer.setData("bFromToolbox", boolean);
  };

  // code updated on 17 Nov 2022 for BugId 118748
  useEffect(() => {
    if (props.graph !== null) {
      addVertexFromToolbox(props, toolRef.current, t, dispatch);
    } else {
      toolRef.current.innerHTML = `<img src=${props.icon} alt="" className="w100" />`;
    }
  }, [props.expandedView]);

  if (!props.expandedView) {
    return props.showToolTip ? (
      <ToolDescription arrow title={props.desc} placement="right">
        <div
          className="oneToolBox"
          draggable
          onDragStart={(e) =>
            onDragStart(e, props.activityType, props.activitySubType, true)
          }
          style={{ cursor: "grab" }}
          tabIndex={0}
        >
          <div className="toolIcon" ref={toolRef}></div>
          <p
            style={{
              fontSize: "12px",
              overflow: "hidden",
              textOverflow: "ellipsis",
              wordWrap: "normal",
              maxWidth: "190px",
            }}
          >
            {props.title}
          </p>
        </div>
      </ToolDescription>
    ) : (
      <div
        className="oneToolBox"
        draggable
        onDragStart={(e) =>
          onDragStart(e, props.activityType, props.activitySubType, true)
        }
        style={{ cursor: "grab" }}
        tabIndex={0}
      >
        <div className="toolIcon" ref={toolRef}></div>
        <p
          style={{
            fontSize: "12px",
            overflow: "hidden",
            textOverflow: "ellipsis",
            wordWrap: "normal",
            maxWidth: "190px",
          }}
        >
          {props.title}
        </p>
      </div>
    );
  } else
    return (
      <div
        className="oneToolBox"
        draggable
        onDragStart={(e) =>
          onDragStart(e, props.activityType, props.activitySubType, true)
        }
        style={{ cursor: "grab" }}
        tabIndex={0}
      >
        <div className="toolIcon" ref={toolRef}></div>
        <p
          style={{
            fontSize: "12px",
            overflow: "hidden",
            textOverflow: "ellipsis",
          }}
        >
          {props.title}
        </p>
      </div>
    );
}

export default Tool;
