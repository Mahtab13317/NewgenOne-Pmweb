import React from 'react';
import PropTypes from 'prop-types';
import clsx from 'clsx';
import { makeStyles } from '@material-ui/core/styles';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableContainer from '@material-ui/core/TableContainer';
import TableHead from '@material-ui/core/TableHead';
import Divider from '@material-ui/core/Divider';
import TablePagination from '@material-ui/core/TablePagination';
import TableRow from '@material-ui/core/TableRow';
import TableSortLabel from '@material-ui/core/TableSortLabel';
import Paper from '@material-ui/core/Paper';
//import FormControlLabel from '@material-ui/core/FormControlLabel';
//import Switch from '@material-ui/core/Switch';


function descendingComparator(a, b, orderBy) {
  if (b[orderBy] < a[orderBy]) {
    return -1;
  }
  if (b[orderBy] > a[orderBy]) {
    return 1;
  }
  return 0;
}

function getComparator(order, orderBy) {
  return order === 'desc'
    ? (a, b) => descendingComparator(a, b, orderBy)
    : (a, b) => -descendingComparator(a, b, orderBy);
}

function stableSort(array, comparator) {
  const stabilizedThis = array.map((el, index) => [el, index]);
  stabilizedThis.sort((a, b) => {
    const order = comparator(a[0], b[0]);
    if (order !== 0) return order;
    return a[1] - b[1];
  });
  return stabilizedThis.map((el) => el[0]);
}



function EnhancedTableHead(props) {
  const {headCells , hideHeader} = props;
  const { classes, order, orderBy, onRequestSort } = props;
  const createSortHandler = (property) => (event) => {
    onRequestSort(event, property);
  };

  return (
    <TableHead ref = {props.headRef} classes = {{root : classes.tableHeadRoot}} style = {hideHeader ? {display : "none"} : {}}>
      <TableRow>
        {headCells.map((headCell , index) => (
          <TableCell
            key={headCell.id}
            align= 'left'
            classes = {{ root : clsx ( { [classes.rootHeadCell] : true , 
              [classes.projectNameCell] : index === 0 ,
              [classes.ownedByCell] : index === 1 })}}
            //classes = {{root : classes.rootHeadCell}}
            //headCell.disablePadding ? 'none' : 'default'
            style = {{width : headCell.width , ...headCell.styleTdCell}}
            sortDirection={orderBy === headCell.id ? order : false}
          >
            {(headCell.sort === true) ? 
                <TableSortLabel
                    active={orderBy === headCell.id}
                    direction={orderBy === headCell.id ? order : 'asc'}
                    onClick={createSortHandler(headCell.id)}
                >
                {headCell.label}
                {orderBy === headCell.id ? (
                  <span className={classes.visuallyHidden}>
                    {order === 'desc' ? 'sorted descending' : 'sorted ascending'}
                  </span>
                ) : null}
                </TableSortLabel>
                : <p> {headCell.label} </p>
            } 
          </TableCell>
        ))}
      </TableRow>
    </TableHead>
  );
}

EnhancedTableHead.propTypes = {
  classes: PropTypes.object.isRequired,
  onRequestSort: PropTypes.func.isRequired,
  order: PropTypes.oneOf(['asc', 'desc']).isRequired,
  orderBy: PropTypes.string.isRequired,
};

const useStyles = makeStyles((theme) => ({
  root: {
    width: '100%',
    height : '90%',
    overflow : 'auto'
  },
  tableHeadRoot : {
    position : 'fixed'
  },
  tableBodyRoot : {
    position : 'fixed',
    //height : '390px',
    overflowY : 'auto'
  },
  paginationRoot : {
    position : 'fixed'
  },
  paginationActions : {
    marginLeft : '0px',
    marginRight : '20px'
  },
  paginationToolbar : {
    '&	.MuiTablePagination-caption:first-of-type':{
      display : 'none'
    },
    '& .MuiTablePagination-spacer' :{
      display : 'none'
    },
    display : 'flex',
    justifyContent : 'center'
  },
  paginationInput : {
    display : 'none',
  },
  rootHeadCell : {
    // position : 'absolute',
    // top : '0px',
    // left : '0px',
    fontFamily : 'Open Sans , sans-serif',
    fontWeight : 600,
    fontSize : '12px',
    color : '#606060',
    borderBottom : '0px',
    padding : '2px',
    paddingLeft : '4px',
    backgroundColor: 'white'
  },
  projectNameCell : {
      minWidth : '200px'
  },
  ownedByCell : {
      minWidth : '100px'
  },
  // processCountCell : {
  //   width : '100%',
  // },
  paper: {
    width: '100%',
    position : 'relative'
    //marginBottom: theme.spacing(2),
  },
  // tableContainerRoot : {
  //     height : '450px',
  //     overflowY : 'auto'
  // },
  table: {
    minWidth: '100%',
    maxWidth : '100%'
  },
  tableCellRoot : {
    fontFamily: "Open Sans , Roboto , Helvetica , Arial , sans-serif",
    borderBottom : '0px',
    fontSize : '12px',
    padding : '2px',
    paddingLeft : '4px',
    marginRight : '14px'
  },
  selectedTableRow : {
    background: '#FF660026 0% 0% no-repeat padding-box',
    opacity: 1
  },
  // checkboxRoot : {
  //   padding : '0px',
  //   paddingRight : '2px'
  // },
  visuallyHidden: {
    border: 0,
    clip: 'rect(0 0 0 0)',
    height: 1,
    margin: -1,
    overflow: 'hidden',
    padding: 0,
    position: 'absolute',
    top: 20,
    width: 1,
  }
}));

