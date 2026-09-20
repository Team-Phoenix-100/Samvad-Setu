import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { 
  CheckCircle2, Building2, Activity, FileCheck
} from 'lucide-react-native';
import { useTheme } from '../context/ThemeContext';

interface WorkflowTrackerProps {
  problem: any;
}

export default function WorkflowTracker({ problem }: WorkflowTrackerProps) {
  const { theme, isDarkMode } = useTheme();

  if (!problem) return null;

  // Dynamic Timeline mapping to match web
  const extendedTimeline = problem.timeline?.length > 0 ? problem.timeline.map((item: any, idx: number) => {
    let icon = FileCheck;
    let bgColor = '#3B82F6';
    let textColor = '#60A5FA';
    
    const stageLower = item.stage?.toLowerCase() || '';
    const actorLower = item.actor?.toLowerCase() || '';
    
    if (stageLower.includes('report') || actorLower === 'citizen') {
      icon = FileCheck; bgColor = '#3B82F6'; textColor = '#60A5FA';
    } else if (stageLower.includes('ai') || actorLower.includes('ai')) {
      icon = Activity; bgColor = '#E8A33D'; textColor = '#E8A33D';
    } else if (stageLower.includes('escalated') || stageLower.includes('review')) {
      icon = Building2; bgColor = '#8B5CF6'; textColor = '#A78BFA';
    } else if (stageLower.includes('resolved')) {
      icon = CheckCircle2; bgColor = '#10B981'; textColor = '#34D399';
    }

    return {
      stage: item.stage,
      timestamp: new Date(item.timestamp).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' }),
      actor: item.actor,
      icon, bgColor, textColor, active: true
    };
  }) : [
    { 
      stage: "Reported & Pending", 
      timestamp: new Date().toLocaleString(), 
      actor: "System", 
      icon: Activity, 
      bgColor: isDarkMode ? '#1D3238' : '#DDE8E7', 
      textColor: theme.subtext, 
      active: true 
    }
  ];

  return (
    <View style={[styles.container, { backgroundColor: theme.card, borderColor: theme.border }]}>
      <View style={styles.header}>
        <Activity size={20} color={theme.accent} />
        <Text style={[styles.headerTitle, { color: theme.text }]}>Resolution Tracker</Text>
      </View>

      <View style={[styles.timelineWrapper, { borderLeftColor: theme.borderSubtle }]}>
        {extendedTimeline.map((item: any, index: number) => (
          <View key={index} style={[styles.timelineNode, { opacity: item.active ? 1 : 0.4 }]}>
            {/* Timeline Icon */}
            <View style={[styles.iconCircle, { backgroundColor: item.bgColor, borderColor: theme.card }]}>
              <item.icon size={12} color={theme.card} />
            </View>
            
            {/* Content */}
            <View style={styles.nodeContent}>
              <Text style={[styles.nodeStage, { color: item.active ? theme.text : theme.subtext }]}>{item.stage}</Text>
              <Text style={[styles.nodeActor, { color: item.textColor }]}>{item.actor}</Text>
              
              <View style={[styles.timestampBadge, { backgroundColor: theme.background, borderColor: theme.borderSubtle }]}>
                <Text style={[styles.timestampText, { color: theme.subtext }]}>{item.timestamp}</Text>
              </View>
            </View>
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 20,
    borderWidth: 1,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 3,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 24,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '800',
  },
  timelineWrapper: {
    borderLeftWidth: 2,
    marginLeft: 16,
    paddingVertical: 4,
  },
  timelineNode: {
    paddingLeft: 24,
    marginBottom: 24,
    position: 'relative',
  },
  iconCircle: {
    position: 'absolute',
    left: -17,
    top: 0,
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 4,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  nodeContent: {
    marginTop: -2,
    gap: 4,
  },
  nodeStage: {
    fontSize: 14,
    fontWeight: '800',
  },
  nodeActor: {
    fontSize: 12,
    fontWeight: '600',
  },
  timestampBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
    borderWidth: 1,
    marginTop: 4,
  },
  timestampText: {
    fontSize: 10,
    fontWeight: '800',
    fontFamily: 'monospace',
  }
});
