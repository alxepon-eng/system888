import React, { useState } from 'react';
import { UserRole } from '../types';
import { Button } from './ui/Button';
import { Input } from './ui/Input';
import { TEACHER_PASSWORD } from '../constants';
import { GraduationCap, School } from 'lucide-react';

interface LoginProps {
  onLogin: (role: UserRole) => void;
}

export const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const [activeTab, setActiveTab] = useState<'student' | 'teacher'>('student');
  const [teacherPass, setTeacherPass] = useState('');
  const [error, setError] = useState('');

  const handleTeacherLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (teacherPass === TEACHER_PASSWORD) {
      onLogin(UserRole.TEACHER);
    } else {
      setError('รหัสผ่านไม่ถูกต้อง');
    }
  };

  return (
    <div className="max-w-md mx-auto">
      <div className="flex mb-6 neo-brutalism rounded-xl overflow-hidden bg-white">
        <button
          className={`flex-1 py-3 font-bold flex items-center justify-center gap-2 transition-colors ${activeTab === 'student' ? 'bg-pink-500 text-white' : 'hover:bg-gray-100'}`}
          onClick={() => { setActiveTab('student'); setError(''); }}
        >
          <GraduationCap /> นักเรียน
        </button>
        <button
          className={`flex-1 py-3 font-bold flex items-center justify-center gap-2 transition-colors ${activeTab === 'teacher' ? 'bg-purple-600 text-white' : 'hover:bg-gray-100'}`}
          onClick={() => { setActiveTab('teacher'); setError(''); }}
        >
          <School /> อาจารย์
        </button>
      </div>

      <div className="bg-white p-8 rounded-xl neo-brutalism">
        {activeTab === 'student' ? (
          <div className="text-center space-y-6">
            <div className="w-20 h-20 bg-pink-100 rounded-full mx-auto flex items-center justify-center neo-brutalism-sm">
                <GraduationCap size={40} className="text-pink-500" />
            </div>
            <h2 className="text-2xl font-bold text-gray-800">เข้าสู่ระบบส่งงาน</h2>
            <p className="text-gray-500">คลิกปุ่มด้านล่างเพื่อเริ่มส่งงาน<br/>(ระบบจะเชื่อมต่อ Google Sheet อัตโนมัติ)</p>
            <Button onClick={() => onLogin(UserRole.STUDENT)} className="w-full text-lg">
              เริ่มใช้งาน
            </Button>
          </div>
        ) : (
          <form onSubmit={handleTeacherLogin} className="space-y-6">
             <div className="w-20 h-20 bg-purple-100 rounded-full mx-auto flex items-center justify-center neo-brutalism-sm">
                <School size={40} className="text-purple-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-800 text-center">อาจารย์เข้าสู่ระบบ</h2>
            <Input 
              type="password" 
              label="รหัสผ่าน" 
              placeholder="กรอกรหัสผ่าน"
              value={teacherPass}
              onChange={(e) => setTeacherPass(e.target.value)}
              error={error}
            />
            <Button type="submit" className="w-full text-lg bg-purple-600 hover:bg-purple-700">
              เข้าสู่ระบบ
            </Button>
          </form>
        )}
      </div>
    </div>
  );
};