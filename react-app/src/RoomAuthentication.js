import React, { useState } from "react";
import Room from "./Room";
import "./RoomAuthentication.css";

function RoomAuthentication({ history, location }) {
  let room_id = location.pathname.split("/")[1];
  const [formValidated, setFormValidated] = useState(false);
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [hasPassword, setHasPassword] = useState(false);

  const onFormSubmit = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (name.length > 0 && (!hasPassword || password.length > 0)) {
      setFormValidated(true);
    }
  };

  return !formValidated ? (
    <div className="roomAuthentication">
      <form onSubmit={onFormSubmit} className="roomAuthentication__form">
        <h1>Authentication For Room: {room_id}</h1>
        <input
          onChange={(e) => {
            setName(e.target.value);
          }}
          placeholder="Name"
          autoFocus={true}
          className="roomAuthentication__name"
        ></input>

        {hasPassword ? (
          <>
            <input
              onChange={(e) => {
                setPassword(e.target.value);
              }}
              placeholder="Password"
              className="roomAuthentication__password"
            ></input>
          </>
        ) : null}
        <button className="roomAuthentication__submit">
          <svg
            width="451.846px"
            height="451.847px"
            viewBox="0 0 451.846 451.847"
          >
            <path
              d="M345.441,248.292L151.154,442.573c-12.359,12.365-32.397,12.365-44.75,0c-12.354-12.354-12.354-32.391,0-44.744
		L278.318,225.92L106.409,54.017c-12.354-12.359-12.354-32.394,0-44.748c12.354-12.359,32.391-12.359,44.75,0l194.287,194.284
		c6.177,6.18,9.262,14.271,9.262,22.366C354.708,234.018,351.617,242.115,345.441,248.292z"
            />
          </svg>
        </button>
      </form>
    </div>
  ) : (
    <Room room_id={room_id} name={name} password={password}></Room>
  );
}

export default RoomAuthentication;
