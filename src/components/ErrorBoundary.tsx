import { Component, type ReactNode } from 'react';
import { Download, RotateCcw, TriangleAlert } from 'lucide-react';
import { createBackup, backupFilename, clearAllData } from '@/lib/backup';

/**
 * All of this app's data lives on the device, in localStorage, with nothing
 * on a server to fall back to. A single malformed value — a partial write,
 * a quota error mid-save, a hand-edited key — throws during render, and
 * without a boundary that is a permanently blank screen with no way back to
 * Settings to fix it. This is the recovery path: export what can still be
 * read, or erase and start clean.
 *
 * Deliberately outside src/lib/i18n.ts's React-hook-based useTranslation() —
 * a boundary must render even when the app underneath it, translations
 * included, has already failed. Its four strings are inlined instead.
 */

const COPY: Record<string, { title: string; desc: string; export: string; reset: string }> = {
  en: {
    title: 'Something went wrong',
    desc: "The app hit an error it couldn't recover from on its own. Your data is still on this device — export a backup before doing anything else.",
    export: 'Export a backup',
    reset: 'Erase and start over',
  },
  sv: {
    title: 'Något gick fel',
    desc: 'Appen stötte på ett fel den inte kunde återhämta sig från på egen hand. Din data finns kvar på enheten — exportera en säkerhetskopia innan du gör något annat.',
    export: 'Exportera en säkerhetskopia',
    reset: 'Radera och börja om',
  },
  tr: {
    title: 'Bir şeyler ters gitti',
    desc: 'Uygulama kendi kendine düzeltemediği bir hatayla karşılaştı. Verilerin hâlâ bu cihazda — başka bir şey yapmadan önce bir yedek al.',
    export: 'Yedek al',
    reset: 'Sil ve baştan başla',
  },
  ar: {
    title: 'حدث خطأ ما',
    desc: 'واجه التطبيق خطأً لم يستطع التعافي منه وحده. بياناتك ما زالت على هذا الجهاز — صدّر نسخة احتياطية قبل أي شيء آخر.',
    export: 'تصدير نسخة احتياطية',
    reset: 'مسح والبدء من جديد',
  },
};

function copyForCurrentLanguage() {
  const lang = typeof document !== 'undefined' ? document.documentElement.lang : 'en';
  return COPY[lang] ?? COPY.en;
}

interface State {
  hasError: boolean;
}

export class ErrorBoundary extends Component<{ children: ReactNode }, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  componentDidCatch(error: unknown) {
    console.error('Unhandled error, showing recovery screen:', error);
  }

  handleExport = () => {
    try {
      const backup = createBackup();
      const blob = new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = backupFilename();
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      // Even the backup step can fail if storage itself is the problem —
      // there is nothing further to do from here.
    }
  };

  handleReset = () => {
    const c = copyForCurrentLanguage();
    if (!window.confirm(c.desc)) return;
    clearAllData();
    window.location.reload();
  };

  render() {
    if (!this.state.hasError) return this.props.children;

    const c = copyForCurrentLanguage();

    return (
      <div className="fixed inset-0 z-[300] flex items-center justify-center bg-background px-6">
        <div className="w-full max-w-sm text-center">
          <span className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-destructive/10 text-destructive">
            <TriangleAlert className="h-7 w-7" strokeWidth={1.75} />
          </span>
          <h1 className="font-display text-xl font-semibold text-foreground">{c.title}</h1>
          <p className="mt-2 text-[0.8125rem] leading-relaxed text-muted-foreground">{c.desc}</p>

          <div className="mt-6 space-y-2">
            <button
              type="button"
              onClick={this.handleExport}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-4 py-3 text-[0.9375rem] font-medium text-primary-foreground transition-colors duration-base ease-brand hover:bg-primary/90"
            >
              <Download className="h-4 w-4" />
              {c.export}
            </button>
            <button
              type="button"
              onClick={this.handleReset}
              className="flex w-full items-center justify-center gap-2 rounded-xl px-4 py-3 text-[0.9375rem] text-destructive transition-colors duration-base ease-brand hover:bg-destructive/10"
            >
              <RotateCcw className="h-4 w-4" />
              {c.reset}
            </button>
          </div>
        </div>
      </div>
    );
  }
}
