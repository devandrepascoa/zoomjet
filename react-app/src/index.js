import React from "react";
import ReactDOM from "react-dom";
import "./index.css";
import * as serviceWorker from "./serviceWorker";
import { BrowserRouter as Router, Route } from "react-router-dom";
import RoomSelector from "./RoomSelector";
import RoomAuthentication from "./RoomAuthentication";

ReactDOM.render(
  <React.StrictMode>
    <Router>
      <Route exact path="/" component={RoomSelector} />
      <Route exact path="/:room_id" component={RoomAuthentication} />
    </Router>
  </React.StrictMode>,
  document.getElementById("root")
);

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
