if (!customElements.get("sht-product-media-slideshow-thumb-horizontal")) {
  class SHTProductMediaSlideShowThumbHorizontal extends HTMLElement {
    constructor() {
      super();
      this.slider = this.querySelector(
        ".js-product-media-slideshow-thumb-items"
      );
      this.sliderItems = this.querySelectorAll(
        ".js-product-media-slideshow-thumb-item"
      );

      this.prevButton = this.querySelector(
        ".js-product-media-slideshow-prev-button"
      );
      this.nextButton = this.querySelector(
        ".js-product-media-slideshow-next-button"
      );

      this.lastSliderItem = null;
      //this.sliderItemOffset = 0;
      this.slidesPerPage = 0;
      this.totalPages = 0;
      this.currentPage = null;

      this.bindEventHandlers();
    }
    /**
     * bind event handler to web component elements
     */
    bindEventHandlers() {
      let resizeObserver = new ResizeObserver((entries) => this.initSlider());
      resizeObserver.observe(this.slider);

      this.slider.addEventListener(
        "scroll",
        this.updateSliderCounter.bind(this)
      );
      this.prevButton.addEventListener(
        "click",
        this.onButtonClickHandle.bind(this)
      );
      this.nextButton.addEventListener(
        "click",
        this.onButtonClickHandle.bind(this)
      );
    }

    removeHashFromUrl() {
      let uri = window.location.toString();

      if (uri.indexOf("#") > 0) {
        let cleanedURI = uri.substring(0, uri.indexOf("#"));

        window.history.replaceState({}, document.title, cleanedURI);
      }
    }
    disableScroll() {
      let scrollTop = window.pageYOffset || document.documentElement.scrollTop;
      let scrollLeft =
        window.pageXOffset || document.documentElement.scrollLeft;

      window.onscroll = function () {
        window.scrollTo(scrollLeft, scrollTop);
      };
    }
    enableScroll() {
      window.onscroll = function () {};
    }
    initSlider() {
      let sliderItemsToShow = Array.from(this.sliderItems).filter(
        (element) => element.clientWidth > 0
      );
      let totalOfSliderItemsToShow = sliderItemsToShow.length;
      this.lastSliderItem = sliderItemsToShow[totalOfSliderItemsToShow - 1];

      if (totalOfSliderItemsToShow <= 2) return;

      let sliderItemOffset =
        sliderItemsToShow[1].offsetLeft - sliderItemsToShow[0].offsetLeft;

      let firstSliderItem = sliderItemsToShow[0];
      let firstSliderItemImage = firstSliderItem.querySelector("img");
      let firstSliderItemWidth = firstSliderItemImage
        ? firstSliderItemImage.clientWidth
        : sliderItemsToShow[0].clientWidth;

      this.slidesPerPage = Math.floor(
        this.slider.clientWidth / sliderItemOffset
      );
      this.totalPages = sliderItemsToShow.length - this.slidesPerPage + 1;

      this.updateSliderCounter();
    }
    updateSliderCounter() {
      this.currentPage =
        Math.round(this.slider.scrollLeft / this.lastSliderItem.clientWidth) +
        1;

      if (this.currentPage === 1) {
        this.prevButton.setAttribute("disabled", "disabled");
      } else {
        this.prevButton.removeAttribute("disabled");
      }

      if (this.currentPage === this.totalPages || this.totalPages == 0) {
        this.nextButton.setAttribute("disabled", "disabled");
      } else {
        this.nextButton.removeAttribute("disabled");
      }
    }
    onButtonClickHandle(event) {
      event.preventDefault();

      let slideScrollPosition =
        event.currentTarget.name === "next"
          ? this.slider.scrollLeft + this.lastSliderItem.clientWidth
          : this.slider.scrollLeft - this.lastSliderItem.clientWidth;
      this.slider.scrollTo({
        left: slideScrollPosition,
      });
    }
  }

  customElements.define(
    "sht-product-media-slideshow-thumb-horizontal",
    SHTProductMediaSlideShowThumbHorizontal
  );
}

if (
  !customElements.get("sht-product-media-slideshow-thumb-lazy-loading-image")
) {
  class SHTProductMediaSlideshowThumbLazyLoadImage extends HTMLElement {
    /**
     * Constructor
     */
    constructor() {
      super();
      this.image = this.querySelector(".js-lazy-loading-image-item");
      this.spinner = this.querySelector(".js-lazy-loading-image-spinner");
      this.container = this.closest(".js-slideshow-items");
      this.bindEventHandlers();
    }

    loadImage() {
      let imageObserver = new IntersectionObserver(
        (entries, observer) => {
          entries.forEach((entry) => {
            let target = entry.target;

            if (
              (entry.intersectionRatio === 1 || entry.isIntersecting) &&
              !this.getAttribute("loaded")
            ) {
              if (this.image.dataset.src) {
                target.src = this.image.dataset.src;
                target.removeAttribute("data-src");
              }
              if (this.image.dataset.srcset) {
                target.srcset = this.image.dataset.srcset;
                target.removeAttribute("data-srcset");
              }

              this.setAttribute("loaded", true);
              this.spinner.remove();
            } else if (entry.intersectionRatio == 0) {
              target.classList.remove("slideshow__item__image-item--loaded");
            } else {
              if (this.getAttribute("loaded")) {
                target.classList.add("slideshow__item__image-item--loaded");
                this.spinner.remove();
              }
            }
          });
        },
        {
          root: this.container,
          rootMargin: `-2px 50px -2px 50px`,
          threshold: 0,
        }
      );

      this.image && imageObserver.observe(this.image);
    }
    /**
     * bind event handler to web component elements
     */
    bindEventHandlers() {}

    /**
     * Set loaded status on the media loaded and vice versa
     * @param boolean loaded
     */

    execute() {
      if (Shopify.designMode) {
        setTimeout(
          function () {
            this.loadImage();
          }.bind(this),
          500
        );
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
  customElements.define(
    "sht-product-media-slideshow-thumb-lazy-loading-image",
    SHTProductMediaSlideshowThumbLazyLoadImage
  );
}
