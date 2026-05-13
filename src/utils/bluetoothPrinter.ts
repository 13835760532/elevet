type BluetoothUUID = string | number;

interface BluetoothPrinterOptions {
  namePrefix: string;
  serviceUUIDs: BluetoothUUID[];
  characteristicUUIDs: BluetoothUUID[];
  packetSize?: number;
  writeDelayMs?: number;
  preferWriteWithResponse?: boolean;
  onStatusChange?: (ready: boolean, deviceName: string) => void;
}

interface BluetoothPrinterImageOptions {
  maxWidth?: number;
  threshold?: number;
  contrast?: number;
  align?: 'left' | 'center' | 'right';
  feedLines?: number;
  feedDots?: number;
  cut?: boolean;
  fitToWidth?: boolean;
  cropWhitespace?: boolean;
  widthUnit?: 'bytes' | 'dots';
  command?: 'gs-v-0' | 'esc-star-24';
  rotate90?: boolean; // 新增：旋转90度打印，适合横向证书
}

interface PreparedPrintImagePayload {
  previewDataUrl: string;
  bytes: Uint8Array;
}

interface BluetoothSupportState {
  supported: boolean;
  reason: string;
  isSecureContext: boolean;
  hasBluetoothApi: boolean;
  isChromiumBrowser: boolean;
}

interface ResolvedBluetoothPrinterOptions extends BluetoothPrinterOptions {
  packetSize: number;
  writeDelayMs: number;
  preferWriteWithResponse: boolean;
}

const DEFAULT_PACKET_SIZE = 180;
const DEFAULT_WRITE_DELAY = 30;
const DEFAULT_IMAGE_MAX_WIDTH = 384;
const DEFAULT_IMAGE_THRESHOLD = 210;

const concatBytes = (...parts: Uint8Array[]) => {
  const totalLength = parts.reduce((sum, item) => sum + item.length, 0);
  const merged = new Uint8Array(totalLength);
  let offset = 0;
  parts.forEach((item) => {
    merged.set(item, offset);
    offset += item.length;
  });
  return merged;
};

export const buildEscPosTestTicket = (operator = 'admin') => {
  const encoder = new TextEncoder();
  const init = new Uint8Array([0x1b, 0x40]);
  const alignCenter = new Uint8Array([0x1b, 0x61, 0x01]);
  const alignLeft = new Uint8Array([0x1b, 0x61, 0x00]);
  const boldOn = new Uint8Array([0x1b, 0x45, 0x01]);
  const boldOff = new Uint8Array([0x1b, 0x45, 0x00]);
  const feedAndCut = new Uint8Array([0x0a, 0x0a, 0x0a, 0x1d, 0x56, 0x41, 0x10]);
  const now = new Date().toLocaleString();

  return concatBytes(
    init,
    alignCenter,
    boldOn,
    encoder.encode('Portable Printer\n'),
    boldOff,
    encoder.encode('Bluetooth One-Click Print\n'),
    alignLeft,
    encoder.encode('--------------------------------\n'),
    encoder.encode(`Operator: ${operator}\n`),
    encoder.encode(`PrintTime: ${now}\n`),
    encoder.encode('Status   : SUCCESS\n'),
    encoder.encode('--------------------------------\n'),
    encoder.encode('This is a BLE test receipt.\n'),
    feedAndCut
  );
};

export class BluetoothPrinter {
  private options: ResolvedBluetoothPrinterOptions;
  private device: BluetoothDevice | null = null;
  private server: BluetoothRemoteGATTServer | null = null;
  private characteristic: BluetoothRemoteGATTCharacteristic | null = null;
  private writing = false;

  constructor(options: BluetoothPrinterOptions) {
    this.options = {
      ...options,
      packetSize: options.packetSize ?? DEFAULT_PACKET_SIZE,
      writeDelayMs: options.writeDelayMs ?? DEFAULT_WRITE_DELAY,
      preferWriteWithResponse: options.preferWriteWithResponse ?? false
    };
  }

