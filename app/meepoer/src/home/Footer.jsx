import React, {useCallback} from 'react';
import { Row, Col, Button } from 'antd';
import {
  FacebookShareButton, RedditShareButton, TwitterShareButton, EmailShareButton,
  FacebookIcon, RedditIcon, TwitterIcon, EmailIcon
} from "react-share"
import {useNavigate} from 'react-router-dom';

function Footer() {
  const domainname = '3.99.16.231'
  const navigate = useNavigate();
  const handlet2pclick = useCallback(() => navigate('/text-to-post-db', {replace: true}), [navigate]);
  const handlep2pclick = useCallback(() => navigate('/post-to-post', {replace: true}), [navigate]);
  const handlehomeclick = useCallback(() => navigate('/', {replace: true}), [navigate]);
  const handletermsclick = useCallback(() => navigate('/terms', {replace: true}), [navigate]);
  const handlefaqclick = useCallback(() => navigate('/faq', {replace: true}), [navigate]);
  return (
    <footer id="footer" className="dark">
      <div className="footer-wrap">
        <Row>
          <Col lg={6} sm={24} xs={24}>
          <img src={require('../assets/meepoer_dark_logo.png')} style={{width:329, height:100}}></img>
          </Col>
          <Col lg={9} sm={24} xs={24}>
            <div className="footer-center">
              <h2>Resources</h2>
              <div>
                <a href='#' onClick={handlehomeclick}>
                  Home
                </a>
              </div>
              <div>
                <a href="#" onClick={handlep2pclick}>
                  Post-to-Post
                </a>
              </div>
              <div>
                <a href="#" onClick={handlet2pclick}>
                  Text-to-Post
                </a>
              </div>
              <div>
                <a href='#' onClick={handlefaqclick}>
                  FAQ
                </a>
              </div>
              <div>
                <a onClick={handletermsclick}>
                  Terms of Use
                </a>
              </div>
            </div>
          </Col>
          <Col lg={9} sm={24} xs={24}>
            <div className="footer-center">
              <h2>
                Support Us
              </h2>
              <div>
                <a target="_blank" rel="noopener" href="https://ko-fi.com/meepoer">Buy Us a Coffee</a>
              </div>
              <br />
              <h2>
                Share
              </h2>
              <div style={{width:'140px'}}>
                <FacebookShareButton url={domainname} quote='You should check out Meepoer, a social media post generation service!'
                style={{paddingRight:"2%"}}>
                    <FacebookIcon size={30}></FacebookIcon>
                </FacebookShareButton>
                <TwitterShareButton url={domainname} title='You should check out Meepoer, a social media post generation service!'
                style={{paddingRight:"2%"}}>
                    <TwitterIcon size={30}></TwitterIcon>
                </TwitterShareButton>
              
                <RedditShareButton url={domainname} title='You should check out Meepoer, a social media post generation service!'
                style={{paddingRight:"2%"}}>
                    <RedditIcon size={30}></RedditIcon>
                </RedditShareButton>
                <EmailShareButton url={domainname} subject='You should check out Meepoer, a social media post generation service!'
                style={{paddingRight:"2%"}}>
                    <EmailIcon size={30}></EmailIcon>
                </EmailShareButton>
                </div>
                <div>Email: meepoer@126.com</div>
            </div>
          </Col>
        </Row>
      </div>
    </footer>
  );
}


export default Footer;
