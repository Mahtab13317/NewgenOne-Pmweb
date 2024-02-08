import React, { useEffect } from "react";
import PropTypes from "prop-types";
import clsx from "clsx";
import { hexToRgb, makeStyles } from "@material-ui/core/styles";
import Table from "@material-ui/core/Table";
import TableBody from "@material-ui/core/TableBody";
import TableCell from "@material-ui/core/TableCell";
import TableContainer from "@material-ui/core/TableContainer";
import TableHead from "@material-ui/core/TableHead";
import Divider from "@material-ui/core/Divider";
import TableRow from "@material-ui/core/TableRow";
import Paper from "@material-ui/core/Paper";
import { useTranslation } from "react-i18next";
import { RTL_DIRECTION } from "../../Constants/appConstants";
import { useDispatch } from "react-redux";
import { setImportExportVal } from "../../redux-store/slices/ImportExportSlice";
import { hexToRGB } from "../../utility/CommonFunctionCall/CommonFunctionCall";

function EnhancedTableHead(props) {
  const { headCells, hideHeader } = props;
  const { classes } = props;
  return (
    <TableHead
      ref={props.headRef}
      classes={{ root: classes.tableHeadRoot }}
      style={hideHeader ? { display: "none" } : {}}
    >
      <TableRow>
        {headCells.map((headCell, index) => (
          <TableCell
            key={headCell.id}
            align="left"
            classes={{
              root: clsx({
                [classes.rootHeadCell]: true,
                [classes.projectNameCell]: index === 0,
                [classes.ownedByCell]: index === 1,
              }),
            }}
            style={{ width: headCell.width, ...headCell.styleTdCell }}
          >
            <span style={{ display: "none" }}>hdfjhuif</span>
            {headCell.label}
          </TableCell>
        ))}
      </TableRow>
    </TableHead>
  );
}

EnhancedTableHead.propTypes = {
  classes: PropTypes.object.isRequired,
  onRequestSort: PropTypes.func.isRequired,
};

const useStyles = makeStyles({
  root: {
    width: "100%",
    //height : '80%',
    //overflow : 'auto',
    //position: 'relative',
  },
  tableHeadRoot: {
    // position : 'fixed'
  },
  tableBodyRoot: {
    //  position : 'fixed',
    // height : '390px',
    // overflowY : 'auto',
    // position:'relative'
  },
  // paginationRoot : {
  //   position : 'fixed'
  // },
  // paginationActions : {
  //   marginLeft : '0px',
  //   marginRight : '20px'
  // },
  // paginationToolbar : {
  //   '&	.MuiTablePagination-caption:first-of-type':{
  //     display : 'none'
  //   },
  //   '& .MuiTablePagination-spacer' :{
  //     display : 'none'
  //   },
  //   display : 'flex',
  //   justifyContent : 'center'
  // },
  // paginationInput : {
  //   display : 'none',
  // },
  rootHeadCell: {
    // position : 'absolute',
    // top : '0px',
    // left : '0px',
    fontFamily: "Open Sans , sans-serif",
    fontWeight: 600,
    fontSize: "12px",
    color: "#606060",
    borderBottom: "0px",
    padding: "0",
    paddingLeft: "4px",
    backgroundColor: "#F8F8F8",
  },
  projectNameCell: {
    minWidth: "200px",
  },
  ownedByCell: {
    minWidth: "100px",
  },
  // processCountCell : {
  //   width : '100%',
  // },
  paper: {
    width: "100%",
    position: "relative",
    //marginBottom: theme.spacing(2),
  },
  // tableContainerRoot : {
  //     height : '450px',
  //     overflowY : 'auto'
  // },
  table: {
    minWidth: "100%",
    maxWidth: "100%",
  },
  selectedCell: {
    textAlign: (props) =>
      props.direction === RTL_DIRECTION ? "right" : "left",
    font: "normal normal 600 var(--base_text_font_size)/17px var(--font_family)",
    borderBottom: "0px",
    fontSize: "var(--base_text_font_size)",
    padding: "0 var(--spacing_v)",
    alignItems: "center",
    letterSpacing: "0px",
    color: "var(--brand_color2) !important",
  },
  tableCell: {
    fontFamily: "var(--font_family)",
    borderBottom: "0px",
    fontSize: "var(--base_text_font_size)",
    padding: "0 var(--spacing_v)",
    alignItems: "center",
    textAlign: (props) =>
      props.direction === RTL_DIRECTION ? "right" : "left",
  },
  TableRow: {
    cursor: "pointer",
    background: "#FFFFFF 0% 0% no-repeat padding-box",
    "&:focus": {
      backgroundColor: "F8F8F8 !important",
      border: "none",
    },
  },
  selectedTableRow: {
    backgroundColor: "#0072c614 !important",
  },

  selectedTableRowRoot: {
    "&:focus-visible": {
      border: `1px solid var(--brand_color1) !important`,
      background: "#FF660026 0% 0% no-repeat padding-box",
      opacity: 1,
    },
  },
  visuallyHidden: {
    border: 0,
    clip: "rect(0 0 0 0)",
    height: 1,
    margin: -1,
    overflow: "hidden",
    padding: 0,
    position: "absolute",
    top: 20,
    width: 1,
  },
});

