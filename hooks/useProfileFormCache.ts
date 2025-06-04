import * as SecureStore from 'expo-secure-store';
import { getFormCacheKey } from '../constants/profileConstants'; // Annahme: Pfad angepasst
import type { FormCache } from '../types/profileForm'; // Annahme: FormCache wurde verschoben

const CACHE_DURATION_MS = 24 * 60 * 60 * 1000; // 24 Stunden

export function useProfileFormCache(userId: string | "") { // userId kann optional sein
  const formCacheKey = getFormCacheKey(userId); // Dynamischer Key basierend auf userId

  const saveFormCache = async (data: Omit<FormCache, 'lastUpdated'>) => {
    if (!userId) return; // Nicht speichern, wenn keine userId vorhanden ist
    try {
      const cacheData: FormCache = {
        ...data,
        lastUpdated: Date.now(),
      };
      await SecureStore.setItemAsync(formCacheKey, JSON.stringify(cacheData));
      console.log("[useProfileFormCache] Form cache saved for key:", formCacheKey);
    } catch (error) {
      console.log("[useProfileFormCache] Failed to save form cache:", error);
    }
  };

  const loadFormCache = async (): Promise<FormCache | null> => {
    if (!userId) return null;
    try {
      const cachedDataString = await SecureStore.getItemAsync(formCacheKey);
      if (cachedDataString) {
        const cache: FormCache = JSON.parse(cachedDataString);
        if (Date.now() - cache.lastUpdated < CACHE_DURATION_MS) {
          console.log("[useProfileFormCache] Form cache loaded for key:", formCacheKey);
          return cache;
        }
        console.log("[useProfileFormCache] Form cache expired for key:", formCacheKey);
      }
    } catch (error) {
      console.log("[useProfileFormCache] Failed to load form cache for key:", formCacheKey, error);
    }
    return null;
  };

  const clearFormCache = async () => {
    if (!userId) return;
    try {
      await SecureStore.deleteItemAsync(formCacheKey);
      console.log("[useProfileFormCache] Form cache cleared for key:", formCacheKey);
    } catch (error) {
      console.log("[useProfileFormCache] Failed to clear form cache for key:", formCacheKey, error);
    }
  };

  return { saveFormCache, loadFormCache, clearFormCache };
}