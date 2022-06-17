/**
 * Create Lanuage Switcher web component.
 * Use this component to render currency switcher element
 */
 if (!customElements.get("sht-language-switcher")) {
  class SHTLanuageSwitcher extends HTMLElement {
    /**
     * Constructor
     */
    constructor() {
      super();
      this.subElms = {
        language_code_field: this.querySelector(
          ".js-language-switcher-language-code-field"
        ),
        language_btn: this.querySelector(".js-language-switcher-button"),
        language_list: this.querySelector(
          ".js-language-switcher-language-list"
        ),
        language_link_items: this.querySelectorAll(
          ".js-language-switcher-language-item-link"
        ),
        language_form: this.querySelector(".js-language-switcher-form"),
      };

      // Toggle the currency list
      this.subElms.language_btn.addEventListener(
        "click",
        this.toggleLanuageSwitcher.bind(this, { toggle: true })
      );
      this.subElms.language_btn.addEventListener(
        "focusout",
        this.toggleLanuageSwitcher.bind(this, { toggle: false })
      );
      // Bind onLinkClick handler to all links

      this.subElms.language_link_items.forEach((item) => {
        item.addEventListener("click", this.onLinkItemClickHandler.bind(this));
      });

      this.addEventListener(
        "keyup",
        this.onKeyUpLanuageSwitcherHandler.bind(this)
      );
    }

    /**
     * Toggle Currency switcher
     * @param object params
     */
    toggleLanuageSwitcher(params, event) {
      if (params.toggle) {
        this.subElms.language_btn.focus();
        this.toggleLanuageList(true);
      } else {
        if (!this.contains(event.relatedTarget)) {
          this.toggleLanuageList(false);
        }
      }
    }
    /**
     * Show / hide currency List
     * @param boolean open
     */
    toggleLanuageList(open) {
      if (open) {
        this.subElms.language_list.toggleAttribute("hidden");
        this.subElms.language_btn.setAttribute("aria-expanded", "true");
      } else {
        this.subElms.language_list.setAttribute("hidden", true);
        this.subElms.language_btn.setAttribute("aria-expanded", "false");
      }
    }
    /**
     * Close the currency switcher by enter key
     */
    onKeyUpLanuageSwitcherHandler(e) {
      if (typeof e.code === "undefined") return;
      if (e.code.toUpperCase() !== "ESCAPE") return;
      this.subElms.language_btn.focus();
      this.toggleLanuageList(false);
    }
    /**
     * Handle item link
     * @param Event e
     */
    onLinkItemClickHandler(e) {
      e.preventDefault();
      this.subElms.language_code_field.value = e.currentTarget.dataset.value;
      this.subElms.language_form.submit();
    }
  }

  // Register to the Browser from `customElements` API
  customElements.define("sht-language-switcher", SHTLanuageSwitcher);
}