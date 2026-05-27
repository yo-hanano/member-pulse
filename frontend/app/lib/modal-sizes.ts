export const modalSizes = {
  xl: "min(36rem, calc(100vw - 2rem))",
  "2xl": "min(42rem, calc(100vw - 2rem))",
  "3xl": "min(48rem, calc(100vw - 2rem))",
  "4xl": "min(56rem, calc(100vw - 2rem))",
  "5xl": "min(64rem, calc(100vw - 2rem))",
  cover: "min(72rem, calc(100vw - 2rem))",
} as const;

export type ModalSizeName = keyof typeof modalSizes;
