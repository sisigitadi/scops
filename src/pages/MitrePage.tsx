import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ShieldAlert, 
  Search, 
  Filter, 
  ExternalLink, 
  ChevronRight, 
  Layers, 
  AlertTriangle, 
  Download, 
  Info,
  CheckCircle2,
  TrendingUp,
  X
} from 'lucide-react';
import { useAlertData } from '../context/AlertDataContext';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import { StaggerGroup, StaggerItem } from '../components/common/StaggerFadeIn';
import InfoTooltip from '../components/common/InfoTooltip';

/**
 * MITRE ATT&CK Tactical Framework Data
 * Complete 14 Enterprise Tactics with common detection techniques
 */
interface MitreTechnique {
  id: string;
  name: string;
  keywords: string[];
}

interface MitreTactic {
  id: string;
  name: string;
  nameId: string;
  description: string;
  techniques: MitreTechnique[];
}

const MITRE_TACTICS: MitreTactic[] = [
  {
    id: 'TA0043',
    name: 'Reconnaissance',
    nameId: 'Pengintaian',
    description: 'Gathering information to plan future adversary operations.',
    techniques: [
      { id: 'T1595', name: 'Active Scanning', keywords: ['scan', 'nmap', 'portscan', 'recon', 'probe'] },
      { id: 'T1592', name: 'Gather Host Info', keywords: ['os_fingerprint', 'system_info', 'whois'] },
      { id: 'T1589', name: 'Gather Victim Identity', keywords: ['email_harvest', 'phish_recon'] }
    ]
  },
  {
    id: 'TA0042',
    name: 'Resource Development',
    nameId: 'Pengembangan Sumber Daya',
    description: 'Establishing resources to support operations.',
    techniques: [
      { id: 'T1583', name: 'Acquire Infrastructure', keywords: ['c2_setup', 'domain_reg', 'vps_rent'] },
      { id: 'T1588', name: 'Obtain Capabilities', keywords: ['exploit_kit', 'malware_buy', 'tool_dl'] }
    ]
  },
  {
    id: 'TA0001',
    name: 'Initial Access',
    nameId: 'Akses Awal',
    description: 'Vectors used to gain an initial foothold within a network.',
    techniques: [
      { id: 'T1190', name: 'Exploit Public App', keywords: ['web_attack', 'sql_injection', 'rce', 'cve', 'xss', 'http_flood', 'apache', 'nginx'] },
      { id: 'T1566', name: 'Phishing', keywords: ['phish', 'spearphish', 'attachment', 'malicious_link'] },
      { id: 'T1078', name: 'Valid Accounts', keywords: ['login_anomaly', 'default_credential', 'stolen_creds'] },
      { id: 'T1133', name: 'External Remote Svcs', keywords: ['vpn_breach', 'rdp_exposed', 'ssh_direct'] }
    ]
  },
  {
    id: 'TA0002',
    name: 'Execution',
    nameId: 'Eksekusi',
    description: 'Running adversary-controlled code on a local or remote system.',
    techniques: [
      { id: 'T1059', name: 'Command & Scripting', keywords: ['powershell', 'bash', 'cmd', 'sh', 'script', 'python_exec'] },
      { id: 'T1204', name: 'User Execution', keywords: ['payload_click', 'binary_launch', 'doc_macro'] },
      { id: 'T1053', name: 'Scheduled Task/Job', keywords: ['cron', 'schtasks', 'systemd_timer', 'at_job'] }
    ]
  },
  {
    id: 'TA0003',
    name: 'Persistence',
    nameId: 'Persistensi',
    description: 'Adversary maintaining access across restarts or credential changes.',
    techniques: [
      { id: 'T1547', name: 'Boot or Logon Autostart', keywords: ['registry_run', 'startup_folder', 'init_script'] },
      { id: 'T1136', name: 'Create Account', keywords: ['useradd', 'net_user_add', 'backdoor_user'] },
      { id: 'T1543', name: 'Create/Modify System Process', keywords: ['service_install', 'daemon_create', 'driver_load'] }
    ]
  },
  {
    id: 'TA0004',
    name: 'Privilege Escalation',
    nameId: 'Eskalasi Hak Akses',
    description: 'Techniques used to gain higher-level permissions on a system.',
    techniques: [
      { id: 'T1068', name: 'Exploitation for Priv Esc', keywords: ['sudo_exploit', 'kernel_exploit', 'dirty_pipe', 'uac_bypass'] },
      { id: 'T1548', name: 'Abuse Elevation Control', keywords: ['sudoers_tamper', 'setuid', 'pkexec', 'token_impersonate'] }
    ]
  },
  {
    id: 'TA0005',
    name: 'Defense Evasion',
    nameId: 'Penghindaran Deteksi',
    description: 'Avoiding detection throughout their compromise lifecycle.',
    techniques: [
      { id: 'T1070', name: 'Indicator Removal', keywords: ['log_tamper', 'log_clear', 'wevtutil', 'rm_bash_history', 'file_wipe'] },
      { id: 'T1027', name: 'Obfuscated Files', keywords: ['base64_decode', 'packer', 'xor_payload', 'encrypt_script'] },
      { id: 'T1562', name: 'Impair Defenses', keywords: ['antivirus_disabled', 'wazuh_agent_stop', 'firewall_flush', 'iptables_drop'] }
    ]
  },
  {
    id: 'TA0006',
    name: 'Credential Access',
    nameId: 'Akses Kredensial',
    description: 'Techniques for stealing credentials like passwords and hashes.',
    techniques: [
      { id: 'T1110', name: 'Brute Force', keywords: ['brute_force', 'password_guess', 'auth_failed', 'sshd_failed', 'login_failure', '5710', '5716'] },
      { id: 'T1003', name: 'OS Credential Dumping', keywords: ['mimikatz', 'lsass', 'sam_dump', 'shadow_copy', 'etc_shadow'] },
      { id: 'T1555', name: 'Credentials from Store', keywords: ['vault_steal', 'browser_passwords', 'keyring'] }
    ]
  },
  {
    id: 'TA0007',
    name: 'Discovery',
    nameId: 'Penemuan Jaringan',
    description: 'Gaining knowledge about the system and internal network.',
    techniques: [
      { id: 'T1087', name: 'Account Discovery', keywords: ['whoami', 'id_enum', 'net_group', 'ldap_query'] },
      { id: 'T1046', name: 'Network Service Discovery', keywords: ['arp_scan', 'netstat', 'port_enum', 'internal_scan'] },
      { id: 'T1082', name: 'System Info Discovery', keywords: ['uname', 'systeminfo', 'hostname_query'] }
    ]
  },
  {
    id: 'TA0008',
    name: 'Lateral Movement',
    nameId: 'Pergerakan Lateral',
    description: 'Techniques that adversaries use to enter and control remote systems.',
    techniques: [
      { id: 'T1021', name: 'Remote Services', keywords: ['psexec', 'ssh_hop', 'wmi_exec', 'winrm', 'smb_exec'] },
      { id: 'T1550', name: 'Use Alternate Auth Material', keywords: ['pass_the_hash', 'pass_the_ticket', 'kerberos_forge'] }
    ]
  },
  {
    id: 'TA0009',
    name: 'Collection',
    nameId: 'Pengumpulan Data',
    description: 'Techniques to identify and gather information like sensitive files.',
    techniques: [
      { id: 'T1005', name: 'Data from Local System', keywords: ['file_harvest', 'sensitive_docs', 'db_dump'] },
      { id: 'T1560', name: 'Archive Collected Data', keywords: ['tar_gz', 'zip_encrypt', 'rar_archive', '7z_compress'] }
    ]
  },
  {
    id: 'TA0011',
    name: 'Command and Control',
    nameId: 'Komando & Kendali (C2)',
    description: 'Communicating with systems under their control.',
    techniques: [
      { id: 'T1071', name: 'Application Layer Protocol', keywords: ['c2_beacon', 'dns_tunnel', 'http_c2', 'cobalt_strike', 'tor_proxy'] },
      { id: 'T1573', name: 'Encrypted Channel', keywords: ['tls_tunnel', 'custom_crypto_stream'] }
    ]
  },
  {
    id: 'TA0010',
    name: 'Exfiltration',
    nameId: 'Pencurian Data',
    description: 'Techniques that adversaries use to steal data from your network.',
    techniques: [
      { id: 'T1048', name: 'Exfiltration Over Alt Protocol', keywords: ['exfil_ftp', 'exfil_cloud', 'mega_upload', 's3_drop'] },
      { id: 'T1041', name: 'Exfiltration Over C2 Channel', keywords: ['c2_exfil', 'data_drain', 'bandwidth_spike'] }
    ]
  },
  {
    id: 'TA0040',
    name: 'Impact',
    nameId: 'Dampak Kerusakan',
    description: 'Techniques to disrupt availability or compromise data integrity.',
    techniques: [
      { id: 'T1486', name: 'Data Encrypted for Impact', keywords: ['ransomware', 'ransom_note', 'cryptolocker', 'file_locked'] },
      { id: 'T1498', name: 'Network DoS', keywords: ['ddos', 'syn_flood', 'udp_flood', 'service_unreachable'] },
      { id: 'T1485', name: 'Data Destruction', keywords: ['disk_wipe', 'rm_rf', 'mbr_corrupt'] }
    ]
  }
];

