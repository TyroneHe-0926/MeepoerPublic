import React from 'react';
import PropTypes from 'prop-types';
import GitHubButton from 'react-github-button';
import QueueAnim from 'rc-queue-anim';
import { Button } from 'antd';
// use cases: blog idea/outline, email, youtube video description, thumbnail
// continued: social media posts, video, business ideas.

import fireworks from './static/img/fireworks_post.png';
import ramen from './static/img/ramen_post.png';
import hiking from './static/img/hiking_post.png';
import setup from './static/img/setup_post.png';
import wedding from './static/img/wedding_post.png';

function Banner(props) {

  return (
    <div className="banner-wrapper">
      <QueueAnim className="banner-title-wrapper" type={props.isMobile ? 'bottom' : 'right'}>
        <div key="line" className="title-line-wrapper">
          <div
            className="title-line"
            style={{ transform: 'translateX(-64px)' }}
          />
        </div>
        <h1 key="h1">Millions of posts available in an instant</h1>
        <p key="content">
          Meepoer is the next-generation social media post generation service utilizing cutting-edge 
          machine learning models.
        </p>
        <div key="button" className="button-wrapper">
          <a href="" rel="noopener noreferrer">
            <Button type="primary">
              <a href='#page2'>Try Now</a>
            </Button>
          </a>
          <Button style={{ margin: '0 16px' }} type="primary" ghost>
          <a href='#page1'>Learn More</a>
          </Button>
        </div> 
      </QueueAnim>
      <div className="banner-image-wrapper">
        <div class="cards">
          <div class="card" style={{backgroundImage: `url(${fireworks})`, backgroundSize: '100% 100%'}}></div>
          <div class="card" style={{backgroundImage: `url(${setup})`, backgroundSize: '100% 100%'}}></div>
          <div class="card" style={{backgroundImage: `url(${wedding})`, backgroundSize: '100% 100%'}}></div>
          <div class="card" style={{backgroundImage: `url(${hiking})`, backgroundSize: '100% 100%'}}></div>
          <div class="card" style={{backgroundImage: `url(${ramen})`, backgroundSize: '100% 100%'}}></div>
        </div>
      </div>
    </div>
  );
}

Banner.propTypes = {
  isMobile: PropTypes.bool.isRequired,
};

export default Banner;
