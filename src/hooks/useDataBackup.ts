 import { useCallback } from 'react';
 
 const STORAGE_KEYS = {
   prayers: 'prayer-history',
   streaks: 'prayer-streaks',
   qadha: 'qadha-prayer-counts',
   qadhaGoal: 'qadha-daily-goal',
   habits: 'habits-tracking',
   habitsPaused: 'habits-paused',
   habitsLevel: 'habits-level',
 };
 
 export interface BackupData {
   version: number;
   exportedAt: string;
   data: {
     prayers: unknown;
     streaks: unknown;
     qadha: unknown;
     qadhaGoal: unknown;
     habits: unknown;
     habitsPaused: unknown;
     habitsLevel: unknown;
   };
 }
 
 export function useDataBackup() {
   const exportData = useCallback(() => {
     const backup: BackupData = {
       version: 1,
       exportedAt: new Date().toISOString(),
       data: {
         prayers: JSON.parse(localStorage.getItem(STORAGE_KEYS.prayers) || '{}'),
         streaks: JSON.parse(localStorage.getItem(STORAGE_KEYS.streaks) || '{}'),
         qadha: JSON.parse(localStorage.getItem(STORAGE_KEYS.qadha) || '{}'),
         qadhaGoal: localStorage.getItem(STORAGE_KEYS.qadhaGoal) || '5',
         habits: JSON.parse(localStorage.getItem(STORAGE_KEYS.habits) || '{}'),
         habitsPaused: JSON.parse(localStorage.getItem(STORAGE_KEYS.habitsPaused) || '[]'),
         habitsLevel: localStorage.getItem(STORAGE_KEYS.habitsLevel) || 'easy',
       },
     };
 
     const blob = new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' });
     const url = URL.createObjectURL(blob);
     const link = document.createElement('a');
     link.href = url;
     link.download = `iman-tracker-backup-${new Date().toISOString().split('T')[0]}.json`;
     document.body.appendChild(link);
     link.click();
     document.body.removeChild(link);
     URL.revokeObjectURL(url);
   }, []);
 
   const importData = useCallback((file: File): Promise<{ success: boolean; message: string }> => {
     return new Promise((resolve) => {
       const reader = new FileReader();
       
       reader.onload = (e) => {
         try {
           const content = e.target?.result as string;
           const backup: BackupData = JSON.parse(content);
 
           if (!backup.version || !backup.data) {
             resolve({ success: false, message: 'Ogiltig backup-fil' });
             return;
           }
 
           // Restore all data
           if (backup.data.prayers) {
             localStorage.setItem(STORAGE_KEYS.prayers, JSON.stringify(backup.data.prayers));
           }
           if (backup.data.streaks) {
             localStorage.setItem(STORAGE_KEYS.streaks, JSON.stringify(backup.data.streaks));
           }
           if (backup.data.qadha) {
             localStorage.setItem(STORAGE_KEYS.qadha, JSON.stringify(backup.data.qadha));
           }
           if (backup.data.qadhaGoal) {
             localStorage.setItem(STORAGE_KEYS.qadhaGoal, String(backup.data.qadhaGoal));
           }
           if (backup.data.habits) {
             localStorage.setItem(STORAGE_KEYS.habits, JSON.stringify(backup.data.habits));
           }
           if (backup.data.habitsPaused) {
             localStorage.setItem(STORAGE_KEYS.habitsPaused, JSON.stringify(backup.data.habitsPaused));
           }
           if (backup.data.habitsLevel) {
             localStorage.setItem(STORAGE_KEYS.habitsLevel, String(backup.data.habitsLevel));
           }
 
           // Dispatch events to notify hooks
           window.dispatchEvent(new Event('qadha-updated'));
           
           resolve({ 
             success: true, 
             message: `Data återställd från ${new Date(backup.exportedAt).toLocaleDateString('sv-SE')}` 
           });
         } catch {
           resolve({ success: false, message: 'Kunde inte läsa backup-filen' });
         }
       };
 
       reader.onerror = () => {
         resolve({ success: false, message: 'Fel vid läsning av fil' });
       };
 
       reader.readAsText(file);
     });
   }, []);
 
   return { exportData, importData };
 }