"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TransactionType = exports.TopupStatus = exports.TopupMethod = exports.LectureType = exports.UserRole = void 0;
var UserRole;
(function (UserRole) {
    UserRole["STUDENT"] = "STUDENT";
    UserRole["TEACHER"] = "TEACHER";
    UserRole["ADMIN"] = "ADMIN";
})(UserRole || (exports.UserRole = UserRole = {}));
var LectureType;
(function (LectureType) {
    LectureType["VIDEO"] = "VIDEO";
    LectureType["PDF"] = "PDF";
    LectureType["TEXT"] = "TEXT";
})(LectureType || (exports.LectureType = LectureType = {}));
var TopupMethod;
(function (TopupMethod) {
    TopupMethod["SHAM_CASH"] = "SHAM_CASH";
    TopupMethod["TRANSFER_OFFICE"] = "TRANSFER_OFFICE";
})(TopupMethod || (exports.TopupMethod = TopupMethod = {}));
var TopupStatus;
(function (TopupStatus) {
    TopupStatus["PENDING"] = "PENDING";
    TopupStatus["APPROVED"] = "APPROVED";
    TopupStatus["REJECTED"] = "REJECTED";
})(TopupStatus || (exports.TopupStatus = TopupStatus = {}));
var TransactionType;
(function (TransactionType) {
    TransactionType["TOPUP"] = "TOPUP";
    TransactionType["PURCHASE"] = "PURCHASE";
})(TransactionType || (exports.TransactionType = TransactionType = {}));
