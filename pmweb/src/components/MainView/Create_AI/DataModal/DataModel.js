import React, { useEffect, useState } from "react";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Paper from "@mui/material/Paper";
import { Grid, Typography, makeStyles } from "@material-ui/core";
import { useTranslation } from "react-i18next";
import {
  NoRecordIcon,
  RemoveIcon,
} from "../../../../utility/AllImages/AllImages";
import { RTL_DIRECTION } from "../../../../Constants/appConstants";
import clsx from "clsx";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import KeyboardArrowUpIcon from "@mui/icons-material/KeyboardArrowUp";
import _ from "lodash";
import {
  deleteDataObject,
  deleteDataObjectVariable,
} from "./DataModelApiCalls";

const useStyle = makeStyles(() => ({
  cell: {
    width: "25%",
    font: "normal normal 700 var(--base_text_font_size)/17px var(--font_family) !important",
    borderCollapse: "collapse",
    padding: "0.75rem 1vw !important",
  },
  deleteText: {
    color: "#DE1515",
    font: "normal normal 600 var(--base_text_font_size)/17px var(--font_family) !important",
    marginInlineEnd: "0.5vw",
    cursor: "pointer",
    display: "inline",
  },
  Border: {
    border: "1px solid #B4B4B4",
  },
  NoRightBorder: {
    borderRight: "none",
  },
  NoLeftBorder: {
    borderLeft: "none",
  },
  rowCell: {
    fontWeight: "600 !important",
  },
  mainPaper: {
    borderRadius: "0px !important",
    overflow: "auto",
    height: "94%",
    maxHeight: "100%",
    padding: "0px 1vw",
    flexDirection: "column",
    marginTop: "1.5rem",
    border: "1px solid #B4B4B4",
    background: "#FFF",
  },
  paper: {
    borderRadius: "0px !important",
    overflow: "auto",
    height: "fit-content",
    maxHeight: "100%",
    flexDirection: "column",
    background: "#FFF",
  },
  NoPadding: {
    padding: "0px",
  },
  extraBorder: {
    borderBottom: "10px solid white",
  },
  typo: {
    fontWeight: "600 !important",
  },
  NoDataHeading: {
    font: "normal normal 600 var(--subtitle_text_font_size)/19px var(--font_family) !important",
    margin: "0.5rem 0 0.25rem",
  },
  NoDataGrid: {
    height: "100%",
    width: "100%",
    display: "flex",
    flexDirection: "column",
    gap: "0.5rem",
    alignItems: "center",
    justifyContent: "center",
  },
  NoDataText: {
    color: "#000",
    font: "normal normal 400 var(--base_text_font_size)/17px var(--font_family) !important",
    textAlign: "center",
  },
}));

