import { useRef } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { useDataBackup } from '@/hooks/useDataBackup';
import { ChevronRight, Download, Upload, Database, HelpCircle, Shield, RotateCcw, Palette, Clock, Trash2, Bell } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { LanguageSelector } from '@/components/LanguageSelector';
import { ThemeToggle } from '@/components/ThemeToggle';
import { useTranslation } from '@/lib/i18n';
import { useUserPrefs } from '@/hooks/useUserPrefs';
import { useLocalNotifications } from '@/hooks/useLocalNotifications';
import { resetOnboarding } from '@/components/Onboarding';
import { Page, PageHeader } from '@/components/common';

export default function Settings() {
  const { t } = useTranslation();
  const { showArabic, setShowArabic, autoMarkMissed, setAutoMarkMissed, autoMarkMissedTime, setAutoMarkMissedTime } = useUserPrefs();
  const { supported: notificationsSupported, permission: notificationPermission, requestPermission } = useLocalNotifications();
  const { exportData, importData, clearData } = useDataBackup();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleExport = () => {
    exportData();
    toast({ title: t('common.done'), description: t('settings.export') });
  };

  const handleImportClick = () => fileInputRef.current?.click();

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;

    const result = await importData(file);
    if (result.status === 'restored') {
      toast({ title: t('common.done'), description: t('settings.restored') });
      setTimeout(() => window.location.reload(), 1500);
      return;
    }
    toast({
      title: t('common.cancel'),
      description:
        result.status === 'unreadable' ? t('settings.restoreFailed') : t('settings.restoreInvalid'),
      variant: 'destructive',
    });
  };

  const handleClearData = () => {
    if (!window.confirm(t('settings.clearDataConfirm'))) return;
    clearData();
    toast({ title: t('common.done'), description: t('settings.clearDataDone') });
    setTimeout(() => window.location.reload(), 1200);
  };

  const handleResetOnboarding = () => {
    resetOnboarding();
    toast({ title: t('settings.resetOnboarding'), description: t('settings.resetOnboardingDone') });
    setTimeout(() => window.location.reload(), 1000);
  };

  return (
    <Page>
      <PageHeader title={t('settings.title')} subtitle={t('settings.subtitle')} />

      <div className="space-y-3">
        <Link
          to="/guide"
          className="surface-interactive flex items-center gap-3 px-4 py-4"
        >
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
            <HelpCircle className="h-5 w-5" />
          </span>
          <div className="min-w-0 flex-1">
            <p className="font-display text-lg font-semibold text-foreground">
              {t('guide.openGuide')}
            </p>
            <p className="text-sm text-muted-foreground">{t('guide.openGuideDesc')}</p>
          </div>
          <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground/60 rtl:rotate-180" />
        </Link>

        <LanguageSelector />


        <Card className="border-border/50">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                <Palette className="h-5 w-5 text-primary" />
              </div>
              <div>
                <CardTitle className="text-lg">{t('settings.appearance')}</CardTitle>
                <CardDescription>{t('settings.appearanceDesc')}</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-5">
            <div className="flex items-center justify-between gap-4">
              <span className="text-sm font-medium text-foreground">{t('settings.theme')}</span>
              <ThemeToggle />
            </div>
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <p className="text-sm font-medium text-foreground">{t('settings.showArabic')}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{t('settings.showArabicDesc')}</p>
              </div>
              <Switch checked={showArabic} onCheckedChange={setShowArabic} />
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/50">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                <Clock className="h-5 w-5 text-primary" />
              </div>
              <div>
                <CardTitle className="text-lg">{t('settings.autoMissed')}</CardTitle>
                <CardDescription>{t('settings.autoMissedDesc')}</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-5">
            <div className="flex items-center justify-between gap-4">
              <span className="text-sm font-medium text-foreground">{t('settings.autoMissed')}</span>
              <Switch checked={autoMarkMissed} onCheckedChange={setAutoMarkMissed} />
            </div>
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <p className="text-sm font-medium text-foreground">{t('settings.autoMissedTime')}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{t('settings.autoMissedTimeDesc')}</p>
              </div>
              <Input
                type="time"
                value={autoMarkMissedTime}
                onChange={(e) => setAutoMarkMissedTime(e.target.value || '00:00')}
                disabled={!autoMarkMissed}
                className="w-[7.5rem] shrink-0"
              />
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/50">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                <Bell className="h-5 w-5 text-primary" />
              </div>
              <div>
                <CardTitle className="text-lg">{t('settings.notifications')}</CardTitle>
                <CardDescription>{t('settings.notificationsDesc')}</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            {!notificationsSupported || notificationPermission === 'unsupported' ? (
              <p className="text-sm text-muted-foreground">{t('settings.notificationsUnsupported')}</p>
            ) : notificationPermission === 'granted' ? (
              <p className="text-sm text-muted-foreground">{t('settings.notificationsEnabled')}</p>
            ) : notificationPermission === 'denied' ? (
              <p className="text-sm text-muted-foreground">{t('settings.notificationsDenied')}</p>
            ) : (
              <Button
                type="button"
                variant="outline"
                className="w-full"
                onClick={() => void requestPermission()}
              >
                {t('settings.notificationsEnable')}
              </Button>
            )}
          </CardContent>
        </Card>

        <Card className="glass-card border-border/50">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                <Database className="h-5 w-5 text-primary" />
              </div>
              <div>
                <CardTitle className="text-lg">{t('settings.dataMgmt')}</CardTitle>
                <CardDescription>{t('settings.dataMgmtDesc')}</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <Button onClick={handleExport} className="flex-1 gap-2">
                <Download className="h-4 w-4" />
                {t('settings.export')}
              </Button>
              <Button onClick={handleImportClick} variant="outline" className="flex-1 gap-2">
                <Upload className="h-4 w-4" />
                {t('settings.import')}
              </Button>
              <input ref={fileInputRef} type="file" accept=".json" onChange={handleFileChange} className="hidden" />
            </div>
            <div className="pt-3 border-t border-border/50 space-y-2">
              <p className="text-xs text-muted-foreground">{t('settings.clearDataDesc')}</p>
              <Button variant="ghost" onClick={handleClearData} className="w-full gap-2 text-destructive hover:text-destructive hover:bg-destructive/10">
                <Trash2 className="h-4 w-4" />
                {t('settings.clearData')}
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card border-border/50">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-secondary/50 flex items-center justify-center">
                <Shield className="h-5 w-5 text-muted-foreground" />
              </div>
              <div>
                <CardTitle className="text-lg">{t('settings.dataInfo')}</CardTitle>
                <CardDescription>{t('settings.dataInfoDesc')}</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <Button variant="outline" onClick={handleResetOnboarding} className="w-full gap-2">
              <RotateCcw className="h-4 w-4" />
              {t('settings.resetOnboarding')}
            </Button>
          </CardContent>
        </Card>
      </div>
    </Page>
  );
}
