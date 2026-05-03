const LAST_APP_DIR_STORAGE_KEY = "next-cache-inspector:last-app-dir";

export function getSavedAppDir(): string | null {
  if (typeof window === "undefined") {
    return null;
  }

  return window.localStorage.getItem(LAST_APP_DIR_STORAGE_KEY);
}

export function saveAppDir(appDir: string): void {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(LAST_APP_DIR_STORAGE_KEY, appDir);
}
