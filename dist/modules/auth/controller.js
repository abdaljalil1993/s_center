"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updatePassword = exports.me = exports.login = exports.register = void 0;
const asyncHandler_1 = require("../../utils/asyncHandler");
const service_1 = require("./service");
exports.register = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const result = await (0, service_1.registerStudent)(req.body);
    res.status(201).json({ success: true, data: result });
});
exports.login = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const result = await (0, service_1.loginUser)(req.body);
    res.status(200).json({ success: true, data: result });
});
exports.me = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const result = await (0, service_1.getCurrentUser)(req.user.id);
    res.status(200).json({ success: true, data: result });
});
exports.updatePassword = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const result = await (0, service_1.changePassword)(req.user.id, req.body);
    res.status(200).json({ success: true, data: result });
});
