import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  User,
  GraduationCap,
  Cpu,
  PenTool,
  Upload,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  ArrowLeft,
  X,
  Plus,
  FileText,
  FileCheck,
  Shield,
  Loader2,
  Edit3,
} from 'lucide-react';
import { RegistrationFormData, CourseType, AcademicYear } from '../types/index.js';
import { submitStudentApplication } from '../services/api.js';
import { useToast } from '../context/ToastContext.js';

const PREDEFINED_SKILLS = [
  'Cyber Security',
  'Ethical Hacking',
  'Penetration Testing',
  'Web Application Security',
  'Network Security',
  'Digital Forensics',
  'Cyber Forensics',
  'OSINT',
  'Incident Response',
  'Malware Analysis',
  'SOC',
  'SIEM',
  'Vulnerability Assessment',
  'VAPT',
  'Linux',
  'Python',
  'Networking',
  'Cryptography',
  'Threat Intelligence',
  'Cloud Security',
  'Mobile Security',
  'API Security',
  'Security Operations',
  'Bug Bounty',
  'Burp Suite',
  'Wireshark',
  'Metasploit',
  'Threat Hunting',
  'Reverse Engineering',
  'DFIR',
];

const STEPS = [
  { id: 1, name: 'Personal', icon: User },
  { id: 2, name: 'Academic', icon: GraduationCap },
  { id: 3, name: 'Skills', icon: Cpu },
  { id: 4, name: 'Motivation', icon: PenTool },
  { id: 5, name: 'Resume', icon: Upload },
  { id: 6, name: 'Review', icon: CheckCircle2 },
];

