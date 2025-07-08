export function getCoverFileInfo(cover: string) {
  const match = /^data:(image\/\w+);base64,(.+)$/.exec(cover || "");
  if (!match) return null;
  return { mime: match[1], base64: match[2], ext: match[1].split("/")[1] };
}