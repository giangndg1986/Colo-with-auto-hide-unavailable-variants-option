/**
 * Observer Video web component.
 * Use this component to render Observer Video element
 */
if (!customElements.get("sht-lazy-loading-video")) {
  class SHTLazyLoadingVideo extends HTMLElement {
    /**
     * Constructor
     */
    constructor() {
      super();
      this.video = this.querySelector("iframe");
      this.isMouseenter = false;
    }

    /**
     * Load Media
     */
    loadVideo() {
      if (this.video) {
        this.dispatchEvent(
          new CustomEvent("loadingStart", {
            detail: {
              ele: this.video,
              parent: this,
            },
          })
        );

        this.video.setAttribute("src", this.video.getAttribute("data-src"));

        this.video.addEventListener(
          "load",
          function () {
            this.dispatchEvent(
              new CustomEvent("loadingEnd", {
                detail: {
                  ele: this.video,
                  parent: this,
                },
              })
            );
            if (this.dataVideoType == "youtube") {
              this.video.contentWindow.postMessage(
                '{"event":"command","func":"' + "playVideo" + '","args":""}',
                "*"
              );
            }

            this.video.removeAttribute("id");
          }.bind(this)
        );
      }
      this.isLoaded(true);
    }

    execute() {
      if (Shopify.designMode) {
        this.loadVideo();
      } else {
        ["mouseenter", "touchstart"].forEach(
          function (e) {
            document.querySelector("body").addEventListener(
              e,
              function (event) {
                if (!this.isMouseenter) {
                  this.loadVideo();
                }
                this.isMouseenter = true;
              }.bind(this)
            );
          }.bind(this)
        );

        window.addEventListener(
          "scroll",
          function (event) {
            if (!this.isMouseenter) {
              this.loadVideo();
            }
            this.isMouseenter = true;
          }.bind(this),
          false
        );
      }
    }
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

    /**
     * observe Attributes
     */
    static get observedAttributes() {
      return ["data-video-type", "data-video-id"];
    }

    set dataVideoType(newValue) {
      this.setAttribute("data-video-type", newValue);
    }

    get dataVideoType() {
      return this.getAttribute("data-video-type");
    }

    set dataVideoId(newValue) {
      this.setAttribute("data-video-id", newValue);
    }

    get dataVideoId() {
      return this.getAttribute("data-video-id");
    }

    /**
     * check Attributes get changed or not
     */
    attributeChangedCallback(name, oldValue, newValue) {
      if (oldValue !== newValue) {
        this.execute();
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
  customElements.define("sht-lazy-loading-video", SHTLazyLoadingVideo);
}
