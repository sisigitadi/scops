import React from 'react';
import { Terminal, Copy, Check, ExternalLink, Shield, Info, Database, Globe, Lock, History } from 'lucide-react';
import { useSettings } from '../../context/SettingsContext';
import { useLanguage } from '../../context/LanguageContext';
import InfoTooltip from '../common/InfoTooltip';

/**
 * IntegratorGuide — Neural Toolchain Onboarding
 * Exhaustive documentation matrix for synchronizing Wazuh ecosystem parameters 
 * and OpenCTI threat intelligence pipelines.
 */

interface CodeBlockProps {
  code: string;
  label: string;
}

const CodeBlock = ({ code, label }: CodeBlockProps) => {
  const [copied, setCopied] = React.useState(false);

  const copyToClipboard = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="relative group mt-2 mb-4">
      <div className="absolute -top-2.5 left-4 px-2 py-0.5 bg-slate-800 border border-slate-700 rounded text-[9px] font-black text-slate-400 uppercase tracking-widest z-10 flex items-center gap-1.5">
        <Terminal size={10} /> {label}
      </div>
      <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 pt-6 font-mono text-[11px] text-cyan-500/90 leading-relaxed overflow-x-auto whitespace-pre">
        {code}
      </div>
      <button 
        onClick={copyToClipboard}
        className="absolute top-3 right-3 p-2 rounded-lg bg-slate-900 border border-slate-800 text-slate-500 hover:text-cyan-400 opacity-0 group-hover:opacity-100 transition-all"
      >
        {copied ? <Check size={14} className="text-emerald-500" /> : <Copy size={14} />}
      </button>
    </div>
  );
};

