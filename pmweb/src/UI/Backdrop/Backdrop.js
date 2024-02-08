import React from "react";

import "./Backdrop.css";

const backdrop = (props) =>
  props.show ? (
    <div
      className="Backdrop"
      onClick={props.clicked}
      id="pmweb_backdrop"
      // tabIndex={-1}
      style={{ ...props.style }}
      aria-hidden="true"
    ></div>
  ) : null;

export default backdrop;
