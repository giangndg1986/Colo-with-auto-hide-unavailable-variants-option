class SHTSlideToggle {
  constructor(target, duration = 500) {
    this.target = target;
    this.duration = duration;
  }

  slideUp() {
    this.target.style.transitionProperty = "height, margin, padding";
    this.target.style.transitionDuration = this.duration + "ms";
    this.target.style.boxSizing = "border-box";
    this.target.style.height = this.target.offsetHeight + "px";
    this.target.offsetHeight;
    this.target.style.overflow = "hidden";
    this.target.style.height = 0;
    this.target.style.paddingTop = 0;
    this.target.style.paddingBottom = 0;
    this.target.style.marginTop = 0;
    this.target.style.marginBottom = 0;
    window.setTimeout(() => {
      this.target.style.display = "none";
      this.target.style.removeProperty("height");
      this.target.style.removeProperty("padding-top");
      this.target.style.removeProperty("padding-bottom");
      this.target.style.removeProperty("margin-top");
      this.target.style.removeProperty("margin-bottom");
      this.target.style.removeProperty("overflow");
      this.target.style.removeProperty("transition-duration");
      this.target.style.removeProperty("transition-property");
    }, this.duration);
  }

  slideDown() {
    this.target.style.removeProperty("display");
    let display = window.getComputedStyle(this.target).display;

    if (display === "none") display = "block";

    this.target.style.display = display;
    let height = this.target.offsetHeight;
    this.target.style.overflow = "hidden";
    this.target.style.height = 0;
    this.target.style.paddingTop = 0;
    this.target.style.paddingBottom = 0;
    this.target.style.marginTop = 0;
    this.target.style.marginBottom = 0;
    this.target.offsetHeight;
    this.target.style.boxSizing = "border-box";
    this.target.style.transitionProperty = "height, margin, padding";
    this.target.style.transitionDuration = this.duration + "ms";
    this.target.style.height = height + "px";
    this.target.style.removeProperty("padding-top");
    this.target.style.removeProperty("padding-bottom");
    this.target.style.removeProperty("margin-top");
    this.target.style.removeProperty("margin-bottom");
    window.setTimeout(() => {
      this.target.style.removeProperty("height");
      this.target.style.removeProperty("overflow");
      this.target.style.removeProperty("transition-duration");
      this.target.style.removeProperty("transition-property");
    }, this.duration);
  }

  slideToggle() {
    if (window.getComputedStyle(this.target).display === "none") {
      return this.slideDown();
    } else {
      return this.slideUp();
    }
  }
}
