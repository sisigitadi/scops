import React, { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Cpu, 
  Plus, 
  Play, 
  ShieldCheck, 
  Zap, 
  Trash2, 
  CheckCircle2, 
  AlertTriangle, 
  Send, 
  Clock, 
  ToggleLeft, 
  ToggleRight,
  Sparkles,
  Filter,
  X,
  FileCheck,
  ChevronRight
} from 'lucide-react';
import { useAlertData } from '../context/AlertDataContext';
import { useOperations } from '../context/OperationsContext';
import { useLanguage } from '../context/LanguageContext';
import { useToast } from '../context/ToastContext';
import { StaggerGroup, StaggerItem } from '../components/common/StaggerFadeIn';
import InfoTooltip from '../components/common/InfoTooltip';

export interface AutomationRule {
  id: string;
  name: string;
  description: string;
  enabled: boolean;
  condition: {
    field: 'severity' | 'ruleId' | 'category' | 'srcIp' | 'description';
    operator: 'equals' | 'contains' | 'in';
    value: string;
  };
  action: {
    type: 'auto_fp' | 'auto_escalate' | 'auto_tag' | 'send_telegram';
    param?: string;
  };
  triggerCount: number;
  lastTriggered?: string;
}

const DEFAULT_RULES: AutomationRule[] = [
  {
    id: 'rule-01',
    name: 'Auto-Suppress Internal Scanner Noise',
    description: 'Automatically marks alerts from internal vulnerability scanner IP 10.0.0.99 as False Positive.',
    enabled: true,
    condition: { field: 'srcIp', operator: 'equals', value: '10.0.0.99' },
    action: { type: 'auto_fp', param: 'Whitelisted internal scanner' },
    triggerCount: 34,
    lastTriggered: '2026-08-30 14:12'
  },
  {
    id: 'rule-02',
    name: 'Auto-Escalate Critical Ransomware Artifacts',
    description: 'Immediately escalates alerts containing ransomware indicators to high-priority incident status.',
    enabled: true,
    condition: { field: 'description', operator: 'contains', value: 'ransomware' },
    action: { type: 'auto_escalate', param: 'Priority P1 Incident' },
    triggerCount: 8,
    lastTriggered: '2026-08-30 12:45'
  },
  {
    id: 'rule-03',
    name: 'Auto-Tag SSH Distributed Brute Force',
    description: 'Assigns category "BRUTE_FORCE_CAMPAIGN" for Wazuh rule IDs 5710 and 5716.',
    enabled: true,
    condition: { field: 'ruleId', operator: 'in', value: '5710, 5716' },
    action: { type: 'auto_tag', param: 'BRUTE_FORCE_CAMPAIGN' },
    triggerCount: 112,
    lastTriggered: '2026-08-30 15:02'
  },
  {
    id: 'rule-04',
    name: 'Critical Telegram Dispatcher',
    description: 'Pushes high-urgency notifications to the on-duty SOC Telegram group for Critical severity alerts.',
    enabled: true,
    condition: { field: 'severity', operator: 'equals', value: 'critical' },
    action: { type: 'send_telegram', param: 'SOC Telegram Bridge' },
    triggerCount: 47,
    lastTriggered: '2026-08-30 14:50'
  }
];

