import React, { useState, useMemo } from 'react';
import { User, Plus, Trash2, Link as LinkIcon, Save, Users, FileText } from 'lucide-react';
import { Button } from './ui/Button';
import { Input, Select } from './ui/Input';
import { FileUpload } from './FileUpload';
import { SUBJECTS, MOCK_STUDENTS } from '../constants';
import { StudentMember, FileData, SubmissionData } from '../types';

interface StudentFormProps {
  onSubmit: (data: SubmissionData) => void;
  isLoading: boolean;
}

export const StudentForm: React.FC<StudentFormProps> = ({ onSubmit, isLoading }) => {
  const [subject, setSubject] = useState('');
  const [members, setMembers] = useState<StudentMember[]>([]);
  
  // Filtering states
  const [filterGroup, setFilterGroup] = useState('');
  const [tempId, setTempId] = useState('');

  const [assignmentTitle, setAssignmentTitle] = useState('');
  const [link, setLink] = useState('');
  const [file, setFile] = useState<FileData | null>(null);

  // 1. Get unique groups for the filter dropdown
  const groupOptions = useMemo(() => {
    const groups = new Set(Object.values(MOCK_STUDENTS).map(s => s.group));
    return Array.from(groups).sort().map(g => ({ value: g, label: g }));
  }, []);

  // 2. Filter students based on selected group
  const studentOptions = useMemo(() => {
    if (!filterGroup) return [];
    
    return Object.entries(MOCK_STUDENTS)
      .filter(([_, info]) => info.group === filterGroup)
      .map(([id, info]) => ({
        value: id,
        label: `${id} - ${info.name}`
      }))
      .sort((a, b) => a.value.localeCompare(b.value));
  }, [filterGroup]);

  const addMember = () => {
    if (members.length >= 5) return;
    if (!tempId) return;

    // Check if already added
    if (members.some(m => m.id === tempId)) {
        alert("รายชื่อนี้ถูกเพิ่มไปแล้ว");
        setTempId('');
        return;
    }

    const studentData = MOCK_STUDENTS[tempId];
    if (!studentData) return;

    const newMember: StudentMember = { 
        id: tempId, 
        name: studentData.name,
        group: studentData.group
    };
    
    setMembers([...members, newMember]);
    setTempId('');
  };

  const removeMember = (index: number) => {
    setMembers(members.filter((_, i) => i !== index));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!subject) return alert('กรุณาเลือกวิชา');
    if (members.length === 0) return alert('กรุณาเพิ่มสมาชิกอย่างน้อย 1 คน');

    // Use the group from the first member as the main group for the submission
    const primaryGroup = members[0].group || "ไม่ระบุ";

    const data: SubmissionData = {
      role: 'STUDENT',
      group: primaryGroup,
      subject,
      members,
      assignmentTitle,
      link,
      fileData: file || undefined,
      timestamp: new Date().toISOString()
    };
    onSubmit(data);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="bg-pink-50 p-4 rounded-xl border-2 border-pink-200">
        <h3 className="text-lg font-bold text-pink-600 mb-3 flex items-center gap-2">
          <Users size={20} /> ข้อมูลผู้ส่ง
        </h3>
        
        <div className="mb-4">
            <Select 
            label="รายวิชา *" 
            options={SUBJECTS.map(s => ({label: s, value: s}))}
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            required
            />
        </div>

        <div className="mb-2 bg-white p-3 rounded-xl border-2 border-pink-100">
          <label className="text-gray-800 font-bold ml-1 mb-2 block">เพิ่มสมาชิกในกลุ่ม ({members.length} / 5 คน)</label>
          
          <div className="grid gap-3">
             {/* Group Filter */}
             <Select
                label="1. เลือกห้องเรียน"
                options={groupOptions}
                value={filterGroup}
                onChange={(e) => {
                    setFilterGroup(e.target.value);
                    setTempId(''); // Reset student selection when group changes
                }}
             />

             {/* Student Selector */}
             <div className="flex gap-2 items-end">
                <div className="flex-1">
                    <Select
                        label="2. เลือกรายชื่อ"
                        options={studentOptions}
                        value={tempId}
                        onChange={(e) => setTempId(e.target.value)}
                        disabled={!filterGroup}
                    />
                </div>
                <button 
                  type="button"
                  onClick={addMember}
                  disabled={members.length >= 5 || !tempId}
                  className="bg-black text-white px-4 h-[44px] rounded-xl font-bold hover:bg-gray-800 disabled:opacity-50 neo-brutalism-sm flex items-center justify-center mb-[1px]"
                >
                  <Plus size={20} />
                </button>
             </div>
          </div>
           <p className="text-xs text-gray-500 mt-2 ml-1">
             {!filterGroup ? 'กรุณาเลือกห้องเรียนก่อนเพื่อค้นหารายชื่อ' : 'เลือกรายชื่อแล้วกดปุ่ม + เพื่อเพิ่มเข้ากลุ่ม'}
           </p>
        </div>

        <div className="space-y-2 mt-4">
          {members.map((member, idx) => (
            <div key={idx} className="flex justify-between items-center bg-white p-3 rounded-lg border-2 border-gray-200 animate-fade-in">
              <div className="flex flex-col">
                <span className="font-bold text-gray-800 text-sm md:text-base">
                    {idx + 1}. {member.name}
                </span>
                <div className="flex gap-2 text-xs md:text-sm text-gray-500">
                    <span className="bg-gray-100 px-2 py-0.5 rounded border border-gray-300">
                        {member.id}
                    </span>
                    <span className="bg-pink-100 text-pink-700 px-2 py-0.5 rounded border border-pink-200 font-medium">
                        {member.group || 'ไม่ระบุห้อง'}
                    </span>
                </div>
              </div>
              <button type="button" onClick={() => removeMember(idx)} className="text-red-500 hover:text-red-700 bg-red-50 p-2 rounded-full hover:bg-red-100 transition-colors">
                <Trash2 size={18} />
              </button>
            </div>
          ))}
          {members.length === 0 && (
            <p className="text-gray-400 text-sm text-center italic py-4 bg-white/50 rounded-lg border-dashed border-2 border-gray-300">
                ยังไม่ได้เพิ่มสมาชิก
            </p>
          )}
        </div>
      </div>

      <div className="bg-white p-4 rounded-xl border-2 border-gray-200">
        <h3 className="text-lg font-bold text-gray-800 mb-3 flex items-center gap-2">
          <FileText size={20} className="text-pink-500" /> รายละเอียดงาน
        </h3>

        <div className="space-y-4">
          <Input 
            label="หัวข้องาน" 
            placeholder="เช่น Lab 1: Cloud Introduction" 
            value={assignmentTitle}
            onChange={(e) => setAssignmentTitle(e.target.value)}
            required
          />
          
          <div className="relative">
            <Input 
              label="ลิงก์งาน (ถ้ามี)" 
              placeholder="https://" 
              value={link}
              onChange={(e) => setLink(e.target.value)}
            />
            <LinkIcon className="absolute right-3 top-9 text-gray-400" size={18} />
          </div>

          <FileUpload 
            label="อัพโหลดไฟล์ (ไม่เกิน 10MB)" 
            onFileSelect={setFile} 
            maxSizeMB={10} 
          />
        </div>
      </div>

      <Button type="submit" isLoading={isLoading} className="w-full text-lg py-3">
        <Save size={20} /> ส่งข้อมูล
      </Button>
    </form>
  );
};