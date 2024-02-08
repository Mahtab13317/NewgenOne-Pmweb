// Changes made to solve 110715 (Global Requirement section: Buttons not visible while Adding section) and
// 113580 (if the requirements are on project level not on Global level then the message should be different)
// 110720, Global Requirement section: section with lengthy data was not added
// #BugID - 115179
// #BugDescription - Updated functionality for add section for requirement
// #BugID - 117790
// #BugDescription - subsection addition issue has been fixed
// #Date - 31 October 2022
// #BugID - 120877
// #BugDescription - Handled the api call to show the data of section
//Changes made to solve Bug 121464 -Object rights>> Local process mangement and PMweb menu mangement rights are not working correctly
//Changes made to solve Bug 123515 -Process Designer-icons related- UX and UI bugs

import { Button, useMediaQuery, Tooltip } from "@material-ui/core";
import React, { useState, useEffect } from "react";
import styles from "./GlobalRequirementSections.module.css";
import Accordion from "@material-ui/core/Accordion";
import AccordionSummary from "@material-ui/core/AccordionSummary";
import ExpandMoreIcon from "@material-ui/icons/ExpandMore";
import AddIcon from "@material-ui/icons/Add";
import DeleteOutlineIcon from "@material-ui/icons/DeleteOutline";
import emptyStatePic from "../../../../../assets/ProcessView/NoDataExist.svg";
import axios from "axios";
import { connect, useSelector } from "react-redux";
import { v4 as uuidv4 } from "uuid";
import {
  SERVER_URL,
  ENDPOINT_FETCHPROJECTREQUIREMENTS,
  ENDPOINT_ADDPROJECTREQUIREMENTS,
  ENDPOINT_DELETEPROJECTREQUIREMENTS,
  ENDPOINT_EDITPROJECTREQUIREMENTS,
  ADD,
  EDIT,
  DELETE,
  LEVEL1,
  LEVEL2,
  LEVEL3,
  ENDPOINT_MOVEPROJECTREQUIREMENTS,
  headerHeight,
  SPACE,
} from "../../../../../Constants/appConstants";
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";
import EditOutlinedIcon from "@material-ui/icons/Edit";
import { makeStyles } from "@material-ui/core/styles";
import CircularProgress from "@material-ui/core/CircularProgress";
import { useTranslation } from "react-i18next";
import AddNewSectionBox from "./AddNewSectionBoxProject";
import Modal from "../../../../../UI/Modal/Modal";
import EditSectionBox from "./EditNewSectionBox";
import "./index.css";
import { useDispatch } from "react-redux";
import { decode_utf8 } from "../../../../../utility/UTF8EncodeDecoder";
import { setToastDataFunc } from "../../../../../redux-store/slices/ToastDataHandlerSlice";
import { EditIcon } from "../../../../../utility/AllImages/AllImages";

const useStyles = makeStyles({
  hideBorder: {
    "&.MuiAccordion-root:before": {
      display: "none",
    },
  },
});

