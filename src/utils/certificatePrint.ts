import html2canvas from 'html2canvas';

export const CERTIFICATE_PRINT_TARGET_WIDTH = 520;
export const CERTIFICATE_PRINT_DOCUMENT_SELECTOR = '.certificate-print-document';

export const certificatePrintImageOptions = {
    rotate90: false,
    cropWhitespace: false,
    fitToWidth: true,
    maxWidth: CERTIFICATE_PRINT_TARGET_WIDTH,
    threshold: 220,
    contrast: 2.2,
    align: 'center',
    feedLines: 2,
    feedDots: 0,
    cut: false,
    widthUnit: 'bytes',
    command: 'gs-v-0'
} as const;

export interface CertificatePrintBasisOption {
    indexLabel?: string;
    label: string;
    value: string | number;
}

interface CaptureCertificatePrintAreaOptions {
    width?: number;
    scale?: number;
}

export const parseCertificateBasis = (val: unknown): number[] => {
    if (Array.isArray(val)) return val.map(item => Number(item)).filter(item => Number.isFinite(item));
    if (typeof val === 'number') return [val];
    if (typeof val === 'string') {
        try {
            const parsed = JSON.parse(val);
            if (Array.isArray(parsed)) {
                return parsed.map(item => Number(item)).filter(item => Number.isFinite(item));
            }
        } catch (error) {
            return val
                .split(',')
                .map(item => Number(item.trim()))
                .filter(item => Number.isFinite(item));
        }
    }
    return [];
};

export const getSelectedCertificateBasisOptions = <T extends CertificatePrintBasisOption>(
    basisOptions: T[],
    value: unknown
): T[] => {
    const selected = new Set(parseCertificateBasis(value));
    return basisOptions.filter(item => selected.has(Number(item.value)));
};

export const resolveCertificateCommitmentLines = (
    content: unknown,
    fallbackBasis: Array<{ label: string }>
): string[] => {
    const stripCommitmentPrefix = (line: string) => {
        let cleaned = String(line || '').trim();
        const seqRegex = /^(\d+[.、]|[（(]\d+[）)])\s*/;
        while (seqRegex.test(cleaned)) {
            cleaned = cleaned.replace(seqRegex, '').trim();
        }
        return cleaned;
    };
    const normalizeForMatch = (line: string) => String(line || '').replace(/\s+/g, '').trim();

    const raw = String(content || '').trim();
    if (raw) {
        const normalized = raw
            .split(/[\r\n]+|[；;。]/)
            .map(item => stripCommitmentPrefix(item))
            .filter(Boolean);
        if (normalized.length > 1) return normalized;

        const compactRaw = normalizeForMatch(raw);
        const basisMatched = fallbackBasis
            .map(item => stripCommitmentPrefix(item.label))
            .filter(Boolean)
            .filter((label, index, arr) => arr.indexOf(label) === index)
            .filter(label => compactRaw.includes(normalizeForMatch(label)));
        if (basisMatched.length >= 2) return basisMatched;
        if (normalized.length === 1) return normalized;
    }
    return fallbackBasis.map(item => item.label);
};

export const captureCertificatePrintArea = async (
    area: HTMLElement | null | undefined,
    options: CaptureCertificatePrintAreaOptions = {}
) => {
    if (!area) return null;

    const width = options.width ?? CERTIFICATE_PRINT_TARGET_WIDTH;
    const scale = options.scale ?? 1.5;
    const hiddenNodes: Array<{
        el: HTMLElement;
        display: string;
        visibility: string;
        height: string;
        minHeight: string;
        overflow: string;
    }> = [];

    area.querySelectorAll<HTMLElement>('.no-print, .no-print-section').forEach(el => {
        hiddenNodes.push({
            el,
            display: el.style.display,
            visibility: el.style.visibility,
            height: el.style.height,
            minHeight: el.style.minHeight,
            overflow: el.style.overflow
        });
        if (el.classList.contains('print-keep-space')) {
            const reservedHeight = Math.max(0, Math.round(el.offsetHeight / 8) - 20);
            el.style.visibility = 'hidden';
            el.style.height = `${reservedHeight}px`;
            el.style.minHeight = `${reservedHeight}px`;
            el.style.overflow = 'hidden';
        } else {
            el.style.display = 'none';
        }
    });

    const activeDocs: HTMLElement[] = [];
    if (area.matches(CERTIFICATE_PRINT_DOCUMENT_SELECTOR)) {
        activeDocs.push(area);
    }
    area.querySelectorAll<HTMLElement>(CERTIFICATE_PRINT_DOCUMENT_SELECTOR).forEach(el => {
        if (!activeDocs.includes(el)) activeDocs.push(el);
    });
    activeDocs.forEach(el => el.classList.add('printing-active'));

    try {
        const canvas = await html2canvas(area, {
            scale,
            useCORS: true,
            backgroundColor: '#fff',
            scrollX: 0,
            scrollY: 0,
            width,
            windowWidth: width
        });
        return canvas.toDataURL('image/png');
    } finally {
        activeDocs.forEach(el => el.classList.remove('printing-active'));
        hiddenNodes.forEach(({ el, display, visibility, height, minHeight, overflow }) => {
            el.style.display = display;
            el.style.visibility = visibility;
            el.style.height = height;
            el.style.minHeight = minHeight;
            el.style.overflow = overflow;
        });
    }
};
