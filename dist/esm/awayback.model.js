export var ListenerType;
(function (ListenerType) {
    ListenerType[ListenerType["on"] = 0] = "on";
    ListenerType[ListenerType["once"] = 1] = "once";
    ListenerType[ListenerType["only"] = 2] = "only";
})(ListenerType || (ListenerType = {}));
