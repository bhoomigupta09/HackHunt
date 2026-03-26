const { Router } = require("express");
const {
  addClient,
  createActivity,
  getActivityLog,
  removeClient,
  sendEvent
} = require("../utils/realtimeHub");

const realtimeRouter = Router();

realtimeRouter.get("/stream", (req, res) => {
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");
  res.flushHeaders?.();

  const client = res;
  addClient(client);

  sendEvent(client, "connected", {
    ok: true,
    connectedAt: new Date().toISOString()
  });

  const heartbeat = setInterval(() => {
    sendEvent(client, "heartbeat", {
      timestamp: new Date().toISOString()
    });
  }, 25000);

  req.on("close", () => {
    clearInterval(heartbeat);
    removeClient(client);
    res.end();
  });
});

realtimeRouter.get("/messages", (req, res) => {
  res.json({
    messages: getActivityLog()
  });
});

realtimeRouter.post("/messages", (req, res) => {
  const {
    authorId,
    authorName,
    authorRole,
    message
  } = req.body || {};

  if (!String(message || "").trim()) {
    return res.status(400).json({
      message: "Message is required."
    });
  }

  const activity = createActivity({
    type: "message",
    authorId: String(authorId || ""),
    authorName: String(authorName || "Anonymous"),
    authorRole: String(authorRole || "user"),
    message: String(message).trim()
  });

  return res.status(201).json({
    message: "Live update posted successfully.",
    activity
  });
});

module.exports = {
  realtimeRouter
};
