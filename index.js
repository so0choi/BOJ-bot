const express = require("express");
const PORT = process.env.PORT || 5000;
const { WebClient } = require("@slack/web-api");
const web = new WebClient(process.env.SLACK_TOKEN);
const schedule = require("node-schedule");

const app = express();

const getFormatDate = () => {
  let date = new Date();
  let year = date.getFullYear();
  let month = date.getMonth();
  let day = date.getDate();
  return `${year}년 ${month}월 ${day}일`;
};

const job = schedule.scheduleJob("0 0 9 * * *", function () {
  app.post("/slack/events", (req, res) => {
    web.chat
      .postMessage({
        channel: "testchannel",
        text: getFormatDate() + " 입니다.",
      })
      .then((result) => {
        console.log("Message sent: " + result.ts);
      });
    res.sendStatus(200);
  });
});
app.use(express.json());
express()
  .use(express.json())
  .post("/slack/events", (req, res) => {
    let body = req.body;
    let event = body.event;
    if (body.type === "event_callback") {
      console.log(event);
      if (event.type === "message") {
        // 메시지 이벤트인 경우, 메시지가 '안녕'이면 '안녕하세요' 메시지 전송
        if (event.text === "안녕") {
          console.log(
            `인사 메시지 수신 channel:${event.channel}, user:${event.user}`
          );
          web.chat
            .postMessage({ channel: event.channel, text: "안녕하세요." })
            .then((result) => {
              console.log("Message sent: " + result.ts);
            });
          res.sendStatus(200);
        }
      }
    } else if (body.type === "url_verification") {
      // URL 검증을 위한 처리
      console.log("url verification");
      res.send(body.challenge);
    } else {
      res.sendStatus(200);
    }
  })
  .listen(PORT, () => console.log(`Listening on ${PORT}`));
