import React, {useCallback, useEffect} from "react";
import 'antd/dist/antd.css';
import {Row, Col} from "antd"
import "./style.css"
import '../assets/bootstrap.css'
import "react-image-gallery/styles/css/image-gallery.css";
import ImageGallery from 'react-image-gallery';
import {useNavigate} from 'react-router-dom';

export default() => {
    useEffect(() => {window.scrollTo(0, 0);});
    useEffect(() => {
        document.title = "Meepoer - Text-to-Post";  
      }, []);
    const navigate = useNavigate()
    const handleTestClick = useCallback(() => navigate('/text-to-post-db-result', {replace: true}), [navigate]);
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
                            At Meepoer Text-to-Post, type the &nbsp;
                            <div className="animated-info">
                                <span className="animated-item">Instagram Posts</span>
                                <span className="animated-item">Twitter Posts</span>
                                <span className="animated-item">Reddit Posts</span>
                            </div>
                        </h1>
                        <div className="mb-4">you want, and just leave it there. We will do the rest and get your posts ready in seconds.</div>
                        <div className="d-flex flex-wrap align-items-center">
                            <button className="try-btn" onClick={handleTestClick}>Try Now</button>
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
                    <h2 style={{fontWeight: "700", fontSize:"40px"}}>Meepoer Text-to-Post</h2>
                    <p style={{color:"grey", fontSize: "20px"}}>No idea what to post on your social media accounts? Leave it to Meepoer! Just tell us a topic and we will 
                    generate the caption and an appropriate image using <span><i>magic</i></span>. Want to post about your Grand Canyon trip but forgot to take pictures? Try generating 
                    the following topics: </p>

                    <ul style={{color:"grey", fontSize: "20px"}}>
                        <li><i>Grand Canyon was so fun!</i></li>
                        <li><i>I just had the time of my life at the Grand Canyon!</i></li>
                        <li><i>Check out my weekend at the Grand Canyon!</i></li>
                    </ul>
                    <p style={{color:"grey", fontSize: "20px"}}>The sky is the limit. We currently support captions in English, Chinese, and Japanese with support for 
                    more languages on the way. Use the Meepoer text to post feature to step up your social media game.</p>
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
                    src="https://www.youtube.com/embed/wmzxlaMm7b8" 
                    title="YouTube video player" 
                    frameBorder="0" 
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                    allowFullScreen>
                    </iframe>
                </Col>
                <Col xs={{span: 24}} sm={{span: 18, push: 3}}  xl={{span: 6, push: 5}} xxl={{span:7, push: 4}}>
                    <h2 className="demo-title" style={{fontWeight: "700", fontSize:"40px"}}>Text to Post Demo</h2>
                    <div className="demo-text" style={{color:"grey", fontSize: "20px"}}>Here we have a small demo of turning <br></br>
                    <span><i style={{fontWeight:"bold"}}>"I just had the time of my life at the Grand Canyon!"
                    and "Ethereum trends (formal analysis)"</i></span>
                    <br></br>into social media posts with different languages and mood. We support even more options like post length and post category.
                    With all the options to make just the post you desire, start exploring the full potential of Meepoer Text to Post now!
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
                                    <div className="timeline-text">Come up with the post's content, what is the post going to be about. In the example, we used "I just had the time of my life at the Grand Canyon."</div>
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
                                    <h3 className="timeline-head-text">Details of the Post</h3>
                                    <div className="timeline-text">Now you can config the post details. Including the post's mood, category, length, and more. You can also check how we configured our post in the demo video.</div>
                                </div>
                            </div>
                        </Col>
                    </Row>
                    <Row justify="start">
                        <Col xs={{span: 17,order: 2, push: 3}} md={{span: 18,order: 1, push: 5}}  xl={{span: 16,order: 1, push: 6}} xxl={{span: 16,order: 1, push: 6}}>
                            <div className="timeline-nodes-odd">
                                <div className="timeline-content bg-white shadow-lg">
                                    <h3 className="timeline-head-text">Post Databse Search</h3>
                                    <div className="timeline-text">After all the configuration is done. It's time to get start generating the posts. First we will go through our post databse to find the top matches</div>
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
                                    <div className="timeline-text">Now we will generate and adjust the post's content based on the initial configuration.<br></br><br></br></div>
                                </div>
                            </div>
                        </Col>
                    </Row>
                    <Row justify="start">
                        <Col xs={{span: 17,order: 2, push: 3}} md={{span: 18,order: 1, push: 5}}  xl={{span: 16,order: 1, push: 6}} xxl={{span: 16,order: 1, push: 6}}>
                            <div className="timeline-nodes-odd">
                                <div className="timeline-content bg-white shadow-lg">
                                    <h3 className="timeline-head-text">Check Your Posts</h3>
                                    <div className="timeline-text">Post generation finished, check the gallery of your generated posts and build your social media profile within seconds!<br></br><br></br></div>
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

    <section className="section-padding">
        <div className="container">
            <Row justify="center" align="middle">
                <Col span={20}>
                        <div className="end-btn" onClick={handleTestClick}>
                            <p>Generate Now</p>
                            <span className="BorderTopBottom"></span>
                            <span className="BorderLeftRight"></span>
                        </div>
                </Col>
            </Row>
        </div>
    </section>
</div>
}