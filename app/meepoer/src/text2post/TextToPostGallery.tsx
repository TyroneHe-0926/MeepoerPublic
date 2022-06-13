import React, { useState, useEffect, useCallback} from "react";
import "./style.css"
import 'antd/dist/antd.css';
import {Row, Col, Input, Form, Button, Progress, Select} from "antd"
import {RightOutlined, CloseOutlined, CaretDownOutlined} from "@ant-design/icons"
import { TEXT_IMG_SEARCH, post, GPT3_WRITE_URL } from "../api";
import LibraryItem from './LibraryItem'
import {useNavigate} from 'react-router-dom';

export default(props: any) => {
    useEffect(() => {window.scrollTo(0, 0);});
    useEffect(() => {
        document.title = "Meepoer - Text-to-Post";  
      }, []);
    const [form] = Form.useForm();
    const [asset, setAsset] = useState<any[]>([])
    const [progressPercentage, setProgressPercentage] = useState(0)
    const [placeHolderVisible, setPlaceHolderVisible] = useState(true)
    let [page, setPage] = useState(1)
    let [curTopic, setCurTopic] = useState("")
    
    const navigate = useNavigate()
    const handleTermsClick = useCallback(() => navigate('/terms', {replace: true}), [navigate]);
    const getText = async (len:number, mood:any, form:any, topic:string, textLength:any, lan:any) => {
        let texts = []
        for(let i = 0; i < len; i++){
            const text = await post(GPT3_WRITE_URL, {
                "mood": mood,
                "form": form,
                "topic": topic,
                "length": textLength,
                "lan": lan
            })
            texts.push(text.data)
            setProgressPercentage(i/len*100)
        }
        return texts
    }

    const onSearch = async (event: any) => {
        console.log("Requesting at: " + TEXT_IMG_SEARCH)
        console.log("Event is: "+ event)
        let resultData:any = []
        if(event.topic != curTopic){
            setCurTopic(event.topic)
            setPage(1)
            resultData = await post(TEXT_IMG_SEARCH, {
                "search_text": event.topic,
                "page": 1
            })
        }
        else{
            resultData = await post(TEXT_IMG_SEARCH, {
                "search_text": event.topic,
                "page": page
            })
        }
        const es_data: [] = resultData.data
        const texts:string [] = await getText(resultData.data.length, event.mood, event.form, event.topic, event.length, event.lan)
        const combined_data = es_data.map(function(e, i){
            return [e, texts[i]]
        })
        setAsset(combined_data)
        setProgressPercentage(100)
        setPlaceHolderVisible(false)
      };

    const handleLoadMore = () => {
        const submitBtn = document.getElementById('submit-search-btn')
        setPage(page+=1)
        const panel = document.getElementById('mySidepanel')
        panel ? panel.style.width = "400px" : console.log("panel error")
        submitBtn ? submitBtn.click() : console.log()
    }

    const openNav = () => {
        const panel = document.getElementById('mySidepanel')
        const panelBtn = document.getElementById('open-sidepanel-btn')
        panelBtn ? panelBtn.style.visibility = "hidden" : console.log("panel error")
        panel ? panel.style.width = "400px" : console.log("panel error")
    }

    const closeNav = () => {
        const panel = document.getElementById('mySidepanel')
        const panelBtn = document.getElementById('open-sidepanel-btn')
        panelBtn ? panelBtn.style.visibility = "visible" : console.log("panel error")
        panel ? panel.style.width = "0px" : console.log("panel error")
    }

    useEffect(() => {
        openNav()
    });

    return <>
    <div id="mySidepanel" className="sidepanel">
        <CloseOutlined className="closebtn" onClick={closeNav}></CloseOutlined>
        <div className="config">Generation Configs</div>
            <Form
                form={form}
                layout="vertical"
                onFinish={onSearch}
                autoComplete="off">
                <Form.Item
                    name="topic" className="form-item"
                    rules={[{ required: true, message: 'Please enter the desired post content!' }]}
                >
                    <Input placeholder="topic, what is the post about" />
                </Form.Item>
                <Form.Item name="mood" className="form-item">
                    <Input placeholder="mood, default is normal" />
                </Form.Item>
                <Form.Item name="form" className="form-item">
                    <Input placeholder="category, default is blog" />
                </Form.Item>
                <Form.Item name="length" className="form-item">
                    <Select style={{color:"#B2AFAF", width:"90%", marginLeft:'5%'}} placeholder="length, default is regular"
                    dropdownStyle={{backgroundColor:"#232322", borderColor:"#232322"}}>
                        <Select.Option style={{color: "#B2AFAF"}} value="short">short</Select.Option>
                        <Select.Option style={{color: "#B2AFAF"}} value="regular">regular</Select.Option>
                        <Select.Option style={{color: "#B2AFAF"}} value="long">long</Select.Option>
                    </Select>
                </Form.Item>
                <Form.Item name="lan" className="form-item">
                    <Select style={{color:"#B2AFAF", width:"90%", marginLeft:'5%'}} placeholder="language, default is English"
                    dropdownStyle={{backgroundColor:"#232322", borderColor:"#232322"}}>
                        <Select.Option style={{color: "#B2AFAF"}} value="en">English</Select.Option>
                        <Select.Option style={{color: "#B2AFAF"}} value="cn">Chinese</Select.Option>
                        <Select.Option style={{color: "#B2AFAF"}} value="jp">Japanese</Select.Option>
                    </Select>
                </Form.Item>
                <Form.Item>
                    <button id="submit-search-btn" type="submit" style={{marginLeft:"5%"}} className="my-ant-btn ant-btn">
                        Submit
                    </button>
                </Form.Item>
            </Form>
            <Progress
            strokeColor={{
                from: '#868484',
                to: '#323131',
            }}
            percent={progressPercentage}
            status="active"
            />
            <div style={{textAlign:"center", fontSize:"25px", color: "#B2AFAF", fontWeight: "bold", marginTop: "5%"}}>Instructions</div>
            <div className="instruction">

            <br/>
              By using this service, you must have read and agree to the <span style={{textDecoration:'underline'}} onClick={handleTermsClick}>
                terms and conditions</span>

              <br/>
                <br></br>
                Sample Generation with following config:
                <br></br>
                <br></br>
                <div style={{color:"#DB8585", display:"inline"}}>
                    topic (required): &nbsp;
                </div>
                Ethereum trend
                <br></br>
                <br></br>
                <div style={{color:"#DB8585", display:"inline"}}>
                    mood (tone of the post): &nbsp;
                </div>
                formal
                <br></br>
                <br></br>
                <div style={{color:"#DB8585", display:"inline"}}>
                    category (what type of post is this): &nbsp;
                </div>
                analysis
                <br></br>
                <br></br>
                <div style={{color:"#DB8585", display:"inline"}}>
                    length (short/regular/long): &nbsp;
                </div>
                regular
                <br></br>
                short: around 20 words
                <br></br>
                regular: around 50 words
                <br></br>
                long : around 150 words
                <br></br>
                <br></br>
                <div style={{color:"#DB8585", display:"inline"}}>
                    language (English/Japanese/Chinese): &nbsp;
                </div>
                English
                <br></br>
                <br></br>
                The above configuration will generate posts based on: 50 words formal analysis about Ethereum trend in English. 
            </div>
        </div>
    <RightOutlined className="openbtn" onClick={openNav}> </RightOutlined>
    <div>
        {asset.map(item => {
            return <LibraryItem asset={item[0]} text={item[1]}/>
        })}
    </div>
    <div className="gallery-place-holder" style={{display: placeHolderVisible ? "block" : "none"}}>
        Results Will Display Here
    </div>
    {!placeHolderVisible ?  <Row justify="center"> 
        <Col style={{textAlign: "center"}}><div style={{ fontSize:24 }}>Generate More Similar Posts</div>
        <CaretDownOutlined className='loadmorebtn' onClick={handleLoadMore} style={{ fontSize: '64px' }}/></Col>
      </Row> : <p></p>}
    </>
}