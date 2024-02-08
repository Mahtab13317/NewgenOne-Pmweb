import * as React from 'react';
import { Radio, RadioGroup, FormControlLabel,FormControl} from "@material-ui/core";
// import FormControlLabel from "@material-ui/core/FormControlLabel";
import { Select, MenuItem } from "@material-ui/core";
import { makeStyles, Typography } from "@material-ui/core";


const useStyles = makeStyles((theme) => ({
    select: {
      width: "138px",
      height: "28px",
      background: "#FFFFFF 0% 0% no-repeat padding-box",
      font: "normal normal normal 12px/17px Open Sans",
      border: "1px solid #C4C4C4",
      borderRadius: "2px",
      opacity: "1",
      marginLeft: "10px",
      marginRight:"10px" 
    },
    dropdownData: {
      // width: "45px",
      height: "17px",
      textAlign: "left",
      font: "normal normal normal 12px/17px Open Sans",
      letterSpacing: "0px",
      color: "#000000",
      opacity: "1",
      marginTop: "8px",
      paddingLeft: "10px !important",
      marginLeft: "0px",
    },
  }));
export default function RadioButtonsGroup() {
    const classes = useStyles({  });
    const dropdown = [
        { Name: "L" },
        { Name: "R" },
        { Name: "RP" },
        { Name: "E" },
        { Name: "EP" },
      ];

      const onSelect = (e) => {
        console.log(e.target.value);
      };  
      
  return (
    <FormControl component="fieldset">
      <RadioGroup
        aria-label="gender"
        defaultValue="female"
        name="radio-buttons-group"
      >
        <FormControlLabel value="female" control={<Radio />} label="Mark" />
        <FormControlLabel value="male" control={<Radio />} label="PickList" />
        <FormControlLabel value="other" control={<Radio />} label="Trigger" />
        <Select
                className={classes.select}
                MenuProps={{
                  anchorOrigin: {
                    vertical: "bottom",
                    horizontal: "left",
                  },
                  transformOrigin: {
                    vertical: "top",
                    horizontal: "left",
                  },
                  getContentAnchorEl: null,
                }}
                defaultValue={"defaultValue"}
                onChange={onSelect}
              >
                <MenuItem
                  className={classes.dropdownData}
                  value="defaultValue"
                >
                  {t("<None>")}
                </MenuItem>
                {dropdown.map((x) => {
                  return (
                    <MenuItem
                      className={classes.dropdownData}
                      key={x.Name}
                      value={x.Name}
                    >
                      
                    </MenuItem>
                  );
                })}
              </Select>
      </RadioGroup>
    </FormControl>
  );
}
