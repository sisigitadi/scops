import React, { useState, ReactNode } from 'react';
import { formatDDMMYYYY } from '../../utils/datePulse';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Book, FileText, Search, Edit3, 
  Save, X, Clock, Shield, ChevronRight,
  ClipboardList, CheckCircle2
} from 'lucide-react';
import { useOperations } from '../../context/OperationsContext';
import { useLanguage } from '../../context/LanguageContext';

/**
 * GovernanceLibrary — SOP & Protocol Repository
 * Mission-critical hub for Standard Operating Procedures and forensic protocols, 
 * utilizing a localized, markdown-aware interface for administrative governance.
 */

export default function GovernanceLibrary() {
  const { governanceDocs, updateGovernanceDoc } = useOperations();
  const { t } = useLanguage();
  const [selectedDocId, setSelectedDocId] = useState(governanceDocs[0]?.id);
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  const selectedDoc = governanceDocs.find(d => d.id === selectedDocId);

  const handleEdit = () => {
    if (selectedDoc) {
      setEditContent(selectedDoc.content);
      setIsEditing(true);
    }
  };

  const handleSave = () => {
    if (selectedDocId) {
      updateGovernanceDoc(selectedDocId, editContent);
      setIsEditing(false);
    }
  };

  const filteredDocs = governanceDocs.filter(doc => 
    doc.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    doc.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const renderContent = (content: string): ReactNode[] => {
    return content.split('\n').map((line, i) => {
      if (line.startsWith('## ')) return <h2 key={i} className="text-xl font-bold text-foreground-primary mt-8 mb-4 border-b border-border-primary/20 pb-2">{line.replace('## ', '')}</h2>;
      if (line.startsWith('### ')) return <h3 key={i} className="text-lg font-bold text-accent-cyan mt-6 mb-3 uppercase tracking-widest">{line.replace('### ', '')}</h3>;
      if (line.startsWith('- ')) return <li key={i} className="ml-6 text-foreground-secondary mb-2 list-disc font-medium">{line.replace('- ', '')}</li>;
      if (line.startsWith('**') && line.endsWith('**')) return <p key={i} className="font-black text-foreground-primary mb-4">{line.replace(/\*\*/g, '')}</p>;
      return <p key={i} className="text-foreground-secondary leading-relaxed mb-4 font-medium">{line}</p>;
    });
  }

  return (
    <div className="flex flex-col lg:flex-row gap-8 animate-in fade-in duration-500">
      {/* Doc Roster */}
      <div className="lg:w-80 shrink-0 space-y-6">
        <div className="premium-capsule !p-6">
          <div className="relative mb-6">
             <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-foreground-tertiary" size={14} />
             <input 
               type="text"
               placeholder={(t('management.sop.searchDocs') as string)}
               value={searchTerm}
               onChange={(e) => setSearchTerm(e.target.value)}
               className="premium-input w-full !pl-10 !py-3 text-[10px] bg-bg-panel/40 font-black tracking-widest"
             />
          </div>

          <div className="space-y-2">
            {filteredDocs.map(doc => (
              <button
                key={doc.id}
                onClick={() => { setSelectedDocId(doc.id); setIsEditing(false); }}
                className={`w-full flex items-center gap-4 p-4 rounded-2xl border transition-all text-left group ${selectedDocId === doc.id ? 'bg-accent-cyan/10 border-accent-cyan text-accent-cyan shadow-lg shadow-accent-cyan/10' : 'bg-bg-panel/20 border-border-primary/10 text-foreground-tertiary hover:border-accent-cyan/40 hover:text-foreground-primary'}`}
              >
                <div className={`p-2 rounded-xl transition-colors ${selectedDocId === doc.id ? 'bg-accent-cyan/20' : 'bg-bg-panel group-hover:bg-accent-cyan/10 group-hover:text-accent-cyan'}`}>
                   {doc.category === 'PROCEDURE' ? <ClipboardList size={16} /> : <Shield size={16} />}
                </div>
                <div className="min-w-0">
                   <p className="text-[10px] font-black uppercase tracking-tight truncate">{doc.title}</p>
                   <p className="text-[8px] font-bold opacity-60 uppercase tracking-widest mt-0.5">{(t(`management.sop.categories.${doc.category}`) as string) || doc.category}</p>
                </div>
                <ChevronRight size={14} className={`ml-auto transition-transform ${selectedDocId === doc.id ? 'rotate-90' : 'group-hover:translate-x-1'}`} />
              </button>
            ))}
          </div>
        </div>

        <div className="p-6 rounded-[2rem] bg-accent-amber/5 border border-accent-amber/20 overflow-hidden relative">
           <div className="flex items-center gap-3 mb-2">
              <Shield size={16} className="text-accent-amber" />
              <span className="text-[10px] font-black text-accent-amber uppercase tracking-widest">{(t('management.sop.complianceStatus') as string)}</span>
           </div>
           <p className="text-[9px] font-bold text-foreground-secondary uppercase leading-relaxed opacity-70">
              {(t('management.sop.complianceDesc') as string)}
           </p>
           <CheckCircle2 size={60} className="absolute -right-4 -bottom-4 text-accent-amber opacity-5" />
        </div>
      </div>

      {/* Protocol Interface */}
      <div className="flex-1 min-w-0">
        <AnimatePresence mode="wait">
          <motion.div
            key={selectedDocId + String(isEditing)}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="premium-capsule p-8 sm:p-12 min-h-[700px] relative"
          >
            {selectedDoc ? (
              <>
                <div className="flex flex-col md:flex-row justify-between items-start gap-4 mb-10 pb-8 border-b border-border-primary/20">
                   <div>
                      <div className="flex items-center gap-3 mb-2">
                         <span className="px-3 py-1 rounded-md bg-accent-cyan/10 border border-accent-cyan/20 text-accent-cyan text-[9px] font-black tracking-widest uppercase">
                           {(t(`management.sop.categories.${selectedDoc.category}`) as string) || selectedDoc.category}
                         </span>
                         <div className="flex items-center gap-2 text-foreground-tertiary text-[9px] font-bold">
                            <Clock size={12} />
                             {(t('management.sop.lastUpdated') as string)}: {formatDDMMYYYY(selectedDoc.lastUpdated)}
                         </div>
                      </div>
                      <h2 className="text-3xl font-black text-foreground-primary tracking-tight uppercase">{selectedDoc.title}</h2>
                   </div>

                   <div className="flex items-center gap-3">
                      {isEditing ? (
                        <>
                           <button onClick={() => setIsEditing(false)} className="premium-button !py-2.5 !px-5 !text-[10px] !border-border-primary/40 text-foreground-tertiary">
                              <X size={14} className="mr-2" /> {(t('management.sop.discard') as string)}
                           </button>
                           <button onClick={handleSave} className="premium-button !py-2.5 !px-8 !text-[10px] !bg-status-success-bg/20 !text-status-success-text !border-status-success-border/40">
                              <Save size={14} className="mr-2" /> {(t('management.sop.saveProtocol') as string)}
                           </button>
                        </>
                      ) : (
                        <button onClick={handleEdit} className="premium-button !py-2.5 !px-8 !text-[10px] !bg-accent-cyan !text-foreground-inverse !border-none">
                           <Edit3 size={14} className="mr-2" /> {(t('management.sop.editProtocol') as string)}
                        </button>
                      )}
                   </div>
                </div>

                <div className="relative">
                   {isEditing ? (
                     <textarea
                       className="premium-input w-full min-h-[500px] bg-bg-panel/40 font-mono text-sm leading-relaxed !p-8 focus:border-accent-cyan transition-all"
                       value={editContent}
                       onChange={(e) => setEditContent(e.target.value)}
                       placeholder={(t('management.sop.markdownPlaceholder') as string)}
                     />
                   ) : (
                     <div className="prose-like max-w-none">
                        {renderContent(selectedDoc.content)}
                     </div>
                   )}
                </div>
              </>
            ) : (
              <div className="py-40 text-center opacity-30">
                 <Book size={48} className="mx-auto mb-4" />
                 <p className="text-[10px] font-black uppercase tracking-widest">{(t('management.sop.selectProtocol') as string)}</p>
              </div>
            )}

            <div className="absolute right-10 bottom-10 p-6 opacity-[0.03] pointer-events-none">
                <FileText size={200} />
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
