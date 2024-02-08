import React, {useState} from 'react';
import { useTranslation } from "react-i18next";
import { makeStyles } from '@material-ui/core/styles';
import TableData from '../../../src/UI/TableData/TableData';
import MoreVertIcon from '@material-ui/icons/MoreVert';


let useStyles = makeStyles({
    root : {
        fontFamily : 'Open Sans , sans-serif',
        fontWeight : '600',
        fontSize : '16px'
    },
    svgIconSmall : {
        fontSize : '1.12rem',
    }
})

const Processes = (props) => {
    const classes = useStyles();
    let { t } = useTranslation();

    const headCells = [
        { id: 'processName', label: t("processView.ProcessName"), sort : true , width : '215px' , styleTdCell : {minWidth:'215px',paddingLeft: '10px', height: '40px'}},
        { id: 'version', label:  t("processView.Version") , sort : false , width : '100px' , styleTdCell : {minWidth:'100px', height: '40px'} },
        { id: 'Owner', label:  t("processView.Owner"), sort : false , width : '100px', styleTdCell : {minWidth:'100px', height: '40px'} },
        { id: 'CreatedOn', label:t("processView.CreatedOn") , sort : true , width : '130px' , styleTdCell : {minWidth:'130px', height: '40px'}},
        { id: 'LastUpdatedOn', label: t("processView.LastUpdatedOn"), sort : true , width : '130px' , styleTdCell : {minWidth:'130px', height: '40px'}},
        { id: 'Dots', label: '' , sort : false},
    ];

    const rows = props.List.map((projectData , index) => ({
        rowId : projectData.ProjectId,
        version: projectData.Version,
        processName : projectData.processName,
        Owner : projectData.Owner,
        LastUpdatedOn: projectData.LastUpdatedOn,
        CreatedOn: projectData.CreatedOn,
        Dots: <MoreVertIcon htmlColor = '#AEAEAE'/>
    }));

    return (
        <div style={{backgroundColor:'white', margin: 'green 10px solid'}}>
            <TableData divider = {true} tableHead = {headCells} rows = {rows}/>
        </div>
    );
}

export default Processes;