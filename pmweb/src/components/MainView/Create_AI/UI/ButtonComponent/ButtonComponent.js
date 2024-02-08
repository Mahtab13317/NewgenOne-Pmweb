import { Button } from "@material-ui/core";
import React, { Children } from "react";

const ButtonComponent = (props) => {
  return (
    <>
      <Button
        variant={props.variant}
        onClick={props.onClick}
        id={props.id}
        tabIndex={props.tabIndex ? props.tabIndex : 0}
        onKeyUp={props.onKeyUp}
        className={`common-button-test ${props.className}`}
        disabled={props.disabled}
      >
        {props.children}
      </Button>
    </>
  );
};

export default ButtonComponent;
