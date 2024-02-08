import React, { useState } from "react";
import { makeStyles } from "@material-ui/core/styles";
import Paper from "@material-ui/core/Paper";
import Table from "@material-ui/core/Table";
import TableBody from "@material-ui/core/TableBody";
import TableCell from "@material-ui/core/TableCell";
import TableContainer from "@material-ui/core/TableContainer";
import TableHead from "@material-ui/core/TableHead";
import TableRow from "@material-ui/core/TableRow";
import { store, useGlobalState } from "state-pool";
import { MenuItem, Checkbox } from "@material-ui/core";
import "./index.css";
import { useDispatch } from "react-redux";
import {
  RTL_DIRECTION,
  propertiesLabel,
} from "../../../../Constants/appConstants";
import { setActivityPropertyChange } from "../../../../redux-store/slices/ActivityPropertyChangeSlice";
import CustomizedDropdown from "../../../../UI/Components_With_ErrrorHandling/Dropdown";
import { useTranslation } from "react-i18next";
const columns = [
  { id: "name", label: "Message Data", minWidth: 275 },
  { id: "search", label: "Search", minWidth: 100 },
  { id: "update", label: "Update", minWidth: 100 },
  { id: "processVariables", label: "Process Variable(s)", minWidth: 100 },
];

const useStyles = makeStyles({
  root: {
    width: "100%",
  },
  container: {
    maxHeight: 440,
  },
});

export default function StickyHeadTable(props) {
  const classes = useStyles();
  const dispatch = useDispatch();
  let { t } = useTranslation();
  const direction = `${t("HTML_DIR")}`;
  const loadedProcessData = store.getState("loadedProcessData");
  const [localLoadedProcessData, setlocalLoadedProcessData] =
    useGlobalState(loadedProcessData);
  const loadedActivityPropertyData = store.getState("activityPropertyData");
  const [localLoadedActivityPropertyData, setlocalLoadedActivityPropertyData] =
    useGlobalState(loadedActivityPropertyData);

  const [variablesList, setVariablesList] = useState([]);
  const { isReadOnly } = props;
  const searchCheckHandler = (e, variable) => {
    let variableName = variable.messageData;
    let temp = { ...localLoadedActivityPropertyData };
    temp.ActivityProperty.consumerInfo.messageDataList.filter(
      (el) => el.messageData == variableName
    )[0].Search = e.target.checked;
    setlocalLoadedActivityPropertyData(temp);
    dispatch(
      setActivityPropertyChange({
        [propertiesLabel.reqConSOAP]: { isModified: true, hasError: false },
      })
    );
  };

  const updateCheckHandler = (e, variable) => {};

  // useEffect(() => {
  //   setVariablesList(
  //     Object.values(
  //       localLoadedActivityPropertyData?.ActivityProperty?.consumerInfo
  //         ?.messageDataList
  //     )
  //   );
  // }, [localLoadedActivityPropertyData]);

  return (
    <Paper className={classes.root}>
      <TableContainer className={classes.container}>
        <Table stickyHeader aria-label="sticky table">
          <TableHead>
            <TableRow>
              {columns.map((column) => (
                <TableCell
                  key={column.id}
                  align={column.align}
                  style={{
                    minWidth: column.minWidth,
                    padding: "0 0 0 5px",
                    textAlign: "start",
                  }}
                >
                  {column.id != "processVariables" ? <Checkbox /> : null}
                  {column.label}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {variablesList?.map((vary) => {
              return (
                <TableRow hover role="checkbox" tabIndex={-1}>
                  <TableCell
                    style={{
                      padding: "0 0 0 5px",
                      textAlign: "start",
                    }}
                  >
                    <Checkbox disabled={isReadOnly} />
                    {vary.messageData}
                  </TableCell>
                  <TableCell
                    style={{
                      padding: "0 0 0 40px",
                      textAlign: "start",
                    }}
                  >
                    <Checkbox
                      disabled={isReadOnly}
                      checked={vary.Search}
                      onChange={(e) => searchCheckHandler(e, vary)}
                    />
                  </TableCell>
                  <TableCell
                    style={{
                      padding: "0 0 0 40px",
                      textAlign: "start",
                    }}
                  >
                    <Checkbox
                      checked={vary.Update}
                      onChange={(e) => updateCheckHandler(e, vary)}
                      disabled={isReadOnly}
                    />
                  </TableCell>
                  <TableCell
                    style={{
                      padding: "0 0 0 40px",
                      textAlign: "start",
                    }}
                  >
                    {/* <Select
                      className="selectTwo_callActivity"
                      value={vary.selectedProcessVariable}
                      // onChange={}
                      disabled={isReadOnly}
                    >
                      {localLoadedProcessData.Variable.map((variable) => {
                        return (
                          <MenuItem
                            className="InputPairDiv_CommonList"
                            value={variable.VariableName}
                          >
                            {variable.VariableName}
                          </MenuItem>
                        );
                      })}
                    </Select> */}
                    <CustomizedDropdown
                      variant="outlined"
                      isNotMandatory={true}
                      className="selectTwo_callActivity"
                      value={vary.selectedProcessVariable}
                      // onChange={}
                      disabled={isReadOnly}
                    >
                      {localLoadedProcessData.Variable.map((variable) => {
                        return (
                          <MenuItem
                            className="InputPairDiv_CommonList"
                            value={variable.VariableName}
                            style={{
                              justifyContent:
                                direction === RTL_DIRECTION ? "end" : null,
                            }}
                          >
                            {variable.VariableName}
                          </MenuItem>
                        );
                      })}
                    </CustomizedDropdown>
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
