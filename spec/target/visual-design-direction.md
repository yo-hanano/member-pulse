# Visual Design Direction

この文書は、MemberPulse の見た目に関する基本方針を記録する。
現時点ではカラーコンセプトを中心に置き、UI 実装時の判断基準として使う。

## Color Concept

MemberPulse の主役カラーは Teal Blue とする。

Teal Blue は、月謝制スタジオ向けの清潔感・親しみやすさと、月次経営レビュー SaaS としての信頼感・分析感を両立するために採用する。

単なる会計ソフトのように硬くなりすぎず、ヨガ・美容サロン向けの柔らかい世界観にも寄りすぎない、中間の落ち着いたプロダクト感を目指す。

## Color Roles

- Primary: Teal Blue
  - 主要ボタン
  - ナビゲーションの active 状態
  - 重要な進捗表示
  - ブランドアイコン
- Info: Blue
  - 分析
  - レポート
  - 補助情報
- Success: Green
  - 良好
  - 達成
  - 改善
- Warning: Yellow / Amber
  - 注意
  - 未達リスク
- Danger: Red
  - 危険
  - 赤字
  - 退会率悪化
- Neutral: Gray
  - 背景
  - 罫線
  - テーブル
  - 本文

## Avoid

- 濃いネイビー一色の硬い業務 SaaS 感
- ヨガ・美容サロンに寄りすぎるベージュ、サンド、くすみカラー中心の世界観
- 紫・青紫の汎用 AI SaaS っぽいグラデーション
- 信号色だけに依存した状態表現

## Mantine Theme Draft

現時点の Mantine theme では、次のような Teal Blue 系 brand palette を候補とする。
実装時は実画面でのコントラスト、状態色との見分けやすさ、カードやテーブル上の可読性を確認して調整する。

```ts
const mantineTheme = createTheme({
  primaryColor: "brand",
  colors: {
    brand: [
      "#e7faff",
      "#c8f1f8",
      "#9fe4ef",
      "#6fd5e5",
      "#45c6da",
      "#27b6cc",
      "#159fb5",
      "#0f8398",
      "#0c6b7d",
      "#085766",
    ],
  },
  primaryShade: { light: 6, dark: 5 },
});
```
