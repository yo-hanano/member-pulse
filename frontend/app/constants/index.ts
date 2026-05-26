// 従業員ステータス（employee.status）
export const EMPLOYEE_STATUS = {
  Active: { value: "active", label: "有効" },
  Invited: { value: "invited", label: "招待中" },
  Suspended: { value: "suspended", label: "一時停止" },
} as const;

export type EmployeeStatus = typeof EMPLOYEE_STATUS[keyof typeof EMPLOYEE_STATUS]["value"];

export const EMPLOYEE_STATUS_OPTIONS = Object.values(EMPLOYEE_STATUS);

export const EMPLOYEE_STATUS_LABELS: Record<EmployeeStatus, string> = {
  active: "有効",
  invited: "招待中",
  suspended: "一時停止",
};

// 一覧テーブルなどで従業員ステータスを表示ラベルへ変換する。
export const formatEmployeeStatus = (value?: string | null) => {
  if (!value) return "-";
  const key = value.trim().toLowerCase() as EmployeeStatus;
  return EMPLOYEE_STATUS_LABELS[key] ?? value;
};

// 顧客登録ステータス（customer.registration_status）
export const CUSTOMER_REGISTRATION_STATUS = {
  Active: { value: "active", label: "有効" },
  Pending: { value: "pending", label: "保留" },
  Invited: { value: "invited", label: "招待中" },
} as const;

export type CustomerRegistrationStatus =
  typeof CUSTOMER_REGISTRATION_STATUS[keyof typeof CUSTOMER_REGISTRATION_STATUS]["value"];

export const CUSTOMER_REGISTRATION_STATUS_OPTIONS = Object.values(CUSTOMER_REGISTRATION_STATUS);

export const CUSTOMER_REGISTRATION_STATUS_LABELS: Record<CustomerRegistrationStatus, string> = {
  pending: "保留",
  active: "有効",
  invited: "招待中",
};

// 一覧テーブルなどで顧客登録ステータスを表示ラベルへ変換する。
export const formatRegistrationStatus = (value?: string | null) => {
  if (!value) return "-";
  const key = value.trim().toLowerCase() as CustomerRegistrationStatus;
  return CUSTOMER_REGISTRATION_STATUS_LABELS[key] ?? value;
};

// 優先連絡手段（customer.preferred_contact）
export const CUSTOMER_PREFERRED_CONTACT = {
  Email: { value: "email", label: "メール" },
  Phone: { value: "phone", label: "電話" },
  None: { value: "none", label: "なし" },
} as const;

export type CustomerPreferredContact =
  typeof CUSTOMER_PREFERRED_CONTACT[keyof typeof CUSTOMER_PREFERRED_CONTACT]["value"];

export const CUSTOMER_PREFERRED_CONTACT_OPTIONS = Object.values(CUSTOMER_PREFERRED_CONTACT);

export const CUSTOMER_PREFERRED_CONTACT_LABELS: Record<CustomerPreferredContact, string> = {
  email: "メール",
  phone: "電話",
  none: "なし",
};

// 登録経路（customer.registered_via）
export const CUSTOMER_REGISTERED_VIA = {
  Self: { value: "self", label: "自己登録" },
  Admin: { value: "admin", label: "管理者登録" },
} as const;

export type CustomerRegisteredVia =
  typeof CUSTOMER_REGISTERED_VIA[keyof typeof CUSTOMER_REGISTERED_VIA]["value"];

export const CUSTOMER_REGISTERED_VIA_OPTIONS = Object.values(CUSTOMER_REGISTERED_VIA);

export const CUSTOMER_REGISTERED_VIA_LABELS: Record<CustomerRegisteredVia, string> = {
  self: "自己登録",
  admin: "管理者登録",
};

// 燃料種別（car.fuel_type_code）
export const CAR_FUEL_TYPE = {
  Gasoline: { value: "gasoline", label: "ガソリン" },
  Diesel: { value: "diesel", label: "ディーゼル" },
  Hybrid: { value: "hybrid", label: "ハイブリッド" },
  Ev: { value: "ev", label: "EV" },
  Other: { value: "other", label: "その他" },
} as const;

export type CarFuelType = typeof CAR_FUEL_TYPE[keyof typeof CAR_FUEL_TYPE]["value"];

export const CAR_FUEL_TYPE_OPTIONS = Object.values(CAR_FUEL_TYPE);

export const CAR_FUEL_TYPE_LABELS: Record<CarFuelType, string> = {
  gasoline: "ガソリン",
  diesel: "ディーゼル",
  hybrid: "ハイブリッド",
  ev: "EV",
  other: "その他",
};
