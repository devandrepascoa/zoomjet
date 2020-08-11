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
        <h1>Authentication for room: {room_id}</h1>
        <label className="roomAuthentication__nameLabel">Name</label>
        <input
          onChange={(e) => {
            setName(e.target.value);
          }}
          autoFocus={true}
          className="roomAuthentication__name"
        ></input>
        {hasPassword ? (
          <>
            <label className="roomAuthentication__passwordLabel">
              Room Password
            </label>
            <input
              onChange={(e) => {
                setPassword(e.target.value);
              }}
              className="roomAuthentication__password"
            ></input>
          </>
        ) : null}
        <button className="roomAuthentication__submit"></button>
      </form>
    </div>
  ) : (
    <Room room_id={room_id} name={name} password={password}></Room>
  );
}

export default RoomAuthentication;
