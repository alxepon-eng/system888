import React, { useState } from 'react';
import { UserRole, SubmissionData } from './types';
import { Login } from './components/Login';
import { StudentForm } from './components/StudentForm';
import { TeacherForm } from './components/TeacherForm';
import { submitData } from './services/geminiService';
import { CheckCircle, XCircle, LogOut } from 'lucide-react';

const App: React.FC = () => {
  const [currentRole, setCurrentRole] = useState<UserRole>(UserRole.GUEST);
  const [isLoading, setIsLoading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [statusMessage, setStatusMessage] = useState('');

  const handleSubmission = async (data: SubmissionData) => {
    setIsLoading(true);
    setUploadStatus('idle');
    
    try {
      const result = await submitData(data);
      if (result.status === 'success') {
        setUploadStatus('success');
        setStatusMessage(result.message || 'ส่งข้อมูลสำเร็จ!');
      } else {
        setUploadStatus('error');
        setStatusMessage(result.message || 'เกิดข้อผิดพลาดในการส่งข้อมูล');
      }
    } catch (error) {
      setUploadStatus('error');
      setStatusMessage('เกิดข้อผิดพลาดที่ไม่คาดคิด');
    } finally {
      setIsLoading(false);
    }
  };

  const resetState = () => {
    setUploadStatus('idle');
    setStatusMessage('');
  };

  const logout = () => {
    setCurrentRole(UserRole.GUEST);
    resetState();
  };

  // Status Overlay
  if (uploadStatus !== 'idle') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-pink-50 p-4 z-50 fixed inset-0">
        <div className="bg-white p-8 rounded-2xl neo-brutalism max-w-sm w-full text-center">
          {uploadStatus === 'success' ? (
            <CheckCircle className="w-20 h-20 text-green-500 mx-auto mb-4" />
          ) : (
            <XCircle className="w-20 h-20 text-red-500 mx-auto mb-4" />
          )}
          
          <h2 className="text-2xl font-bold mb-2">
            {uploadStatus === 'success' ? 'สำเร็จ!' : 'ผิดพลาด'}
          </h2>
          {/* Added whitespace-pre-wrap to handle newlines in error messages */}
          <p className="text-gray-600 mb-6 whitespace-pre-wrap leading-relaxed">{statusMessage}</p>
          
          <button 
            onClick={resetState}
            className="w-full bg-black text-white font-bold py-3 rounded-xl neo-brutalism-sm hover:bg-gray-800 transition-transform active:scale-95"
          >
            ตกลง
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-10">
      {/* Header */}
      <header className="bg-white border-b-4 border-black p-4 mb-8 sticky top-0 z-10 shadow-md">
        <div className="max-w-3xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-pink-500 rounded-lg border-2 border-black flex items-center justify-center shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
              <span className="text-white font-bold text-xl">Edu</span>
            </div>
            <h1 className="text-lg md:text-xl font-bold text-gray-800 leading-tight">
              ระบบส่งข้อมูล และไฟล์งาน<br/>
              <span className="text-sm font-normal text-gray-500">พร้อมแจ้งเตือนใน Email</span>
            </h1>
          </div>
          
          {currentRole !== UserRole.GUEST && (
            <button onClick={logout} className="p-2 hover:bg-gray-100 rounded-full border-2 border-transparent hover:border-black transition-all">
              <LogOut size={24} className="text-red-500" />
            </button>
          )}
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-3xl mx-auto px-4">
        {currentRole === UserRole.GUEST && (
          <Login onLogin={setCurrentRole} />
        )}

        {currentRole === UserRole.STUDENT && (
          <div className="animate-fade-in">
             <div className="bg-pink-100 border-2 border-black rounded-xl p-4 mb-6 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                <h2 className="font-bold text-xl">🎓 ส่วนนักเรียนส่งงาน</h2>
                <p className="text-gray-600 text-sm">กรุณากรอกข้อมูลให้ครบถ้วนเพื่อส่งงานเข้าระบบ</p>
             </div>
            <StudentForm onSubmit={handleSubmission} isLoading={isLoading} />
          </div>
        )}

        {currentRole === UserRole.TEACHER && (
          <div className="animate-fade-in">
            <div className="bg-purple-100 border-2 border-black rounded-xl p-4 mb-6 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                <h2 className="font-bold text-xl">👨‍🏫 ส่วนอาจารย์มอบหมายงาน</h2>
                <p className="text-gray-600 text-sm">สร้างงานมอบหมายและส่งเข้าไลน์กลุ่ม/เมลนักศึกษา</p>
             </div>
            <TeacherForm onSubmit={handleSubmission} isLoading={isLoading} />
          </div>
        )}
      </main>

      {/* Overlay Loading */}
      {isLoading && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center backdrop-blur-sm">
          <div className="bg-white p-6 rounded-2xl neo-brutalism flex flex-col items-center">
            <div className="w-12 h-12 border-4 border-pink-200 border-t-pink-500 rounded-full animate-spin mb-4"></div>
            <p className="font-bold text-lg">กำลังส่งข้อมูล...</p>
            <p className="text-sm text-gray-500">กรุณาอย่าปิดหน้าต่าง</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;