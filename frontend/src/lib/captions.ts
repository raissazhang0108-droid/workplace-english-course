export type Caption = {
  start: number;
  end: number;
  en: string;
  zh: string;
};

export function getActiveCaptionIndex(captions: Caption[], currentTime: number) {
  return captions.findIndex(
    (caption) => currentTime >= caption.start && currentTime < caption.end
  );
}