export default function MitrePage() {
  const { alerts } = useAlertData();
  const { language, t } = useLanguage();
  const { appBasePath } = useAuth();
  const navigate = useNavigate();

  const [search, setSearch] = useState('');
  const [selectedTactic, setSelectedTactic] = useState<MitreTactic | null>(null);
  const [selectedTechnique, setSelectedTechnique] = useState<{ tactic: MitreTactic; technique: MitreTechnique } | null>(null);

  // Match alerts to MITRE techniques
  const matrixStats = useMemo(() => {
    const hitsByTechnique: Record<string, typeof alerts> = {};
    const hitsByTactic: Record<string, number> = {};

    MITRE_TACTICS.forEach(tactic => {
      let tacticTotal = 0;
      tactic.techniques.forEach(tech => {
        const matchingAlerts = alerts.filter(alert => {
          const raw = `${alert.ruleId || ''} ${alert.category || ''} ${alert.description || ''} ${alert.fullLog || ''}`.toLowerCase();
          return tech.keywords.some(kw => raw.includes(kw.toLowerCase()));
        });
        hitsByTechnique[tech.id] = matchingAlerts;
        tacticTotal += matchingAlerts.length;
      });
      hitsByTactic[tactic.id] = tacticTotal;
    });

    const totalMapped = Object.values(hitsByTechnique).reduce((acc, curr) => acc + curr.length, 0);

    return { hitsByTechnique, hitsByTactic, totalMapped };
  }, [alerts]);

  const activeTechniqueAlerts = useMemo(() => {
    if (!selectedTechnique) return [];
    return matrixStats.hitsByTechnique[selectedTechnique.technique.id] || [];
  }, [selectedTechnique, matrixStats]);

  const getHeatmapColor = (count: number) => {
    if (count === 0) return 'bg-slate-900/60 border-slate-800 text-slate-500 hover:border-slate-700';
    if (count <= 5) return 'bg-cyan-950/40 border-cyan-800/60 text-cyan-300 hover:bg-cyan-900/50 hover:border-cyan-500 shadow-sm shadow-cyan-950';
    if (count <= 25) return 'bg-amber-950/50 border-amber-700/60 text-amber-300 hover:bg-amber-900/60 hover:border-amber-500 shadow-md shadow-amber-950';
    return 'bg-rose-950/60 border-rose-600/70 text-rose-200 hover:bg-rose-900/70 hover:border-rose-400 shadow-lg shadow-rose-950 animate-pulse';
  };

  return (
    <div className="space-y-8 max-w-[1920px] mx-auto pb-16">
      {/* Header Banner */}
      <StaggerGroup className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-slate-800/80 pb-6">
        <StaggerItem>
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-red-950/40 border border-red-500/30 text-red-400 shadow-lg shadow-red-950/30">
              <ShieldAlert className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-black tracking-wider text-slate-100 uppercase font-sans">
                  MITRE ATT&CK Matrix Hub
                </h1>
                <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-red-900/50 text-red-300 border border-red-700/60">
                  Enterprise Framework
                </span>
              </div>
              <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
                {language === 'id' 
                  ? 'Pemetaan korelasi taktis alert keamanan terhadap 14 taktik serangan siber industri.' 
                  : 'Tactical threat matrix correlating ingested telemetry against 14 enterprise cyberattack tactics.'}
              </p>
            </div>
          </div>
        </StaggerItem>

        <StaggerItem>
          <div className="flex items-center gap-3 w-full md:w-auto">
            {/* Search Input */}
            <div className="relative flex-1 md:w-64">
              <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-500" />
              <input
                type="text"
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Cari taktik / teknik (T1110)..."
                className="w-full pl-9 pr-3 py-1.5 bg-slate-900 border border-slate-800 rounded-lg text-xs font-mono text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500/80"
              />
              {search && (
                <button onClick={() => setSearch('')} className="absolute right-2.5 top-2 text-slate-500 hover:text-slate-300">
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Quick Metrics */}
            <div className="hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-900/80 border border-slate-800 text-xs font-mono text-slate-300">
              <TrendingUp className="w-4 h-4 text-cyan-400" />
              <span>Mapped: <strong className="text-cyan-300">{matrixStats.totalMapped}</strong> alerts</span>
            </div>
          </div>
        </StaggerItem>
      </StaggerGroup>

      {/* Heatmap Matrix Grid */}
      <div className="overflow-x-auto pb-4 no-scrollbar">
        <div className="min-w-[1280px] grid grid-cols-14 gap-2.5">
          {MITRE_TACTICS.map((tactic, tIdx) => {
            const tacticCount = matrixStats.hitsByTactic[tactic.id] || 0;
            const isMatchSearch = !search || 
              tactic.name.toLowerCase().includes(search.toLowerCase()) || 
              tactic.techniques.some(tc => tc.name.toLowerCase().includes(search.toLowerCase()) || tc.id.toLowerCase().includes(search.toLowerCase()));

            if (!isMatchSearch) return null;

            return (
              <div 
                key={tactic.id} 
                className="flex flex-col bg-slate-900/40 border border-slate-800/80 rounded-xl overflow-hidden shadow-sm"
              >
                {/* Column Tactic Header */}
                <div className="p-2.5 bg-slate-950/80 border-b border-slate-800 text-center flex flex-col justify-between min-h-[90px]">
                  <div>
                    <span className="text-[9px] font-mono text-slate-400 block tracking-wider">{tactic.id}</span>
                    <h3 className="text-xs font-black uppercase text-slate-200 tracking-tight mt-0.5 line-clamp-2">
                      {language === 'id' ? tactic.nameId : tactic.name}
                    </h3>
                  </div>
                  <div className="mt-2 flex items-center justify-center">
                    <span className={`text-[10px] font-mono px-2 py-0.2 rounded-full font-bold ${
                      tacticCount > 0 
                        ? 'bg-cyan-900/60 text-cyan-300 border border-cyan-700/60' 
                        : 'bg-slate-800/60 text-slate-500'
                    }`}>
                      {tacticCount} {tacticCount === 1 ? 'hit' : 'hits'}
                    </span>
                  </div>
                </div>

                {/* Technique Cards */}
                <div className="p-2 flex-1 flex flex-col gap-2 bg-slate-950/20">
                  {tactic.techniques.map(tech => {
                    const hits = matrixStats.hitsByTechnique[tech.id] || [];
                    const hitCount = hits.length;
                    const isTechMatch = !search || 
                      tech.name.toLowerCase().includes(search.toLowerCase()) || 
                      tech.id.toLowerCase().includes(search.toLowerCase());

                    if (!isTechMatch) return null;

                    return (
                      <button
                        key={tech.id}
                        onClick={() => setSelectedTechnique({ tactic, technique: tech })}
                        className={`p-2 rounded-lg border text-left transition-all relative group flex flex-col justify-between min-h-[76px] ${getHeatmapColor(hitCount)}`}
                      >
                        <div>
                          <div className="flex items-center justify-between text-[9px] font-mono opacity-80 mb-1">
                            <span>{tech.id}</span>
                            {hitCount > 0 && <span className="font-bold">{hitCount}</span>}
                          </div>
                          <div className="text-[11px] font-bold leading-snug line-clamp-2">
                            {tech.name}
                          </div>
                        </div>

                        <div className="mt-1 flex items-center justify-end text-[9px] opacity-0 group-hover:opacity-100 transition-opacity">
                          <span className="flex items-center gap-0.5 text-cyan-400">
                            Detail <ChevronRight className="w-3 h-3" />
                          </span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Drill-down Drawer / Modal for Selected Technique */}
      <AnimatePresence>
        {selectedTechnique && (
          <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedTechnique(null)}
              className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm"
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="relative w-full max-w-4xl bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden text-slate-100 z-10 flex flex-col max-h-[85vh]"
            >
              {/* Modal Header */}
              <div className="px-6 py-4 border-b border-slate-800 bg-slate-950/80 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-xl bg-red-950/50 border border-red-500/40 text-red-400">
                    <ShieldAlert className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-400 border border-slate-700">
                        {selectedTechnique.tactic.id} • {selectedTechnique.tactic.name}
                      </span>
                      <span className="text-xs font-mono px-2 py-0.5 rounded bg-red-900/40 text-red-300 border border-red-800">
                        {selectedTechnique.technique.id}
                      </span>
                    </div>
                    <h2 className="text-base sm:text-lg font-bold text-slate-100 mt-1">
                      {selectedTechnique.technique.name}
                    </h2>
                  </div>
                </div>

                <button
                  onClick={() => setSelectedTechnique(null)}
                  className="p-2 rounded-lg bg-slate-800 text-slate-400 hover:text-slate-100 hover:bg-slate-700 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Modal Content */}
              <div className="p-6 overflow-y-auto space-y-6 flex-1">
                {/* Description and Keywords */}
                <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800/80 space-y-2">
                  <div className="text-xs text-slate-400 flex items-center gap-2 font-mono uppercase">
                    <Info className="w-4 h-4 text-cyan-400" />
                    <span>Taktik Deskripsi: {selectedTechnique.tactic.description}</span>
                  </div>
                  <div className="flex flex-wrap items-center gap-1.5 pt-2">
                    <span className="text-[10px] font-mono text-slate-500">Detection Matchers:</span>
                    {selectedTechnique.technique.keywords.map(kw => (
                      <span key={kw} className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-cyan-300 border border-slate-700">
                        {kw}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Matching Alerts Table */}
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-xs sm:text-sm font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
                      <AlertTriangle className="w-4 h-4 text-amber-400" />
                      Alert Terkorelasi ({activeTechniqueAlerts.length})
                    </h3>
                    {activeTechniqueAlerts.length > 0 && (
                      <button
                        onClick={() => {
                          navigate(`${appBasePath}/alerts?q=${encodeURIComponent(selectedTechnique.technique.keywords[0])}`);
                          setSelectedTechnique(null);
                        }}
                        className="text-xs text-cyan-400 hover:underline flex items-center gap-1 font-mono"
                      >
                        Buka di Register <ExternalLink className="w-3 h-3" />
                      </button>
                    )}
                  </div>

                  {activeTechniqueAlerts.length === 0 ? (
                    <div className="p-8 text-center rounded-xl bg-slate-950/40 border border-slate-800 text-slate-500 text-xs">
                      Tidak ada alert aktif yang saat ini cocok dengan pola teknik ini.
                    </div>
                  ) : (
                    <div className="border border-slate-800 rounded-xl overflow-hidden divide-y divide-slate-800/60 max-h-72 overflow-y-auto">
                      {activeTechniqueAlerts.slice(0, 15).map(alert => (
                        <div key={alert.id} className="p-3 bg-slate-950/40 flex items-center justify-between hover:bg-slate-800/40 transition-colors">
                          <div className="min-w-0 pr-4">
                            <div className="flex items-center gap-2 text-[10px] font-mono">
                              <span className="text-cyan-400 font-bold">#{alert.id.slice(0, 12)}</span>
                              <span className={`px-1.5 py-0.2 rounded font-bold uppercase ${
                                alert.severity === 'critical' ? 'bg-red-950 text-red-300 border border-red-800' :
                                alert.severity === 'high' ? 'bg-amber-950 text-amber-300 border border-amber-800' :
                                'bg-slate-800 text-slate-300'
                              }`}>
                                {alert.severity}
                              </span>
                              <span className="text-slate-400">{alert.timestamp}</span>
                            </div>
                            <div className="text-xs text-slate-200 font-medium truncate mt-1">
                              {alert.description}
                            </div>
                          </div>

                          <button
                            onClick={() => {
                              navigate(`${appBasePath}/triage?alertId=${alert.id}`);
                              setSelectedTechnique(null);
                            }}
                            className="px-2.5 py-1.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-800/60 text-[11px] font-mono hover:bg-cyan-900 shrink-0 flex items-center gap-1"
                          >
                            Triage <ChevronRight className="w-3 h-3" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Modal Footer */}
              <div className="px-6 py-3 border-t border-slate-800 bg-slate-950/80 flex items-center justify-between text-xs font-mono text-slate-400">
                <span>Enterprise Framework Matrix v14.1</span>
                <button
                  onClick={() => setSelectedTechnique(null)}
                  className="px-4 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 transition-colors font-sans font-semibold text-xs"
                >
                  Tutup
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