  getSupportState(): BluetoothSupportState {
    const hasNavigator = typeof navigator !== 'undefined';
    const hasWindow = typeof window !== 'undefined';
    const userAgent = hasNavigator ? navigator.userAgent : '';
    const isChromiumBrowser =
      /\b(Chrome|Chromium|Edg)\//.test(userAgent) &&
      !/\b(OPR|Opera|CriOS|EdgiOS|SamsungBrowser)\//.test(userAgent);
    const isSecureContext = hasWindow ? window.isSecureContext : false;
    const hasBluetoothApi = hasNavigator && !!navigator.bluetooth;
    const protocol = hasWindow ? window.location.protocol : '';
    const host = hasWindow ? window.location.host : '';

    if (!hasNavigator || !hasWindow) {
      return {
        supported: false,
        reason: '当前运行环境不支持 Web Bluetooth，请在浏览器页面中打开',
        isSecureContext,
        hasBluetoothApi,
        isChromiumBrowser
      };
    }

    if (!isSecureContext) {
      const isHttpPage = protocol === 'http:';
      return {
        supported: false,
        reason: isHttpPage
          ? `当前页面通过 ${protocol}//${host} 访问，不是安全上下文。Web Bluetooth 只支持 HTTPS 或 localhost，请改用 HTTPS 域名访问后再连接蓝牙打印机`
          : '当前页面不是安全上下文。Web Bluetooth 只支持 HTTPS 或 localhost，请改用 HTTPS 域名访问后再连接蓝牙打印机',
        isSecureContext,
        hasBluetoothApi,
        isChromiumBrowser
      };
    }

    if (!isChromiumBrowser) {
      return {
        supported: false,
        reason: '当前浏览器不支持 Web Bluetooth，请使用桌面版 Chrome 或 Edge',
        isSecureContext,
        hasBluetoothApi,
        isChromiumBrowser
      };
    }

    if (!hasBluetoothApi) {
      return {
        supported: false,
        reason: '当前 Chrome/Edge 未开放 Web Bluetooth。请确认没有被企业策略禁用，并检查 chrome://flags/#enable-web-bluetooth 是否开启',
        isSecureContext,
        hasBluetoothApi,
        isChromiumBrowser
      };
    }

    return {
      supported: true,
      reason: '',
      isSecureContext,
      hasBluetoothApi,
      isChromiumBrowser
    };
  }

  getUnsupportedReason() {
    return this.getSupportState().reason;
  }

  isSupported() {
    return this.getSupportState().supported;
  }

  isReady() {
    return !!this.server?.connected && !!this.characteristic;
  }

  getDeviceName() {
    return this.device?.name || '未知设备';
  }

  async connect() {
    if (!this.isSupported()) {
      throw new Error(this.getUnsupportedReason());
    }

    if (this.device) {
      this.device.removeEventListener('gattserverdisconnected', this.onDisconnected);
    }

    const device = await navigator.bluetooth.requestDevice({
      filters: [{ namePrefix: this.options.namePrefix }],
      optionalServices: this.options.serviceUUIDs
    });

    if (!device?.name?.startsWith(this.options.namePrefix)) {
      throw new Error(`仅支持连接 ${this.options.namePrefix} 开头设备`);
    }

    return this.connectToDevice(device);
  }

  async reconnectLastDevice() {
    if (!this.isSupported()) {
      return null;
    }

    // 优先重连当前内存中的设备
    if (this.device?.gatt) {
      try {
        return await this.connectToDevice(this.device);
      } catch (error) {
        // 忽略并继续尝试已授权设备列表
      }
    }

    // 再尝试重连浏览器已授权设备（无需再次弹 chooser）
    const bluetooth: any = navigator.bluetooth;
    if (typeof bluetooth?.getDevices !== 'function') {
      return null;
    }

    const grantedDevices: BluetoothDevice[] = await bluetooth.getDevices();
    const target = grantedDevices.find((item) =>
      item?.name?.startsWith(this.options.namePrefix)
    );
    if (!target) {
      return null;
    }
    return this.connectToDevice(target);
  }

  async print(data: Uint8Array) {
    await this.ensureConnected();
    while (this.writing) {
      await new Promise((resolve) => setTimeout(resolve, 10));
    }
    this.writing = true;
    try {
      await this.writeBytes(this.characteristic, data);
    } finally {
      this.writing = false;
    }
  }

