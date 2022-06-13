import React, {useEffect} from "react";
import './404style.css';
import {Row, Col} from "antd";

export default function NoPage() {
    
    useEffect(() => {window.scrollTo(0, 0);});
    useEffect(() => {
        document.title = "Meepoer - Page Not Found";  
      }, []);

    return <div className='noPageContainer'><Row justify="center">
            <Col><img style={{maxWidth:'80%'}} src='https://meepoerdata.s3.ca-central-1.amazonaws.com/web-asset/alpacayawn.jpeg' alt="Angry Alpaca"/></Col>
        </Row>
        <h1> 404 LOL </h1>
        </div>



}
