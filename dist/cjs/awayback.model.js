"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ListenerType = void 0;
var ListenerType;
(function (ListenerType) {
    ListenerType[ListenerType["on"] = 0] = "on";
    ListenerType[ListenerType["once"] = 1] = "once";
    ListenerType[ListenerType["only"] = 2] = "only";
})(ListenerType || (exports.ListenerType = ListenerType = {}));
