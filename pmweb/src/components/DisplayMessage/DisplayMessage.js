import React , {useEffect} from 'react';
import { useTranslation } from "react-i18next";
import classes from './DisplayMessage.module.css';
import  { messageType } from '../../Constants/appConstants';

function DisplayMessage(props){

    //t is our translation function
    let { t } = useTranslation();

    let display = props.displayMessage.display;
    let message = props.displayMessage.message;
    let typeOfMessage = messageType.default;
    let messageTime = 5000; //time in milliseconds
    let position = {
        x : 450,
        y : 250
    }

    if(props.typeOfMessage  != null) {
        typeOfMessage =  props.typeOfMessage ;
    }

    if(props.messageTime != null){
        messageTime = props.messageTime;
    }

    if(props.position != null){
        position = props.position;
    }
    let displayContent = null;

    let style = {
        position : "absolute",
        top : position.y + 'px',
        left : position.x + 'px'
    }

    let secondParameterOfT = null;
    if(message.defaultWord != null){
        secondParameterOfT = message.defaultWord;
    }
    else if(message.parameterTranslation != null){
        secondParameterOfT = message.parameterTranslation;
    }

    if(display){
        displayContent = (
            <div className = {classes.DisplayMessage} style = {style} >
                
                    {/* <img src = {typeOfMessage.icon} /> */}
                    <strong style = {{display : "block"}}> {t(typeOfMessage.langKey , typeOfMessage.defaultWord)} </strong>
                
                <p>{t(message.langKey , secondParameterOfT)}</p>
            </div>
        );
    }

    useEffect(() => {
        if(display === true){
            setTimeout(() => {
                props.setDisplayMessage(null, false);
            }, messageTime);
        }
    });

    return (
        <React.Fragment>
            {displayContent}
        </React.Fragment>
    )
}

export default DisplayMessage;