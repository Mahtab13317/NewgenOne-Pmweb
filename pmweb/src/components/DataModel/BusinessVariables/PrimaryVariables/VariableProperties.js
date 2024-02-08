import React, { useState } from "react";
import "./index.module.css";
import { Checkbox } from "@material-ui/core";
import Button from "@material-ui/core/Button";
import { DatePickers } from "../../../../UI/DatePicker/DatePickers";

function VariableProperties(props) {
  const [defaultCheckValue, setDefaultCheckValue] = useState(false);
  const [defaultValueInput, setDefaultValueInput] = useState(
    props.defaultValue
  );
  const [showDatePicker, setShowDatePicker] = useState(false);

  const InputChangeHandler = (event) => {
    setShowDatePicker(true);
    setDefaultValueInput(event.target.value);
  };

  return (
    <div>
      <p style={{ fontSize: "12px", padding: "8px" }}>
        Properties : {props.aliasName}
      </p>
      <hr />
      <div
        style={{
          display: "flex",
          alignItems: "center",
          padding: "8px",
        }}
      >
        <Checkbox
          size="small"
          style={{
            width: "10px",
            height: "10px",
            background: "#FFFFFF 0% 0% no-repeat padding-box",
            marginRight: "5px",
          }}
          checked={defaultCheckValue}
          onChange={() => setDefaultCheckValue(!defaultCheckValue)}
        />
        <span style={{ fontSize: "12px", marginRight: "8px" }}>
          Default Value
        </span>
        <input
          style={{
            width: "63px",
            height: "24px",
            background: "#F4F4F4 0% 0% no-repeat padding-box",
            border: "1px solid #E4E4E4",
            borderRadius: "2px",
            opacity: "1",
            padding: "2px",
          }}
          onChange={(e) => InputChangeHandler(e)}
          value={defaultValueInput}
          disabled={!defaultCheckValue}
        />
        {props.variableType == 8 && showDatePicker ? (
          <DatePickers
            value={new Date()}
            timeFormat={false}
            onChange={(e) => InputChangeHandler(e)}
            width="100%"
          />
        ) : null}
      </div>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          padding: "8px",
        }}
      >
        <p style={{ fontSize: "12px", marginRight: "8px" }}>Length</p>
        <p style={{ fontSize: "12px", marginLeft: "58px" }}>
          {props.variableLength}
        </p>
      </div>
      <div
        style={{
          width: "100%",
          height: "52px",
          background: "#F5F5F5 0% 0% no-repeat padding-box",
          opacity: "1",
          textAlign: "right",
          paddingRight: "10px",
        }}
      >
        <Button
          onClick={() => props.setShowPropertiesModal(false)}
          id="close_AddTodoModal_Button"
          style={{
            width: "54px",
            height: "28px",
            background: "#FFFFFF 0% 0% no-repeat padding-box",
            border: "1px solid #C4C4C4",
            borderRadius: "2px",
            opacity: "1",
            textTransform: "none",
            marginTop: "13px",
          }}
        >
          {"Cancel"}
        </Button>
        <Button
          style={{
            width: "50px",
            height: "28px",
            background: "blue",
            border: "1px solid #C4C4C4",
            borderRadius: "2px",
            opacity: "1",
            textTransform: "none",
            color: "white",
            marginTop: "13px",
            marginLeft: "8px",
          }}
        >
          Save
        </Button>
      </div>
    </div>
  );
}

export default VariableProperties;
