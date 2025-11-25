import { useState, useCallback, useRef } from 'react';
import { motion } from 'framer-motion';
import { Search, Filter, Network } from 'lucide-react';
import ForceGraph2D from 'react-force-graph-2d';
import GlassCard from '../ui/GlassCard';
import {    
  GraphDataGenerator, 
  GraphInteractions, 
  ForceSimulation,
  GraphLayout 
} from '../../utils/graphUtils';
import { useTasks } from '../../hooks/useTasks';

const NeuralGraph = () => {
  const { tasks } = useTasks();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedNode, setSelectedNode] = useState(null);
  const [graphMode, setGraphMode] = useState('clustered'); // 'basic' or 'clustered'
  const fgRef = useRef();

  // Generate graph data based on current tasks and mode
  const graphData = graphMode === 'clustered' 
    ? GraphDataGenerator.tasksToClusteredGraphData(tasks, 0.1)
    : GraphDataGenerator.tasksToGraphData(tasks, 0.2);

  // Filter graph data based on search
  const filteredGraphData = searchTerm 
    ? GraphInteractions.filterGraphData(graphData, searchTerm)
    : graphData;

  const graphStats = GraphInteractions.calculateGraphStats(filteredGraphData);

  // Node paint function for custom rendering
  const nodeCanvasObject = useCallback((node, ctx, globalScale) => {
    const label = node.title || node.id;
    const fontSize = 12 / globalScale;
    const isSelected = selectedNode?.id === node.id;
    const isTopic = node.isTopic;
    const isCompleted = node.completed;

    // Node circle
    ctx.beginPath();
    ctx.arc(node.x, node.y, node.val, 0, 2 * Math.PI, false);
    
    // Node fill based on type and state
    if (isSelected) {
      ctx.fillStyle = '#f59e0b'; // Amber for selected
    } else if (isTopic) {
      ctx.fillStyle = node.color || '#ec4899';
    } else if (isCompleted) {
      ctx.fillStyle = node.color || '#10b981';
    } else {
      ctx.fillStyle = node.color || '#8b5cf6';
    }
    
    ctx.fill();

    // Node border/glow
    if (isSelected) {
      ctx.strokeStyle = '#f59e0b';
      ctx.lineWidth = 3 / globalScale;
      ctx.stroke();
    }

    // Node label
    if (globalScale > 0.7) {
      ctx.font = `${fontSize}px Inter, sans-serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillStyle = isSelected ? '#f59e0b' : '#ffffff';
      
      // Simple text wrapping
      const words = label.split(' ');
      const lines = [];
      let currentLine = words[0];

      for (let i = 1; i < words.length; i++) {
        const word = words[i];
        const width = ctx.measureText(currentLine + ' ' + word).width;
        if (width < node.val * 3) {
          currentLine += ' ' + word;
        } else {
          lines.push(currentLine);
          currentLine = word;
        }
      }
      lines.push(currentLine);

      // Draw lines above node
      const lineHeight = fontSize * 1.2;
      const startY = node.y - node.val - (lines.length * lineHeight) / 2;

      lines.forEach((line, i) => {
        ctx.fillText(line, node.x, startY + i * lineHeight);
      });
    }
  }, [selectedNode]);

  // Link paint function
  const linkCanvasObject = useCallback((link, ctx, globalScale) => {
    if (!link.source || !link.target) return;

    ctx.beginPath();
    ctx.moveTo(link.source.x, link.source.y);
    ctx.lineTo(link.target.x, link.target.y);
    
    ctx.strokeStyle = link.color || 'rgba(255, 255, 255, 0.2)';
    ctx.lineWidth = (link.width || 1) / globalScale;
    ctx.stroke();
  }, []);

  // Handle node click
  const handleNodeClick = useCallback((node) => {
    setSelectedNode(node);
    
    // Auto-center on node
    if (fgRef.current && node) {
      fgRef.current.centerAt(node.x, node.y, 1000);
      fgRef.current.zoom(2, 1000);
    }
  }, []);

  // Reset view
  const handleResetView = () => {
    setSelectedNode(null);
    if (fgRef.current) {
      fgRef.current.zoomToFit(400);
    }
  };

  return (
    <div className="min-h-screen p-4 pb-20 relative z-10">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-6"
      >
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">Neural Brain</h1>
            <p className="text-gray-400">Your ideas connected visually</p>
          </div>
          <motion.div 
            className="w-12 h-12 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full flex items-center justify-center"
            whileHover={{ scale: 1.1 }}
          >
            <Network className="w-6 h-6 text-white" />
          </motion.div>
        </div>

        {/* Controls */}
        <div className="flex gap-4 mb-6">
          {/* Search */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search tasks and connections..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-black/20 border border-white/10 rounded-xl pl-10 pr-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:border-purple-500/50 transition-colors"
            />
          </div>

          {/* Filter Button */}
          <motion.button
            onClick={() => setGraphMode(graphMode === 'basic' ? 'clustered' : 'basic')}
            className="px-4 bg-black/20 border border-white/10 rounded-xl text-white hover:border-purple-500/50 transition-colors flex items-center gap-2"
            whileHover={{ scale: 1.05 }}
          >
            <Filter className="w-4 h-4" />
            {graphMode === 'basic' ? 'Basic' : 'Clustered'}
          </motion.button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-4 gap-4 mb-6">
          <GlassCard className="p-3 text-center">
            <div className="text-2xl font-bold text-purple-400">{graphStats.totalNodes}</div>
            <div className="text-xs text-gray-400">Nodes</div>
          </GlassCard>
          <GlassCard className="p-3 text-center">
            <div className="text-2xl font-bold text-pink-400">{graphStats.totalLinks}</div>
            <div className="text-xs text-gray-400">Connections</div>
          </GlassCard>
          <GlassCard className="p-3 text-center">
            <div className="text-2xl font-bold text-green-400">{graphStats.completedNodes}</div>
            <div className="text-xs text-gray-400">Completed</div>
          </GlassCard>
          <GlassCard className="p-3 text-center">
            <div className="text-2xl font-bold text-blue-400">
              {graphStats.averageConnections.toFixed(1)}
            </div>
            <div className="text-xs text-gray-400">Avg Links</div>
          </GlassCard>
        </div>
      </motion.div>

      {/* Graph Visualization */}
      <GlassCard className="h-96 lg:h-[500px] relative overflow-hidden">
        {filteredGraphData.nodes.length > 0 ? (
          <>
            <ForceGraph2D
              ref={fgRef}
              graphData={filteredGraphData}
              nodeLabel={node => `${node.title}\n${node.isTopic ? 'Topic' : (node.completed ? 'Completed' : 'Pending')}`}
              nodeRelSize={6}
              linkWidth={link => link.width || 1}
              linkDirectionalParticles={2}
              linkDirectionalParticleSpeed={0.005}
              linkDirectionalParticleWidth={link => link.width || 1}
              onNodeClick={handleNodeClick}
              nodeCanvasObject={nodeCanvasObject}
              linkCanvasObject={linkCanvasObject}
              cooldownTime={Infinity}
              d3AlphaDecay={0.01}
              d3VelocityDecay={0.3}
              warmupTicks={100}
            />
            
            {/* Reset View Button */}
            {selectedNode && (
              <motion.button
                onClick={handleResetView}
                className="absolute top-4 right-4 bg-black/50 hover:bg-black/70 text-white px-3 py-2 rounded-lg border border-white/10 text-sm transition-colors"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                whileHover={{ scale: 1.05 }}
              >
                Reset View
              </motion.button>
            )}
          </>
        ) : (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <motion.div
                className="w-16 h-16 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full mx-auto mb-4"
                animate={{
                  scale: [1, 1.2, 1],
                  opacity: [0.7, 1, 0.7],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              />
              <p className="text-gray-400">No tasks to visualize</p>
              <p className="text-sm text-gray-500 mt-2">Add some tasks to see connections</p>
            </div>
          </div>
        )}
      </GlassCard>

      {/* Legend */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="mt-6 flex flex-wrap gap-4 justify-center"
      >
        <div className="flex items-center gap-2 text-sm">
          <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
          <span className="text-gray-400">Pending Tasks</span>
        </div>
        <div className="flex items-center gap-2 text-sm">
          <div className="w-3 h-3 bg-green-500 rounded-full"></div>
          <span className="text-gray-400">Completed Tasks</span>
        </div>
        <div className="flex items-center gap-2 text-sm">
          <div className="w-3 h-3 bg-pink-500 rounded-full"></div>
          <span className="text-gray-400">Topics</span>
        </div>
        <div className="flex items-center gap-2 text-sm">
          <div className="w-3 h-3 bg-amber-500 rounded-full"></div>
          <span className="text-gray-400">Selected</span>
        </div>
      </motion.div>
    </div>
  );
};

export default NeuralGraph;