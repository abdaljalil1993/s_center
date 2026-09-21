"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.myPayments = exports.myCourses = exports.buyCourse = void 0;
const asyncHandler_1 = require("../../utils/asyncHandler");
const service_1 = require("./service");
exports.buyCourse = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const data = await (0, service_1.purchaseCourse)(req.user.id, Number(req.params.id));
    res.status(200).json({ success: true, data });
});
exports.myCourses = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const data = await (0, service_1.listMyCourses)(req.user.id);
    res.status(200).json({ success: true, data });
});
exports.myPayments = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const data = await (0, service_1.listMyPayments)(req.user.id);
    res.status(200).json({ success: true, data });
});
