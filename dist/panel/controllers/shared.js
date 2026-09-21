"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.renderPage = renderPage;
function renderPage(res, view, data = {}) {
    return res.render(view, data);
}
