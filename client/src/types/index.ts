export type UserRole = 'ADMIN' | 'QA' | 'MANAGER' | 'AGENT' | 'VIEWER';

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  department?: string;
}

export interface Contact {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  company?: string;
  position?: string;
  source?: string;
  status: string;
  tags?: string;
  notes?: string;
  assignedTo?: string;
  lastContactDate?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Opportunity {
  id: string;
  title: string;
  contactId: string;
  value: number;
  stage: 'prospecting' | 'qualification' | 'proposal' | 'negotiation' | 'closed_won' | 'closed_lost';
  probability: number;
  expectedCloseDate?: string;
  description?: string;
  assignedTo?: string;
  closedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Activity {
  id: string;
  type: 'call' | 'email' | 'meeting' | 'task';
  subject: string;
  description?: string;
  contactId?: string;
  opportunityId?: string;
  assignedTo: string;
  dueDate?: string;
  completedAt?: string;
  status: 'pending' | 'completed' | 'cancelled';
  createdAt: string;
  updatedAt: string;
}

export interface NCR {
  id: string;
  ncrNumber: string;
  title: string;
  description: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  department: string;
  raisedBy: string;
  assignedTo?: string;
  status: 'open' | 'in_progress' | 'pending_verification' | 'closed';
  rootCause?: string;
  correctiveAction?: string;
  preventiveAction?: string;
  verificationMethod?: string;
  verifiedBy?: string;
  verifiedAt?: string;
  dueDate?: string;
  closedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Document {
  id: string;
  documentNumber: string;
  title: string;
  type: 'manual' | 'procedure' | 'form' | 'policy' | 'record';
  version: string;
  status: 'draft' | 'review' | 'approved' | 'obsolete';
  department: string;
  owner: string;
  approvedBy?: string;
  approvedAt?: string;
  reviewDate?: string;
  filePath?: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Supplier {
  id: string;
  name: string;
  code: string;
  category: string;
  contactPerson?: string;
  email?: string;
  phone?: string;
  address?: string;
  status: 'active' | 'inactive' | 'suspended';
  evaluationScore?: number;
  lastEvaluationDate?: string;
  nextReviewDate?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Consent {
  id: string;
  contactId: string;
  purpose: 'marketing' | 'sales' | 'support' | 'analytics';
  granted: boolean;
  grantedAt?: string;
  withdrawnAt?: string;
  source: string;
  ipAddress?: string;
  userAgent?: string;
  createdAt: string;
  updatedAt: string;
}

export interface DSRRequest {
  id: string;
  requestNumber: string;
  contactId: string;
  type: 'access' | 'rectify' | 'delete' | 'restrict' | 'withdraw_consent';
  status: 'pending' | 'in_progress' | 'completed' | 'rejected';
  description?: string;
  assignedTo?: string;
  requestedAt: string;
  completedAt?: string;
  verifiedBy?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}
