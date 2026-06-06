export const USERNAME_REGEX = /^[a-z0-9_-]{3,20}$/;

export const RESERVED_USERNAMES = [
  "admin",
  "api",
  "dashboard",
  "login",
  "register",
  "settings",
  "support",
  "help",
  "root",
];

export const ALLOWED_IMAGE_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
];

export const ALLOWED_AUDIO_TYPES = [
  "audio/mpeg",
  "audio/mp3",
  "audio/wav",
  "audio/x-wav",
  "audio/ogg",
  "audio/webm",
  "audio/mp4",
  "audio/m4a",
  "audio/x-m4a",
  "application/octet-stream",
];

export const ALLOWED_AUDIO_EXTENSIONS = ["mp3", "wav", "ogg", "webm", "m4a"];

export const MAX_UPLOAD_SIZE = 10 * 1024 * 1024;
export const MAX_AUDIO_UPLOAD_SIZE = 5 * 1024 * 1024;

export function validateUsername(username: string) {
  if (!USERNAME_REGEX.test(username)) {
    return "Username 3-20 karakter olmalı ve yalnızca küçük harf, rakam, _ veya - içermelidir.";
  }

  if (RESERVED_USERNAMES.includes(username)) {
    return "Bu kullanıcı adı rezerve edilmiş.";
  }

  return null;
}

export function validateImage(file: File) {
  if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
    return "Desteklenen formatlar: jpg, jpeg, png, webp, gif.";
  }

  if (file.size > MAX_UPLOAD_SIZE) {
    return "Dosya boyutu 10 MB sınırını aşamaz.";
  }

  return null;
}

export function validateAudio(file: File) {
  const extension = file.name.split(".").pop()?.toLowerCase() ?? "";

  if (
    !ALLOWED_AUDIO_EXTENSIONS.includes(extension) ||
    !ALLOWED_AUDIO_TYPES.includes(file.type)
  ) {
    return "Desteklenen ses formatları: mp3, wav, ogg, webm, m4a.";
  }

  if (file.size > MAX_AUDIO_UPLOAD_SIZE) {
    return "Şarkı dosyası 5 MB sınırını aşamaz.";
  }

  return null;
}

export function getAudioContentType(file: File) {
  const extension = file.name.split(".").pop()?.toLowerCase();

  switch (extension) {
    case "mp3":
      return "audio/mpeg";
    case "wav":
      return "audio/wav";
    case "ogg":
      return "audio/ogg";
    case "webm":
      return "audio/webm";
    case "m4a":
      return "audio/mp4";
    default:
      return file.type || "audio/mpeg";
  }
}
