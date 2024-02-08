import React, { useEffect, useState } from "react";
import { Grid, makeStyles } from "@material-ui/core";
import { Typography } from "@mui/material";
import { DragDropContext, Draggable, Droppable } from "react-beautiful-dnd";
import DragIndicatorIcon from "@material-ui/icons/DragIndicator";
import { useTranslation } from "react-i18next";
import { updateMarvinGeneratedProcessActivity } from "../CommonMarvinApiCalls/CommonMarvinApiCalls";
import _ from "lodash";

const useStyle = makeStyles((theme) => ({
  titleText: {
    color: "#252525",
    font: "normal normal 600 var(--subtitle_text_font_size)/19px var(--font_family) !important",
  },
  container: {
    border: "1px solid #A0A0A0",
    borderRadius: "2px",
    flexDirection: "column",
    padding: "0.5rem 0.5vw",
    background: "white",
    marginTop: "1.5rem",
    height: "fit-content",
    maxHeight: "100%",
    minHeight: "150px",
  },
  mainContainer: {
    overflow: "auto",
    height: "fit-content",
    maxHeight: "92%",
    marginTop: "2.5rem",
  },
  sequenceNo: {
    color: "#656565",
    font: "normal normal 600 var(--base_text_font_size)/17px var(--font_family) !important",
  },
  elmntName: {
    color: "#252525",
    font: "normal normal 600 var(--base_text_font_size)/17px var(--font_family) !important",
  },
  elmntDesc: {
    color: "#606060",
    font: "normal normal 400 var(--base_text_font_size)/17px var(--font_family) !important",
  },
  flex: {
    display: "flex",
    alignItems: "center",
  },
  rowId: {
    // background: "#C8C8C8",
    background: "#D9D9D9",
    padding: "0px 0.25vw",
    color: "#252525",
    font: "normal normal 600 var(--base_text_font_size)/17px var(--font_family) !important",
    borderRadius: "2px",
  },
}));

export default function ProcessFlow(props) {
  let { t } = useTranslation();
  const direction = `${t("HTML_DIR")}`;
  const styles = useStyle({ direction });
  const { previewId } = props;
  const [rows, setRows] = useState(props.data);

  useEffect(() => {
    setRows(_.cloneDeep(props.data));
  }, [props.data]);
  const onDragEnd = async (result, i, row) => {
    const { source, destination } = result;
    const orgRows = _.cloneDeep(rows);
    const tempRows = _.cloneDeep(rows);

    if (!destination) return;
    let temp = [...tempRows[i - 1].activities];
    const [reOrderedPickListItem] = temp.splice(source.index, 1);
    temp.splice(destination.index, 0, reOrderedPickListItem);

    //update the sequenceId as well.
    let outputTemp = temp.map((item, index) => {
      item.sequenceNo = index + 1;
      return item;
    });

    tempRows[i - 1].activities = outputTemp;
    setRows(tempRows);
    const updatedSequenceNumber =
      orgRows[i - 1]?.activities[destination.index]?.sequenceNo;
    let updatedActivityData = {
      ...row.activities[source.index],
      sequenceNo: updatedSequenceNumber,
    };
    //code added for bug id 142691
    const isSequenceChanged = await updateMarvinGeneratedProcessActivity({
      previewId: previewId,
      activityId: row.activities[source.index]?.id,
      payload: { ...updatedActivityData },
    });

    if (!isSequenceChanged) {
      setRows(orgRows);
    }
    //till here for bug id 142691
  };

  return (
    <Grid container xs={12} className={styles.mainContainer}>
      {rows && rows.length > 0 ? (
        rows.map((row, index) => {
          return (
            <Grid container className={styles.container}>
              <Grid
                item
                container
                style={{
                  display: "flex",
                  gap: "0.25vw",
                  paddingBottom: "0.5rem",
                  borderBottom: "1px solid #DFDFDF",
                  marginBottom: "0.5rem",
                  alignItems: "center",
                }}
              >
                <Grid item>
                  <Typography
                    className={styles.rowId}
                    data-testid={`ProcessFlow_id_${index}`}
                  >
                    #{row.id}
                  </Typography>
                </Grid>
                <Grid item></Grid>
                <Typography
                  className={styles.titleText}
                  style={{ flex: "1" }}
                  data-testid={`ProcessFlow_name_${index}`}
                >
                  {row.name}
                </Typography>
              </Grid>
              <Grid item>
                <DragDropContext onDragEnd={(e) => onDragEnd(e, row.id, row)}>
                  <Droppable droppableId="droppable-list">
                    {(provided) => (
                      <div {...provided.droppableProps} ref={provided.innerRef}>
                        {row.activities && row.activities.length !== 0
                          ? row.activities.map((element, index) => {
                              return (
                                <Draggable
                                  key={`${element.id}`}
                                  draggableId={`${element.id}`}
                                  index={index}
                                >
                                  {(provided) => (
                                    <Grid
                                      {...provided.draggableProps}
                                      {...provided.dragHandleProps}
                                      ref={provided.innerRef}
                                    >
                                      <Grid
                                        container
                                        style={{
                                          padding: "0.25rem 0",
                                          display: "flex",
                                          gap: "1vw",
                                          alignItems: "center",
                                        }}
                                      >
                                        <Grid item className={styles.flex}>
                                          <DragIndicatorIcon
                                            style={{
                                              color: "#8B8B8B",
                                              width: "1.25rem",
                                              height: "1.25rem",
                                            }}
                                          />
                                        </Grid>
                                        <Grid
                                          item
                                          container
                                          style={{
                                            flex: "1",
                                            display: "flex",
                                            gap: "0.5vw",
                                          }}
                                        >
                                          <Grid item>
                                            <Typography
                                              className={styles.sequenceNo}
                                              data-testid={`ProcessFlow_sequenceNo_${index}`}
                                            >
                                              {row.id}.{element?.sequenceNo}
                                            </Typography>
                                          </Grid>
                                          <Grid item>
                                            <Typography
                                              className={styles.elmntName}
                                              data-testid={`ProcessFlow_elmntName_${index}`}
                                            >
                                              {element?.name}
                                              {"."}
                                            </Typography>
                                          </Grid>
                                          <Grid item>
                                            <Typography
                                              className={styles.elmntDesc}
                                              data-testid={`ProcessFlow_elmntDesc_${index}`}
                                            >
                                              {element?.description}
                                            </Typography>
                                          </Grid>
                                        </Grid>
                                      </Grid>
                                    </Grid>
                                  )}
                                </Draggable>
                              );
                            })
                          : null}
                      </div>
                    )}
                  </Droppable>
                </DragDropContext>
              </Grid>
            </Grid>
          );
        })
      ) : (
        <Grid role="grid" aria-label="No data is available">
          {t("noDataIsAvailable")}
        </Grid>
      )}
    </Grid>
  );
}
