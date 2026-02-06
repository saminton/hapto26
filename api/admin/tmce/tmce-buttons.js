// add buttons

function tmceButtons() {
	addTmceColorsButton({
		name: "colorized",
		attr: "data-color",
		title: "Insert Color",
		icon: "colorized.svg",
		classname: "colorized",
		// items: [
		// 	{ name: "blue" },
		// 	{ name: "green" },
		// 	{ name: "purple" },
		// 	{ name: "orange" },
		// 	{ name: "blue_gradient" },
		// 	{ name: "green_gradient" },
		// 	{ name: "purple_gradient" },
		// 	{ name: "orange_gradient" },
		// ],
	});
}

// utils functions

function addTmceColorsButton({ name, attr, title, icon, items }) {
	tinymce.PluginManager.add(name, function (editor, url) {
		let menu = [];

		if (items) {
			items.forEach((item) => {
				menu.push({
					text: item.name,
					onclick: function (e) {
						e.stopPropagation();
						replaceLetter(item);
					},
				});
			});

			editor.addButton(name, {
				title: title,
				type: "menubutton",
				menu: menu,
				image: `${url}/${icon}`,
			});
		} else {
			editor.addButton(name, {
				title: title,
				image: `${url}/${icon}`,
				onclick: function (e) {
					e.stopPropagation();
					replaceLetter();
				},
			});
		}

		function replaceLetter() {
			// Context
			let el = editor.selection.getNode();
			let content = editor.selection.getContent({
				format: "html",
			});

			if (content.length === 0) {
				alert("Please select text");
				return;
			}

			let output = content;

			if (el.hasAttribute(attr)) {
				content = el.outerHTML;
			}

			if (content.includes(attr)) {
				console.log(content);
				// If string already contains attribute
				const pattern = new RegExp(`\\s+${attr}="[^"]*"`, "g");
				// Remove all the matched attributes
				output = content.replaceAll(pattern, "");
			}

			// Add the attribute
			else {
				output = `<span ${attr}>${content}</span>`;
			}

			editor.execCommand("mceReplaceContent", false, output);
			return;
		}
	});
}

tmceButtons();
