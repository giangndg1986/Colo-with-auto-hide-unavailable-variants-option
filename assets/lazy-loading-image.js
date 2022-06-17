if (!customElements.get("sht-lazy-loading-image")) {
  class SHTLazyLoadingImage extends HTMLElement {
    /**
     * Constructor
     */
    constructor() {
      super();
      this.image = this.querySelector(".js-lazy-loading-image-item");
      this.spinner = this.querySelector(".js-lazy-loading-image-spinner");
      this.bindEventHandlers();
    }

    loadImage() {
      let imageObserver = new IntersectionObserver(
        (entries, observer) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              let target = entry.target;
              this.dispatchEvent(
                new CustomEvent("loadingStart", {
                  detail: {
                    ele: target,
                    parent: this,
                  },
                })
              );

              target.src = this.image.dataset.src || target.src;
              if (this.image.dataset.srcset) {
                target.srcset = this.image.dataset.srcset;
              }

              target.removeAttribute("loading");
              target.onload = function (e) {
                target.removeAttribute("data-src");
                target.removeAttribute("data-srcset");

                this.dispatchEvent(
                  new CustomEvent("loadingEnd", {
                    detail: {
                      ele: target,
                      parent: this,
                    },
                  })
                );

                this.isLoaded(true);
              }.bind(this);

              target.onerror = function (event) {
                console.log(
                  "Failed to load image file " + this.image.dataset.src,
                  event
                );
              }.bind(this);

              imageObserver.unobserve(target);
            }
          });
        },
        { rootMargin: "0px 0px -100px 0px" }
      );

      this.image && imageObserver.observe(this.image);
      this.spinner.remove();
    }
    /**
     * bind event handler to web component elements
     */
    bindEventHandlers() {}

    /**
     * Set loaded status on the media loaded and vice versa
     * @param boolean loaded
     */
    isLoaded(loaded) {
      if (loaded) {
        this.setAttribute("loaded", true);
      } else {
        this.removeAttribute("loaded");
      }
    }

    execute() {
      if (Shopify.designMode) {
        if (this.image) {
          this.image.src = this.image.dataset.src || this.image.src;

          if (this.image.dataset.srcset) {
            this.image.srcset = this.image.dataset.srcset;
          }
        }
        this.spinner.remove();
      } else {
        this.loadImage();
      }
    }
    /**
     * When the element is added to the DOM, the connectedCallback method is triggered
     */
    connectedCallback() {
      this.execute();
    }
    /**
     * When the element is removed from the DOM, the disconnectedCallback method is triggered
     */
    disconnectedCallback() {}
  }
  customElements.define("sht-lazy-loading-image", SHTLazyLoadingImage);
}
