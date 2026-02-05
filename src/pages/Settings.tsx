 import { useRef } from 'react';
 import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
 import { Button } from '@/components/ui/button';
 import { useDataBackup } from '@/hooks/useDataBackup';
 import { Download, Upload, Database, Shield } from 'lucide-react';
 import { useToast } from '@/hooks/use-toast';
 
 export default function Settings() {
   const { exportData, importData } = useDataBackup();
   const { toast } = useToast();
   const fileInputRef = useRef<HTMLInputElement>(null);
 
   const handleExport = () => {
     exportData();
     toast({
       title: 'Export klar!',
       description: 'Din backup-fil har laddats ner.',
     });
   };
 
   const handleImportClick = () => {
     fileInputRef.current?.click();
   };
 
   const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
     const file = e.target.files?.[0];
     if (!file) return;
 
     const result = await importData(file);
     
     toast({
       title: result.success ? 'Import lyckades!' : 'Import misslyckades',
       description: result.message,
       variant: result.success ? 'default' : 'destructive',
     });
 
     if (result.success) {
       // Reload to reflect imported data
       setTimeout(() => window.location.reload(), 1500);
     }
 
     // Reset input
     e.target.value = '';
   };
 
   return (
     <div className="container max-w-lg mx-auto px-4 py-6">
       <div className="mb-6">
         <h2 className="font-display text-2xl font-bold text-foreground mb-1">
           Inställningar
         </h2>
         <p className="text-muted-foreground text-sm">
           Hantera din app och data
         </p>
       </div>
 
       <div className="space-y-4">
         {/* Data Backup Card */}
         <Card className="glass-card border-border/50">
           <CardHeader className="pb-3">
             <div className="flex items-center gap-3">
               <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                 <Database className="h-5 w-5 text-primary" />
               </div>
               <div>
                 <CardTitle className="text-lg">Datahantering</CardTitle>
                 <CardDescription>Exportera och importera din data</CardDescription>
               </div>
             </div>
           </CardHeader>
           <CardContent className="space-y-3">
             <p className="text-sm text-muted-foreground">
               All din data sparas lokalt i webbläsaren. Exportera regelbundet för att säkerställa 
               att du inte förlorar dina framsteg om du byter enhet eller rensar webbläsardata.
             </p>
             
             <div className="flex flex-col sm:flex-row gap-3 pt-2">
               <Button onClick={handleExport} className="flex-1 gap-2">
                 <Download className="h-4 w-4" />
                 Exportera data
               </Button>
               <Button onClick={handleImportClick} variant="outline" className="flex-1 gap-2">
                 <Upload className="h-4 w-4" />
                 Importera data
               </Button>
               <input
                 ref={fileInputRef}
                 type="file"
                 accept=".json"
                 onChange={handleFileChange}
                 className="hidden"
               />
             </div>
           </CardContent>
         </Card>
 
         {/* Data Info Card */}
         <Card className="glass-card border-border/50">
           <CardHeader className="pb-3">
             <div className="flex items-center gap-3">
               <div className="w-10 h-10 rounded-full bg-secondary/50 flex items-center justify-center">
                 <Shield className="h-5 w-5 text-muted-foreground" />
               </div>
               <div>
                 <CardTitle className="text-lg">Din data</CardTitle>
                 <CardDescription>Information om datalagring</CardDescription>
               </div>
             </div>
           </CardHeader>
           <CardContent>
             <ul className="text-sm text-muted-foreground space-y-2">
               <li className="flex items-start gap-2">
                 <span className="text-primary mt-1">•</span>
                 <span>All data sparas endast på din enhet</span>
               </li>
               <li className="flex items-start gap-2">
                 <span className="text-primary mt-1">•</span>
                 <span>Ingen data skickas till servrar</span>
               </li>
               <li className="flex items-start gap-2">
                 <span className="text-primary mt-1">•</span>
                 <span>Backup-filen innehåller böner, vanor, qadha och streaks</span>
               </li>
               <li className="flex items-start gap-2">
                 <span className="text-primary mt-1">•</span>
                 <span>Rekommendation: Exportera backup varje vecka</span>
               </li>
             </ul>
           </CardContent>
         </Card>
       </div>
     </div>
   );
 }