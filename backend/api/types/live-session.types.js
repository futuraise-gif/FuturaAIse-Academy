"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LiveSessionPlatform = exports.LiveSessionStatus = void 0;
var LiveSessionStatus;
(function (LiveSessionStatus) {
    LiveSessionStatus["SCHEDULED"] = "scheduled";
    LiveSessionStatus["LIVE"] = "live";
    LiveSessionStatus["ENDED"] = "ended";
    LiveSessionStatus["CANCELLED"] = "cancelled";
})(LiveSessionStatus || (exports.LiveSessionStatus = LiveSessionStatus = {}));
var LiveSessionPlatform;
(function (LiveSessionPlatform) {
    LiveSessionPlatform["JITSI"] = "jitsi";
    LiveSessionPlatform["ZOOM"] = "zoom";
    LiveSessionPlatform["GOOGLE_MEET"] = "google_meet";
    LiveSessionPlatform["CUSTOM"] = "custom";
})(LiveSessionPlatform || (exports.LiveSessionPlatform = LiveSessionPlatform = {}));
//# sourceMappingURL=live-session.types.js.map