export default function TabularData(props) {
  // pass  divider as true through props to show didvider ,  ans pass style object to styleDivider prop if you need to apply style to it
  // heideHeader when true hides the header , default false i.e. header will be shown
  // batchSize gives the now of rows in a single page , default 50
  // maxHeight if given , restricts the height of whole table
  // extendHeight when false, will mwke height of table body maximum enought to adjust all rows , when no of rows is less than
  // rows visible without scroll.
  // also to get height, pass function to prop getHeightOfTable, then height will be passed as parameter to this function and called
  const {
    extendHeight = true,
    hideHeader = false,
    batchSize = 50,
    maxHeight = null,
    backgroundColor,
    hoverBackgroundColor,
  } = props;
  const rootRef = React.useRef(null),
    headRef = React.useRef(null),
    bodyRef = React.useRef(null);

  let { t } = useTranslation();
  const direction = `${t("HTML_DIR")}`;
  const classes = useStyles({
    direction,
  });
  const [rowSelected, setRowSelected] = React.useState(null);

  const [rowsPerPage, setRowsPerPage] = React.useState(batchSize);
  const dispatch = useDispatch();

  const handleRowClick = (event, rowId, rowDec, rowData, rowType) => {
    setRowSelected(rowId);
    props.setSelectedProjectDesc && props.setSelectedProjectDesc(rowDec);
    props.getSelectedRow({ rowId, rowType: rowData?.ProjectType });
    dispatch(setImportExportVal({ ProjectName: rowData, Type: "import" }));
  };

  useEffect(() => {
    if (props.selectedRow) {
      setRowSelected(props.selectedRow);
      let row = props.rows?.filter((el) => el.rowId === props.selectedRow)[0];
      props.setSelectedProjectDesc &&
        props.setSelectedProjectDesc(row?.projectDesc);
      dispatch(
        setImportExportVal({ ProjectName: row?.rowData, Type: "import" })
      );
    }
  }, [props.tabValue, props.selectedRow]);

  const isRowSelected = (id) => id === rowSelected;

  React.useEffect(() => {
    if (
      props.parenrRef &&
      props.parenrRef.current &&
      headRef &&
      headRef.current &&
      bodyRef &&
      bodyRef.current
    ) {
      let addScroolListnere = () => {
        let headRect = headRef.current.getBoundingClientRect();

        let upperHeaderHeight = 0;
        if (props.upperHeaderRef && props.upperHeaderRef.current) {
          upperHeaderHeight =
            props.upperHeaderRef.current.getBoundingClientRect().height;
        }

        let headerHeight = 0;
        if (!hideHeader) {
          headerHeight = headRect.height;
        }
        let bodyRect = bodyRef.current.getBoundingClientRect();
        let parentRect = props.parenrRef.current.getBoundingClientRect();
        // if(headerHeight + props.parenrRef.current.getBoundingClientRect().top + upperHeaderHeight > bodyRef.current.getBoundingClientRect().top){
        // if(headRect.height + props.parenrRef.current.getBoundingClientRect().top > bodyRef.current.getBoundingClientRect().top){
        if (
          headRect.height + parentRect.top + upperHeaderHeight > bodyRect.top &&
          headRect.height + parentRect.top + upperHeaderHeight < bodyRect.bottom
        ) {
          headRef.current.style.position = "fixed";
          // headRef.current.style.minWidth = parentRect.top.width + 'px';
          // headRef.current.style.display='flex';
          // headRef.current.style.justifyContent= 'space-between';
          // headRef.current.style.minWidth= '925px';

          if (props.upperHeaderRef && props.upperHeaderRef.current) {
            props.upperHeaderRef.current.style.position = "fixed";
            props.upperHeaderRef.current.style.top = parentRect.top + "px";
            props.upperHeaderRef.current.style.backgroundColor = "white";
            props.upperHeaderRef.current.style.marginLeft = "-2px";
            // headRef.current.style.minWidth= '1925px';
            // props.upperHeaderRef.current.style.paddingRight = '10px';
          }

          // bodyRef.current.style.overflowY = 'scroll';
          bodyRef.current.style.paddingRight = "10px";
          headRef.current.style.zIndex = 100;
          props.upperHeaderRef.current.style.zIndex = 100;
          headRef.current.style.top = parentRect.top + upperHeaderHeight + "px";
          bodyRef.current.style.top = upperHeaderHeight + "px";
          //someFunction();
        } else {
          props.upperHeaderRef.current.style.backgroundColor = "inherit";
          headRef.current.style.position = "relative";
          bodyRef.current.style.position = "relative";
          bodyRef.current.style.top = "0px";
          //it is the first empty table row 'tr'
          // bodyRef.current.children[0].children[0].style.paddingTop = '0px';
          if (props.upperHeaderRef && props.upperHeaderRef.current) {
            props.upperHeaderRef.current.style.position = "relative";
            // props.upperHeaderRef.current.style.marginLeft = '-87px';
            props.upperHeaderRef.current.style.top = "0px";
            //props.upperHeaderRef.current.style.top = props.parenrRef.current.offsetParent.getBoundingClientRect().top + upperHeaderHeight + 'px'
          }
        }
      };

      props.parenrRef.current.addEventListener("scroll", addScroolListnere);
      return () => {
        if (props.parenrRef && props.parenrRef.current) {
          props.parenrRef.current.removeEventListener(
            "scroll",
            addScroolListnere
          );
        }
      };
    }
  }, props.updateTablePosition);

  const handleKeyDown = (e, rowId, rowDec, rowData, rowType) => {
    if (e.keyCode === 13) {
      handleRowClick(e, rowId, rowDec, rowData, rowType);
      e.stopPropagation();
    }
  };

  // React.useEffect(() => {
  //   document.addEventListener("keydown", handleKeyDown);
  //   return () => document.removeEventListener("keydown", handleKeyDown);
  // },[handleKeyDown]);

  return (
    <div
      className={classes.root}
      ref={rootRef}
      style={maxHeight !== null ? { maxHeight: maxHeight } : {}}
    >
      <Paper className={classes.paper}>
        <TableContainer //classes = {{root : classes.tableContainerRoot}}
          id="tableTitle"
        >
          <Table
            // stickyHeader = {true}
            className={classes.table}
            aria-labelledby="tableTitle"
            //size= 'small' //{dense ? 'small' : 'medium'}
            aria-label="enhanced table"
          >
            <EnhancedTableHead
              classes={classes}
              // order={order}
              // orderBy={orderBy}
              // onRequestSort={handleRequestSort}
              rowCount={props.rows.length}
              headCells={props.tableHead}
              headRef={headRef}
              hideHeader={hideHeader}
            />
            {extendHeight || props.rows.length !== 0 ? (
              <TableBody
                ref={bodyRef}
                classes={{ root: classes.tableBodyRoot }}
              >
                {
                  // stableSort(props.rows, getComparator(order, orderBy))
                  //.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                  props.rows.map((row, index) => {
                    const isRowItemSelected = props.selectionPossible
                      ? isRowSelected(row.rowId)
                      : false;
                    const labelId = `enhanced-table-label-${index}`;
                    return (
                      <>
                        <tr>
                          <td colspan={props.tableHead.length}>
                            {props.divider ? (
                              <Divider
                                style={
                                  props.styleDivider ? props.styleDivider : {}
                                }
                              />
                            ) : null}
                          </td>
                        </tr>
                        {/* <tr
                          tabIndex={0}
                          onClick={(event) => {
                            if (!props.noClickOnRow) {
                              handleRowClick(
                                event,
                                row.rowId,
                                row.projectDesc,
                                row.rowData
                              );
                            }
                          }}
                          onKeyDown={(event)=>{
                            handleKeyDown(event, row.rowId,
                              row.projectDesc,
                              row.rowData);
                          }}
                        > */}
                        <TableRow
                          className={classes.TableRow}
                          classes={{
                            hover: classes.hover,
                            selected: classes.selectedTableRow,
                            root: classes.selectedTableRowRoot,
                          }}
                          hover
                          onClick={(event) => {
                            if (!props.noClickOnRow) {
                              handleRowClick(
                                event,
                                row.rowId,
                                row.projectDesc,
                                row.rowData
                              );
                            }
                          }}
                          tabindex={0}
                          onKeyDown={(event) => {
                            if (!props.noClickOnRow) {
                              handleKeyDown(
                                event,
                                row.rowId,
                                row.projectDesc,
                                row.rowData
                              );
                            }
                          }}
                          // role="checkbox"
                          id={`pmweb_projects_TableData_${row.rowId}`}
                          aria-checked={isRowItemSelected}
                          // tabIndex={0}
                          key={row.rowId}
                          selected={isRowItemSelected}
                          role="Row"
                          aria-label="Clickable"
                          // modified on 04/09/2023 for BugId 135251
                          aria-description={`${row.rowData[props.nameKey]} contain item ${
                            row.rowData[props.countKey]
                          }`}
                        >
                          {props.tableHead.map((headCell, index) => {
                            if (index === 0) {
                              return (
                                <TableCell
                                  key={headCell.id + row.rowId}
                                  style={
                                    isRowItemSelected
                                      ? {
                                          fontWeight: 600,
                                          color: "#F36A10",
                                          width: headCell.width,
                                          ...headCell.styleTdCell,
                                        }
                                      : {
                                          width: headCell.width,
                                          ...headCell.styleTdCell,
                                        }
                                  }
                                  component="th"
                                  id={labelId}
                                  scope="row"
                                  padding="none"
                                  className={
                                    isRowItemSelected
                                      ? classes.selectedCell
                                      : classes.tableCell
                                  }
                                  onClick={(event) => {
                                    if (
                                      props.clickableHeadCell &&
                                      props.clickableHeadCell.includes(
                                        headCell.id
                                      )
                                    ) {
                                      handleRowClick(
                                        event,
                                        row.rowId,
                                        row.projectDesc
                                      );
                                    }
                                  }}
                                  onKeyDown={(event) => {
                                    if (
                                      props.clickableHeadCell &&
                                      props.clickableHeadCell.includes(
                                        headCell.id
                                      )
                                    )
                                      handleKeyDown(
                                        event,
                                        row.rowId,
                                        row.projectDesc
                                      );
                                  }}
                                  // tabIndex={0}
                                >
                                  {row[headCell.id]}
                                </TableCell>
                              );
                            } else {
                              return (
                                <TableCell
                                  key={headCell.id + row.rowId}
                                  align="left"
                                  className={
                                    isRowItemSelected
                                      ? classes.selectedCell
                                      : classes.tableCell
                                  }
                                  style={{
                                    width: headCell.width,
                                    ...headCell.styleTdCell,
                                  }}
                                  onClick={(event) => {
                                    if (
                                      props.clickableHeadCell &&
                                      props.clickableHeadCell.includes(
                                        headCell.id
                                      )
                                    ) {
                                      handleRowClick(
                                        event,
                                        row.rowId,
                                        row.projectDesc
                                      );
                                    }
                                  }}
                                  // tabIndex={0}
                                  onKeyDown={(event) => {
                                    if (
                                      props.clickableHeadCell &&
                                      props.clickableHeadCell.includes(
                                        headCell.id
                                      )
                                    )
                                      handleKeyDown(
                                        event,
                                        row.rowId,
                                        row.projectDesc
                                      );
                                  }}
                                >
                                  {row[headCell.id]}
                                </TableCell>
                              );
                            }
                          })}
                        </TableRow>
                        {/* </tr> */}
                      </>
                    );
                  })
                }
              </TableBody>
            ) : null}
            {props.rows.length == 0 ? props.defaultScreen : null}
          </Table>
        </TableContainer>
        {props.rows.length > rowsPerPage
          ? null
          : // <TablePagination
            //   ref = {paginationRef}
            //   classes = {{root : classes.paginationRoot ,
            //     actions : classes.paginationActions,
            //     toolbar : classes.paginationToolbar,
            //     input : classes.paginationInput
            //   }}
            //   //rowsPerPageOptions={[10, 25 , 50, 75, 100]}
            //   component="div"
            //   count={props.rows.length}
            //   rowsPerPage={rowsPerPage}
            //   page={page}
            //   onChangePage={handleChangePage}
            //   onChangeRowsPerPage={handleChangeRowsPerPage}
            // />
            null}
      </Paper>
      {/* <FormControlLabel
        control={<Switch checked={dense} onChange={handleChangeDense} />}
        label="Dense padding"
      /> */}
    </div>
  );
}
