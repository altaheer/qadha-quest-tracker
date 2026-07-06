import { useRef, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { useDataBackup } from '@/hooks/useDataBackup';
import { Download, Upload, Database, Shield, RotateCcw, Palette, Clock, User as UserIcon, LogOut, Plug } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { LanguageSelector } from '@/components/LanguageSelector';
import { ThemeToggle } from '@/components/ThemeToggle';
import { useTranslation } from '@/lib/i18n';
import { useUserPrefs } from '@/hooks/useUserPrefs';
import { resetOnboarding } from '@/components/Onboarding';
import { useAuth } from '@/hooks/useAuth';
import { syncLocalDataToCloud } from '@/lib/cloudSync';
import { Link } from 'react-router-dom';

export default function Settings() {
  const { t } = useTranslation();
  const { showArabic, setShowArabic, autoMarkMissed, setAutoMarkMissed, autoMarkMissedTime, setAutoMarkMissedTime } = useUserPrefs();
  const { exportData, importData } = useDataBackup();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { user, signOut } = useAuth();
  const [syncing, setSyncing] = useState(false);

  const handleSync = async () => {
    if (!user) return;
    setSyncing(true);
    try {
      const r = await syncLocalDataToCloud(user.id);
      toast({
        title: 'Synced to your account',
        description: `${r.prayers} prayer entries, ${r.qadha} qadha counters.`,
      });
    } catch (e) {
      toast({ title: 'Sync failed', description: e instanceof Error ? e.message : String(e), variant: 'destructive' });
    } finally {
      setSyncing(false);
    }
  };

  const handleExport = () => {
    exportData();
    toast({ title: t('common.done'), description: t('settings.export') });
  };

  const handleImportClick = () => fileInputRef.current?.click();

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const result = await importData(file);
    toast({
      title: result.success ? t('common.done') : t('common.cancel'),
      description: result.message,
      variant: result.success ? 'default' : 'destructive',
    });
    if (result.success) setTimeout(() => window.location.reload(), 1500);
    e.target.value = '';
  };

  const handleResetOnboarding = () => {
    resetOnboarding();
    toast({ title: t('settings.resetOnboarding'), description: t('settings.resetOnboardingDone') });
    setTimeout(() => window.location.reload(), 1000);
  };

  return (
    <div className="container max-w-lg mx-auto px-4 py-6">
      <div className="mb-6">
        <h2 className="font-display text-2xl font-bold text-foreground mb-1">{t('settings.title')}</h2>
        <p className="text-muted-foreground text-sm">{t('settings.subtitle')}</p>
      </div>

      <div className="space-y-4">
        <Card className="border-border/50">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                <UserIcon className="h-5 w-5 text-primary" />
              </div>
              <div>
                <CardTitle className="text-lg">Account & AI assistants</CardTitle>
                <CardDescription>
                  Sign in to sync across devices and connect ChatGPT, Claude or Cursor via MCP.
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            {user ? (
              <>
                <p className="text-sm">
                  Signed in as <span className="font-medium">{user.email}</span>
                </p>
                <div className="flex flex-col sm:flex-row gap-2">
                  <Button onClick={handleSync} disabled={syncing} className="flex-1 gap-2">
                    <Upload className="h-4 w-4" />
                    {syncing ? 'Syncing…' : 'Sync local data to cloud'}
                  </Button>
                  <Button variant="outline" onClick={() => signOut()} className="flex-1 gap-2">
                    <LogOut className="h-4 w-4" />
                    Sign out
                  </Button>
                </div>
                <div className="rounded-md border border-border/50 p-3 text-xs text-muted-foreground space-y-1">
                  <div className="flex items-center gap-2 text-foreground font-medium">
                    <Plug className="h-3.5 w-3.5" /> Connect an AI assistant
                  </div>
                  <p>
                    In ChatGPT/Claude/Cursor, add a custom connector using your app's MCP URL:
                  </p>
                  <code className="block break-all bg-muted/50 rounded px-2 py-1">
                    {import.meta.env.VITE_SUPABASE_URL}/functions/v1/mcp
                  </code>
                  <p>Sign in with the same account when prompted to approve access.</p>
                </div>
              </>
            ) : (
              <Button asChild className="w-full">
                <Link to="/auth">Sign in or create an account</Link>
              </Button>
            )}
          </CardContent>
        </Card>

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
                className="w-28"
              />
            </div>
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
    </div>
  );
}
