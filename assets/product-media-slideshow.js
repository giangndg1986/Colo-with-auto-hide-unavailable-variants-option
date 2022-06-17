if (!customElements.get("sht-product-media-item-deferred-video")) {
  class SHTProductMediaItemDeferredVideo extends HTMLElement {
    /**
     * Constructor
     */
    constructor() {
      super();
      this.itemDeferredVideoImageElem = this.querySelector(
        ".js-product-media-item-deferred-video-image"
      );
      if (this.itemDeferredVideoImageElem) {
        this.itemDeferredVideoImageElem.addEventListener("click", (event) => {
          this.loadContent();
        });
      }
    }

    loadContent() {
      if (!this.getAttribute("loaded")) {
        let template =
          this.querySelector("template").content.firstElementChild.cloneNode(
            true
          );
        this.appendChild(template);
        this.isLoaded(true);
        this.itemDeferredVideoImageElem &&
          this.itemDeferredVideoImageElem.remove();
        return true;
      }
    }

    isLoaded(loaded) {
      if (loaded) {
        this.setAttribute("loaded", true);
      } else {
        this.removeAttribute("loaded");
      }
    }
  }

  customElements.define(
    "sht-product-media-item-deferred-video",
    SHTProductMediaItemDeferredVideo
  );
}

if (!customElements.get("sht-product-media-item-model")) {
  class SHTProductMediaItemModel extends HTMLElement {
    constructor() {
      super();
      this.itemModelImageElem = this.querySelector(
        ".js-product-media-item-model-image"
      );
      if (this.itemModelImageElem) {
        this.itemModelImageElem.addEventListener("click", (event) => {
          this.loadContent();
        });
      }
    }

    loadModelViewerUICss() {
      if (!document.querySelector("#model-viewer-ui")) {
        let productModelCssFile = document.createElement("link");
        productModelCssFile.setAttribute(
          "href",
          `https://cdn.shopify.com/shopifycloud/model-viewer-ui/assets/v1.0/model-viewer-ui.css`
        );
        // productModelCssFile.setAttribute("data-css-id", "model-viewer-ui");
        productModelCssFile.setAttribute("rel", "stylesheet");
        productModelCssFile.setAttribute("media", "all");
        productModelCssFile.setAttribute("id", "model-viewer-ui");
        document
          .getElementsByTagName("head")[0]
          .appendChild(productModelCssFile);
      }
    }
    loadContent() {
      if (this.getAttribute("loaded")) return;

      let content = document.createElement("div");
      content.appendChild(
        this.querySelector("template").content.firstElementChild.cloneNode(true)
      );

      this.setAttribute("loaded", true);

      this.itemModelImageElem && this.itemModelImageElem.remove();
      this.appendChild(content.querySelector("model-viewer")).focus();
      this.loadModelViewerUICss();
      Shopify.loadFeatures([
        {
          name: "model-viewer-ui",
          version: "1.0",
          onLoad: this.setupModelViewerUI.bind(this),
        },
      ]);
    }

    setupModelViewerUI(errors) {
      if (errors) return;

      this.modelViewerUI = new Shopify.ModelViewerUI(
        this.querySelector("model-viewer")
      );
    }
  }

  customElements.define(
    "sht-product-media-item-model",
    SHTProductMediaItemModel
  );
}

window.SHTProductMediaItemModel = {
  isMouseenter: false,
  loadShopifyXR() {
    Shopify.loadFeatures([
      {
        name: "shopify-xr",
        version: "1.0",
        onLoad: this.setupShopifyXR.bind(this),
      },
    ]);
  },

  setupShopifyXR(errors) {
    if (errors) return;

    if (!window.ShopifyXR) {
      document.addEventListener("shopify_xr_initialized", () =>
        this.setupShopifyXR()
      );
      return;
    }

    document.querySelectorAll('[id^="ProductJSON-"]').forEach((modelJSON) => {
      window.ShopifyXR.addModels(JSON.parse(modelJSON.textContent));
      modelJSON.remove();
    });
    window.ShopifyXR.setupXRElements();
  },
};

if (Shopify.designMode) {
  document
    .querySelectorAll("[data-shopify-xr-hidden]")
    .forEach((element) => element.classList.add("hidden"));
  if (window.SHTProductMediaItemModel)
    window.SHTProductMediaItemModel.loadShopifyXR();
} else {
  if (window.SHTProductMediaItemModel) {
    window.addEventListener(
      "scroll",
      function (event) {
        if (!window.SHTProductMediaItemModel.isMouseenter) {
          window.SHTProductMediaItemModel.loadShopifyXR();
        }
        window.SHTProductMediaItemModel.isMouseenter = true;
      },
      false
    );
    ["mouseenter", "touchstart", "mouseover"].forEach(function (e) {
      document.querySelector("body").addEventListener(e, function (event) {
        if (!window.SHTProductMediaItemModel.isMouseenter) {
          window.SHTProductMediaItemModel.loadShopifyXR();
        }
        window.SHTProductMediaItemModel.isMouseenter = true;
      });
    });
  }
}

