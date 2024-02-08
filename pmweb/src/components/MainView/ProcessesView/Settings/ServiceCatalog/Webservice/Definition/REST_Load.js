import React, { useState } from "react";
import FileUpload from "../../../../../../../UI/FileUpload";
import styles from "../index.module.css";

function REST_Load(props) {
  const [files, setFiles] = useState([]);
  return (
    <div className={styles.webSDefinition}>
      <FileUpload setFiles={setFiles} files={files} />
    </div>
  );
}

export default REST_Load;
