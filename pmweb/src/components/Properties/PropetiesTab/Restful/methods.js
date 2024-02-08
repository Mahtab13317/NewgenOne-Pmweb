import React from "react";
import { withStyles, makeStyles } from "@material-ui/core/styles";
import Table from "@material-ui/core/Table";
import TableBody from "@material-ui/core/TableBody";
import TableCell from "@material-ui/core/TableCell";
import TableContainer from "@material-ui/core/TableContainer";
import TableHead from "@material-ui/core/TableHead";
import TableRow from "@material-ui/core/TableRow";
import Paper from "@material-ui/core/Paper";
import "./index.css";
import SwapHorizIcon from "@material-ui/icons/SwapHoriz";
import DeleteIcon from "@material-ui/icons/Delete";
import { IconButton } from "@material-ui/core";
import { useTranslation } from "react-i18next";
import { useSelector } from "react-redux";
import { headerHeight } from "../../../../Constants/appConstants";

const StyledTableCell = withStyles((theme) => ({
  head: {
    backgroundColor: theme.palette.common.black,
    color: theme.palette.common.white,
  },
  body: {
    fontSize: 14,
  },
  root: {
    padding: "0 1vw",
  },
}))(TableCell);

const StyledTableRow = withStyles((theme) => ({
  root: {
    "&:nth-of-type(even)": {
      backgroundColor: "#fff",
    },
  },
}))(TableRow);

const useStyles = makeStyles(() => ({
  table: {
    height: 40,
    borderSpacing: "0 0.125rem",
  },
  tableContainer: {
    padding: "0.5rem 1vw",
    // added code on 21-09-2023 for bugId: 135961
    height: (props) =>
      props.isDrawerExpanded
        ? `calc((${props.windowInnerHeight}px - ${headerHeight}) - 20rem)`
        : `calc((${props.windowInnerHeight}px - ${headerHeight}) - 23rem)`,
    // height: "auto",
    // overflowX: 'hidden',
    // added code on 21-09-2023 for bugId: 135961
    "&:hover": {
      overflowX: "auto",
    },
    //till here for bugId: 135961
  },
  tableRow: {
    height: 40,
  },
  tableHeader: {
    fontWeight: 600,
    fontSize: 13,
    backgroundColor: "#f8f8f8",
    borderTop: "1px solid #f8f8f8",
    borderBottom: "1px solid #f8f8f8",
    borderRadius: "0.125rem",
    color: "black",
  },
  tableBodyCell: {
    fontSize: "var(--base_text_font_size)",
  },
}));

export default function CustomizedTables(props) {
  const mappingHandler = (method) => {
    props.setShowMapping(true);
    props.setMethodClicked(method);
  };
  let { t } = useTranslation();
  // changes added for bug_id: 134226
  const windowInnerHeight = useSelector(
    (state) => state.setWindowInnerHeight.windowInnerHeight
  );
  const classes = useStyles({
    windowInnerHeight: windowInnerHeight,
    isDrawerExpanded: props.isDrawerExpanded,
  });

  return (
    <TableContainer
      component={Paper}
      className={classes.tableContainer}
      id="TableContainer"
    >
      {/*code changes on 21 June 2022 for BugId 110907 */}
      <Table
        className={`${classes.table} ${
          props.isDrawerExpanded
            ? "webServicePropertiestableEx"
            : "webServicePropertiestableCo"
        } webServicePropertiestable`}
        style={{ width: "100%" }}
        aria-label="customized table"
        stickyHeader
      >
        <TableHead>
          <StyledTableRow className={classes.tableRow}>
            <StyledTableCell
              className={classes.tableHeader}
              style={{ width: "95vw", textAlign: "start" }}
            >
              {t("method")}
            </StyledTableCell>
            <StyledTableCell
              className={classes.tableHeader}
              style={{ width: "2.5vw", textAlign: "start" }}
            >
              <span style={{ display: "none" }}>TH</span>
            </StyledTableCell>
            <StyledTableCell
              className={classes.tableHeader}
              align="right"
              style={{ width: "2.5vw", textAlign: "start" }}
            >
              <span style={{ display: "none" }}>TH</span>
            </StyledTableCell>
          </StyledTableRow>
        </TableHead>
        <TableBody className="associatedTemplateDiv">
          {props.associations.map((row, index) => (
            <StyledTableRow key={row.method} className={classes.tableRow}>
              {row.method ? (
                <StyledTableCell
                  className={classes.tableBodyCell}
                  style={{ width: "95vw", textAlign: "start" }}
                >
                  {row.method}
                </StyledTableCell>
              ) : null}
              <StyledTableCell
                align="right"
                style={{ width: "2.5vw", textAlign: "start" }}
              >
                <IconButton
                  onClick={() => mappingHandler(row)}
                  id={`pmweb_restful_method_swapHorizon_${index}`}
                  // tabIndex={0}
                  onKeyUp={(e) => {
                    if (e.key === "Enter") {
                      mappingHandler(row);
                      e.stopPropagation();
                    }
                  }}
                  disableFocusRipple
                  disableTouchRipple
                  aria-label="swap horizon"
                >
                  <SwapHorizIcon
                    style={{
                      width: "1.75rem",
                      height: "1.75rem",
                      cursor: "pointer",
                    }}
                    // onClick={() => mappingHandler(row)}
                    // id={`pmweb_restful_method_swapHorizon_${index}`}
                    // tabIndex={0}
                    // onKeyUp={(e) => {
                    //   if (e.key === "Enter") {
                    //     mappingHandler(row);
                    //     e.stopPropagation();
                    //   }
                    // }}
                  />
                </IconButton>
              </StyledTableCell>
              <StyledTableCell
                align="right"
                style={{ width: "2.5vw", textAlign: "start" }}
              >
                {!props.isReadOnly && (
                  <IconButton
                    onClick={() => props.handleAssociationDelete(row)}
                    id={`pmweb_restful_method_deleteIcon_${index}`}
                    tabIndex={0}
                    onKeyUp={(e) => {
                      if (e.key === "Enter") {
                        props.handleAssociationDelete(row);
                        e.stopPropagation();
                      }
                    }}
                    disableFocusRipple
                    disableTouchRipple
                    aria-label="delete Icon"
                  >
                    <DeleteIcon
                      style={{
                        width: "1.5rem",
                        height: "1.5rem",
                        cursor: "pointer",
                      }}
                      // onClick={() => props.handleAssociationDelete(row)}
                      // id={`pmweb_restful_method_deleteIcon_${index}`}
                      // tabIndex={0}
                      // onKeyUp={(e) => {
                      //   if (e.key === "Enter") {
                      //     props.handleAssociationDelete(row);
                      //     e.stopPropagation();
                      //   }
                      // }}
                    />
                  </IconButton>
                )}
              </StyledTableCell>
            </StyledTableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
}
