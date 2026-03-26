const clients = new Set();
const activityLog = [];
const MAX_ACTIVITY_ITEMS = 100;
const mongoose = require("mongoose");
const { ActivityLog } = require("../database/activityLog");

function sendEvent(client, event, payload) {
  client.write(`event: ${event}\n`);
  client.write(`data: ${JSON.stringify(payload)}\n\n`);
}

function addClient(client) {
  clients.add(client);
}

function removeClient(client) {
  clients.delete(client);
}

function broadcast(event, payload) {
  for (const client of clients) {
    try {
      sendEvent(client, event, payload);
    } catch (error) {
      clients.delete(client);
    }
  }
}

function createActivity(entry) {
  const activity = {
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    createdAt: new Date().toISOString(),
    ...entry
  };

  activityLog.unshift(activity);
  if (activityLog.length > MAX_ACTIVITY_ITEMS) {
    activityLog.length = MAX_ACTIVITY_ITEMS;
  }

  broadcast("activity", activity);

  const action = String(entry?.type || "activity")
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "_");
  const maybeObjectId = entry?.authorId;
  const performedBy =
    maybeObjectId && mongoose.Types.ObjectId.isValid(String(maybeObjectId))
      ? new mongoose.Types.ObjectId(String(maybeObjectId))
      : null;

  ActivityLog.create({
    action,
    performedBy,
    performedByName: String(entry?.authorName || "System"),
    targetId:
      entry?.targetId && mongoose.Types.ObjectId.isValid(String(entry.targetId))
        ? new mongoose.Types.ObjectId(String(entry.targetId))
        : null,
    targetType: entry?.targetType || null,
    description: String(entry?.message || action.replace(/_/g, " ")),
    status: entry?.status === "failure" ? "failure" : "success",
    details: entry || {},
    timestamp: entry?.timestamp ? new Date(entry.timestamp) : new Date()
  }).catch((error) => {
    console.error("Failed to persist realtime activity:", error.message);
  });

  return activity;
}

function getActivityLog() {
  return activityLog;
}

module.exports = {
  addClient,
  broadcast,
  createActivity,
  getActivityLog,
  removeClient,
  sendEvent
};
