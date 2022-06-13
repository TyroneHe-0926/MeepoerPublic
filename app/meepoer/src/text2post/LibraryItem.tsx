import React, { useState} from "react";
import { Card, Modal, Divider, Row, Col, Button} from 'antd';
import { FullscreenOutlined, HeartOutlined, ShareAltOutlined} from "@ant-design/icons"
import "./style.css"
import _ from 'lodash';
import {
    FacebookShareButton, RedditShareButton, TwitterShareButton, EmailShareButton,
    FacebookIcon, RedditIcon, TwitterIcon, EmailIcon
} from "react-share"

const { Meta } = Card;

export default(props: any) => {

    let hashtags: [] = props.asset.hashtags ? props.asset.hashtags : []
    const [id] = useState(_.uniqueId('prefix-'));
    
    const [fullVisible, setFullVisible] = useState(false);

    const showFull = () => {
        setFullVisible(true);
    };
    
    const hideFull = () => {
        setFullVisible(false);
    };

    const handleLikeClick = () => {
        const likeBtn = document.getElementById('heart'+id)
        likeBtn ? likeBtn.style.color = "red" : console.log("")
    }

    const handleShareClick = () => {
        const shareContainer = document.getElementById("share"+id)
        shareContainer ? shareContainer.style.visibility = "visible": console.log("")
        shareContainer ? shareContainer.style.height = "100%": console.log("")
    }

    return <>
        <Modal title="Preview Full Post" visible={fullVisible} onOk={hideFull} onCancel={hideFull}>    
            <img className="post-img" src={props.asset.url}/>
            <Divider></Divider>
            <div className="post-content">
                <div className="description">
                    {props.text}
                    {hashtags.map(hashtag => {
                        return " #"+hashtag
                    })}
                </div>
            </div>
        </Modal>
        <Row justify="center" align="middle" style={{marginBottom: "5%"}}>
            <Col span={8}>
                <Card
                hoverable
                title="Preview Post"
                style={{ width: "100%" }}
                cover={<img id={"cover-img-"+id} src={props.asset.url}/>}>
                    <div className="card-button-container">
                        <HeartOutlined id={"heart"+id} onClick={handleLikeClick} className="card-button-heart"></HeartOutlined>
                        <ShareAltOutlined onClick={handleShareClick} className="card-button-share"></ShareAltOutlined>
                        <FullscreenOutlined onClick={showFull} className="card-button-more"></FullscreenOutlined>
                    </div>
                    <div id={"share"+id} onClick={handleShareClick} className="card-button-container" style={{height: "0px", visibility: "hidden"}}>
                        <FacebookShareButton url={props.asset.url} quote={(props.text)} style={{paddingRight:"2%"}}>
                            <FacebookIcon size={28}></FacebookIcon>
                        </FacebookShareButton>
                        <TwitterShareButton url={props.asset.url} title={(props.text)} hashtags={hashtags} style={{paddingRight:"2%"}}>
                            <TwitterIcon size={28}></TwitterIcon>
                        </TwitterShareButton>
                        <RedditShareButton url={props.asset.url} title={(props.text)} style={{paddingRight:"2%"}}>
                            <RedditIcon size={28}></RedditIcon>
                        </RedditShareButton>
                        <EmailShareButton url={props.asset.url} subject="Sharing My Post" body={(props.text)} style={{paddingRight:"2%"}}>
                            <EmailIcon size={28}></EmailIcon>
                        </EmailShareButton>
                    </div>
                    <div className="card-post-content">{props.text}<br></br><br></br></div>
                    <Meta description={"Likes: "+props.asset.likes}/>
                </Card>
            </Col>
        </Row>
        <script crossOrigin="true" src="http://3.99.16.231:3000/"></script>
    </>
}