if (!customElements.get("sht-product-media-slideshow")) {
  class SHTProductMediaSlideShow extends HTMLElement {
    constructor() {
      super();
      this.querySelectorAll(".js-slideshow-button").forEach((e) => {
        e.addEventListener("click", this.setActiveMedia.bind(this, e));
      });
      this.init();
    }

    init() {
      // let activeMedia = this.querySelector(".js-product-media-item.is-active");
      // if (!activeMedia) return;

      //this.playActiveVideo(activeMedia);
      // this.playActiveModel(activeMedia);

      this.setTotalItemsToProductMediaModalDialog();
    }

    setTotalItemsToProductMediaModalDialog() {
      let productMediaModalDialog = this.querySelector(
        "sht-product-media-modal-dialog"
      ).setAttribute(
        "data-modal-dialog-total-items",
        this.querySelectorAll(".js-product-media-item").length
      );
    }
    setActiveMedia(e) {
      let activeMedia = this.querySelector(
        `[data-media-id="${e.dataset.target}"]`
      );

      let activeThumb = e.closest("li");

      this.querySelectorAll(".js-product-media-item").forEach((element) => {
        element.classList.remove("is-active");
      });

      this.querySelectorAll(".js-product-media-slideshow-thumb-item").forEach(
        (element) => {
          element.classList.remove("is-active");
        }
      );

      activeMedia.classList.add("is-active");
      activeThumb.classList.add("is-active");

      this.playActiveVideo(activeMedia);

      this.playActiveModel(activeMedia);
    }

    pauseAllVideo() {
      this.querySelectorAll(".js-media-item-youtube").forEach((video) => {
        video.contentWindow.postMessage(
          '{"event":"command","func":"' + "pauseVideo" + '","args":""}',
          "*"
        );
      });
      this.querySelectorAll(".js-media-item-vimeo").forEach((video) => {
        video.contentWindow.postMessage('{"method":"pause"}', "*");
      });

      this.querySelectorAll(".js-media-item-video").forEach((video) =>
        video.pause()
      );
    }

    pauseAllModel() {
      document
        .querySelectorAll("sht-product-media-item-model")
        .forEach((model) => {
          if (model.modelViewerUI) model.modelViewerUI.pause();
        });
    }

    playActiveVideo(activeItem) {
      this.pauseAllVideo();
      let deferredExternalVideo = activeItem.querySelector(
        ".js-product-media-deferred-video"
      );

      if (deferredExternalVideo) deferredExternalVideo.loadContent();
    }

    playActiveModel(activeItem) {
      //this.pauseAllModel();
      let deferredExternalModel = activeItem.querySelector(
        ".js-product-media-deferred-model"
      );
      if (deferredExternalModel) deferredExternalModel.loadContent();
    }
    /**
     * bind event handler to web component elements
     */
    bindEventHandlers() {}
  }

  customElements.define(
    "sht-product-media-slideshow",
    SHTProductMediaSlideShow
  );
}

if (!customElements.get("sht-product-media-modal-dialog-deferred-media")) {
  class SHTProductMediaModalDialogDeferredMedia extends HTMLElement {
    /**
     * Constructor
     */
    constructor() {
      super();
      this.mediaType = this.dataset.productMediaModalDeferredMediaType || "";
    }
    getMediaType() {
      return this.mediaType || "";
    }
    /**
     * Load media
     */
    loadMedia() {
      this.removeMediaLoadedStatus();
      if (!this.getAttribute("loaded")) {
        const wrapper = document.createElement("div");

        const template = this.querySelector(
          "template.js-product-media-modal-dialog-deferred-media-template"
        ).content.firstElementChild.cloneNode(true);
        wrapper.appendChild(template);
        this.isLoaded(true);

        return wrapper;
      }
    }
    /**
     * remove media
     */
    removeMediaLoadedStatus() {
      if (this.getAttribute("loaded")) {
        this.isLoaded(false);
      }
    }
    /**
     * Set loaded on the modal open and vice versa
     * @param boolean loaded
     */
    isLoaded(loaded) {
      if (loaded) {
        this.setAttribute("loaded", true);
      } else {
        this.removeAttribute("loaded");
      }
    }
  }

  customElements.define(
    "sht-product-media-modal-dialog-deferred-media",
    SHTProductMediaModalDialogDeferredMedia
  );
}