export const Register: React.FC = () => {
  const navigate = useNavigate();
  const toast = useToast();

  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionError, setSubmissionError] = useState<string | null>(null);

  // Form Data State
  const [formData, setFormData] = useState<RegistrationFormData>({
    fullName: '',
    mobile: '',
    email: '',
    course: '',
    year: '',
    universityName: '',
    skills: [],
    customSkills: [],
    motivation: '',
    resumeFile: null,
  });

  // Custom skill input state
  const [customSkillInput, setCustomSkillInput] = useState('');
  const [customSkillError, setCustomSkillError] = useState('');

  // Step validation errors
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Restore form state from sessionStorage if user accidentally reloads
  useEffect(() => {
    try {
      const saved = sessionStorage.getItem('alwar_internship_draft');
      if (saved) {
        const parsed = JSON.parse(saved);
        setFormData((prev) => ({
          ...prev,
          ...parsed,
          resumeFile: null, // File object cannot be serialized
        }));
      }
    } catch {
      // ignore
    }
  }, []);

  // Save draft state
  const saveDraft = (data: RegistrationFormData) => {
    try {
      const { resumeFile, ...serializable } = data;
      sessionStorage.setItem('alwar_internship_draft', JSON.stringify(serializable));
    } catch {
      // ignore
    }
  };

  // Step 1 Validation
  const validateStep1 = (): boolean => {
    const newErrors: Record<string, string> = {};
    if (!formData.fullName.trim() || formData.fullName.trim().length < 2) {
      newErrors.fullName = 'Full Name is required (at least 2 characters).';
    }
    const mobileRegex = /^[6-9]\d{9}$/;
    if (!formData.mobile.trim() || !mobileRegex.test(formData.mobile.trim())) {
      newErrors.mobile = 'Enter a valid 10-digit Indian mobile number (e.g. 9876543210).';
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email.trim() || !emailRegex.test(formData.email.trim())) {
      newErrors.email = 'Enter a valid email address.';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Step 2 Validation
  const validateStep2 = (): boolean => {
    const newErrors: Record<string, string> = {};
    if (!formData.course || !['BCA', 'B.Tech', 'MCA'].includes(formData.course)) {
      newErrors.course = 'Please select an eligible course (BCA, B.Tech, or MCA).';
    }
    if (!formData.year || !['2nd Year', '3rd Year', '4th Year'].includes(formData.year)) {
      newErrors.year = 'Please select an eligible academic year (2nd, 3rd, or 4th Year).';
    }
    if (!formData.universityName.trim() || formData.universityName.trim().length < 3) {
      newErrors.universityName = 'University or College Name is required (at least 3 characters).';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Step 3 Validation
  const validateStep3 = (): boolean => {
    const newErrors: Record<string, string> = {};
    const totalSkills = formData.skills.length + formData.customSkills.length;
    if (totalSkills === 0) {
      newErrors.skills = 'Please select or add at least one Cyber Security skill.';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Step 4 Validation
  const validateStep4 = (): boolean => {
    const newErrors: Record<string, string> = {};
    const len = formData.motivation.trim().length;
    if (len < 50) {
      newErrors.motivation = `Motivation statement must be at least 50 characters (currently ${len}/50).`;
    } else if (len > 1000) {
      newErrors.motivation = `Motivation statement cannot exceed 1000 characters (currently ${len}/1000).`;
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Step 5 Validation
  const validateStep5 = (): boolean => {
    const newErrors: Record<string, string> = {};
    if (!formData.resumeFile) {
      newErrors.resume = 'Please upload your resume (PDF, DOC, or DOCX up to 5MB).';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    let isValid = false;
    if (currentStep === 1) isValid = validateStep1();
    else if (currentStep === 2) isValid = validateStep2();
    else if (currentStep === 3) isValid = validateStep3();
    else if (currentStep === 4) isValid = validateStep4();
    else if (currentStep === 5) isValid = validateStep5();
    else isValid = true;

    if (isValid) {
      setErrors({});
      saveDraft(formData);
      setCurrentStep((prev) => Math.min(prev + 1, 6));
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleBack = () => {
    setErrors({});
    setCurrentStep((prev) => Math.max(prev - 1, 1));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Skill toggling
  const toggleSkill = (skill: string) => {
    setFormData((prev) => {
      const exists = prev.skills.includes(skill);
      const updated = exists
        ? prev.skills.filter((s) => s !== skill)
        : [...prev.skills, skill];
      const nextData = { ...prev, skills: updated };
      saveDraft(nextData);
      return nextData;
    });
  };

  // Custom skill adding
  const addCustomSkill = () => {
    const trimmed = customSkillInput.trim();
    if (!trimmed) return;
    if (trimmed.length < 2 || trimmed.length > 50) {
      setCustomSkillError('Custom skill must be between 2 and 50 characters.');
      return;
    }
    const allSkillsLower = [
      ...PREDEFINED_SKILLS.map((s) => s.toLowerCase()),
      ...formData.customSkills.map((s) => s.toLowerCase()),
    ];
    if (allSkillsLower.includes(trimmed.toLowerCase())) {
      setCustomSkillError('This skill is already present in the list.');
      return;
    }

    setFormData((prev) => {
      const nextData = { ...prev, customSkills: [...prev.customSkills, trimmed] };
      saveDraft(nextData);
      return nextData;
    });
    setCustomSkillInput('');
    setCustomSkillError('');
  };

  const removeCustomSkill = (skillToRemove: string) => {
    setFormData((prev) => {
      const nextData = {
        ...prev,
        customSkills: prev.customSkills.filter((s) => s !== skillToRemove),
      };
      saveDraft(nextData);
      return nextData;
    });
  };

  // Resume File Drop / Selection handler
  const handleFileChange = (file: File | null) => {
    if (!file) return;

    // Validate size (5MB = 5 * 1024 * 1024)
    if (file.size > 5 * 1024 * 1024) {
      setErrors({ resume: 'File size exceeds 5MB limit. Please upload a smaller document.' });
      return;
    }

    // Validate extension
    const validExts = ['.pdf', '.doc', '.docx'];
    const ext = '.' + file.name.split('.').pop()?.toLowerCase();
    if (!validExts.includes(ext)) {
      setErrors({ resume: 'Invalid file type. Only PDF, DOC, and DOCX files are allowed.' });
      return;
    }

    setErrors({});
    setFormData((prev) => ({ ...prev, resumeFile: file }));
  };

  // Final Submission
  const handleSubmit = async () => {
    if (!validateStep1() || !validateStep2() || !validateStep3() || !validateStep4() || !validateStep5()) {
      toast.error('Please complete all required fields properly before submitting.');
      return;
    }

    setIsSubmitting(true);
    setSubmissionError(null);

    try {
      const submissionBody = new FormData();
      submissionBody.append('fullName', formData.fullName.trim());
      submissionBody.append('mobile', formData.mobile.trim());
      submissionBody.append('email', formData.email.toLowerCase().trim());
      submissionBody.append('course', formData.course);
      submissionBody.append('year', formData.year);
      submissionBody.append('universityName', formData.universityName.trim());
      submissionBody.append('skills', JSON.stringify(formData.skills));
      submissionBody.append('customSkills', JSON.stringify(formData.customSkills));
      submissionBody.append('motivation', formData.motivation.trim());

      if (formData.resumeFile) {
        submissionBody.append('resume', formData.resumeFile);
      }

      const result = await submitStudentApplication(submissionBody);

      // Clear draft
      sessionStorage.removeItem('alwar_internship_draft');

      toast.success('Application submitted successfully!');

      // Redirect to Registration Success page with state
      navigate('/registration-success', {
        state: {
          applicationId: result.applicationId,
          applicantName: result.fullName,
          course: result.course,
          year: result.year,
          submissionDate: result.createdAt,
          email: result.email,
          mobile: result.mobile,
        },
      });
    } catch (err: any) {
      const msg = err.message || 'Submission failed. Please check your details and try again.';
      setSubmissionError(msg);
      toast.error(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-12 max-w-3xl">
      {/* Registration Header */}
      <div className="text-center space-y-2 mb-8">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-police-100 text-police-800 text-xs font-semibold">
          <Shield className="w-3.5 h-3.5 text-police-700" />
          <span>Alwar Police Internship Programme 2026</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-police-900 tracking-tight">
          Student Registration Wizard
        </h1>
        <p className="text-xs sm:text-sm text-slate-600 max-w-lg mx-auto">
          Cyber Security Internship Programme • Step-by-Step Application
        </p>
      </div>

      {/* Multi-Step Progress Indicator */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs mb-8">
        <div className="flex items-center justify-between relative">
          {/* Connecting line */}
          <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-1 bg-slate-200 -z-0"></div>
          <div
            className="absolute left-0 top-1/2 -translate-y-1/2 h-1 bg-police-700 transition-all duration-300 -z-0"
            style={{ width: `${((currentStep - 1) / (STEPS.length - 1)) * 100}%` }}
          ></div>

          {STEPS.map((step) => {
            const Icon = step.icon;
            const isCompleted = currentStep > step.id;
            const isCurrent = currentStep === step.id;

            return (
              <button
                key={step.id}
                type="button"
                onClick={() => {
                  if (step.id < currentStep) {
                    setCurrentStep(step.id);
                  }
                }}
                disabled={step.id > currentStep}
                className="flex flex-col items-center gap-1.5 relative z-10 focus:outline-hidden disabled:cursor-not-allowed group"
              >
                <div
                  className={`w-9 h-9 sm:w-10 sm:h-10 rounded-full flex items-center justify-center font-bold text-xs sm:text-sm transition-all ${
                    isCompleted
                      ? 'bg-emerald-600 text-white shadow-md'
                      : isCurrent
                      ? 'bg-police-900 text-white ring-4 ring-police-100 shadow-md'
                      : 'bg-white text-slate-400 border-2 border-slate-300'
                  }`}
                >
                  {isCompleted ? <CheckCircle2 className="w-5 h-5" /> : <Icon className="w-4 h-4" />}
                </div>
                <span
                  className={`text-[10px] sm:text-xs font-semibold hidden md:block ${
                    isCurrent ? 'text-police-900 font-bold' : 'text-slate-500'
                  }`}
                >
                  {step.name}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Form Card */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sm:p-8 space-y-6">
        {/* Error Banner if any */}
        {submissionError && (
          <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs sm:text-sm flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <span className="font-bold">Submission Notice</span>
              <p>{submissionError}</p>
            </div>
          </div>
        )}

        {/* STEP 1: PERSONAL DETAILS */}
        {currentStep === 1 && (
          <div className="space-y-5 animate-in fade-in duration-200">
            <div className="border-b border-slate-100 pb-3">
              <h2 className="text-lg font-bold text-police-900 flex items-center gap-2">
                <User className="w-5 h-5 text-police-700" />
                Step 1: Personal Information
              </h2>
              <p className="text-xs text-slate-500">Provide your verified contact and identity details.</p>
            </div>

            {/* Full Name */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
                Full Name <span className="text-rose-600">*</span>
              </label>
              <input
                type="text"
                value={formData.fullName}
                onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                placeholder="e.g. Abhishek Sharma"
                className={`w-full px-4 py-3 rounded-xl border text-sm focus:ring-2 focus:ring-police-700 focus:outline-hidden transition-all ${
                  errors.fullName ? 'border-rose-400 bg-rose-50/30' : 'border-slate-300 bg-slate-50/50'
                }`}
              />
              {errors.fullName && <p className="text-xs text-rose-600 font-medium">{errors.fullName}</p>}
            </div>

            {/* Mobile Number */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
                Mobile Number <span className="text-rose-600">*</span>
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400 font-mono">
                  +91
                </span>
                <input
                  type="tel"
                  maxLength={10}
                  value={formData.mobile}
                  onChange={(e) => {
                    const cleaned = e.target.value.replace(/\D/g, '');
                    setFormData({ ...formData, mobile: cleaned });
                  }}
                  placeholder="9876543210 (10 digits)"
                  className={`w-full pl-12 pr-4 py-3 rounded-xl border text-sm font-mono focus:ring-2 focus:ring-police-700 focus:outline-hidden transition-all ${
                    errors.mobile ? 'border-rose-400 bg-rose-50/30' : 'border-slate-300 bg-slate-50/50'
                  }`}
                />
              </div>
              {errors.mobile && <p className="text-xs text-rose-600 font-medium">{errors.mobile}</p>}
              <p className="text-[11px] text-slate-500">Official notifications and interview schedules will be sent to this number.</p>
            </div>

            {/* Email Address */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
                Email Address <span className="text-rose-600">*</span>
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value.toLowerCase().trim() })}
                placeholder="abhishek.student@gmail.com"
                className={`w-full px-4 py-3 rounded-xl border text-sm focus:ring-2 focus:ring-police-700 focus:outline-hidden transition-all ${
                  errors.email ? 'border-rose-400 bg-rose-50/30' : 'border-slate-300 bg-slate-50/50'
                }`}
              />
              {errors.email && <p className="text-xs text-rose-600 font-medium">{errors.email}</p>}
            </div>
          </div>
        )}

        {/* STEP 2: ACADEMIC DETAILS */}
        {currentStep === 2 && (
          <div className="space-y-5 animate-in fade-in duration-200">
            <div className="border-b border-slate-100 pb-3">
              <h2 className="text-lg font-bold text-police-900 flex items-center gap-2">
                <GraduationCap className="w-5 h-5 text-police-700" />
                Step 2: Academic Qualifications
              </h2>
              <p className="text-xs text-slate-500">Only enrolled BCA, B.Tech, and MCA students in 2nd/3rd/4th year are eligible.</p>
            </div>

            {/* Course */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
                Current Course <span className="text-rose-600">*</span>
              </label>
              <select
                value={formData.course}
                onChange={(e) => setFormData({ ...formData, course: e.target.value as CourseType })}
                className={`w-full px-4 py-3 rounded-xl border text-sm font-medium focus:ring-2 focus:ring-police-700 focus:outline-hidden transition-all ${
                  errors.course ? 'border-rose-400 bg-rose-50/30' : 'border-slate-300 bg-slate-50/50'
                }`}
              >
                <option value="">-- Select Eligible Course --</option>
                <option value="BCA">BCA (Bachelor of Computer Applications)</option>
                <option value="B.Tech">B.Tech (Bachelor of Technology)</option>
                <option value="MCA">MCA (Master of Computer Applications)</option>
              </select>
              {errors.course && <p className="text-xs text-rose-600 font-medium">{errors.course}</p>}
            </div>

            {/* Academic Year */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
                Year of Study <span className="text-rose-600">*</span>
              </label>
              <select
                value={formData.year}
                onChange={(e) => setFormData({ ...formData, year: e.target.value as AcademicYear })}
                className={`w-full px-4 py-3 rounded-xl border text-sm font-medium focus:ring-2 focus:ring-police-700 focus:outline-hidden transition-all ${
                  errors.year ? 'border-rose-400 bg-rose-50/30' : 'border-slate-300 bg-slate-50/50'
                }`}
              >
                <option value="">-- Select Eligible Year --</option>
                <option value="2nd Year">2nd Year</option>
                <option value="3rd Year">3rd Year</option>
                <option value="4th Year">4th Year</option>
              </select>
              {errors.year && <p className="text-xs text-rose-600 font-medium">{errors.year}</p>}
            </div>

            {/* University / College Name */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
                University / College Name <span className="text-rose-600">*</span>
              </label>
              <input
                type="text"
                value={formData.universityName}
                onChange={(e) => setFormData({ ...formData, universityName: e.target.value })}
                placeholder="e.g. Rajasthan Technical University / University of Rajasthan"
                className={`w-full px-4 py-3 rounded-xl border text-sm focus:ring-2 focus:ring-police-700 focus:outline-hidden transition-all ${
                  errors.universityName ? 'border-rose-400 bg-rose-50/30' : 'border-slate-300 bg-slate-50/50'
                }`}
              />
              {errors.universityName && <p className="text-xs text-rose-600 font-medium">{errors.universityName}</p>}
            </div>
          </div>
        )}

        {/* STEP 3: CYBER SECURITY SKILLS */}
        {currentStep === 3 && (
          <div className="space-y-5 animate-in fade-in duration-200">
            <div className="border-b border-slate-100 pb-3">
              <h2 className="text-lg font-bold text-police-900 flex items-center gap-2">
                <Cpu className="w-5 h-5 text-police-700" />
                Step 3: Cyber Security Competencies & Skills
              </h2>
              <p className="text-xs text-slate-500">
                Select your technical proficiencies (multiple selections allowed) or add custom cyber skills.
              </p>
            </div>

            {/* Predefined skill chips */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
                Predefined Skills (Click to select/deselect)
              </label>
              <div className="flex flex-wrap gap-2 max-h-60 overflow-y-auto p-3 bg-slate-50 rounded-xl border border-slate-200">
                {PREDEFINED_SKILLS.map((skill) => {
                  const isSelected = formData.skills.includes(skill);
                  return (
                    <button
                      key={skill}
                      type="button"
                      onClick={() => toggleSkill(skill)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center gap-1.5 ${
                        isSelected
                          ? 'bg-police-900 text-white shadow-xs scale-102 ring-2 ring-police-700'
                          : 'bg-white text-slate-700 border border-slate-300 hover:bg-slate-100'
                      }`}
                    >
                      <span>{skill}</span>
                      {isSelected ? <CheckCircle2 className="w-3.5 h-3.5 text-cyber-blue" /> : <Plus className="w-3 h-3 text-slate-400" />}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Custom skill adder */}
            <div className="space-y-2 pt-2">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
                + Add Custom Skill
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={customSkillInput}
                  onChange={(e) => {
                    setCustomSkillInput(e.target.value);
                    setCustomSkillError('');
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      addCustomSkill();
                    }
                  }}
                  placeholder="e.g. Memory Forensics, Android Security, SCADA"
                  className="flex-1 px-4 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-police-700 focus:outline-hidden"
                />
                <button
                  type="button"
                  onClick={addCustomSkill}
                  className="bg-police-800 hover:bg-police-900 text-white px-4 py-2.5 rounded-xl text-xs font-bold transition-colors"
                >
                  Add Skill
                </button>
              </div>
              {customSkillError && <p className="text-xs text-rose-600">{customSkillError}</p>}

              {/* Selected Custom Skills */}
              {formData.customSkills.length > 0 && (
                <div className="space-y-1.5 pt-2">
                  <span className="text-[11px] font-semibold text-slate-500 uppercase">
                    Your Custom Added Skills:
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {formData.customSkills.map((cs) => (
                      <span
                        key={cs}
                        className="bg-cyan-50 border border-cyan-300 text-cyan-900 px-3 py-1 rounded-lg text-xs font-medium flex items-center gap-1.5"
                      >
                        <span>{cs}</span>
                        <button
                          type="button"
                          onClick={() => removeCustomSkill(cs)}
                          className="text-cyan-700 hover:text-rose-600"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {errors.skills && <p className="text-xs text-rose-600 font-medium">{errors.skills}</p>}

            {/* Total Selected Counter */}
            <div className="p-3 bg-blue-50/70 border border-blue-200 rounded-xl text-xs text-police-900 flex justify-between items-center">
              <span>Total Selected Skills:</span>
              <strong className="font-bold text-sm text-police-900">
                {formData.skills.length + formData.customSkills.length} skills
              </strong>
            </div>
          </div>
        )}

        {/* STEP 4: MOTIVATION */}
        {currentStep === 4 && (
          <div className="space-y-5 animate-in fade-in duration-200">
            <div className="border-b border-slate-100 pb-3">
              <h2 className="text-lg font-bold text-police-900 flex items-center gap-2">
                <PenTool className="w-5 h-5 text-police-700" />
                Step 4: Statement of Motivation
              </h2>
              <p className="text-xs text-slate-500">
                Explain your interest in cyber security and what you hope to achieve through this internship.
              </p>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
                Why do you want to join the Alwar Police Internship Programme 2026? <span className="text-rose-600">*</span>
              </label>
              <textarea
                rows={6}
                value={formData.motivation}
                onChange={(e) => setFormData({ ...formData, motivation: e.target.value })}
                placeholder="Tell us about your interest in cyber security, your learning goals and how this internship will help you develop your practical skills."
                className={`w-full p-4 rounded-xl border text-sm leading-relaxed focus:ring-2 focus:ring-police-700 focus:outline-hidden transition-all ${
                  errors.motivation ? 'border-rose-400 bg-rose-50/30' : 'border-slate-300 bg-slate-50/50'
                }`}
              />
              <div className="flex justify-between items-center text-xs">
                <span className={formData.motivation.length < 50 ? 'text-amber-600 font-medium' : 'text-emerald-700 font-medium'}>
                  {formData.motivation.length < 50
                    ? `Minimum 50 characters required (${50 - formData.motivation.length} more)`
                    : 'Character requirement satisfied'}
                </span>
                <span className={`font-mono ${formData.motivation.length > 1000 ? 'text-rose-600 font-bold' : 'text-slate-500'}`}>
                  {formData.motivation.length} / 1000 characters
                </span>
              </div>
              {errors.motivation && <p className="text-xs text-rose-600 font-medium">{errors.motivation}</p>}
            </div>
          </div>
        )}

        {/* STEP 5: RESUME UPLOAD */}
        {currentStep === 5 && (
          <div className="space-y-5 animate-in fade-in duration-200">
            <div className="border-b border-slate-100 pb-3">
              <h2 className="text-lg font-bold text-police-900 flex items-center gap-2">
                <Upload className="w-5 h-5 text-police-700" />
                Step 5: Resume / CV Upload
              </h2>
              <p className="text-xs text-slate-500">
                Upload your updated CV in PDF, DOC, or DOCX format (Max size: 5 MB).
              </p>
            </div>

            <div className="space-y-3">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
                Attach Resume Document <span className="text-rose-600">*</span>
              </label>

              <div
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => {
                  e.preventDefault();
                  if (e.dataTransfer.files && e.dataTransfer.files[0]) {
                    handleFileChange(e.dataTransfer.files[0]);
                  }
                }}
                className="border-2 border-dashed border-police-300 hover:border-police-600 bg-slate-50/80 hover:bg-blue-50/30 rounded-2xl p-8 text-center transition-all cursor-pointer relative"
              >
                <input
                  type="file"
                  accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                  onChange={(e) => {
                    if (e.target.files && e.target.files[0]) {
                      handleFileChange(e.target.files[0]);
                    }
                  }}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />

                <div className="flex flex-col items-center gap-3">
                  <div className="w-14 h-14 rounded-2xl bg-police-100 text-police-700 flex items-center justify-center shadow-xs">
                    <FileText className="w-7 h-7" />
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm font-bold text-slate-800">
                      Click to browse or drag and drop your resume file
                    </p>
                    <p className="text-xs text-slate-500">
                      Accepted formats: <strong>PDF, DOC, DOCX</strong> • Up to 5 MB
                    </p>
                  </div>
                </div>
              </div>

              {formData.resumeFile && (
                <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <FileCheck className="w-6 h-6 text-emerald-600" />
                    <div>
                      <p className="text-xs font-bold text-emerald-950">{formData.resumeFile.name}</p>
                      <p className="text-[11px] text-emerald-700">
                        {(formData.resumeFile.size / (1024 * 1024)).toFixed(2)} MB • Ready for submission
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, resumeFile: null })}
                    className="text-slate-400 hover:text-rose-600"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              )}

              {errors.resume && <p className="text-xs text-rose-600 font-medium">{errors.resume}</p>}
            </div>
          </div>
        )}

        {/* STEP 6: REVIEW APPLICATION */}
        {currentStep === 6 && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <div className="border-b border-slate-100 pb-3">
              <h2 className="text-lg font-bold text-police-900 flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-police-700" />
                Step 6: Review & Final Confirmation
              </h2>
              <p className="text-xs text-slate-500">
                Please verify all details carefully before final submission.
              </p>
            </div>

            {/* Section 1: Personal Review */}
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
              <div className="flex items-center justify-between border-b border-slate-200/80 pb-2">
                <h3 className="text-xs font-bold uppercase text-police-800 tracking-wider">
                  1. Personal Details
                </h3>
                <button
                  type="button"
                  onClick={() => setCurrentStep(1)}
                  className="text-xs text-police-600 hover:text-police-900 font-semibold flex items-center gap-1"
                >
                  <Edit3 className="w-3.5 h-3.5" /> Edit
                </button>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
                <div>
                  <span className="text-slate-500 block">Full Name:</span>
                  <span className="font-bold text-slate-900">{formData.fullName}</span>
                </div>
                <div>
                  <span className="text-slate-500 block">Mobile:</span>
                  <span className="font-mono text-slate-900">{formData.mobile}</span>
                </div>
                <div>
                  <span className="text-slate-500 block">Email:</span>
                  <span className="font-mono text-slate-900">{formData.email}</span>
                </div>
              </div>
            </div>

            {/* Section 2: Academic Review */}
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
              <div className="flex items-center justify-between border-b border-slate-200/80 pb-2">
                <h3 className="text-xs font-bold uppercase text-police-800 tracking-wider">
                  2. Academic Qualifications
                </h3>
                <button
                  type="button"
                  onClick={() => setCurrentStep(2)}
                  className="text-xs text-police-600 hover:text-police-900 font-semibold flex items-center gap-1"
                >
                  <Edit3 className="w-3.5 h-3.5" /> Edit
                </button>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
                <div>
                  <span className="text-slate-500 block">Course:</span>
                  <span className="font-bold text-slate-900">{formData.course}</span>
                </div>
                <div>
                  <span className="text-slate-500 block">Year:</span>
                  <span className="font-bold text-slate-900">{formData.year}</span>
                </div>
                <div>
                  <span className="text-slate-500 block">University:</span>
                  <span className="font-semibold text-slate-900">{formData.universityName}</span>
                </div>
              </div>
            </div>

            {/* Section 3: Skills Review */}
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
              <div className="flex items-center justify-between border-b border-slate-200/80 pb-2">
                <h3 className="text-xs font-bold uppercase text-police-800 tracking-wider">
                  3. Cyber Security Skills ({formData.skills.length + formData.customSkills.length})
                </h3>
                <button
                  type="button"
                  onClick={() => setCurrentStep(3)}
                  className="text-xs text-police-600 hover:text-police-900 font-semibold flex items-center gap-1"
                >
                  <Edit3 className="w-3.5 h-3.5" /> Edit
                </button>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {[...formData.skills, ...formData.customSkills].map((s, idx) => (
                  <span key={idx} className="bg-white border border-slate-300 text-slate-800 px-2 py-0.5 rounded text-xs">
                    {s}
                  </span>
                ))}
              </div>
            </div>

            {/* Section 4: Motivation Review */}
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
              <div className="flex items-center justify-between border-b border-slate-200/80 pb-2">
                <h3 className="text-xs font-bold uppercase text-police-800 tracking-wider">
                  4. Motivation Statement
                </h3>
                <button
                  type="button"
                  onClick={() => setCurrentStep(4)}
                  className="text-xs text-police-600 hover:text-police-900 font-semibold flex items-center gap-1"
                >
                  <Edit3 className="w-3.5 h-3.5" /> Edit
                </button>
              </div>
              <p className="text-xs text-slate-700 italic leading-relaxed">
                "{formData.motivation}"
              </p>
            </div>

            {/* Section 5: Resume Review */}
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
              <div className="flex items-center justify-between border-b border-slate-200/80 pb-2">
                <h3 className="text-xs font-bold uppercase text-police-800 tracking-wider">
                  5. Attached Resume
                </h3>
                <button
                  type="button"
                  onClick={() => setCurrentStep(5)}
                  className="text-xs text-police-600 hover:text-police-900 font-semibold flex items-center gap-1"
                >
                  <Edit3 className="w-3.5 h-3.5" /> Edit
                </button>
              </div>
              <p className="text-xs font-bold text-slate-900 flex items-center gap-2">
                <FileCheck className="w-4 h-4 text-emerald-600" />
                {formData.resumeFile?.name || 'Resume Attached'}
              </p>
            </div>

            {/* Declaration Checkbox */}
            <div className="p-4 rounded-xl bg-blue-50 border border-blue-200 text-xs text-police-950 space-y-2">
              <p className="font-semibold">Applicant Self-Certification:</p>
              <p className="text-[11px] leading-relaxed text-slate-700">
                I hereby declare that I am a bona fide student of the selected eligible course and academic year. All details and technical information provided are true to the best of my knowledge.
              </p>
            </div>

            {/* Need Help Box */}
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
              <span className="text-slate-600">Need help with registration?</span>
              <div className="flex items-center gap-3">
                <a href="tel:9680895044" className="text-police-700 hover:text-police-950 font-bold">
                  Abhishek Sharma: 9680895044
                </a>
                <span className="text-slate-300">•</span>
                <a href="tel:8239930511" className="text-police-700 hover:text-police-950 font-bold">
                  Sachin Yadav: 8239930511
                </a>
              </div>
            </div>
          </div>
        )}

        {/* Navigation Actions */}
        <div className="border-t border-slate-100 pt-6 flex items-center justify-between gap-4">
          {currentStep > 1 ? (
            <button
              type="button"
              onClick={handleBack}
              disabled={isSubmitting}
              className="px-5 py-2.5 rounded-xl border border-slate-300 hover:bg-slate-50 text-slate-700 font-semibold text-xs transition-colors flex items-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back</span>
            </button>
          ) : (
            <div></div>
          )}

          {currentStep < 6 ? (
            <button
              type="button"
              onClick={handleNext}
              className="px-6 py-2.5 rounded-xl bg-police-800 hover:bg-police-900 text-white font-bold text-xs shadow-md transition-all flex items-center gap-2"
            >
              <span>Continue</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              type="button"
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="px-8 py-3 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-sm shadow-lg shadow-emerald-950/20 transition-all flex items-center gap-2 disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Submitting Application...</span>
                </>
              ) : (
                <>
                  <span>Submit Application</span>
                  <CheckCircle2 className="w-4 h-4" />
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
