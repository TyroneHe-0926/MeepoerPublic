import React from 'react';
import PropTypes from 'prop-types';
import OverPack from 'rc-scroll-anim/lib/ScrollOverPack';
import Parallax from 'rc-scroll-anim/lib/ScrollParallax';
import QueueAnim from 'rc-queue-anim';
import TweenOne from 'rc-tween-one';
import {
  InstagramOutlined, YoutubeOutlined,
  TwitterOutlined, EditOutlined,
  RedditOutlined, BulbOutlined,
  CloudUploadOutlined, GlobalOutlined, MailOutlined
} from '@ant-design/icons';


const { TweenOneGroup } = TweenOne;

const featuresCN = [
  {
    title: 'Instagram',
    content: 'Generate Instagram posts',
    src: <InstagramOutlined style={{ fontSize: '24px', color: 'palevioletred' }} />,
    color: 'palevioletred',
    shadowColor: 'rgba(19,194,194,.12)',
  },
  {
    title: 'Twitter',
    content: 'Generate Twitter posts',
    src: <TwitterOutlined style={{ fontSize: '24px', color: 'skyblue' }} />,
    color: 'skyblue',
    shadowColor: 'rgba(47,84,235,.12)',
  },
  {
    title: 'Reddit',
    content: 'Generate Reddit posts',
    src: <RedditOutlined style={{ fontSize: '24px', color: 'orangered' }} />,
    color: 'orangered',
    shadowColor: 'rgba(245,34,45,.12)',
  },
  {
    title: 'Youtube',
    content: 'Generate Youtube captions',
    src: <YoutubeOutlined style={{ fontSize: '24px', color: '#F5222D' }} />,
    color: '#F5222D',
    shadowColor: 'rgba(26,196,77,.12)',
  },
  {
    title: 'Ideas',
    content: 'Generate refreshing ideas with AI',
    src: <BulbOutlined style={{ fontSize: '24px', color: '#FAAD14' }} />,
    color: '#FAAD14',
    shadowColor: 'rgba(250,173,20,.12)',
  },
  {
    title: 'Blog',
    content: 'Copywriting for blogs',
    src: <EditOutlined style={{ fontSize: '24px', color: '#722ED1' }} />,
    color: '#722ED1',
    shadowColor: 'rgba(114,46,209,.12)',
  },
  {
    title: 'Upload your own picture',
    content: 'And we will find similar images',
    src: <CloudUploadOutlined style={{ fontSize: '24px', color: '#FA8C16' }} />,
    color: '#FA8C16',
    shadowColor: 'rgba(250,140,22,.12)',
  },
  {
    title: 'Support for languages',
    content: 'English, Chinese, Japanese',
    src: <GlobalOutlined style={{ fontSize: '24px', color: '#EB2F96' }} />,
    color: '#EB2F96',
    shadowColor: 'rgba(235,45,150,.12)',
  },
  {
    title: 'Draft Emails',
    content: 'Save time writing emails',
    src: <MailOutlined style={{ fontSize: '24px', color: '#1890FF' }} />,
    color: '#1890FF',
    shadowColor: 'rgba(24,144,255,.12)',
  },
];

const pointPos = [
  { x: -30, y: -10 },
  { x: 20, y: -20 },
  { x: -65, y: 15 },
  { x: -45, y: 80 },
  { x: 35, y: 5 },
  { x: 50, y: 50, opacity: 0.2 },
];

class Page1 extends React.PureComponent {
  static propTypes = {
    isMobile: PropTypes.bool.isRequired,
  }
  constructor(props) {
    super(props);
    this.state = {
      hoverNum: null,
    };
  }
  onMouseOver = (i) => {
    this.setState({
      hoverNum: i,
    });
  }
  onMouseOut = () => {
    this.setState({
      hoverNum: null,
    });
  }
  getEnter = (e) => {
    const i = e.index;
    const r = (Math.random() * 2) - 1;
    const y = (Math.random() * 10) + 5;
    const delay = Math.round(Math.random() * (i * 50));
    return [
      {
        delay, opacity: 0.4, ...pointPos[e.index], ease: 'easeOutBack', duration: 300,
      },
      {
        y: r > 0 ? `+=${y}` : `-=${y}`,
        duration: (Math.random() * 1000) + 2000,
        yoyo: true,
        repeat: -1,
      }];
  }
  render() {
    const { hoverNum } = this.state;
    let children = [[], [], []];
    featuresCN.forEach((item, i) => {
      const isHover = hoverNum === i;
      const pointChild = [
        'point-0 left', 'point-0 right',
        'point-ring', 'point-1', 'point-2', 'point-3',
      ].map(className => (
        <TweenOne
          component="i"
          className={className}
          key={className}
          style={{
            background: item.color,
            borderColor: item.color,
          }}
        />
      ));
      const child = (
        <li key={i.toString()} >
          <div
            className="page1-box"
            onMouseEnter={() => { this.onMouseOver(i); }}
            onMouseLeave={this.onMouseOut}
          >
            <TweenOneGroup
              className="page1-point-wrapper"
              enter={this.getEnter}
              leave={{
                x: 0, y: 30, opacity: 0, duration: 300, ease: 'easeInBack',
              }}
              resetStyleBool={false}
            >
              {(this.props.isMobile || isHover) && pointChild}
            </TweenOneGroup>
            <div
              className="page1-image"
              style={{
                boxShadow: `${isHover ? '0 12px 24px' :
                  '0 6px 12px'} ${item.shadowColor}`,
              }}
            >
              {item.src}
            </div>
            <h3>{item.title}</h3>
            <p>{item.content}</p>
          </div>
        </li>
      );
      children[Math.floor(i / 3)].push(child);
    });

    children = children.map((item, i) => (
      <QueueAnim
        className="page1-box-wrapper"
        key={i.toString()}
        type="bottom"
        leaveReverse
        delay={[i * 100, (children.length - 1 - i) * 100]}
        component="ul"
      >
        {item}
      </QueueAnim>
    ));
    return (
      <div className="home-page page1" id='page1' >
        <div className="home-page-wrapper" id="page1-wrapper">
          {!this.props.isMobile && (
            <Parallax
              className="page1-bg"
              animation={{ translateY: 200, ease: 'linear', playScale: [0, 1.65] }}
              location="page1-wrapper"
            >
              Feature
            </Parallax>
          )}
          <h2>What can <span>Meepoer</span> do for you </h2>
          <div className="title-line-wrapper page1-line">
            <div className="title-line" />
          </div>
          <OverPack>
            {children}
          </OverPack>
        </div>
      </div>
    );
  }
}

export default Page1;
