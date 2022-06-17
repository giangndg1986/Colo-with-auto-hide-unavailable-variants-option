class SHTCartNotificationPanel extends HTMLElement {
  constructor() {
    super();
    this.notification = document.getElementById("sht-cart-notification");

    this.elms = {
      notification_wrapper: this.querySelector(
        `.js-cart-notification-panel-wrapper`
      ),
      notification_container: this.querySelector(
        `.js-cart-notification-panel-container`
      ),
      buttons: this.querySelectorAll(".js-cart-notification-panel-button"),
    };
    this.dismiss_timeout = null;
    this.bindEventHandlers();
  }

  /**
   * bind event handler to web component elements
   */
  bindEventHandlers() {
    this.elms.buttons.forEach((btn) =>
      btn.addEventListener("click", this.close.bind(this))
    );
  }

  open() {
    this.togglePanel(true);
    this.elms.notification_container.focus();
    this.addEventListener("mouseover", this.onMouseOverHandle.bind(this));
    this.addEventListener("mouseout", this.onMouseOutHandle.bind(this));
    this.setDismissTimeout();
  }

  close() {
    this.togglePanel(false);
  }

  setDismissTimeout() {
    this.dismiss_timeout = setTimeout(function () {
      this.close();
    }, 3000);
  }

  clearDismissTimeout() {
    clearTimeout(this.dismiss_timeout);
  }

  renderContents(response) {
    this.productId = response.id;

    this.getSectionsToRender().forEach((section) => {
      let dataResponse = new DOMParser().parseFromString(
        response.sections[section.id],
        "text/html"
      );

      document.querySelector(section.space_selector).innerHTML =
        this.getSectionInnerHTML(
          response.sections[section.id],
          section.selector
        );
    });
    this.open();
  }

  getSectionsToRender() {
    return [
      {
        id: "cart-notification-panel-product",
        selector: `.js-cart-notification-panel-product-${this.productId}`,
        space_selector: `.js-cart-notification-panel-content`,
      },
      {
        id: "header-cart-status",
        space_selector: `#HeaderCartStatus`,
      },
    ];
  }

  getSectionInnerHTML(html, selector = ".shopify-section") {
    return new DOMParser()
      .parseFromString(html, "text/html")
      .querySelector(selector).innerHTML;
  }

  onMouseOverHandle(evt) {
    this.clearDismissTimeout();
  }
  onMouseOutHandle(evt) {
    this.setDismissTimeout();
  }
  setActiveElement(element) {
    this.activeElement = element;
  }

  togglePanel(toggle) {
    if (toggle) {
      this.toggleAttribute("hidden", false);
    } else {
      this.setAttribute("hidden", true);
    }
    return;
  }

  setDismissTimeout() {
    this.dismiss_timeout = setTimeout(
      function () {
        this.close();
      }.bind(this),
      4000
    );
  }
}

customElements.define("sht-cart-notification-panel", SHTCartNotificationPanel);

