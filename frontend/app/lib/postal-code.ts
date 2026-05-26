export type PostalCodeAddress = {
  prefectureCode: string;
  prefectureName: string;
  address: string;
  zipcode: string;
};

type PostalCodeLookupResponse = {
  error?: string;
} & Partial<PostalCodeAddress>;

// BFF 経由で郵便番号から住所情報を取得する。
export async function lookupPostalCodeAddress(
  zipcode: string,
): Promise<PostalCodeAddress | null> {
  const normalized = zipcode.replace(/\D/g, "");
  if (normalized.length !== 7) {
    return null;
  }

  const response = await fetch(`/api/postal-code/lookup?zipcode=${normalized}`);
  if (response.status === 404) {
    return null;
  }
  if (!response.ok) {
    throw new Error(`postal code lookup failed: ${response.status}`);
  }

  const body = (await response.json()) as PostalCodeLookupResponse;
  if (!body.prefectureCode || !body.address || !body.zipcode) {
    return null;
  }

  return {
    prefectureCode: body.prefectureCode,
    prefectureName: body.prefectureName ?? "",
    address: body.address,
    zipcode: body.zipcode,
  };
}