  async printImage(dataUrl: string, options: BluetoothPrinterImageOptions = {}) {
    const imageBytes = await this.buildEscPosImageBytes(dataUrl, options);
    await this.print(imageBytes);
  }

  async buildPrintPreviewDataUrl(dataUrl: string, options: BluetoothPrinterImageOptions = {}) {
    const { imageData, targetWidth, targetHeight } = await this.prepareImageForPrint(dataUrl, options);
    const threshold = options.threshold ?? DEFAULT_IMAGE_THRESHOLD;
    const pixels = new Uint8ClampedArray(imageData.data);

    for (let i = 0; i < pixels.length; i += 4) {
      const r = pixels[i];
      const g = pixels[i + 1];
      const b = pixels[i + 2];
      const a = pixels[i + 3];
      const gray = r * 0.299 + g * 0.587 + b * 0.114;
      const value = a > 0 && gray < threshold ? 0 : 255;
      pixels[i] = value;
      pixels[i + 1] = value;
      pixels[i + 2] = value;
      pixels[i + 3] = 255;
    }

    const canvas = document.createElement('canvas');
    canvas.width = targetWidth;
    canvas.height = targetHeight;
    const ctx = canvas.getContext('2d');
    if (!ctx) {
      throw new Error('浏览器不支持 Canvas，无法生成打印效果预览');
    }
    ctx.putImageData(new ImageData(pixels, targetWidth, targetHeight), 0, 0);
    return canvas.toDataURL('image/png');
  }

  async buildPrintImagePayload(
    dataUrl: string,
    options: BluetoothPrinterImageOptions = {}
  ): Promise<PreparedPrintImagePayload> {
    const { imageData, targetWidth, targetHeight } = await this.prepareImageForPrint(dataUrl, options);
    const threshold = options.threshold ?? DEFAULT_IMAGE_THRESHOLD;
    const pixels = new Uint8ClampedArray(imageData.data);

    for (let i = 0; i < pixels.length; i += 4) {
      const r = pixels[i];
      const g = pixels[i + 1];
      const b = pixels[i + 2];
      const a = pixels[i + 3];
      const gray = r * 0.299 + g * 0.587 + b * 0.114;
      const value = a > 0 && gray < threshold ? 0 : 255;
      pixels[i] = value;
      pixels[i + 1] = value;
      pixels[i + 2] = value;
      pixels[i + 3] = 255;
    }

    const previewCanvas = document.createElement('canvas');
    previewCanvas.width = targetWidth;
    previewCanvas.height = targetHeight;
    const previewCtx = previewCanvas.getContext('2d');
    if (!previewCtx) {
      throw new Error('浏览器不支持 Canvas，无法生成打印效果预览');
    }
    previewCtx.putImageData(new ImageData(pixels, targetWidth, targetHeight), 0, 0);

    const bytes = this.buildEscPosImageBytesFromPrepared(
      imageData,
      targetWidth,
      options
    );
    return {
      previewDataUrl: previewCanvas.toDataURL('image/png'),
      bytes
    };
  }

  disconnect() {
    if (this.server?.connected) {
      this.server.disconnect();
    }
    this.onDisconnected();
  }

  async ping() {
    if (!this.isReady() || this.writing) return;
    // DLE EOT 1: 实时状态查询（多数热敏机不会打印字符）
    await this.writeBytes(this.characteristic, new Uint8Array([0x10, 0x04, 0x01]));
  }

  private onDisconnected = () => {
    this.server = null;
    this.characteristic = null;
    this.emitStatus();
  };

  private async ensureConnected() {
    if (this.isReady()) return;
    const name = await this.reconnectLastDevice();
    if (!name || !this.isReady()) {
      throw new Error('请先连接蓝牙打印机');
    }
  }

  private async connectToDevice(device: BluetoothDevice) {
    if (!device?.name?.startsWith(this.options.namePrefix)) {
      throw new Error(`仅支持连接 ${this.options.namePrefix} 开头设备`);
    }
    if (this.device) {
      this.device.removeEventListener('gattserverdisconnected', this.onDisconnected);
    }

    const server = await device.gatt?.connect();
    if (!server) {
      throw new Error('蓝牙连接失败');
    }

    const writableCharacteristic = await this.getWritableCharacteristic(server);
    device.addEventListener('gattserverdisconnected', this.onDisconnected);
    this.device = device;
    this.server = server;
    this.characteristic = writableCharacteristic;
    this.emitStatus();
    return this.getDeviceName();
  }

