import React, { useCallback, useMemo, useRef, useEffect, useState, memo } from 'react';
import ForceGraph2D, { ForceGraphMethods } from 'react-force-graph-2d';
import { Info, Maximize } from 'lucide-react';
import { Alert } from '../../context/AlertDataContext';

/**
 * CorrelationGraph — Relational Threat Visualization
 * High-fidelity orchestration plane for visualizing correlated telemetry.
 * Optimized for Stasis: Deep-memoization and simulation locking to prevent flickering/jumping.
 */

const NODE_COLORS = {
  current: '#f43f5e',
  alert: '#06b6d4',
  ip: '#f59e0b',
  rule: '#6366f1'
};

interface Node {
  id: string;
  name: string;
  val: number;
  color: string;
  type: string;
}

interface Link {
  source: string;
  target: string;
}

interface CorrelationGraphProps {
  currentAlert: Alert | null;
  allAlerts: Alert[];
}

// 1. Surgical Deep Memoization
// This prevents ANY re-render of the canvas unless the specific alert ID changes.
const CorrelationGraph = memo(({ currentAlert, allAlerts }: CorrelationGraphProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const fgRef = useRef<ForceGraphMethods>();
  const [width, setWidth] = useState(0); 

  // Memoize graph data to ensure reference stability
  const graphData = useMemo(() => {
    if (!currentAlert) return { nodes: [], links: [] };

    const nodes: any[] = [];
    const links: any[] = [];

    nodes.push({
      id: currentAlert.id,
      name: `TARGET ALERT: ${currentAlert.id}`,
      val: 20,
      color: NODE_COLORS.current,
      type: 'current'
    });

    if (currentAlert.sourceIp) {
      nodes.push({
        id: `ip-${currentAlert.sourceIp}`,
        name: `SOURCE IP: ${currentAlert.sourceIp}`,
        val: 12,
        color: NODE_COLORS.ip,
        type: 'ip'
      });
      links.push({ source: currentAlert.id, target: `ip-${currentAlert.sourceIp}` });
    }

    if (currentAlert.ruleId) {
      nodes.push({
        id: `rule-${currentAlert.ruleId}`,
        name: `RULE ID: ${currentAlert.ruleId}`,
        val: 12,
        color: NODE_COLORS.rule,
        type: 'rule'
      });
      links.push({ source: currentAlert.id, target: `rule-${currentAlert.ruleId}` });
    }

    const correlations = allAlerts
      .filter(a => a.id !== currentAlert.id)
      .filter(a => (a.sourceIp && a.sourceIp === currentAlert.sourceIp) || (a.ruleId && a.ruleId === currentAlert.ruleId))
      .slice(0, 8);

    correlations.forEach(rel => {
      nodes.push({
        id: rel.id,
        name: `CORRELATED: ${rel.id}`,
        val: 10,
        color: NODE_COLORS.alert,
        type: 'alert'
      });
      
      if (rel.sourceIp === currentAlert.sourceIp) {
        links.push({ source: `ip-${currentAlert.sourceIp}`, target: rel.id });
      }
      if (rel.ruleId === currentAlert.ruleId) {
        links.push({ source: `rule-${currentAlert.ruleId}`, target: rel.id });
      }
    });

    return { nodes, links };
  }, [currentAlert?.id, currentAlert?.sourceIp, currentAlert?.ruleId, allAlerts.length]);

  // Handle Resize without flickering
  useEffect(() => {
    if (containerRef.current) setWidth(containerRef.current.offsetWidth);
    const handleResize = () => {
      if (containerRef.current) setWidth(containerRef.current.offsetWidth);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Structural Stasis: Resume then Freeze
  useEffect(() => {
    if (!fgRef.current || !width) return;
    fgRef.current.resumeAnimation();
    const timer = setTimeout(() => {
        fgRef.current?.pauseAnimation();
    }, 2000); // 2s to settle
    return () => clearTimeout(timer);
  }, [graphData, width]);

  if (!width) return <div ref={containerRef} className="w-full h-[500px] rounded-3xl bg-bg-panel/10 animate-pulse border-2 border-border-primary/20" />;

  return (
    <div className="relative w-full rounded-3xl border-2 border-border-primary bg-bg-panel/40 backdrop-blur-3xl overflow-hidden min-h-[500px] shadow-inner-lg font-bold">
      <div className="absolute top-8 left-8 z-10 flex flex-col gap-2">
        <div className="bg-bg-panel/95 backdrop-blur-xl border border-border-secondary/40 p-5 rounded-2xl shadow-2xl">
          <h4 className="text-[10px] font-black text-foreground-tertiary mb-3 uppercase tracking-[0.2em] border-b border-border-primary/10 pb-2">
            VISUAL LEGEND
          </h4>
          <div className="space-y-2">
            <LegendItem color={NODE_COLORS.current} label="TARGET" />
            <LegendItem color={NODE_COLORS.alert} label="CORRELATED" />
            <LegendItem color={NODE_COLORS.ip} label="IP SOURCE" />
            <LegendItem color={NODE_COLORS.rule} label="RULE ID" />
          </div>
        </div>
      </div>

      <div className="absolute bottom-8 right-8 z-10">
        <button onClick={() => fgRef.current?.zoomToFit(1000, 50)} className="p-4 rounded-2xl bg-bg-panel/80 border border-border-secondary text-foreground-tertiary hover:text-accent-cyan transition-all">
          <Maximize size={20} />
        </button>
      </div>

      <ForceGraph2D
        ref={fgRef}
        width={width}
        height={500}
        graphData={graphData}
        backgroundColor="transparent"
        nodeLabel="name"
        nodeColor={d => (d as any).color}
        nodeRelSize={5}
        d3VelocityDecay={0.8}
        d3AlphaDecay={0.1}
        cooldownTicks={100}
        linkColor={() => 'rgba(var(--foreground-muted-rgb), 0.1)'}
        nodeCanvasObject={(node: any, ctx, globalScale) => {
          const isDark = document.documentElement.classList.contains('dark');
          ctx.beginPath(); 
          ctx.arc(node.x, node.y, 7/globalScale, 0, 2 * Math.PI, false); 
          ctx.fillStyle = node.color;
          ctx.fill();
          ctx.strokeStyle = isDark ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.5)';
          ctx.lineWidth = 1/globalScale;
          ctx.stroke();
          
          if (globalScale > 2) {
             ctx.font = `900 ${10/globalScale}px Inter`;
             ctx.textAlign = 'center';
             ctx.textBaseline = 'middle';
             ctx.fillStyle = isDark ? '#fff' : '#000';
             ctx.fillText(node.name.toUpperCase(), node.x, node.y + (18/globalScale));
          }
        }}
        nodeCanvasObjectMode={() => 'replace'}
      />
    </div>
  );
}, (prev, next) => {
  // TRUE STASIS: Only re-render if the Target Alert changes
  return prev.currentAlert?.id === next.currentAlert?.id && prev.allAlerts.length === next.allAlerts.length;
});

function LegendItem({ color, label }: { color: string; label: string }) {
  return (
    <div className="flex items-center gap-3 text-[9px] text-foreground-secondary font-black uppercase tracking-widest leading-none">
      <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: color }} />
      {label}
    </div>
  );
}

export default CorrelationGraph;
