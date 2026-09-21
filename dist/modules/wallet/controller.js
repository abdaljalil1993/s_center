"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.topupRequests = exports.createTopup = exports.transactions = exports.wallet = void 0;
const asyncHandler_1 = require("../../utils/asyncHandler");
const service_1 = require("./service");
exports.wallet = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const data = await (0, service_1.getWallet)(req.user.id);
    res.status(200).json({ success: true, data });
});
exports.transactions = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const data = await (0, service_1.listWalletTransactions)(req.user.id, req.query);
    res.status(200).json({ success: true, data });
});
exports.createTopup = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const data = await (0, service_1.createTopupRequest)(req.user.id, req.body);
    res.status(201).json({ success: true, data });
});
exports.topupRequests = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const data = await (0, service_1.listMyTopupRequests)(req.user.id, req.query);
    res.status(200).json({ success: true, data });
});
