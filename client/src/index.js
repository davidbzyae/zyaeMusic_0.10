import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";

// libs
import { BrowserRouter } from "react-router-dom";
import axios from "axios";

axios.defaults.withCredentials = true;

const root = ReactDOM.createRoot(document.querySelector("#root"));
root.render(
  <BrowserRouter>
    <App />
  </BrowserRouter>
);