  private emitStatus() {
    this.options.onStatusChange?.(this.isReady(), this.getDeviceName());
  }

  private getAlignCommand(align: 'left' | 'center' | 'right' = 'center') {
    const alignMap = { left: 0x00, center: 0x01, right: 0x02 };
    return new Uint8Array([0x1b, 0x61, alignMap[align]]);
  }

  private loadImage(dataUrl: string) {
    return new Promise<HTMLImageElement>((resolve, reject) => {
      const image = new Image();
      image.crossOrigin = 'anonymous';
      image.onload = () => resolve(image);
      image.onerror = () => reject(new Error('图片加载失败，无法执行蓝牙打印'));
      image.src = dataUrl;
    });
  }

  private buildRasterData(imageData: ImageData, threshold: number) {
    const { width, height, data } = imageData;
    const widthBytes = Math.ceil(width / 8);
    const raster = new Uint8Array(widthBytes * height);

    for (let y = 0; y < height; y += 1) {
      for (let xByte = 0; xByte < widthBytes; xByte += 1) {
        let value = 0;
        for (let bit = 0; bit < 8; bit += 1) {
          const x = xByte * 8 + bit;
          if (x >= width) continue;
          const idx = (y * width + x) * 4;
          const r = data[idx];
          const g = data[idx + 1];
          const b = data[idx + 2];
          const a = data[idx + 3];
          const gray = r * 0.299 + g * 0.587 + b * 0.114;
          const isBlack = a > 0 && gray < threshold;
          if (isBlack) {
            value |= 0x80 >> bit;
          }
        }
        raster[y * widthBytes + xByte] = value;
      }
    }
    return { raster, widthBytes, height };
  }

  private getContentBounds(
    imageData: ImageData,
    whiteThreshold = 180 // 极致裁剪：基本只保留深色内容，完全无视外围阴影
  ): { left: number; top: number; right: number; bottom: number } | null {
    const { width, height, data } = imageData;
    let left = width;
    let top = height;
    let right = -1;
    let bottom = -1;

    for (let y = 0; y < height; y += 1) {
      for (let x = 0; x < width; x += 1) {
        const idx = (y * width + x) * 4;
        const r = data[idx];
        const g = data[idx + 1];
        const b = data[idx + 2];
        const a = data[idx + 3];
        const gray = r * 0.299 + g * 0.587 + b * 0.114;
        const isContent = a > 5 && gray < whiteThreshold;
        if (isContent) {
          if (x < left) left = x;
          if (x > right) right = x;
          if (y < top) top = y;
          if (y > bottom) bottom = y;
        }
      }
    }

    if (right < left || bottom < top) {
      return null;
    }
    return { left, top, right, bottom };
  }

  private buildEscStar24Bytes(
    imageData: ImageData,
    options: BluetoothPrinterImageOptions,
    targetWidth: number
  ) {
    const threshold = options.threshold ?? DEFAULT_IMAGE_THRESHOLD;
    const align = this.getAlignCommand(options.align ?? 'center');
    const bytes: number[] = [0x1b, 0x40, ...align];
    const height = imageData.height;
    const data = imageData.data;

    for (let y = 0; y < height; y += 24) {
      bytes.push(0x1b, 0x2a, 33, targetWidth & 0xff, (targetWidth >> 8) & 0xff);

      for (let x = 0; x < targetWidth; x += 1) {
        for (let section = 0; section < 3; section += 1) {
          let value = 0;
          for (let bit = 0; bit < 8; bit += 1) {
            const yy = y + section * 8 + bit;
            if (yy >= height) continue;
            const idx = (yy * targetWidth + x) * 4;
            const r = data[idx];
            const g = data[idx + 1];
            const b = data[idx + 2];
            const a = data[idx + 3];
            const gray = r * 0.299 + g * 0.587 + b * 0.114;
            const isBlack = a > 0 && gray < threshold;
            if (isBlack) {
              value |= 0x80 >> bit;
            }
          }
          bytes.push(value);
        }
      }
      bytes.push(0x0a);
    }

    const feedLines = options.feedLines ?? 4;
    for (let i = 0; i < Math.max(0, feedLines); i += 1) {
      bytes.push(0x0a);
    }
    const feedDots = Math.max(0, Math.floor(options.feedDots ?? 0));
    if (feedDots > 0) {
      let remaining = feedDots;
      while (remaining > 0) {
        const step = Math.min(255, remaining);
        bytes.push(0x1b, 0x4a, step);
        remaining -= step;
      }
    }
    if (options.cut) {
      bytes.push(0x1d, 0x56, 0x41, 0x10);
    }
    return new Uint8Array(bytes);
  }

