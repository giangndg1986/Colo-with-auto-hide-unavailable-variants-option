if (!customElements.get("sht-tabs")) {
  class SHTTabs extends HTMLElement {
    /**
     * Constructor
     */
    constructor() {
      super();
      this.tabLinks = this.querySelectorAll(".js-tab-link");
      this.tabPanels = this.querySelectorAll(".js-tab-panel");
      this.bindEventHandlers();
    }

    /**
     * bind event handler to web component elements
     */
    bindEventHandlers() {
      this.tabLinks.forEach(
        function (e, k, p) {
          e.addEventListener(
            "click",
            function (evt) {
              evt.preventDefault();
              this.tabLinkEventHandler(evt.target);
            }.bind(this)
          );
        }.bind(this)
      );
    }

    tabLinkEventHandler(e) {
      let id = e.getAttribute("href").replace("#", "");
      this.tabPanels.forEach(
        function (e) {
          e.classList.remove("dpy-blk", "tab__panel--active");
          e.classList.add("dpy-ne");
        }.bind(this)
      );

      this.tabLinks.forEach(
        function (e) {
          e.classList.remove("tab__link--active");
        }.bind(this)
      );

      let currentPanel = this.querySelector(`[data-tab-content-id=${id}]`);
      currentPanel.classList.remove("dpy-ne");
      currentPanel.classList.add("dpy-blk", "tab__panel--active");

      e.classList.add("tab__link--active");
    }
    /**
     * When the element is added to the DOM, the connectedCallback method is triggered
     */
    connectedCallback() {}
    /**
     * When the element is removed from the DOM, the disconnectedCallback method is triggered
     */
    disconnectedCallback() {}
  }
  customElements.define("sht-tabs", SHTTabs);
}
