import { useCallback } from 'react';
import {
  backupFilename,
  clearAllData,
  createBackup,
  restoreBackup,
  type RestoreResult,
} from '@/lib/backup';

export type { RestoreResult };

export function useDataBackup() {
  const exportData = useCallback(() => {
    const blob = new Blob([JSON.stringify(createBackup(), null, 2)], {
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