class SHTVariantSelector extends HTMLElement {
  constructor() {
    super();
    this.elms = {
      /// select_elms: this.querySelectorAll("select"),
      radio_elms: this.querySelectorAll(".js-variant-radio-item"),
      form: document.querySelector(`#product-form-${this.dataset.section}`),
      price: document.querySelector(`#price-${this.dataset.section}`),
      installment_form: document.querySelector(`#product-form-installment`),
      sht_product_form: document.querySelector("#sht-product-form"),
      // sht_inventory_tracking: document.querySelector(
      //   `[data-selector="sht-inventory-tracking-${this.dataset.section}"]`
      // ),
      sht_variant_picker: document.querySelector(
        `#variant-picker-${this.dataset.section}`
      ),

      // sht_add_to_cart_button_sticky: document.querySelector(
      //   `[data-selector="sht-add-to-cart-button-sticky-${this.dataset.section}"]`
      // ),
      sht_quantity_input: document.querySelector(
        `#quantity-input-${this.dataset.section}`
      ),

      variant_options: this.querySelectorAll(".js-variant-option"),
      // sht_quantity_input_sticky: document.querySelector(
      //   `[data-selector="sht-quantity-input-sticky-${this.dataset.section}"]`
      // ),
    };

    this.price_selector = `#price-${this.dataset.section}`;

    //this.inventoryTrackingSelector = `[data-selector="sht-inventory-tracking-${this.dataset.section}"]`;
    this.variant_picker_selector = `#variant-picker-picker-${this.dataset.section}`;
    //this.addToCartButtonStickySelector = `[data-selector="sht-add-to-cart-button-sticky-${this.dataset.section}"]`;
    this.quantity_input_selector = `#quantity-input-${this.dataset.section}`;

    //this.quantityInputStickySelector = `[data-selector="sht-quantity-input-sticky-${this.dataset.section}"]`;

    this.selected_variants = null;
    this.variant_data = null;
    //this.sliders = null;
    this.bindEventHandlers();
    this.setUnavailableOptions();
    // this.getSliders();
  }
  toggleUnavailableOptions(unavailable = false) {
    this.elms.variant_options.forEach((element) => {
      element.classList.toggle("variant-option--unavailable", unavailable);
    });
  }
  setUnavailableOptions() {
    this.toggleUnavailableOptions(false);
    this.variant_data = this.variant_data || this.getVariantData();

    this.selected_variant_id =
      this.elms.form.querySelector('input[name="id"]').value;

    this.current_variant = this.variant_data.find(
      (variant) => variant.id === Number(this.selected_variant_id)
    );

    const {
      available: currentVariantAvailable,
      options,
      options: { length: maxOptions },
    } = this.current_variant;

    if (maxOptions > 2) {
      let keys = Object.keys(options);
      let matchVariants = [];

      //array combinations algorithm
      // Find all variants that have the same value as the selected variant
      for (let i = 0; i < maxOptions; i++) {
        for (let j = i + 1; j < maxOptions; j++) {
          if (keys[i] && keys[j]) {
            let tmpMatchVariants = this.variant_data.filter((v) => {
              return (
                v.id != this.selected_variant_id &&
                v.options[keys[i]] === this.current_variant.options[keys[i]] &&
                v.options[keys[j]] === this.current_variant.options[keys[j]] &&
                v.available == true
              );
            });
            matchVariants = [...matchVariants, ...tmpMatchVariants];
          }
        }
      }

      let tmpValidVariants = [];
      let validVariants = [];
      if (matchVariants.length) {
        // merger the match result with current variant
        matchVariants = [...matchVariants, this.current_variant];

        // get variants values only from the match result
        matchVariants.forEach((matchVariant) => {
          let { options: tmpOptions } = matchVariant;
          tmpValidVariants = [...tmpValidVariants, ...tmpOptions];
        });

        // make valid variants unique
        validVariants = [...new Set(tmpValidVariants)];

        // get rid of current variant out of valid variants if its available status is false
        if (currentVariantAvailable == false) {
          validVariants = validVariants.filter((x) => !options.includes(x));
        }
      }
      this.toggleUnavailableOptions(true);
      if (validVariants.length) {
        validVariants.forEach((e) =>
          this.querySelector(`[data-value="${e}"]`).classList.toggle(
            "variant-option--unavailable",
            false
          )
        );
      }
    } else if (maxOptions > 1) {
      let matchVariants = [];
      let tmpValidVariants = [];
      let validVariants = [];
      for (let i = 0; i < maxOptions; i++) {
        let tmpMatchVariants = this.variant_data.filter((v) => {
          return (
            v.id != this.selected_variant_id &&
            v.options[i] === this.current_variant.options[i] &&
            v.available == true
          );
        });
        matchVariants = [...matchVariants, ...tmpMatchVariants];
      }
      if (matchVariants.length) {
        // merger the match result with current variant
        matchVariants = [...matchVariants, this.current_variant];

        // get variants values only from the match result
        matchVariants.forEach((matchVariant) => {
          let { options: tmpOptions } = matchVariant;
          tmpValidVariants = [...tmpValidVariants, ...tmpOptions];
        });

        // make valid variants unique
        validVariants = [...new Set(tmpValidVariants)];
        // get rid of current variant out of valid variants if its available status is false
        if (currentVariantAvailable == false) {
          validVariants = validVariants.filter((x) => !options.includes(x));
        }
      }
      this.toggleUnavailableOptions(true);
      if (validVariants.length) {
        validVariants.forEach((e) =>
          this.querySelector(`[data-value="${e}"]`).classList.toggle(
            "variant-option--unavailable",
            false
          )
        );
      }
    } else {
      let tmpValidVariants = [];
      let validVariants = [];
      let matchVariants = this.variant_data.filter((v) => {
        return v.available == true;
      });

      if (matchVariants.length) {
        matchVariants = [...matchVariants, this.current_variant];
      }

      matchVariants.forEach((matchVariant) => {
        let { options: tmpOptions } = matchVariant;
        tmpValidVariants = [...tmpValidVariants, ...tmpOptions];
      });
      validVariants = [...new Set(tmpValidVariants)];
      if (currentVariantAvailable == false) {
        validVariants = validVariants.filter((x) => !options.includes(x));
      }
      this.toggleUnavailableOptions(true);
      if (validVariants.length) {
        validVariants.forEach((e) =>
          this.querySelector(`[data-value="${e}"]`).classList.toggle(
            "variant-option--unavailable",
            false
          )
        );
      }
    }
    return true;
  }

