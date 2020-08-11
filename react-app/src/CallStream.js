import React, { useEffect, useState, useRef } from "react";
import VideoStream from "./VideoStream";
import "./CallStream.css";
function CallStream({ user = { name: "Default", id: null }, call, stream }) {
  useEffect(() => {
    return () => {
      console.log("Closed Call Stream with id:" + call.peer);
      call.close();
    };
  }, []);

  return <VideoStream stream={stream} name={user.name}></VideoStream>;
}

export default CallStream;
