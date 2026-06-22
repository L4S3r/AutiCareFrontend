"use client";
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Users, FileHeart, ShieldAlert, BadgeCheck, MessageSquare, Send, Award, CheckCircle2 } from 'lucide-react';
import { CareNote, Language, UserRole } from '../types';
import { CARE_NOTES, TRANSLATIONS } from '../data';
import { getCareNotes, createCareNote, approveCareNote, getPatients } from '../api';

interface CareCoordinationHubProps {
  language: Language;
  activeRole: UserRole;
  setActiveRole: (role: UserRole) => void;
}

export default function CareCoordinationHub({
  language,
  activeRole,
  setActiveRole
}: CareCoordinationHubProps) {
  const t = TRANSLATIONS[language];
  const isRtl = language === 'ar';

  const [notes, setNotes] = useState<CareNote[]>(CARE_NOTES);
  const [activeChildId, setActiveChildId] = useState<string>('');
  const [newNoteText, setNewNoteText] = useState('');
  const [newNoteCategory, setNewNoteCategory] = useState<'Medical' | 'Therapy' | 'Dietary' | 'Security'>('Medical');

  // Load child notes on start
  useEffect(() => {
    const loadNotes = async () => {
      try {
        const patientsRes = await getPatients();
        if (patientsRes.success && patientsRes.data.length > 0) {
          const childId = patientsRes.data[0]._id;
          setActiveChildId(childId);
          
          const notesRes = await getCareNotes(childId);
          if (notesRes.success && notesRes.data) {
            const mapped = notesRes.data.map((n: any) => ({
              ...n,
              id: n._id || n.id
            }));
            setNotes(mapped);
          }
        }
      } catch (err) {
        console.error('Failed to load care notes:', err);
      }
    };
    loadNotes();
  }, []);


  // Multi-actors configuration profiles
  const actorProfiles = {
    Doctor: { name: 'Dr. Karim Al-Saeed', avatar: '👨‍⚕️', color: 'border-sky-200 bg-sky-50' },
    Therapist: { name: 'Amina El-Gamil', avatar: '👩‍🏫', color: 'border-indigo-200 bg-indigo-50' },
    Parent: { name: 'Youssef Al-Farsi', avatar: '👨‍👩-👦', color: 'border-amber-200 bg-amber-50' },
    Child: { name: 'Sami Al-Farsi', avatar: '👦', color: 'border-pink-200 bg-pink-50' }
  };

  const handleAddNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNoteText.trim() || !activeChildId) return;

    try {
      const noteData = {
        childId: activeChildId,
        content: newNoteText,
        category: newNoteCategory,
        approvedByDoctor: activeRole === 'Doctor'
      };

      const res = await createCareNote(noteData);
      if (res.success) {
        const notesRes = await getCareNotes(activeChildId);
        if (notesRes.success && notesRes.data) {
          const mapped = notesRes.data.map((n: any) => ({
            ...n,
            id: n._id || n.id
          }));
          setNotes(mapped);
        }
      }
      setNewNoteText('');
    } catch (err) {
      console.error('Failed to create care note:', err);
    }
  };

  // Perform doctor certification / approval on caregiver notes
  const handleApproveNote = async (noteId: string) => {
    try {
      const res = await approveCareNote(noteId);
      if (res.success && activeChildId) {
        const notesRes = await getCareNotes(activeChildId);
        if (notesRes.success && notesRes.data) {
          const mapped = notesRes.data.map((n: any) => ({
            ...n,
            id: n._id || n.id
          }));
          setNotes(mapped);
        }
      }
    } catch (err) {
      console.error('Failed to approve note:', err);
    }
  };



  return (
    <div className="bg-white rounded-3xl border border-sky-100 shadow-md p-6 sm:p-8" id="care-coordination-workspace">
      
      {/* Header with quick role simulators */}
      <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-sky-100 pb-6 mb-8 gap-4">
        <div>
          <h3 className="text-xl font-black text-slate-800 tracking-tight flex items-center space-x-2">
            <Users className="w-5 h-5 text-sky-500" />
            <span>{t.portalCareCoord}</span>
          </h3>
          <p className="text-xs text-slate-400 mt-1">Simulate care notes and medical approvals. Parents get instantly verified meal protocols.</p>
        </div>

        {/* Dynamic Sandbox Role toggle */}
        <div className="flex items-center space-x-2">
          <span className="text-[10px] font-bold text-slate-400 font-mono text-right capitalize">
            {t.roleBtnLabel}
          </span>
          <div className="flex rounded-xl bg-slate-100 p-1 border border-slate-200">
            {(['Doctor', 'Therapist', 'Parent'] as const).map((role) => (
              <button
                key={role}
                onClick={() => setActiveRole(role)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  activeRole === role
                    ? 'bg-white text-sky-600 shadow-sm border border-slate-200'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
                id={`role-btn-${role}`}
              >
                {t[`role${role}` as keyof typeof t] || role}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Side: Clinical Note Timeline stream */}
        <div className="lg:col-span-7 space-y-5">
          <div className="space-y-3.5">
            <h4 className="text-xs font-black uppercase tracking-widest text-slate-400 font-mono">Shared Care Note Timeline Feed</h4>
            
            <div className="space-y-4 max-h-[440px] overflow-y-auto pr-1">
              <AnimatePresence initial={false}>
                {notes.map((note) => {
                  const roleStyle = actorProfiles[note.authorRole as keyof typeof actorProfiles] || actorProfiles.Parent;
                  return (
                    <motion.div
                      key={note.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className={`p-4 rounded-2xl border ${roleStyle.color} flex flex-col justify-between space-y-3.5 relative`}
                    >
                      {/* Approved clinical badge watermark on doctor authorized files */}
                      {note.approvedByDoctor && (
                        <div className="absolute top-3.5 right-3.5 flex items-center space-x-1.5 bg-emerald-50 text-emerald-700 border border-emerald-100 text-[10px] font-bold py-1 px-2.5 rounded-full select-none" title="Meets HIPAA medical supervision guidelines">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                          <span>{isRtl ? 'معتمد طبيًا' : 'Clinically Approved'}</span>
                        </div>
                      )}

                      <div className="space-y-2">
                        {/* Note header: Author metadata */}
                        <div className="flex items-center space-x-2">
                          <span className="text-2xl">{roleStyle.avatar}</span>
                          <div>
                            <span className="text-xs font-bold text-slate-800 block leading-tight">{note.authorName}</span>
                            <span className="text-[10px] font-mono text-slate-400 uppercase tracking-widest block">{note.authorRole}</span>
                          </div>
                        </div>

                        {/* Speech content */}
                        <p className="text-xs text-slate-600 leading-relaxed pt-1 select-text">
                          {note.content}
                        </p>
                      </div>

                      {/* Notes footer actions */}
                      <div className="flex items-center justify-between border-t border-slate-200/40 pt-2 text-[10px] text-slate-400 font-mono">
                        <span className="uppercase font-bold tracking-wider">{note.category} STATUS</span>
                        <div className="flex items-center space-x-2">
                          <span>{note.timestamp}</span>
                          
                          {/* Doctor action button displayed only for Doctor active simulations on pending items */}
                          {!note.approvedByDoctor && activeRole === 'Doctor' && (
                            <button
                              onClick={() => handleApproveNote(note.id)}
                              className="bg-sky-500 hover:bg-sky-600 text-white font-extrabold px-3 py-1 rounded-lg transition-colors cursor-pointer text-[9px] uppercase tracking-wider h-fit"
                              id={`approve-note-btn-${note.id}`}
                            >
                              Clinical Approbation ✓
                            </button>
                          )}
                        </div>
                      </div>

                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </div>
          </div>

          {/* Clinical note sender tool */}
          <form onSubmit={handleAddNote} className="bg-slate-50 border border-slate-100 rounded-2xl p-4 flex flex-col space-y-3">
            <div className="flex justify-between items-center text-[10px] font-bold text-slate-400 uppercase font-mono">
              <span>Write as: {actorProfiles[activeRole as keyof typeof actorProfiles]?.name || activeRole}</span>
              <div className="flex items-center space-x-1">
                <span>Category:</span>
                <select
                  value={newNoteCategory}
                  onChange={(e: any) => setNewNoteCategory(e.target.value)}
                  className="bg-white border text-[10px] rounded p-0.5 outline-none font-bold"
                >
                  <option value="Medical">Medical Note</option>
                  <option value="Therapy">Functional Behavioral note</option>
                  <option value="Dietary">Dietary nutrition</option>
                  <option value="Security">Security check</option>
                </select>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <input
                type="text"
                value={newNoteText}
                onChange={(e) => setNewNoteText(e.target.value)}
                placeholder="Log notes into caregiver timeline (e.g. child responded calmly to ABA exercises, tolerated GFCF meal...)"
                className="flex-1 bg-white border border-slate-200 rounded-xl p-3 text-xs outline-none"
              />
              <button
                type="submit"
                className="p-3 bg-sky-500 hover:bg-sky-600 text-white rounded-xl shadow-md cursor-pointer transition-transform"
                title="Broadcast Shared Note"
              >
                <Send className="w-4 h-4 text-white" />
              </button>
            </div>
          </form>

        </div>

        {/* Right Side: Doctor approbation details */}
        <div className="lg:col-span-5 space-y-6">
          
          <div className="bg-sky-50/50 border border-sky-100 rounded-2xl p-5 space-y-4">
            <h4 className="text-xs font-black uppercase tracking-widest text-sky-800 font-mono flex items-center space-x-1.5 border-b border-sky-100 pb-2">
              <Award className="w-4 h-4 text-sky-600" />
              <span>Doctor Certification Engine</span>
            </h4>

            <p className="text-[11px] text-slate-600 leading-relaxed">
              {isRtl 
                ? 'لوحة التصديق الطبي للأخصائي والمعالج. عند رصد تدوين سلوكي أو طعام من الأم، يقوم الطبيب بالفحص للتأكد من مواءمة التغذية للحمض النووي والمصادقة للوقاية من الانهيار.' 
                : 'In autism care, dietary changes can induce hyperactive episodes if methylation pathways are ignored. Doctors authorize food plans here to guarantee patient safety.'}
            </p>

            <div className="space-y-2 pt-2">
              <div className="flex items-start space-x-2 text-[11px] text-slate-500 leading-normal">
                <span className="w-4 h-4 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center text-[10px] font-bold flex-shrink-0 mt-0.5">✓</span>
                <span>Doctors must verify MTHFR markers before recommending high-folate supplements.</span>
              </div>
              <div className="flex items-start space-x-2 text-[11px] text-slate-500 leading-normal">
                <span className="w-4 h-4 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center text-[10px] font-bold flex-shrink-0 mt-0.5">✓</span>
                <span>Parents receive direct warning notifications inside their mobile apps immediately on clinical approbation.</span>
              </div>
            </div>
          </div>

          {/* Patient summary board */}
          <div className="bg-slate-50 border border-slate-100 rounded-2xl p-5 space-y-3.5">
            <h4 className="text-xs font-black uppercase text-slate-500">Connected Care Team Members</h4>
            
            <div className="space-y-2.5">
              {/* Doctor */}
              <div className="flex justify-between items-center text-xs">
                <div className="flex items-center space-x-1.5">
                  <span className="text-xl">👨‍⚕️</span>
                  <span className="font-bold text-slate-700">Dr. Karim Al-Saeed</span>
                </div>
                <span className="text-[9px] bg-sky-100 text-sky-800 px-2 py-0.5 rounded-full font-bold">CARDIOLOGIST / MD</span>
              </div>
              
              {/* Therapist */}
              <div className="flex justify-between items-center text-xs">
                <div className="flex items-center space-x-1.5">
                  <span className="text-xl">👩‍🏫</span>
                  <span className="font-bold text-slate-700">Amina El-Gamil</span>
                </div>
                <span className="text-[9px] bg-indigo-100 text-indigo-800 px-2 py-0.5 rounded-full font-bold">ABA THERAPIST / MS</span>
              </div>

              {/* Parent */}
              <div className="flex justify-between items-center text-xs">
                <div className="flex items-center space-x-1.5">
                  <span className="text-xl">👨‍👩-👦</span>
                  <span className="font-bold text-slate-700">Youssef Al-Farsi</span>
                </div>
                <span className="text-[9px] bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full font-bold">PARENT (GUARDIAN)</span>
              </div>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}
