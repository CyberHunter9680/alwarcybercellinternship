import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Shield,
  Lock,
  Terminal,
  Cpu,
  Search,
  FileCheck,
  CheckCircle2,
  AlertCircle,
  Calendar,
  Users,
  Award,
  ChevronDown,
  ArrowRight,
  Database,
  Eye,
  Server,
  Network,
} from 'lucide-react';

export const Home: React.FC = () => {
  // Quick eligibility checker state
  const [testCourse, setTestCourse] = useState('');
  const [testYear, setTestYear] = useState('');
  const [eligibilityResult, setEligibilityResult] = useState<'ELIGIBLE' | 'INELIGIBLE' | null>(null);

  const checkEligibility = (e: React.FormEvent) => {
    e.preventDefault();
    if (!testCourse || !testYear) return;

    const validCourses = ['BCA', 'B.Tech', 'MCA'];
    const validYears = ['2nd Year', '3rd Year', '4th Year'];

    if (validCourses.includes(testCourse) && validYears.includes(testYear)) {
      setEligibilityResult('ELIGIBLE');
    } else {
      setEligibilityResult('INELIGIBLE');
    }
  };

  // FAQ Accordion state
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  const faqs = [
    {
      q: 'Who is eligible to apply for the Alwar Police Internship Programme 2026?',
      a: 'The internship is exclusively open for regular students enrolled in BCA, B.Tech (CS/IT/ECE/Cyber), or MCA programmes currently in their 2nd, 3rd, or 4th year of study. Students from other streams or 1st-year students are not eligible.',
    },
    {
      q: 'What is the duration and mode of the internship programme?',
      a: 'The standard internship duration is 6 to 8 weeks, comprising both hands-on laboratory sessions and practical exposure to cyber crime investigation techniques under the direct supervision of the Alwar Police Cyber Cell.',
    },
    {
      q: 'Is there any application or registration fee?',
      a: 'No. The Alwar Police Cyber Security Internship Programme is completely free of cost. Never pay any fee to any third-party agency.',
    },
    {
      q: 'What documentation will be provided upon completion?',
      a: 'Candidates who successfully complete the internship, fulfill project milestones, and clear evaluation reviews will be awarded an official Certificate of Completion issued by the Office of the Superintendent of Police, Alwar.',
    },
    {
      q: 'How can I verify the authenticity of my application?',
      a: 'Upon registration, an official A4 Registration Slip with a unique Application ID (e.g. APCSIP2026-000001) and QR Code is generated. Anyone scanning the QR code can securely verify the registration on this official portal.',
    },
  ];

  return (
    <div className="space-y-20 pb-20">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-b from-police-950 via-police-900 to-police-950 text-white overflow-hidden border-b border-police-800">
        {/* Subtle Cybersecurity Matrix / Grid background */}
        <div className="absolute inset-0 bg-grid-pattern opacity-25"></div>
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-police-600/20 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute top-1/2 -left-40 w-96 h-96 bg-cyber-blue/10 rounded-full blur-3xl pointer-events-none"></div>

        <div className="container mx-auto px-4 py-20 lg:py-28 relative z-10">
          <div className="max-w-4xl mx-auto text-center space-y-8">
            {/* Top Official Logo + Badge */}
            <div className="flex flex-col items-center gap-3">
              <div className="w-20 h-20 rounded-2xl bg-white p-2 border-2 border-police-500/60 shadow-2xl flex items-center justify-center">
                <img
                  src="/Rajasthan-Police.webp"
                  alt="Rajasthan Police Official Logo"
                  className="w-full h-full object-contain"
                />
              </div>
              <div className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-police-800/80 border border-police-600/50 text-xs font-semibold tracking-wide text-police-200 shadow-inner backdrop-blur-md">
                <Shield className="w-4 h-4 text-cyber-blue" />
                <span>OFFICIAL REGISTRATION PORTAL 2026</span>
                <span className="w-1.5 h-1.5 rounded-full bg-cyber-blue animate-ping"></span>
              </div>
            </div>

            {/* Exact Website Title & Subtitle */}
            <div className="space-y-3">
              <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight text-white leading-tight uppercase">
                Alwar Police <br className="hidden sm:block" />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyber-blue via-cyan-200 to-white">
                  Internship Programme 2026
                </span>
              </h1>
              <p className="text-lg sm:text-2xl font-semibold text-police-300 tracking-wide">
                Cyber Security Internship Programme
              </p>
            </div>

            {/* Description */}
            <p className="text-base sm:text-lg text-slate-300 max-w-2xl mx-auto leading-relaxed font-normal">
              A professional cyber security internship programme designed to provide students with practical exposure, learning opportunities and experience in cyber security.
            </p>

            {/* Primary & Secondary Call to Actions */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
              <Link
                to="/register"
                className="w-full sm:w-auto px-8 py-4 bg-gradient-to-r from-police-600 to-cyber-blue hover:from-police-500 hover:to-cyan-400 text-white font-bold rounded-xl shadow-lg shadow-cyan-900/30 hover:shadow-cyan-500/30 transition-all flex items-center justify-center gap-3 text-base group"
              >
                <span>Register Now</span>
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
              <a
                href="#helpdesk"
                className="w-full sm:w-auto px-8 py-4 bg-police-800/80 hover:bg-police-700 text-slate-100 font-semibold rounded-xl border border-police-600/60 transition-all flex items-center justify-center gap-2 text-base backdrop-blur-md"
              >
                <span>Helpline & Support</span>
                <ChevronDown className="w-4 h-4 text-police-400" />
              </a>
            </div>

            {/* Key Metric Badges */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-12 text-left">
              <div className="bg-police-900/60 p-4 rounded-xl border border-police-800/80 backdrop-blur-xs">
                <span className="text-xs uppercase text-police-400 font-medium block">Eligible Streams</span>
                <span className="text-base font-bold text-white">BCA, B.Tech, MCA</span>
              </div>
              <div className="bg-police-900/60 p-4 rounded-xl border border-police-800/80 backdrop-blur-xs">
                <span className="text-xs uppercase text-police-400 font-medium block">Eligible Years</span>
                <span className="text-base font-bold text-white">2nd, 3rd, 4th Year</span>
              </div>
              <div className="bg-police-900/60 p-4 rounded-xl border border-police-800/80 backdrop-blur-xs">
                <span className="text-xs uppercase text-police-400 font-medium block">Certification</span>
                <span className="text-base font-bold text-white">Alwar Police Cyber Cell</span>
              </div>
              <div className="bg-police-900/60 p-4 rounded-xl border border-police-800/80 backdrop-blur-xs">
                <span className="text-xs uppercase text-police-400 font-medium block">Application Fee</span>
                <span className="text-base font-bold text-emerald-400">100% Free</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ELIGIBILITY SECTION */}
      <section id="eligibility" className="container mx-auto px-4 scroll-mt-24">
        <div className="max-w-4xl mx-auto space-y-8">
          <div className="text-center space-y-3">
            <span className="text-xs font-bold text-police-600 uppercase tracking-widest bg-police-100 px-3 py-1 rounded-full border border-police-200">
              Admission Guidelines
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-police-900 tracking-tight">
              Strict Eligibility Criteria
            </h2>
            <p className="text-sm sm:text-base text-slate-600 max-w-xl mx-auto">
              To ensure focused mentoring and high-calibre technical project execution, the registration system strictly enforces the following qualification bounds.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Card 1: Eligible Courses */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden">
              <div className="w-2 h-full bg-police-700 absolute left-0 top-0"></div>
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-police-50 border border-police-200 flex items-center justify-center text-police-700">
                    <Award className="w-5 h-5" />
                  </div>
                  <h3 className="text-lg font-bold text-slate-900">Eligible Courses (Only)</h3>
                </div>
                <p className="text-xs text-slate-500">
                  Applicants must be actively enrolled in one of the approved full-time computing degrees:
                </p>
                <div className="flex flex-wrap gap-2 pt-1">
                  {['BCA', 'B.Tech', 'MCA'].map((c) => (
                    <span
                      key={c}
                      className="px-3.5 py-1.5 rounded-lg bg-police-900 text-white font-bold text-xs tracking-wide shadow-xs flex items-center gap-1.5"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5 text-cyber-blue" />
                      {c}
                    </span>
                  ))}
                </div>
                <div className="bg-amber-50 p-3 rounded-lg border border-amber-200 text-[11px] text-amber-800">
                  ⚠️ Note: B.Sc, B.Com, BA, Diploma or other non-specified branches are strictly ineligible.
                </div>
              </div>
            </div>

            {/* Card 2: Eligible Years */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden">
              <div className="w-2 h-full bg-cyber-navy absolute left-0 top-0"></div>
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-200 flex items-center justify-center text-police-700">
                    <Calendar className="w-5 h-5" />
                  </div>
                  <h3 className="text-lg font-bold text-slate-900">Eligible Academic Years (Only)</h3>
                </div>
                <p className="text-xs text-slate-500">
                  Students must currently be progressing in their respective year of study:
                </p>
                <div className="flex flex-wrap gap-2 pt-1">
                  {['2nd Year', '3rd Year', '4th Year'].map((y) => (
                    <span
                      key={y}
                      className="px-3.5 py-1.5 rounded-lg bg-police-800 text-white font-semibold text-xs tracking-wide shadow-xs flex items-center gap-1.5"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                      {y}
                    </span>
                  ))}
                </div>
                <div className="bg-rose-50 p-3 rounded-lg border border-rose-200 text-[11px] text-rose-800">
                  ⚠️ Note: 1st-year students and graduates who have already finished college are not eligible.
                </div>
              </div>
            </div>
          </div>

          {/* Interactive Live Eligibility Checker Widget */}
          <div className="bg-gradient-to-r from-police-900 to-police-800 p-6 rounded-2xl text-white shadow-lg space-y-4 border border-police-700">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div>
                <h4 className="text-base font-bold text-white flex items-center gap-2">
                  <Cpu className="w-5 h-5 text-cyber-blue" />
                  Quick Eligibility Self-Check
                </h4>
                <p className="text-xs text-police-200">
                  Verify your eligibility before launching the multi-step registration form.
                </p>
              </div>
            </div>

            <form onSubmit={checkEligibility} className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
              <select
                value={testCourse}
                onChange={(e) => {
                  setTestCourse(e.target.value);
                  setEligibilityResult(null);
                }}
                className="bg-police-950 text-white border border-police-600 rounded-lg px-3 py-2.5 text-xs font-medium focus:ring-2 focus:ring-cyber-blue focus:outline-hidden"
              >
                <option value="">-- Select Your Course --</option>
                <option value="BCA">BCA (Bachelor of Computer Applications)</option>
                <option value="B.Tech">B.Tech (Bachelor of Technology)</option>
                <option value="MCA">MCA (Master of Computer Applications)</option>
                <option value="B.Sc">B.Sc / Other (Ineligible)</option>
              </select>

              <select
                value={testYear}
                onChange={(e) => {
                  setTestYear(e.target.value);
                  setEligibilityResult(null);
                }}
                className="bg-police-950 text-white border border-police-600 rounded-lg px-3 py-2.5 text-xs font-medium focus:ring-2 focus:ring-cyber-blue focus:outline-hidden"
              >
                <option value="">-- Select Your Year of Study --</option>
                <option value="1st Year">1st Year (Ineligible)</option>
                <option value="2nd Year">2nd Year</option>
                <option value="3rd Year">3rd Year</option>
                <option value="4th Year">4th Year</option>
                <option value="Graduated">Passed Out / Graduated (Ineligible)</option>
              </select>

              <button
                type="submit"
                className="bg-cyber-blue hover:bg-cyan-400 text-police-950 font-bold py-2.5 px-4 rounded-lg text-xs transition-colors shadow"
              >
                Check Eligibility
              </button>
            </form>

            {eligibilityResult && (
              <div
                className={`p-3.5 rounded-xl border text-xs flex items-center justify-between gap-3 animate-in fade-in duration-200 ${
                  eligibilityResult === 'ELIGIBLE'
                    ? 'bg-emerald-950/80 border-emerald-500/60 text-emerald-200'
                    : 'bg-rose-950/80 border-rose-500/60 text-rose-200'
                }`}
              >
                <div className="flex items-center gap-2">
                  {eligibilityResult === 'ELIGIBLE' ? (
                    <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                  ) : (
                    <AlertCircle className="w-5 h-5 text-rose-400 shrink-0" />
                  )}
                  <span>
                    {eligibilityResult === 'ELIGIBLE'
                      ? 'You meet all mandatory eligibility criteria for Alwar Police Internship 2026!'
                      : 'You do not meet the course/year eligibility criteria. Registration is restricted to BCA/B.Tech/MCA in 2nd, 3rd, or 4th Year.'}
                  </span>
                </div>
                {eligibilityResult === 'ELIGIBLE' && (
                  <Link
                    to="/register"
                    className="bg-emerald-500 hover:bg-emerald-400 text-police-950 font-bold px-3 py-1.5 rounded text-xs shrink-0 transition-colors"
                  >
                    Proceed to Register →
                  </Link>
                )}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* CURRICULUM & CYBER SECURITY LABS */}
      <section id="curriculum" className="bg-slate-100 py-16 border-y border-slate-200 scroll-mt-20">
        <div className="container mx-auto px-4 max-w-6xl space-y-12">
          <div className="text-center space-y-3">
            <span className="text-xs font-bold text-police-700 uppercase tracking-widest bg-police-200/80 px-3 py-1 rounded-full">
              Real-World Cyber Defence
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-police-900 tracking-tight">
              Internship Domains & Practical Exposure
            </h2>
            <p className="text-sm sm:text-base text-slate-600 max-w-2xl mx-auto">
              Interns work alongside cyber crime investigators and security specialists on actual forensic case analysis, threat hunting, and modern defense operations.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Domain 1 */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs hover:border-police-400 transition-all space-y-3">
              <div className="w-12 h-12 rounded-xl bg-police-900 text-cyber-blue flex items-center justify-center">
                <Search className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-slate-900">Digital Forensics & OSINT</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Hands-on disk imaging, memory analysis, mobile forensics, Volatility, Autopsy, and deep Open Source Intelligence (OSINT) gathering.
              </p>
              <div className="flex flex-wrap gap-1.5 pt-2">
                <span className="text-[10px] font-mono bg-slate-100 text-slate-700 px-2 py-0.5 rounded border">Autopsy</span>
                <span className="text-[10px] font-mono bg-slate-100 text-slate-700 px-2 py-0.5 rounded border">Volatility</span>
                <span className="text-[10px] font-mono bg-slate-100 text-slate-700 px-2 py-0.5 rounded border">Maltego</span>
              </div>
            </div>

            {/* Domain 2 */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs hover:border-police-400 transition-all space-y-3">
              <div className="w-12 h-12 rounded-xl bg-police-900 text-cyan-400 flex items-center justify-center">
                <Terminal className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-slate-900">VAPT & Web Security</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Vulnerability Assessment and Penetration Testing, OWASP Top 10 web vulnerabilities, API security assessments, and network penetration testing.
              </p>
              <div className="flex flex-wrap gap-1.5 pt-2">
                <span className="text-[10px] font-mono bg-slate-100 text-slate-700 px-2 py-0.5 rounded border">Burp Suite</span>
                <span className="text-[10px] font-mono bg-slate-100 text-slate-700 px-2 py-0.5 rounded border">Nmap</span>
                <span className="text-[10px] font-mono bg-slate-100 text-slate-700 px-2 py-0.5 rounded border">Metasploit</span>
              </div>
            </div>

            {/* Domain 3 */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs hover:border-police-400 transition-all space-y-3">
              <div className="w-12 h-12 rounded-xl bg-police-900 text-emerald-400 flex items-center justify-center">
                <Network className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-slate-900">SOC, SIEM & Incident Response</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Traffic packet analysis with Wireshark, Security Operations Center workflows, log analysis, threat hunting, and rapid incident triage.
              </p>
              <div className="flex flex-wrap gap-1.5 pt-2">
                <span className="text-[10px] font-mono bg-slate-100 text-slate-700 px-2 py-0.5 rounded border">Wireshark</span>
                <span className="text-[10px] font-mono bg-slate-100 text-slate-700 px-2 py-0.5 rounded border">Snort</span>
                <span className="text-[10px] font-mono bg-slate-100 text-slate-700 px-2 py-0.5 rounded border">Splunk/ELK</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* TIMELINE SECTION */}
      <section id="timeline" className="container mx-auto px-4 max-w-4xl space-y-10 scroll-mt-20">
        <div className="text-center space-y-3">
          <span className="text-xs font-bold text-police-700 uppercase tracking-widest bg-police-100 px-3 py-1 rounded-full">
            Selection & Execution
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-police-900 tracking-tight">
            Programme Roadmap 2026
          </h2>
          <p className="text-sm text-slate-600">
            Important dates and application progression milestones.
          </p>
        </div>

        <div className="relative border-l-2 border-police-300 ml-4 md:ml-32 space-y-8 pl-6 md:pl-8">
          {/* Phase 1 */}
          <div className="relative">
            <span className="absolute -left-[33px] md:-left-[41px] top-1.5 w-4 h-4 rounded-full bg-police-700 ring-4 ring-police-100"></span>
            <div className="space-y-1">
              <span className="text-xs font-bold text-cyber-blue uppercase font-mono bg-police-950 px-2 py-0.5 rounded">
                Phase 1 • Active Now
              </span>
              <h3 className="text-base font-bold text-slate-900">Online Student Registration</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Eligible students complete the multi-step online application, upload resumes, and receive their unique Application ID and PDF acknowledgement slip.
              </p>
            </div>
          </div>

          {/* Phase 2 */}
          <div className="relative">
            <span className="absolute -left-[33px] md:-left-[41px] top-1.5 w-4 h-4 rounded-full bg-police-400 ring-4 ring-police-100"></span>
            <div className="space-y-1">
              <span className="text-xs font-bold text-police-700 uppercase font-mono bg-police-100 px-2 py-0.5 rounded">
                Phase 2
              </span>
              <h3 className="text-base font-bold text-slate-900">Dossier Evaluation & Shortlisting</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Technical assessment of student motivation statements, cyber security skill sets, and academic records by the Alwar Police Cyber Cell evaluation board.
              </p>
            </div>
          </div>

          {/* Phase 3 */}
          <div className="relative">
            <span className="absolute -left-[33px] md:-left-[41px] top-1.5 w-4 h-4 rounded-full bg-police-400 ring-4 ring-police-100"></span>
            <div className="space-y-1">
              <span className="text-xs font-bold text-police-700 uppercase font-mono bg-police-100 px-2 py-0.5 rounded">
                Phase 3
              </span>
              <h3 className="text-base font-bold text-slate-900">Induction & Lab Onboarding</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Selected candidates are formally inducted into the Cyber Crime Cell laboratory and assigned specific investigation project modules under senior mentorship.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* HELPDESK & CYBER EXPERTS SECTION */}
      <section id="helpdesk" className="container mx-auto px-4 max-w-5xl scroll-mt-20">
        <div className="bg-gradient-to-br from-police-900 to-police-950 rounded-3xl p-8 sm:p-10 border border-police-700 shadow-xl text-white space-y-6">
          <div className="text-center space-y-2 max-w-xl mx-auto">
            <span className="text-xs font-bold text-cyber-blue uppercase tracking-widest bg-police-800 px-3 py-1 rounded-full border border-police-600">
              Direct Assistance & Support
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white">
              Programme Helpdesk & Cyber Experts
            </h2>
            <p className="text-xs sm:text-sm text-police-300">
              For queries related to eligibility, registration process, or technical domains, reach out directly to the programme coordinators:
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
            {/* Contact 1 */}
            <div className="bg-police-800/80 p-5 rounded-2xl border border-police-600/70 hover:border-cyber-blue transition-all space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-police-900 border border-police-700 flex items-center justify-center text-cyber-blue font-bold text-base">
                  AS
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">Abhishek Sharma</h3>
                  <p className="text-xs text-police-300">Cyber Security Expert / Programme Coordinator</p>
                </div>
              </div>
              <div className="pt-2 flex items-center justify-between border-t border-police-700/80">
                <span className="text-xs text-slate-400">Contact Number:</span>
                <a
                  href="tel:9680895044"
                  className="px-4 py-1.5 rounded-lg bg-cyber-blue hover:bg-cyan-400 text-police-950 font-mono font-bold text-sm transition-colors shadow flex items-center gap-1.5"
                >
                  📞 +91 96808 95044
                </a>
              </div>
            </div>

            {/* Contact 2 */}
            <div className="bg-police-800/80 p-5 rounded-2xl border border-police-600/70 hover:border-cyber-blue transition-all space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-police-900 border border-police-700 flex items-center justify-center text-emerald-400 font-bold text-base">
                  SY
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">Sachin Yadav</h3>
                  <p className="text-xs text-police-300">Cyber Security Expert / Technical Lead</p>
                </div>
              </div>
              <div className="pt-2 flex items-center justify-between border-t border-police-700/80">
                <span className="text-xs text-slate-400">Contact Number:</span>
                <a
                  href="tel:8239930511"
                  className="px-4 py-1.5 rounded-lg bg-emerald-400 hover:bg-emerald-300 text-police-950 font-mono font-bold text-sm transition-colors shadow flex items-center gap-1.5"
                >
                  📞 +91 82399 30511
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ SECTION */}
      <section className="bg-slate-50 py-12 border-t border-slate-200">
        <div className="container mx-auto px-4 max-w-3xl space-y-8">
          <div className="text-center space-y-2">
            <h2 className="text-2xl font-bold text-police-900">Frequently Asked Questions</h2>
            <p className="text-xs text-slate-500">Clarifications regarding registration and qualifications.</p>
          </div>

          <div className="space-y-3">
            {faqs.map((faq, index) => {
              const isOpen = openFaq === index;
              return (
                <div
                  key={index}
                  className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-2xs"
                >
                  <button
                    onClick={() => setOpenFaq(isOpen ? null : index)}
                    className="w-full text-left p-4 font-semibold text-slate-900 text-sm flex items-center justify-between gap-4 hover:bg-slate-50"
                  >
                    <span>{faq.q}</span>
                    <ChevronDown
                      className={`w-4 h-4 text-slate-500 transition-transform ${
                        isOpen ? 'rotate-180' : ''
                      }`}
                    />
                  </button>
                  {isOpen && (
                    <div className="px-4 pb-4 text-xs text-slate-600 leading-relaxed border-t border-slate-100 pt-3">
                      {faq.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* BOTTOM CTA BANNER */}
      <section className="container mx-auto px-4 max-w-5xl">
        <div className="bg-gradient-to-r from-police-950 via-police-900 to-police-950 rounded-3xl p-8 md:p-12 text-white text-center space-y-6 shadow-xl border border-police-800 relative overflow-hidden">
          <div className="space-y-2">
            <h2 className="text-2xl sm:text-4xl font-black uppercase tracking-tight">
              Ready to Defend the Digital Frontier?
            </h2>
            <p className="text-sm sm:text-base text-police-300 max-w-xl mx-auto">
              Join the Alwar Police Internship Programme 2026. Gain hands-on cyber forensic exposure and build real-world capability.
            </p>
          </div>
          <div className="pt-2">
            <Link
              to="/register"
              className="inline-flex items-center gap-3 bg-cyber-blue hover:bg-cyan-400 text-police-950 font-bold px-8 py-4 rounded-xl shadow-lg transition-all text-base"
            >
              <span>Apply for Internship 2026</span>
              <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};
