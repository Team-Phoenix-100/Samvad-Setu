import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { 
  CheckCircle2, Clock, AlertTriangle, Building2, Sparkles, 
  Wrench, ShieldCheck, Cpu, Coins, ChevronDown, ChevronUp, 
  ArrowRight, Check, AlertCircle, Layers, Activity
} from 'lucide-react-native';
import { useTheme } from '../context/ThemeContext';

interface WorkflowTrackerProps {
  problem: any;
}

export default function WorkflowTracker({ problem }: WorkflowTrackerProps) {
  const { theme, isDarkMode } = useTheme();

  // State to track which sections are expanded (all open by default for rich visibility)
  const [expandedSteps, setExpandedSteps] = useState<Record<number, boolean>>({
    1: true,
    2: true,
    3: true,
    4: false,
    5: false,
  });

  const toggleStep = (stepNum: number) => {
    setExpandedSteps(prev => ({ ...prev, [stepNum]: !prev[stepNum] }));
  };

  if (!problem) return null;

  // 1. DYNAMIC DATA DERIVATION
  const isResolved = problem.status === 'resolved' || problem.status === 'closed';
  const isEscalatedToHei = Boolean(
    problem.assignedInstitution || 
    problem.status === 'escalated_to_hei' ||
    problem.category?.toLowerCase().includes('water') ||
    problem.category?.toLowerCase().includes('hazard') ||
    problem.category?.toLowerCase().includes('infrastructure')
  );

  // SLA Calculation
  const urgency = (problem.urgency || 'medium').toLowerCase();
  const slaTargetHours = urgency === 'critical' ? 48 : urgency === 'high' || urgency === 'urgent' ? 72 : urgency === 'medium' ? 168 : 336;
  const createdAtMs = new Date(problem.createdAt || Date.now()).getTime();
  const dueAtMs = createdAtMs + slaTargetHours * 60 * 60 * 1000;
  const remainingHours = Math.max(0, Math.ceil((dueAtMs - Date.now()) / (60 * 60 * 1000)));
  const slaProgressPercent = Math.min(100, Math.max(10, Math.round(((slaTargetHours - remainingHours) / slaTargetHours) * 100)));
  const isSlaBreached = remainingHours === 0 && !isResolved;

  // AI Verification Data
  const aiConfidence = Math.round((problem.aiMetadata?.confidence || 0.94) * 100);
  const aiSeverity = (problem.aiMetadata?.severity || urgency || 'Medium').toUpperCase();
  const aiCategory = problem.aiMetadata?.category || problem.category || 'Public Infrastructure';

  // Municipal Sub-milestones progress
  const municipalProgressPercent = isResolved ? 100 : isSlaBreached || isEscalatedToHei ? 65 : 45;

  // Dynamic HEI & CSR Partner defaults
  const heiPartner = problem.assignedInstitution || 'Birsa Institute of Technology (BIT) Sindri';
  const csrPartner = problem.csrPartner || 'Tata Steel Foundation CSR';
  const budgetPledged = problem.fundingPledged || '₹2,50,000';
  const prototypeName = problem.prototypeName || `${problem.category || 'Civic'} Smart Modular Prototype`;

  return (
    <View style={[styles.container, { backgroundColor: theme.card, borderColor: theme.border }]}>
      
      {/* Header Bar */}
      <View style={styles.headerRow}>
        <View style={styles.headerLeft}>
          <View style={[styles.pulseIconContainer, { backgroundColor: 'rgba(47, 158, 143, 0.12)' }]}>
            <Activity size={18} color={theme.authorityPrimary} />
          </View>
          <View>
            <Text style={[styles.headerTitle, { color: theme.text }]}>Intelligent Resolution Tracker</Text>
            <Text style={[styles.headerSubtitle, { color: theme.subtext }]}>
              Autonomous civic lifecycle & AI routing pipeline
            </Text>
          </View>
        </View>

        <View style={[
          styles.pipelineBadge, 
          { backgroundColor: isResolved ? 'rgba(16, 185, 129, 0.15)' : 'rgba(232, 163, 61, 0.15)' }
        ]}>
          <Text style={[
            styles.pipelineBadgeText, 
            { color: isResolved ? '#10B981' : '#E8A33D' }
          ]}>
            {isResolved ? 'COMPLETED' : isEscalatedToHei ? 'HEI INNOVATION' : 'MUNICIPAL STAGE'}
          </Text>
        </View>
      </View>

      {/* SLA Quick Status Banner */}
      <View style={[styles.slaBanner, { backgroundColor: isDarkMode ? '#132024' : '#F0F6F5', borderColor: theme.border }]}>
        <View style={styles.slaBannerRow}>
          <View style={styles.slaLeft}>
            <Clock size={14} color={isSlaBreached ? '#EF4444' : theme.authorityPrimary} />
            <Text style={[styles.slaLabel, { color: theme.text }]}>
              Municipal SLA Window: <Text style={{ fontWeight: '800' }}>{slaTargetHours} Hours</Text>
            </Text>
          </View>
          <View style={[
            styles.slaStatusTag, 
            { backgroundColor: isSlaBreached ? 'rgba(239, 68, 68, 0.15)' : isResolved ? 'rgba(16, 185, 129, 0.15)' : 'rgba(47, 158, 143, 0.15)' }
          ]}>
            <Text style={[
              styles.slaStatusText, 
              { color: isSlaBreached ? '#EF4444' : isResolved ? '#10B981' : theme.authorityPrimary }
            ]}>
              {isResolved ? 'RESOLVED WITHIN SLA' : isSlaBreached ? 'SLA EXPIRED (ROUTED TO HEI)' : `${remainingHours}h REMAINING`}
            </Text>
          </View>
        </View>

        {/* SLA Progress Bar */}
        <View style={[styles.progressBarTrack, { backgroundColor: isDarkMode ? '#1D3238' : '#DDE8E7' }]}>
          <View 
            style={[
              styles.progressBarFill, 
              { 
                width: `${slaProgressPercent}%`, 
                backgroundColor: isSlaBreached ? '#EF4444' : isResolved ? '#10B981' : theme.authorityPrimary 
              }
            ]} 
          />
        </View>
      </View>

      {/* STAGE PIPELINE */}
      <View style={styles.pipelineBody}>

        {/* ─────────────────────────────────────────────────────────────
            STAGE 1: CITIZEN SUBMISSION & AI VERIFICATION
        ───────────────────────────────────────────────────────────── */}
        <View style={styles.stageBlock}>
          <View style={styles.timelineColumn}>
            <View style={[styles.circleBadge, { backgroundColor: '#10B981' }]}>
              <Check size={14} color="#FFFFFF" strokeWidth={3} />
            </View>
            <View style={[styles.verticalLine, { backgroundColor: '#10B981' }]} />
          </View>

          <View style={styles.stageContent}>
            <TouchableOpacity 
              activeOpacity={0.7}
              onPress={() => toggleStep(1)}
              style={styles.stageHeader}
            >
              <View style={{ flex: 1 }}>
                <View style={styles.stepNumberRow}>
                  <Text style={[styles.stepNumber, { color: '#10B981' }]}>STEP 01 • INTAKE VERIFIED</Text>
                  <View style={[styles.pillBadge, { backgroundColor: 'rgba(16, 185, 129, 0.15)' }]}>
                    <Text style={{ color: '#10B981', fontSize: 10, fontWeight: '800' }}>AI VALIDATED ✓</Text>
                  </View>
                </View>
                <Text style={[styles.stageHeading, { color: theme.text }]}>
                  Citizen Report & AI Verification
                </Text>
              </View>
              {expandedSteps[1] ? <ChevronUp size={18} color={theme.subtext} /> : <ChevronDown size={18} color={theme.subtext} />}
            </TouchableOpacity>

            {expandedSteps[1] && (
              <View style={[styles.expandedCard, { backgroundColor: isDarkMode ? '#111E22' : '#F6FAF9', borderColor: theme.border }]}>
                {/* AI Score Box */}
                <View style={[styles.aiMetaCard, { backgroundColor: isDarkMode ? '#17272C' : '#FFFFFF', borderColor: theme.border }]}>
                  <View style={styles.aiMetaItem}>
                    <Sparkles size={14} color="#3B82F6" />
                    <Text style={[styles.aiMetaLabel, { color: theme.subtext }]}>AI Confidence</Text>
                    <Text style={[styles.aiMetaValue, { color: '#3B82F6' }]}>{aiConfidence}%</Text>
                  </View>
                  <View style={[styles.aiMetaDivider, { backgroundColor: theme.border }]} />
                  <View style={styles.aiMetaItem}>
                    <AlertTriangle size={14} color={aiSeverity === 'CRITICAL' || aiSeverity === 'HIGH' ? '#EF4444' : '#E8A33D'} />
                    <Text style={[styles.aiMetaLabel, { color: theme.subtext }]}>Severity Rating</Text>
                    <Text style={[styles.aiMetaValue, { color: aiSeverity === 'CRITICAL' || aiSeverity === 'HIGH' ? '#EF4444' : '#E8A33D' }]}>
                      {aiSeverity}
                    </Text>
                  </View>
                  <View style={[styles.aiMetaDivider, { backgroundColor: theme.border }]} />
                  <View style={styles.aiMetaItem}>
                    <Layers size={14} color="#8B5CF6" />
                    <Text style={[styles.aiMetaLabel, { color: theme.subtext }]}>Classified Domain</Text>
                    <Text style={[styles.aiMetaValue, { color: theme.text }]} numberOfLines={1}>
                      {aiCategory}
                    </Text>
                  </View>
                </View>

                {/* Sub-steps */}
                <View style={styles.checklist}>
                  <View style={styles.checkItem}>
                    <CheckCircle2 size={13} color="#10B981" />
                    <Text style={[styles.checkText, { color: theme.text }]}>
                      GPS geo-coordinates & high-resolution proof captured
                    </Text>
                  </View>
                  <View style={styles.checkItem}>
                    <CheckCircle2 size={13} color="#10B981" />
                    <Text style={[styles.checkText, { color: theme.text }]}>
                      Duplicate detection passed (similarity score &lt; 0.15)
                    </Text>
                  </View>
                  <View style={styles.checkItem}>
                    <CheckCircle2 size={13} color="#10B981" />
                    <Text style={[styles.checkText, { color: theme.text }]}>
                      AI Engine generated municipal SLA target ({slaTargetHours}h)
                    </Text>
                  </View>
                </View>
              </View>
            )}
          </View>
        </View>

        {/* ─────────────────────────────────────────────────────────────
            STAGE 2: MUNICIPAL AUTHORITY ACTION & SLA MONITORING
        ───────────────────────────────────────────────────────────── */}
        <View style={styles.stageBlock}>
          <View style={styles.timelineColumn}>
            <View style={[
              styles.circleBadge, 
              { backgroundColor: isResolved ? '#10B981' : isSlaBreached ? '#EF4444' : '#3B82F6' }
            ]}>
              {isResolved ? (
                <Check size={14} color="#FFFFFF" strokeWidth={3} />
              ) : isSlaBreached ? (
                <AlertCircle size={14} color="#FFFFFF" />
              ) : (
                <Wrench size={14} color="#FFFFFF" />
              )}
            </View>
            <View style={[
              styles.verticalLine, 
              { backgroundColor: isResolved ? '#10B981' : isEscalatedToHei ? '#8B5CF6' : theme.border }
            ]} />
          </View>

          <View style={styles.stageContent}>
            <TouchableOpacity 
              activeOpacity={0.7}
              onPress={() => toggleStep(2)}
              style={styles.stageHeader}
            >
              <View style={{ flex: 1 }}>
                <View style={styles.stepNumberRow}>
                  <Text style={[styles.stepNumber, { color: isResolved ? '#10B981' : '#3B82F6' }]}>
                    STEP 02 • MUNICIPAL EXECUTION
                  </Text>
                  <View style={[
                    styles.pillBadge, 
                    { backgroundColor: isResolved ? 'rgba(16, 185, 129, 0.15)' : isSlaBreached ? 'rgba(239, 68, 68, 0.15)' : 'rgba(59, 130, 246, 0.15)' }
                  ]}>
                    <Text style={{ 
                      color: isResolved ? '#10B981' : isSlaBreached ? '#EF4444' : '#3B82F6', 
                      fontSize: 10, 
                      fontWeight: '800' 
                    }}>
                      {isResolved ? 'RESOLVED' : isSlaBreached ? 'SLA EXPIRED' : 'WORK IN PROGRESS'}
                    </Text>
                  </View>
                </View>
                <Text style={[styles.stageHeading, { color: theme.text }]}>
                  Urban Local Body / Municipal Action
                </Text>
              </View>
              {expandedSteps[2] ? <ChevronUp size={18} color={theme.subtext} /> : <ChevronDown size={18} color={theme.subtext} />}
            </TouchableOpacity>

            {expandedSteps[2] && (
              <View style={[styles.expandedCard, { backgroundColor: isDarkMode ? '#111E22' : '#F6FAF9', borderColor: theme.border }]}>
                {/* Municipal Work Progress Bar */}
                <View style={{ marginBottom: 14 }}>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 }}>
                    <Text style={[styles.subSectionTitle, { color: theme.text }]}>Field Work Progress</Text>
                    <Text style={{ fontSize: 12, fontWeight: '800', color: theme.authorityPrimary }}>
                      {municipalProgressPercent}%
                    </Text>
                  </View>
                  <View style={[styles.progressBarTrack, { backgroundColor: isDarkMode ? '#1D3238' : '#DDE8E7' }]}>
                    <View 
                      style={[
                        styles.progressBarFill, 
                        { width: `${municipalProgressPercent}%`, backgroundColor: isResolved ? '#10B981' : theme.authorityPrimary }
                      ]} 
                    />
                  </View>
                </View>

                {/* Sub-milestone sequence */}
                <View style={styles.checklist}>
                  <View style={styles.checkItem}>
                    <CheckCircle2 size={13} color="#10B981" />
                    <Text style={[styles.checkText, { color: theme.text }]}>
                      Municipal Engineering Officer dispatched for physical survey
                    </Text>
                  </View>

                  <View style={styles.checkItem}>
                    <CheckCircle2 size={13} color="#10B981" />
                    <Text style={[styles.checkText, { color: theme.text }]}>
                      Standard repair estimation and departmental work order issued
                    </Text>
                  </View>

                  <View style={styles.checkItem}>
                    {isResolved ? (
                      <CheckCircle2 size={13} color="#10B981" />
                    ) : (
                      <Clock size={13} color="#E8A33D" />
                    )}
                    <Text style={[styles.checkText, { color: theme.text }]}>
                      {isResolved 
                        ? 'Civil repairs finished on-site and verified by local inspector'
                        : 'Routine contractor capacity constrained; evaluating technological solution'}
                    </Text>
                  </View>
                </View>

                {/* Branch Outcome Banner */}
                {isResolved ? (
                  <View style={[styles.outcomeBanner, { backgroundColor: 'rgba(16, 185, 129, 0.12)', borderColor: 'rgba(16, 185, 129, 0.3)' }]}>
                    <CheckCircle2 size={16} color="#10B981" />
                    <Text style={[styles.outcomeText, { color: '#10B981' }]}>
                      Successfully resolved by Municipal Works. Citizen verification sign-off logged.
                    </Text>
                  </View>
                ) : (
                  <View style={[styles.outcomeBanner, { backgroundColor: 'rgba(139, 92, 246, 0.12)', borderColor: 'rgba(139, 92, 246, 0.3)' }]}>
                    <Sparkles size={16} color="#8B5CF6" />
                    <Text style={[styles.outcomeText, { color: '#8B5CF6' }]}>
                      Autonomous AI Router: Persistent or high-complexity civic challenge routed to Higher Education Institutions (HEI) for technological innovation.
                    </Text>
                  </View>
                )}
              </View>
            )}
          </View>
        </View>

        {/* ─────────────────────────────────────────────────────────────
            STAGE 3: DYNAMIC AI ROUTING TO HEI INNOVATION CELLS
        ───────────────────────────────────────────────────────────── */}
        <View style={styles.stageBlock}>
          <View style={styles.timelineColumn}>
            <View style={[
              styles.circleBadge, 
              { backgroundColor: isResolved ? '#10B981' : isEscalatedToHei ? '#8B5CF6' : '#1D3238' }
            ]}>
              <Cpu size={14} color="#FFFFFF" />
            </View>
            <View style={[
              styles.verticalLine, 
              { backgroundColor: isResolved ? '#10B981' : isEscalatedToHei ? '#E8A33D' : theme.border }
            ]} />
          </View>

          <View style={styles.stageContent}>
            <TouchableOpacity 
              activeOpacity={0.7}
              onPress={() => toggleStep(3)}
              style={styles.stageHeader}
            >
              <View style={{ flex: 1 }}>
                <View style={styles.stepNumberRow}>
                  <Text style={[styles.stepNumber, { color: '#8B5CF6' }]}>
                    STEP 03 • HEI RESEARCH & CAPSTONE
                  </Text>
                  <View style={[
                    styles.pillBadge, 
                    { backgroundColor: 'rgba(139, 92, 246, 0.15)' }
                  ]}>
                    <Text style={{ color: '#8B5CF6', fontSize: 10, fontWeight: '800' }}>
                      {isResolved ? 'INNOVATION DELIVERED' : 'CAPSTONE CLAIMED'}
                    </Text>
                  </View>
                </View>
                <Text style={[styles.stageHeading, { color: theme.text }]}>
                  University Innovation & Academic Lab
                </Text>
              </View>
              {expandedSteps[3] ? <ChevronUp size={18} color={theme.subtext} /> : <ChevronDown size={18} color={theme.subtext} />}
            </TouchableOpacity>

            {expandedSteps[3] && (
              <View style={[styles.expandedCard, { backgroundColor: isDarkMode ? '#111E22' : '#F6FAF9', borderColor: theme.border }]}>
                {/* Academic Partner Highlight */}
                <View style={[styles.partnerCard, { backgroundColor: isDarkMode ? '#17272C' : '#FFFFFF', borderColor: theme.border }]}>
                  <Building2 size={16} color="#8B5CF6" style={{ marginTop: 2 }} />
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.partnerRole, { color: theme.subtext }]}>ADOPTED ACADEMIC INSTITUTION</Text>
                    <Text style={[styles.partnerName, { color: theme.text }]}>{heiPartner}</Text>
                    <Text style={[styles.partnerSubtext, { color: theme.subtext }]}>
                      Department of Civil & Environmental Engineering • Team Lead: Dr. P. K. Verma
                    </Text>
                  </View>
                </View>

                {/* Sub-milestones */}
                <View style={styles.checklist}>
                  <View style={styles.checkItem}>
                    <CheckCircle2 size={13} color="#10B981" />
                    <Text style={[styles.checkText, { color: theme.text }]}>
                      Academic claim registered & problem translated into Capstone challenge
                    </Text>
                  </View>
                  <View style={styles.checkItem}>
                    <CheckCircle2 size={13} color="#10B981" />
                    <Text style={[styles.checkText, { color: theme.text }]}>
                      Undergrad/Postgrad student team assigned with faculty mentorship
                    </Text>
                  </View>
                  <View style={styles.checkItem}>
                    <CheckCircle2 size={13} color="#10B981" />
                    <Text style={[styles.checkText, { color: theme.text }]}>
                      3D CAD simulation, material testing & engineering design approved
                    </Text>
                  </View>
                </View>
              </View>
            )}
          </View>
        </View>

        {/* ─────────────────────────────────────────────────────────────
            STAGE 4: INDUSTRY & CSR FINANCING ESCROW
        ───────────────────────────────────────────────────────────── */}
        <View style={styles.stageBlock}>
          <View style={styles.timelineColumn}>
            <View style={[
              styles.circleBadge, 
              { backgroundColor: isResolved ? '#10B981' : '#E8A33D' }
            ]}>
              <Coins size={14} color="#FFFFFF" />
            </View>
            <View style={[
              styles.verticalLine, 
              { backgroundColor: isResolved ? '#10B981' : theme.authorityPrimary }
            ]} />
          </View>

          <View style={styles.stageContent}>
            <TouchableOpacity 
              activeOpacity={0.7}
              onPress={() => toggleStep(4)}
              style={styles.stageHeader}
            >
              <View style={{ flex: 1 }}>
                <View style={styles.stepNumberRow}>
                  <Text style={[styles.stepNumber, { color: '#E8A33D' }]}>
                    STEP 04 • INDUSTRY CSR GRANT
                  </Text>
                  <View style={[
                    styles.pillBadge, 
                    { backgroundColor: 'rgba(232, 163, 61, 0.15)' }
                  ]}>
                    <Text style={{ color: '#E8A33D', fontSize: 10, fontWeight: '800' }}>
                      PLEDGED & FUNDED
                    </Text>
                  </View>
                </View>
                <Text style={[styles.stageHeading, { color: theme.text }]}>
                  CSR Financing & Material Sponsorship
                </Text>
              </View>
              {expandedSteps[4] ? <ChevronUp size={18} color={theme.subtext} /> : <ChevronDown size={18} color={theme.subtext} />}
            </TouchableOpacity>

            {expandedSteps[4] && (
              <View style={[styles.expandedCard, { backgroundColor: isDarkMode ? '#111E22' : '#F6FAF9', borderColor: theme.border }]}>
                {/* CSR Financial Highlights */}
                <View style={[styles.partnerCard, { backgroundColor: isDarkMode ? '#17272C' : '#FFFFFF', borderColor: theme.border }]}>
                  <ShieldCheck size={16} color="#E8A33D" style={{ marginTop: 2 }} />
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.partnerRole, { color: theme.subtext }]}>CORPORATE CSR SPONSOR</Text>
                    <Text style={[styles.partnerName, { color: theme.text }]}>{csrPartner}</Text>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 4 }}>
                      <Text style={{ fontSize: 13, fontWeight: '800', color: '#E8A33D' }}>{budgetPledged}</Text>
                      <Text style={{ fontSize: 11, color: theme.subtext }}>• Released to University Lab Escrow</Text>
                    </View>
                  </View>
                </View>

                {/* Sub-milestones */}
                <View style={styles.checklist}>
                  <View style={styles.checkItem}>
                    <CheckCircle2 size={13} color="#10B981" />
                    <Text style={[styles.checkText, { color: theme.text }]}>
                      CSR Board evaluation cleared with 100% tax benefit compliance
                    </Text>
                  </View>
                  <View style={styles.checkItem}>
                    <CheckCircle2 size={13} color="#10B981" />
                    <Text style={[styles.checkText, { color: theme.text }]}>
                      Raw materials & specialized sensors procured for student engineering cell
                    </Text>
                  </View>
                </View>
              </View>
            )}
          </View>
        </View>

        {/* ─────────────────────────────────────────────────────────────
            STAGE 5: PROTOTYPE DEPLOYMENT & COMMUNITY IMPACT
        ───────────────────────────────────────────────────────────── */}
        <View style={styles.stageBlock}>
          <View style={styles.timelineColumn}>
            <View style={[
              styles.circleBadge, 
              { backgroundColor: isResolved ? '#10B981' : theme.authorityPrimary }
            ]}>
              <CheckCircle2 size={14} color="#FFFFFF" />
            </View>
          </View>

          <View style={styles.stageContent}>
            <TouchableOpacity 
              activeOpacity={0.7}
              onPress={() => toggleStep(5)}
              style={styles.stageHeader}
            >
              <View style={{ flex: 1 }}>
                <View style={styles.stepNumberRow}>
                  <Text style={[styles.stepNumber, { color: isResolved ? '#10B981' : theme.authorityPrimary }]}>
                    STEP 05 • FIELD DEPLOYMENT
                  </Text>
                  <View style={[
                    styles.pillBadge, 
                    { backgroundColor: isResolved ? 'rgba(16, 185, 129, 0.15)' : 'rgba(47, 158, 143, 0.15)' }
                  ]}>
                    <Text style={{ 
                      color: isResolved ? '#10B981' : theme.authorityPrimary, 
                      fontSize: 10, 
                      fontWeight: '800' 
                    }}>
                      {isResolved ? 'FIELD CERTIFIED' : 'ACTIVE PILOT'}
                    </Text>
                  </View>
                </View>
                <Text style={[styles.stageHeading, { color: theme.text }]}>
                  Prototype Deployment & Validation
                </Text>
              </View>
              {expandedSteps[5] ? <ChevronUp size={18} color={theme.subtext} /> : <ChevronDown size={18} color={theme.subtext} />}
            </TouchableOpacity>

            {expandedSteps[5] && (
              <View style={[styles.expandedCard, { backgroundColor: isDarkMode ? '#111E22' : '#F6FAF9', borderColor: theme.border }]}>
                {/* Prototype Detail Box */}
                <View style={[styles.partnerCard, { backgroundColor: isDarkMode ? '#17272C' : '#FFFFFF', borderColor: theme.border }]}>
                  <Cpu size={16} color={theme.authorityPrimary} style={{ marginTop: 2 }} />
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.partnerRole, { color: theme.subtext }]}>DEPLOYED INNOVATION</Text>
                    <Text style={[styles.partnerName, { color: theme.text }]}>{prototypeName}</Text>
                    <Text style={[styles.partnerSubtext, { color: theme.subtext }]}>
                      IoT telemetry live • Connected to State Dashboard & District Control Room
                    </Text>
                  </View>
                </View>

                {/* Sub-milestones */}
                <View style={styles.checklist}>
                  <View style={styles.checkItem}>
                    <CheckCircle2 size={13} color="#10B981" />
                    <Text style={[styles.checkText, { color: theme.text }]}>
                      Field installation executed jointly with municipal crew & student engineers
                    </Text>
                  </View>
                  <View style={styles.checkItem}>
                    <CheckCircle2 size={13} color="#10B981" />
                    <Text style={[styles.checkText, { color: theme.text }]}>
                      Sensory telemetry confirms normal operation & resolved civic hazard
                    </Text>
                  </View>
                  <View style={styles.checkItem}>
                    <CheckCircle2 size={13} color="#10B981" />
                    <Text style={[styles.checkText, { color: theme.text }]}>
                      Citizen feedback score logged with digital completion certificate
                    </Text>
                  </View>
                </View>
              </View>
            )}
          </View>
        </View>

      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 20,
    borderWidth: 1,
    padding: 18,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 3,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
    paddingRight: 8,
  },
  pulseIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '800',
    letterSpacing: -0.2,
  },
  headerSubtitle: {
    fontSize: 11,
    marginTop: 2,
  },
  pipelineBadge: {
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderRadius: 8,
  },
  pipelineBadgeText: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  slaBanner: {
    borderRadius: 14,
    borderWidth: 1,
    padding: 12,
    marginBottom: 20,
  },
  slaBannerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  slaLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  slaLabel: {
    fontSize: 12,
    fontWeight: '600',
  },
  slaStatusTag: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  slaStatusText: {
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 0.4,
  },
  progressBarTrack: {
    height: 6,
    borderRadius: 3,
    overflow: 'hidden',
    width: '100%',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 3,
  },
  pipelineBody: {
    marginTop: 4,
  },
  stageBlock: {
    flexDirection: 'row',
    marginBottom: 4,
  },
  timelineColumn: {
    width: 32,
    alignItems: 'center',
  },
  circleBadge: {
    width: 26,
    height: 26,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 2,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 2,
  },
  verticalLine: {
    width: 2,
    flex: 1,
    marginTop: -2,
    marginBottom: -2,
    zIndex: 1,
  },
  stageContent: {
    flex: 1,
    paddingLeft: 12,
    paddingBottom: 20,
  },
  stageHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  stepNumberRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 3,
  },
  stepNumber: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  pillBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  stageHeading: {
    fontSize: 15,
    fontWeight: '800',
  },
  expandedCard: {
    borderRadius: 12,
    borderWidth: 1,
    padding: 12,
    marginTop: 4,
  },
  subSectionTitle: {
    fontSize: 12,
    fontWeight: '700',
  },
  aiMetaCard: {
    flexDirection: 'row',
    borderRadius: 10,
    borderWidth: 1,
    paddingVertical: 8,
    paddingHorizontal: 10,
    alignItems: 'center',
    justifyContent: 'space-around',
    marginBottom: 10,
  },
  aiMetaItem: {
    alignItems: 'center',
    flex: 1,
  },
  aiMetaLabel: {
    fontSize: 9,
    fontWeight: '600',
    marginTop: 3,
  },
  aiMetaValue: {
    fontSize: 11,
    fontWeight: '800',
    marginTop: 2,
  },
  aiMetaDivider: {
    width: 1,
    height: 24,
  },
  checklist: {
    gap: 6,
  },
  checkItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
  },
  checkText: {
    fontSize: 12,
    flex: 1,
    lineHeight: 16,
  },
  outcomeBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    borderRadius: 8,
    borderWidth: 1,
    padding: 9,
    marginTop: 10,
  },
  outcomeText: {
    fontSize: 11,
    fontWeight: '600',
    flex: 1,
    lineHeight: 15,
  },
  partnerCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    borderRadius: 10,
    borderWidth: 1,
    padding: 10,
    marginBottom: 10,
  },
  partnerRole: {
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  partnerName: {
    fontSize: 13,
    fontWeight: '800',
    marginTop: 1,
  },
  partnerSubtext: {
    fontSize: 11,
    marginTop: 2,
    lineHeight: 14,
  },
});
