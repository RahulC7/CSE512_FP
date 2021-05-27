let clickedAuthors = {
	_data: [],
	_name: [],
	_active: null,
	add: function (e) {
		if (this._active !== e.id) {
			this._active = e.id;
			if (!this.has(e.id)) {
				this._data.push(e.id);
				this._name.push(e.name);
				this.update();
			}
			updateNetwork();
		}
	},
	has: function (e) {
		return this._data.includes(e);
	},
	delete: function (e) {
		let index = this._data.indexOf(e);
		if (index > -1) {
			this._data.splice(index, 1);
			this._name.splice(index, 1);
			if (this._active === e) {
				this._active = this._data[this._data.length - 1];
			}
			this.update();
		}
	},
	size: function () {
		return this._data.length;
	},
	clear: function () {
		this._data = [];
		this._name = [];
	},
	getActive: function () {
		return this._active;
	},
	update: function () {
		let html = "";
		for (var i = 0; i < this.size(); i++) {
			let name = this._name[i];
			let id = this._data[i];
			html += `<button data-id="${id}" ${(id === this._active ? 'class="clickedactive"' : 'title="Select author node"')}>${name} <span title="Deselect author node">X</span></button>`;
		}
		document.querySelector(".clicked-authors").innerHTML = html;
		for (const btn of document.querySelectorAll(".clicked-authors button")) {
			let id = btn.dataset.id;
			btn.querySelector("span").addEventListener("click", (evt) => {
				this.delete(id);
				evt.stopPropagation();  // prevent click from going to parent
			});
		}
		updateNetwork();
	}
};