export default function DataModel(props) {
  let { t } = useTranslation();
  const direction = `${t("HTML_DIR")}`;
  const rows = props.data;
  const [showVariables, setShowVariables] = useState([]);
  const { setShowDeleteModal, setShowCommonDeleteModal } = props;

  // modified on 02/02/2024 for BugId 143196
  /*useEffect(() => {
    if (props?.data?.length) {
      let arr = Array(props.data.length);
      arr.fill(true);
      setShowVariables(arr);
    }
  }, []);*/
  useEffect(() => {
    if (props?.data?.length > 0) {
      let arr = Array(props.data.length);
      arr.fill(true);
      setShowVariables(arr);
    }
  }, [props?.data]);
  // till here BugId 143196

  const deleteRow = async (previewId, index, rowIndexToDelete) => {
    let prevRows = _.cloneDeep(rows);
    let orgRows = _.cloneDeep(rows);

    const dataObjectId = orgRows[index]?.id;
    const variableId = orgRows[index]?.variables[rowIndexToDelete]?.id;
    // console.log(index, rowIndexToDelete);
    // console.log(prevRows[index], prevRows[index].variables[rowIndexToDelete]);

    prevRows[index].variables.splice(rowIndexToDelete, 1);
    props.updateData(prevRows);

    // console.log(previewId, dataObjectId, variableId);
    const response = await deleteDataObjectVariable({
      previewId,
      dataObjectId,
      variableId,
    });
    if (!response) {
      props.updateData(orgRows);
    }
  };

  const handleDeleteDataObject = async (previewId, index) => {
    let prevRows = _.cloneDeep(rows);
    let orgRows = _.cloneDeep(rows);

    const dataObjectId = orgRows[index]?.id;
    prevRows.splice(index, 1);
    props.updateData(prevRows);

    const response = await deleteDataObject({
      previewId,
      dataObjectId,
    });
    if (!response) {
      props.updateData(orgRows);
    }
  };

  const handleExpandCollapse = (index, type) => {
    switch (type) {
      case "Collapse":
        setShowVariables(
          showVariables?.map((item, i) => {
            return i === index ? false : item;
          })
        );
        break;
      case "Expand":
        setShowVariables(
          showVariables?.map((item, i) => {
            return i === index ? true : item;
          })
        );
        break;
      default:
    }
  };

  const classes = useStyle();

  return rows && rows.length > 0 ? (
    <React.Fragment>
      <TableContainer component={Paper} className={classes.mainPaper}>
        <Table
          sx={{
            minWidth: 650,
          }}
          size="small"
          stickyHeader
          aria-label="sticky table"
        >
          <TableHead>
            <TableRow>
              <TableCell
                className={classes.cell}
                align={direction === RTL_DIRECTION ? "right" : "left"}
                data-testid="DataModel_TH_dataobject"
              >
                {t("dataObjects")}
              </TableCell>
              <TableCell
                className={classes.cell}
                align={direction === RTL_DIRECTION ? "right" : "left"}
                style={{ width: "50%" }}
                data-testid="DataModel_TH_description"
              >
                {t("Discription")}
              </TableCell>
              <TableCell className={classes.cell}></TableCell>
            </TableRow>
          </TableHead>
          <TableBody className={classes.tableBody}>
            <TableRow style={{ height: "1.25rem" }} />
            {rows?.map((row, index) => (
              <>
                <TableRow
                  key={index}
                  style={{ background: "#E8E8E8" }}
                  className={
                    !(
                      showVariables[index] &&
                      row?.variables &&
                      row?.variables.length > 0
                    ) && classes.extraBorder
                  }
                >
                  <TableCell
                    className={clsx(
                      classes.cell,
                      classes.Border,
                      classes.NoRightBorder,
                      classes.rowCell
                    )}
                    component="th"
                    scope="row"
                    align={direction === RTL_DIRECTION ? "right" : "left"}
                  >
                    {row?.name}
                  </TableCell>
                  <TableCell
                    className={clsx(
                      classes.cell,
                      classes.Border,
                      classes.NoRightBorder,
                      classes.NoLeftBorder,
                      classes.rowCell
                    )}
                    align={direction === RTL_DIRECTION ? "right" : "left"}
                    style={{ width: "50%" }}
                  >
                    {row?.description}
                  </TableCell>
                  <TableCell
                    className={clsx(
                      classes.cell,
                      classes.Border,
                      classes.NoLeftBorder,
                      classes.rowCell
                    )}
                    align="right"
                  >
                    <Grid
                      item
                      alignItems="center"
                      style={{
                        alignItems: "center",
                        display: "flex",
                        justifyContent: "end",
                      }}
                    >
                      <Typography
                        className={classes.deleteText}
                        data-testid={`DataModel_delete_dataobject`}
                        onClick={() =>
                          setShowDeleteModal({
                            index: index,
                            deleteFunc: (previewId) =>
                              handleDeleteDataObject(previewId, index),
                            dataObject: row.name,
                            isDataObject: true,
                          })
                        }
                      >
                        {t("delete")}
                      </Typography>
                      {showVariables[index] ? (
                        <KeyboardArrowUpIcon
                          onClick={() =>
                            handleExpandCollapse(index, "Collapse")
                          }
                          data-testid={`KeyboardArrowUpIcon`}
                          style={{
                            color: "#606060 !important",
                            cursor: "pointer",
                          }}
                        />
                      ) : (
                        <KeyboardArrowDownIcon
                          onClick={() => handleExpandCollapse(index, "Expand")}
                          data-testid={`KeyboardArrowDownIcon`}
                          style={{
                            color: "#606060 !important",
                            cursor: "pointer",
                          }}
                        />
                      )}
                    </Grid>
                  </TableCell>
                </TableRow>
                {showVariables[index] &&
                row?.variables &&
                row?.variables.length > 0 ? (
                  <TableCell
                    colSpan={3}
                    style={{ padding: "0px" }}
                    className={classes.extraBorder}
                  >
                    <TableContainer
                      component={Paper}
                      className={clsx(classes.paper, classes.NoPadding)}
                    >
                      <Table
                        sx={{ minWidth: 650 }}
                        size="small"
                        aria-label="a dense table"
                      >
                        <TableHead>
                          <TableRow style={{ background: "#F6F6F6" }}>
                            <TableCell
                              className={clsx(
                                classes.cell,
                                classes.Border,
                                classes.rowCell
                              )}
                              align={
                                direction === RTL_DIRECTION ? "right" : "left"
                              }
                            >
                              {t("variableName")}
                            </TableCell>
                            <TableCell
                              className={clsx(
                                classes.cell,
                                classes.Border,
                                classes.rowCell
                              )}
                              align={
                                direction === RTL_DIRECTION ? "right" : "left"
                              }
                              style={{ width: "50%" }}
                            >
                              {t("Discription")}
                            </TableCell>
                            <TableCell
                              className={clsx(
                                classes.cell,
                                classes.Border,
                                classes.rowCell
                              )}
                              align={
                                direction === RTL_DIRECTION ? "right" : "left"
                              }
                            >
                              {t("dataType")}
                            </TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {row.variables?.map((variable, rowIndex) => (
                            <TableRow key={rowIndex} data-testid={rowIndex}>
                              <TableCell
                                className={clsx(
                                  classes.cell,
                                  classes.Border,
                                  classes.rowCell
                                )}
                                component="th"
                                scope="row"
                                align={
                                  direction === RTL_DIRECTION ? "right" : "left"
                                }
                              >
                                {variable?.name}
                              </TableCell>
                              <TableCell
                                className={clsx(
                                  classes.cell,
                                  classes.Border,
                                  classes.rowCell
                                )}
                                component="th"
                                scope="row"
                                align={
                                  direction === RTL_DIRECTION ? "right" : "left"
                                }
                                style={{ width: "50%" }}
                              >
                                {variable?.description}
                              </TableCell>
                              <TableCell
                                className={clsx(
                                  classes.cell,
                                  classes.Border,
                                  classes.rowCell
                                )}
                                align={
                                  direction === RTL_DIRECTION ? "right" : "left"
                                }
                              >
                                <Grid
                                  container
                                  justifyContent="space-between"
                                  style={{ flexWrap: "nowrap" }}
                                >
                                  <Grid item>{variable?.type}</Grid>
                                  <Grid item>
                                    <span title={t("delete")}>
                                      <RemoveIcon
                                        style={{
                                          cursor: "pointer",
                                          width: "1.25rem",
                                          height: "1.25rem",
                                        }}
                                        onClick={() => {
                                          if (row?.variables?.length === 1) {
                                            setShowDeleteModal({
                                              index: index,
                                              deleteFunc: (previewId) =>
                                                handleDeleteDataObject(
                                                  previewId,
                                                  index
                                                ),
                                              dataObject: row.name,
                                              isDataObject: false,
                                            });
                                          } else {
                                            //deleteRow(index, rowIndex);
                                            setShowCommonDeleteModal({
                                              type: "variable",
                                              name: variable?.name,

                                              deleteFunc: (previewId) =>
                                                deleteRow(
                                                  previewId,
                                                  index,
                                                  rowIndex
                                                ),
                                            });
                                          }
                                        }}
                                      />
                                    </span>
                                  </Grid>
                                </Grid>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </TableContainer>
                  </TableCell>
                ) : null}
                <TableRow style={{ height: "1.25rem" }} />
              </>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </React.Fragment>
  ) : (
    <Grid container className={classes.NoDataGrid}>
      <Grid item role="grid" aria-label="No Record Icon">
        <NoRecordIcon />
      </Grid>
      <Grid item>
        <Typography
          className={classes.NoDataHeading}
          data-testid="DataModel_NoDataObjects"
        >
          {t("NoDataObjects")}
        </Typography>
      </Grid>
      <Grid item style={{ display: "flex", justifyContent: "center" }}>
        <Typography
          className={classes.NoDataText}
          data-testid="DataModel_NoDataObjectsRegenerateMsg"
        >
          {t("NoDataObjectsRegenerateMsg")}
        </Typography>
      </Grid>
    </Grid>
  );
}
