import React, { useEffect, useState, useCallback} from "react"
import 'antd/dist/antd.css';
import { message, Button, Upload, Input, Form, Progress, Select, Row, Col} from "antd"
import {PlusOutlined, LoadingOutlined, RightOutlined, CloseOutlined, DownOutlined, CaretDownOutlined} from '@ant-design/icons/lib/icons';
import {GET_PERSON_BBOX, IMAGE_TO_EMBEDDING_URL, post, TEXT_IMG_SEARCH} from "../api";
import "react-image-gallery/styles/css/image-gallery.css";
import LibraryItem from "../text2post/LibraryItem";
import Boundingbox from "./react-bounding-box"
import "./uploader.css"
import "../text2post/style.css"
import { GPT3_WRITE_URL, GPT3_REWRITE_URL} from "../api";
import {useNavigate} from 'react-router-dom';

export default() => {
    useEffect(() => {window.scrollTo(0, 0);});
    const [selectedFile, setSelectedFile] = useState(null)
    const [inputImage, setInputImage] = useState('')
    const [detecting, setDetecting] = useState(false)
    const [asset, setAsset] = useState<any[]>([])
    const [form] = Form.useForm();
    const [progressPercentage, setProgressPercentage] = useState(0)
    const [placeHolderVisible, setPlaceHolderVisible] = useState(true)
    const [userInputCaption, setUserInputCaption] = useState(false)
    const [captionMood, setCaptionMood] = useState("")
    const [captionForm, setCaptionForm] = useState("")
    const [captionTextLength, setCaptionTextLength] = useState("")
    const [captionTopic, setcaptionTopic] = useState("")
    const [captionLan, setcaptionLan] = useState("en")
    const [editingCaption, setEditingCaption] = useState(false)
    const [captionInstruction, setCaptionInstruction] = useState(false)
    let [page, setPage] = useState(1)
    let [curSrchType, setCurSrchType] = useState("")
    let [personIndex, setPersonIndex] = useState(0)

    const navigate = useNavigate()

    const bboxOptions = {
        colors: {
          normal: 'rgba(255,0,0,1)',
          selected: 'rgba(0,225,120,1)',
          unselected: 'rgba(100,100,100,1)'
        },
        style: {
          maxWidth: '100%',
          maxHeight: '100%'
        },
        showLabels: true
    }

    const [bboxes, setBboxes] = useState<any[]>([])
    const [personBox, setPersonBox] = useState<any[]>([])

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

    const userText = async (len:number, mood:any, form:any, topic:string, textLength:any, lan:any) => {
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
          setProgressPercentage(50+(i/len*100)/2)
      }
      texts.push('user')
      console.log(texts)
      return texts
    }

    function getText(len: number, es_data: [], lan: any, mood:any, form:any, topic:string, textLength:any){
      if(!userInputCaption){
        return rewriteText(len, es_data, lan)
      } else {
        return userText(len, mood, form, topic, textLength, lan)
      }
    }

    const beforeUpload = (file: any) => {
        const isJpgOrPng = file.type === 'image/jpeg' || file.type === 'image/png';
        if (!isJpgOrPng) {
          message.error('You can only upload JPG/PNG file!');
        }
        const isLt3M = file.size / 1024 / 1024 < 3;
        if (!isLt3M) {
          message.error('Image must be smaller than 3MB!');
        }
        return isJpgOrPng && isLt3M;
      }

      const uploadButton = (
        <div>
          {detecting ? <LoadingOutlined /> : <PlusOutlined />}
          {detecting ? <div style={{ marginTop: 8 }}>Analyzing</div>: <div style={{ marginTop: 8 }}>Upload</div>}
        </div>
      );

    const handleEmbeddingSearch = async (embedding_type: string, person_bbox: [], person_index: any) => {
        console.log("Requesting at: " + IMAGE_TO_EMBEDDING_URL)
        setDetecting(true)
        setProgressPercentage(10)
        setCurSrchType(embedding_type)
        setPersonIndex(person_index)
        let resultData:any = []
        if(embedding_type != curSrchType){
          setCurSrchType(embedding_type)
          setPage(1)
          resultData = await post(IMAGE_TO_EMBEDDING_URL, {
            "file": selectedFile,
            "embedding_type": embedding_type,
            "person_bbox": person_bbox,
            "page": 1
          })
        }
        else{
          resultData = await post(IMAGE_TO_EMBEDDING_URL, {
            "file": selectedFile,
            "embedding_type": embedding_type,
            "person_bbox": person_bbox,
            "page": page
          })
        }
        setProgressPercentage(50)
        const es_data: [] = resultData.data
        const texts:string [] = await getText(resultData.data.length, es_data, captionLan, 
          captionMood, captionForm, captionTopic, captionTextLength)
        const combined_data = es_data.map(function(e, i){
            return [e, texts[i]]
        })
        setAsset(combined_data)
        setDetecting(false)
        setPlaceHolderVisible(false)
        setProgressPercentage(100)
    }
    
    const handleLoadMore = () => {
      if(curSrchType == "place"){
        const submitBtn = document.getElementById("place-search-btn")
        setPage(page+=1)
        const panel = document.getElementById('mySidepanel')
        panel ? panel.style.width = "400px" : console.log("panel error")
        submitBtn ? submitBtn.click() : console.log()
      }
      else if(curSrchType == "person"){
        const submitBtn = document.getElementById("person-"+personIndex+"-btn")
        setPage(page+=1)
        const panel = document.getElementById('mySidepanel')
        panel ? panel.style.width = "400px" : console.log("panel error")
        submitBtn ? submitBtn.click() : console.log()
      }
    }

    const handleFileSelect = (event: any) => {
      setPage(1)
      setDetecting(true)
      setBboxes([])
      setSelectedFile(event.file.originFileObj)
      setInputImage(URL.createObjectURL(event.file.originFileObj));
      setDetecting(false)
    }

    const getBbox = async() => {
        setDetecting(true)
        const bboxes = await post(GET_PERSON_BBOX, {
          "file": selectedFile
        })
        console.log(bboxes)
        setBboxes(bboxes.data)
        setPersonBox(bboxes.bboxes)
        setDetecting(false)
    }

    const saveCaption = async (event:any) => {
      setUserInputCaption(true)
      setCaptionForm(event.form)
      setCaptionMood(event.mood)
      setCaptionTextLength(event.textLength)
      setcaptionLan(event.lan)
      setcaptionTopic(event.topic)
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

    const editCaption = () => {
      const panel = document.getElementById('editCaption')
      const panelBtn = document.getElementById('open-caption-btn')
      setEditingCaption(true)
      panel ? panel.style.display = "block" : console.log("caption edit error")
    }
  
    const closeEditCaption = () => {
      const panel = document.getElementById('editCaption')
      const panelBtn = document.getElementById('open-caption-btn')
      setEditingCaption(false)
      panel ? panel.style.display = "none" : console.log("caption edit error")
    }

    const handleEditCaption = () => {
      editingCaption ? closeEditCaption() : editCaption()
    }

    const openCaptionInstruction = () => {
      const panel = document.getElementById('captionInstruction')
      const panelBtn = document.getElementById('open-caption-instruction-btn')
      setCaptionInstruction(true)
      panel ? panel.style.display = "block" : console.log("caption edit error")
    }
  
    const closeCaptionInstruction = () => {
      const panel = document.getElementById('captionInstruction')
      const panelBtn = document.getElementById('open-caption-instruction-btn')
      setCaptionInstruction(false)
      panel ? panel.style.display = "none" : console.log("caption edit error")
    }

    const handleTermsClick = useCallback(() => navigate('/terms', {replace: true}), [navigate]);

    const handleCaptionInstruction = () => {
      captionInstruction ? closeCaptionInstruction() : openCaptionInstruction()
    }
    

    useEffect(() => {
      openNav()
    });

    useEffect(() => {
      document.title = "Meepoer - Post-to-Post";  
    }, []);

    return <>
    <div id="mySidepanel" className="sidepanel">
        <CloseOutlined className="closebtn" onClick={closeNav}></CloseOutlined>
        <div className="config">Generation Configs</div>
        <Row justify="center">
          <Col>        
            <Upload
              className="avatar-uploader"
              listType="picture-card"
              showUploadList={false}
              beforeUpload={beforeUpload}
              onChange={handleFileSelect}>
              {/* { inputImage ? <img src={inputImage} alt="avatar" id="uploadedImg" style={{ maxWidth: '100%', maxHeight: '100%'}} /> : uploadButton} */}
              {inputImage&&!detecting ? <Boundingbox image={inputImage} boxes={bboxes} options={bboxOptions}/> : uploadButton}
            </Upload>
          </Col>
          <Col>
            <div style={{marginTop: "1%"}}>
              <button id="place-search-btn" className="my-ant-btn ant-btn" onClick={()=>handleEmbeddingSearch("place", [], -1)}>Search Place</button>
              <button className="my-ant-btn ant-btn" onClick={getBbox}>Detect Person</button>
            </div>
          </Col>
          <Col>
            {personBox.map((item) => (
              <button id={"person-"+item.index+"-btn"} className="my-ant-btn ant-btn" key={"person"+item.index} onClick={()=>handleEmbeddingSearch("person", item.bbox, item.index)}>Search Person {item.index}</button>
            ))}
          </Col>
        </Row>
        <br />
        <button id="open-caption-btn" style={{marginLeft:'35%'}} className="my-ant-btn ant-btn" onClick={handleEditCaption}>
                          Edit Caption
            </button> 
            <br/>
        <div id='editCaption' style={{display:'none'}}>
          <br/>
          <Form   
                  form={form}
                  layout="vertical"
                  autoComplete="off"
                  onFinish={saveCaption}>
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
                      <button type="submit" style={{marginLeft:"5%"}} className="my-ant-btn ant-btn">
                          Save Caption
                      </button>
                  </Form.Item>
              </Form>
          </div>
        
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
              Upload an image and we will search our database for an image with similar content/background by
              searching by place. If there is a person(s) in the image, you can also detect the person and
              search for someone with similar features/expressions.
              
              <br /><br/>
              Caption generation instructions (optional) 
              
              <DownOutlined onClick={handleCaptionInstruction} className="instructionbtn"/>
            </div>
            <div className="instruction" id='captionInstruction' style={{display:'none', marginLeft:10, marginRight:10}}>
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
                The above configuration will generate caption based on: 50 words formal analysis about Ethereum trend in English.

                <br></br>
                <br></br>
                
                If no caption options were received, we will return what other users have captioned the post with.
                
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