import React from 'react';
import AspectRatioIcon from '@material-ui/icons/AspectRatio';
import LibraryBooksIcon from '@material-ui/icons/LibraryBooks';
import RemoveIcon from '@material-ui/icons/Remove';
import AddIcon from '@material-ui/icons/Add';
import './index.css';

function zoomInOut(props) {
    return (
        <div className='zoomFloatingTag'>
            <AspectRatioIcon style={{height:'14px', width:'14px'}}/>
            <LibraryBooksIcon style={{height:'14px', width:'14px'}}/>
            <p>|</p>
            <AspectRatioIcon style={{height:'14px', width:'14px'}}/>
            <AddIcon style={{height:'14px', width:'14px'}}/>
            <RemoveIcon style={{height:'14px', width:'14px'}}/>
            <p style={{fontSize:'12px'}}>100%</p>
        </div>
    );
}

export default zoomInOut;