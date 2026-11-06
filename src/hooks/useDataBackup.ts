import { useCallback } from 'react';
import { Capacitor } from '@capacitor/core';
import { Filesystem, Directory, Encoding } from '@capacitor/filesystem';
import { Share } from '@capacitor/share';
import {
  backupFilename,
  clearAllData,
  createBackup,
  restoreBackup,
  type RestoreResult,
} from '@/lib/backup';

export type { RestoreResult };

export function useDataBackup() {
  const exportData = useCallback(async () => {
    const contents = JSON.stringify(createBackup(), null, 2);
    if (Capacitor.isNativePlatform()) {
      const file = await Filesystem.writeFile({ path: backupFilename(), data: contents, directory: Directory.Cache, encoding: Encoding.UTF8 });
      await Share.share({ title: 'Ibadah', files: [file.uri] });
      return;
    }
    const blob = new Blob([contents], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = backupFilename();
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }, []);

  const importData = useCallback((file: File): Promise<RestoreResult> => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (e) => resolve(restoreBackup(String(e.target?.result ?? '')));
      reader.onerror = () => resolve({ status: 'unreadable' });
      reader.readAsText(file);
    });
  }, []);

  const clearData = useCallback(() => clearAllData(), []);

  return { exportData, importData, clearData };
}