export default function IntegratorGuide() {
  const { settings } = useSettings();
  const { t } = useLanguage();

  const activityLogs = [
    {
      date: '2026-04-10 14:18',
      action: '100% TypeScript Sovereignty Acheieved',
      details: [
        'Migrated all legacy .jsx modules to strictly typed .tsx ecosystem.',
        'Hardened module resolution logic to prevent runtime initialization failures.',
        'Integrated strict propensity checks for all contextual data streams.',
        'Standardized clinical forensic visual protocols across all components.'
      ]
    },
    {
      date: '2026-04-07 21:40',
      action: 'Footer Hardening & Stability Fix',
      details: [
        'Reconstructed AppFooter as a full-width sticky horizontal bar mirroring Topbar.',
        'Implemented Grid-based (grid-cols-3) layout for collision prevention.',
        'Moved Portal Utama from Sidebar to prominent Footer icon with tooltips.',
        'Fixed ReferenceError: InfoTooltip in SettingsPage.jsx.',
        'Resolved SyntaxErrors (blank screen) caused by missing lucide-react icons.',
        'Renamed "Configuration Settings" to "Settings" globally for UI conciseness.'
      ]
    }
  ];

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-top-4 duration-700 pb-12 font-bold">
      {/* Header Section */}
      <div className="p-8 rounded-[2rem] bg-accent-cyan/5 border border-accent-cyan/20 shadow-xl shadow-accent-cyan/5 relative overflow-hidden font-bold">
        <div className="absolute top-0 right-0 p-8 opacity-5">
           <Shield size={120} />
        </div>
        <div className="flex gap-8 relative z-10">
          <div className="shrink-0 w-16 h-16 rounded-2xl bg-accent-cyan/10 flex items-center justify-center text-accent-cyan border border-accent-cyan/20 shadow-inner">
            <Shield size={32} />
          </div>
          <div>
            <h3 className="text-2xl font-black text-foreground-primary tracking-tight uppercase">{(t('settings.integrator.guideTitle') as string)}</h3>
            <p className="text-xs text-foreground-tertiary font-black uppercase tracking-widest leading-relaxed mt-3 opacity-70 max-w-2xl">
              {(t('settings.integrator.guideSubtitle') as string)}
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-8 font-bold">
        
        {/* Step 1: Wazuh Manager API */}
        <section className="space-y-6">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-accent-cyan flex items-center justify-center text-sm font-black text-background-main shadow-lg shadow-accent-cyan/20">1</div>
            <div className="flex items-center gap-3">
               <h4 className="text-sm font-black text-foreground-primary uppercase tracking-[0.2em]">{(t('settings.integrator.step1Title') as string)}</h4>
               <InfoTooltip text={(t('settings.tooltips.guideStep1') as string)} />
            </div>
          </div>
          <div className="ml-14 space-y-4">
            <p className="text-[11px] text-foreground-tertiary font-black uppercase tracking-widest leading-relaxed">
              {(t('settings.integrator.step1Desc') as string).replace('{appName}', settings.appName)}
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-[10px] text-foreground-secondary">
              <div className="p-4 rounded-2xl bg-bg-panel/40 border border-border-primary/10 flex items-start gap-3">
                 <Globe size={16} className="text-accent-cyan shrink-0 mt-0.5" />
                 <span className="font-black uppercase tracking-tighter">{(t('settings.integrator.step1Host') as string)}</span>
              </div>
              <div className="p-4 rounded-2xl bg-bg-panel/40 border border-border-primary/10 flex items-start gap-3">
                 <Lock size={16} className="text-accent-cyan shrink-0 mt-0.5" />
                 <span className="font-black uppercase tracking-tighter">{(t('settings.integrator.step1Auth') as string)}</span>
              </div>
            </div>
            <CodeBlock 
              label="CentOS / RHEL / Ubuntu" 
              code={`# Check Wazuh API status\ncurl -u admin:admin -k -X GET "https://localhost:55000/security/user/authenticate"`} 
            />
          </div>
        </section>

        {/* Step 2: Wazuh Indexer (Port 9200) */}
        <section className="space-y-6">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-accent-amber flex items-center justify-center text-sm font-black text-background-main shadow-lg shadow-accent-amber/20">2</div>
            <div className="flex items-center gap-3">
               <h4 className="text-sm font-black text-foreground-primary uppercase tracking-[0.2em]">{(t('settings.integrator.step2Title') as string)}</h4>
               <InfoTooltip text={(t('settings.tooltips.guideStep2') as string)} />
            </div>
          </div>
          <div className="ml-14 space-y-4">
            <p className="text-[11px] text-foreground-tertiary font-black uppercase tracking-widest leading-relaxed">
              {(t('settings.integrator.step2Desc') as string)}
            </p>
            <div className="p-6 rounded-2xl bg-accent-amber/5 border-2 border-dashed border-accent-amber/20 relative overflow-hidden group hover:bg-accent-amber/10 transition-all font-black">
              <p className="text-[10px] text-accent-amber font-black mb-3 flex items-center gap-2 uppercase tracking-widest relative z-10">
                <Info size={16} /> {(t('settings.integrator.step2Tip') as string).split(':')[0]}:
              </p>
              <p className="text-[10px] text-foreground-secondary leading-relaxed font-bold uppercase tracking-tight relative z-10">
                {(t('settings.integrator.step2Tip') as string).split(':')[1]}
              </p>
            </div>
            <CodeBlock 
              label="Testing Connectivity" 
              code={`# Test connection to Indexer from Dashboard server\ncurl -XGET https://WAZUH_INDEXER_IP:9200 -u admin:admin -k`} 
            />
          </div>
        </section>

        {/* Step 3: OpenCTI Integrator Script */}
        <section className="space-y-6">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-accent-indigo flex items-center justify-center text-sm font-black text-background-main shadow-lg shadow-accent-indigo/20">3</div>
            <div className="flex items-center gap-3">
               <h4 className="text-sm font-black text-foreground-primary uppercase tracking-[0.2em]">{(t('settings.integrator.step3Title') as string)}</h4>
               <InfoTooltip text={(t('settings.tooltips.guideStep3') as string)} />
            </div>
          </div>
          <div className="ml-14 space-y-6 font-bold">
            <p className="text-[11px] text-foreground-tertiary font-black uppercase tracking-widest leading-relaxed">
              {(t('settings.integrator.step1Desccti') as string)}
            </p>
            
            <div className="space-y-3">
              <label className="text-[9px] font-black text-foreground-tertiary uppercase tracking-[0.3em] pl-2">{(t('settings.integrator.libInstall') as string)}</label>
              <CodeBlock 
                label="Pip Install" 
                code="pip3 install requests aiohttp pycti" 
              />
            </div>

            <div className="space-y-3">
              <label className="text-[9px] font-black text-foreground-tertiary uppercase tracking-[0.3em] pl-2">{(t('settings.integrator.scriptDeploy') as string)}</label>
              <p className="text-[10px] text-foreground-tertiary font-bold uppercase tracking-widest opacity-60 ml-2">{(t('settings.integrator.scriptDeployDesc') as string)}</p>
              <CodeBlock 
                label="Configuration Script" 
                code={`# Download script\nwget -O /var/ossec/integrations/custom-opencti.py https://raw.githubusercontent.com/.../custom-opencti.py\n\n# Set permissions\nchmod 750 /var/ossec/integrations/custom-opencti.py\nchown root:wazuh /var/ossec/integrations/custom-opencti.py`} 
              />
            </div>

            <div className="space-y-3">
              <label className="text-[9px] font-black text-foreground-tertiary uppercase tracking-[0.3em] pl-2">{(t('settings.integrator.activation') as string)}</label>
              <p className="text-[10px] text-foreground-tertiary font-bold uppercase tracking-widest opacity-60 ml-2">{(t('settings.integrator.activationDesc') as string)}</p>
              <CodeBlock 
                label="XML Integration Block" 
                code={`<integration>\n  <name>custom-opencti</name>\n  <hook_url>http://YOUR_OPENCTI_URL:8080</hook_url>\n  <api_key>YOUR_OPENCTI_TOKEN</api_key>\n  <level>10</level> <!-- Alert MIN Level 10 -->\n  <alert_format>json</alert_format>\n</integration>`} 
              />
            </div>
          </div>
        </section>

        {/* Activity Change Log (Mandatory Activity Resume) */}
        <section className="space-y-6 pt-12 border-t border-border-primary/20">
           <div className="flex items-center gap-4">
              <div className="p-2.5 rounded-xl bg-accent-cyan/10 text-accent-cyan shadow-inner border border-accent-cyan/20">
                <History size={20} strokeWidth={2.5} />
              </div>
              <h4 className="text-sm font-black text-foreground-primary uppercase tracking-[0.2em]">{(t('settings.integrator.activityResume') as string)}</h4>
           </div>
           <div className="ml-14 space-y-8">
              {activityLogs.map((log, idx) => (
                <div key={idx} className="relative pl-8 border-l-2 border-border-primary/10 transition-all hover:border-accent-cyan/40">
                   <div className="absolute -left-[9px] top-1.5 w-4 h-4 rounded-full bg-background-main border-2 border-accent-cyan flex items-center justify-center shadow-[0_0_10px_rgba(var(--accent-cyan-rgb),0.3)]">
                      <div className="w-1.5 h-1.5 rounded-full bg-accent-cyan animate-pulse" />
                   </div>
                   <div className="flex flex-col gap-2">
                      <span className="text-[10px] font-black text-accent-cyan uppercase tracking-widest">{log.date}</span>
                      <h5 className="text-[11px] font-black text-foreground-primary uppercase tracking-widest">{log.action}</h5>
                      <ul className="mt-4 space-y-3">
                         {log.details.map((detail, dIdx) => (
                           <li key={dIdx} className="text-[10px] text-foreground-tertiary font-bold uppercase tracking-tight flex gap-3 leading-relaxed">
                              <span className="shrink-0 text-accent-cyan opacity-40 mt-0.5">▹</span>
                              <span>{detail}</span>
                           </li>
                         ))}
                      </ul>
                   </div>
                </div>
              ))}
           </div>
        </section>

        {/* Troubleshooting Section */}
        <section className="space-y-6 pt-12 border-t border-border-primary/20">
           <div className="flex items-center gap-4">
              <div className="p-2.5 rounded-xl bg-status-danger-bg/20 text-status-danger-text border border-status-danger-border/20 shadow-inner">
                <Terminal size={20} strokeWidth={2.5} />
              </div>
              <h4 className="text-sm font-black text-status-danger-text uppercase tracking-[0.2em]">{(t('settings.integrator.troubleshooting') as string)}</h4>
           </div>
           <div className="grid grid-cols-1 md:grid-cols-2 gap-6 ml-14">
              <div className="p-6 rounded-2xl bg-bg-panel/40 border-2 border-border-primary/10 transition-all hover:bg-bg-panel/60">
                 <h5 className="text-[11px] font-black text-foreground-primary mb-3 flex items-center gap-3 uppercase tracking-widest">
                   <Lock size={16} className="text-status-danger-text" /> {(t('settings.integrator.err401Title') as string)}
                 </h5>
                 <p className="text-[10px] text-foreground-tertiary font-bold leading-relaxed uppercase tracking-tight">
                    {(t('settings.integrator.err401Desc') as string)}
                 </p>
              </div>
              <div className="p-6 rounded-2xl bg-bg-panel/40 border-2 border-border-primary/10 transition-all hover:bg-bg-panel/60">
                 <h5 className="text-[11px] font-black text-foreground-primary mb-3 flex items-center gap-3 uppercase tracking-widest">
                   <Globe size={16} className="text-accent-amber" /> {(t('settings.integrator.errTimeoutTitle') as string)}
                 </h5>
                 <p className="text-[10px] text-foreground-tertiary font-bold leading-relaxed uppercase tracking-tight">
                    {(t('settings.integrator.errTimeoutDesc') as string)}
                 </p>
              </div>
           </div>
        </section>

        <div className="flex items-center justify-center pt-12">
          <a 
            href="https://github.com/Dinas-Kominfo-Kota-Tangerang/wazuh-opencti-integrators" 
            target="_blank" 
            rel="noopener noreferrer"
            className="group flex items-center gap-4 px-10 py-5 rounded-[2rem] bg-accent-cyan hover:bg-accent-cyan/90 text-background-main font-black transition-all shadow-xl shadow-accent-cyan/20 active:scale-95"
          >
            <Terminal size={20} strokeWidth={3} />
            <span className="text-xs uppercase tracking-[0.2em]">{(t('settings.fullIntegratorScript') as string)}</span>
            <ExternalLink size={18} className="opacity-50 group-hover:opacity-100 group-hover:translate-x-1 group-hover:-translate-y-1 transition-all" />
          </a>
        </div>
      </div>
    </div>
  );
}
