export function getProcessCode(process){

    var processCode;

    if(process==="Draft "){
        processCode='L';
    }
    else if(process==="Deployed "){
        processCode='R';
    }
    else if(process==="Deployed Pending "){
        processCode='RP';
    }
    else if(process==="Enabled "){
        processCode='E';
    }
    else if(process==="Enabled Pending "){
        processCode='EP'; 
    }
    else if(process==="Pinned "){
        processCode='P';
    }
    return ([processCode])
}