function GlobalRequirementSections(props) {
  let { t } = useTranslation();
  let dispatch = useDispatch();
  const classes = useStyles();
  const [reqData, setreqData] = useState([]);
  const [showEditBox, setshowEditBox] = useState(false);
  const [spinner, setspinner] = useState(true);
  const [firstLevelTextFieldShow, setfirstLevelTextFieldShow] = useState(false);
  const [sectionToEdit, setsectionToEdit] = useState({});
  const [levelToMap, setlevelToMap] = useState(0);
  const [levelToEdit, setlevelToEdit] = useState();
  const [previousOrderId, setpreviousOrderId] = useState(0);
  const [level1DataOrderId, setlevel1DataOrderId] = useState(null);
  const [level2DataOrderId, setlevel2DataOrderId] = useState(null);

  const smallScreen = useMediaQuery("(max-width: 699px)");
  const windowInnerHeight = useSelector(
    (state) => state.setWindowInnerHeight.windowInnerHeight
  );

  const cancelAddNewSection = () => {
    setshowEditBox(false);
    setfirstLevelTextFieldShow(false);
  };

  function sortByKey(array, key) {
    return array?.sort(function (a, b) {
      var x = a[key];
      var y = b[key];
      return x < y ? -1 : x > y ? 1 : 0;
    });
  }

  useEffect(() => {
    async function getSections() {
      const res = await axios.get(
        SERVER_URL +
          ENDPOINT_FETCHPROJECTREQUIREMENTS +
          `/${props.selectedProjectId}/L`
      );
      if (res.status === 200) {
        const data = await res.data.Section;
        setspinner(false);
        data?.forEach((item) => {
          if (item.hasOwnProperty("SectionInner")) {
            item.SectionInner = sortByKey(item.SectionInner, "OrderId");
            if (item.SectionInner.hasOwnProperty("SectionInner2")) {
              item.SectionInner.SectionInner2 = sortByKey(
                item.SectionInner.SectionInner2,
                "OrderId"
              );
            }
          }
        });
        setreqData(sortByKey(data, "OrderId"));
      }
    }
    getSections();
  }, []);

  const addSection = (e, levelToAdd, level1Data, level2Data) => {
    e.stopPropagation();
    setfirstLevelTextFieldShow(true);
    setlevelToMap(levelToAdd);
    if (levelToAdd === LEVEL1) {
      setpreviousOrderId(reqData.length);
    } else if (levelToAdd === LEVEL2) {
      if (level1Data.hasOwnProperty("SectionInner"))
        setpreviousOrderId(level1Data.SectionInner.length);
      else setpreviousOrderId(0);
      setlevel1DataOrderId(level1Data.OrderId);
    } else {
      if (level2Data.hasOwnProperty("SectionInner2"))
        setpreviousOrderId(level2Data.SectionInner2.length);
      else setpreviousOrderId(0);
      setlevel1DataOrderId(level1Data.OrderId);
      reqData[level1Data.OrderId - 1].SectionInner.forEach((item, idx) => {
        if (item.OrderId === level2Data.OrderId) {
          setlevel2DataOrderId(idx);
        }
      });
    }
  };

  const deleteClicked = async (
    e,
    levelToDelete,
    level1Data,
    level2Data,
    level3Data
  ) => {
    e.stopPropagation();
    let temp = JSON.parse(JSON.stringify(reqData));
    let toDeleteSection;
    if (levelToDelete === LEVEL2) {
      temp.forEach((item) => {
        if (item.OrderId === level1Data.OrderId) {
          toDeleteSection = item;
          temp.splice(temp.indexOf(item), 1);
        }
      });
    } else if (levelToDelete === LEVEL3) {
      temp[level1Data.OrderId - 1].SectionInner.forEach((item) => {
        if (item.OrderId === level2Data.OrderId) {
          toDeleteSection = item;
          temp[level1Data.OrderId - 1].SectionInner.splice(
            temp[level1Data.OrderId - 1].SectionInner.indexOf(item),
            1
          );
        }
      });
    } else {
      temp[level1Data.OrderId - 1].SectionInner[
        level2Data.OrderId - 1
      ].SectionInner2.forEach((item) => {
        if (item.OrderId === level3Data.OrderId) {
          toDeleteSection = item;
          temp[level1Data.OrderId - 1].SectionInner[
            level2Data.OrderId - 1
          ].SectionInner2.splice(
            temp[level1Data.OrderId - 1].SectionInner[
              level2Data.OrderId - 1
            ].SectionInner2.indexOf(item),
            1
          );
        }
      });
    }

    const flagForApi = await commonApiCalls(DELETE, toDeleteSection);
    if (flagForApi) {
      setreqData(arrangeData(temp));
    } else return;
  };

  const editClicked = (e, levelToEdit, level1Data, level2Data, level3Data) => {
    e.stopPropagation();
    setshowEditBox(true);
    setlevelToEdit(levelToEdit);
    if (levelToEdit === LEVEL2) {
      setpreviousOrderId(level1Data.OrderId);
      setsectionToEdit(level1Data);
    } else if (levelToEdit === LEVEL3) {
      setsectionToEdit(level2Data);
      setpreviousOrderId(level2Data.OrderId);
      setlevel1DataOrderId(level1Data.OrderId);
    } else {
      setsectionToEdit(level3Data);
      setpreviousOrderId(level3Data.OrderId);
      setlevel1DataOrderId(level1Data.OrderId);
      reqData[level1Data.OrderId - 1].SectionInner.forEach((item, idx) => {
        if (item.OrderId === level2Data.OrderId) {
          setlevel2DataOrderId(idx);
        }
      });
    }
  };

  const editMapToData = async (data) => {
    let temp = JSON.parse(JSON.stringify(reqData));
    let toEditSection,
      isNameEdited = false;
    if (levelToEdit === LEVEL2) {
      temp.forEach((item) => {
        if (item.OrderId === previousOrderId) {
          toEditSection = item;
          item.OrderId = data.OrderId;
          /* code edited on 12 July 2023 for BugId 131451 - oracle>> User is getting the 
          error in modifying the requirement and getting incorrect error */
          if (item.SectionName !== data.SectionName) {
            isNameEdited = true;
          }
          item.SectionName = data.SectionName;
          item.Description = data.Description;
        }
      });
    } else if (levelToEdit === LEVEL3) {
      temp[level1DataOrderId - 1].SectionInner.forEach((item) => {
        if (item.OrderId === previousOrderId) {
          toEditSection = item;
          item.OrderId = data.OrderId;
          /* code edited on 12 July 2023 for BugId 131451 - oracle>> User is getting the 
          error in modifying the requirement and getting incorrect error */
          if (item.SectionName !== data.SectionName) {
            isNameEdited = true;
          }
          item.SectionName = data.SectionName;
          item.Description = data.Description;
        }
      });
    } else {
      temp[level1DataOrderId - 1].SectionInner[
        level2DataOrderId
      ].SectionInner2.forEach((item) => {
        if (item.OrderId === previousOrderId) {
          toEditSection = item;
          item.OrderId = data.OrderId;
          /* code edited on 12 July 2023 for BugId 131451 - oracle>> User is getting the 
          error in modifying the requirement and getting incorrect error */
          if (item.SectionName !== data.SectionName) {
            isNameEdited = true;
          }
          item.SectionName = data.SectionName;
          item.Description = data.Description;
        }
      });
    }
    /* code edited on 12 July 2023 for BugId 131451 - oracle>> User is getting the 
    error in modifying the requirement and getting incorrect error */
    const flagForApi = await commonApiCalls(
      EDIT,
      toEditSection,
      null,
      isNameEdited
    );
    if (flagForApi) setreqData(temp);
    else return;
  };

  const mapNewSection = async (data) => {
    let temp = JSON.parse(JSON.stringify(reqData));
    if (levelToMap === LEVEL1) {
      const flagForApi = await commonApiCalls(ADD, data, "0");
      if (flagForApi) {
        /* code edited on 12 July 2023 for BugId 131451 - oracle>> User is getting the 
          error in modifying the requirement and getting incorrect error */
        setpreviousOrderId(+data.OrderId);
        temp.push({
          ...data,
          SectionId: flagForApi.SectionId,
        });
        setreqData(temp);
      } else return;
    } else if (levelToMap === LEVEL2) {
      const flagForApi = await commonApiCalls(
        ADD,
        data,
        temp[level1DataOrderId - 1].SectionId
      );
      if (flagForApi) {
        /* code edited on 12 July 2023 for BugId 131451 - oracle>> User is getting the 
          error in modifying the requirement and getting incorrect error */
        setpreviousOrderId(+data.OrderId);
        let dataToPush = { ...data, SectionId: flagForApi.SectionId };
        if (temp[level1DataOrderId - 1].hasOwnProperty("SectionInner")) {
          temp[level1DataOrderId - 1].SectionInner.push(dataToPush);
        } else temp[level1DataOrderId - 1].SectionInner = [dataToPush];
        setreqData(temp);
      } else return;
    } else {
      const flagForApi = await commonApiCalls(
        ADD,
        data,
        temp[level1DataOrderId - 1].SectionInner[level2DataOrderId].SectionId
      );
      if (flagForApi) {
        /* code edited on 12 July 2023 for BugId 131451 - oracle>> User is getting the 
          error in modifying the requirement and getting incorrect error */
        setpreviousOrderId(+data.OrderId);
        let dataToPush = { ...data, SectionId: flagForApi.SectionId };
        if (
          temp[level1DataOrderId - 1].SectionInner[
            level2DataOrderId
          ].hasOwnProperty("SectionInner2")
        )
          temp[level1DataOrderId - 1].SectionInner[
            level2DataOrderId
          ].SectionInner2.push(dataToPush);
        else
          temp[level1DataOrderId - 1].SectionInner[
            level2DataOrderId
          ].SectionInner2 = [dataToPush];
        setreqData(temp);
      } else return;
    }
  };

  const arrangeData = (data) => {
    data.forEach((item, index) => {
      item.OrderId = (++index).toString();
      if (item.hasOwnProperty("SectionInner")) {
        item.SectionInner.forEach((item2, index) => {
          item2.OrderId = (++index).toString();
          if (item2.hasOwnProperty("SectionInner2")) {
            item2.SectionInner2.forEach((item3, index) => {
              item3.OrderId = (++index).toString();
            });
          }
        });
      }
    });

    return data;
  };

  const dragEndHandler = async (result) => {
    if (!result.destination) {
      return;
    }

    let temp = JSON.parse(JSON.stringify(reqData));
    let copyReqData = JSON.parse(JSON.stringify(reqData));
    let payload;
    if (result.type === LEVEL1) {
      payload = {
        oldOrderId: temp[result.source.index].OrderId,
        sectionOrderId: temp[result.destination.index].OrderId,
        sectionId: temp[result.source.index].SectionId,
        parentId: "0",
      };
      const [removed] = temp.splice(result.source.index, 1);
      temp.splice(result.destination.index, 0, removed);
      temp.forEach((section, index) => {
        section.OrderId = ++index + "";
      });
    } else if (result.type === LEVEL2) {
      let nest = result.draggableId.split(" ");

      payload = {
        oldOrderId: temp[nest[0] - 1].SectionInner[result.source.index].OrderId,
        sectionOrderId:
          temp[nest[0] - 1].SectionInner[result.destination.index].OrderId,
        sectionId:
          temp[nest[0] - 1].SectionInner[result.source.index].SectionId,
        parentId: nest[2],
      };

      const [removed] = temp[nest[0] - 1].SectionInner.splice(
        result.source.index,
        1
      );
      temp[nest[0] - 1].SectionInner.splice(
        result.destination.index,
        0,
        removed
      );

      temp[nest[0] - 1].SectionInner.forEach((secInner, index) => {
        secInner.OrderId = ++index + "";
      });
    } else {
      let nest = result.draggableId.split(" ");

      payload = {
        oldOrderId:
          temp[nest[0] - 1].SectionInner[nest[1] - 1].SectionInner2[
            result.source.index
          ].OrderId,
        sectionOrderId:
          temp[nest[0] - 1].SectionInner[nest[1] - 1].SectionInner2[
            result.destination.index
          ].OrderId,
        sectionId:
          temp[nest[0] - 1].SectionInner[nest[1] - 1].SectionInner2[
            result.source.index
          ].SectionId,
        parentId: nest[3],
      };

      const [removed] = temp[nest[0] - 1].SectionInner[
        nest[1] - 1
      ].SectionInner2.splice(result.source.index, 1);
      temp[nest[0] - 1].SectionInner[nest[1] - 1].SectionInner2.splice(
        result.destination.index,
        0,
        removed
      );

      temp[nest[0] - 1].SectionInner[nest[1] - 1].SectionInner2.forEach(
        (secInner2, index) => {
          secInner2.OrderId = ++index + "";
        }
      );
    }

    const finalPayload = {
      projectId: props.selectedProjectId,
      m_arrSectionInfo: [payload],
    };
    setreqData(temp);
    const res = await axios.post(
      SERVER_URL + ENDPOINT_MOVEPROJECTREQUIREMENTS,
      finalPayload
    );

    if (res.status === 200) {
      return;
    } else setreqData(copyReqData);
  };

  const commonApiCalls = async (method, data, parentId, isNameEdited) => {
    let isSameSectionPresent = false;
    /* code edited on 12 July 2023 for BugId 131451 - oracle>> User is getting the 
    error in modifying the requirement and getting incorrect error */
    if (method !== DELETE) {
      for (let i of reqData) {
        if (method === ADD) {
          if (i.SectionName === data.SectionName) {
            isSameSectionPresent = true;
            break;
          }
        } else if (method === EDIT) {
          if (isNameEdited && i.SectionName === data.SectionName) {
            isSameSectionPresent = true;
            break;
          }
        }
      }
    }
    if (isSameSectionPresent) {
      dispatch(
        setToastDataFunc({
          message: t("SectionWithThisNameAlreadyExists"),
          severity: "error",
          open: true,
        })
      );
    } else {
      if (method === ADD) {
        const payload = {
          projectId: props.selectedProjectId,
          m_arrSectionInfo: [
            {
              sectionName: data.SectionName,
              sectionDesc: data.Description,
              sectionOrderId: data.OrderId,
              m_bExclude: false,
              parentId: parentId,
            },
          ],
        };
        const res = await axios.post(
          SERVER_URL + ENDPOINT_ADDPROJECTREQUIREMENTS,
          payload
        );

        const resData = await res.data;
        if (resData?.Status === 0) return resData;
        else return false;
      } else if (method === DELETE) {
        const payload = {
          projectId: props.selectedProjectId,
          m_arrSectionInfo: [
            {
              sectionName: data.SectionName,
              sectionId: data.SectionId,
            },
          ],
        };
        const res = await axios.post(
          SERVER_URL + ENDPOINT_DELETEPROJECTREQUIREMENTS,
          payload
        );
        const resData = await res.data;
        if (resData.Status === 0) return true;
        else return false;
      } else if (method === EDIT) {
        const payload = {
          projectId: props.selectedProjectId,
          m_arrSectionInfo: [
            {
              sectionName: data.SectionName,
              sectionDesc: data.Description,
              sectionOrderId: data.OrderId,
              sectionId: data.SectionId,
              m_bExclude: false,
            },
          ],
        };

        const res = await axios.post(
          SERVER_URL + ENDPOINT_EDITPROJECTREQUIREMENTS,
          payload
        );
        const resData = await res.data;
        if (resData.Status === 0) return true;
        else return false;
      }
    }
  };

  const handleKeyAddSection = (e, levelToAdd, level1Data, level2Data) => {
    if (e.keyCode === 13) {
      addSection(e, levelToAdd, level1Data, level2Data);
      e.stopPropagation();
    }
  };

  const handleKeyEdit = (
    e,
    levelToEdit,
    level1Data,
    level2Data,
    level3Data
  ) => {
    if (e.keyCode === 13) {
      editClicked(e, levelToEdit, level1Data, level2Data, level3Data);
      e.stopPropagation();
    }
  };

  const handleKeyDelete = (
    e,
    levelToDelete,
    level1Data,
    level2Data,
    level3Data
  ) => {
    if (e.keyCode === 13) {
      deleteClicked(e, levelToDelete, level1Data, level2Data, level3Data);
      e.stopPropagation();
    }
  };

  return (
    /*code updated on 21 September 2022 for BugId 114557*/
    <div
      className={styles.page}
      style={{
        width: "98%",
        height: `calc(${windowInnerHeight}px - ${headerHeight} - 9.5rem)`,
        margin: "1rem 1vw",
      }}
    >
      <div className={styles.headingProjectLevel}>
        <div className={styles.headingBox}>
          <p className={styles.headingText}>
            {t("project") + SPACE + t("requirementsSection")}
          </p>
          <p className={styles.headingInfo}>
            {t("requirementSectionSubHeading") + SPACE + t("subHeading2")}
          </p>
        </div>
        <div>
          <Button
            className={styles.addSectionButton}
            onClick={(e) => addSection(e, LEVEL1)}
            id="pmweb_GlobalReqProjectLevel_add_section"
            tabIndex={0}
            onKeyDown={(e) => handleKeyAddSection(e, LEVEL1)}
            disabled={props?.selectedProjectRights?.M === "N" ? true : false}
          >
            <p className={styles.buttonText}>
              {t("add")} {t("section")}
            </p>
          </Button>
        </div>
      </div>
      {spinner ? (
        <CircularProgress
          style={{ marginTop: "30vh", marginInlineStart: "40%" }}
        />
      ) : (
        <>
          {reqData?.length !== 0 ? (
            <div
              className={styles.body}
              style={{
                width: "100%",
                height: smallScreen
                  ? null
                  : `calc(${windowInnerHeight}px - ${headerHeight} - 18rem)`,
                maxHeight: smallScreen ? "5rem" : null,
              }}
            >
              <DragDropContext onDragEnd={dragEndHandler}>
                <Droppable droppableId="droppable" type={LEVEL1}>
                  {(provided, snapshot) => (
                    <div
                      {...provided.droppableProps}
                      ref={provided.innerRef}
                      style={{
                        zIndex: 0,
                      }}
                    >
                      {reqData?.map((data, index) => {
                        return (
                          <div
                            style={{
                              display: "flex",
                              flexDirection: "row",
                              justifyContent: "flex-start",
                            }}
                            id={`pmweb_GlobalReqProjectLevel_${index}`}
                            tabIndex={-1}
                          >
                            <Draggable
                              key={data.OrderId}
                              draggableId={data.OrderId}
                              index={index}
                              demo={++index}
                            >
                              {(provided, snapshot) => (
                                <div
                                  ref={provided.innerRef}
                                  {...provided.draggableProps}
                                  {...provided.dragHandleProps}
                                  tabIndex={-1}
                                  style={{ width: "98.75%" }}
                                >
                                  <Accordion
                                    className={`${classes.hideBorder} globalSection`}
                                  >
                                    <AccordionSummary
                                      className={styles.accordianOuter}
                                      style={{
                                        flexDirection: "row-reverse",
                                        alignItems: "start",
                                      }}
                                      expandIcon={
                                        <ExpandMoreIcon
                                          id={`pmweb_GlobalReqProjectLevel_expand_1_${index}`}
                                          style={{
                                            color: "var(--button_color)",
                                            width: "1.5rem",
                                            height: "1.75rem",
                                          }}
                                        />
                                      }
                                      aria-controls={`panel1a-content_${uuidv4()}`}
                                      id={`pmweb_GlobalReqProjectLevel_panel1a-header_${index}`}
                                    >
                                      <div className={styles.block1}>
                                        <div
                                          className={styles.iconsandtextBox}
                                          style={{
                                            width: "98%",
                                            padding: "0",
                                          }}
                                        >
                                          <div
                                            style={{
                                              display: "flex",
                                              flexDirection: "row",
                                              gap: "0.5vw",
                                            }}
                                          >
                                            <p
                                              id={`pmweb_GlobalReqProjectLevel_orderId_1_${index}`}
                                              style={{
                                                padding: "0px 0 0 2px",
                                                color: "var(--button_color)",
                                                fontSize:
                                                  "var(--subtitle_text_font_size)",
                                                fontWeight: "600",
                                                fontFamily:
                                                  "var(--font_family)",
                                                borderRight: "none",
                                              }}
                                            >
                                              {data.OrderId + "."}
                                            </p>
                                            <p
                                              id={`pmweb_GlobalReqProjectLevel_sectionName_1_${index}`}
                                              spellCheck="false"
                                              onClick={(e) =>
                                                e.stopPropagation()
                                              }
                                              // tabIndex={0}
                                              onKeyDown={(e) =>
                                                e.stopPropagation()
                                              }
                                              style={{
                                                fontWeight: "600",
                                                fontSize:
                                                  "var(--subtitle_text_font_size)",
                                                fontFamily:
                                                  "var(--font_family)",
                                                color: "var(--button_color)",
                                                marginTop: "0px",
                                                borderLeft: "none",
                                              }}
                                            >
                                              {data.SectionName}
                                            </p>
                                          </div>

                                          <div
                                            style={{
                                              display: "flex",
                                              alignItems: "center",
                                              gap: "0.5vw",
                                            }}
                                          >
                                            <Tooltip title={t("add")} arrow>
                                              <AddIcon
                                                id={`pmweb_GlobalReqProjectLevel_addIcon1_${index}`}
                                                onClick={(e) =>
                                                  addSection(e, LEVEL2, data)
                                                }
                                                tabIndex={0}
                                                onKeyDown={(e) =>
                                                  handleKeyAddSection(
                                                    e,
                                                    LEVEL2,
                                                    data
                                                  )
                                                }
                                                style={{
                                                  color: "grey",
                                                  height: "1.5rem",
                                                  width: "1.5rem",
                                                  cursor: "pointer",
                                                }}
                                                className="icon"
                                                role="button"
                                                aria-label="addIcon Button"
                                              />
                                            </Tooltip>
                                            <Tooltip title={t("edit")} arrow>
                                              <EditIcon
                                                // id="editIcon_1"
                                                id={`pmweb_GlobalReqProjectLevel_editIcon_${index}`}
                                                style={{
                                                  color: "grey",
                                                  height: "1.5rem",
                                                  width: "1.5rem",
                                                  cursor: "pointer",
                                                }}
                                                onClick={(e) =>
                                                  editClicked(e, LEVEL2, data)
                                                }
                                                onKeyDown={(e) =>
                                                  handleKeyEdit(e, LEVEL2, data)
                                                }
                                                tabIndex={0}
                                                className="icon"
                                                role="button"
                                                aria-label="editIcon Button"
                                              />
                                            </Tooltip>
                                            <Tooltip title={t("delete")} arrow>
                                              <DeleteOutlineIcon
                                                // id="deleteIcon_1"
                                                id={`pmweb_GlobalReqProjectLevel_deleteIcon_${index}`}
                                                onClick={(e) =>
                                                  deleteClicked(e, LEVEL2, data)
                                                }
                                                onKeyDown={(e) =>
                                                  handleKeyDelete(
                                                    e,
                                                    LEVEL2,
                                                    data
                                                  )
                                                }
                                                tabIndex={0}
                                                style={{
                                                  color: "grey",
                                                  height: "1.5rem",
                                                  width: "1.5rem",
                                                  cursor: "pointer",
                                                }}
                                                className="icon"
                                                role="button"
                                                aria-label="deleteIcon Button"
                                              />
                                            </Tooltip>
                                          </div>
                                        </div>
                                        <div
                                          style={{ padding: "0.25rem 1.5vw" }}
                                        >
                                          <p
                                            // id="description_1"
                                            id={`pmweb_GlobalReqProjectLevel_description_1_${index}`}
                                            className="description_list"
                                          >
                                            {" "}
                                            {decode_utf8(data.Description)}
                                          </p>
                                        </div>
                                      </div>
                                    </AccordionSummary>
                                    <Droppable
                                      droppableId={
                                        "droppable1 " +
                                        data.SectionId +
                                        " " +
                                        data.OrderId
                                      }
                                      type={LEVEL2}
                                    >
                                      {(provided, snapshot) => (
                                        <div
                                          {...provided.droppableProps}
                                          ref={provided.innerRef}
                                          style={{
                                            zIndex: 1000,
                                          }}
                                        >
                                          {data.hasOwnProperty(
                                            "SectionInner"
                                          ) &&
                                            data.SectionInner.map(
                                              (subsection, index) => (
                                                <Draggable
                                                  key={subsection.OrderId}
                                                  draggableId={
                                                    data.OrderId +
                                                    " " +
                                                    subsection.OrderId +
                                                    " " +
                                                    data.SectionId
                                                  }
                                                  index={index}
                                                >
                                                  {(provided, snapshot) => (
                                                    <div
                                                      ref={provided.innerRef}
                                                      {...provided.draggableProps}
                                                      {...provided.dragHandleProps}
                                                      tabIndex={-1}
                                                    >
                                                      <Accordion
                                                        className={`${classes.hideBorder} globalSection`}
                                                        defaultExpanded={false}
                                                        style={{
                                                          marginInlineStart:
                                                            "1.75vw",
                                                        }}
                                                      >
                                                        <AccordionSummary
                                                          className={
                                                            styles.accordianInner
                                                          }
                                                          style={{
                                                            flexDirection:
                                                              "row-reverse",
                                                            alignItems: "start",
                                                          }}
                                                          expandIcon={
                                                            <ExpandMoreIcon
                                                              // id="expandIcon_2"
                                                              id={`pmweb_GlobalReqProjectLevel_expand_2_${index}`}
                                                              style={{
                                                                color: "black",
                                                                width: "1.5rem",
                                                                height:
                                                                  "1.75rem",
                                                              }}
                                                            />
                                                          }
                                                          aria-controls={`panel1a-content_${uuidv4()}`}
                                                          id={`pmweb_GlobalReqProjectLevel_panel1a-header_${index}`}
                                                        >
                                                          <div
                                                            style={{
                                                              display: "flex",
                                                              flexDirection:
                                                                "column",
                                                              height: "auto",
                                                              backgroundColor:
                                                                "#F6F6F6",
                                                              maxWidth:
                                                                window.innerWidth >
                                                                1000
                                                                  ? "98.5%"
                                                                  : "95%", //code added on 05-10-2023 for BugId:137985
                                                            }}
                                                          >
                                                            <div
                                                              className={
                                                                styles.iconsandtextBox
                                                              }
                                                              style={{
                                                                width: "100%",
                                                                paddingInlineEnd:
                                                                  "0.5vw",
                                                              }}
                                                            >
                                                              <div
                                                                style={{
                                                                  display:
                                                                    "flex",
                                                                  flexDirection:
                                                                    "row",
                                                                  gap: "0.5vw",
                                                                }}
                                                              >
                                                                <p
                                                                  // id="orderId_2"
                                                                  id={`pmweb_GlobalReqProjectLevel_orderId_2_${index}`}
                                                                  style={{
                                                                    padding:
                                                                      "0px 0 0 2px",
                                                                    color:
                                                                      "#000",
                                                                    fontSize:
                                                                      "var(--subtitle_text_font_size)",
                                                                    fontWeight:
                                                                      "600",
                                                                    fontFamily:
                                                                      "var(--font_family)",
                                                                    borderRight:
                                                                      "none",
                                                                  }}
                                                                >
                                                                  {data.OrderId}
                                                                  {"."}
                                                                  {
                                                                    subsection.OrderId
                                                                  }
                                                                </p>

                                                                <p
                                                                  // id="sectionName_2"
                                                                  id={`pmweb_GlobalReqProjectLevel_sectionName_2_${index}`}
                                                                  style={{
                                                                    fontWeight:
                                                                      "600",
                                                                    fontSize:
                                                                      "var(--subtitle_text_font_size)",
                                                                    fontFamily:
                                                                      "var(--font_family)",
                                                                    color:
                                                                      "#000",
                                                                    marginTop:
                                                                      "0px",
                                                                    borderLeft:
                                                                      "none",
                                                                  }}
                                                                >
                                                                  {
                                                                    subsection.SectionName
                                                                  }
                                                                </p>
                                                              </div>

                                                              <div
                                                                style={{
                                                                  display:
                                                                    "flex",
                                                                  alignItems:
                                                                    "center",
                                                                  gap: "0.5vw",
                                                                }}
                                                              >
                                                                <Tooltip
                                                                  title={t(
                                                                    "add"
                                                                  )}
                                                                  arrow
                                                                >
                                                                  <AddIcon
                                                                    // id="addIcon_2"
                                                                    id={`pmweb_GlobalReqProjectLevel_addIcon2_${index}`}
                                                                    onClick={(
                                                                      e
                                                                    ) =>
                                                                      addSection(
                                                                        e,
                                                                        LEVEL3,
                                                                        data,
                                                                        subsection
                                                                      )
                                                                    }
                                                                    tabIndex={0}
                                                                    onKeyDown={(
                                                                      e
                                                                    ) =>
                                                                      handleKeyAddSection(
                                                                        e,
                                                                        LEVEL3,
                                                                        data,
                                                                        subsection
                                                                      )
                                                                    }
                                                                    style={{
                                                                      color:
                                                                        "grey",
                                                                      height:
                                                                        "1.5rem",
                                                                      width:
                                                                        "1.5rem",
                                                                      cursor:
                                                                        "pointer",
                                                                    }}
                                                                    className="icon"
                                                                  />
                                                                </Tooltip>
                                                                <Tooltip
                                                                  title={t(
                                                                    "edit"
                                                                  )}
                                                                  arrow
                                                                >
                                                                  <EditOutlinedIcon
                                                                    // id="editIcon_2"
                                                                    id={`pmweb_GlobalReqProjectLevel_editIcon2_${index}`}
                                                                    onClick={(
                                                                      e
                                                                    ) =>
                                                                      editClicked(
                                                                        e,
                                                                        LEVEL3,
                                                                        data,
                                                                        subsection
                                                                      )
                                                                    }
                                                                    onKeyDown={(
                                                                      e
                                                                    ) =>
                                                                      handleKeyEdit(
                                                                        e,
                                                                        LEVEL3,
                                                                        data,
                                                                        subsection
                                                                      )
                                                                    }
                                                                    tabIndex={0}
                                                                    style={{
                                                                      color:
                                                                        "grey",
                                                                      height:
                                                                        "1.5rem",
                                                                      width:
                                                                        "1.5rem",
                                                                      cursor:
                                                                        "pointer",
                                                                    }}
                                                                    className="icon"
                                                                  />
                                                                </Tooltip>
                                                                <Tooltip
                                                                  title={t(
                                                                    "delete"
                                                                  )}
                                                                  arrow
                                                                >
                                                                  <DeleteOutlineIcon
                                                                    // id="deleteIcon_2"
                                                                    id={`pmweb_GlobalReqProjectLevel_deleteIcon2_${index}`}
                                                                    onClick={(
                                                                      e
                                                                    ) =>
                                                                      deleteClicked(
                                                                        e,
                                                                        LEVEL3,
                                                                        data,
                                                                        subsection
                                                                      )
                                                                    }
                                                                    onKeyDown={(
                                                                      e
                                                                    ) =>
                                                                      handleKeyDelete(
                                                                        e,
                                                                        LEVEL3,
                                                                        data,
                                                                        subsection
                                                                      )
                                                                    }
                                                                    tabIndex={0}
                                                                    style={{
                                                                      color:
                                                                        "grey",
                                                                      height:
                                                                        "1.5rem",
                                                                      width:
                                                                        "1.5rem",
                                                                      cursor:
                                                                        "pointer",
                                                                    }}
                                                                    className="icon"
                                                                  />
                                                                </Tooltip>
                                                              </div>
                                                            </div>
                                                            <div
                                                              style={{
                                                                padding:
                                                                  "0.25rem 2.25vw",
                                                              }}
                                                            >
                                                              <p
                                                                // id="description_2"
                                                                id={`pmweb_GlobalReqProjectLevel_description_2_${index}`}
                                                                style={{
                                                                  width: "60vw",
                                                                  fontFamily:
                                                                    "var(--font_family)",
                                                                  fontSize:
                                                                    "var(--base_text_font_size)",
                                                                }}
                                                              >
                                                                {decode_utf8(
                                                                  subsection.Description
                                                                )}
                                                              </p>
                                                            </div>
                                                          </div>
                                                        </AccordionSummary>

                                                        <Droppable
                                                          droppableId={
                                                            "droppable2 " +
                                                            subsection.SectionId +
                                                            " " +
                                                            subsection.OrderId
                                                          }
                                                          type={LEVEL3}
                                                        >
                                                          {(
                                                            provided,
                                                            snapshot
                                                          ) => (
                                                            <div
                                                              {...provided.droppableProps}
                                                              ref={
                                                                provided.innerRef
                                                              }
                                                              style={{
                                                                zIndex: 2000,
                                                              }}
                                                            >
                                                              {/* subsections2 */}
                                                              {subsection.hasOwnProperty(
                                                                "SectionInner2"
                                                              ) &&
                                                                subsection
                                                                  .SectionInner2
                                                                  .length !==
                                                                  0 &&
                                                                subsection.SectionInner2.map(
                                                                  (
                                                                    subsections2,
                                                                    index
                                                                  ) => (
                                                                    <Draggable
                                                                      key={
                                                                        subsections2.OrderId
                                                                      }
                                                                      draggableId={
                                                                        data.OrderId +
                                                                        " " +
                                                                        subsection.OrderId +
                                                                        " " +
                                                                        subsections2.OrderId +
                                                                        " " +
                                                                        subsection.SectionId
                                                                      }
                                                                      index={
                                                                        index
                                                                      }
                                                                    >
                                                                      {(
                                                                        provided,
                                                                        snapshot
                                                                      ) => (
                                                                        <div
                                                                          ref={
                                                                            provided.innerRef
                                                                          }
                                                                          {...provided.draggableProps}
                                                                          {...provided.dragHandleProps}
                                                                          tabIndex={
                                                                            -1
                                                                          }
                                                                        >
                                                                          <Accordion
                                                                            className={`${classes.hideBorder} globalSection`}
                                                                            defaultExpanded={
                                                                              false
                                                                            }
                                                                            style={{
                                                                              marginLeft:
                                                                                "3.5vw",
                                                                              marginTop:
                                                                                "0.5rem",
                                                                            }}
                                                                          >
                                                                            <AccordionSummary
                                                                              className={
                                                                                styles.accordianInner2
                                                                              }
                                                                              style={{
                                                                                flexDirection:
                                                                                  "row-reverse",
                                                                                alignItems:
                                                                                  "start",
                                                                              }}
                                                                              aria-controls={`panel1a-content_${uuidv4()}`}
                                                                              id="panel1a-header"
                                                                            >
                                                                              <div
                                                                                style={{
                                                                                  display:
                                                                                    "flex",
                                                                                  flexDirection:
                                                                                    "column",
                                                                                  backgroundColor:
                                                                                    "#F6F6F6",
                                                                                }}
                                                                              >
                                                                                <div
                                                                                  className={
                                                                                    styles.iconsandtextBox
                                                                                  }
                                                                                  style={{
                                                                                    width:
                                                                                      "100%",
                                                                                    paddingInlineEnd:
                                                                                      "0.5vw",
                                                                                  }}
                                                                                >
                                                                                  <div
                                                                                    style={{
                                                                                      display:
                                                                                        "flex",
                                                                                      flexDirection:
                                                                                        "row",
                                                                                      gap: "0.5vw",
                                                                                    }}
                                                                                  >
                                                                                    <p
                                                                                      // id="orderId_3"
                                                                                      id={`pmweb_GlobalReqProjectLevel_orderId_3_${index}`}
                                                                                      style={{
                                                                                        padding:
                                                                                          "0px 0 0 2px",
                                                                                        color:
                                                                                          "#000",
                                                                                        fontSize:
                                                                                          "var(--subtitle_text_font_size)",
                                                                                        fontWeight:
                                                                                          "600",
                                                                                        fontFamily:
                                                                                          "var(--font_family)",
                                                                                        marginTop:
                                                                                          "0px",
                                                                                        borderRight:
                                                                                          "none",
                                                                                      }}
                                                                                    >
                                                                                      {
                                                                                        data.OrderId
                                                                                      }
                                                                                      {
                                                                                        "."
                                                                                      }
                                                                                      {
                                                                                        subsection.OrderId
                                                                                      }
                                                                                      {
                                                                                        "."
                                                                                      }
                                                                                      {
                                                                                        subsections2.OrderId
                                                                                      }
                                                                                    </p>
                                                                                    <p
                                                                                      // id="sectionName_3"
                                                                                      id={`pmweb_GlobalReqProjectLevel_sectionName_3_${index}`}
                                                                                      onClick={(
                                                                                        e
                                                                                      ) =>
                                                                                        e.stopPropagation()
                                                                                      }
                                                                                      tabIndex={
                                                                                        0
                                                                                      }
                                                                                      onKeyDown={(
                                                                                        e
                                                                                      ) =>
                                                                                        e.stopPropagation()
                                                                                      }
                                                                                      style={{
                                                                                        fontSize:
                                                                                          "var(--subtitle_text_font_size)",
                                                                                        fontWeight:
                                                                                          "600",
                                                                                        fontFamily:
                                                                                          "var(--font_family)",
                                                                                        width:
                                                                                          "55vw",
                                                                                        marginLeft:
                                                                                          "0px",
                                                                                        borderLeft:
                                                                                          "none",
                                                                                      }}
                                                                                    >
                                                                                      {
                                                                                        subsections2.SectionName
                                                                                      }
                                                                                    </p>
                                                                                  </div>

                                                                                  <div
                                                                                    style={{
                                                                                      display:
                                                                                        "flex",
                                                                                      alignItems:
                                                                                        "center",
                                                                                      gap: "0.5vw",
                                                                                    }}
                                                                                  >
                                                                                    <Tooltip
                                                                                      title={t(
                                                                                        "Edit"
                                                                                      )}
                                                                                      arrow
                                                                                    >
                                                                                      <EditOutlinedIcon
                                                                                        // id="editIcon_3"
                                                                                        id={`pmweb_GlobalReqProjectLevel_editIcon_3_${index}`}
                                                                                        onClick={(
                                                                                          e
                                                                                        ) =>
                                                                                          editClicked(
                                                                                            e,
                                                                                            "3rd",
                                                                                            data,
                                                                                            subsection,
                                                                                            subsections2
                                                                                          )
                                                                                        }
                                                                                        onKeyDown={(
                                                                                          e
                                                                                        ) =>
                                                                                          handleKeyEdit(
                                                                                            e,
                                                                                            "3rd",
                                                                                            data,
                                                                                            subsection,
                                                                                            subsections2
                                                                                          )
                                                                                        }
                                                                                        tabIndex={
                                                                                          0
                                                                                        }
                                                                                        style={{
                                                                                          color:
                                                                                            "grey",
                                                                                          height:
                                                                                            "1.5rem",
                                                                                          width:
                                                                                            "1.5rem",
                                                                                          cursor:
                                                                                            "pointer",
                                                                                        }}
                                                                                        className="icon"
                                                                                      />
                                                                                    </Tooltip>
                                                                                    <Tooltip
                                                                                      title={t(
                                                                                        "delete"
                                                                                      )}
                                                                                      arrow
                                                                                    >
                                                                                      <DeleteOutlineIcon
                                                                                        // id="deleteIcon_3"
                                                                                        id={`pmweb_GlobalReqProjectLevel_deleteIcon_3_${index}`}
                                                                                        onClick={(
                                                                                          e
                                                                                        ) =>
                                                                                          deleteClicked(
                                                                                            e,
                                                                                            "3rd",
                                                                                            data,
                                                                                            subsection,
                                                                                            subsections2
                                                                                          )
                                                                                        }
                                                                                        onKeyDown={(
                                                                                          e
                                                                                        ) =>
                                                                                          handleKeyDelete(
                                                                                            e,
                                                                                            "3rd",
                                                                                            subsection,
                                                                                            subsections2
                                                                                          )
                                                                                        }
                                                                                        tabIndex={
                                                                                          0
                                                                                        }
                                                                                        style={{
                                                                                          color:
                                                                                            "grey",
                                                                                          height:
                                                                                            "1.5rem",
                                                                                          width:
                                                                                            "1.5rem",
                                                                                          cursor:
                                                                                            "pointer",
                                                                                        }}
                                                                                        className="icon"
                                                                                      />
                                                                                    </Tooltip>
                                                                                  </div>
                                                                                </div>
                                                                                <div
                                                                                  style={{
                                                                                    padding:
                                                                                      "0.25rem 3vw",
                                                                                  }}
                                                                                >
                                                                                  <p
                                                                                    style={{
                                                                                      width:
                                                                                        "57vw",
                                                                                      fontFamily:
                                                                                        "var(--font_family)",
                                                                                      fontSize:
                                                                                        "var(--base_text_font_size)",
                                                                                    }}
                                                                                  >
                                                                                    {decode_utf8(
                                                                                      subsections2.Description
                                                                                    )}
                                                                                  </p>
                                                                                </div>
                                                                              </div>
                                                                            </AccordionSummary>
                                                                          </Accordion>
                                                                        </div>
                                                                      )}
                                                                    </Draggable>
                                                                  )
                                                                )}
                                                              {
                                                                provided.placeholder
                                                              }
                                                            </div>
                                                          )}
                                                        </Droppable>
                                                      </Accordion>
                                                    </div>
                                                  )}
                                                </Draggable>
                                              )
                                            )}
                                          {provided.placeholder}
                                        </div>
                                      )}
                                    </Droppable>
                                  </Accordion>
                                </div>
                              )}
                            </Draggable>
                          </div>
                        );
                      })}
                      {provided.placeholder}
                    </div>
                  )}
                </Droppable>
              </DragDropContext>
              {firstLevelTextFieldShow && (
                <Modal
                  show={firstLevelTextFieldShow}
                  style={{
                    // width: "auto",
                    // left: "35%",
                    top: "25%",
                    padding: "0",
                  }}
                  children={
                    <AddNewSectionBox
                      mapNewSection={mapNewSection}
                      cancelCallBack={cancelAddNewSection}
                      previousOrderId={previousOrderId}
                      reqData={reqData}
                    />
                  }
                />
              )}
              {showEditBox ? (
                <Modal
                  show={showEditBox}
                  style={{
                    // width: "auto",
                    // left: "35%",
                    top: "25%",
                    padding: "0",
                  }}
                  // modalClosed={() => setshowEditBox(false)}
                  children={
                    <EditSectionBox
                      editMapToData={(data) => editMapToData(data)}
                      sectionToEdit={sectionToEdit}
                      cancelCallBack={cancelAddNewSection}
                    />
                  }
                />
              ) : null}
            </div>
          ) : (
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                width: "100%",
                height: "80%",
              }}
            >
              <img src={emptyStatePic} alt={t("emptyState")} />
              <p className={styles.headingInfo}>
                {t("noRequirementDefined")}, {t("pleaseUseAddSection")}
              </p>
              {firstLevelTextFieldShow === true ? (
                <Modal
                  show={firstLevelTextFieldShow}
                  style={{
                    // width: "auto",
                    // left: "35%",
                    top: "25%",
                    padding: "0",
                  }}
                  children={
                    <AddNewSectionBox
                      mapNewSection={mapNewSection}
                      cancelCallBack={cancelAddNewSection}
                      previousOrderId={0}
                      reqData={reqData}
                    />
                  }
                />
              ) : null}
            </div>
          )}
        </>
      )}
    </div>
  );
}

const mapStateToProps = (state) => {
  return {
    openProcessID: state.openProcessClick.selectedId,
    openProcessName: state.openProcessClick.selectedProcessName,
    openProcessType: state.openProcessClick.selectedType,
    templateId: state.openTemplateReducer.templateId,
    templateName: state.openTemplateReducer.templateName,
    openTemplateFlag: state.openTemplateReducer.openFlag,
  };
};

export default connect(mapStateToProps)(GlobalRequirementSections);
