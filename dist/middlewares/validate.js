"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validate = validate;
const AppError_1 = require("../utils/AppError");
function validate(schemas) {
    return (req, _res, next) => {
        for (const key of ['body', 'query', 'params']) {
            const schema = schemas[key];
            if (!schema) {
                continue;
            }
            const source = key === 'body' && req.body && typeof req.body === 'object' ? { ...req.body } : req[key];
            if (key === 'body' && source && typeof source === 'object') {
                delete source.csrf_token;
            }
            const result = schema.safeParse(source);
            if (!result.success) {
                const message = result.error.issues.map((issue) => issue.message).join(', ');
                return next(new AppError_1.AppError(400, message || 'Validation failed'));
            }
            req[key] = result.data;
        }
        next();
    };
}
