const express = require("express");
const path = require("path");

const app = express();

app.use("/static", express.static(path.resolve(__dirname, "src", "static")));
app.use("/css", express.static(path.resolve(__dirname, "src", "css")));
app.use("/js", express.static(path.resolve(__dirname, "src", "js")));

app.get("/*", (req, res) => {
  res.sendFile(path.resolve(__dirname, "src", "index.html"));
});

app.listen(process.env.PORT || 3000, () => console.log("Server running ..."));
