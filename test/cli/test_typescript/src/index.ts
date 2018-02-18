import { log, LogLevel } from "./util";

interface ComplexTitle {
	main: string;
	sub: string;
}

interface ArticleInterface {
	title: string | ComplexTitle;
	authors: string[];
}

let generateArticle = (params: ArticleInterface) => {
	let { title, authors } = params;
	if(typeof title !== "string") {
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
