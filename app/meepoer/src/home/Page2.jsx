import React, {useCallback} from 'react';
import { OverPack } from 'rc-scroll-anim';
import QueueAnim from 'rc-queue-anim';
import { Button, Row, Col, Card } from 'antd';
import {useNavigate} from 'react-router-dom';


function Page2() {

  const navigate = useNavigate();
  const handleTryNowClick = useCallback(() => navigate('/text-to-post-db', {replace: true}), [navigate]);
  const handleTryNowClickp2p = useCallback(() => navigate('/post-to-post', {replace: true}), [navigate]);

  return (
    <div className="home-page page2" id='page2'>
      <div className="home-page-wrapper">
        <div className="title-line-wrapper page2-line">
          <div className="title-line" />
        </div>
        <h2>Get Started <span>Now</span></h2>
        <OverPack>
          <QueueAnim key="queue" type="bottom" leaveReverse className="page2-content">
            <p key="p" className="page-content">
              Try our Post-to-Post or Text-to-Post features:
            </p>
            <div className='site-card-wrapper'>
            <Row justify="center" gutter={[48, 24]}>
              <Col md={20} lg={8}>              
              
                <Card hoverable title='Post-to-Post'>
                <div className='intro-text'>
                  Upload your own picture and a topic and we will find similar pictures and
                  AI-generated captions/content for your next post. Start here if you have an
                  image prepared.
                </div>
                <div key="button" style={{ marginTop: 88 }}>
                  <Button type="primary" onClick={handleTryNowClickp2p}>Try Post-to-Post</Button>
                </div>
                </Card>

              </Col>
              <Col md={20} lg={8}>
              
                <Card hoverable title='Text-to-Post'>
                  <div className='intro-text'>
                    Upload your own topic and we will find related pictures and
                    AI-generated captions/content for your next post. Start here if you don't have 
                    an image prepared.
                  </div>
                  <div key="button" style={{ marginTop: 88 }}>
                    <Button type="primary" onClick={handleTryNowClick}>Try Text-to-Post</Button>
                  </div>
                  </Card>

              </Col>
            </Row>
          </div>
          </QueueAnim>
        </OverPack>
      </div>
    </div>
  );
}

export default Page2;
