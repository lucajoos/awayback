export var ListenerType;
(function (ListenerType) {
    ListenerType[ListenerType["on"] = 0] = "on";
    ListenerType[ListenerType["once"] = 1] = "once";
    ListenerType[ListenerType["only"] = 2] = "only";
})(ListenerType || (ListenerType = {}));
export var ListenerProperty;
(function (ListenerProperty) {
    ListenerProperty[ListenerProperty["type"] = 0] = "type";
    ListenerProperty[ListenerProperty["callback"] = 1] = "callback";
    ListenerProperty[ListenerProperty["emissions"] = 2] = "emissions";
    ListenerProperty[ListenerProperty["executions"] = 3] = "executions";
    ListenerProperty[ListenerProperty["options"] = 4] = "options";
})(ListenerProperty || (ListenerProperty = {}));
export var EventProperty;
(function (EventProperty) {
    EventProperty[EventProperty["listeners"] = 0] = "listeners";
    EventProperty[EventProperty["parameters"] = 1] = "parameters";
    EventProperty[EventProperty["emissions"] = 2] = "emissions";
})(EventProperty || (EventProperty = {}));
