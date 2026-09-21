"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.markAllNotificationsRead = exports.markNotificationRead = exports.getNotifications = void 0;
const asyncHandler_1 = require("../../utils/asyncHandler");
const service_1 = require("./service");
exports.getNotifications = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const data = await (0, service_1.listNotifications)(req.user.id, req.query);
    res.status(200).json({ success: true, data });
});
exports.markNotificationRead = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const data = await (0, service_1.readNotification)(req.user.id, Number(req.params.id));
    res.status(200).json({ success: true, data });
});
exports.markAllNotificationsRead = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const data = await (0, service_1.readAllNotifications)(req.user.id);
    res.status(200).json({ success: true, data });
});
