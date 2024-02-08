import React from "react";
import Button from "@material-ui/core/Button";

function CreateProcessButton(props) {
  return (
    <Button
      id={props.id}
      variant="contained"
      onClick={props.onClick}
      style={props.buttonStyle}
      disableElevation
      tabIndex={props.tabIndex}
      onKeyDown={props.onKeyDown}
    >
      {props.buttonContent}
    </Button>
  );
}

export default CreateProcessButton;
