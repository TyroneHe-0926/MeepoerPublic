<h1>Generate Your Own Social Media Post in One Click with Meepoer</h1>

[meepoer.app](http://www.meepoer.app)

<h2>Contents:</h2>
<ul>
  <li><a href='#imagedb'>Post Generation Process</a></li>
  <ul>
    <li><a href='#overview'>Overview</a></li>
    <li><a href='#ourstack'>Our Stack</a></li>
  </ul>
  <li><a href='#imagedb'>Image Database</a></li>
  <li><a href='#roadmap'>What's Next</a></li>
</ul>

<h2>Post Generation Process</h2>

<h3 id='overview'>Post-to-Post Feature</h3>

[![Watch the video](https://i3.ytimg.com/vi/4WFA6wt1E84/maxresdefault.jpg)](https://youtu.be/4WFA6wt1E84)

<h3>Text-to-Post Feature</h3>

[![Watch the video](https://i3.ytimg.com/vi/wmzxlaMm7b8/maxresdefault.jpg)](https://youtu.be/wmzxlaMm7b8)

<h3 id='ourstack'>Our Stack</h3>

**Front-End**

- JavaScript, TypeScript
  - React
  - Antd

**Back-End**

- AWS
  - EC2 t3a.xlarge spot instance
  - S3 for storage

- Local GPU Machine (offline as of June 13th 2022)
  - Ubuntu 18.04
  - Ryzen 3, GTX 1050ti 4GB, 48GB RAM

- Python
  - Milvus (vector database)
  - Elasticsearch (text search, mapping to milvus collections)
  - Flask 
  - RQ
  - Social Media APIs
  - GPT3 API

<h2 id='imagedb'>Image Database</h2>

Our image database is hosted on AWS S3 and we have scraped three social media sites for content. 

For Twitter and Instagram we scraped over a list of hashtags (800+) aiming to get as diverse database as possible.
For Reddit we scraped the top 1000 follwed subreddits.

We limited the scraper to SFW content for all three sites

Website | Total Size | Image Files
--- | --- | ---
**Instagram** | `89G` | 628120
**Twitter** | `110G` | 761481
**Reddit** | `115G` | 645616

<h2 id='roadmap'>What's Next</h2>
