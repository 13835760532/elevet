import { DEFAULT_PRODUCTION_SCALE_UNIT } from '@/utils/agriUnit';

const SUBJECT_LAST_SUBMIT_STORAGE_KEY = 'AGRI_SUBJECT_LAST_SUBMIT';

export interface SubjectSubmitPayload {
  type: number | undefined;
  name: string;
  category: string | undefined;
  mainProducts: string;
  provinceCode: string;
  cityCode: string;
  districtCode: string;
  address: string;
  contactName: string;
  contactPhone: string;
  productionScale: string;
  productionScaleUnit: string;
  businessLicenseUrl: string;
  socialCreditCode: string;
  idCard: string;
  idCardFrontUrl: string;
  idCardBackUrl: string;
  qualificationUrls: string[];
  introduction: string;
}

const toStringValue = (value: unknown) => String(value ?? '').trim();

const toNumberValue = (value: unknown) => {
  const num = Number(value);
  return Number.isFinite(num) ? num : undefined;
};

const normalizeQualificationUrls = (value: unknown): string[] => {
  if (Array.isArray(value)) {
    return value.map((item) => toStringValue(item)).filter(Boolean);
  }
  const raw = toStringValue(value);
  if (!raw) return [];
  if (raw.startsWith('[') && raw.endsWith(']')) {
    try {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        return parsed.map((item) => toStringValue(item)).filter(Boolean);
      }
    } catch (error) {
      // 忽略 JSON 解析错误，走逗号拆分兜底
    }
  }
  return raw.split(',').map((item) => item.trim()).filter(Boolean);
};

export const buildSubjectSubmitPayload = (source: Record<string, unknown>): SubjectSubmitPayload => {
  return {
    type: toNumberValue(source.type),
    name: toStringValue(source.name),
    category: toStringValue(source.category) || undefined,
    mainProducts: toStringValue(source.mainProducts),
    provinceCode: toStringValue(source.provinceCode),
    cityCode: toStringValue(source.cityCode),
    districtCode: toStringValue(source.districtCode),
    address: toStringValue(source.address),
    contactName: toStringValue(source.contactName),
    contactPhone: toStringValue(source.contactPhone),
    productionScale: toStringValue(source.productionScale),
    productionScaleUnit: toStringValue(source.productionScaleUnit) || DEFAULT_PRODUCTION_SCALE_UNIT,
    businessLicenseUrl: toStringValue(source.businessLicenseUrl),
    socialCreditCode: toStringValue(source.socialCreditCode),
    idCard: toStringValue(source.idCard),
    idCardFrontUrl: toStringValue(source.idCardFrontUrl),
    idCardBackUrl: toStringValue(source.idCardBackUrl),
    qualificationUrls: normalizeQualificationUrls(source.qualificationUrls),
    introduction: toStringValue(source.introduction)
  };
};

export const saveLastSubmittedSubject = (payload: SubjectSubmitPayload) => {
  localStorage.setItem(SUBJECT_LAST_SUBMIT_STORAGE_KEY, JSON.stringify(payload));
};

export const getLastSubmittedSubject = (): SubjectSubmitPayload | null => {
  const raw = localStorage.getItem(SUBJECT_LAST_SUBMIT_STORAGE_KEY);
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw);
    return buildSubjectSubmitPayload(parsed);
  } catch (error) {
    console.error('解析最近一次主体建档数据失败', error);
    return null;
  }
};
