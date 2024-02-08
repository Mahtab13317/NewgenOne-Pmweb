import React from "react";
import Snackbar from "@material-ui/core/Snackbar";
import MuiAlert from "@material-ui/lab/Alert";
import CheckCircleIcon from "@material-ui/icons/CheckCircle";
import ErrorIcon from "@material-ui/icons/Error";
import InfoIcon from "@material-ui/icons/Info";
import WarningIcon from "@material-ui/icons/Warning";
import "./index.css";
import secureLocalStorage from "react-secure-storage";

export function Alert(props) {
  return <MuiAlert elevation={6} {...props} />;
}

export default function Toast(props) {
  const {
    closeToast,
    open,
    severity,
    message,
    className,
    autoHide = true,
    alertClassName,
  } = props;
  const messageVisibilityThresholdTime = secureLocalStorage.getItem(
    "messageVisibilityThresholdTime"
  );
  const handleClose = (e, reason) => {
    if (reason === "clickaway") {
      return;
    }
    closeToast();
  };

  return autoHide ? (
    <Snackbar
      anchorOrigin={
        severity === "error" || severity === "warning"
          ? { vertical: "top", horizontal: "center" }
          : { vertical: "bottom", horizontal: "left" }
      }
      open={open}
      autoHideDuration={messageVisibilityThresholdTime}
      onClose={handleClose}
      className={className}
    >
      <Alert
        iconMapping={{
          success: <CheckCircleIcon />,
          error: <ErrorIcon />,
          warning: <WarningIcon />,
          info: <InfoIcon />,
        }}
        onClose={handleClose}
        severity={severity}
      >
        {message}
      </Alert>
    </Snackbar>
  ) : (
    <Snackbar
      anchorOrigin={
        severity === "error" || severity === "warning"
          ? { vertical: "top", horizontal: "center" }
          : { vertical: "bottom", horizontal: "left" }
      }
      open={open}
      className={className}
    >
      <Alert
        iconMapping={{
          success: <CheckCircleIcon />,
          error: <ErrorIcon />,
          warning: <WarningIcon />,
          info: <InfoIcon />,
        }}
        severity={severity}
        className={alertClassName}
      >
        {message}
      </Alert>
    </Snackbar>
  );
}
