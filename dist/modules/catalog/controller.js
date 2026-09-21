"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getLectures = exports.getCourses = exports.getSpecializations = void 0;
const asyncHandler_1 = require("../../utils/asyncHandler");
const service_1 = require("./service");
exports.getSpecializations = (0, asyncHandler_1.asyncHandler)(async (_req, res) => {
    const data = await (0, service_1.listSpecializations)();
    res.status(200).json({ success: true, data });
});
exports.getCourses = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const data = await (0, service_1.listCourses)(req.user.id, req.query);
    res.status(200).json({ success: true, data });
});
exports.getLectures = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const data = await (0, service_1.listLectures)(req.user, Number(req.params.id));
    res.status(200).json({ success: true, data });
});
