export function ProcessButtonType(processType){
        var buttonColor;
        var buttonText;
        if(processType==="Draft"){
            buttonColor='#4088DC';
            buttonText='DRAFT'
        }
        else if(processType==="Disabled"){
            buttonColor='#F5A623';
            buttonText='DISABLED'
        }
        else if(processType==="Enabled"){
            buttonColor='#39C3A4';
            buttonText='ENABLED'
        }
    
        return ([buttonColor,buttonText])
    }