  private async prepareImageForPrint(dataUrl: string, options: BluetoothPrinterImageOptions) {
    const image = await this.loadImage(dataUrl);
    const sourceCanvas = document.createElement('canvas');
    sourceCanvas.width = Math.max(1, image.width);
    sourceCanvas.height = Math.max(1, image.height);
    const sourceCtx = sourceCanvas.getContext('2d');
    if (!sourceCtx) {
      throw new Error('浏览器不支持 Canvas，无法生成打印位图');
    }
    sourceCtx.fillStyle = '#ffffff';
    sourceCtx.fillRect(0, 0, sourceCanvas.width, sourceCanvas.height);

    if (options.rotate90) {
      // 旋转 90 度处理横屏内容
      sourceCanvas.width = image.height;
      sourceCanvas.height = image.width;
      sourceCtx.translate(sourceCanvas.width / 2, sourceCanvas.height / 2);
      sourceCtx.rotate(Math.PI / 2);
      sourceCtx.drawImage(image, -image.width / 2, -image.height / 2);
    } else {
      sourceCtx.drawImage(image, 0, 0, sourceCanvas.width, sourceCanvas.height);
    }

    const cropWhitespace = options.cropWhitespace ?? true;
    const sourceImageData = sourceCtx.getImageData(0, 0, sourceCanvas.width, sourceCanvas.height);
    const bounds = cropWhitespace ? this.getContentBounds(sourceImageData) : null;
    const cropLeft = bounds ? bounds.left : 0;
    const cropTop = bounds ? bounds.top : 0;
    const cropWidth = bounds ? bounds.right - bounds.left + 1 : sourceCanvas.width;
    const cropHeight = bounds ? bounds.bottom - bounds.top + 1 : sourceCanvas.height;

    const maxWidth = options.maxWidth ?? DEFAULT_IMAGE_MAX_WIDTH;
    const fitToWidth = options.fitToWidth ?? true;
    const preferredWidth = fitToWidth ? maxWidth : Math.min(maxWidth, cropWidth);
    const targetWidth = Math.max(8, Math.floor(preferredWidth / 8) * 8);
    const scale = targetWidth / Math.max(1, cropWidth);
    const targetHeight = Math.max(1, Math.floor(cropHeight * scale));

    const canvas = document.createElement('canvas');
    canvas.width = targetWidth;
    canvas.height = targetHeight;
    const ctx = canvas.getContext('2d');
    if (!ctx) {
      throw new Error('浏览器不支持 Canvas，无法生成打印位图');
    }
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, targetWidth, targetHeight);
    ctx.imageSmoothingEnabled = true;
    ctx.drawImage(
      sourceCanvas,
      cropLeft,
      cropTop,
      cropWidth,
      cropHeight,
      0,
      0,
      targetWidth,
      targetHeight
    );

    const imageData = ctx.getImageData(0, 0, targetWidth, targetHeight);
    const contrast = options.contrast ?? 1.5; // 默认对比度调高一点，让文字更清晰
    for (let i = 0; i < imageData.data.length; i += 4) {
      const r = imageData.data[i];
      const g = imageData.data[i + 1];
      const b = imageData.data[i + 2];
      const adjust = (value: number) => {
        const contrasted = (value - 128) * contrast + 128;
        return Math.max(0, Math.min(255, contrasted));
      };
      imageData.data[i] = adjust(r);
      imageData.data[i + 1] = adjust(g);
      imageData.data[i + 2] = adjust(b);
    }