  getProductJson(productUrl) {
    return fetch(productUrl + ".js").then(function (response) {
      return response.json();
    });
  }
  /**
   * bind event handler to web component elements
   */
  bindEventHandlers() {
    this.addEventListener("change", this.onVariantChangeHandle.bind(this));
  }

  onVariantChangeHandle() {
    this.setSelectedVariants();
    this.setCurrentVariant();
    // this.setUnavailable();
    this.toggleAddButton(true, "", false);
    // this.setUnavailableSticky();
    // this.toggleAddButtonSticky(true, "", false);
    this.updatePickupAvailability();
    this.removeErrorMessage();

    if (!this.currentVariant) {
      this.toggleAddButton(true, "", true);
      //this.toggleAddButtonSticky(true, "", true);
      //this.setUnavailableSticky();
      this.setUnavailable();
    } else {
      this.updateURL();
      this.updateVariantInput();
      this.renderProductInfo();
      this.updateSlideShow();
      this.setUnavailableOptions();
    }
  }

  removeErrorMessage() {
    if (this.elms.sht_product_form)
      this.elms.sht_product_form.handleErrorMessage();
  }

  updatePickupAvailability() {
    const pickUpAvailability = document.querySelector(
      "sht-pickup-availability"
    );
    if (!pickUpAvailability) return;

    if (this.currentVariant && this.currentVariant.available) {
      pickUpAvailability.fetchAvailability(this.currentVariant.id);
    } else {
      pickUpAvailability.removeAttribute("available");
      pickUpAvailability.innerHTML = "";
    }
  }

  renderProductInfo() {
    fetch(
      `${this.dataset.url}?variant=${this.currentVariant.id}&section_id=${this.dataset.section}`
    )
      .then((response) => response.text())
      .then((responseText) => {
        let markup = new DOMParser().parseFromString(responseText, "text/html");

        //Update variant picker
        let variantPickerDestination = this.elms.sht_variant_picker;
        let variantPickerSource = markup.querySelector(
          this.variantPickerSelector
        );

        if (variantPickerDestination && variantPickerSource)
          variantPickerDestination.innerHTML = variantPickerSource.innerHTML;

        //Update variant picker

        //Update Inventory Tracking
        let inventoryTrackingDestination = this.elms.sht_inventory_tracking;
        let inventoryTrackingSource = markup.querySelector(
          this.inventoryTrackingSelector
        );

        if (inventoryTrackingDestination && inventoryTrackingSource)
          inventoryTrackingDestination.innerHTML =
            inventoryTrackingSource.innerHTML;

        //Update Inventory Tracking

        // Update Add To Cart Button Sticky
        // let addToCartButtonStickyDestination =
        //   this.elms.sht_add_to_cart_button_sticky;

        // let addToCartButtonStickySource = markup.querySelector(
        //   this.addToCartButtonStickySelector
        // );

        // if (addToCartButtonStickyDestination && addToCartButtonStickySource)
        //   addToCartButtonStickyDestination.innerHTML =
        //     addToCartButtonStickySource.innerHTML;

        // Update Add To Cart Button Sticky

        //Update Price
        let priceDestination = this.elms.price;
        let priceSource = markup.querySelector(this.price_selector);

        if (priceSource && priceDestination)
          priceDestination.innerHTML = priceSource.innerHTML;

        if (this.elms.price) {
          this.elms.price.classList.remove("visibility-hidden");
        }
        //Update Price

        //Update Quantity Input
        let quantityInputDestination = this.elms.sht_quantity_input;
        let quantityInputSource = markup.querySelector(
          this.quantity_input_selector
        );

        if (quantityInputDestination && quantityInputSource) {
          quantityInputDestination.innerHTML = quantityInputSource.innerHTML;
        }

        //Update Quantity Input

        //Update Quantity Input Sticky
        // let quantityInputStickyDestination =
        //   this.elms.sht_quantity_input_sticky;
        // let quantityInputStickSource = markup.querySelector(
        //   this.quantityInputStickySelector
        // );

        // if (quantityInputStickyDestination && quantityInputStickSource) {
        //   quantityInputStickyDestination.innerHTML =
        //     quantityInputStickSource.innerHTML;
        // }

        //Update Quantity Input Sticky
        this.toggleAddButton(
          !this.currentVariant.available,
          SHThemeLanguage.product.PRODUCT_SOLD_OUT
        );

        // this.toggleAddButtonSticky(
        //   !this.currentVariant.available,
        //   SHThemeLanguage.product.PRODUCT_SOLD_OUT
        // );
      });
  }

