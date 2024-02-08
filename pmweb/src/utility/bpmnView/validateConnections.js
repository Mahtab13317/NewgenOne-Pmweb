import { activityType_label } from "../../Constants/appConstants";
import {
  startVertex,
  endVertex,
  limitOutgoingEdges,
  limitIncomingEdges,
  style,
} from "../../Constants/bpmnView";
import { checkStyle } from "../CommonFunctionCall/CommonFunctionCall";

export const validateConnections = (source, target, t) => {
  if (!target || !source) {
    return false;
  } else {
    // modified on 06/02/2024 for BugId 143220
    /*let outgoingEdges = source?.edges
      ? source.edges.filter(
          (item) => item.source.id === source.id && item.connType === "D"
        )
      : [];
    let incomingEdges = target?.edges
      ? target.edges.filter(
          (item) => item.target.id === target.id && item.connType === "D"
        )
      : [];
    // code added on 14 Dec 2022 for BugId 116294
    let isAlreadyConnected = source?.edges
      ? source.edges.filter(
          (item) => item.target?.id === target?.id && item.connType === "D"
        )?.length > 0
        ? true
        : false
      : false; */
    let sourceEdges =
      source?.style === style.expandedEmbeddedProcess
        ? source?.embeddedCellEdges
          ? [...source?.embeddedCellEdges]
          : []
        : source?.edges
        ? [...source.edges]
        : [];
    let targetEdges =
      target?.style === style.expandedEmbeddedProcess
        ? target?.embeddedCellEdges
          ? [...target.embeddedCellEdges]
          : []
        : target?.edges
        ? [...target?.edges]
        : [];
    let sourceId =
      source?.style === style.expandedEmbeddedProcess
        ? source.embeddedId
        : source.id;
    let targetId =
      target?.style === style.expandedEmbeddedProcess
        ? target.embeddedId
        : target.id;
    let outgoingEdges = sourceEdges
      ? sourceEdges.filter(
          (item) => item.source.id === sourceId && item.connType === "D"
        )
      : [];
    let incomingEdges = targetEdges
      ? targetEdges.filter(
          (item) => item.target.id === targetId && item.connType === "D"
        )
      : [];
    // code added on 14 Dec 2022 for BugId 116294
    let isAlreadyConnected = sourceEdges
      ? sourceEdges.filter(
          (item) => item.target?.id === targetId && item.connType === "D"
        )?.length > 0
        ? true
        : false
      : false;
    // till here BugId 143220

    // code added on 14 Dec 2022 for BugId 116294
    if (isAlreadyConnected) {
      return {
        isValid: false,
        msg: `${t("errorMessage.alreadyConnected")}`,
      };
    }
    //to check if incoming edges are allowed on target
    else if (checkStyle(startVertex, target.style)) {
      return {
        isValid: false,
        msg: `${
          t(activityType_label[target.style]) +
          " " +
          t("errorMessage.noIncomingConnection")
        }`,
      };
    }
    //to check if outgoing edges are allowed on source
    else if (checkStyle(endVertex, source.style)) {
      return {
        isValid: false,
        msg: `${
          t(activityType_label[source.style]) +
          " " +
          t("errorMessage.noOutgoingConnection")
        }`,
      };
    }
    //to check the limit on outgoing edges of source
    else if (
      checkStyle(limitOutgoingEdges, source.style) &&
      outgoingEdges.length === 1
    ) {
      return {
        isValid: false,
        msg: `${
          t("errorMessage.limitOutgoingConnection") +
          " " +
          t(activityType_label[source.style])
        }`,
      };
    }
    //to check the limit on incoming edges of target
    else if (
      checkStyle(limitIncomingEdges, target.style) &&
      incomingEdges.length === 1
    ) {
      return {
        isValid: false,
        msg: `${
          t("errorMessage.limitIncomingConnection") +
          " " +
          t(activityType_label[target.style])
        }`,
      };
    } else
      return {
        isValid: true,
        msg: ``,
      };
  }
};
