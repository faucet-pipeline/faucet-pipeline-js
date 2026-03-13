// src/util.ts
function log(level, msg) {
  if (level === 2 /* Critical */) {
    console.error(msg);
  } else {
    console.log(msg);
  }
}

// src/index.ts
var generateArticle = (params) => {
  let { title, authors } = params;
  if (typeof title !== "string") {
    log(0 /* Debug */, "auto-generating title");
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
