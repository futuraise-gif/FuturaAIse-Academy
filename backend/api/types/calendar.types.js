"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EventRecurrence = exports.EventType = void 0;
var EventType;
(function (EventType) {
    EventType["CLASS"] = "class";
    EventType["EXAM"] = "exam";
    EventType["ASSIGNMENT"] = "assignment";
    EventType["OFFICE_HOURS"] = "office_hours";
    EventType["OTHER"] = "other";
})(EventType || (exports.EventType = EventType = {}));
var EventRecurrence;
(function (EventRecurrence) {
    EventRecurrence["NONE"] = "none";
    EventRecurrence["DAILY"] = "daily";
    EventRecurrence["WEEKLY"] = "weekly";
    EventRecurrence["MONTHLY"] = "monthly";
})(EventRecurrence || (exports.EventRecurrence = EventRecurrence = {}));
//# sourceMappingURL=calendar.types.js.map