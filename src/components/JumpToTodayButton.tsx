import { CalendarCheck } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from '@/lib/i18n';

interface Props {
  show: boolean;
  onClick: () => void;
}

export function JumpToTodayButton({ show, onClick }: Props) {
  const { t } = useTranslation();
  return (
    <AnimatePresence>
      {show && (
        <motion.button
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 16 }}
          onClick={onClick}
          className="fixed left-1/2 -translate-x-1/2 z-40 bottom-[calc(4.5rem+env(safe-area-inset-bottom)+0.75rem)] md:bottom-6 flex items-center gap-2 px-4 py-2.5 rounded-full bg-primary text-primary-foreground shadow-elevated text-sm font-medium tap-target"
        >
          <CalendarCheck className="h-4 w-4" />
          {t('prayers.jumpToToday')}
        </motion.button>
      )}
    </AnimatePresence>
  );
}
