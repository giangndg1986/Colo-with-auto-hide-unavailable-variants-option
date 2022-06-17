class SHTMainCollectionProductFilterForm extends HTMLElement {
  constructor() {
    super();
    this.pathname = window.location.pathname;
    this.product_grid_container_selector = "ProductGridContainer";
    this.product_count_selector = ".js-product-count";
    this.active_search_terms_selector = ".js-active-filters";
    this.cached_results = [];
    this.onActiveFilterClick = this.onActiveFilterClick.bind(this);
    this.debouncedOnSubmit = this.debounce((event) => {
      this.onSubmitHandler(event);
    }, 500);

    this.querySelector("form").addEventListener(
      "input",
      this.debouncedOnSubmit.bind(this)
    );
  }

  onActiveFilterClick(event) {
    event.preventDefault();

    let url =
      event.currentTarget.href.indexOf("?") == -1
        ? ""
        : event.currentTarget.href.slice(
            event.currentTarget.href.indexOf("?") + 1
          );
    this.renderPage(url);
  }

  onSubmitHandler(event) {
    event.preventDefault();
    let formData = new FormData(event.target.closest("form"));
    let searchParams = new URLSearchParams(formData).toString();

    //console.log(searchParams);
    this.renderPage(searchParams, event);
  }

  renderPage(searchParams, event, updateURLHash = true) {
    let url = this.buildURL(searchParams);
    let cache = this.getReturnedResultsFromCache(url);

    if (cache) {
      let refinedHTML = this.refineReturnedResults(cache);
      this.renderFilters(cache, event);
      this.renderReturnedResults(refinedHTML, searchParams);
      this.renderProductCount(cache);
      return;
    }

    fetch(url)
      .then((response) => {
        if (!response.ok) {
          var error = new Error(response.status);
          throw error;
        }
        return response.text();
      })
      .then((responseText) => {
        let html = responseText;
        let refinedHTML = this.refineReturnedResults(html);
        this.renderFilters(html, event);
        this.renderReturnedResults(refinedHTML, searchParams);
        this.addReturnedResultsToCache(url, html);
        //this.renderActiveSearchTerms(html, event);
        this.renderProductCount(html);
      })
      .catch((error) => {
        console.error(error);
      });
  }

  renderActiveSearchTerms(html, event) {
    const parsedHTML = new DOMParser().parseFromString(html, "text/html");
    let activeSearchTerms = parsedHTML.querySelector(
      this.active_search_terms_selector
    );
    if (!activeSearchTerms) return;

    let detailsElements = parsedHTML.querySelectorAll(this.details_selector);

    let matchesDetailsElement = (element) => {
      let closestDetailsElement = event
        ? event.target.closest(this.details_selector)
        : undefined;

      return closestDetailsElement
        ? element.dataset.index === closestDetailsElement.dataset.index
        : false;
    };

    let detailsElementsToRender = Array.from(detailsElements).filter(
      (element) => !matchesDetailsElement(element)
    );

    detailsElementsToRender.forEach((element) => {
      document.querySelector(
        `[data-index="${element.dataset.index}"]${this.details_selector}`
      ).innerHTML = element.innerHTML;
    });

    document.querySelector(this.active_search_terms_selector).innerHTML =
      activeSearchTerms.innerHTML;
  }

  renderFilters(html, event) {
    let parsedHTML = new DOMParser().parseFromString(html, "text/html");

    let filterDetailsElements = parsedHTML.querySelectorAll(
      "#MainCollectionProductFiltersForm .js-details-filter"
    );

    let matchesIndex = (element) => {
      let jsFilter = event
        ? event.target.closest(".js-details-filter")
        : undefined;

      return jsFilter
        ? element.dataset.index === jsFilter.dataset.index
        : false;
    };

    let filterToRender = Array.from(filterDetailsElements).filter(
      (element) => !matchesIndex(element)
    );

    filterToRender.forEach((element) => {
      document.querySelector(
        `.js-details-filter[data-index="${element.dataset.index}"]`
      ).innerHTML = element.innerHTML;
    });

    this.renderActiveSearchTerms(parsedHTML);
  }

  renderReturnedResults(html, searchParams) {
    document.getElementById(this.product_grid_container_selector).innerHTML =
      html;
    this.updateURL(searchParams);
    //this.toggleLoading(false);
  }

  updateURL(searchParams) {
    history.pushState(
      { searchParams },
      "",
      `${this.pathname}${searchParams && "?".concat(searchParams)}`
    );
  }

  refineReturnedResults(html) {
    const resultsMarkup = new DOMParser()
      .parseFromString(html, "text/html")
      .getElementById(this.product_grid_container_selector).innerHTML;
    return resultsMarkup;
  }

  buildURL(searchParams) {
    let sections = this.getSections();
    let url = null;
    sections.forEach((section) => {
      url = `${this.pathname}?section_id=${section.section}&${searchParams}`;
    });

    return url;
  }

  getReturnedResultsFromCache(url) {
    let filterDataUrl = (element) => element.url === url;
    if (this.cached_results.some(filterDataUrl)) {
      return this.cached_results.find(filterDataUrl).html;
    }

    return false;
  }

  renderProductCount(html) {
    let count = new DOMParser()
      .parseFromString(html, "text/html")
      .querySelector(this.product_count_selector).innerHTML;
    let product_count = document.querySelectorAll(this.product_count_selector);
    product_count.forEach((el) => {
      el.innerHTML = count;
    });
  }

  addReturnedResultsToCache(url, html) {
    this.cached_results = [...this.cached_results, { html, url }];
  }

  getSections() {
    return [
      {
        section: document.querySelector(".js-product-grid").dataset.id,
      },
    ];
  }

  renderActiveSearchTerms(html) {
    let activeSearchTerms = html.querySelector(
      this.active_search_terms_selector
    );
    if (!activeSearchTerms) return;

    this.querySelector(this.active_search_terms_selector).innerHTML =
      activeSearchTerms.innerHTML;
  }

  debounce(fn, wait) {
    let t;
    return (...args) => {
      clearTimeout(t);
      t = setTimeout(() => fn.apply(this, args), wait);
    };
  }
}

