import React from "react";
import ReactDOM from "react-dom";
import App from "./App";
import "./gui/theme/bootswatch/theme.css";
import "./gui/theme/bootswatch/custom.css";
import "./gui/theme/bootswatch/global.css";
import "./index.css";

// Render the React app
ReactDOM.render(<App />, document.getElementById("root"));

// Make the page visible once everything loaded
window.addEventListener(
	"load",
	() => {
		document.body.style.display = "block";
	},
	false
);
