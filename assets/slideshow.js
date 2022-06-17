if (!customElements.get("sht-slideshow")) {
  class SHTSlideShow extends HTMLElement {
    constructor() {
      super();
      this.slideshow = this.querySelector(".js-slideshow");
      this.slideshowItems = this.querySelector(".js-slideshow-items");
      this.totalElm = this.querySelector(".js-slideshow-total");
      this.currentElm = this.querySelector(".js-slideshow-current");
      this.separatorElm = this.querySelector(".js-slideshow-separator");
      this.prevBtn = this.querySelector(".js-slideshow-prev-btn");
      this.nextBtn = this.querySelector(".js-slideshow-next-btn");
      this.startNStopBtn = this.querySelector(".js-slideshow-start-n-stop-btn");
      this.imageItems = this.querySelectorAll(".js-slideshow-image");
      this.properties = JSON.parse(this.dataset.slideshowProperties);

      this.autoplay = this.properties.autoplay || false;
      this.image = null;
      this.template = null;
      this.current = 1;
      this.anchors = [];
      this.lastScrollTimeout = null;
      this.autoplayInterval = null;
      this.images = this.slideshowItems.children;
      this.total = this.images.length;
      this.slideshowItems.scrollLeft = 0;
      this.observer = null;
      this.isPaused = false;
    }
    cloneSlideItem() {
      if (this.total == 2) {
        let firstItem = this.slideshowItems.querySelector(
          `.slideshow__item:first-of-type`
        );

        let lastItem = this.slideshowItems.querySelector(
          `.slideshow__item:last-of-type`
        );

        if (lastItem) {
          let clonedItem = lastItem.cloneNode(true);
          clonedItem.classList.add("slideshow__item--clone");
          this.slideshowItems.append(clonedItem);
        }
        if (firstItem) {
          let clonedItem = firstItem.cloneNode(true);
          clonedItem.classList.add("slideshow__item--clone");
          this.slideshowItems.append(clonedItem);
        }
      }
    }
    execute() {
      this.cloneSlideItem();
      this.prepare();
      this.bindEventHandlers();
      this.init();
    }
    connectedCallback() {
      if (Shopify.designMode) {
        setTimeout(
          function () {
            this.execute();
          }.bind(this),
          500
        );
      } else {
        this.execute();
      }
    }
    init() {
      if (this.autoplay) {
        this.observerSlideShow();
      }
      this.updateSort();
    }

    updateSort() {
      if (this.total <= 1) return;
      let scrollLeftB = this.slideshowItems.scrollLeft;
      let scrollLeft = Math.round(scrollLeftB);

      let offsetWidth = this.slideshowItems.offsetWidth;
      let scrollWidth = this.slideshowItems.scrollWidth;

      if (scrollLeft < offsetWidth) {
        this.slideshowItems.prepend(this.images[this.total - 1]);
        this.slideshowItems.scrollLeft = scrollLeft + offsetWidth;
      }

      if (Math.floor(scrollWidth - scrollLeftB) <= offsetWidth) {
        this.slideshowItems.append(this.images[0]);
        this.slideshowItems.scrollLeft = scrollLeft - offsetWidth;
      }
    }

    startAutoPlay() {
      if (this.autoplay) {
        this.autoplayInterval = setInterval(
          function () {
            this.nextSlide();
          }.bind(this),
          this.properties.duration
        );
      }
    }
    /**
     * bind event handler to web component elements
     */
    bindEventHandlers() {
      this.slideshowItems.addEventListener(
        "wheel",
        function (evt) {
          if (Math.abs(evt.deltaX) == 5) {
            this.stopAutoPlay();
          }
        }.bind(this),
        { passive: true }
      );
      this.slideshowItems.addEventListener(
        "scroll",
        this.debounce(this.onScrollEventHandle.bind(this), 100)
      );

      this.nextBtn.addEventListener(
        "click",
        function () {
          this.nextSlide();
          this.stopAutoPlay();
        }.bind(this)
      );
      this.prevBtn.addEventListener(
        "click",
        function () {
          this.prevSlide();
          this.stopAutoPlay();
        }.bind(this)
      );

      this.startNStopBtn.addEventListener(
        "click",
        this.onStartNStopEventHandle.bind(this)
      );
    }

    onStartNStopEventHandle(e) {
      e.preventDefault();
      if (this.autoplay) {
        this.stopAutoPlay();
      } else {
        this.resumeAutoPlay();
      }
    }

    stopAutoPlay() {
      clearInterval(this.autoplayInterval);
      this.startNStopBtn.textContent = this.properties.autoplayText[0];
      this.autoplay = false;
    }

    resumeAutoPlay() {
      this.autoplay = true;
      this.startNStopBtn.textContent = this.properties.autoplayText[1];
      this.startAutoPlay();
    }

    onScrollEventHandle(e) {
      e.preventDefault();

      if (this.lastScrollTimeout) {
        clearTimeout(this.lastScrollTimeout);
      }
      this.lastScrollTimeout = setTimeout(
        function () {
          this.updateSort();
        }.bind(this),
        100
      );
      this.updateCurrent();
    }

    prepare() {
      this.totalElm.textContent = this.total;
      this.currentElm.textContent = this.current;
      this.separatorElm.textContent = this.properties.separatorText;
      if (this.autoplay) {
        this.startNStopBtn.toggleAttribute("hidden", false);
        this.startNStopBtn.textContent = this.properties.autoplayText[1];
      }
    }

    updateCurrent() {
      let currentItem = this.querySelector(".js-slideshow-image--current");

      if (currentItem) {
        this.current = currentItem.dataset.slideshowIndex;
      }
      this.currentElm.textContent = this.current;
    }

    prevSlide() {
      this.slideshowItems.scrollLeft =
        this.slideshowItems.scrollLeft - this.slideshow.scrollWidth;
    }
    nextSlide() {
      this.slideshowItems.scrollLeft =
        this.slideshowItems.scrollLeft + this.slideshow.scrollWidth;
    }

    observerSlideShow() {
      this.observer = new IntersectionObserver(
        (entries, observer) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting && !this.isPaused) {
              this.resumeAutoPlay();
              this.isPaused = true;
            } else {
              this.stopAutoPlay();
              this.isPaused = false;
            }
          });
        },
        {
          threshold: 0.3,
        }
      );

      this.observer.observe(this);
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

  customElements.define("sht-slideshow", SHTSlideShow);
}