customElements.define(
  "sht-main-collection-product-filter-form",
  SHTMainCollectionProductFilterForm
);

class SHTMainCollectionProductFilterFormReset extends HTMLElement {
  constructor() {
    super();
    this.querySelector(".js-reset-form-btn").addEventListener(
      "click",
      (event) => {
        event.preventDefault();
        let form =
          this.closest("sht-main-collection-product-filter-form") ||
          document.querySelector("sht-main-collection-product-filter-form");
        form.onActiveFilterClick(event);
      }
    );
  }
}

customElements.define(
  "sht-main-collection-product-filter-form-reset",
  SHTMainCollectionProductFilterFormReset
);

class SHTMainCollectionProductFilterFormPriceRange extends HTMLElement {
  constructor() {
    super();

    this.bindEventHandlers();
    this.setMinAndMaxValues();
  }
  bindEventHandlers() {
    this.querySelectorAll(".js-filter-price").forEach((element) =>
      element.addEventListener("change", this.onRangeChangeHandle.bind(this))
    );
  }
  onRangeChangeHandle(event) {
    this.adjustToValidValues(event.currentTarget);
    this.setMinAndMaxValues();
  }

  setMinAndMaxValues() {
    let gte = this.querySelector(".js-price-gte");
    let lte = this.querySelector(".js-price-lte");

    if (lte.value) gte.setAttribute("max", lte.value);
    if (gte.value) lte.setAttribute("min", gte.value);
    if (gte.value === "") lte.setAttribute("min", 0);
    if (lte.value === "") gte.setAttribute("max", lte.getAttribute("max"));
  }

  adjustToValidValues(input) {
    let value = Number(input.value);
    let min = Number(input.getAttribute("min"));
    let max = Number(input.getAttribute("max"));

    if (value < min) input.value = min;
    if (value > max) input.value = max;
  }
}

customElements.define(
  "sht-main-collection-product-filter-form-range",
  SHTMainCollectionProductFilterFormPriceRange
);