export default function ProjectTable(props) {
  // pass  divider as true through props to show didvider ,  ans pass style object to styleDivider prop if you need to apply style to it
  // heideHeader when true hides the header , default false i.e. header will be shown
  // batchSize gives the now of rows in a single page , default 50
  // maxHeight if given , restricts the height of whole table
  // extendHeight when false, will mwke height of table body maximum enought to adjust all rows , when no of rows is less than
  // rows visible without scroll.
  // also to get height, pass function to prop getHeightOfTable, then height will be passed as parameter to this function and called
  const {extendHeight = true , hideHeader = false , batchSize = 50 , maxHeight = null} = props; 
  const rootRef = React.useRef(null), headRef = React.useRef(null) , bodyRef = React.useRef(null) , paginationRef = React.useRef(null);
  const classes = useStyles();
  const [order, setOrder] = React.useState('asc');
  const [orderBy, setOrderBy] = React.useState('projectName');
  const [rowSelected , setRowSelected] = React.useState(null);
  const [page, setPage] = React.useState(0);
//   const [dense, setDense] = React.useState(false);
  const [rowsPerPage, setRowsPerPage] = React.useState(batchSize);

  const handleRequestSort = (event, property) => {
    const isAsc = orderBy === property && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(property);
  };

  const handleRowClick = (event , rowId) => {
      setRowSelected(rowId);
  }

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

//   const handleChangeDense = (event) => {
//     setDense(event.target.checked);
//   };

  const isRowSelected = (id) => id === rowSelected;

  const emptyRows = rowsPerPage - Math.min(rowsPerPage, props.rows.length - page * rowsPerPage);

  React.useEffect(() => {
    if(rootRef && headRef && bodyRef && bodyRef.current && paginationRef){
      //to make header sticky
      let rootParentRect = rootRef.current.offsetParent.getBoundingClientRect();
      
      let rootRect = rootRef.current.getBoundingClientRect();
      let headRefRect = headRef.current.getBoundingClientRect();
      let bodyRefRect = bodyRef.current.getBoundingClientRect();
      if(paginationRef.current){
        var paginationRefRect = paginationRef.current.getBoundingClientRect();
      }
      //rootRef.current.style.height = (maxHeight !== null) ? maxHeight : ((rootParentRect.height - (rootRect.top - rootParentRect.top) - 1) + 'px');
      rootRef.current.style.height = ((rootParentRect.height - (rootRect.top - rootParentRect.top) - 1) + 'px');
      headRef.current.style.top = rootRect.top + 'px';
      headRef.current.style.left = rootRect.left + 'px';
      headRef.current.style.width = rootRect.width + 'px'
      bodyRef.current.style.top = (headRefRect.top + headRefRect.height) +  'px';
      bodyRef.current.style.left = headRefRect.left + 'px';
      console.log(rootRect);
      rootRect = rootRef.current.getBoundingClientRect();
      console.log(rootRect);
      if(hideHeader){
        bodyRef.current.style.top = rootRect.top + 'px';
        bodyRef.current.style.left = rootRect.left + 'px';
      }

      let paginationHeight = 0;
      if(paginationRef.current){
        paginationHeight = paginationRefRect.height;
      }

      //set the bodyHeight depending on whether height extend=sion is allowed or not.
      if(!extendHeight){
        //if height is not to be extended, id rows are less, then body height will not take all of the remaining space of rootRef
        bodyRef.current.style.height = (((rootRect.height - headRefRect.height - paginationHeight) < bodyRefRect.height) ? (rootRect.height - headRefRect.height- paginationHeight) : bodyRefRect.height) + 'px';
      }
      else{
        bodyRef.current.style.height = (rootRect.height - headRefRect.height - paginationHeight )+ 'px';
      }
      bodyRef.current.style.width = rootRect.width + 'px';
      bodyRefRect = bodyRef.current.getBoundingClientRect();

      if(paginationRef.current){
        paginationRef.current.style.left = bodyRef.current.style.left;
        paginationRef.current.style.top = (bodyRefRect.top + bodyRefRect.height) + 'px';
        paginationRef.current.style.width = rootRect.width + 'px';
      }
    }

    //handles the height of rootRef when height of root should not be extended in case of empty Rows
    if(!extendHeight && rootRef){ 

      let tableHeight = 0;
      if(bodyRef && bodyRef.current){
        tableHeight = tableHeight + bodyRef.current.getBoundingClientRect().height;
      }
      if(headRef && headRef.current){
        tableHeight = tableHeight + headRef.current.getBoundingClientRect().height;
      } 
      if(paginationRef && paginationRef.current){
        tableHeight = tableHeight + paginationRef.current.getBoundingClientRect().height;
      }
      let rootHeight = rootRef.current.getBoundingClientRect().height;
      let minHeight = (tableHeight < rootHeight ? tableHeight : rootHeight);
      if(minHeight !== NaN && minHeight !== undefined && minHeight !== null){
        rootRef.current.style.height = minHeight + 'px';
      }
    }

    if(props.getHeightOfTable){
      props.getHeightOfTable(rootRef.current.getBoundingClientRect().height);
    }
  },[]);

  return (
    <div className={classes.root} ref = {rootRef} style = {maxHeight !== null ? {maxHeight : maxHeight } : {}}>
      <Paper className={classes.paper} >
        <TableContainer //classes = {{root : classes.tableContainerRoot}}
          >
          <Table
            //stickyHeader = {true}
            className={classes.table}
            aria-labelledby="tableTitle"
            //size= 'small' //{dense ? 'small' : 'medium'}
            aria-label="enhanced table"
          >
            <EnhancedTableHead
              classes={classes}
              order={order}
              orderBy={orderBy}
              onRequestSort={handleRequestSort}
              rowCount={props.rows.length}
              headCells = {props.tableHead}
              headRef = {headRef}
              hideHeader = {hideHeader}
            />
            {(extendHeight || props.rows.length !== 0) ?
              <TableBody ref = {bodyRef} classes = {{root : classes.tableBodyRoot}}>
                {stableSort(props.rows, getComparator(order, orderBy))
                  //.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                  .map((row, index) => {
                    const isRowItemSelected = isRowSelected(row.rowId);
                    const labelId = `enhanced-table-checkbox-${index}`;

                    return (
                      <>
                        {props.divider ? <Divider style = {props.styleDivider ? props.styleDivider : {}}/> : null}
                        <TableRow
                          classes = {{selected : classes.selectedTableRow}}
                          hover
                          onClick={(event) => handleRowClick(event, row.rowId)}
                          role="checkbox"
                          aria-checked={isRowItemSelected}
                          tabIndex={-1}
                          key={row.rowId}
                          selected={isRowItemSelected}
                        >
                          {props.tableHead.map((headCell , index) => {
                            if(index === 0){
                              return (
                                <TableCell 
                                  key = {headCell.id + row.rowId}
                                  style = { isRowItemSelected ? {fontWeight : 600 , color : '#F36A10'  , width : headCell.width , ...headCell.styleTdCell} : {width : headCell.width, ...headCell.styleTdCell}}
                                  component="th" 
                                  id={labelId} 
                                  scope="row" 
                                  padding="none" 
                                  classes = {{ root : classes.tableCellRoot}} >
                                    {row[headCell.id]}
                                </TableCell>);
                            }
                            else{
                              return (
                                <TableCell 
                                  key = {headCell.id + row.rowId}
                                  align="left" 
                                  style = {{width : headCell.width , ...headCell.styleTdCell}}
                                  classes = {{ root : classes.tableCellRoot}}>
                                  {row[headCell.id]}
                                </TableCell>
                              )
                            }
                          })}
                        </TableRow>
                      </>
                    );
                  })}
                {(emptyRows > 0 && extendHeight) && (
                  <></>
                  // <TableRow style={{ height: ( /* dense ? 33 : */ 53) * emptyRows }}>
                  //   <TableCell colSpan={6} />
                  // </TableRow>
                )}
              </TableBody>
              : null}
          </Table>
        </TableContainer>
        { (props.rows.length > rowsPerPage) ? 
          <TablePagination
            ref = {paginationRef}
            classes = {{root : classes.paginationRoot , 
              actions : classes.paginationActions,
              toolbar : classes.paginationToolbar,
              input : classes.paginationInput
            }}
            //rowsPerPageOptions={[10, 25 , 50, 75, 100]}
            component="div"
            count={props.rows.length}
            rowsPerPage={rowsPerPage}
            page={page}
            onChangePage={handleChangePage}
            onChangeRowsPerPage={handleChangeRowsPerPage}
          />
          : null}
      </Paper>
      {/* <FormControlLabel
        control={<Switch checked={dense} onChange={handleChangeDense} />}
        label="Dense padding"
      /> */}
    </div>
  );
}