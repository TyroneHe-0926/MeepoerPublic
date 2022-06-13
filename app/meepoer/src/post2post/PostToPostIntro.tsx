import React, {useCallback, useEffect} from "react";
import 'antd/dist/antd.css';
import {Row, Col, Button, Card} from "antd"
import { OverPack } from 'rc-scroll-anim';
import "../text2post/style.css"
import '../assets/bootstrap.css'
import "react-image-gallery/styles/css/image-gallery.css";
import QueueAnim from "rc-queue-anim";
import ImageGallery from 'react-image-gallery';
import {useNavigate} from 'react-router-dom';

export default() => {
    useEffect(() => {window.scrollTo(0, 0);});
    useEffect(() => {
        document.title = "Meepoer - Post-to-Post";  
      }, []);
    const navigate = useNavigate()
    const handleTestClick = useCallback(() => navigate('/image-to-post-gallery', {replace: true}), [navigate]);
    const handleTestUrlClick = useCallback(() => navigate('/url-to-post-gallery', {replace: true}), [navigate]);
    const galleryImages = [
        {
            original: 'https://meepoerdata.s3.ca-central-1.amazonaws.com/web-asset/616262-instagram-wallpaper.jpg',
            width: 1920,
            height: 1080
          },
          {
            original: 'https://meepoerdata.s3.ca-central-1.amazonaws.com/web-asset/551548-twitter-wallpaper-top-free-twitter-background.jpg',
            width: 1920,
            height: 1080
          },
          {
            original: 'https://meepoerdata.s3.ca-central-1.amazonaws.com/web-asset/reddit-orange-logo-wallpaper.jpg',
            width: 1920,
            height: 1080
          },
    ]

    return <div>
    <section className="hero">
        <div className="container">
            <Row justify="center" align="middle">
                <Col xs={{span: 24}} sm={{span: 18, push: 0}}>
                    <ImageGallery showPlayButton={false} showFullscreenButton={false} 
                        autoPlay={true} showNav={false} items={galleryImages} slideDuration={300}
                        showThumbnails={false} useTranslate3D={false} slideInterval={2000}/>
                    <div className="heroText justify-content-center">
                        <h1 className="mt-auto mb-2">
                            At Meepoer Post-to-Post, upload an image to generate &nbsp;
                            <div className="animated-info">
                                <span className="animated-item">Instagram Posts</span>
                                <span className="animated-item">Twitter Posts</span>
                                <span className="animated-item">Reddit Posts</span>
                            </div>
                        </h1>
                        <div className="mb-4">based on your input and caption options. After a few seconds of
                        analyzing, share the best posts with your friends. </div>
                        <div className="d-flex flex-wrap align-items-center">
                            <button className="try-btn"> <a href='#getstarted'>Try Now</a></button>
                            <div style={{marginLeft: "10%", marginTop: "1%"}}>
                                Scroll down to learn more
                            </div>
                            <div className="scroll-arrows">
                                <svg id="scroll-arrows"className="arrows">
                                        <path className="a1" d="M0 4 L20 16 L40 4"></path>
                                        <path className="a2" d="M0 20 L20 32 L40 20"></path>
                                        <path className="a3" d="M0 36 L20 47 L40 36"></path>
                                </svg>
                            </div>
                        </div>
                    </div>
                </Col>
            </Row>
        </div>
    </section>

    <section className="section-padding">
        <div className="container">
            <Row>
                <Col xs={{span: 24}} sm={{span: 18, push: 3}} xl={{span: 17, push: 3}} xxl={{span: 18, push: 3}}>
                    <h2 style={{fontWeight: "700", fontSize:"40px"}}>Meepoer Post-to-Post</h2>
                    <p style={{color:"grey", fontSize: "20px"}}>No idea what to post on your social media accounts? Leave it to Meepoer! 
                    Upload a picture and customize your caption (optional) and we will generate a gallery of similar posts using <span><i>magic</i></span>. 
                    Having the perfect sunset picture to go with an inspirational caption? We can turn that idea into shareable posts. </p>
                    <p style={{color:"grey", fontSize: "20px"}}>You can use either our text-to-post caption generation or leave it to us. We will reference what others have 
                    captioned the image and rewrite it.</p>
                    <p style={{color:"grey", fontSize: "20px"}}>The sky is the limit. We currently generate captions in English, Chinese, and Japanese with support for 
                    more languages on the way. Use the Meepoer post-to-post feature to step up your social media game.</p>
                </Col>
                <Col pull={4}>
                    <div id="info-circle" className="featured-circle bg-white shadow-lg d-flex justify-content-center align-items-center">
                        <div className="featured-text">
                            <span className="featured-number">3,000,000+</span>
                            <br></br>
                            <div style={{fontSize:"30px", fontWeight:"600", color: "grey"}}>posts ready</div>
                        </div>
                    </div>
                </Col>
            </Row>
        </div>
    </section>

    <section className="section-padding-2">
        <div className="container">
            <Row align="middle">
                <Col xs={{span: 24}} sm={{span: 18, push: 3}}  xl={{span: 9, push: 3}} xxl={{span: 9, push: 3}}>
                    <iframe className="demo-video"
                    src="https://www.youtube.com/embed/4WFA6wt1E84" 
                    title="YouTube video player" 
                    frameBorder="0" 
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                    allowFullScreen>
                    </iframe>
                </Col>
                <Col xs={{span: 24}} sm={{span: 18, push: 3}}  xl={{span: 6, push: 5}} xxl={{span:7, push: 4}}>
                    <h2 className="demo-title" style={{fontWeight: "700", fontSize:"40px"}}>Post-to-Post Demo</h2>
                    <div className="demo-text" style={{color:"grey", fontSize: "20px"}}>Here is a demo of post generation from
                    a <br></br>
                    <span><i style={{fontWeight:"bold"}}> cool picture of the White Rock Pier in White Rock, BC.</i> and a 
                    </span><span><i style={{fontWeight:"bold"}}> tweet url of a rocket ship.</i></span>
                    <br></br>Meepoer can glow up your pictures into social media posts with captions in different languages and mood. 
                    We support even more options like caption length and category (blog, emails, etc.).
                    Start exploring the full potential of Meepoer Post-to-Post now!
                    </div>
                </Col>
            </Row>
        </div>
    </section>

    <section className="section-padding">
        <div className="container">
            <Row align="middle" justify="center">
                <Col>
                    <h2 style={{fontWeight: "700", fontSize:"40px", marginBottom:"10%"}}>Inside The Process</h2>
                </Col>
            </Row>
            <Row justify="start">
                <div className="timeline">
                    <Row justify="start">
                        <Col xs={{span: 17,order: 2, push: 3}} md={{span: 18,order: 1, push: 5}}  xl={{span: 16,order: 1, push: 6}} xxl={{span: 16,order: 1, push: 6}}>
                            <div className="timeline-nodes-odd">
                                <div className="timeline-content bg-white shadow-lg">
                                    <h3 className="timeline-head-text">What is the Post About</h3>
                                    <div className="timeline-text">Upload your favorite picture, we will find similar/related pictures. In the example, we used a dog.</div>
                                </div>
                            </div>
                        </Col>
                        <Col xs={{span: 4,order: 1, push: 3}} md={{span: 2,order: 2, push: 7}}  xl={{span: 2,order: 2, push: 10}} xxl={{span: 2,order: 2, push: 10}}>
                            <div className="timeline-icons" style={{textAlign: "center"}}>
                                <i className="bi-chat-left-dots-fill timeline-icon"></i>
                            </div>
                        </Col>
                    </Row>
                    <Row justify="end">
                        <Col xs={{span: 4,order: 1}} md={{span: 2,order: 1, push: 21}}  xl={{span: 2,order: 1, push: 20}} xxl={{span: 2,order: 1, push: 20}}>
                            <div className="timeline-icons" style={{textAlign: "center"}}>
                                <i className="bi-gear-fill timeline-icon"></i>
                            </div>
                        </Col>
                        <Col xs={{span: 17,order: 2}} md={{span: 18,order: 2, push: 23}}  xl={{span: 16,order: 2, push: 24}} xxl={{span: 16,order: 2, push: 24}}>
                            <div className="timeline-nodes-even">
                                <div className="timeline-content bg-white shadow-lg">
                                    <h3 className="timeline-head-text">Caption of the Post</h3>
                                    <div className="timeline-text">Now you can configure the post caption. You can change
                                    the caption's mood, category, length, and more. You can also leave it to Meepoer to come up with fitting captions.</div>
                                </div>
                            </div>
                        </Col>
                    </Row>
                    <Row justify="start">
                        <Col xs={{span: 17,order: 2, push: 3}} md={{span: 18,order: 1, push: 5}}  xl={{span: 16,order: 1, push: 6}} xxl={{span: 16,order: 1, push: 6}}>
                            <div className="timeline-nodes-odd">
                                <div className="timeline-content bg-white shadow-lg">
                                    <h3 className="timeline-head-text">Post Databse Search</h3>
                                    <div className="timeline-text">After all the configuration is done. It's time to start generating the posts. First we will compare your image with millions of others in our databse to find the top matches</div>
                                </div>
                            </div>
                        </Col>
                        <Col xs={{span: 4,order: 1, push: 3}} md={{span: 2,order: 2, push: 7}}  xl={{span: 2,order: 2, push: 10}} xxl={{span: 2,order: 2, push: 10}}>
                            <div className="timeline-icons" style={{textAlign: "center"}}>
                                <i className="bi-search timeline-icon"></i>
                            </div>
                        </Col>
                    </Row>
                    <Row justify="end">
                        <Col xs={{span: 4,order: 1}} md={{span: 2,order: 1, push: 21}}  xl={{span: 2,order: 1, push: 20}} xxl={{span: 2,order: 1, push: 20}}>
                            <div className="timeline-icons" style={{textAlign: "center"}}>
                                <i className="bi-cloud-arrow-up-fill  timeline-icon"></i>
                            </div>
                        </Col>
                        <Col xs={{span: 17,order: 2}} md={{span: 18,order: 2, push: 23}}  xl={{span: 16,order: 2, push: 24}} xxl={{span: 16,order: 2, push: 24}}>
                            <div className="timeline-nodes-even">
                                <div className="timeline-content bg-white shadow-lg">
                                    <h3 className="timeline-head-text">Post Content Generation</h3>
                                    <div className="timeline-text">Then we will generate and adjust the post's caption based on the initial configuration.<br></br><br></br></div>
                                </div>
                            </div>
                        </Col>
                    </Row>
                    <Row justify="start">
                        <Col xs={{span: 17,order: 2, push: 3}} md={{span: 18,order: 1, push: 5}}  xl={{span: 16,order: 1, push: 6}} xxl={{span: 16,order: 1, push: 6}}>
                            <div className="timeline-nodes-odd">
                                <div className="timeline-content bg-white shadow-lg">
                                    <h3 className="timeline-head-text">Check and Share Your Posts</h3>
                                    <div className="timeline-text">Voila, the generation process is finished. Check the gallery of generated posts just for you and share them to your profile within clicks!<br></br><br></br></div>
                                </div>
                            </div>
                        </Col>
                        <Col xs={{span: 4,order: 1, push: 3}} md={{span: 2,order: 2, push: 7}}  xl={{span: 2,order: 2, push: 10}} xxl={{span: 2,order: 2, push: 10}}>
                            <div className="timeline-icons" style={{textAlign: "center"}}>
                                <i className="bi-patch-check-fill timeline-icon"></i>
                            </div>
                        </Col>
                    </Row>
                </div>
            </Row>
        </div>
    </section>

    <div className="home-page page2" id='getstarted'>
      <div className="home-page-wrapper">
        <div className="title-line-wrapper page2-line">
          <div className="title-line" />
        </div>
        <h2>Get Started <span>Now</span></h2>
        <OverPack>
          <QueueAnim key="queue" type="bottom" leaveReverse className="page2-content">
            <p key="p" className="page-content">
              Try our Post-to-Post or Url-to-Post features:
            </p>
            <div className='site-card-wrapper'>
            <Row justify="center" gutter={[48, 24]}>
              <Col md={20} lg={8}>              
              
                <Card hoverable title='Post-to-Post' style={{height:'400px'}}>
                <div className='intro-text'>
                  Upload your own picture and a topic and we will find similar pictures and
                  AI-generated captions for your next post. Start here if you have an
                  image prepared.
                </div>
                <div key="button" style={{ marginTop:88}}>
                  <Button type="primary" onClick={handleTestClick}>Try Post-to-Post</Button>
                </div>
                </Card>

              </Col>
              <Col md={20} lg={8}>
              
                <Card hoverable title='Url-to-Post' style={{height:'400px'}}>
                  <div className='intro-text'>
                    Upload an url of a post from supported social media
                    and we will find similar pictures and
                    AI-generated captions for your own post. Start here if you have a post prepared.
                  </div>
                  <div key="button" style={{ marginTop: 88}}>
                    <Button type="primary" onClick={handleTestUrlClick}>Try Url-to-Post</Button>
                  </div>
                  </Card>

              </Col>
            </Row>
          </div>
          </QueueAnim>
        </OverPack>
      </div>
    </div>
</div>
}