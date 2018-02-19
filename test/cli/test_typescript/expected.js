(function () {
'use strict';

if(typeof global === "undefined" && typeof window !== "undefined") {
	window.global = window;
}

var LogLevel;
(function (LogLevel) {
    LogLevel[LogLevel["Debug"] = 0] = "Debug";
    LogLevel[LogLevel["Info"] = 1] = "Info";
    LogLevel[LogLevel["Critical"] = 2] = "Critical";
})(LogLevel || (LogLevel = {}));
function log(level, msg) {
    if (level === LogLevel.Critical) {
        console.error(msg);
    }
    else {
        console.log(msg);
    }
}

var generateArticle = function (params) {
    var title = params.title, authors = params.authors;
    if (typeof title !== "string") {
        log(LogLevel.Debug, "auto-generating title");
        title = title.main + ": " + title.sub;
    }
    return title + "\n" + authors.join(", ");
};
generateArticle({
    title: {
        main: "Hello World",
        sub: "sup"
    },
    authors: ["foo", "bar"]
});

}());
