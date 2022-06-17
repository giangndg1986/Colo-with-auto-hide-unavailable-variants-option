/**
 * Create Country Switcher web component.
 * Use this component to render currency switcher element
 */
if (!customElements.get("sht-country-switcher")) {
  class SHTCountrySwitcher extends HTMLElement {
    /**
     * Constructor
     */
    constructor() {
      super();
      this.sub_elms = {
        country_code_field: this.querySelector(
          ".js-country-switcher-country-code-field"
        ),
        country_btn: this.querySelector(".js-country-switcher-button"),
        country_list: this.querySelector(".js-country-switcher-country-list"),
        country_link_items: this.querySelectorAll(
          ".js-country-switcher-country-item-link"
        ),
        country_form: this.querySelector(".js-country-switcher-form"),
      };

      // Toggle the currency list
      this.sub_elms.country_btn.addEventListener(
        "click",
        this.toggleCountrySwitcher.bind(this, { toggle: true })
      );
      this.sub_elms.country_btn.addEventListener(
        "focusout",
        this.toggleCountrySwitcher.bind(this, { toggle: false })
      );
      // Bind onLinkClick handler to all links

      this.sub_elms.country_link_items.forEach((item) => {
        item.addEventListener("click", this.onLinkItemClickHandler.bind(this));
      });

      this.addEventListener(
        "keyup",
        this.onKeyUpCountrySwitcherHandler.bind(this)
      );
    }

    /**
     * Toggle Currency switcher
     * @param object params
     */
    toggleCountrySwitcher(params, event) {
      if (params.toggle) {
        this.sub_elms.country_btn.focus();
        this.toggleCountryList(true);
      } else {
        if (!this.contains(event.relatedTarget)) {
          this.toggleCountryList(false);
        }
      }
    }
    /**
     * Show / hide currency List
     * @param boolean open
     */
    toggleCountryList(open) {
      if (open) {
        this.sub_elms.country_list.toggleAttribute("hidden");
        this.sub_elms.country_btn.setAttribute("aria-expanded", "true");
      } else {
        this.sub_elms.country_list.setAttribute("hidden", true);
        this.sub_elms.country_btn.setAttribute("aria-expanded", "false");
      }
    }
    /**
     * Close the currency switcher by enter key
     */
    onKeyUpCountrySwitcherHandler(e) {
      if (typeof e.code === "undefined") return;
      if (e.code.toUpperCase() !== "ESCAPE") return;
      this.sub_elms.country_btn.focus();
      this.toggleCountryList(false);
    }
    /**
     * Handle item link
     * @param Event e
     */
    onLinkItemClickHandler(e) {
      e.preventDefault();
      this.sub_elms.country_code_field.value = e.currentTarget.dataset.value;
      this.sub_elms.country_form.submit();
    }
  }

  // Register to the Browser from `customElements` API
  customElements.define("sht-country-switcher", SHTCountrySwitcher);
}
