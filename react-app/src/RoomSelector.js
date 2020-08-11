import React, { useEffect, useState, useRef } from "react";
import "./RoomSelector.css";

function RoomSelector({ history, call, stream }) {
  const [room, setRoom] = useState("");
  const onRoomSubmit = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (room == "") return;
    console.log(history);
    history.push("/" + room);
  };

  return (
    <div className="roomSelector">
      <h1 className="roomSelector__title">Zoom Jet</h1>
      <form className="roomSelector__searchBox" onSubmit={onRoomSubmit}>
        <input
          className="roomSelector__searchInput"
          type="text"
          onChange={(e) => setRoom(e.target.value)}
          placeholder="Room Search.."
          autoFocus={true}
        />
        <button className="roomSelector__searchButton" type="submit">
          <i className="material-icons">search</i>
        </button>
      </form>
    </div>
  );
}

export default RoomSelector;
