import React, { useState, useEffect, useRef } from "react";
import "./Room.css";
import ModifiedVideoStream from "./ModifiedVideoStream";
import io from "socket.io-client";
import Peer from "peerjs";
import CallStream from "./CallStream";
let calls = [];

function Room({ room_id, name, password }) {
  const [socket, setSocket] = useState(null);
  const [chatPopUp, setChatPopup] = useState(false);
  const [localUser, setLocalUser] = useState({ name: name, id: null });
  const [callStreams, setCallStreams] = useState([]);
  const [filter, setFilter] = useState("default");
  const [numUncheckedMessages, setNumUncheckedMessages] = useState(5);
  const [messages, setMessages] = useState([]);
  const [message, setMessage] = useState("");
  const [cameraOn, setCameraOn] = useState(true);
  const [micOn, setMicOn] = useState(true);

  useEffect(() => {
    setNumUncheckedMessages(0);
  }, [chatPopUp]);

  const joinRoom = (localStream) => {
    const socket = io("casa.pascoa.org", { secure: true });
    setSocket(socket);
    const peer = new Peer(undefined, {
      path: "/peerjs",
      host: "casa.pascoa.org",
      port: "8443",
    });

    peer.on("open", (id) => {
      console.log(
        "Connected to server with id: " + id + " and name: " + localUser.name
      );
      socket.emit("join-room", room_id, id, localUser.name);
      setLocalUser((user) => {
        return { name: user.name, id: id };
      });
    });

    peer.on("call", (call) => {
      call.answer(localStream, { metadata: { user: localUser } });
      call.on("stream", (remoteStream) => {
        addCallStreamToGrid(call.metadata.user, call, remoteStream);
      });
      calls.push({ user: call.metadata.user, call: call });
    });

    socket.on("received-message", (user, message) => {
      let name = user.name;
      setMessages((messages) => [...messages, { name, message }]);
      if (!chatPopUp && window.matchMedia("(max-width: 900px)").matches) {
        console.log("Happened");
        
        setNumUncheckedMessages((num) => num + 1);
      }
    });

    socket.on("user-disconnected", (id) => {
      console.log("User: " + id + " disconnected");

      setCallStreams((streams) =>
        streams.filter((temp_stream) => {
          return temp_stream.call.peer != id;
        })
      );
    });

    socket.on("user-connected", (user) => {
      callNewUser(peer, localStream, user);
    });
  };

  const addCallStreamToGrid = (user, call, remoteStream) => {
    setCallStreams((streams) => {
      let already_exists = streams.find((temp_stream) => {
        return temp_stream.stream.id == remoteStream.id;
      });
      if (!already_exists)
        return [...streams, { user: user, call: call, stream: remoteStream }];
      else return streams;
    });
  };

  const callNewUser = (peer, localStream, user) => {
    console.log(
      "New user connected with name: " + user.name + " and id:" + user.id
    );
    const call = peer.call(user.id, localStream, {
      metadata: { user: localUser },
    });

    call.on("stream", (remoteStream) => {
      addCallStreamToGrid(user, call, remoteStream);
    });

    call.on("close", () => {
      console.log(
        "User: " + user.name + " with id:" + user.id + " closed connection"
      );
      setCallStreams((streams) =>
        streams.filter((temp_stream) => {
          return temp_stream.call.peer != call.peer;
        })
      );
    });

    calls.push(call);
  };

  const onMessageSent = (e) => {
    if (
      (e.key === "Enter" || e.keyCode === 13) &&
      message.length > 0 &&
      socket != null
    ) {
      socket.emit("message", message);
      setMessage("");
      let name = localUser.name;
      setMessages((messages) => [...messages, { name, message }]);
    }
  };

  return (
    <div className="room">
      <div className={"room__conference " + (chatPopUp ? "popup" : "")}>
        <div className="room__videoGrid">
          <ModifiedVideoStream
            calls={calls}
            name={localUser.name}
            filter={filter}
            onStream={(stream) => joinRoom(stream)}
            cameraOn={cameraOn}
            micOn={micOn}
          ></ModifiedVideoStream>
          {callStreams.map((callStream, index) => (
            <CallStream
              key={index}
              user={callStream.user}
              call={callStream.call}
              stream={callStream.stream}
            />
          ))}
        </div>
        <div className="room__options">
          <button onClick={() => setCameraOn((cameraOn) => !cameraOn)}>
            {cameraOn ? (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="32"
                height="32"
                viewBox="0 0 24 24"
              >
                <path d="M0 0h24v24H0z" fill="none" />
                <path
                  fill="white"
                  d="M17 10.5V7c0-.55-.45-1-1-1H4c-.55 0-1 .45-1 1v10c0 .55.45 1 1 1h12c.55 0 1-.45 1-1v-3.5l4 4v-11l-4 4z"
                />
              </svg>
            ) : (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="32"
                height="32"
                viewBox="0 0 24 24"
              >
                <path d="M0 0h24v24H0zm0 0h24v24H0z" fill="none" />
                <path
                  fill="white"
                  d="M21 6.5l-4 4V7c0-.55-.45-1-1-1H9.82L21 17.18V6.5zM3.27 2L2 3.27 4.73 6H4c-.55 0-1 .45-1 1v10c0 .55.45 1 1 1h12c.21 0 .39-.08.54-.18L19.73 21 21 19.73 3.27 2z"
                />
              </svg>
            )}
          </button>
          <button onClick={() => setMicOn((micOn) => !micOn)}>
            {micOn ? (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="32"
                height="32"
                viewBox="0 0 24 24"
              >
                <path
                  fill="white"
                  d="M12 14c1.66 0 2.99-1.34 2.99-3L15 5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3zm5.3-3c0 3-2.54 5.1-5.3 5.1S6.7 14 6.7 11H5c0 3.41 2.72 6.23 6 6.72V21h2v-3.28c3.28-.48 6-3.3 6-6.72h-1.7z"
                />
                <path d="M0 0h24v24H0z" fill="none" />
              </svg>
            ) : (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="32"
                height="32"
                viewBox="0 0 24 24"
              >
                <path d="M0 0h24v24H0zm0 0h24v24H0z" fill="none" />
                <path
                  fill="white"
                  d="M19 11h-1.7c0 .74-.16 1.43-.43 2.05l1.23 1.23c.56-.98.9-2.09.9-3.28zm-4.02.17c0-.06.02-.11.02-.17V5c0-1.66-1.34-3-3-3S9 3.34 9 5v.18l5.98 5.99zM4.27 3L3 4.27l6.01 6.01V11c0 1.66 1.33 3 2.99 3 .22 0 .44-.03.65-.08l1.66 1.66c-.71.33-1.5.52-2.31.52-2.76 0-5.3-2.1-5.3-5.1H5c0 3.41 2.72 6.23 6 6.72V21h2v-3.28c.91-.13 1.77-.45 2.54-.9L19.73 21 21 19.73 4.27 3z"
                />
              </svg>
            )}
          </button>
          <button
            className="room__messagePopupButton"
            onClick={() => setChatPopup(true)}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="30.743px"
              height="30.744px"
              viewBox="0 0 30.743 30.744"
              fill="white"
            >
              <path
                d="M28.585,9.67h-0.842v9.255c0,1.441-0.839,2.744-2.521,2.744H8.743v0.44c0,1.274,1.449,2.56,2.937,2.56h12.599l4.82,2.834
		L28.4,24.669h0.185c1.487,0,2.158-1.283,2.158-2.56V11.867C30.743,10.593,30.072,9.67,28.585,9.67z"
              />
              <path
                d="M22.762,3.24H3.622C1.938,3.24,0,4.736,0,6.178v11.6c0,1.328,1.642,2.287,3.217,2.435l-1.025,3.891L8.76,20.24h14.002
		c1.684,0,3.238-1.021,3.238-2.462V8.393V6.178C26,4.736,24.445,3.24,22.762,3.24z M6.542,13.032c-0.955,0-1.729-0.774-1.729-1.729
		s0.774-1.729,1.729-1.729c0.954,0,1.729,0.774,1.729,1.729S7.496,13.032,6.542,13.032z M13,13.032
		c-0.955,0-1.729-0.774-1.729-1.729S12.045,9.574,13,9.574s1.729,0.774,1.729,1.729S13.955,13.032,13,13.032z M19.459,13.032
		c-0.955,0-1.73-0.774-1.73-1.729s0.775-1.729,1.73-1.729c0.953,0,1.729,0.774,1.729,1.729S20.412,13.032,19.459,13.032z"
              />
            </svg>
            {numUncheckedMessages > 0 ? (
              <div>{numUncheckedMessages}</div>
            ) : null}
          </button>
        </div>
      </div>
      <div className={"room__chat " + (chatPopUp ? "popup" : "")}>
        <div className="room__header">
          <button onClick={() => setChatPopup(false)}>
            <svg
              version="1.1"
              xmlns="http://www.w3.org/2000/svg"
              width="20.743"
              height="20.743"
              viewBox="0 0 256 256"
              fill="white"
            >
              <polygon points="207.093,30.187 176.907,0 48.907,128 176.907,256 207.093,225.813 109.28,128 		" />
            </svg>
          </button>
          <p>Chat messages</p>
          <div />
        </div>
        <div className="room__chatWindow">
          <ul className="room__messages">
            {messages.map(({ name, message }, index) => {
              return (
                <li key={index} className="message">
                  <b>{name}</b>
                  <br />
                  {message}
                </li>
              );
            })}
          </ul>
        </div>
        <div className="room__messageContainer">
          <input
            onKeyDown={onMessageSent}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Type message here..."
          />
        </div>
      </div>
    </div>
  );
}

export default Room;
