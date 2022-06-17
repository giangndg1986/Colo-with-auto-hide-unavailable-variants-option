class SHTAdvancedFilter extends HTMLElement {
  constructor() {
    super();
    this.sort_by_select_elm = this.querySelector(".js-filter-sort-by");
    this.bindEventHandlers();
  }

  bindEventHandlers() {
    this.sort_by_select_elm.addEventListener(
      "change",
      this.debounce(this.onSortByHandle, 500).bind(this)
    );
  }

  onSortByHandle(e) {
    let search_params = {};
    search_params.sort_by = e.target.value;

    location.search = this.queryParams(search_params);
  }
  queryParams(source) {
    var array = [];

    for (var key in source) {
      array.push(
        encodeURIComponent(key) + "=" + encodeURIComponent(source[key])
      );
    }

    return array.join("&");
  }
  debounce(fn, wait) {
    let t;
    return (...args) => {
      clearTimeout(t);
      t = setTimeout(() => fn.apply(this, args), wait);
    };
  }
}
// Register to the Browser from `customElements` API
customElements.define("sht-advanced-filter", SHTAdvancedFilter);