if (!customElements.get("sht-product-media-modal-dialog-opener")) {
  class SHTProductMediaModalDialogOpener extends HTMLElement {
    /**
     * Constructor
     */
    constructor() {
      super();
      this.elms = {
        product_media_item_modal_dialog_opener_trigger: this.querySelector(
          `.js-product-media-modal-dialog-opener-trigger`
        ),
        product_media_item_modal_dialog_data_index: this.getAttribute(
          "data-modal-opener-index"
        ),
        product_media_item_modal_dialog: document.querySelector(
          "sht-product-media-modal-dialog"
        ),
        // product_media_item_inline: this.querySelector(
        //   "sht-product-media-item-inline"
        // ),
      };
      this.openerType = this.getAttribute("data-modal-opener-type") || "image";

      this.bindEventHandlers();
    }

    /**
     * bind event handler to web component elements
     */
    bindEventHandlers() {
      this.elms.product_media_item_modal_dialog_opener_trigger.addEventListener(
        "click",
        this.onModalOpenerClickHandle.bind(this)
      );
    }
    /**
     * Open Modal component
     */
    onModalOpenerClickHandle(e) {
      if (this.openerType != "image") return;
      this.elms.product_media_item_modal_dialog.show(
        this.getAttribute("data-modal-opener-index"),
        this.getAttribute("data-image-id")
      );
      // let openerStatus =
      //   e.target.getAttribute("data-modal-opener-enabled") || "true";
      // let openerShowType =
      //   e.target.getAttribute("data-modal-opener-show-type") || "modal";

      // if (openerStatus === "false") return;

      // if (openerShowType == "modal") {
      //   this.elms.product_media_item_modal_dialog.show(
      //     this.getAttribute("data-modal-opener-index"),
      //     this.getAttribute("data-image-id")
      //   );
      // } else if (
      //   openerShowType == "inline" &&
      //   (this.openerType == "external_video" || this.openerType == "video")
      // ) {
      //   this.elms.product_media_item_inline.show(
      //     this.getAttribute("data-modal-opener-index"),
      //     e.target
      //   );
      // }
    }
  }

  customElements.define(
    "sht-product-media-modal-dialog-opener",
    SHTProductMediaModalDialogOpener
  );
}