    return { imageData, targetWidth, targetHeight };
  }

  private async buildEscPosImageBytes(dataUrl: string, options: BluetoothPrinterImageOptions) {
    const { imageData, targetWidth } = await this.prepareImageForPrint(dataUrl, options);
    return this.buildEscPosImageBytesFromPrepared(imageData, targetWidth, options);
  }

  private buildEscPosImageBytesFromPrepared(
    imageData: ImageData,
    targetWidth: number,
    options: BluetoothPrinterImageOptions
  ) {

    const command = options.command ?? 'gs-v-0';
    if (command === 'esc-star-24') {
      return this.buildEscStar24Bytes(imageData, options, targetWidth);
    }

    const { raster, widthBytes, height } = this.buildRasterData(imageData, options.threshold ?? DEFAULT_IMAGE_THRESHOLD);
    const widthValue = (options.widthUnit ?? 'bytes') === 'dots' ? targetWidth : widthBytes;
    const xL = widthValue & 0xff;
    const xH = (widthValue >> 8) & 0xff;
    const yL = height & 0xff;
    const yH = (height >> 8) & 0xff;
    const printRaster = concatBytes(
      new Uint8Array([0x1d, 0x76, 0x30, 0x00, xL, xH, yL, yH]),
      raster
    );

    const feedLines = options.feedLines ?? 4;
    const feed = new Uint8Array(Math.max(0, feedLines)).fill(0x0a);
    const feedDots = Math.max(0, Math.floor(options.feedDots ?? 0));
    const dotFeedBytes: number[] = [];
    if (feedDots > 0) {
      let remaining = feedDots;
      while (remaining > 0) {
        const step = Math.min(255, remaining);
        dotFeedBytes.push(0x1b, 0x4a, step);
        remaining -= step;
      }
    }
    const dotFeed = new Uint8Array(dotFeedBytes);
    const cut = options.cut ? new Uint8Array([0x1d, 0x56, 0x41, 0x10]) : new Uint8Array();

    return concatBytes(
      new Uint8Array([0x1b, 0x40]),
      this.getAlignCommand(options.align ?? 'center'),
      printRaster,
      feed,
      dotFeed,
      cut
    );
  }

  private async writeBytes(
    characteristic: BluetoothRemoteGATTCharacteristic,
    data: Uint8Array
  ) {
    let offset = 0;
    while (offset < data.length) {
      const chunk = data.slice(offset, offset + this.options.packetSize);
      const canWrite = characteristic.properties?.write && typeof characteristic.writeValue === 'function';
      const canWriteWithoutResp =
        characteristic.properties?.writeWithoutResponse &&
        typeof characteristic.writeValueWithoutResponse === 'function';

      if (this.options.preferWriteWithResponse && canWrite) {
        await characteristic.writeValue(chunk);
      } else if (canWriteWithoutResp) {
        await characteristic.writeValueWithoutResponse(chunk);
      } else if (canWrite) {
        await characteristic.writeValue(chunk);
      } else {
        throw new Error('当前蓝牙特征值不支持写入');
      }
      offset += this.options.packetSize;
      await new Promise((resolve) => setTimeout(resolve, this.options.writeDelayMs));
    }
  }

  private async getWritableCharacteristic(server: BluetoothRemoteGATTServer) {
    for (const serviceUuid of this.options.serviceUUIDs) {
      try {
        const service = await server.getPrimaryService(serviceUuid);
        for (const charUuid of this.options.characteristicUUIDs) {
          try {
            const characteristic = await service.getCharacteristic(charUuid);
            if (
              characteristic.properties?.write ||
              characteristic.properties?.writeWithoutResponse
            ) {
              return characteristic;
            }
          } catch (error) {
            // 当前服务下未找到该特征值，继续尝试
          }
        }
      } catch (error) {
        // 当前服务不存在，继续尝试
      }
    }

    const services = await server.getPrimaryServices();
    for (const service of services) {
      const characteristics = await service.getCharacteristics();
      const writable = characteristics.find(
        (item) => item.properties?.write || item.properties?.writeWithoutResponse
      );
      if (writable) {
        return writable;
      }
    }
    throw new Error('未找到可写入的打印特征值');
  }
}
