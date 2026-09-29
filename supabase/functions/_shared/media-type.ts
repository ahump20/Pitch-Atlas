export interface DetectedMediaType {
  kind: "image" | "video";
  mime: string;
  extension: string;
}

/** Leading signatures only; this does not claim to decode/transcode the media. */
export function detectMediaType(bytes: Uint8Array): DetectedMediaType | null {
  const matches = (signature: number[], offset = 0) =>
    signature.every((byte, index) => bytes[offset + index] === byte);
  if (matches([0xff, 0xd8, 0xff])) {
    return { kind: "image", mime: "image/jpeg", extension: "jpg" };
  }
  if (matches([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])) {
    return { kind: "image", mime: "image/png", extension: "png" };
  }
  const text = (start: number, end: number) =>
    String.fromCharCode(...bytes.slice(start, end));
  if (["GIF87a", "GIF89a"].includes(text(0, 6))) {
    return { kind: "image", mime: "image/gif", extension: "gif" };
  }
  if (text(0, 4) === "RIFF" && text(8, 12) === "WEBP") {
    return { kind: "image", mime: "image/webp", extension: "webp" };
  }
  if (text(4, 8) === "ftyp" && bytes.length >= 12) {
    const brand = text(8, 12);
    if (brand === "qt  ") {
      return { kind: "video", mime: "video/quicktime", extension: "mov" };
    }
    // ftyp is shared by AVIF, HEIC and audio-only containers; unknown brands
    // must not receive a video MIME/cap merely because that box exists.
    if (
      [
        "isom",
        "iso2",
        "iso3",
        "iso4",
        "iso5",
        "iso6",
        "mp41",
        "mp42",
        "avc1",
        "M4V ",
      ].includes(brand)
    ) {
      return { kind: "video", mime: "video/mp4", extension: "mp4" };
    }
    return null;
  }
  if (matches([0x1a, 0x45, 0xdf, 0xa3])) {
    return { kind: "video", mime: "video/webm", extension: "webm" };
  }
  return null;
}

export const MEDIA_BYTE_CAPS = {
  image: 8 * 1024 * 1024,
  video: 50 * 1024 * 1024,
} as const;
