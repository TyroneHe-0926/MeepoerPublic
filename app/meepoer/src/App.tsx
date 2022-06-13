import React from "react";
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import PostToPost from "./post2post/PostToPost"
import PostToPostIntro from "./post2post/PostToPostIntro";
import NavBar from "./home/NavBar"
import TextToPostDB from "./text2post/TextToPostDB";
import TextToPostGallery from "./text2post/TextToPostGallery"
import NoPage from "./nopage/nopage"
import Home from "./home/index"
import Footer from './home/Footer';
import Terms from './home/terms';
import Faq from './home/faq'
import UrlToPost from "./post2post/UrlToPost";

const App = () => 
<BrowserRouter>
    <NavBar></NavBar>
    <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/post-to-post" element={<PostToPostIntro />} />
        <Route path="/home" element={<Home />} />
        <Route path="/text-to-post-db" element={<TextToPostDB/>}/>
        <Route path="/text-to-post-db-result" element={<TextToPostGallery/>}></Route>
        <Route path="/image-to-post-gallery" element={<PostToPost/>}></Route>
        <Route path="/url-to-post-gallery" element={<UrlToPost/>}></Route>
        <Route path="/terms" element={<Terms />}></Route>
        <Route path='/faq' element={<Faq />}></Route>
        <Route path='*' element={<NoPage />}></Route>
    </Routes>
    <Footer/>
</BrowserRouter>
export default App

