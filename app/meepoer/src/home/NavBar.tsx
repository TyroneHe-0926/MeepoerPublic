import React, { useState, useCallback, useEffect} from "react";
import "./style.css"
import 'antd/dist/antd.css';
import "react-image-gallery/styles/css/image-gallery.css";
import {Row, Col, Menu} from "antd"
import { 
    MailOutlined, AppstoreOutlined, 
    SettingOutlined, QuestionCircleOutlined
} from '@ant-design/icons';
import {useNavigate} from 'react-router-dom';

export default() => {

    const { SubMenu } = Menu;
    const [state, setState] = useState('')
    const navigate = useNavigate()

    function handleContactClick() {
        window.scroll({
          left: 0, 
          top: 10000,
          behavior: 'smooth',
        });
      }
    const handleHomeClick = useCallback(() => navigate('/home', {replace: true}), [navigate]);
    const handlePostToPostClick = useCallback(() => navigate('/post-to-post', {replace: true}), [navigate]);
    const handleTextPostDBClick = useCallback(() => navigate('/text-to-post-db', {replace: true}), [navigate]);
    const handleFaqClick = useCallback(() => navigate('/faq', {replace: true}), [navigate]);

    const handleMenuClick = (e:any) => {
        console.log('click ', e);
        setState(e.key)
    };
      
    return <>
        <Row>
            <Col xs={{span: 15}} sm={{span: 15, push: 0}}>
                <Menu   onClick={handleMenuClick} selectedKeys={[state]} mode="horizontal">
                    <Menu.Item style={{fontSize: "15px"}} key="home-logo" onClick={handleHomeClick}>
                        <img style={{width: "142px", height: "35px"}} src={require('../assets/meepoer_light_logo.jpg')}></img>
                    </Menu.Item>
                </Menu>
            </Col>
            <Col xs={{span: 9}} sm={{span: 9, push: 0}}>
                <Menu style={{justifyContent: "center", justifyItems:"center"}} onClick={handleMenuClick} selectedKeys={[state]} mode="horizontal">
                    <SubMenu key="application" icon={<AppstoreOutlined style={{fontSize:"15px"}}/>} title="Get Started">
                        <Menu.ItemGroup key="post-to-post" title="Generate from post">
                            <Menu.Item onClick={handlePostToPostClick} key="post-gen">Post to Post</Menu.Item>
                        </Menu.ItemGroup>
                        <Menu.ItemGroup title="Generate from text">
                            {/* <Menu.Item key="ai-txt-gen">Nvidia GLIDE</Menu.Item> */}
                            <Menu.Item onClick={handleTextPostDBClick} key="es-txt-gen">Text to Post</Menu.Item>
                        </Menu.ItemGroup>
                    </SubMenu>
                    <SubMenu key="setting" icon={<SettingOutlined style={{fontSize:"15px"}}/>} title="Settings">
                        <Menu.Item >
                            Coming Soon
                        </Menu.Item>
                        <Menu.Item >
                            Coming Soon
                        </Menu.Item>
                    </SubMenu>
                    <Menu.Item style={{fontSize: "15px"}} onClick={handleContactClick} key="mail" icon={<MailOutlined style={{fontSize:"15px"}}/>}>
                        Contact Us
                    </Menu.Item>
                    <Menu.Item style={{fontSize: "15px"}} onClick={handleFaqClick} key="faq" icon={<QuestionCircleOutlined style={{fontSize: "15px"}}/>}>
                        FAQ
                    </Menu.Item>
                </Menu>
            </Col>
        </Row>
    </>
}