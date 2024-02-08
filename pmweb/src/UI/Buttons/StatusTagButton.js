import React from "react";
import Button from "@material-ui/core/Button";

function StatusTag(props) {
  return (
    <div>
      <Button
        variant="contained"
        style={{
          backgroundColor: `${props.bcolor}`,
          color: "white",
          fontSize: "10px",
          height: "20px",
          padding: "10px",
        }}
        disabled
      >
        {props.content}
      </Button>
    </div>
  );
}

export default StatusTag;
