export enum UserRole {
  GUEST = 'GUEST',
  STUDENT = 'STUDENT',
  TEACHER = 'TEACHER',
}

export interface StudentMember {
  id: string;
  name: string;
  group?: string;
}

export interface FileData {
  name: string;
  type: string;
  base64: string;
  size: number;
}

export interface SubmissionData {
  role: 'STUDENT' | 'TEACHER';
  action?: 'SUBMIT' | 'GET_SUBMISSIONS' | 'UPDATE_GRADE'; // Added for API routing
  
  // Common
  fileData?: FileData;
  timestamp: string;
  
  // Student Specific
  group?: string;
  subject?: string;
  members?: StudentMember[];
  assignmentTitle?: string;
  link?: string;
  
  // Teacher Specific
  level?: string;
  year?: string;
  room?: string;
  targetGroup?: string;
  topic?: string;
  dueDate?: string;

  // Grading Specific
  rowId?: number;
  score?: string;
  feedback?: string;
}

export interface StudentSubmission {
  rowId: number;
  timestamp: string;
  group: string;
  subject: string;
  assignmentTitle: string;
  members: StudentMember[];
  link?: string;
  fileUrl?: string;
  fileName?: string;
  score?: string;
  feedback?: string;
}

export interface ApiResponse {
  status: 'success' | 'error';
  message: string;
  fileUrl?: string;
  data?: StudentSubmission[]; // For fetching submissions
}