import React from "react";
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
import { deleteTodo } from "./TodosApiCalls";

const useStyle = makeStyles(() => ({
  cell: {
    border: "1px solid #B4B4B4",
    font: "normal normal 700 var(--base_text_font_size)/17px var(--font_family) !important",
    padding: "0.75rem 1vw !important",
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
  rowCell: {
    fontWeight: "600 !important",
  },
  paper: {
    borderRadius: "0px !important",
    overflow: "auto",
    height: "fit-content",
    maxHeight: "90%",
    marginTop: "2.5rem",
  },
}));

export default function Todos(props) {
  let { t } = useTranslation();
  const direction = `${t("HTML_DIR")}`;
  const rows = props.data;
  const { setShowCommonDeleteModal } = props;

  const deleteRow = async (previewId, todoIdToDelete) => {
    const orgRows = [...rows];
    const filterData = rows.filter((row) => row.id !== todoIdToDelete);
    props.updateData(filterData);

    // code added for bug_id 143225
    const isDeleted = await deleteTodo({
      previewId: previewId,
      todoId: todoIdToDelete,
    });
    if (!isDeleted) {
      props.updateData(orgRows);
    }
    //till here for bug_id 143225
  };

  const classes = useStyle();

  return rows && rows.length > 0 ? (
    <TableContainer component={Paper} className={classes.paper}>
      <Table sx={{ minWidth: 650 }} size="small" aria-label="a dense table">
        <TableHead>
          <TableRow>
            <TableCell
              className={classes.cell}
              align={direction === RTL_DIRECTION ? "right" : "left"}
              style={{ width: "25%" }}
            >
              {t("task")}
            </TableCell>
            <TableCell
              className={classes.cell}
              align={direction === RTL_DIRECTION ? "right" : "left"}
              style={{ width: "75%" }}
            >
              {t("Discription")}
            </TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {rows.map((row) => (
            <TableRow key={row.id} data-testid={row?.id}>
              <TableCell
                className={classes.cell + " " + classes.rowCell}
                component="th"
                scope="row"
                align={direction === RTL_DIRECTION ? "right" : "left"}
                style={{ width: "25%" }}
              >
                {row?.name}
              </TableCell>
              <TableCell
                className={classes.cell + " " + classes.rowCell}
                align={direction === RTL_DIRECTION ? "right" : "left"}
                style={{ width: "75%" }}
              >
                <Grid
                  container
                  justifyContent="space-between"
                  style={{ flexWrap: "nowrap" }}
                >
                  <Grid item>{row?.description}</Grid>
                  <Grid item>
                    <span title={t("delete")}>
                      <RemoveIcon
                        style={{
                          cursor: "pointer",
                          width: "1.25rem",
                          height: "1.25rem",
                        }}
                        data-testid={`Todo_deleteIcon_${row?.id}`}
                        // code modified for bug_id 143224
                        // onClick={() => deleteRow(row?.id)}
                        onClick={() => {
                          setShowCommonDeleteModal({
                            type: "todo",
                            name: row?.name,
                            deleteFunc: (previewId) =>
                              deleteRow(previewId, row?.id),
                          });
                        }}
                        //till here for bug_id 143224
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
  ) : (
    <Grid container className={classes.NoDataGrid}>
      <Grid item>
        <NoRecordIcon />
      </Grid>
      <Grid item>
        <Typography
          className={classes.NoDataHeading}
          data-testid="pmweb_CreateAI_Todo_NoTodos"
        >
          {t("NoTodos")}
        </Typography>
      </Grid>
      <Grid item style={{ display: "flex", justifyContent: "center" }}>
        <Typography
          className={classes.NoDataText}
          data-testid="pmweb_CreateAI_Todo_NoTodosRegenrateMsg"
        >
          {t("NoTodosRegenerateMsg")}
        </Typography>
      </Grid>
    </Grid>
  );
}
