interface AutoFitOptions {
  el: string | HTMLElement;
  container?: string | HTMLElement;
  width?: number;
  height?: number;
  delay?: number;
  resize?: boolean;
}

const DEFAULT_WIDTH = 1920;
const DEFAULT_HEIGHT = 1080;

const getNode = (el: string | HTMLElement) =>
  typeof el === 'string' ? (document.querySelector(el) as HTMLElement | null) : el;

export const createAutoFit = (opts: AutoFitOptions) => {
  const width = opts.width ?? DEFAULT_WIDTH;
  const height = opts.height ?? DEFAULT_HEIGHT;
  const delay = opts.delay ?? 120;

  let timer: number | null = null;

  const apply = () => {
    const node = getNode(opts.el);
    if (!node) return;

    const container = opts.container ? getNode(opts.container) : null;
    const visualViewport = window.visualViewport;
    const viewportWidth = container?.clientWidth || visualViewport?.width || window.innerWidth;
    const viewportHeight = container?.clientHeight || visualViewport?.height || window.innerHeight;
    const scale = Math.min(viewportWidth / width, viewportHeight / height);
    const scaledWidth = width * scale;
    const scaledHeight = height * scale;
    const left = Math.max(0, (viewportWidth - scaledWidth) / 2);
    const top = Math.max(0, (viewportHeight - scaledHeight) / 2);

    node.style.transformOrigin = 'left top';
    node.style.left = `${left}px`;
    node.style.top = `${top}px`;
    node.style.transform = `scale(${scale})`;
  };

  const onResize = () => {
    if (timer) window.clearTimeout(timer);
    timer = window.setTimeout(() => {
      apply();
    }, delay);
  };

  const init = () => {
    apply();
    if (opts.resize !== false) {
      window.addEventListener('resize', onResize);
    }
  };

  const destroy = () => {
    window.removeEventListener('resize', onResize);
    if (timer) {
      window.clearTimeout(timer);
      timer = null;
    }
  };

  return { init, destroy, resize: apply };
};

interface AutofitInitOptions {
  el: string | HTMLElement;
  container?: string | HTMLElement;
  dw?: number;
  dh?: number;
  resize?: boolean;
  delay?: number;
}

let activeInstance: ReturnType<typeof createAutoFit> | null = null;

const autofit = {
  init(options: AutofitInitOptions) {
    activeInstance?.destroy();
    activeInstance = createAutoFit({
      el: options.el,
      container: options.container,
      width: options.dw,
      height: options.dh,
      resize: options.resize,
      delay: options.delay
    });
    activeInstance.init();
    return activeInstance;
  },
  destroy() {
    activeInstance?.destroy();
    activeInstance = null;
  },
  resize() {
    activeInstance?.resize();
  }
};

export default autofit;
