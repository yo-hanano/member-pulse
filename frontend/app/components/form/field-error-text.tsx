interface Props {
  message?: string;
}

// フィールドエラー表示を統一する共通コンポーネント
export function FieldErrorText({ message }: Props) {
  if (!message) return null;
  return <p className="text-danger text-xs">{message}</p>;
}
