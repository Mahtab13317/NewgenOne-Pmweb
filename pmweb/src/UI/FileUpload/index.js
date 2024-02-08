import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useDropzone } from "react-dropzone";
import styles from "./index.module.css";
import arabicStyles from "./indexArabic.module.css";
import AttachmentIcon from "@material-ui/icons/Attachment";
import DeleteOutlineIcon from "@material-ui/icons/DeleteOutline";
import { ClickAwayListener } from "@material-ui/core";
import { RTL_DIRECTION } from "../../Constants/appConstants";

function Dropzone(props) {
  let { t } = useTranslation();
  const direction = `${t("HTML_DIR")}`;
  const [files, setFiles] = useState([]);
  const [error, setError] = useState("");
  const [acceptFileTypes, setAcceptFileTypes] = useState([]);

  useEffect(() => {
    if (props.files) {
      setFiles(props.files);
    }
  }, []);

  useEffect(() => {
    if (props.setFiles) {
      props.setFiles(files);
    }
    if (props.hasOwnProperty("setStyle")) {
      if (files.length > 0) {
        props.setStyle(true);
      } else {
        props.setStyle(false);
      }
    }
    if (props.hasOwnProperty("typesOfFilesToAccept")) {
      setAcceptFileTypes(props.typesOfFilesToAccept);
    }
  }, [files, props]);

  const { getRootProps, getInputProps, open } = useDropzone({
    // Disable click and keydown behaviour
    noClick: true,
    noKeyboard: true,
    onDrop: (acceptedFiles) => onDropOfFiles(acceptedFiles),
  });

  //function called onDrop of files
  const onDropOfFiles = (acceptedFiles) => {
    if (props.singleFileUpload && acceptedFiles && acceptedFiles.length > 1) {
      setError(
        "Maximum allowed number of files exceeded. Only 1 file allowed."
      );
      return;
    }
    acceptedFiles &&
      acceptedFiles.forEach((acceptedFile) => {
        let sameName = false;
        let typeMatch = false;
        //match whether file is from accepted types
        if (acceptFileTypes.length !== 0) {
          if (acceptFileTypes.includes(acceptedFile.type)) typeMatch = true;
          else typeMatch = false;
        } else typeMatch = true;
        setFiles((prev) => {
          let maxId = 0;
          if (prev && prev.length > 0) {
            if (props.singleFileUpload && prev.length === 1) {
              setError(
                "Maximum allowed number of files exceeded. Only 1 file allowed."
              );
              return prev;
            }
            prev.forEach((file) => {
              if (file.id > maxId) {
                maxId = file.id;
              }
              if (file.name === acceptedFile.name) {
                sameName = true;
              }
            });
          }
          if (sameName) {
            setError("A File with the Same Name Already Exists.");
            return prev;
          }
          if (!typeMatch) {
            setError("Please enter a valid file type");
            return prev;
          }
          setError("");
          if (props.returnFileAsItIs) {
            return [...prev, acceptedFile];
          }
          return [
            ...prev,
            {
              id: maxId + 1,
              name: acceptedFile.name,
              path: acceptedFile.path,
              size: acceptedFile.size,
              type: acceptedFile.type,
            },
          ];
        });
      });
  };

  //function to delete file
  const deleteFile = (id) => {
    setError("");
    let tempFiles = files?.filter((file) => file.id !== id);
    setFiles(tempFiles);
  };

  //function to convert bytes into respective size (kb, mb)
  const formatBytes = (bytes, decimals = 2) => {
    if (bytes === 0) return `0 ${t("bytes")}`;
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = [t("bytes"), t("kb"), t("mb")];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + " " + sizes[i];
  };

  //function to show files in dropzone
  const filesDiv =
    files &&
    files.map((file) => (
      <p className={styles.fileDiv}>
        <div className={styles.fileSubLeftDiv}>
          <AttachmentIcon
            className={
              direction === RTL_DIRECTION
                ? arabicStyles.attachIcon
                : styles.attachIcon
            }
          />
          <p
            className={
              direction === RTL_DIRECTION
                ? arabicStyles.subDivFile
                : styles.subDivFile
            }
          >
            {file.name}
          </p>
        </div>
        <div className={styles.fileSubRightDiv}>
          <span
            className={
              direction === RTL_DIRECTION
                ? arabicStyles.subDivSize
                : styles.subDivSize
            }
          >
            {formatBytes(file.size, 0)}
          </span>
          <DeleteOutlineIcon
            className={
              direction === RTL_DIRECTION
                ? arabicStyles.deleteIcon
                : styles.deleteIcon
            }
            onClick={() => deleteFile(file.id)}
            id="pmweb_delete_fileUpload"
          />
        </div>
      </p>
    ));

  return (
    <ClickAwayListener onClickAway={() => setError("")}>
      <div >
        <div
          className={
            props.callLocation == "UploadFile"
              ? styles.uploadContainer
              : styles.container
          }
          style={props.containerStyle ? props.containerStyle : null}
        >
          <div
            {...getRootProps({
              className:
                files.length > 0 ? styles.dropzoneWithFiles : styles.dropzone,
            })}
          >
            <label htmlFor="pmweb_input_fileUpload" style={{display: "none"}}>hjhj</label>
            <input
              className={styles.input}
              {...getInputProps()}
              id="pmweb_input_fileUpload"
            />
            {/* Changes made to solve Bug 112680 */}
            {/* <input
              {...getInputProps()}
              className={styles.input}
              id="input_fileUpload"
            /> */}
            <button
              onClick={open}
              className={
                files.length > 0 ? styles.uploadBtnWithFiles : styles.uploadBtn
              }
              id="pmweb_openFile_fileUpload"
              tabIndex={0}
            >
              {t("uploadFromDesktop")}
            </button>
            <p
              className={
                files.length > 0
                  ? direction === RTL_DIRECTION
                    ? arabicStyles.orStringWithFiles
                    : styles.orStringWithFiles
                  : styles.orString
              }
              style={{
                marginTop: "3.25rem",
                // marginTop:
                //   props.callLocation === "UploadFile" ? "3.25rem" : "3.25rem",
              }}
            >
              {t("or")}
            </p>
            <p className={styles.dropString}>
              {props.dropString ? props.dropString : t("dropFilesHere")}
            </p>
          </div>
          <div className={styles.fileContainerDiv}>{filesDiv}</div>
        </div>

        <p
          className={
            direction === RTL_DIRECTION ? arabicStyles.error : styles.error
          }
        >
          {error}
        </p>
      </div>
    </ClickAwayListener>
  );
}

export default Dropzone;
