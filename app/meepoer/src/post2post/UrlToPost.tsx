import React, { useState, useEffect, useCallback} from "react";
import 'antd/dist/antd.css';
import {Row, Col, Input, Form, Button, Progress, Select, message} from "antd"
import {RightOutlined, CloseOutlined, CaretDownOutlined} from "@ant-design/icons"
import { PARSE_IMG_FROM_URL, post, GPT3_REWRITE_URL, URL_TO_EMBEDDING } from "../api";
import LibraryItem from '../text2post/LibraryItem'
import {useNavigate} from 'react-router-dom';

export default(props: any) => {
    useEffect(() => {window.scrollTo(0, 0);});
    useEffect(() => {
        document.title = "Meepoer - Url-to-Post";  
      }, []);
    const [form] = Form.useForm();
    const [asset, setAsset] = useState<any[]>([])
    const [progressPercentage, setProgressPercentage] = useState(0)
    const [placeHolderVisible, setPlaceHolderVisible] = useState(true)
    const [imgs, setImgs] = useState<string[]>([])
    let [page, setPage] = useState(1)    
    const [curUrl, setCurUrl] = useState("")
    const navigate = useNavigate()
    const handleTermsClick = useCallback(() => navigate('/terms', {replace: true}), [navigate]);

    const rewriteText = async(len: number, es_data: [], lan: any) => {
        let texts = []
        for(let i = 0; i < len; i++){
          const es_item:any = es_data[i]
          const text = await post(GPT3_REWRITE_URL, {
              "text": es_item.text,
              "lan": lan
          })
          texts.push(text.data)
          setProgressPercentage(50+(i/len*100)/2)
        }
        texts.push('rewrite')
        console.log(texts)
        return texts
      }

    const getImage = async (event: any) => {
        console.log("Requesting at: " + PARSE_IMG_FROM_URL)
        try{
            const resultData = await post(PARSE_IMG_FROM_URL, {
                "source": event.source,
                "url": event.url
            })
            setImgs(resultData.data)
        }
        catch (error){
            message.error('Posts from this user cannot be retrieved, sad.');
        }
      };
    
    const handleLoadMore = () => {
        const submitBtn = document.getElementById(curUrl+"-btn")
        setPage(page+=1)
        const panel = document.getElementById('mySidepanel')
        panel ? panel.style.width = "400px" : console.log("panel error")
        submitBtn ? submitBtn.click() : console.log()
    }

    const searchImg = async (url: any) => {
        console.log("Requesting at: " + URL_TO_EMBEDDING)
        setCurUrl(url)
        setProgressPercentage(10)
        let resultData:any = []
        if(url!=curUrl){
            setCurUrl(url)
            setPage(1)
            resultData = await post(URL_TO_EMBEDDING, {
                "url": url,
                "page": 1
            })
        }else{
            resultData = await post(URL_TO_EMBEDDING, {
                "url": url,
                "page": page
            })
        }
        setProgressPercentage(50)
        const es_data: [] = resultData.data
        const texts:string [] = await rewriteText(resultData.data.length, es_data, "en")
        const combined_data = es_data.map(function(e, i){
            return [e, texts[i]]
        })
        setAsset(combined_data)
        setProgressPercentage(100)
        setPlaceHolderVisible(false)
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
                onFinish={getImage}
                autoComplete="off">
                <Form.Item
                    name="url" className="form-item"
                    rules={[{ required: true, message: 'Please enter the post url!' }]}
                >
                    <Input placeholder="post URL" />
                </Form.Item>
                <Form.Item name="source" className="form-item" 
                rules={[{ required: true, message: 'Please select the social media platform' }]}>
                    <Select style={{color:"#B2AFAF", width:"90%", marginLeft:'5%'}} placeholder="social media platform"
                    dropdownStyle={{backgroundColor:"#232322", borderColor:"#232322"}}>
                        <Select.Option style={{color: "#B2AFAF"}} value="twitter">Twitter</Select.Option>
                        <Select.Option style={{color: "#B2AFAF"}} value="instagram">Instagram</Select.Option>
                        <Select.Option style={{color: "#B2AFAF"}} value="reddit">Reddit</Select.Option>
                    </Select>
                </Form.Item>
                <Form.Item>
                    <button type="submit" style={{marginLeft:"5%"}} className="my-ant-btn ant-btn">
                        Submit
                    </button>
                </Form.Item>
            </Form>
            {imgs.map(item => {
                return <img id={item+"-btn"} className="parsed-img" src={item} onClick={() => searchImg(item)}></img>
            })}
            <Progress
            strokeColor={{
                from: '#868484',
                to: '#323131',
            }}
            percent={progressPercentage}
            status="active"
            />
                    <div style={{textAlign:"center", fontSize:"25px", color: "#B2AFAF", fontWeight: "bold", marginTop: "5%"}}>Instructions</div>
            <div className="instruction" style={{marginLeft:10, marginRight:10}}>
              
            <br/>
              By using this service, you must have read and agree to the <span style={{textDecoration:'underline'}} onClick={handleTermsClick}>
                terms and conditions</span>

              <br/>
              <br />
              Upload a post including an image from a supported website (twitter, reddit, and instagram) 
              and we will search our database for an image with similar content/background. 
              
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