if (!customElements.get("sht-slideshow-lazy-loading-image")) {
  class SHTSlideshowLazyLoadingImage extends HTMLElement {
    /**
     * Constructor
     */
    constructor() {
      super();
      this.image = this.querySelector(".js-lazy-loading-image-item");
      this.spinner = this.querySelector(".js-lazy-loading-image-spinner");
      this.container = this.closest(".js-slideshow-items");
      this.currentItemClass = "js-slideshow-image--current";
      this.bindEventHandlers();
    }

    loadImage() {
      let imageObserver = new IntersectionObserver(
        (entries, observer) => {
          entries.forEach((entry) => {
            let target = entry.target;
            let parentNode = this.parentNode;

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
              target.classList.add("slideshow__item__image-item--loaded");
              parentNode.classList.add(this.currentItemClass);
            } else if (entry.intersectionRatio == 0) {
              parentNode.classList.remove(this.currentItemClass);
              target.classList.remove(
                "slideshow__item__image-item--first",
                "slideshow__item__image-item--loaded"
              );
            } else {
              if (this.getAttribute("loaded")) {
                parentNode.classList.add(this.currentItemClass);
                target.classList.add("slideshow__item__image-item--loaded");
              }
            }
          });
        },
        {
          root: this.container,
          rootMargin: `100px -2px 100px -2px`,
          threshold: 0,
        }
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
    "sht-slideshow-lazy-loading-image",
    SHTSlideshowLazyLoadingImage
  );
}