  updateVariantInput() {
    const productForms = [this.elms.form, this.elms.installment_form];

    productForms.forEach((productForm) => {
      const input = productForm.querySelector('input[name="id"]');
      input.value = this.currentVariant.id;
      input.dispatchEvent(new Event("change", { bubbles: true }));
    });
  }

  updateURL() {
    if (!this.currentVariant || this.dataset.updateUrl === "false") return;
    window.history.replaceState(
      {},
      "",
      `${this.dataset.url}?variant=${this.currentVariant.id}`
    );
  }
  disableScroll() {
    let scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    let scrollLeft = window.pageXOffset || document.documentElement.scrollLeft;

    window.onscroll = function () {
      window.scrollTo(scrollLeft, scrollTop);
    };
  }
  enableScroll() {
    window.onscroll = function () {};
  }
  updateSlideShow() {
    if (this.currentVariant.featured_media) {
      let activeButton = document.querySelector(
        `[data-target="${this.dataset.section}-${this.currentVariant.featured_media.id}"]`
      );

      activeButton.dispatchEvent(new Event("click"));

      let element = document.createElement("a");
      element.setAttribute(
        "href",
        `#${this.dataset.section}-${this.currentVariant.featured_media.id}`
      );

      document.body.appendChild(element);
      element.addEventListener(
        "click",
        function (e) {
          this.disableScroll();
          setTimeout(
            function () {
              this.enableScroll();
            }.bind(this),
            100
          );
        }.bind(this)
      );
      element.click();
      element.remove();
      this.removeHashFromUrl();
    }
    /*if (this.currentVariant.featured_media) {
      let element = document.createElement("a");
      element.setAttribute(
        "href",
        `#${this.dataset.section}--${this.currentVariant.featured_media.id}`
      );
      document.body.appendChild(element);
      element.addEventListener(
        "click",
        function (e) {
          this.disableScroll();
          setTimeout(
            function () {
              this.enableScroll();
            }.bind(this),
            100
          );
        }.bind(this)
      );
      element.click();
      element.remove();
      this.removeHashFromUrl();
    }*/
  }
  removeHashFromUrl() {
    let uri = window.location.toString();

    if (uri.indexOf("#") > 0) {
      let cleanedURI = uri.substring(0, uri.indexOf("#"));

      window.history.replaceState({}, document.title, cleanedURI);
    }
  }
  setUnavailable() {
    let form = this.elms.form;
    if (!form) return;
    let addBtn = form.querySelector(".js-product-form-submit-btn");
    let addBtnText = addBtn.querySelector(".js-product-form-submit-btn-text");
    if (!addBtn) return;

    addBtnText.textContent = SHThemeLanguage.product.PRODUCT_UNAVAILABLE;
    if (this.elms.price) this.elms.price.classList.add("visibility-hidden");
  }

  // getSliders() {
  //   this.sliders = this.sliders || SHThemeLanguage.sliders || null;
  //   return this.sliders;
  // }

