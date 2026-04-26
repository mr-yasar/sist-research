import { supabase } from '../lib/supabaseClient';
import { notificationService } from './notificationService';
import { auditService } from './auditService';

export const submissionService = {
  async getAll() {
    const { data, error } = await supabase.from('submissions').select('*, comments(*), submission_history(*)').order('created_at', { ascending: false });
    if (error) { console.error(error); return []; }
    return data;
  },

  async getByStudent(studentId) {
    const { data, error } = await supabase.from('submissions').select('*, comments(*), submission_history(*)').eq('student_id', studentId).order('created_at', { ascending: false });
    if (error) { console.error(error); return []; }
    return data;
  },

  async getByStatus(status) {
    const { data, error } = await supabase.from('submissions').select('*, comments(*), submission_history(*)').eq('status', status).order('created_at', { ascending: false });
    if (error) { console.error(error); return []; }
    return data;
  },

  async getById(id) {
    const { data, error } = await supabase.from('submissions').select('*, comments(*), submission_history(*)').eq('id', id).single();
    if (error) { console.error(error); return null; }
    return data;
  },

  async create(data, currentUser) {
    const { data: newSub, error } = await supabase.from('submissions').insert([{
      title: data.title,
      type: data.type,
      status: 'Submitted',
      student_id: currentUser.id,
      student_name: currentUser.name,
      file_name: data.fileName,
      file_size: data.fileSize,
      file_type: data.fileType,
      file_url: data.fileDataUrl // For now, we will save the base64 or storage url here
    }]).select().single();

    if (error) throw new Error(error.message);

    await supabase.from('submission_history').insert([{
      submission_id: newSub.id,
      status: 'Submitted',
      actor_name: currentUser.name
    }]);

    auditService.log({ action: 'SUBMISSION_CREATED', entityId: newSub.id, entityType: 'submission', user: currentUser.name, role: currentUser.role, detail: `Created submission: ${newSub.title}` });
    return newSub;
  },

  async updateStatus(id, status, currentUser, commentText = '') {
    const { data: updatedSub, error } = await supabase.from('submissions').update({ status }).eq('id', id).select().single();
    if (error) throw new Error(error.message);

    await supabase.from('submission_history').insert([{
      submission_id: id,
      status: status === 'Rejected' ? 'Rejected' : `Moved to ${status}`,
      comment: commentText,
      actor_name: currentUser.name
    }]);

    if (commentText.trim()) {
      await supabase.from('comments').insert([{
        submission_id: id,
        text: commentText.trim(),
        author_name: currentUser.name,
        author_role: currentUser.role
      }]);
    }

    notificationService.push({ userId: updatedSub.student_id, title: `Submission ${status}`, message: `Status changed to ${status}`, type: 'info' });
    auditService.log({ action: 'STATUS_UPDATED', entityId: id, entityType: 'submission', user: currentUser.name, role: currentUser.role, detail: `Status changed to ${status}` });

    // Refetch the fully populated submission
    return this.getById(id);
  },

  async addComment(id, text, currentUser) {
    const { error } = await supabase.from('comments').insert([{
      submission_id: id,
      text: text.trim(),
      author_name: currentUser.name,
      author_role: currentUser.role
    }]);
    if (error) throw new Error(error.message);

    auditService.log({ action: 'COMMENT_ADDED', entityId: id, entityType: 'submission', user: currentUser.name, role: currentUser.role, detail: `Comment added` });
    return this.getById(id);
  },

  async getStats() {
    const all = await this.getAll();
    return {
      total: all.length,
      submitted: all.filter((s) => s.status === 'Submitted').length,
      facultyReview: all.filter((s) => s.status === 'Faculty Review').length,
      hodApproval: all.filter((s) => s.status === 'HOD Approval').length,
      approved: all.filter((s) => s.status === 'Approved').length,
      rejected: all.filter((s) => s.status === 'Rejected').length,
    };
  }
};
