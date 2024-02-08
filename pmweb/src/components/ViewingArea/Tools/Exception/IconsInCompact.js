import React from 'react';
import AddCircleOutlineIcon from '@material-ui/icons/AddCircleOutline';
import VisibilityIcon from '@material-ui/icons/Visibility';
import EditIcon from '@material-ui/icons/Edit';
import DeleteIcon from '@material-ui/icons/Delete';
import CloudDownloadIcon from '@material-ui/icons/CloudDownload';
import PrintIcon from '@material-ui/icons/Print';

function IconsInCompact(props) {
    return (
        <div style={{display:'flex', alignItems:'center', justifyContent:'space-between', padding:'10px 16px'}}>
            <AddCircleOutlineIcon style={{height:'16px', width:'16px'}}/>
            <VisibilityIcon style={{height:'16px', width:'16px'}}/>
            <EditIcon style={{height:'16px', width:'16px'}}/>
            <DeleteIcon style={{height:'16px', width:'16px'}}/>
            <CloudDownloadIcon style={{height:'16px', width:'16px'}}/>
            <PrintIcon style={{height:'16px', width:'16px'}}/>
        </div>
    );
}

export default IconsInCompact;