if (!customElements.get("sht-lazy-load-dynamic-checkout-button")) {
  class SHTLoadDynamicCheckoutButtonDynamicCheckoutButton extends HTMLElement {
    /**
     * Constructor
     */
    constructor() {
      super();
      this.template = this.querySelector("template");
      this.onLoadDynamicCheckoutButton =
        this.onHandleLoadDynamicCheckoutButton.bind(this);
      this.bindEventHandlers();
      this.isMouseenter = false;
      this.json = JSON.parse(
        document.querySelector(`#shopify-features[type="application/json"]`)
          .textContent
      );
      if (Shopify.designMode) {
        this.loadDynamicCheckoutButton();
      } else {
        window.addEventListener(
          "scroll",
          this.onLoadDynamicCheckoutButton,
          false
        );

        window.addEventListener(
          "load",
          function (event) {
            let timeout = setTimeout(
              function () {
                if (!this.isMouseenter) {
                  this.loadDynamicCheckoutButton();
                  clearTimeout(timeout);
                }
                this.isMouseenter = true;
              }.bind(this),
              3000
            );
          }.bind(this)
        );

        [("mouseenter", "touchstart", "mouseover")].forEach(
          function (e) {
            document
              .querySelector("body")
              .addEventListener(e, this.onLoadDynamicCheckoutButton);
          }.bind(this)
        );
      }
    }

    onHandleLoadDynamicCheckoutButton(event) {
      if (!this.isMouseenter) {
        this.loadDynamicCheckoutButton();
      }
      event.currentTarget.removeEventListener(
        event.type,
        this.onLoadDynamicCheckoutButton
      );
      this.isMouseenter = true;
    }

    loadDynamicCheckoutButton() {
      let observer = new IntersectionObserver(
        (entries, observer) => {
          entries.forEach((entry) => {
            if (entry.intersectionRatio === 1 && !this.getAttribute("loaded")) {
              let tmp = this.template.content.firstElementChild.cloneNode(true);
              let script = document.createElement("script");
              script.src = this.json.smart_payment_buttons_url;
              script.setAttribute(
                "data-source-attribute",
                "shopify.dynamic_checkout.product.init"
              );
              this.parentNode.insertBefore(tmp, this.nextSibling);
              this.parentNode.insertBefore(script, this.nextSibling);
              this.setAttribute("loaded", true);
              observer.unobserve(this);
            }
          });
        },
        {
          root: null,
          rootMargin: "50px 0px",
          threshold: 0,
        }
      );
      observer.observe(this);
    }
    /**
     * bind event handler to web component elements
     */
    bindEventHandlers() {}
  }
  customElements.define(
    "sht-lazy-load-dynamic-checkout-button",
    SHTLoadDynamicCheckoutButtonDynamicCheckoutButton
  );
}
