import * as argon2 from "argon2";
import { getDBClient } from "./db-client.js";

export async function verifyUser(
  email: string,
  password: string,
  companyCode: string,
) {
  // BFF側で認証。RLSは使わずアプリ用の権限で照合する
  const sql = getDBClient();

  if (!companyCode) {
    return null;
  }

  const companies = await sql`
    SELECT id FROM company WHERE code = ${companyCode} and is_deleted = false`;

  if (companies.length === 0) {
    return null;
  }

  const companyId = companies[0].id;

  // 会社コードに紐づくユーザーのみを対象にする
  const users = await sql`
    SELECT * FROM employee
    WHERE email = ${email}
      and is_deleted = false
      and company_id = ${companyId}
      and status = 'active'`;

  if (users.length === 0) {
    console.log("No users found");
    return null;
  }

  const isValid = await argon2.verify(users[0].password, password);

  if (!isValid) {
    console.log("Invalid password");
    return null;
  }

  return { user: users[0] };
}

type VerifyCurrentPasswordInput = {
  userId: string;
  companyId: string;
  currentPassword: string;
};

type PasswordRow = {
  password: string;
};

export async function verifyCurrentPassword(
  input: VerifyCurrentPasswordInput,
): Promise<boolean> {
  const sql = getDBClient();
  const rows = await sql<PasswordRow[]>`
    SELECT password
    FROM employee
    WHERE id = ${input.userId}
      AND company_id = ${input.companyId}
      AND is_deleted = false
      AND status = 'active'
    LIMIT 1`;
  const current = rows[0];
  if (!current?.password) {
    return false;
  }
  return argon2.verify(current.password, input.currentPassword);
}
