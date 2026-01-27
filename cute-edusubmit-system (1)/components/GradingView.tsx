import React, { useEffect, useState, useMemo } from 'react';
import { Search, Save, ExternalLink, Download, MessageCircle, Star, RefreshCw } from 'lucide-react';
import { getSubmissions, submitGrade } from '../services/geminiService';
import { StudentSubmission } from '../types';
import { Button } from './ui/Button';
import { Input, Select } from './ui/Input';
import { SUBJECTS, MOCK_STUDENTS } from '../constants';

export const GradingView: React.FC = () => {
  const [submissions, setSubmissions] = useState<StudentSubmission[]>([]);
  const [filteredSubmissions, setFilteredSubmissions] = useState<StudentSubmission[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Filters
  const [filterGroup, setFilterGroup] = useState('');
  const [filterSubject, setFilterSubject] = useState('');

  // Grading States (Local state to handle inputs before saving)
  const [grades, setGrades] = useState<Record<number, { score: string; feedback: string }>>({});
  const [savingId, setSavingId] = useState<number | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    let result = submissions;
    if (filterGroup) {
        result = result.filter(s => s.group === filterGroup);
    }
    if (filterSubject) {
        result = result.filter(s => s.subject === filterSubject);
    }
    setFilteredSubmissions(result);
  }, [submissions, filterGroup, filterSubject]);

  const fetchData = async () => {
    setLoading(true);
    const data = await getSubmissions();
    setSubmissions(data);
    
    // Initialize local grade state
    const initialGrades: Record<number, { score: string; feedback: string }> = {};
    data.forEach(s => {
        initialGrades[s.rowId] = { 
            score: s.score || '', 
            feedback: s.feedback || '' 
        };
    });
    setGrades(initialGrades);
    setLoading(false);
  };

  const handleGradeChange = (rowId: number, field: 'score' | 'feedback', value: string) => {
    setGrades(prev => ({
        ...prev,
        [rowId]: {
            ...prev[rowId],
            [field]: value
        }
    }));
  };

  const handleSaveGrade = async (rowId: number) => {
    const gradeData = grades[rowId];
    if (!gradeData) return;

    setSavingId(rowId);
    try {
        const result = await submitGrade(rowId, gradeData.score, gradeData.feedback);
        if (result.status === 'success') {
            alert('บันทึกคะแนนเรียบร้อย');
            // Update the main submission list to reflect saved state
            setSubmissions(prev => prev.map(s => 
                s.rowId === rowId ? { ...s, score: gradeData.score, feedback: gradeData.feedback } : s
            ));
        } else {
            alert('เกิดข้อผิดพลาด: ' + result.message);
        }
    } catch (e) {
        alert('เกิดข้อผิดพลาดในการบันทึก');
    } finally {
        setSavingId(null);
    }
  };

  // Prepare Filter Options (Merge constants with actual data to ensure all options are visible)
  const groupOptions = useMemo(() => {
      const uniqueGroups = new Set<string>();
      // 1. Add all predefined groups from mock data (Source of Truth)
      Object.values(MOCK_STUDENTS).forEach(s => uniqueGroups.add(s.group));
      // 2. Add existing groups from submissions (In case of legacy/different data)
      submissions.forEach(s => { if(s.group) uniqueGroups.add(s.group) });
      
      return Array.from(uniqueGroups).sort().map(g => ({ label: g, value: g }));
  }, [submissions]);

  const subjectOptions = useMemo(() => {
      const uniqueSubjects = new Set<string>(SUBJECTS);
      // Add subjects found in submissions just in case
      submissions.forEach(s => { if(s.subject) uniqueSubjects.add(s.subject) });
      
      return Array.from(uniqueSubjects).sort().map(s => ({ label: s, value: s }));
  }, [submissions]);

  return (
    <div className="space-y-6 animate-fade-in">
        {/* Header & Controls */}
        <div className="flex flex-col gap-4">
            <div className="flex justify-between items-center">
                 <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                    <Star className="text-yellow-500" /> ตรวจให้คะแนน
                 </h2>
                 <button 
                    onClick={fetchData} 
                    disabled={loading}
                    className="flex items-center gap-2 text-sm font-bold text-gray-600 hover:text-black bg-white px-3 py-1.5 rounded-lg border-2 border-gray-200 hover:border-black transition-all active:scale-95"
                 >
                    <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
                    {loading ? 'กำลังโหลด...' : 'รีเฟรชข้อมูล'}
                 </button>
            </div>

            {/* Filter Bar */}
            <div className="bg-white p-4 rounded-xl border-2 border-black neo-brutalism-sm flex flex-col md:flex-row gap-4 items-end md:items-start">
                <div className="w-full md:w-auto flex items-center gap-2 text-pink-600 font-bold min-w-[80px] pt-3">
                    <Search size={20} /> กรอง
                </div>
                <div className="flex-1 w-full grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Select 
                        label="ห้องเรียน"
                        options={groupOptions}
                        value={filterGroup}
                        onChange={(e) => setFilterGroup(e.target.value)}
                        placeholder="-- แสดงทุกห้องเรียน --"
                        disablePlaceholder={false} 
                    />
                    <Select 
                        label="วิชา"
                        options={subjectOptions}
                        value={filterSubject}
                        onChange={(e) => setFilterSubject(e.target.value)}
                        placeholder="-- แสดงทุกวิชา --"
                        disablePlaceholder={false}
                    />
                </div>
            </div>
            
            <div className="flex justify-between items-center px-1">
                <p className="text-sm text-gray-500">
                    พบงานทั้งหมด <span className="font-bold text-black">{filteredSubmissions.length}</span> รายการ
                    {(filterGroup || filterSubject) && ' (จากตัวกรอง)'}
                </p>
            </div>
        </div>

        {/* Submissions List */}
        {loading && submissions.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-12 bg-white rounded-xl border-2 border-dashed border-gray-200">
                <div className="w-12 h-12 border-4 border-pink-200 border-t-pink-500 rounded-full animate-spin mb-4"></div>
                <p className="text-gray-500">กำลังดึงข้อมูล...</p>
            </div>
        ) : (
            <div className="space-y-4">
                {filteredSubmissions.length === 0 ? (
                    <div className="text-center py-12 text-gray-400 bg-white/50 rounded-xl border-dashed border-2 border-gray-300">
                        ไม่พบข้อมูลการส่งงาน {filterGroup || filterSubject ? 'ตามเงื่อนไขที่เลือก' : ''}
                    </div>
                ) : (
                    filteredSubmissions.map((sub) => (
                        <div key={sub.rowId} className="bg-white rounded-xl border-2 border-gray-200 overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                            {/* Header */}
                            <div className="bg-pink-50 p-3 border-b-2 border-pink-100 flex justify-between items-start">
                                <div>
                                    <div className="flex gap-2 mb-1">
                                        <span className="bg-black text-white text-xs px-2 py-0.5 rounded font-bold">{sub.group}</span>
                                        <span className="bg-pink-200 text-pink-800 text-xs px-2 py-0.5 rounded font-bold">{sub.subject}</span>
                                    </div>
                                    <h3 className="font-bold text-gray-800">{sub.assignmentTitle}</h3>
                                </div>
                                <span className="text-xs text-gray-500 bg-white px-2 py-1 rounded border border-gray-200 h-fit whitespace-nowrap">
                                    {new Date(sub.timestamp).toLocaleDateString('th-TH', { 
                                        day: 'numeric', month: 'short', year: '2-digit', hour: '2-digit', minute: '2-digit' 
                                    })}
                                </span>
                            </div>

                            {/* Content */}
                            <div className="p-4 grid md:grid-cols-2 gap-6">
                                {/* Student Info */}
                                <div>
                                    <h4 className="font-bold text-sm text-gray-500 mb-2 flex items-center gap-1">
                                        <Star size={14} /> สมาชิกกลุ่ม
                                    </h4>
                                    <ul className="space-y-1 mb-3">
                                        {sub.members.map((m, idx) => (
                                            <li key={idx} className="text-sm text-gray-700 bg-gray-50 px-2 py-1 rounded border border-gray-100 flex justify-between">
                                                <span>{idx + 1}. {m.name}</span>
                                                <span className="text-xs text-gray-400 font-mono">{m.id}</span>
                                            </li>
                                        ))}
                                    </ul>

                                    <div className="flex gap-2 flex-wrap">
                                        {sub.link && (
                                            <a href={sub.link} target="_blank" rel="noreferrer" className="flex items-center gap-1 text-xs bg-blue-50 text-blue-600 px-3 py-2 rounded-lg border border-blue-200 hover:bg-blue-100 transition-colors">
                                                <ExternalLink size={14} /> เปิดลิงก์งาน
                                            </a>
                                        )}
                                        {sub.fileUrl && (
                                            <a href={sub.fileUrl} target="_blank" rel="noreferrer" className="flex items-center gap-1 text-xs bg-orange-50 text-orange-600 px-3 py-2 rounded-lg border border-orange-200 hover:bg-orange-100 transition-colors">
                                                <Download size={14} /> ดาวน์โหลดไฟล์
                                            </a>
                                        )}
                                    </div>
                                </div>

                                {/* Grading Section */}
                                <div className="bg-gray-50 p-4 rounded-xl border border-gray-200 flex flex-col justify-between">
                                    <div>
                                        <h4 className="font-bold text-sm text-gray-800 mb-2 flex items-center gap-1">
                                            <MessageCircle size={16} className="text-purple-500" /> การให้คะแนน
                                        </h4>
                                        <div className="flex gap-2 mb-2">
                                            <div className="w-1/3">
                                                <Input 
                                                    placeholder="คะแนน" 
                                                    value={grades[sub.rowId]?.score || ''}
                                                    onChange={(e) => handleGradeChange(sub.rowId, 'score', e.target.value)}
                                                    className="text-center font-bold text-purple-600 h-[42px]"
                                                />
                                            </div>
                                            <div className="flex-1">
                                                <Input 
                                                    placeholder="ข้อเสนอแนะ..." 
                                                    value={grades[sub.rowId]?.feedback || ''}
                                                    onChange={(e) => handleGradeChange(sub.rowId, 'feedback', e.target.value)}
                                                    className="h-[42px]"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                    <Button 
                                        onClick={() => handleSaveGrade(sub.rowId)}
                                        isLoading={savingId === sub.rowId}
                                        variant="secondary"
                                        className="w-full text-sm py-2 bg-purple-600 text-white hover:bg-purple-700 border-none shadow-md"
                                    >
                                        <Save size={16} /> บันทึกผลการตรวจ
                                    </Button>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>
        )}
    </div>
  );
};