  getVariantData() {
    this.variant_data =
      this.variant_data ||
      JSON.parse(this.querySelector('[type="application/json"]').textContent);
    return this.variant_data;
  }
  //updateMasterId
  setCurrentVariant() {
    this.currentVariant = this.getVariantData().find((variant) => {
      return !variant.options
        .map((option, index) => {
          return this.selected_variants[index] === option;
        })
        .includes(false);
    });
  }

  toggleAddButton(disable = true, text, modifyClass = true) {
    let form = this.elms.form;

    if (!form) return;
    let addBtn = form.querySelector(".js-product-form-submit-btn");
    let addBtnText = addBtn.querySelector(".js-product-form-submit-btn-text");

    if (!addBtn) return;

    if (disable) {
      addBtn.setAttribute("disabled", "disabled");
      if (text) addBtnText.textContent = text;
    } else {
      addBtn.removeAttribute("disabled");
      addBtnText.textContent = SHThemeLanguage.product.PRODUCT_ADD_TO_CART;
    }

    if (!modifyClass) return;
  }
}

class SHTVariantRadios extends SHTVariantSelector {
  constructor() {
    super();
  }

  setSelectedVariants() {
    let selectors = Array.from(
      this.querySelectorAll(".js-variant-radio-container")
    );
    this.selected_variants = selectors.map((selector) => {
      return Array.from(
        selector.querySelectorAll(".js-variant-radio-item")
      ).find((radio) => radio.checked).value;
    });
  }
}

customElements.define("sht-variant-radios", SHTVariantRadios);

class SHTVariantSelects extends SHTVariantSelector {
  constructor() {
    super();
  }
  //updateOptions
  setSelectedVariants() {
    this.selected_variants = Array.from(
      this.querySelectorAll(".js-variant-select-item"),
      (select) => select.value
    );
  }
}
customElements.define("sht-variant-selects", SHTVariantSelects);
class SHTProductForm extends HTMLElement {
  constructor() {
    super();
    this.elms = {
      form: this.querySelector("form"),
      submit_btn: this.querySelector('[type="submit"]'),
      error_wrapper: this.querySelector(".js-product-form-error-wrapper"),
      error_message: this.querySelector(".js-product-form-error-message"),
      spinner: this.querySelector(".js-product-form-spinner"),
    };
    this.elms.form.querySelector("[name=id]").disabled = false;

    this.cartNotification = document.querySelector(
      "sht-cart-notification-panel"
    );

    this.bindEventHandlers();
  }

  /**
   * bind event handler to web component elements
   */
  bindEventHandlers() {
    this.elms.form.addEventListener("submit", this.onSubmitHandler.bind(this));
    this.cartNotification.setActiveElement(document.activeElement);
  }
  onSubmitHandler(e) {
    e.preventDefault();

    if (this.elms.submit_btn.classList.contains("loading")) return;
    this.handleErrorMessage();

    this.elms.submit_btn.setAttribute("aria-disabled", true);
    this.elms.submit_btn.classList.add("loading");

    this.elms.spinner.classList.remove("hidden");

    let fetchConfigs = {
      method: "POST",
      headers: {
        "X-Requested-With": "XMLHttpRequest",
        Accept: "application/javascript",
      },
    };

    let formData = new FormData(this.elms.form);
    formData.append(
      "sections",
      this.cartNotification.getSectionsToRender().map((section) => section.id)
    );
    formData.append("sections_url", window.location.pathname);
    fetchConfigs.body = formData;

    fetch(`${routes.cart_add_url}`, fetchConfigs)
      .then((response) => response.json())
      .then((response) => {
        if (response.status) {
          this.handleErrorMessage(response.description);
          return;
        }

        this.cartNotification.renderContents(response);
      })
      .catch((e) => {
        console.error(e);
      })
      .finally(() => {
        this.elms.submit_btn.classList.remove("loading");
        this.elms.submit_btn.removeAttribute("aria-disabled");

        this.elms.spinner.classList.add("hidden");
      });
  }

  handleErrorMessage(errorMessage = false) {
    this.elms.error_wrapper.toggleAttribute("hidden", !errorMessage);

    if (errorMessage) {
      this.elms.error_message.textContent = errorMessage;
    }
  }
}

customElements.define("sht-product-form", SHTProductForm);
