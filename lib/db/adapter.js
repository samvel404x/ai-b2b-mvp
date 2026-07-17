import { supabase } from './supabase';
import { initialEvidence, demoWorkspaces, pendingApprovals, sampleReports } from '../genius-data';

// Legacy demo adapter. Runtime API routes use lib/server/evidence-store.js instead.
const isSupabaseConfigured = () => Boolean(supabase);

// Mock in-memory state for development fallback
let mockEvidence = [...initialEvidence];
let mockWorkspaces = [...demoWorkspaces];
let mockActions = [...pendingApprovals];
let mockReports = [...sampleReports];

/**
 * WORKSPACE ADAPTERS
 */
export async function getWorkspaceData(workspaceId) {
  if (isSupabaseConfigured()) {
    // 1. Fetch workspace
    const { data: workspace, error: wsError } = await supabase
      .from('workspaces')
      .select('*')
      .eq('id', workspaceId)
      .single();
    
    if (wsError) throw wsError;

    // 2. Fetch evidence
    const { data: evidence } = await supabase.from('evidence').select('*').eq('workspace_id', workspaceId);
    
    // 3. Fetch actions (approvals)
    const { data: actions } = await supabase.from('actions').select('*').eq('workspace_id', workspaceId);

    // 4. Fetch reports
    const { data: reports } = await supabase.from('reports').select('*').eq('workspace_id', workspaceId);

    // Combine for frontend
    return {
      workspace,
      evidence: evidence || [],
      actions: actions || [],
      reports: reports || [],
    };
  } else {
    // Fallback local mock
    return {
      workspace: mockWorkspaces[0],
      evidence: mockEvidence,
      actions: mockActions,
      reports: mockReports,
      metrics: { moneyAtRisk: 250000, findingCount: 45, openApprovalCount: 9, dataQualityScore: 84 },
      diagnostics: { dataQualityScore: 84 }
    };
  }
}

/**
 * EVIDENCE ADAPTERS
 */
export async function uploadEvidence(workspaceId, filesData) {
  if (isSupabaseConfigured()) {
    // Insert into Supabase
    const { data, error } = await supabase.from('evidence').insert(
      filesData.map(file => ({
        workspace_id: workspaceId,
        name: file.name,
        kind: file.kind || 'Document',
        source: file.source || 'Upload',
        status: 'Needs review'
      }))
    ).select();
    if (error) throw error;
    return data;
  } else {
    // Local fallback
    const newRecords = filesData.map((f, i) => ({
      id: `local-${Date.now()}-${i}`,
      name: f.name,
      kind: f.kind || 'Document',
      source: f.source || 'Upload',
      status: 'Needs review',
      createdAt: new Date().toISOString()
    }));
    mockEvidence = [...newRecords, ...mockEvidence];
    return newRecords;
  }
}

export async function reviewEvidence(workspaceId, ids, status, fieldsById) {
  if (isSupabaseConfigured()) {
    // Supabase update
    for (const id of ids) {
      const updateData = { status };
      if (fieldsById && fieldsById[id]) {
        updateData.fields = fieldsById[id];
      }
      const { error } = await supabase.from('evidence').update(updateData).eq('id', id).eq('workspace_id', workspaceId);
      if (error) console.error("Error updating evidence:", error);
    }
    return { success: true };
  } else {
    // Local fallback
    mockEvidence = mockEvidence.map(record => {
      if (ids.includes(record.id)) {
        return { ...record, status, fields: fieldsById?.[record.id] || record.fields };
      }
      return record;
    });
    return { success: true };
  }
}

/**
 * ACTIONS / APPROVALS ADAPTERS
 */
export async function updateActionStatus(workspaceId, actionId, status) {
  if (isSupabaseConfigured()) {
    const { data, error } = await supabase.from('actions')
      .update({ status })
      .eq('id', actionId)
      .eq('workspace_id', workspaceId)
      .select()
      .single();
    if (error) throw error;
    return data;
  } else {
    // Local fallback
    mockActions = mockActions.map(action => 
      action.id === actionId ? { ...action, status } : action
    );
    return mockActions.find(a => a.id === actionId);
  }
}
