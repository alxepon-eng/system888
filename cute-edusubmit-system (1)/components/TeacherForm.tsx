import React, { useState, useEffect } from 'react';
import { BookOpen, Calendar, Send, ClipboardCheck, Edit } from 'lucide-react';
import { Button } from './ui/Button';
import { Input, Select } from './ui/Input';
import { FileUpload } from './FileUpload';
import { SUBJECTS } from '../constants';
import { SubmissionData, FileData } from '../types';
import { GradingView } from './GradingView';

interface TeacherFormProps {
  onSubmit: (data: SubmissionData) => void;
  isLoading: boolean;
}

export const TeacherForm: React.FC<TeacherFormProps> = ({ onSubmit, isLoading }) => {
  const [activeTab, setActiveTab] = useState<'assign' | 'grade'>('assign');

  // --- Assign Tab States ---
  const [level, setLevel] = useState('ปวช.');
  const [year, setYear] = useState('1');
  const [room, setRoom] = useState('1');
  const [targetGroup, setTargetGroup] = useState('');
  
  const [subject, setSubject] = useState('');
  const [topic, setTopic] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [file, setFile] = useState<FileData | null>(null);

  useEffect(() => {
    setTargetGroup(`${level} ${year}/${room}`);
  }, [level, year, room]);

  useEffect(() => {
    if (level === 'ปวส.' && year === '3') {
      setYear('1');
    }
  }, [level]);

  const handleAssignSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!subject) return alert('กรุณาเลือกวิชา');

    const data: SubmissionData = {
      role: 'TEACHER',
      action: 'SUBMIT',
      level,
      year,
      room,
      targetGroup,
      subject,
      topic,
      dueDate,
      fileData: file || undefined,
      timestamp: new Date().toISOString()
    };
    onSubmit(data);
  };

  const yearOptions = level === 'ปวส.' 
    ? [{label: 'ปีที่ 1', value: '1'}, {label: 'ปีที่ 2', value: '2'}]
    : [{label: 'ปีที่ 1', value: '1'}, {label: 'ปีที่ 2', value: '2'}, {label: 'ปีที่ 3', value: '3'}];

  return (
    <div className="space-y-6">
       {/* Tab Navigation */}
       <div className="flex bg-white rounded-xl p-1 border-2 border-black neo-brutalism-sm">
          <button
            onClick={() => setActiveTab('assign')}
            className={`flex-1 py-2 rounded-lg font-bold flex items-center justify-center gap-2 transition-all ${
                activeTab === 'assign' 
                ? 'bg-purple-100 text-purple-700 shadow-sm' 
                : 'text-gray-500 hover:bg-gray-50'
            }`}
          >
            <Edit size={18} /> มอบหมายงาน
          </button>
          <button
            onClick={() => setActiveTab('grade')}
            className={`flex-1 py-2 rounded-lg font-bold flex items-center justify-center gap-2 transition-all ${
                activeTab === 'grade' 
                ? 'bg-purple-100 text-purple-700 shadow-sm' 
                : 'text-gray-500 hover:bg-gray-50'
            }`}
          >
            <ClipboardCheck size={18} /> ตรวจให้คะแนน
          </button>
       </div>

      {activeTab === 'assign' ? (
        <form onSubmit={handleAssignSubmit} className="space-y-6 animate-fade-in">
            <div className="bg-purple-50 p-4 rounded-xl border-2 border-purple-200">
                <h3 className="text-lg font-bold text-purple-600 mb-3 flex items-center gap-2">
                <BookOpen size={20} /> เลือกกลุ่มเรียน
                </h3>

                <div className="grid grid-cols-3 gap-2 mb-2">
                    <Select 
                        label="ระดับชั้น"
                        options={[{label: 'ปวช.', value: 'ปวช.'}, {label: 'ปวส.', value: 'ปวส.'}]}
                        value={level}
                        onChange={(e) => setLevel(e.target.value)}
                    />
                    <Select 
                        label="ชั้นปี"
                        options={yearOptions}
                        value={year}
                        onChange={(e) => setYear(e.target.value)}
                    />
                    <Select 
                        label="ห้อง"
                        options={[{label: 'ห้อง 1', value: '1'}, {label: 'ห้อง 2', value: '2'}, {label: 'ห้อง 3', value: '3'}]}
                        value={room}
                        onChange={(e) => setRoom(e.target.value)}
                    />
                </div>
                <div className="text-center mt-2 p-2 bg-white rounded-lg border border-purple-100">
                    <span className="text-gray-500 text-sm">กลุ่มที่เลือก:</span>
                    <span className="text-purple-700 font-bold text-lg ml-2">{targetGroup}</span>
                </div>
            </div>

            <div className="bg-white p-4 rounded-xl border-2 border-gray-200">
                <h3 className="text-lg font-bold text-gray-800 mb-3">รายละเอียดงาน</h3>
                
                <div className="space-y-4">
                    <Select 
                        label="วิชา" 
                        options={SUBJECTS.map(s => ({label: s, value: s}))}
                        value={subject}
                        onChange={(e) => setSubject(e.target.value)}
                        required
                    />
                    
                    <Input 
                        label="หัวข้อเรื่อง"
                        placeholder="เช่น การสังเคราะห์แสง"
                        value={topic}
                        onChange={(e) => setTopic(e.target.value)}
                        required
                    />

                    <div className="relative">
                        <Input 
                            type="date"
                            label="กำหนดส่ง"
                            value={dueDate}
                            onChange={(e) => setDueDate(e.target.value)}
                            required
                        />
                        <Calendar className="absolute right-3 top-9 text-gray-400 pointer-events-none" size={18} />
                    </div>

                    <FileUpload 
                        label="แนบไฟล์ (ถ้ามี)" 
                        onFileSelect={setFile} 
                        maxSizeMB={10}
                    />
                     <p className="text-xs text-orange-500 mt-1">* หมายเหตุ: การอัปโหลดไฟล์ขนาดใหญ่ (100MB+) ผ่านเว็บแอปอาจใช้เวลานานและไม่เสถียร</p>
                </div>
            </div>

            <Button type="submit" variant="primary" isLoading={isLoading} className="w-full text-lg py-3 bg-purple-600 hover:bg-purple-700">
                <Send size={20} /> มอบหมายงาน
            </Button>
        </form>
      ) : (
        <GradingView />
      )}
    </div>
  );
};