if (!customElements.get("sht-product-media-modal-dialog")) {
  class SHTProductMediaModalDialog extends HTMLElement {
    /**
     * Constructor
     */
    constructor() {
      super();
      this.current_index = null;
      this.deferred_media = null;
      this.current_id = null;
      this.elms = {
        modal_close_buttons: this.querySelectorAll(`.js-modal-btn-close`),
        modal_prev_button: this.querySelector(`.js-modal-btn-prev`),
        modal_next_button: this.querySelector(`.js-modal-btn-next`),
        modal_content: this.querySelector(`.js-modal-content`),
        modal_number_text: this.querySelector(`.js-modal-number-text`),
        modal_dialog_total_items: this.getAttribute(
          "data-modal-dialog-total-items"
        ),
        body: document.querySelector("body"),
      };
      this.modal_next_button_enable_status = true;
      this.modal_prev_button_enable_status = true;

      this.bindEventHandlers();
    }
    /**
     * bind event handler to web component elements
     */
    bindEventHandlers() {
      this.addEventListener("keyup", (event) => {
        if (event.code.toUpperCase() === "ESCAPE") this.hide();
      });

      this.elms.modal_close_buttons.forEach((btn) => {
        btn.addEventListener("click", (event) => {
          this.hide();
        });
      });

      this.addEventListener("click", (event) => {
        if (
          event.target.nodeName.toUpperCase() ===
          "SHT-PRODUCT-MEDIA-MODAL-DIALOG"
        )
          this.hide();
      });

      this.elms.modal_next_button.addEventListener(
        "click",
        this.onNextBtnClickHandle.bind(this)
      );

      this.elms.modal_prev_button.addEventListener(
        "click",
        this.onPrevBtnClickHandle.bind(this)
      );
    }
    /**
     * Go to the prev slide
     */
    prevSlide() {
      if (this.current_index > -1) {
        this.current_index -= 1;
        if (this.current_index <= 0) {
          this.modal_prev_button_enable_status = false;
        }
        this.modal_next_button_enable_status = true;
      }
    }
    /**
     * Go to the next slide
     */
    nextSlide() {
      if (this.current_index < this.elms.modal_dialog_total_items) {
        this.current_index += 1;
        if (this.current_index == this.elms.modal_dialog_total_items - 1) {
          this.modal_next_button_enable_status = false;
        }
        this.modal_prev_button_enable_status = true;
      }
    }
    /**
     * Handle Prev Button click
     */
    onPrevBtnClickHandle() {
      this.prevSlide();
      this.show(this.current_index, this.current_id);
      this.processNavigator();
    }
    /**
     * Handle Next Button click
     */
    onNextBtnClickHandle() {
      this.nextSlide();
      this.show(this.current_index, this.current_id);
      this.processNavigator();
    }
    /**
     * Open the modal
     * @param {Dom Element} opener
     */
    show(index, id) {
      this.current_index = parseInt(index);
      this.current_id = id;
      this.deferred_media = document.querySelector(
        `sht-product-media-modal-dialog-deferred-media.${this.current_id}[data-product-media-modal-deferred-media-index="${this.current_index}"]`
      );

      if (this.current_index >= this.elms.modal_dialog_total_items - 1) {
        this.modal_next_button_enable_status = false;
      }
      if (this.current_index <= 0) {
        this.modal_prev_button_enable_status = false;
      }

      let data = this.deferred_media.loadMedia();

      this.elms.modal_content.innerHTML = data.innerHTML;

      this.playActiveModel(this.elms.modal_content);

      this.deferred_media.removeMediaLoadedStatus();
      this.pauseAllMedia();
      this.toggleModalDialog(true);
      this.toggleBodyClass(true);
      this.renderNumberText();
      this.processNavigator();
      this.focus();
    }

    playActiveModel(activeItem) {
      let deferredExternalModel = activeItem.querySelector(
        ".js-product-media-deferred-model"
      );

      if (deferredExternalModel) deferredExternalModel.loadContent();
    }
    /**
     * Pause all youtube/vimeo/html video
     */
    pauseAllMedia() {
      document.querySelectorAll(".sht-js-youtube").forEach((video) => {
        video.contentWindow.postMessage(
          '{"event": "command","func": "' + "pauseVideo" + '","args": ""}',
          "*"
        );
      });
      document.querySelectorAll(".sht-js-vimeo").forEach((video) => {
        video.contentWindow.postMessage('{"method": "pause"}', "*");
      });
      document.querySelectorAll("video").forEach((video) => video.pause());
    }

    /**
     * Close the modal
     */
    hide() {
      if (this.hasAttribute("open")) {
        this.deferred_media.removeMediaLoadedStatus();
        this.toggleModalDialog(false);
        this.toggleBodyClass(false);
      }
    }

    /**
     * Process data for number text and show it
     */
    renderNumberText() {
      let current = parseInt(this.current_index) + 1;
      let total = parseInt(this.elms.modal_dialog_total_items);
      this.elms.modal_number_text.innerHTML = `${current} / ${total}`;
    }
    /**
     * Add/Remove Modal open attribute
     * @param boolean toggle
     */
    toggleModalDialog(toggle) {
      if (toggle) {
        this.setAttribute("open", "");
      } else {
        this.removeAttribute("open");
        this.resetModal();
      }
    }

    /**
     * ToggleBodyClass
     */
    toggleBodyClass(toggle) {
      if (toggle) {
        this.elms.body.classList.add("sht-modal-overflow-hidden");
      } else {
        this.elms.body.classList.remove("sht-modal-overflow-hidden");
      }
    }
    /**
     * Process Paginator
     */
    processNavigator() {
      this.enableNextBtn();
      this.enablePrevBtn();
    }

    /**
     * Toggle disabled attribute for the next button
     */
    enableNextBtn() {
      if (!this.modal_next_button_enable_status) {
        this.elms.modal_next_button.setAttribute("disabled", true);
      } else {
        this.elms.modal_next_button.removeAttribute("disabled");
      }
    }
    /**
     * Toggle disabled attribute for the prev button
     */
    enablePrevBtn() {
      if (!this.modal_prev_button_enable_status) {
        this.elms.modal_prev_button.setAttribute("disabled", true);
      } else {
        this.elms.modal_prev_button.removeAttribute("disabled");
      }
    }
    /**
     * Reset the modal data
     */
    resetModal() {
      this.elms.modal_number_text.innerHTML = "";
      this.elms.modal_content.innerHTML = "";
      this.modal_next_button_enable_status = true;
      this.modal_prev_button_enable_status = true;
    }
  }

  customElements.define(
    "sht-product-media-modal-dialog",
    SHTProductMediaModalDialog
  );
}
