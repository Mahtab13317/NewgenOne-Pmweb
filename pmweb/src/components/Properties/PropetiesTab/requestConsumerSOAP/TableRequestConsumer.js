import React, { useState, useEffect } from "react";
import { makeStyles } from "@material-ui/core/styles";
import Paper from "@material-ui/core/Paper";
import Table from "@material-ui/core/Table";
import TableBody from "@material-ui/core/TableBody";
import TableCell from "@material-ui/core/TableCell";
import TableContainer from "@material-ui/core/TableContainer";
import TableHead from "@material-ui/core/TableHead";
import TableRow from "@material-ui/core/TableRow";
import { Checkbox } from "@material-ui/core";
import { store, useGlobalState } from "state-pool";
import { useDispatch } from "react-redux";
import { propertiesLabel } from "../../../../Constants/appConstants";
import { setActivityPropertyChange } from "../../../../redux-store/slices/ActivityPropertyChangeSlice";

const columns = [
  { id: "name", label: "Process Variable(s)", minWidth: 275 },
  { id: "code", label: "Search", minWidth: 100 },
];

const useStyles = makeStyles((theme) => ({
  root: {
    width: "100%",
  },
  container: {
    maxHeight: 440,
  },
  tableRow: {
    "&:nth-of-type(even)": {
      backgroundColor: theme.palette.action.hover,
    },
  },
}));

export default function StickyHeadTable(props) {
  const classes = useStyles();
  const dispatch = useDispatch();
  const loadedProcessData = store.getState("loadedProcessData");
  const [localLoadedProcessData, setlocalLoadedProcessData] =
    useGlobalState(loadedProcessData);
  const loadedActivityPropertyData = store.getState("activityPropertyData");
  const [localLoadedActivityPropertyData, setlocalLoadedActivityPropertyData] =
    useGlobalState(loadedActivityPropertyData);

  const [variablesList, setVariablesList] = useState([]);
  const { isReadOnly } = props;

  const checkChangeHandler = (e, variable) => {
    let temp = [...variablesList];
    // temp?.map((t, index) => {
    temp?.forEach((t, index) => {
      if (t.VariableName == variable.VariableName) {
        temp[index].isSelected = e.target.checked;
      }
    });
    setVariablesList(temp);
    let tempOne = localLoadedActivityPropertyData;
    tempOne?.ActivityProperty?.requestConsumerSOAP?.m_arrMsgVarInfo?.map(
      (el, index) => {
        if (el.processVarInfo.varName == variable.VariableName) {
          tempOne.ActivityProperty.requestConsumerSOAP.m_arrMsgVarInfo[
            index
          ].isSelected = e.target.checked;
        } else {
          tempOne.ActivityProperty.requestConsumerSOAP.m_arrMsgVarInfo.push({
            isSelected: e.target.checked,
            processVarInfo: {
              varFieldId: variable.VarFieldId,
              varName: variable.VariableName,
              variableId: variable.VariableId,
            },
          });
        }
      }
    );
    setlocalLoadedActivityPropertyData(tempOne);
    dispatch(
      setActivityPropertyChange({
        [propertiesLabel.reqConSOAP]: { isModified: true, hasError: false },
      })
    );
  };

  useEffect(() => {
    let temp = localLoadedProcessData?.Variable?.filter((vary) => {
      return vary.VariableType == "3" && vary.VariableScope == "U";
    });
    let tempOne = temp.map((v) => ({ ...v, isSelected: false }));
    tempOne.map((el) => {
      localLoadedActivityPropertyData?.ActivityProperty?.requestConsumerSOAP?.m_arrMsgVarInfo?.map(
        (zl) => {
          if (el.VariableName == zl.processVarInfo.varName) {
            el.isSelected = zl.isSelected;
          }
        }
      );
    });
    setVariablesList(tempOne);
  }, [localLoadedActivityPropertyData]);

  return (
    <Paper className={classes.root}>
      <TableContainer
        className={classes.container}
        style={{ marginLeft: "20px", width: "97%" }}
      >
        <Table
          stickyHeader
          aria-label="sticky table"
          style={{ border: "1px solid #F8F8F8" }}
        >
          <TableHead>
            <TableRow>
              {columns.map((column) => (
                <TableCell
                  key={column.id}
                  align={column.align}
                  style={{
                    minWidth: column.minWidth,
                    padding: "0 0 0 5px",
                    width: "20%",
                    fontSize: "14px",
                    fontWeight: "600",
                  }}
                >
                  {column.id == "code" ? <Checkbox size="small" /> : null}
                  {column.label}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {variablesList?.map((vary) => {
              return (
                <TableRow
                  hover
                  role="checkbox"
                  tabIndex={-1}
                  className={classes.tableRow}
                >
                  <TableCell
                    style={{
                      padding: "0 0 0 5px",
                      width: "20%",
                      fontSize: "12px",
                    }}
                  >
                    {vary.VariableName}
                  </TableCell>
                  <TableCell
                    style={{
                      padding: "0 0 0 40px",
                    }}
                  >
                    <Checkbox
                      checked={vary.isSelected}
                      onChange={(e) => checkChangeHandler(e, vary)}
                      size="small"
                      disabled={isReadOnly}
                    />
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </TableContainer>
    </Paper>
  );
}
