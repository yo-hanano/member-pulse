import { Hono } from "hono";
import type { AppEnv } from "../types/env.js";

// 郵便番号検索の結果を frontend が使いやすい形に整えて返すルート。
const postalCodeRoutes = new Hono<AppEnv>();

type PostalCodeApiResponse = {
  status?: number;
  message?: string | null;
  results?: Array<{
    prefcode?: string;
    address1?: string;
    address2?: string;
    address3?: string;
    zipcode?: string;
  }> | null;
};

type PostalCodeLookupResult = {
  prefectureCode: string;
  prefectureName: string;
  address: string;
  zipcode: string;
};

const PREFECTURE_CODE_BY_NAME: Record<string, string> = {
  北海道: "hkd",
  青森県: "aom",
  岩手県: "iwt",
  宮城県: "myg",
  秋田県: "akt",
  山形県: "ygt",
  福島県: "fks",
  茨城県: "ibr",
  栃木県: "tcg",
  群馬県: "gnm",
  埼玉県: "stm",
  千葉県: "chb",
  東京都: "tky",
  神奈川県: "kng",
  新潟県: "nig",
  富山県: "tym",
  石川県: "isk",
  福井県: "fki",
  山梨県: "ymn",
  長野県: "ngn",
  岐阜県: "gif",
  静岡県: "szo",
  愛知県: "aic",
  三重県: "mie",
  滋賀県: "sig",
  京都府: "kyt",
  大阪府: "osk",
  兵庫県: "hyg",
  奈良県: "nar",
  和歌山県: "wky",
  鳥取県: "ttr",
  島根県: "smn",
  岡山県: "oky",
  広島県: "hrs",
  山口県: "ygc",
  徳島県: "tks",
  香川県: "kgw",
  愛媛県: "ehm",
  高知県: "kch",
  福岡県: "fuk",
  佐賀県: "sag",
  長崎県: "ngs",
  熊本県: "kmm",
  大分県: "oit",
  宮崎県: "myz",
  鹿児島県: "kgs",
  沖縄県: "okn",
};

const normalizeZipcode = (value: string) => value.replace(/\D/g, "");

const buildAddress = (address2?: string, address3?: string) =>
  `${address2 ?? ""}${address3 ?? ""}`.trim();

// 郵便番号から住所を引いて、フロントがそのまま使える項目だけ返す。
postalCodeRoutes.get("/api/postal-code/lookup", async (c) => {
  const rawZipcode = c.req.query("zipcode") ?? "";
  const zipcode = normalizeZipcode(rawZipcode);
  if (zipcode.length !== 7) {
    return c.json({ error: "zipcode must be 7 digits" }, 400);
  }

  const response = await fetch(
    `https://zipcloud.ibsnet.co.jp/api/search?zipcode=${encodeURIComponent(zipcode)}`,
  );
  if (!response.ok) {
    return c.json({ error: "postal code lookup failed" }, 502);
  }

  const body = (await response.json()) as PostalCodeApiResponse;
  const first = body.results?.[0];
  if (body.status !== 200 || !first?.address1) {
    return c.json({ error: "address not found" }, 404);
  }

  const prefectureName = first.address1;
  const prefectureCode = PREFECTURE_CODE_BY_NAME[prefectureName];
  if (!prefectureCode) {
    return c.json({ error: "prefecture mapping not found" }, 422);
  }

  const result: PostalCodeLookupResult = {
    prefectureCode,
    prefectureName,
    address: buildAddress(first.address2, first.address3),
    zipcode,
  };

  return c.json(result);
});

export { postalCodeRoutes };
