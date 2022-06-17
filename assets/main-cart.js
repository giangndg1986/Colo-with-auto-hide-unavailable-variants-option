class SHTCartRemoveButton extends HTMLElement {
  constructor() {
    super();
    this.addEventListener("click", (event) => {
      event.preventDefault();
      this.closest("sht-cart-form").updateQuantity(this.dataset.index, 0);
    });
  }
}

customElements.define("sht-cart-remove-button", SHTCartRemoveButton);

class SHTCartForm extends HTMLElement {
  constructor() {
    super();

    this.totalItems = Array.from(
      this.querySelectorAll(".js-quantity-input")
    ).reduce((total, ele) => total + parseInt(ele.value), 0);

    this.bindEventHandlers();
  }

  bindEventHandlers() {
    this.addEventListener(
      "change",
      this.debounce((event) => {
        this.onChange(event);
      }, 300)
    );
  }

  onChange(event) {
    this.updateQuantity(
      event.target.dataset.index,
      event.target.value,
      document.activeElement.dataset.name
    );
  }

  getSectionsToRender() {
    return [
      {
        id: "CartForm",
        section: document.getElementById("MainCart").dataset.sectionId,
        selectors: [
          ".js-cart-form-content-cart-items",
          ".js-cart-form-content-cart-total",
        ],
      },
      {
        id: "HeaderCartStatus",
        section: "header-cart-status",
        selectors: [".shopify-section"],
      },
    ];
  }

  updateQuantity(line, quantity, name) {
    let body = JSON.stringify({
      line,
      quantity,
      sections: this.getSectionsToRender().map((section) => section.section),
      sections_url: window.location.pathname,
    });

    fetch(`${window.routes.cart_change_url}`, {
      ...{
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: `application/json`,
        },
      },
      ...{ body },
    })
      .then((response) => {
        return response.text();
      })
      .then((state) => {
        let parsedState = JSON.parse(state);
        let cartFooter = this.querySelector(".js-cart-form-footer");

        this.classList.toggle(
          "cart-contents--is-empty",
          parsedState.item_count === 0
        );

        if (cartFooter) {
          cartFooter.classList.toggle("dpy-ne", parsedState.item_count === 0);
        }

        this.getSectionsToRender().forEach((section) => {
          section.selectors.forEach((e) => {
            let shouldBeReplacedElm =
              document.getElementById(section.id).querySelector(e) ||
              document.getElementById(section.id);

            shouldBeReplacedElm.innerHTML = this.getSectionInnerHTML(
              parsedState.sections[section.section],
              e
            );
          });
        });

        let lineItem = document.getElementById(`CartItem-${line}`);
        if (lineItem) {
          let quantityBtn = lineItem.querySelector(
            `.js-quantity-button--${name}`
          );
          quantityBtn && quantityBtn.focus();
        }
      })
      .catch(() => {
        this.querySelector(".js-cart-form-errors").textContent =
          SHThemeLanguage.cart.ERROR;
      });
  }

  getSectionInnerHTML(html, selector) {
    return new DOMParser()
      .parseFromString(html, "text/html")
      .querySelector(selector).innerHTML;
  }

  debounce(fn, delay) {
    let id = null;
    return function (args) {
      clearTimeout(id);
      id = null;
      id = setTimeout(function () {
        fn.call(this, args);
      }, delay);
    };
  }
}
customElements.define("sht-cart-form", SHTCartForm);
