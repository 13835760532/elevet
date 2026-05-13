import { DEFAULT_AGRI_MEASUREMENT_UNIT } from '@/utils/agriUnit';

const PRODUCT_LAST_SUBMIT_STORAGE_KEY = 'AGRI_PRODUCT_LAST_SUBMIT';

export interface ProductSubmitPayload {
  productCode: string;
  productName: string;
  subjectId: number | undefined;
  category: string | undefined;
  productSpec: string;
  productUnit: string;
  productImageUrl: string;
  productionArea: string;
  provinceCode: string;
  cityCode: string;
  districtCode: string;
  archiveDate: string;
}

const toStringValue = (value: unknown) => String(value ?? '').trim();

const toNumberValue = (value: unknown) => {
  const num = Number(value);
  return Number.isFinite(num) && num > 0 ? num : undefined;
};

export const buildProductCreatePayload = (
  source: Record<string, unknown>,
  options?: { forceNewCode?: boolean }
): ProductSubmitPayload => {
  const payload: ProductSubmitPayload = {
    productCode: toStringValue(source.productCode),
    productName: toStringValue(source.productName),
    subjectId: toNumberValue(source.subjectId),
    category: toStringValue(source.category) || undefined,
    productSpec: toStringValue(source.productSpec),
    productUnit: toStringValue(source.productUnit) || DEFAULT_AGRI_MEASUREMENT_UNIT,
    productImageUrl: toStringValue(source.productImageUrl),
    productionArea: toStringValue(source.productionArea),
    provinceCode: toStringValue(source.provinceCode),
    cityCode: toStringValue(source.cityCode),
    districtCode: toStringValue(source.districtCode),
    archiveDate: toStringValue(source.archiveDate)
  };

  if (options?.forceNewCode || !payload.productCode) {
    payload.productCode = `PROD${Date.now()}`;
  }

  return payload;
};

export const saveLastSubmittedProduct = (payload: ProductSubmitPayload) => {
  localStorage.setItem(PRODUCT_LAST_SUBMIT_STORAGE_KEY, JSON.stringify(payload));
};

export const getLastSubmittedProduct = (): ProductSubmitPayload | null => {
  const raw = localStorage.getItem(PRODUCT_LAST_SUBMIT_STORAGE_KEY);
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw);
    return buildProductCreatePayload(parsed);
  } catch (error) {
    console.error('解析最近一次产品建档数据失败', error);
    return null;
  }
};
