/**
 * Graph Utilities for Neural Network Visualization
 * Creates connections between tasks based on semantic similarity
 */

export const NLPUtils = {
  extractKeywords(text) {
    if (!text) return [];
    
    const stopWords = new Set([
      'a', 'an', 'the', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by',
      'study', 'learn', 'practice', 'review', 'read', 'write', 'create', 'build', 'make', 'do'
    ]);
    
    return text
      .toLowerCase()
      .replace(/[^\w\s]/g, '')
      .split(/\s+/)
      .filter(word => 
        word.length > 2 && 
        !stopWords.has(word) &&
        !/\d/.test(word)
      );
  },

  calculateSimilarity(title1, title2) {
    const keywords1 = new Set(this.extractKeywords(title1));
    const keywords2 = new Set(this.extractKeywords(title2));
    
    if (keywords1.size === 0 || keywords2.size === 0) return 0;
    
    const intersection = new Set([...keywords1].filter(x => keywords2.has(x)));
    const union = new Set([...keywords1, ...keywords2]);
    
    return intersection.size / union.size;
  },

  findCommonTopics(tasks) {
    if (!Array.isArray(tasks)) return [];
    
    const topicFrequency = {};
    
    tasks.forEach(task => {
      const keywords = this.extractKeywords(task.title);
      keywords.forEach(keyword => {
        topicFrequency[keyword] = (topicFrequency[keyword] || 0) + 1;
      });
    });
    
    return Object.entries(topicFrequency)
      .filter(([_, count]) => count >= 2)
      .sort((a, b) => b[1] - a[1])
      .map(([topic]) => topic);
  }
};

export const GraphLayout = {
  FORCE_CONFIG: {
    charge: { strength: -30, distanceMin: 1, distanceMax: 200 },
    link: { distance: 50, strength: 0.1 },
    center: { strength: 0.1 }
  },

  calculateCircularLayout(nodes, centerX, centerY, radius) {
    const angleStep = (2 * Math.PI) / nodes.length;
    return nodes.map((node, index) => ({
      ...node,
      x: centerX + radius * Math.cos(index * angleStep),
      y: centerY + radius * Math.sin(index * angleStep),
      vx: 0, vy: 0
    }));
  },

  calculateHierarchicalLayout(tasks, width, height) {
    if (!Array.isArray(tasks)) return [];
    const completedTasks = tasks.filter(task => task.completed);
    const pendingTasks = tasks.filter(task => !task.completed);
    
    const completedNodes = completedTasks.map((task, index) => ({
      ...task,
      x: width * 0.25,
      y: (height / (completedTasks.length + 1)) * (index + 1),
      group: 'completed'
    }));
    
    const pendingNodes = pendingTasks.map((task, index) => ({
      ...task,
      x: width * 0.75,
      y: (height / (pendingTasks.length + 1)) * (index + 1),
      group: 'pending'
    }));
    
    return [...completedNodes, ...pendingNodes];
  }
};

export const GraphDataGenerator = {
  tasksToGraphData(tasks, similarityThreshold = 0.3) {
    // --- CORREÇÃO: Validação de Segurança ---
    if (!Array.isArray(tasks) || tasks.length === 0) {
      return { nodes: [], links: [] };
    }

    const nodes = tasks.map((task, index) => ({
      id: task.id,
      title: task.title,
      completed: task.completed,
      priority: task.priority || 'medium',
      createdAt: task.created_at || task.createdAt,
      val: task.completed ? 3 : 5,
      color: task.completed ? '#10b981' : '#8b5cf6',
      group: task.completed ? 'completed' : 'pending'
    }));

    const links = [];
    const processedPairs = new Set();

    for (let i = 0; i < tasks.length; i++) {
      for (let j = i + 1; j < tasks.length; j++) {
        const pairKey = `${Math.min(i, j)}-${Math.max(i, j)}`;
        
        if (!processedPairs.has(pairKey)) {
          const similarity = NLPUtils.calculateSimilarity(tasks[i].title, tasks[j].title);
          
          if (similarity >= similarityThreshold) {
            links.push({
              source: tasks[i].id,
              target: tasks[j].id,
              value: similarity,
              strength: similarity,
              color: `rgba(139, 92, 246, ${0.3 + similarity * 0.7})`,
              width: 1 + similarity * 2
            });
          }
          processedPairs.add(pairKey);
        }
      }
    }

    return { nodes, links };
  },

  tasksToClusteredGraphData(tasks, similarityThreshold = 0.2) {
    const baseGraph = this.tasksToGraphData(tasks, similarityThreshold);
    const topics = NLPUtils.findCommonTopics(tasks);
    
    const topicNodes = topics.map((topic, index) => ({
      id: `topic-${topic}`,
      title: topic,
      isTopic: true,
      val: 8,
      color: '#ec4899',
      group: 'topic'
    }));

    const topicLinks = [];
    if (Array.isArray(tasks)) {
        tasks.forEach(task => {
        const taskKeywords = new Set(NLPUtils.extractKeywords(task.title));
        topics.forEach(topic => {
            if (taskKeywords.has(topic)) {
            topicLinks.push({
                source: task.id,
                target: `topic-${topic}`,
                value: 0.5,
                color: 'rgba(236, 72, 153, 0.4)',
                width: 1,
                isTopicLink: true
            });
            }
        });
        });
    }

    return {
      nodes: [...baseGraph.nodes, ...topicNodes],
      links: [...baseGraph.links, ...topicLinks]
    };
  },

  generateSampleGraphData() {
    const sampleTasks = [
      { id: 1, title: 'Study React Hooks', completed: false },
      { id: 2, title: 'Practice Python', completed: true }
    ];
    return this.tasksToClusteredGraphData(sampleTasks, 0.1);
  }
};

