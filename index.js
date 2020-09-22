const express = require("express");
const path = require("path");
const PORT = process.env.PORT || 5000;

const { WebClient } = require("@slack/web-api");

const token = process.env.SLACK_TOKEN;
const web = new WebClient(token);

express()
  .use(express.static(path.join(__dirname, "public")))
  .set("views", path.join(__dirname, "views"))
  .set("view engine", "ejs")
  .get("/", (req, res) => res.render("pages/index"))
  .post("/slack/events", (req, res) => {
    let body = req.body;
    let event = req.event;

    if (body.type === "event_callback") {
      if (event.type === "message") {
        if (event.text === "안녕") {
          console.log(
            `인사 메세지 수신 channel:${event.channel}, user:${event.user}`
          );
          web.chat
            .postMessage({
              channel: event.channel,
              text: "안녕하쇼",
            })
            .then((result) => {
              console.log("Message sent: " + result.ts);
            });
          res.sendStatus(200);
        }
      }
    } else if (body.type === "url_verification") {
      console.log("url verification");
      res.send(body.challenge);
    } else {
      res.sendStatus(200);
    }
  })
  .listen(PORT, () => console.log(`Listening on ${PORT}`));
