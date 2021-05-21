// src/util.ts
var LogLevel;
(function(LogLevel2) {
  LogLevel2[LogLevel2["Debug"] = 0] = "Debug";
  LogLevel2[LogLevel2["Info"] = 1] = "Info";
  LogLevel2[LogLevel2["Critical"] = 2] = "Critical";
})(LogLevel || (LogLevel = {}));
function log(level, msg) {
  if (level === 2) {
    console.error(msg);
  } else {
    console.log(msg);
  }
}

// src/index.ts
var generateArticle = (params) => {
  let { title, authors } = params;
  if (typeof title !== "string") {
    log(LogLevel.Debug, "auto-generating title");
    title = `${title.main}: ${title.sub}`;
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
