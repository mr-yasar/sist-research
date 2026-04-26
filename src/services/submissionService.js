// ============================================================
// Submission Service — CRUD on localStorage
// Backend APIs and file storage will be integrated in the next phase.
// ============================================================

import { MOCK_SUBMISSIONS } from '../data/mockData';
import { auditService } from './auditService';
import { notificationService } from './notificationService';

const STORE_KEY = 'sist_submissions';

const load = () => {
  try {
    const raw = localStorage.getItem(STORE_KEY);
    if (raw) return JSON.parse(raw);
    // Seed on first load
    localStorage.setItem(STORE_KEY, JSON.stringify(MOCK_SUBMISSIONS));
    return MOCK_SUBMISSIONS;
  } catch {
    return [];
  }
};

const save = (submissions) => {
  localStorage.setItem(STORE_KEY, JSON.stringify(submissions));
};

export const submissionService = {
  /** GET /api/submissions */
  getAll() {
    return load();
  },

  /** GET /api/submissions?studentId=x */
  getByStudent(studentId) {
    return load().filter((s) => s.studentId === studentId);
  },

  /** GET /api/submissions?status=x */
  getByStatus(status) {
    return load().filter((s) => s.status === status);
  },

  /** GET /api/submissions/:id */
  getById(id) {
    return load().find((s) => s.id === id) || null;
  },

  /** POST /api/submissions */
  create(data, currentUser) {
    const submissions = load();
    const newSub = {
      id: `sub_${Date.now()}`,
      studentId:   currentUser.id,
      studentName: currentUser.name,
      department:  currentUser.department,
      date: new Date().toISOString(),
      status: 'Submitted',
      comments: [],
      history: [
        {
          action:    'Submitted',
          role:      'student',
          user:      currentUser.name,
          timestamp: new Date().toISOString(),
        },
      ],
      ...data,
    };
    submissions.unshift(newSub);
    save(submissions);

    auditService.log({
      action:     'SUBMISSION_CREATED',
      entityId:   newSub.id,
      entityType: 'submission',
      user:       currentUser.name,
      role:       currentUser.role,
      detail:     `Created submission: ${newSub.title}`,
    });

    return newSub;
  },

  /** PATCH /api/submissions/:id/status */
  updateStatus(id, status, currentUser, comment = '') {
    const submissions = load();
    const idx = submissions.findIndex((s) => s.id === id);
    if (idx === -1) throw new Error('Submission not found');

    const prev = submissions[idx];
    submissions[idx] = {
      ...prev,
      status,
      history: [
        ...prev.history,
        {
          action:    status === 'Rejected' ? 'Rejected' : `Moved to ${status}`,
          role:      currentUser.role,
          user:      currentUser.name,
          timestamp: new Date().toISOString(),
        },
      ],
    };

    if (comment.trim()) {
      submissions[idx].comments = [
        ...prev.comments,
        {
          id:        `c_${Date.now()}`,
          author:    currentUser.name,
          role:      currentUser.role,
          text:      comment.trim(),
          timestamp: new Date().toISOString(),
        },
      ];
    }

    save(submissions);

    // Push notification to submission owner
    notificationService.push({
      userId:  prev.studentId,
      title:   `Submission ${status === 'Approved' ? '✅ Approved' : status === 'Rejected' ? '❌ Rejected' : '🔄 Updated'}`,
      message: `"${prev.title}" status changed to ${status}`,
      type:    status === 'Approved' ? 'success' : status === 'Rejected' ? 'error' : 'info',
    });

    auditService.log({
      action:     'STATUS_UPDATED',
      entityId:   id,
      entityType: 'submission',
      user:       currentUser.name,
      role:       currentUser.role,
      detail:     `Status changed from ${prev.status} to ${status}`,
    });

    return submissions[idx];
  },

  /** POST /api/submissions/:id/comments */
  addComment(id, text, currentUser) {
    const submissions = load();
    const idx = submissions.findIndex((s) => s.id === id);
    if (idx === -1) throw new Error('Submission not found');

    const comment = {
      id:        `c_${Date.now()}`,
      author:    currentUser.name,
      role:      currentUser.role,
      text:      text.trim(),
      timestamp: new Date().toISOString(),
    };

    submissions[idx] = {
      ...submissions[idx],
      comments: [...submissions[idx].comments, comment],
    };
    save(submissions);

    auditService.log({
      action:     'COMMENT_ADDED',
      entityId:   id,
      entityType: 'submission',
      user:       currentUser.name,
      role:       currentUser.role,
      detail:     `Comment added`,
    });

    return submissions[idx];
  },

  /** Stats for analytics */
  getStats() {
    const all = load();
    return {
      total:          all.length,
      submitted:      all.filter((s) => s.status === 'Submitted').length,
      facultyReview:  all.filter((s) => s.status === 'Faculty Review').length,
      hodApproval:    all.filter((s) => s.status === 'HOD Approval').length,
      approved:       all.filter((s) => s.status === 'Approved').length,
      rejected:       all.filter((s) => s.status === 'Rejected').length,
    };
  },
};