export default function AutomationPage() {
  const { alerts, updateMultipleAlerts } = useAlertData();
  const { trackActivity } = useOperations();
  const { language, t } = useLanguage();
  const { showToast } = useToast();

  const [rules, setRules] = useState<AutomationRule[]>(() => {
    const saved = localStorage.getItem('socops_automation_rules');
    return saved ? JSON.parse(saved) : DEFAULT_RULES;
  });

  const [isCreating, setIsCreating] = useState(false);
  const [simulationResults, setSimulationResults] = useState<{
    testedCount: number;
    matchedAlerts: number;
    actionsExecuted: Record<string, number>;
  } | null>(null);

  useEffect(() => {
    localStorage.setItem('socops_automation_rules', JSON.stringify(rules));
  }, [rules]);

  // Form State
  const [newRuleName, setNewRuleName] = useState('');
  const [newRuleDesc, setNewRuleDesc] = useState('');
  const [newConditionField, setNewConditionField] = useState<AutomationRule['condition']['field']>('category');
  const [newConditionOp, setNewConditionOp] = useState<AutomationRule['condition']['operator']>('contains');
  const [newConditionVal, setNewConditionVal] = useState('');
  const [newActionType, setNewActionType] = useState<AutomationRule['action']['type']>('auto_tag');
  const [newActionParam, setNewActionParam] = useState('');

  const toggleRule = (id: string) => {
    setRules(prev => prev.map(r => {
      if (r.id === id) {
        const next = !r.enabled;
        trackActivity('AUTOMATION_TOGGLE', `Rule "${r.name}" set to ${next ? 'ACTIVE' : 'PAUSED'}`);
        return { ...r, enabled: next };
      }
      return r;
    }));
  };

  const deleteRule = (id: string) => {
    setRules(prev => prev.filter(r => r.id !== id));
    showToast('Rule deleted successfully.');
  };

  const handleCreateRule = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRuleName.trim() || !newConditionVal.trim()) {
      showToast('Please fill all required rule fields.');
      return;
    }

    const created: AutomationRule = {
      id: `rule-${Date.now().toString().slice(-4)}`,
      name: newRuleName.trim(),
      description: newRuleDesc.trim() || 'Custom SOC Automation Rule',
      enabled: true,
      condition: {
        field: newConditionField,
        operator: newConditionOp,
        value: newConditionVal.trim()
      },
      action: {
        type: newActionType,
        param: newActionParam.trim() || undefined
      },
      triggerCount: 0
    };

    setRules(prev => [created, ...prev]);
    setIsCreating(false);
    setNewRuleName('');
    setNewRuleDesc('');
    setNewConditionVal('');
    setNewActionParam('');
    trackActivity('AUTOMATION_CREATE', `Created rule "${created.name}"`);
    showToast('Automation rule deployed successfully.');
  };

  // Run batch simulation over active alerts
  const handleRunSimulation = () => {
    const activeRules = rules.filter(r => r.enabled);
    let matchedCount = 0;
    const actions: Record<string, number> = {
      auto_fp: 0,
      auto_escalate: 0,
      auto_tag: 0,
      send_telegram: 0
    };

    alerts.forEach(alert => {
      activeRules.forEach(rule => {
        let isMatch = false;
        const fieldValue = String(
          rule.condition.field === 'srcIp' ? alert.srcIp || '' :
          rule.condition.field === 'ruleId' ? alert.ruleId || '' :
          rule.condition.field === 'severity' ? alert.severity || '' :
          rule.condition.field === 'category' ? alert.category || '' :
          alert.description || ''
        ).toLowerCase();

        const target = rule.condition.value.toLowerCase();

        if (rule.condition.operator === 'equals') isMatch = fieldValue === target;
        else if (rule.condition.operator === 'contains') isMatch = fieldValue.includes(target);
        else if (rule.condition.operator === 'in') {
          const list = target.split(',').map(s => s.trim());
          isMatch = list.includes(fieldValue);
        }

        if (isMatch) {
          matchedCount++;
          actions[rule.action.type] = (actions[rule.action.type] || 0) + 1;
        }
      });
    });

    setSimulationResults({
      testedCount: alerts.length,
      matchedAlerts: matchedCount,
      actionsExecuted: actions
    });

    trackActivity('AUTOMATION_SIMULATION', `Executed SOAR-lite test pass over ${alerts.length} ingested alerts.`);
    showToast(`Simulation completed: ${matchedCount} alert actions identified.`);
  };

  const totalTriggers = useMemo(() => rules.reduce((acc, curr) => acc + curr.triggerCount, 0), [rules]);

  return (
    <div className="space-y-8 max-w-[1920px] mx-auto pb-16">
      {/* Header Banner */}
      <StaggerGroup className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-slate-800/80 pb-6">
        <StaggerItem>
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-purple-950/40 border border-purple-500/30 text-purple-400 shadow-lg shadow-purple-950/30">
              <Cpu className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-black tracking-wider text-slate-100 uppercase font-sans">
                  SOAR-Lite Automation Hub
                </h1>
                <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-purple-900/50 text-purple-300 border border-purple-700/60">
                  Auto-Triage Engine
                </span>
              </div>
              <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
                {language === 'id' 
                  ? 'Otomatisasi respons alert, penandaan taktis, dan playbook mitigasi insiden garis depan.' 
                  : 'Event-driven triage automation, playbook dispatchers, and suppression rule engine.'}
              </p>
            </div>
          </div>
        </StaggerItem>

        <StaggerItem>
          <div className="flex items-center gap-3 w-full md:w-auto">
            <button
              onClick={handleRunSimulation}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 text-xs font-mono transition-all shadow-sm"
            >
              <Play className="w-3.5 h-3.5 text-cyan-400 fill-cyan-400" />
              <span>Jalankan Simulasi Test</span>
            </button>

            <button
              onClick={() => setIsCreating(true)}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold font-sans transition-all shadow-lg shadow-purple-950/50"
            >
              <Plus className="w-4 h-4" />
              <span>Buat Aturan Baru</span>
            </button>
          </div>
        </StaggerItem>
      </StaggerGroup>

      {/* KPI Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 rounded-xl bg-slate-900/50 border border-slate-800/80 flex items-center justify-between">
          <div>
            <div className="text-[11px] font-mono text-slate-400 uppercase tracking-wider">Aturan Aktif</div>
            <div className="text-2xl font-black font-mono text-slate-100 mt-1">
              {rules.filter(r => r.enabled).length} <span className="text-sm font-normal text-slate-500">/ {rules.length}</span>
            </div>
          </div>
          <div className="p-3 rounded-xl bg-purple-950/40 border border-purple-800/40 text-purple-400">
            <Zap className="w-5 h-5" />
          </div>
        </div>

        <div className="p-4 rounded-xl bg-slate-900/50 border border-slate-800/80 flex items-center justify-between">
          <div>
            <div className="text-[11px] font-mono text-slate-400 uppercase tracking-wider">Total Eksekusi Trigger</div>
            <div className="text-2xl font-black font-mono text-cyan-400 mt-1">
              {totalTriggers.toLocaleString()}
            </div>
          </div>
          <div className="p-3 rounded-xl bg-cyan-950/40 border border-cyan-800/40 text-cyan-400">
            <CheckCircle2 className="w-5 h-5" />
          </div>
        </div>

        <div className="p-4 rounded-xl bg-slate-900/50 border border-slate-800/80 flex items-center justify-between">
          <div>
            <div className="text-[11px] font-mono text-slate-400 uppercase tracking-wider">Efisiensi Triage Otomatis</div>
            <div className="text-2xl font-black font-mono text-emerald-400 mt-1">
              88.4%
            </div>
          </div>
          <div className="p-3 rounded-xl bg-emerald-950/40 border border-emerald-800/40 text-emerald-400">
            <ShieldCheck className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Simulation Results Banner */}
      {simulationResults && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-5 rounded-2xl bg-slate-900 border border-cyan-500/40 shadow-xl space-y-3"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-cyan-400 font-bold text-sm">
              <Sparkles className="w-4 h-4" />
              <span>Hasil Uji Simulasi Playbook ({simulationResults.testedCount} Alerts Dianalisis)</span>
            </div>
            <button onClick={() => setSimulationResults(null)} className="text-slate-500 hover:text-slate-300">
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-mono">
            <div className="p-3 rounded-lg bg-slate-950 border border-slate-800">
              <span className="text-slate-500 block">Auto-Suppress FP:</span>
              <strong className="text-slate-200 text-sm">{simulationResults.actionsExecuted.auto_fp || 0} alerts</strong>
            </div>
            <div className="p-3 rounded-lg bg-slate-950 border border-slate-800">
              <span className="text-slate-500 block">Auto-Escalate Incident:</span>
              <strong className="text-rose-400 text-sm">{simulationResults.actionsExecuted.auto_escalate || 0} alerts</strong>
            </div>
            <div className="p-3 rounded-lg bg-slate-950 border border-slate-800">
              <span className="text-slate-500 block">Auto-Categorize Tag:</span>
              <strong className="text-purple-400 text-sm">{simulationResults.actionsExecuted.auto_tag || 0} alerts</strong>
            </div>
            <div className="p-3 rounded-lg bg-slate-950 border border-slate-800">
              <span className="text-slate-500 block">Telegram Dispatches:</span>
              <strong className="text-cyan-300 text-sm">{simulationResults.actionsExecuted.send_telegram || 0} alerts</strong>
            </div>
          </div>
        </motion.div>
      )}

      {/* Automation Rules List */}
      <div className="border border-slate-800 rounded-2xl overflow-hidden bg-slate-900/40">
        <div className="p-4 bg-slate-950/80 border-b border-slate-800 flex items-center justify-between">
          <h2 className="text-sm font-bold uppercase tracking-wider text-slate-200 flex items-center gap-2">
            <Cpu className="w-4 h-4 text-purple-400" />
            Daftar Aturan Auto-Triage & Playbook
          </h2>
          <span className="text-xs font-mono text-slate-500">{rules.length} rules configured</span>
        </div>

        <div className="divide-y divide-slate-800/60">
          {rules.map(rule => (
            <div key={rule.id} className="p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 hover:bg-slate-800/30 transition-colors">
              <div className="space-y-1.5 min-w-0 flex-1">
                <div className="flex items-center gap-3">
                  <h3 className="text-sm sm:text-base font-bold text-slate-100">
                    {rule.name}
                  </h3>
                  <span className={`text-[10px] font-mono px-2 py-0.5 rounded font-bold uppercase ${
                    rule.enabled ? 'bg-emerald-950 text-emerald-300 border border-emerald-800' : 'bg-slate-800 text-slate-500'
                  }`}>
                    {rule.enabled ? 'Active' : 'Paused'}
                  </span>
                </div>

                <p className="text-xs text-slate-400">
                  {rule.description}
                </p>

                {/* Logic Badges */}
                <div className="flex flex-wrap items-center gap-2 pt-1 text-[11px] font-mono">
                  <span className="text-slate-500">IF:</span>
                  <span className="px-2 py-0.5 rounded bg-slate-950 text-cyan-300 border border-slate-800">
                    {rule.condition.field} {rule.condition.operator} "{rule.condition.value}"
                  </span>
                  <span className="text-slate-500">THEN:</span>
                  <span className="px-2 py-0.5 rounded bg-purple-950 text-purple-300 border border-purple-800">
                    {rule.action.type.replace('_', ' ').toUpperCase()} {rule.action.param ? `(${rule.action.param})` : ''}
                  </span>
                  <span className="text-slate-500 ml-2">Triggered: <strong className="text-slate-300">{rule.triggerCount}x</strong></span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-3 shrink-0 self-end sm:self-center">
                <button
                  onClick={() => toggleRule(rule.id)}
                  className="p-2 text-slate-400 hover:text-slate-200 transition-colors"
                  title={rule.enabled ? 'Pause Rule' : 'Activate Rule'}
                >
                  {rule.enabled ? (
                    <ToggleRight className="w-6 h-6 text-emerald-400" />
                  ) : (
                    <ToggleLeft className="w-6 h-6 text-slate-600" />
                  )}
                </button>

                <button
                  onClick={() => deleteRule(rule.id)}
                  className="p-2 text-slate-500 hover:text-rose-400 hover:bg-rose-950/40 rounded-lg border border-transparent hover:border-rose-900/60 transition-all"
                  title="Hapus Aturan"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Create Rule Modal */}
      <AnimatePresence>
        {isCreating && (
          <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsCreating(false)}
              className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm"
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="relative w-full max-w-2xl bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden text-slate-100 z-10"
            >
              <form onSubmit={handleCreateRule}>
                <div className="px-6 py-4 border-b border-slate-800 bg-slate-950/80 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Cpu className="w-5 h-5 text-purple-400" />
                    <h2 className="text-base font-bold text-slate-100">Buat Aturan Otomasi Baru</h2>
                  </div>
                  <button type="button" onClick={() => setIsCreating(false)} className="text-slate-400 hover:text-slate-200">
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <div className="p-6 space-y-4 text-xs font-mono max-h-[70vh] overflow-y-auto">
                  <div>
                    <label className="block text-slate-300 mb-1 font-bold">Nama Aturan</label>
                    <input
                      type="text"
                      required
                      value={newRuleName}
                      onChange={e => setNewRuleName(e.target.value)}
                      placeholder="e.g., Auto-Suppress Staging Alerts"
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-200 focus:outline-none focus:border-purple-500"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-300 mb-1 font-bold">Deskripsi Aturan</label>
                    <textarea
                      value={newRuleDesc}
                      onChange={e => setNewRuleDesc(e.target.value)}
                      placeholder="Penjelasan fungsi dan mitigasi aturan ini..."
                      rows={2}
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-200 focus:outline-none focus:border-purple-500 font-sans text-xs"
                    />
                  </div>

                  {/* Conditions */}
                  <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 space-y-3">
                    <span className="font-bold text-cyan-300 block">Kondisi Pemicu (IF)</span>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div>
                        <label className="block text-slate-400 mb-1">Field Alert</label>
                        <select
                          value={newConditionField}
                          onChange={e => setNewConditionField(e.target.value as any)}
                          className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-slate-200"
                        >
                          <option value="category">Category</option>
                          <option value="severity">Severity</option>
                          <option value="ruleId">Rule ID</option>
                          <option value="srcIp">Source IP</option>
                          <option value="description">Description</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-slate-400 mb-1">Operator</label>
                        <select
                          value={newConditionOp}
                          onChange={e => setNewConditionOp(e.target.value as any)}
                          className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-slate-200"
                        >
                          <option value="equals">Equals (==)</option>
                          <option value="contains">Contains</option>
                          <option value="in">In List (CSV)</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-slate-400 mb-1">Target Value</label>
                        <input
                          type="text"
                          required
                          value={newConditionVal}
                          onChange={e => setNewConditionVal(e.target.value)}
                          placeholder="e.g. 192.168.1.50"
                          className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-slate-200"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 space-y-3">
                    <span className="font-bold text-purple-300 block">Aksi Eksekusi (THEN)</span>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-slate-400 mb-1">Tipe Aksi</label>
                        <select
                          value={newActionType}
                          onChange={e => setNewActionType(e.target.value as any)}
                          className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-slate-200"
                        >
                          <option value="auto_tag">Auto-Tag Category</option>
                          <option value="auto_fp">Auto-Suppress False Positive</option>
                          <option value="auto_escalate">Auto-Escalate to Incident</option>
                          <option value="send_telegram">Dispatch Telegram Webhook</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-slate-400 mb-1">Parameter / Label</label>
                        <input
                          type="text"
                          value={newActionParam}
                          onChange={e => setNewActionParam(e.target.value)}
                          placeholder="e.g. TAG_SUSPICIOUS"
                          className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-slate-200"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="px-6 py-4 border-t border-slate-800 bg-slate-950/80 flex items-center justify-end gap-3 font-sans">
                  <button
                    type="button"
                    onClick={() => setIsCreating(false)}
                    className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold shadow-lg shadow-purple-950/50"
                  >
                    Simpan & Aktifkan Aturan
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
