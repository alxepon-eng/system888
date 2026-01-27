import { GOOGLE_SCRIPT_URL } from '../constants';
import { SubmissionData, ApiResponse, StudentSubmission } from '../types';

const getUrlWithCacheBust = () => {
    const separator = GOOGLE_SCRIPT_URL.includes('?') ? '&' : '?';
    return `${GOOGLE_SCRIPT_URL}${separator}t=${Date.now()}`;
};

export const submitData = async (data: SubmissionData): Promise<ApiResponse> => {
  try {
    const response = await fetch(getUrlWithCacheBust(), {
      method: 'POST',
      redirect: 'follow',
      headers: {
        'Content-Type': 'text/plain;charset=utf-8',
      },
      body: JSON.stringify({ ...data, action: 'SUBMIT' }),
    });

    if (!response.ok) {
      throw new Error(`Server responded with status: ${response.status}`);
    }

    const result = await response.json();
    return result;
  } catch (error: any) {
    console.error("Submission Error:", error);
    return handleServiceError(error);
  }
};

export const getSubmissions = async (): Promise<StudentSubmission[]> => {
    try {
        const response = await fetch(getUrlWithCacheBust(), {
            method: 'POST',
            redirect: 'follow',
            headers: { 'Content-Type': 'text/plain;charset=utf-8' },
            body: JSON.stringify({ action: 'GET_SUBMISSIONS' }),
        });

        if (!response.ok) throw new Error("Failed to fetch");

        const result: ApiResponse = await response.json();
        if (result.status === 'success' && result.data) {
            return result.data;
        }
        return [];
    } catch (error) {
        console.error("Fetch Submissions Error:", error);
        // Fallback or rethrow depending on needs. For now returning empty array but could throw.
        return [];
    }
};

export const submitGrade = async (rowId: number, score: string, feedback: string): Promise<ApiResponse> => {
    try {
        const response = await fetch(getUrlWithCacheBust(), {
            method: 'POST',
            redirect: 'follow',
            headers: { 'Content-Type': 'text/plain;charset=utf-8' },
            body: JSON.stringify({ 
                action: 'UPDATE_GRADE', 
                rowId, 
                score, 
                feedback 
            }),
        });

        if (!response.ok) throw new Error("Failed to save grade");
        return await response.json();
    } catch (error: any) {
        return handleServiceError(error);
    }
};

const handleServiceError = (error: any): ApiResponse => {
    let userMessage = 'เกิดข้อผิดพลาดในการเชื่อมต่อ';

    if (error.message && error.message.includes('Failed to fetch')) {
        userMessage = 'การเชื่อมต่อล้มเหลว (Failed to fetch)\n\nสาเหตุที่เป็นไปได้:\n1. อินเทอร์เน็ตไม่เสถียร\n2. สคริปต์ Google Sheet ยังไม่อัปเดต\n3. ไฟล์ใหญ่เกินไป';
    } else if (error.message) {
        userMessage = `เกิดข้อผิดพลาด: ${error.message}`;
    }

    return {
      status: 'error',
      message: userMessage
    };
};