export const GraphInteractions = {
  getConnectedNodes(nodeId, links, includeSelf = true) {
    const connected = new Set();
    if (includeSelf) connected.add(nodeId);

    links.forEach(link => {
      if (link.source.id === nodeId || link.source === nodeId) connected.add(link.target.id || link.target);
      if (link.target.id === nodeId || link.target === nodeId) connected.add(link.source.id || link.source);
    });

    return Array.from(connected);
  },

  filterGraphData(graphData, searchTerm) {
    if (!searchTerm) return graphData;

    const searchLower = searchTerm.toLowerCase();
    const matchingNodeIds = new Set();

    graphData.nodes.forEach(node => {
      if (node.title.toLowerCase().includes(searchLower)) matchingNodeIds.add(node.id);
    });

    const connectedNodes = new Set(matchingNodeIds);
    graphData.links.forEach(link => {
      const sourceId = link.source.id || link.source;
      const targetId = link.target.id || link.target;
      if (matchingNodeIds.has(sourceId)) connectedNodes.add(targetId);
      if (matchingNodeIds.has(targetId)) connectedNodes.add(sourceId);
    });

    const filteredNodes = graphData.nodes.filter(node => connectedNodes.has(node.id));
    const filteredLinks = graphData.links.filter(link => {
      const sourceId = link.source.id || link.source;
      const targetId = link.target.id || link.target;
      return connectedNodes.has(sourceId) && connectedNodes.has(targetId);
    });

    return { nodes: filteredNodes, links: filteredLinks };
  },

  calculateGraphStats(graphData) {
    if (!graphData || !graphData.nodes) return { totalNodes: 0, totalLinks: 0, completedNodes: 0, topicNodes: 0, averageConnections: 0 };
    
    const stats = {
      totalNodes: graphData.nodes.length,
      totalLinks: graphData.links.length,
      completedNodes: graphData.nodes.filter(node => node.completed).length,
      topicNodes: graphData.nodes.filter(node => node.isTopic).length,
      averageConnections: graphData.links.length / Math.max(graphData.nodes.length, 1),
      connectivity: (2 * graphData.links.length) / Math.max(graphData.nodes.length * (graphData.nodes.length - 1), 1)
    };
    return stats;
  }
};

export const ForceSimulation = {
  boundingBoxForce(width, height, padding = 50) {
    return (alpha) => {
      return (node) => {
        node.x = Math.max(padding, Math.min(width - padding, node.x));
        node.y = Math.max(padding, Math.min(height - padding, node.y));
      };
    };
  },

  clusterForce(nodes, strength = 0.1) {
    const clusters = {};
    nodes.forEach(node => {
      if (node.group && node.group !== 'topic') {
        if (!clusters[node.group]) clusters[node.group] = { x: 0, y: 0, count: 0 };
        clusters[node.group].x += node.x;
        clusters[node.group].y += node.y;
        clusters[node.group].count += 1;
      }
    });

    Object.keys(clusters).forEach(group => {
      clusters[group].x /= clusters[group].count;
      clusters[group].y /= clusters[group].count;
    });

    return (alpha) => {
      return (node) => {
        if (node.group && node.group !== 'topic' && clusters[node.group]) {
          const cluster = clusters[node.group];
          node.vx += (cluster.x - node.x) * strength * alpha;
          node.vy += (cluster.y - node.y) * strength * alpha;
        }
      };
    };
  }
};

export default {
  NLPUtils,
  GraphLayout,
  GraphDataGenerator,
  GraphInteractions,
  ForceSimulation
};