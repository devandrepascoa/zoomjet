import React, { useEffect, useState, useRef } from "react";
import { BrowserRouter as Router, Route } from "react-router-dom";
import "./ModifiedVideoStream.css";
import GlslCanvas from "glslCanvas";
import VideoStream from "./VideoStream";

var glslCanvas;
const backCanvas = document.createElement("canvas");

var filters = {
  default: "gl_FragColor = vec4(color, 1.0);",
  rave:
    "color += vec3(sin(4.5 * u_time), sin(3.1 * u_time + 1.0), sin(2.7 * u_time)); gl_FragColor = vec4(color, 1.0);",
  purple: "gl_FragColor = vec4(color * vec3(0.9, 0.0, 1.0), 1.0);",
  yellow: "gl_FragColor = vec4(color * vec3(1.5, 1.5, 0.0), 1.0);",
  highContrast:
    "color = smoothstep(vec3(0.2), vec3(0.8), color); gl_FragColor = vec4(color, 1.0);",
  invert: "gl_FragColor = vec4(vec3(1.0) - color, 1.0);",
};

function ModifiedVideoStream({
  name = "default",
  calls,
  filter = "default",
  cameraOn = true,
  micOn = true,
  onStream = () => {},
}) {
  const videoRef = useRef();
  const frontCanvas = useRef();

  const [stream, setStream] = useState(null);

  useEffect(() => {
    navigator.mediaDevices
      // .getDisplayMedia()
      .getUserMedia({ video: true, audio: true })
      .then((localStream) => {
        localStream.getVideoTracks()[0].enabled = cameraOn;
        localStream.getAudioTracks()[0].enabled = micOn;
        setStream(localStream);
        onStream(localStream);
      })
      .catch((error) => {
        console.log(error);
      });
  }, []);

  // useEffect(() => {
  //     if (stream) {
  //         if (filter != 'default') {
  //             console.log(calls)

  //             calls.forEach((call) => {
  //                 let videoSender = call.peerConnection.getSenders().find((sender) => sender.track.kind == 'video')
  //                 videoSender.replaceTrack(videoTrack)
  //             })
  //         } else {
  //             let videoTrack = stream.getVideoTracks()[0]
  //             calls.forEach((call) => {
  //                 let videoSender = call.peerConnection.getSenders().find((sender) => sender.track.kind == 'video')
  //                 videoSender.replaceTrack(videoTrack)
  //             })

  //         }
  //     }
  // }, [stream, filter])

  useEffect(() => {
    if (stream) {
      let videoTrack =
        stream.getVideoTracks().length > 0 ? stream.getVideoTracks()[0] : null;
      if (!videoTrack) return;
      if (cameraOn) videoTrack.enabled = true;
      else videoTrack.enabled = false;
    }
  }, [cameraOn]);

  useEffect(() => {
    if (stream) {
      let audioTrack =
        stream.getAudioTracks().length > 0 ? stream.getAudioTracks()[0] : null;
      if (!audioTrack) return;
      if (micOn) audioTrack.enabled = true;
      else audioTrack.enabled = false;
    }
  }, [micOn]);

  function update() {
    const vertexShader = `
            #ifdef GL_ES
            precision mediump float;
            #endif
            uniform sampler2D u_texture;
            uniform vec2 u_resolution;
            uniform float u_time;
            void main() {
            vec2 st = gl_FragCoord.xy / u_resolution.xy;
            float x = gl_FragCoord.x;
            float y = gl_FragCoord.y;
            vec3 color = texture2D(u_texture, st).rgb;
            ${filters[filter]}
            }
        `;

    if (glslCanvas) glslCanvas.load(vertexShader);
  }

  async function render() {
    let video = videoRef.current;
    let frontFrameBuffer = frontCanvas.current;
    backCanvas.width = video.videoWidth;
    backCanvas.height = video.videoHeight;

    let ctx = backCanvas.getContext("2d");
    ctx.drawImage(video, 0, 0, video.videoWidth, video.videoHeight);

    var dataURL = backCanvas.toDataURL();

    if (!glslCanvas) {
      glslCanvas = new GlslCanvas(frontFrameBuffer);
      update();
    }

    glslCanvas.setUniform("u_texture", dataURL);
    window.requestAnimationFrame(render);
  }

  return filter == "default" ? (
    <VideoStream muted={true} stream={stream} name={name}></VideoStream>
  ) : (
    <div className={"modifiedVideoStream"}>
      <video muted={true} onPlay={render} ref={videoRef} playsInline={true}>
        Your browser does not support the video tag :(
      </video>
      <canvas ref={frontCanvas} />
    </div>
  );
}

export default ModifiedVideoStream;
