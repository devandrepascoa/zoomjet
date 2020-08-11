import React, { useEffect, useState, useRef } from "react";
import { BrowserRouter as Router, Route } from "react-router-dom";
import "./VideoStream.css";

function VideoStream({ name = "Default", stream, muted = false }) {
  const videoRef = useRef(null);

  const putStreamOnVideoTag = () => {
    if (stream != null) {
      let video = videoRef.current;
      video.srcObject = stream;
      video.muted = muted;
      video.play();
    }
  };

  useEffect(putStreamOnVideoTag, [stream]);

  return (
    <div className="videoStream">
      <video className="videoStream__video" ref={videoRef} playsInline={true}>
        Your browser does not support the video tag :(
      </video>
      <p>{name}</p>
    </div>
  );
}

export default VideoStream;
