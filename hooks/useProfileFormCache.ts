import { useCallback } from 'react';
import * as SecureStore from 'expo-secure-store';
import { getFormCacheKey } from '../constants/profileConstants'; // Annahme: Pfad angepasst
import type { FormCache } from '../types/profileForm'; // Annahme: FormCache wurde verschoben

const CACHE_DURATION_MS = 24 * 60 * 60 * 1000; // 24 Stunden

export function useProfileFormCache(userId: string | "") { // userId kann optional sein
  const formCacheKey = getFormCacheKey(userId); // Dynamischer Key basierend auf userId

  const saveFormCache = useCallback(async (data: Omit<FormCache, 'lastUpdated'>) => {
    if (!userId) return;
    try {
      const cacheData: FormCache = { ...data, userId, lastUpdated: Date.now() }; // Stelle sicher, dass userId hier auch drin ist, wenn dein Typ es erfordert
      await SecureStore.setItemAsync(formCacheKey, JSON.stringify(cacheData));
      console.log("[useProfileFormCache] Form cache saved for key:", formCacheKey);
    } catch (error) {
      console.log("[useProfileFormCache] Failed to save form cache:", error);
    }
  }, [userId, formCacheKey]); 

  const loadFormCache = useCallback(async (): Promise<FormCache | null> => {
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
  }, [userId, formCacheKey]); 

   const clearFormCache = useCallback(async () => {
    if (!userId) return;
    try {
      await SecureStore.deleteItemAsync(formCacheKey);
      console.log("[useProfileFormCache] Form cache cleared for key:", formCacheKey);
    } catch (error) {
      console.log("[useProfileFormCache] Failed to clear form cache for key:", formCacheKey, error);
    }
  }, [userId, formCacheKey]);

  return { saveFormCache, loadFormCache, clearFormCache };
}