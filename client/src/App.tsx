import React, { useState, useEffect } from 'react';
import {
  Users,
  CreditCard,
  QrCode,
  TrendingUp,
  Search,
  Plus,
  Leaf,
  Settings,
  LogOut,
  Award,
  Play,
  Trophy,
  Activity,
  Instagram,
  Facebook,
  X,
  Bell,
  Calendar,
  DollarSign,
  Volume2,
  VolumeX,
  ArrowRight,
  ChevronRight,
  Edit2,
  Save,
  Camera
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import QRCode from 'react-qr-code';

// Leaf, Mail, Smartphone, LogIn, Menu removed (not used in current design)
const SocialVideoPlayer: React.FC<{ src: string, showSlider?: boolean, size?: 'sm' | 'lg' }> = ({ src, showSlider = true, size = 'sm' }) => {
  const [localMute, setLocalMute] = useState(true);
  const [localVolume, setLocalVolume] = useState(0.2);
  const videoRef = React.useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (videoRef.current) videoRef.current.volume = localVolume;
  }, [localVolume]);

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%' }}>
      <video
        ref={videoRef}
        autoPlay
        muted={localMute}
        loop
        playsInline
        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
      >
        <source src={src} type="video/mp4" />
      </video>
      <div style={{ position: 'absolute', bottom: size === 'lg' ? '20px' : '1rem', right: size === 'lg' ? '20px' : '1rem', display: 'flex', alignItems: 'center', gap: '8px', background: 'rgba(0,0,0,0.6)', padding: size === 'lg' ? '8px 15px' : '5px 10px', borderRadius: '30px', backdropFilter: 'blur(10px)', zIndex: 10, border: '1px solid var(--glass-border)' }}>
        <button
          onClick={(e) => { e.stopPropagation(); setLocalMute(!localMute); }}
          style={{ background: 'none', border: 'none', color: 'var(--text-main)', cursor: 'pointer', display: 'flex', alignItems: 'center' }}
        >
          {localMute ? <VolumeX size={size === 'lg' ? 20 : 16} /> : <Volume2 size={size === 'lg' ? 20 : 16} />}
        </button>
        {!localMute && showSlider && (
          <input
            type="range"
            min="0" max="1" step="0.01"
            value={localVolume}
            onChange={(e) => setLocalVolume(parseFloat(e.target.value))}
            style={{ width: size === 'lg' ? '80px' : '40px', height: '4px', cursor: 'pointer', accentColor: 'var(--logo-green)' }}
          />
        )}
        {!localMute && size === 'lg' && <span style={{ fontSize: '0.7rem', fontWeight: 800, minWidth: '30px' }}>{Math.round(localVolume * 100)}%</span>}
      </div>
    </div>
  );
};


import type {
  Belt,
  UserRole,
  ViewMode,
  Video,
  Student,
  PlanFees,
  AutomationConfig
} from './types';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

const App: React.FC = () => {
  const [viewMode, setViewMode] = useState<ViewMode>('landing');
  const [role, setRole] = useState<UserRole>('guest');
  const [currentUser, setCurrentUser] = useState<Student | null>(null);
  const [activeTab, setActiveTab] = useState<'dashboard' | 'students' | 'attendance' | 'payments' | 'settings' | 'videos'>('dashboard');
  const [studentSearchTerm, setStudentSearchTerm] = useState('');
  const [studentFilterAge, setStudentFilterAge] = useState<'ALL' | 'KIDS' | 'ADULTS'>('ALL');
  const [studentFilterBelt, setStudentFilterBelt] = useState<Belt | 'ALL'>('ALL');
  const [videoFilter, setVideoFilter] = useState<Belt | 'ALL'>('ALL');
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [showQRModal, setShowQRModal] = useState(false);
  const [students, setStudents] = useState<Student[]>([]);
  const [videos, setVideos] = useState<Video[]>([]);
  const [isAddingVideo, setIsAddingVideo] = useState(false);
  const [newVideoData, setNewVideoData] = useState<Omit<Video, 'id'>>({ title: '', description: '', url: '', thumbnail: '', beltLevel: 'WHITE', category: 'Tecnica' });
  const [isAddingStudent, setIsAddingStudent] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isEditingStudent, setIsEditingStudent] = useState(false);
  const [editedStudent, setEditedStudent] = useState<Student | null>(null);

  // API Data Loading
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [studentsRes, videosRes] = await Promise.all([
          fetch(`${API_URL}/api/students`),
          fetch(`${API_URL}/api/videos`)
        ]);
        const studentsData = await studentsRes.json();
        const videosData = await videosRes.json();

        // Ensure test accounts exist locally if not in DB (for demo)
        const testEmails = ['test@ranas.cl', 'pago@test.cl'];
        testEmails.forEach(email => {
          if (!studentsData.some((s: Student) => s.email === email)) {
            studentsData.push({
              id: email === 'test@ranas.cl' ? 'demo-test-account-123' : 'pago-test-account-456',
              name: email === 'test@ranas.cl' ? 'ALUMNO DE PRUEBA' : 'PAGO TEST',
              email: email,
              password: email === 'test@ranas.cl' ? 'TEST' : 'PAGO',
              phone: '+5690000000',
              belt: 'WHITE',
              classesAttended: 15,
              classesToNextBelt: 40,
              lastPaymentMonth: '',
              isPaid: true,
              history: [],
              plan: '3',
              monthlyFee: 40000
            });
          }
        });

        setStudents(studentsData);
        setVideos(videosData);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };
    fetchData();
  }, []);

  const handleUpdateStudent = async (updatedStudent: Student) => {
    try {
      const response = await fetch(`${API_URL}/api/students/${updatedStudent.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedStudent)
      });
      if (response.ok) {
        const savedStudent = await response.json();
        setStudents(prev => prev.map(s => s.id === savedStudent.id ? savedStudent : s));
        setSelectedStudent(savedStudent);
        setIsEditingStudent(false);
        if (currentUser?.id === savedStudent.id) {
          setCurrentUser(savedStudent);
        }
      }
    } catch (error) {
      console.error("Error updating student:", error);
    }
  };

  const handleAvatarUpload = (e: React.ChangeEvent<HTMLInputElement>, student: Student) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = reader.result as string;
      const updated = { ...student, avatar: base64String };
      handleUpdateStudent(updated);
    };
    reader.readAsDataURL(file);
  };

  const handleCreatePaymentLink = async (student: Student) => {
    const amount = student.monthlyFee || 0;
    if (amount <= 0) {
      alert("⚠️ El alumno no tiene una mensualidad asignada.");
      return;
    }

    try {
      const response = await fetch(`${API_URL}/api/checkout`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          student: {
            name: student.name,
            email: student.email || "test_user_123@testuser.com"
          },
          amount
        })
      });

      const data = await response.json();

      if (data.init_point) {
        window.open(data.init_point, '_blank');
      } else {
        console.error("Respuesta Error:", data);
        alert("❌ Error: No se pudo generar el link de pago.");
      }
    } catch (error) {
      console.error("Error conectando al backend:", error);
      alert("❌ Ocurrió un error al intentar conectarse con el servidor.");
    }
  };
  const [isSendingNotice, setIsSendingNotice] = useState(false);
  const [loginStep, setLoginStep] = useState<'choice' | 'admin-pass' | 'student-select'>('choice');
  const [adminPassword, setAdminPassword] = useState('');
  const [authEmail, setAuthEmail] = useState('');
  const [authPassword, setAuthPassword] = useState('');
  const [studentNewPassword, setStudentNewPassword] = useState('');

  const [newStudentData, setNewStudentData] = useState({ name: '', email: '', phone: '', birthDate: '', documentId: '', belt: 'WHITE' as Belt, plan: '3', monthlyFee: 40000 });
  const [noticeData, setNoticeData] = useState({ subject: 'Aviso Importante', message: 'Legado Ranas BJJ' });

  const [fees, setFees] = useState<PlanFees>({
    adults: { '1': 5000, '2': 35000, '3': 40000, '4': 45000, 'Ilimitado': 50000 },
    kids: { '1': 5000, '2': 35000, '3': 40000, '4': 45000, 'Ilimitado': 50000 }
  });

  const [automation, setAutomation] = useState<AutomationConfig>({ reminderDay: 5, whatsappTemplate: "Hola {nombre}...", emailTemplate: "Hola {nombre}..." });

  const calculateAge = (birthDateString?: string) => {
    if (!birthDateString) return 'N/A';
    const today = new Date();
    const birthDate = new Date(birthDateString);
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  };

  const getUpcomingBirthdays = () => {
    const today = new Date();
    return students
      .filter(s => s.birthDate)
      .map(s => {
        const bd = new Date(s.birthDate!);
        const currentYearBd = new Date(today.getFullYear(), bd.getMonth(), bd.getDate());
        if (currentYearBd < today) currentYearBd.setFullYear(today.getFullYear() + 1);
        return { ...s, nextBd: currentYearBd };
      })
      .sort((a, b) => a.nextBd.getTime() - b.nextBd.getTime())
      .slice(0, 5);
  };

  const beltLabels: Record<Belt, string> = { WHITE: 'Blanco', BLUE: 'Azul', PURPLE: 'Morado', BROWN: 'Marrón', BLACK: 'Negro', GRAY: 'Gris' };
  const planLabels: Record<string, string> = { '1': 'Clase Individual', '2': '2x Semana', '3': '3x Semana', '4': '4x Semana', 'Ilimitado': 'Full Rana' };
  const formatCLP = (amount: number) => new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP', maximumFractionDigits: 0 }).format(amount);

  const handleLogin = (type: 'admin' | 'student', studentToLogin?: Student) => {
    if (type === 'admin') {
      if (adminPassword === 'admin123') {
        setRole('admin');
        setViewMode('app');
      } else {
        alert('Contraseña incorrecta');
      }
    } else {
      const student = studentToLogin || students.find(s => s.email.toLowerCase() === authEmail.trim().toLowerCase() && s.password === authPassword.trim());
      if (student) {
        setRole('student');
        setCurrentUser(student);
        setViewMode('app');
      } else {
        alert('Correo o contraseña incorrecta');
      }
    }
  };

  const handleUpdateStudentPassword = () => {
    if (!studentNewPassword || !currentUser) return;
    const updated = { ...currentUser, password: studentNewPassword };
    setCurrentUser(updated);
    setStudents(prev => prev.map(s => s.id === updated.id ? updated : s));
    setStudentNewPassword('');
    alert('✅ Contraseña actualizada exitosamente.');
  };

  const handleAddStudent = async () => {
    if (!newStudentData.name || !newStudentData.email || !newStudentData.phone) {
      alert("Por favor completa los campos principales (Nombre, Correo, Teléfono).");
      return;
    }
    const generatedPassword = Math.random().toString(36).slice(-6).toUpperCase();
    const newStudent = { ...newStudentData, classesAttended: 0, classesToNextBelt: 40, isPaid: false, history: [], lastPaymentMonth: '', password: generatedPassword };

    try {
      const response = await fetch(`${API_URL}/api/students`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newStudent)
      });
      if (response.ok) {
        const savedStudent = await response.json();
        setStudents([...students, savedStudent]);
        setNewStudentData({ name: '', email: '', phone: '', birthDate: '', documentId: '', belt: 'WHITE' as Belt, plan: '3', monthlyFee: 40000 });
        setIsAddingStudent(false);
        alert(`✅ Alumno registrado con éxito.\n\nClave provisional: ${generatedPassword}`);
      }
    } catch (error) {
      console.error("Error adding student:", error);
    }
  };

  const handleSendMassNotice = () => {
    alert('Aviso enviado a todos los alumnos');
    setIsSendingNotice(false);
  };

  const handleGeneratePasswordsForAll = () => {
    let generatedCount = 0;
    const updatedStudents = students.map(s => {
      if (!s.password) {
        generatedCount++;
        return { ...s, password: Math.random().toString(36).slice(-6).toUpperCase() };
      }
      return s;
    });
    setStudents(updatedStudents);
    alert(`✅ Contraseñas generadas y "enviadas" para ${generatedCount} alumno(s) antiguo(s).`);
  };

  const handleMercadoPagoPayment = (_data: any) => {
    alert('Simulación de pago exitosa');
    return true;
  };

  const handleAddVideo = async () => {
    try {
      const response = await fetch(`${API_URL}/api/videos`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newVideoData)
      });
      if (response.ok) {
        const savedVideo = await response.json();
        setVideos([...videos, savedVideo]);
        setIsAddingVideo(false);
      }
    } catch (error) {
      console.error("Error adding video:", error);
    }
  };

  if (viewMode === 'landing') {
    return (
      <div className="landing-page" style={{ background: 'var(--bg-main)', color: 'var(--text-main)' }}>
        {/* Navbar */}
        <nav style={{ position: 'fixed', top: '2.5rem', left: '0', right: '0', zIndex: 1000, display: 'flex', justifyContent: 'center' }}>
          <div className="glass" style={{ padding: '0.8rem 3rem', display: 'flex', gap: '4rem', alignItems: 'center', borderRadius: '100px', border: '1px solid var(--glass-border)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', position: 'relative' }}>
              <div style={{ position: 'relative', display: 'flex' }}>
                <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: '70px', height: '70px', background: 'var(--logo-green)', filter: 'blur(30px)', opacity: 0.6, borderRadius: '50%', zIndex: -1 }}></div>
                <img src="/assets/WhatsApp Image 2026-03-04 at 1.50.04 PM.jpeg" alt="Logo" style={{ width: '64px', height: '64px', borderRadius: '50%', objectFit: 'cover', border: '3px solid var(--logo-green)', boxShadow: '0 0 30px rgba(5, 168, 106, 0.4)' }} />
              </div>
              <span style={{ fontWeight: 900, fontSize: '1.4rem', letterSpacing: '-1px', color: 'var(--text-main)' }}>RANAS <span style={{ color: 'var(--logo-green)' }}>JIU JITSU</span></span>
            </div>
            <div style={{ display: 'flex', gap: '2.5rem', alignItems: 'center' }}>
              <a href="#inicio" style={{ fontWeight: 800, color: 'var(--text-main)', textDecoration: 'none', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.15em', opacity: 0.8 }}>Inicio</a>
              <a href="#profesor" style={{ fontWeight: 800, color: 'var(--text-main)', textDecoration: 'none', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.15em', opacity: 0.8 }}>Profesor</a>
              <a href="#noticias" style={{ fontWeight: 800, color: 'var(--text-main)', textDecoration: 'none', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.15em', opacity: 0.8 }}>Noticias</a>
              <a href="#galeria" style={{ fontWeight: 800, color: 'var(--text-main)', textDecoration: 'none', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.15em', opacity: 0.8 }}>Galería</a>
              <div style={{ width: '1px', height: '24px', background: 'var(--glass-border)' }} />
              <button style={{ background: 'var(--logo-green)', border: 'none', padding: '0.8rem 1.8rem', borderRadius: '50px', fontWeight: 900, fontSize: '0.8rem', textTransform: 'uppercase', cursor: 'pointer', color: '#fff', boxShadow: '0 10px 20px rgba(5, 168, 106, 0.3)' }} onClick={() => setViewMode('auth')}>Entrar</button>
            </div>
          </div>
        </nav>

        {/* Hero Section */}
        <section id="inicio" style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', padding: '15rem 0 10rem', position: 'relative' }}>
          <div className="mesh-gradient" style={{ opacity: 0.2 }} />
          <div className="section-container">
            <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: '8rem', alignItems: 'center' }}>
              <motion.div initial={{ opacity: 0, x: -50 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}>
                <span style={{ color: 'var(--logo-green)', fontWeight: 900, letterSpacing: '0.6em', fontSize: '0.8rem', textTransform: 'uppercase', display: 'block', marginBottom: '3rem' }}>Concepción • Chile • Orompello 1421</span>
                <h1 style={{ fontSize: '8.5rem', marginBottom: '3rem', color: 'var(--text-main)', maxWidth: '1000px', lineHeight: 0.85 }}>
                  PRECISIÓN <br /><span style={{ color: 'transparent', WebkitTextStroke: '2px var(--logo-green)' }}>SIN</span> <br /><span style={{ color: 'var(--logo-green)' }}>LÍMITES.</span>
                </h1>
                <p style={{ fontSize: '1.4rem', color: 'var(--text-muted)', marginBottom: '5rem', maxWidth: '650px', lineHeight: 1.8, fontWeight: 500 }}>
                  Domina el arte suave bajo el linaje de Manuel Plaza. Un espacio exclusivo diseñado para la excelencia técnica y el máximo rendimiento deportivo.
                </p>
                <div style={{ display: 'flex', gap: '2.5rem' }}>
                  <button className="btn-primary" style={{ background: 'var(--logo-green)', padding: '1.5rem 4rem', fontSize: '1rem' }}>Reservar Clase</button>
                  <button className="btn-secondary" style={{ borderColor: 'rgba(255,255,255,0.2)', color: 'var(--text-main)', padding: '1.5rem 4rem', fontSize: '1rem' }} onClick={() => window.open('https://www.instagram.com/ranasjiujitsu/?hl=es')}>Instagram</button>
                </div>
              </motion.div>

              <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 1.5, ease: [0.16, 1, 0.3, 1] }} style={{ position: 'relative' }}>
                <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: '120%', height: '120%', background: 'var(--logo-green)', filter: 'blur(100px)', opacity: 0.1, zIndex: -1 }}></div>
                <div style={{ aspectRatio: '9/15', borderRadius: 'var(--radius-xl)', overflow: 'hidden', boxShadow: '0 50px 100px var(--bg-glass)', border: '1px solid var(--glass-border)', background: '#000', transform: 'perspective(1000px) rotateY(-5deg) rotateX(2deg)' }}>
                  <SocialVideoPlayer src="/assets/WhatsApp Video 2026-03-04 at 3.26.31 PM.mp4" size="lg" showSlider={false} />
                </div>
                <div className="glass" style={{ position: 'absolute', bottom: '-2rem', left: '-5rem', padding: '3rem', borderRadius: 'var(--radius-xl)', textAlign: 'center', border: '1px solid var(--logo-green)', background: 'var(--bg-main)' }}>
                  <h4 style={{ color: 'var(--text-main)', fontSize: '4rem', marginBottom: '0.1rem' }}>17</h4>
                  <p style={{ color: 'var(--logo-green)', fontWeight: 900, fontSize: '0.8rem', letterSpacing: '0.2em' }}>AÑOS DE LEGADO</p>
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        <section style={{ padding: '15rem 0', background: 'rgba(0,0,0,0.02)' }}>
          <div className="section-container">
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '3rem' }}>
              {[
                { icon: <Users size={36} />, title: 'Iniciación', desc: 'Niños desde los 5 años' },
                { icon: <Trophy size={36} />, title: 'Trayectoria', desc: '8 Medallas USA Open' },
                { icon: <Activity size={36} />, title: 'Metodología', desc: 'Certificado Kronos BJJ' },
                { icon: <Leaf size={36} />, title: 'Filosofía', desc: 'Zen-Sporty & Seguro' }
              ].map((item, i) => (
                <div key={i} className="glass" style={{ padding: '4rem 3rem', borderRadius: '3rem', border: '1px solid var(--glass-border)' }}>
                  <div style={{ color: 'var(--logo-green)', marginBottom: '2.5rem' }}>{item.icon}</div>
                  <h4 style={{ fontSize: '1.6rem', marginBottom: '1.2rem', color: 'var(--text-main)', fontWeight: 900 }}>{item.title}</h4>
                  <p style={{ color: 'var(--text-muted)', fontSize: '1rem', fontWeight: 600, lineHeight: 1.6 }}>{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>


        <section id="profesor" style={{ padding: '20rem 0', background: 'var(--bg-main)', position: 'relative', overflow: 'hidden' }}>
          <div className="section-container">
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10rem', alignItems: 'center' }}>
              <motion.div
                initial={{ opacity: 0, x: -50 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 1 }}
                style={{ position: 'relative' }}
              >
                <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: '120%', height: '120%', background: 'var(--logo-green)', filter: 'blur(100px)', opacity: 0.15, zIndex: -1 }}></div>
                <div style={{ borderRadius: '4rem', overflow: 'hidden', border: '1px solid var(--logo-green)', boxShadow: '0 40px 80px rgba(0,0,0,0.5)' }}>
                  <img src="/assets/WhatsApp Image 2026-03-04 at 3.39.08 PM.jpeg" alt="Professor Plaza" style={{ width: '100%', height: '800px', objectFit: 'cover' }} />
                </div>
                <div className="glass" style={{ position: 'absolute', bottom: '4rem', right: '-4rem', padding: '3rem', borderRadius: '2.5rem', background: 'var(--bg-main)', border: '1px solid var(--logo-green)' }}>
                  <h4 style={{ fontSize: '2.5rem', fontWeight: 900, marginBottom: '0.5rem' }}>Faixa-Preta</h4>
                  <p style={{ color: 'var(--logo-green)', fontWeight: 800, fontSize: '0.8rem', letterSpacing: '0.2em' }}>CERTIFICADO KRONOS BJJ</p>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: 50 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 1, delay: 0.2 }}
              >
                <span style={{ color: 'var(--logo-green)', fontWeight: 900, letterSpacing: '0.5em', fontSize: '0.9rem', textTransform: 'uppercase', display: 'block', marginBottom: '2rem' }}>Liderazgo Técnico</span>
                <h2 style={{ fontSize: '6rem', color: 'var(--logo-green)', marginBottom: '4rem', lineHeight: 1 }}>Manuel Plaza <br /><span style={{ color: 'transparent', WebkitTextStroke: '1.5px var(--logo-green)', opacity: 0.3 }}>Arenas.</span></h2>
                <p style={{ fontSize: '1.4rem', color: 'var(--text-muted)', lineHeight: 1.8, marginBottom: '5rem', fontWeight: 500 }}>
                  Con más de 17 años dedicados al perfeccionamiento del Brazilian Jiu Jitsu, el Profesor Plaza ha forjado una de las comunidades más sólidas de Concepción. Su enfoque combina la disciplina tradicional con metodologías modernas de alto rendimiento.
                </p>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '3rem' }}>
                  {[
                    { label: 'Formación', text: 'Cinturón Negro 2do Grado' },
                    { label: 'Especialidad', text: 'Técnica & Estrategia' },
                    { label: 'Logros', text: 'Coach de Medallistas USA' },
                    { label: 'Misión', text: 'Excelencia en el Tatami' }
                  ].map((item, i) => (
                    <div key={i}>
                      <p style={{ color: 'var(--logo-green)', fontWeight: 900, fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.2em', marginBottom: '0.8rem' }}>{item.label}</p>
                      <p style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--text-main)' }}>{item.text}</p>
                    </div>
                  ))}
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        <section id="noticias" style={{ padding: '15rem 0', position: 'relative' }}>
          <div className="mesh-gradient" style={{ opacity: 0.1, transform: 'rotate(180deg)' }} />
          <div className="section-container">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '10rem' }}>
              <div>
                <span style={{ color: 'var(--logo-green)', fontWeight: 900, letterSpacing: '0.5em', fontSize: '0.8rem', textTransform: 'uppercase', display: 'block', marginBottom: '2rem' }}>Noticias del Dojo</span>
                <h2 style={{ fontSize: '5rem', color: 'var(--text-main)' }}>Últimos <span style={{ color: 'var(--logo-green)' }}>Acontecimientos.</span></h2>
              </div>
              <button className="btn-secondary" style={{ padding: '1.2rem 3rem' }}>Ver todas las noticias</button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '4rem' }}>
              {[
                {
                  date: '09 Jul, 2025',
                  title: 'Nueva Versión del Frog Challenge Kids',
                  desc: 'El torneo de Jiu Jitsu juvenil más importante de la región se toma Concepción en su tercera versión.',
                  link: 'https://www.canal9.cl/episodios/nuestra-casa/2025/07/09/llega-la-tercera-version-del-frog-challenge-kids-torneo-de-jiu-jitsu-juvenil-se-toma-concepcion',
                  img: 'https://images.unsplash.com/photo-1599058917232-d750c185ca0d?w=600'
                },
                {
                  date: '16 Feb, 2023',
                  title: 'Manuel Plaza: Medallas en EE.UU.',
                  desc: 'El profesor Manuel Plaza destaca en el US Open sumando medallas para el dojo y Concepción.',
                  link: 'https://www.diarioconcepcion.cl/deportes/2023/02/16/manuel-plaza-penquista-suma-medallas-en-tatamis-estadounidenses.html',
                  img: 'https://images.unsplash.com/photo-1555597673-b21d5c935865?w=600'
                },
                {
                  date: '20 Feb, 2024',
                  title: 'Inauguración: Nueva Área de Relax',
                  desc: 'Hemos diseñado un nuevo espacio post-entrenamiento para la recuperación física de nuestros alumnos.',
                  img: 'https://images.unsplash.com/photo-1528642466442-773a2c6da3f5?w=600'
                }
              ].map((noticia, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.8, delay: i * 0.2 }}
                  whileHover={{ y: -15 }}
                  style={{ cursor: 'pointer' }}
                  onClick={() => noticia.link && window.open(noticia.link, '_blank')}
                >
                  <div style={{ height: '350px', borderRadius: '3rem', overflow: 'hidden', marginBottom: '3rem', position: 'relative' }}>
                    <img src={noticia.img} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    <div className="glass" style={{ position: 'absolute', top: '2rem', left: '2rem', padding: '0.8rem 1.5rem', borderRadius: '100px', fontSize: '0.75rem', fontWeight: 900 }}>{noticia.date}</div>
                  </div>
                  <h3 style={{ fontSize: '1.8rem', fontWeight: 900, marginBottom: '1.5rem', color: 'var(--text-main)', lineHeight: 1.3 }}>{noticia.title}</h3>
                  <p style={{ color: 'var(--text-muted)', fontSize: '1.05rem', lineHeight: 1.6, fontWeight: 500 }}>{noticia.desc}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        <section id="galeria" style={{ padding: '20rem 0' }}>
          <div className="section-container">
            <div style={{ textAlign: 'center', marginBottom: '12rem' }}>
              <span style={{ color: 'var(--logo-green)', fontWeight: 900, letterSpacing: '0.5em', fontSize: '0.85rem', textTransform: 'uppercase', display: 'block', marginBottom: '2rem' }}>Galería Técnica</span>
              <h2 style={{ fontSize: '6rem', color: 'var(--text-main)' }}>La Experiencia <span style={{ color: 'transparent', WebkitTextStroke: '1.5px var(--logo-green)', opacity: 0.4 }}>Elite.</span></h2>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '3.5rem' }}>
              {[1, 2, 3, 4].map(n => (
                <motion.div key={n} whileHover={{ y: -20, scale: 1.02 }} transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }} style={{ aspectRatio: '9/16', borderRadius: 'var(--radius-xl)', overflow: 'hidden', boxShadow: '0 30px 60px rgba(0,0,0,0.6)', border: '1px solid var(--glass-border)', background: '#000' }}>
                  <SocialVideoPlayer src={`/assets/WhatsApp Video 2026-03-04 at 3.29.0${n} PM.mp4`} size="sm" />
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        <footer style={{ background: 'rgba(0,0,0,0.5)', padding: '12rem 0 6rem', borderTop: '1px solid var(--glass-border)' }}>
          <div className="section-container">
            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr', gap: '8rem', marginBottom: '8rem' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', marginBottom: '3rem' }}>
                  <div style={{ padding: '3px', background: 'var(--text-main)', borderRadius: '50%', display: 'flex' }}>
                    <img src="/assets/WhatsApp Image 2026-03-04 at 1.50.04 PM.jpeg" alt="Logo" style={{ width: '60px', height: '60px', borderRadius: '50%', objectFit: 'cover' }} />
                  </div>
                  <span style={{ fontWeight: 900, fontSize: '2rem', letterSpacing: '-2px', color: 'var(--text-main)' }}>RANAS <span style={{ color: 'var(--logo-green)' }}>JIU JITSU</span></span>
                </div>
                <p style={{ color: 'var(--text-muted)', lineHeight: 2, fontSize: '1.15rem', maxWidth: '400px', fontWeight: 500 }}>
                  El epicentro del Jiu Jitsu de alto nivel en Concepción. Orompello 1421. Maestría técnica y comunidad.
                </p>
              </div>
              <div>
                <h4 style={{ fontSize: '1rem', marginBottom: '2.5rem', fontWeight: 900 }}>COMUNIDAD</h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem', color: 'var(--text-muted)', fontSize: '0.9rem', fontWeight: 600 }}>
                  <span>Nosotros</span>
                  <span>Horarios</span>
                  <span>Membresías</span>
                </div>
              </div>
              <div>
                <h4 style={{ fontSize: '1rem', marginBottom: '2.5rem', fontWeight: 900 }}>CONTACTO</h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem', color: 'var(--text-muted)', fontSize: '0.9rem', fontWeight: 600 }}>
                  <span>+56 9 3960 1560</span>
                  <span>hola@ranasjiujitsu.cl</span>
                  <span>Orompello 1421, Concepción</span>
                </div>
              </div>
              <div>
                <h4 style={{ fontSize: '1rem', marginBottom: '2.5rem', fontWeight: 900 }}>SÍGUENOS</h4>
                <div style={{ display: 'flex', gap: '1.5rem', color: 'var(--logo-green)' }}>
                  <Instagram size={24} />
                  <Facebook size={24} />
                </div>
              </div>
            </div>
            <div style={{ paddingTop: '3rem', borderTop: '1px solid rgba(0,0,0,0.05)', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.8rem', fontWeight: 600, letterSpacing: '0.1em' }}>
              © 2026 RANAS JIU JITSU • CONCEPCIÓN CHILE
            </div>
          </div>
        </footer>
      </div>
    );
  }

  // --- RENDERING AUTH PAGE ---
  if (viewMode === 'auth') {
    const springT = { type: 'spring' as const, stiffness: 300, damping: 30 };
    return (
      <div style={{ width: '100%', height: '100vh', display: 'flex', position: 'relative', overflow: 'hidden', background: 'var(--panel-bg)' }}>
        {/* Animated BG */}
        <div style={{ position: 'absolute', inset: 0, zIndex: 0, pointerEvents: 'none' }}>
          <motion.div animate={{ x: [0, 30, 0], y: [0, -40, 0] }} transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut' }}
            style={{ position: 'absolute', top: '15%', left: '10%', width: '500px', height: '500px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(5,168,106,0.18) 0%, transparent 70%)', filter: 'blur(60px)', opacity: 'var(--panel-orb-opacity)' }} />
          <motion.div animate={{ x: [0, -20, 0], y: [0, 30, 0] }} transition={{ duration: 15, repeat: Infinity, ease: 'easeInOut', delay: 2 }}
            style={{ position: 'absolute', bottom: '10%', right: '15%', width: '400px', height: '400px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(5,168,106,0.1) 0%, transparent 70%)', filter: 'blur(80px)', opacity: 'var(--panel-orb-opacity)' }} />
          <div style={{ position: 'absolute', inset: 0, backgroundImage: 'radial-gradient(circle at 1px 1px, var(--panel-grid-dot) 1px, transparent 0)', backgroundSize: '40px 40px' }} />
        </div>

        {/* Left branding */}
        <motion.div initial={{ opacity: 0, x: -60 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
          style={{ width: '50%', display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '6rem 8rem', position: 'relative', zIndex: 1 }}>
          <div style={{ position: 'relative', display: 'inline-flex', marginBottom: '2.5rem' }}>
            <div style={{ position: 'absolute', inset: '-8px', background: 'var(--logo-green)', borderRadius: '50%', filter: 'blur(20px)', opacity: 0.4 }} />
            <img src="/assets/WhatsApp Image 2026-03-04 at 1.50.04 PM.jpeg" alt="Logo" style={{ width: '80px', height: '80px', borderRadius: '50%', objectFit: 'cover', border: '3px solid var(--logo-green)', position: 'relative' }} />
          </div>
          <div style={{ fontSize: '0.7rem', fontWeight: 900, color: 'var(--logo-green)', letterSpacing: '0.5em', textTransform: 'uppercase', marginBottom: '1.5rem' }}>Ranas Jiu Jitsu · Concepción</div>
          <h1 style={{ fontSize: '4rem', lineHeight: 0.95, letterSpacing: '-3px', marginBottom: '2rem', color: 'var(--panel-text)' }}>
            Tu dojo,<br />
            <span style={{ color: 'transparent', WebkitTextStroke: '2px var(--logo-green)', opacity: 0.6 }}>tu</span>{' '}
            <span style={{ color: 'var(--logo-green)' }}>legado.</span>
          </h1>
          <p style={{ color: 'var(--panel-muted)', fontSize: '1rem', lineHeight: 1.8, maxWidth: '380px', fontWeight: 400 }}>Plataforma de gestión de élite para el Brazilian Jiu Jitsu de más alto nivel en Concepción.</p>
          <div style={{ display: 'flex', gap: '2.5rem', marginTop: '3rem' }}>
            {[{ n: '17', l: 'Años' }, { n: '200+', l: 'Alumnos' }, { n: '8', l: 'Medallas' }].map(s => (
              <div key={s.l}>
                <div style={{ fontSize: '2rem', fontWeight: 900, color: 'var(--panel-text)', letterSpacing: '-1px' }}>{s.n}</div>
                <div style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--logo-green)', letterSpacing: '0.2em', textTransform: 'uppercase' }}>{s.l}</div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Divider */}
        <div style={{ position: 'absolute', left: '50%', top: '10%', bottom: '10%', width: '1px', background: 'linear-gradient(to bottom, transparent, rgba(5,168,106,0.35), transparent)', zIndex: 1 }} />

        {/* Right form */}
        <div style={{ width: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1 }}>
          <motion.div initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1], delay: 0.2 }}
            style={{ width: '100%', maxWidth: '400px', padding: '3rem' }}>

            <button onClick={() => setViewMode('landing')} style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', background: 'var(--panel-card)', border: '1px solid var(--panel-border)', padding: '0.5rem 1.2rem', borderRadius: '100px', color: 'var(--panel-muted)', fontSize: '0.75rem', fontWeight: 700, cursor: 'pointer', marginBottom: '2.5rem' }}>
              <ArrowRight size={13} style={{ transform: 'rotate(180deg)' }} /> Volver al sitio
            </button>

            <h2 style={{ fontSize: '1.8rem', fontWeight: 900, color: 'var(--panel-text)', letterSpacing: '-1px', marginBottom: '0.4rem' }}>Acceder al portal</h2>
            <p style={{ color: 'var(--panel-muted)', fontSize: '0.85rem', marginBottom: '2rem' }}>Selecciona tu tipo de acceso para continuar</p>

            <AnimatePresence mode="wait">
              {loginStep === 'choice' && (
                <motion.div key="choice" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} transition={springT}
                  style={{ display: 'flex', flexDirection: 'column', gap: '0.9rem' }}>
                  <motion.button whileHover={{ y: -2, scale: 1.01 }} whileTap={{ scale: 0.98 }} onClick={() => setLoginStep('admin-pass')}
                    style={{ width: '100%', padding: '1.3rem 1.6rem', background: 'var(--panel-green-bg)', border: '1px solid var(--panel-green-border)', borderRadius: '1.1rem', color: 'var(--panel-text)', fontWeight: 800, fontSize: '0.9rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: 'var(--logo-green)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}><Settings size={18} /></div>
                    <div style={{ textAlign: 'left' }}>
                      <div style={{ fontWeight: 900, marginBottom: '1px' }}>Administrador</div>
                      <div style={{ fontSize: '0.7rem', color: 'var(--panel-muted)', fontWeight: 500 }}>Gestión completa del dojo</div>
                    </div>
                    <ChevronRight size={16} style={{ marginLeft: 'auto', opacity: 0.35 }} />
                  </motion.button>
                  <motion.button whileHover={{ y: -2, scale: 1.01 }} whileTap={{ scale: 0.98 }} onClick={() => setLoginStep('student-select')}
                    style={{ width: '100%', padding: '1.3rem 1.6rem', background: 'var(--panel-card)', border: '1px solid var(--panel-border)', borderRadius: '1.1rem', color: 'var(--panel-text)', fontWeight: 800, fontSize: '0.9rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: 'var(--panel-card-hover)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}><Users size={18} /></div>
                    <div style={{ textAlign: 'left' }}>
                      <div style={{ fontWeight: 900, marginBottom: '1px' }}>Alumno</div>
                      <div style={{ fontSize: '0.7rem', color: 'var(--panel-muted)', fontWeight: 500 }}>Ver mi progreso y técnicas</div>
                    </div>
                    <ChevronRight size={16} style={{ marginLeft: 'auto', opacity: 0.35 }} />
                  </motion.button>
                </motion.div>
              )}
              {loginStep === 'admin-pass' && (
                <motion.div key="admin" initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }} transition={springT}
                  style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.9rem', marginBottom: '0.3rem' }}>
                    <div style={{ width: '38px', height: '38px', borderRadius: '10px', background: 'var(--panel-green-bg)', border: '1px solid var(--panel-green-border)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--logo-green)' }}><Settings size={16} /></div>
                    <div><div style={{ fontWeight: 900, color: 'var(--panel-text)', fontSize: '0.9rem' }}>Acceso Administrador</div><div style={{ fontSize: '0.7rem', color: 'var(--panel-muted)' }}>Introduce la contraseña</div></div>
                  </div>
                  <input type="password" autoFocus placeholder="••••••••"
                    style={{ width: '100%', padding: '1.1rem 1.5rem', background: 'var(--panel-input-bg)', border: '1px solid rgba(5,168,106,0.4)', borderRadius: '0.9rem', color: 'var(--panel-text)', fontSize: '1.2rem', outline: 'none', letterSpacing: '0.3em', textAlign: 'center' }}
                    value={adminPassword} onChange={e => setAdminPassword(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleLogin('admin')} />
                  <div style={{ display: 'flex', gap: '0.7rem' }}>
                    <button style={{ flex: 1, padding: '1rem', background: 'var(--panel-card)', border: '1px solid var(--panel-border)', borderRadius: '0.9rem', color: 'var(--panel-muted)', fontWeight: 700, cursor: 'pointer', fontSize: '0.8rem' }} onClick={() => setLoginStep('choice')}>← Volver</button>
                    <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }} style={{ flex: 2, padding: '1rem', background: 'var(--logo-green)', border: 'none', borderRadius: '0.9rem', color: '#fff', fontWeight: 900, cursor: 'pointer', fontSize: '0.85rem' }} onClick={() => handleLogin('admin')}>Entrar al panel</motion.button>
                  </div>
                  <p style={{ fontSize: '0.7rem', color: 'var(--panel-muted-soft)', textAlign: 'center' }}>Demo: <span style={{ color: 'var(--logo-green)' }}>admin123</span></p>
                </motion.div>
              )}
              {loginStep === 'student-select' && (
                <motion.div key="student" initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }} transition={springT}
                  style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.9rem', marginBottom: '0.3rem' }}>
                    <div style={{ width: '38px', height: '38px', borderRadius: '10px', background: 'var(--panel-blue-bg)', border: '1px solid var(--panel-blue-border)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#3b82f6' }}><Users size={16} /></div>
                    <div><div style={{ fontWeight: 900, color: 'var(--panel-text)', fontSize: '0.9rem' }}>Acceso Alumnos</div><div style={{ fontSize: '0.7rem', color: 'var(--panel-muted)' }}>Ingresa tus credenciales</div></div>
                  </div>
                  <input type="email" autoFocus placeholder="Correo Electrónico"
                    style={{ width: '100%', padding: '1.1rem 1.5rem', background: 'var(--panel-input-bg)', border: '1px solid var(--panel-input-border)', borderRadius: '0.9rem', color: 'var(--panel-text)', fontSize: '1rem', outline: 'none' }}
                    value={authEmail} onChange={e => setAuthEmail(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleLogin('student')} />
                  <input type="password" placeholder="Contraseña"
                    style={{ width: '100%', padding: '1.1rem 1.5rem', background: 'var(--panel-input-bg)', border: '1px solid var(--panel-input-border)', borderRadius: '0.9rem', color: 'var(--panel-text)', fontSize: '1rem', outline: 'none', letterSpacing: authPassword.length > 0 ? '0.2em' : 'normal' }}
                    value={authPassword} onChange={e => setAuthPassword(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleLogin('student')} />
                  <div style={{ display: 'flex', gap: '0.7rem', marginTop: '0.5rem' }}>
                    <button style={{ flex: 1, padding: '1rem', background: 'var(--panel-card)', border: '1px solid var(--panel-border)', borderRadius: '0.9rem', color: 'var(--panel-muted)', fontWeight: 700, cursor: 'pointer', fontSize: '0.8rem' }} onClick={() => setLoginStep('choice')}>← Volver</button>
                    <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }} style={{ flex: 2, padding: '1rem', background: '#3b82f6', border: 'none', borderRadius: '0.9rem', color: '#fff', fontWeight: 900, cursor: 'pointer', fontSize: '0.85rem' }} onClick={() => handleLogin('student')}>Iniciar Sesión</motion.button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </div>
      </div>
    );
  }

  // --- RENDERING STUDENT PANEL ---
  const studentAge = calculateAge(currentUser?.birthDate) as any;
  const isKid = studentAge !== 'N/A' && studentAge < 18;
  const scheduleData = isKid ? [
    { day: 'Martes', classes: [{ time: '18:00', name: 'Pequeños Campeones' }] },
    { day: 'Miércoles', classes: [{ time: '16:45', name: 'Pequeños Campeones' }] },
    { day: 'Jueves', classes: [{ time: '18:00', name: 'Pequeños Campeones' }] },
    { day: 'Viernes', classes: [{ time: '16:45', name: 'Pequeños Campeones' }] },
    { day: 'Sábado', classes: [{ time: '11:00', name: 'Pequeños Campeones' }] }
  ] : [
    { day: 'Lunes', classes: [{ time: '19:30', name: 'Ranas On Fire' }] },
    { day: 'Martes', classes: [{ time: '06:45', name: 'Valientes' }, { time: '19:00', name: 'Ranas On Fire' }] },
    { day: 'Miércoles', classes: [{ time: '19:30', name: 'Ranas No-Gi' }] },
    { day: 'Jueves', classes: [{ time: '06:45', name: 'Valientes' }, { time: '19:00', name: 'Ranas On Fire' }] },
    { day: 'Viernes', classes: [{ time: '20:00', name: 'Competidor' }] },
    { day: 'Sábado', classes: [{ time: '12:00', name: 'Open Mat' }] }
  ];

  const daysMap: Record<string, number> = { 'Lunes': 1, 'Martes': 2, 'Miércoles': 3, 'Jueves': 4, 'Viernes': 5, 'Sábado': 6, 'Domingo': 7 };

  const isClassDisabled = (day: string) => {
    const currentDayRaw = new Date().getDay();
    const currentDay = currentDayRaw === 0 ? 7 : currentDayRaw;
    const targetDay = daysMap[day];
    return targetDay !== undefined && targetDay < currentDay;
  };

  const getWeekStart = (date: Date) => {
    const d = new Date(date);
    const day = d.getDay() || 7;
    d.setHours(0, 0, 0, 0);
    d.setDate(d.getDate() - day + 1);
    return d.getTime();
  };

  const handleSelectNextClass = (day: string, time: string, name: string) => {
    if (isClassDisabled(day)) return;

    const currentDayRaw = new Date().getDay();
    const currentDay = currentDayRaw === 0 ? 7 : currentDayRaw;
    const targetDay = daysMap[day];
    if (targetDay === undefined) return;

    let distance = targetDay - currentDay;
    if (distance < 0) return;

    let d = new Date();
    d.setDate(d.getDate() + distance);
    d.setHours(12, 0, 0, 0); // safe mid-day target
    const targetTimestamp = d.getTime();

    if (!currentUser) return;

    const currentWeekStart = getWeekStart(new Date());
    const scheduled = currentUser.scheduledClasses || [];
    const thisWeekClasses = scheduled.filter(c => c.timestamp >= currentWeekStart);

    const isAlreadySelected = thisWeekClasses.some(c => c.day === day && c.time === time);

    let newScheduled: any[];
    if (isAlreadySelected) {
      newScheduled = scheduled.filter(c => !(c.day === day && c.time === time && c.timestamp >= currentWeekStart));
    } else {
      const planLimits: Record<string, number> = { '1': 1, '2': 2, '3': 3, '4': 4, 'Ilimitado': 99 };
      let planMax = 2;
      const planVal = currentUser.plan ? currentUser.plan[0] : '2';
      if (currentUser.plan?.toLowerCase().includes('ilimitado')) planMax = 99;
      else planMax = planLimits[planVal] || 2;

      if (thisWeekClasses.length >= planMax) {
        alert(`❌ Tu plan permite un máximo de ${planMax} clase(s) por semana.`);
        return;
      }
      newScheduled = [...scheduled, { day, time, name, timestamp: targetTimestamp }];
    }

    handleUpdateStudent({ ...currentUser, scheduledClasses: newScheduled });
  };

  if (viewMode === 'app' && role === 'student' && currentUser) {
    return (
      <div style={{ background: 'var(--panel-bg)', minHeight: '100vh', color: 'var(--panel-text)', overflowX: 'hidden' }}>
        {/* BG Orbs */}
        <div style={{ position: 'fixed', inset: 0, zIndex: 0, pointerEvents: 'none' }}>
          <div style={{ position: 'absolute', top: '-10%', right: '-10%', width: '500px', height: '500px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(5,168,106,0.12) 0%, transparent 70%)', filter: 'blur(80px)', opacity: 'var(--panel-orb-opacity)' }} />
          <div style={{ position: 'absolute', bottom: '10%', left: '-5%', width: '350px', height: '350px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(5,168,106,0.08) 0%, transparent 70%)', filter: 'blur(60px)', opacity: 'var(--panel-orb-opacity)' }} />
        </div>
        <div style={{ maxWidth: '480px', margin: '0 auto', padding: '2rem 1.5rem 8rem', position: 'relative', zIndex: 1 }}>
          {/* Header */}
          <motion.header initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}
            style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <div style={{ position: 'relative', width: '52px', height: '52px' }}>
                <div style={{ position: 'absolute', inset: 0, borderRadius: '50%', background: 'conic-gradient(var(--logo-green) 0%, transparent 60%, var(--logo-green) 100%)' }} />
                <img src={currentUser.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${currentUser.name}`} style={{ position: 'absolute', inset: '2px', borderRadius: '50%', background: '#111', objectFit: 'cover' }} />
              </div>
              <div>
                <div style={{ fontSize: '0.6rem', fontWeight: 900, color: 'var(--logo-green)', letterSpacing: '0.3em', textTransform: 'uppercase' }}>Bienvenido</div>
                <div style={{ fontSize: '1.5rem', fontWeight: 900, letterSpacing: '-0.5px', marginBottom: '4px' }}>{currentUser?.name?.split(' ')[0]}</div>
                <div className={`belt-badge belt-${currentUser?.belt || 'WHITE'}`} style={{ fontSize: '0.55rem', padding: '0.2rem 0.5rem', display: 'inline-block' }}>{beltLabels[currentUser?.belt || 'WHITE']}</div>
              </div>
            </div>
            <div style={{ display: 'flex', gap: '0.6rem' }}>
              <motion.button whileTap={{ scale: 0.88 }} onClick={() => setViewMode('auth')} style={{ width: '40px', height: '40px', borderRadius: '11px', background: 'var(--panel-card)', border: '1px solid var(--panel-border)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: 'var(--panel-muted)' }}>
                <LogOut size={17} />
              </motion.button>
            </div>
          </motion.header>

          {/* Main Views */}
          <AnimatePresence mode="wait">
            {activeTab === 'dashboard' && (
              <motion.div key="dashboard" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.3 }}>
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
                  style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.9rem', marginBottom: '1.2rem' }}>
                  <div style={{ background: currentUser?.isPaid ? 'var(--panel-green-bg)' : 'var(--panel-red-bg)', border: `1px solid ${currentUser?.isPaid ? 'var(--panel-green-border)' : 'var(--panel-red-border)'}`, borderRadius: '1.1rem', padding: '1.3rem', textAlign: 'center' }}>
                    <CreditCard size={22} style={{ color: currentUser?.isPaid ? 'var(--logo-green)' : '#ef4444', marginBottom: '0.6rem' }} />
                    <div style={{ fontSize: '0.6rem', color: 'var(--panel-muted)', fontWeight: 800, letterSpacing: '0.1em', marginBottom: '0.2rem' }}>MENSUALIDAD</div>
                    <div style={{ fontWeight: 900, color: currentUser?.isPaid ? 'var(--logo-green)' : '#ef4444', fontSize: '0.85rem' }}>{currentUser?.isPaid ? '✓ AL DÍA' : '⚠ PENDIENTE'}</div>
                  </div>
                  <div style={{ background: 'var(--panel-purple-bg)', border: '1px solid var(--panel-purple-border)', borderRadius: '1.1rem', padding: '1.3rem', textAlign: 'center' }}>
                    <Calendar size={22} style={{ color: '#a78bfa', marginBottom: '0.6rem' }} />
                    <div style={{ fontSize: '0.6rem', color: 'var(--panel-muted)', fontWeight: 800, letterSpacing: '0.1em', marginBottom: '0.4rem' }}>CLASES RESERVADAS</div>
                    {(() => {
                      const cWeekStart = getWeekStart(new Date());
                      const booked = (currentUser?.scheduledClasses || []).filter(c => c.timestamp >= cWeekStart);
                      let planMax = 2;
                      const planVal = currentUser?.plan ? currentUser.plan[0] : '2';
                      if (currentUser?.plan?.toLowerCase().includes('ilimitado')) planMax = 99;
                      else planMax = parseInt(planVal) || 2;

                      if (booked.length > 0) {
                        return <div style={{ fontWeight: 900, fontSize: '0.95rem' }}>{booked.length} de {planMax} <span style={{ fontSize: '0.7rem', color: 'var(--panel-muted)' }}>esta semana</span></div>;
                      } else {
                        return <div style={{ fontWeight: 800, fontSize: '0.65rem', color: 'var(--panel-muted)', lineHeight: 1.4 }}>Selecciona en tu horario<br /><span style={{ color: 'var(--logo-green)' }}>un día esta semana 👇</span></div>;
                      }
                    })()}
                  </div>
                </motion.div>

                {(!currentUser?.isPaid) && (
                  <motion.button initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.22 }}
                    whileHover={{ scale: 1.02, boxShadow: '0 15px 30px rgba(0,157,255,0.25)' }} whileTap={{ scale: 0.97 }}
                    onClick={() => handleCreatePaymentLink(currentUser)}
                    style={{ width: '100%', padding: '1.2rem', background: '#009EE3', border: 'none', borderRadius: '1.3rem', color: '#fff', fontWeight: 900, fontSize: '0.95rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.7rem', letterSpacing: '0.05em', marginBottom: '1.2rem', boxShadow: '0 8px 30px rgba(0,157,255,0.15)' }}>
                    <CreditCard size={20} /> PAGAR CON MERCADO PAGO
                  </motion.button>
                )}

                {/* Horarios */}
                <motion.section initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.28 }} style={{ marginBottom: '2rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                    <h3 style={{ fontSize: '1rem', fontWeight: 900 }}>Tus Horarios ({isKid ? 'Niños - Gimnasio Fénix' : 'Adultos'})</h3>
                  </div>
                  <div style={{ display: 'flex', overflowX: 'auto', gap: '0.8rem', paddingBottom: '0.5rem', margin: '0 -1.5rem', padding: '0 1.5rem', WebkitOverflowScrolling: 'touch' }}>
                    {scheduleData.map((dayItem, idx) => (
                      <div key={idx} style={{ flexShrink: 0, width: '135px', background: 'var(--panel-surface)', border: '1px solid var(--panel-border)', borderRadius: '1.1rem', padding: '1.2rem', display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
                        <div style={{ fontSize: '0.75rem', fontWeight: 900, color: 'var(--logo-green)', letterSpacing: '0.1em', textTransform: 'uppercase' }}>{dayItem.day}</div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                          {dayItem.classes.map((cls, cIdx) => {
                            const disabled = isClassDisabled(dayItem.day);
                            const cWeekStart = getWeekStart(new Date());
                            const isSelected = (currentUser?.scheduledClasses || []).some(sc => sc.timestamp >= cWeekStart && sc.day === dayItem.day && sc.time === cls.time && sc.name === cls.name);
                            return (
                              <motion.div key={cIdx}
                                whileHover={!disabled ? { scale: 1.02 } : {}}
                                whileTap={!disabled ? { scale: 0.98 } : {}}
                                onClick={() => !disabled && handleSelectNextClass(dayItem.day, cls.time, cls.name)}
                                style={{
                                  background: isSelected ? 'var(--logo-green)' : (disabled ? 'transparent' : 'var(--panel-bg)'),
                                  borderRadius: '0.6rem',
                                  padding: '0.7rem',
                                  border: isSelected ? '1px solid var(--logo-green)' : (disabled ? '1px dashed var(--panel-input-border)' : '1px solid var(--panel-input-border)'),
                                  cursor: disabled ? 'not-allowed' : 'pointer',
                                  opacity: disabled ? 0.35 : 1
                                }}>
                                <div style={{ fontSize: '1.1rem', fontWeight: 900, color: isSelected ? '#fff' : 'var(--text-main)', marginBottom: '0.2rem' }}>{cls.time}</div>
                                <div style={{ fontSize: '0.65rem', fontWeight: 700, color: isSelected ? 'rgba(255,255,255,0.85)' : 'var(--panel-muted)', textTransform: 'capitalize' }}>{cls.name}</div>
                              </motion.div>
                            )
                          })}
                        </div>
                      </div>
                    ))}
                  </div>
                </motion.section>

                {/* Videos */}
                <motion.section initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                    <h3 style={{ fontSize: '1rem', fontWeight: 900 }}>Técnicas para ti</h3>
                    <span style={{ fontSize: '0.65rem', fontWeight: 900, color: 'var(--logo-green)', letterSpacing: '0.1em' }}>VER TODO</span>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.7rem' }}>
                    {videos.filter(v => v.beltLevel === currentUser?.belt).length > 0 ? (
                      videos.filter(v => v.beltLevel === currentUser?.belt).map((video, i) => (
                        <motion.div key={video.id} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.35 + i * 0.07 }}
                          whileHover={{ x: 6 }}
                          style={{ display: 'flex', gap: '1rem', padding: '0.9rem', background: 'var(--panel-card)', border: '1px solid var(--panel-border)', borderRadius: '1.1rem', alignItems: 'center', cursor: 'pointer' }}>
                          <div style={{ position: 'relative', width: '72px', height: '50px', borderRadius: '0.7rem', overflow: 'hidden', flexShrink: 0 }}>
                            <img src={video.thumbnail} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                            <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.35)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                              <Play size={16} fill="#fff" color="#fff" />
                            </div>
                          </div>
                          <div style={{ flex: 1 }}>
                            <div style={{ fontWeight: 900, fontSize: '0.85rem', marginBottom: '2px' }}>{video.title}</div>
                            <div style={{ fontSize: '0.65rem', color: 'var(--logo-green)', fontWeight: 800 }}>{video.category.toUpperCase()}</div>
                          </div>
                          <ChevronRight size={14} style={{ opacity: 0.25 }} />
                        </motion.div>
                      ))
                    ) : (
                      <div style={{ padding: '2rem', textAlign: 'center', background: 'var(--panel-card)', borderRadius: '1.1rem', border: '1px dashed var(--panel-border)' }}>
                        <div style={{ fontSize: '1.8rem', marginBottom: '0.5rem' }}>🥋</div>
                        <p style={{ color: 'var(--panel-muted)', fontSize: '0.8rem' }}>Próximamente contenido para tu grado.</p>
                      </div>
                    )}
                  </div>
                </motion.section>
              </motion.div >
            )}

            {
              activeTab === 'attendance' && (
                <motion.div key="attendance" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} transition={{ duration: 0.3 }}>
                  <div style={{ padding: '3rem 2rem', textAlign: 'center', background: 'var(--panel-card)', borderRadius: '1.5rem', border: '1px solid var(--panel-border)' }}>
                    <div style={{ fontSize: '3rem', marginBottom: '1.5rem' }}>📅</div>
                    <h3 style={{ marginBottom: '0.8rem', fontWeight: 900, fontSize: '1.4rem' }}>Historial de Asistencia</h3>
                    <p style={{ color: 'var(--panel-muted)', fontSize: '0.9rem', lineHeight: 1.5 }}>
                      Pronto podrás ver el detalle de todas tus clases asistidas aquí. ¡Sigue entrenando duro!
                    </p>
                  </div>
                </motion.div>
              )
            }

            {
              activeTab === 'settings' && (
                <motion.div key="settings" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} transition={{ duration: 0.3 }}>
                  <div style={{ padding: '2rem', background: 'var(--panel-card)', borderRadius: '1.5rem', border: '1px solid var(--panel-border)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem' }}>
                      <Settings size={28} style={{ color: 'var(--logo-green)' }} />
                      <h3 style={{ fontWeight: 900, fontSize: '1.4rem' }}>Mi Perfil</h3>
                    </div>

                    <div style={{ display: 'grid', gap: '1.5rem', marginBottom: '2.5rem', padding: '1.5rem', background: 'var(--panel-surface)', borderRadius: '1.2rem', border: '1px solid var(--panel-border)' }}>
                      <div>
                        <div style={{ fontSize: '0.7rem', fontWeight: 800, color: 'var(--panel-muted)', letterSpacing: '0.1em', marginBottom: '0.3rem' }}>NOMBRE</div>
                        <div style={{ fontWeight: 900, fontSize: '1.1rem' }}>{currentUser.name}</div>
                      </div>
                      <div>
                        <div style={{ fontSize: '0.7rem', fontWeight: 800, color: 'var(--panel-muted)', letterSpacing: '0.1em', marginBottom: '0.3rem' }}>PLAN DE ENTRENAMIENTO</div>
                        <div style={{ fontWeight: 900, fontSize: '1.1rem' }}>{currentUser.plan && planLabels[currentUser.plan.toString()] ? planLabels[currentUser.plan.toString()] : (currentUser.plan || 'Plan Normal')}</div>
                      </div>
                      <div>
                        <div style={{ fontSize: '0.7rem', fontWeight: 800, color: 'var(--panel-muted)', letterSpacing: '0.1em', marginBottom: '0.3rem' }}>VALOR MENSUALIDAD</div>
                        <div style={{ fontWeight: 900, fontSize: '1.1rem' }}>{formatCLP(currentUser.monthlyFee || 0)}</div>
                      </div>
                    </div>

                    <div style={{ marginBottom: '2.5rem', padding: '1.5rem', background: 'var(--panel-surface)', borderRadius: '1.2rem', border: '1px solid var(--panel-border)' }}>
                      <div style={{ fontSize: '0.7rem', fontWeight: 800, color: 'var(--panel-muted)', letterSpacing: '0.1em', marginBottom: '1rem' }}>SEGURIDAD</div>
                      <div style={{ display: 'flex', gap: '0.8rem' }}>
                        <input type="password" placeholder="Nueva contraseña"
                          style={{ flex: 1, padding: '1rem', background: 'var(--panel-input-bg)', border: '1px solid var(--panel-input-border)', borderRadius: '0.9rem', color: 'var(--panel-text)', fontSize: '0.9rem', outline: 'none' }}
                          value={studentNewPassword} onChange={e => setStudentNewPassword(e.target.value)} />
                        <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.95 }}
                          style={{ padding: '0 1.5rem', background: 'var(--logo-green)', border: 'none', borderRadius: '0.9rem', color: '#fff', fontWeight: 900, cursor: 'pointer', fontSize: '0.85rem' }}
                          onClick={handleUpdateStudentPassword}>Actualizar</motion.button>
                      </div>
                    </div>

                    <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.95 }} onClick={() => setViewMode('auth')}
                      style={{ width: '100%', padding: '1.2rem', borderRadius: '1rem', background: 'var(--panel-red-bg)', color: '#ef4444', border: '1px solid var(--panel-red-border)', fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                      <LogOut size={18} /> Cerrar Sesión
                    </motion.button>
                  </div>
                </motion.div>
              )
            }
          </AnimatePresence >
        </div >

        {/* Tab Bar */}
        < motion.nav initial={{ y: 100, x: '-50%' }} animate={{ y: 0, x: '-50%' }} transition={{ delay: 0.5, type: 'spring', stiffness: 300, damping: 30 }}
          style={{ position: 'fixed', bottom: '1.2rem', left: '50%', width: 'calc(100% - 2.5rem)', maxWidth: '440px', height: '66px', display: 'flex', justifyContent: 'space-around', alignItems: 'center', zIndex: 1000, borderRadius: '100px', background: 'var(--panel-sidebar)', backdropFilter: 'blur(30px)', border: '1px solid var(--panel-border)', boxShadow: '0 20px 60px rgba(0,0,0,0.5)' }}>
          <motion.button whileTap={{ scale: 0.82 }} onClick={() => setActiveTab('dashboard')}
            style={{ background: 'none', border: 'none', color: activeTab === 'dashboard' ? 'var(--logo-green)' : 'var(--panel-muted)', padding: '0.8rem', cursor: 'pointer', position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '3px' }}>
            <Users size={20} />
            {activeTab === 'dashboard' && <div style={{ width: '4px', height: '4px', borderRadius: '50%', background: 'var(--logo-green)' }} />}
          </motion.button>

          <motion.div whileTap={{ scale: 0.92 }} onClick={() => {
            alert('Abre cámara para escanear asistencia. Próximamente.')
          }} style={{ width: '60px', height: '60px', borderRadius: '50%', background: 'linear-gradient(135deg, #05a86a, #10f49c)', color: '#000', outline: '8px solid var(--panel-sidebar)', marginTop: '-30px', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 10px 20px rgba(5,168,106,0.3)', cursor: 'pointer' }}>
            <QrCode size={24} />
          </motion.div>

          <motion.button whileTap={{ scale: 0.82 }} onClick={() => setActiveTab('settings')}
            style={{ background: 'none', border: 'none', color: activeTab === 'settings' ? 'var(--logo-green)' : 'var(--panel-muted)', padding: '0.8rem', cursor: 'pointer', position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '3px' }}>
            <Settings size={20} />
            {activeTab === 'settings' && <div style={{ width: '4px', height: '4px', borderRadius: '50%', background: 'var(--logo-green)' }} />}
          </motion.button>
        </motion.nav >
      </div >
    );
  }

  // --- RENDERING ADMIN PANEL ---
  const tabLabels: Record<string, string> = { dashboard: 'Resumen', students: 'Alumnos', videos: 'Biblioteca', attendance: 'Asistencia', payments: 'Finanzas', settings: 'Ajustes' };
  return (
    <div style={{ background: 'var(--panel-bg)', minHeight: '100vh', display: 'flex', color: 'var(--panel-text)', overflow: 'hidden' }}>
      {/* Mobile Header */}
      <div style={{
        position: 'fixed', top: 0, left: 0, right: 0, height: '70px', background: '#000', zIndex: 1000,
        padding: '0 1.5rem', display: 'none', alignItems: 'center', justifyContent: 'space-between',
        borderBottom: '1px solid rgba(255,255,255,0.1)'
      }} className="mobile-admin-header">
        <img src="https://i.ibb.co/vzPR7LTC/ranas-logo.png" style={{ height: '35px' }} />
        <button
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          style={{ background: 'none', border: 'none', color: '#fff' }}
        >
          {isMobileMenuOpen ? <X /> : <Plus style={{ transform: 'rotate(45deg)' }} />}
        </button>
      </div>

      {/* BG */}
      <div style={{ position: 'fixed', inset: 0, zIndex: 0, pointerEvents: 'none' }}>
        <div style={{ position: 'absolute', top: 0, right: '20%', width: '600px', height: '600px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(5,168,106,0.08) 0%, transparent 70%)', filter: 'blur(100px)', opacity: 'var(--panel-orb-opacity)' }} />
        <div style={{ position: 'absolute', bottom: 0, left: '20%', width: '400px', height: '400px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(5,168,106,0.06) 0%, transparent 70%)', filter: 'blur(80px)', opacity: 'var(--panel-orb-opacity)' }} />
        <div style={{ position: 'absolute', inset: 0, backgroundImage: 'radial-gradient(circle at 1px 1px, var(--panel-grid-dot) 1px, transparent 0)', backgroundSize: '32px 32px' }} />
      </div>

      {/* Sidebar */}
      <motion.nav initial={{ x: -300, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        className={`sidebar ${isMobileMenuOpen ? 'sidebar-open' : ''}`}
        style={{ position: 'fixed', left: 0, top: 0, bottom: 0, padding: '2rem 1.5rem', display: 'flex', flexDirection: 'column', zIndex: 100, background: 'rgba(6,6,6,0.95)', backdropFilter: 'blur(40px)', borderRight: '1px solid rgba(255,255,255,0.06)' }}>
        {/* Header Branding */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', marginBottom: '3.5rem', padding: '1rem 0' }}>
          <div style={{ position: 'relative', marginBottom: '1.2rem' }}>
            <div style={{ position: 'absolute', inset: '-8px', background: 'var(--logo-green)', borderRadius: '50%', filter: 'blur(15px)', opacity: 0.3 }} />
            <img src="/assets/WhatsApp Image 2026-03-04 at 1.50.04 PM.jpeg" alt="Logo"
              style={{
                width: '140px',
                aspectRatio: '1/1',
                borderRadius: '50%',
                objectFit: 'contain',
                background: '#000',
                border: '2px solid var(--logo-green)',
                position: 'relative',
                imageRendering: 'auto'
              }} />
          </div>
          <div style={{ fontSize: '2.2rem', fontWeight: 900, color: 'var(--logo-green)', lineHeight: 1, letterSpacing: '-2px', marginBottom: '0.5rem' }}>RANAS</div>
          <div style={{ fontSize: '0.6rem', fontWeight: 800, color: '#fff', letterSpacing: '0.2em', textTransform: 'uppercase', opacity: 0.9 }}>Panel de Administración</div>
        </div>
        {/* Nav items */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem', flex: 1 }}>
          {[
            { id: 'dashboard', label: 'Resumen', icon: <TrendingUp size={17} /> },
            { id: 'students', label: 'Alumnos', icon: <Users size={17} /> },
            { id: 'videos', label: 'Biblioteca', icon: <Play size={17} /> },
            { id: 'attendance', label: 'Asistencia', icon: <QrCode size={17} /> },
            { id: 'payments', label: 'Finanzas', icon: <CreditCard size={17} /> },
            { id: 'settings', label: 'Ajustes', icon: <Settings size={17} /> },
          ].map(item => (
            <motion.button key={item.id} whileHover={{ x: 4 }} whileTap={{ scale: 0.97 }}
              onClick={() => {
                setActiveTab(item.id as any);
                setIsMobileMenuOpen(false);
              }}
              style={{ display: 'flex', alignItems: 'center', gap: '0.9rem', padding: '0.8rem 1rem', borderRadius: '0.8rem', border: 'none', background: activeTab === item.id ? 'var(--panel-green-bg)' : 'transparent', color: '#fff', fontWeight: activeTab === item.id ? 800 : 500, fontSize: '0.85rem', cursor: 'pointer', textAlign: 'left', position: 'relative', overflow: 'hidden', opacity: activeTab === item.id ? 1 : 0.7 }}>
              {activeTab === item.id && (
                <motion.div layoutId="sidebar-active"
                  style={{ position: 'absolute', left: 0, top: '15%', bottom: '15%', width: '3px', borderRadius: '2px', background: 'var(--logo-green)' }} />
              )}
              <span style={{ color: activeTab === item.id ? 'var(--logo-green)' : '#fff', opacity: activeTab === item.id ? 1 : 0.6 }}>{item.icon}</span>
              {item.label}
            </motion.button>
          ))}
        </div>

        {/* Bottom */}
        <div style={{ marginTop: 'auto', borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: '1.2rem' }}>
          <motion.button whileTap={{ scale: 0.95 }} onClick={() => setViewMode('auth')}
            style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.9rem', padding: '0.7rem 1rem', borderRadius: '0.8rem', border: 'none', background: 'transparent', color: 'rgba(239,68,68,0.7)', fontWeight: 700, fontSize: '0.8rem', cursor: 'pointer', width: '100%' }}>
            <LogOut size={16} /> Cerrar sesión
          </motion.button>
        </div>
      </motion.nav>

      {/* Main content */}
      <main className="main-content" style={{ flex: 1, padding: '2.5rem 3rem', position: 'relative', zIndex: 1, overflowY: 'auto' }}>
        {/* Header */}
        <motion.header initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}
          style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2.5rem' }}>
          <div>
            <div style={{ fontSize: '0.65rem', fontWeight: 800, color: 'var(--logo-green)', letterSpacing: '0.3em', textTransform: 'uppercase', marginBottom: '0.3rem' }}>Ranas · Lautaro 581</div>
            <h1 style={{ fontSize: '2rem', fontWeight: 900, letterSpacing: '-1px', color: 'var(--logo-green)' }}>{tabLabels[activeTab]}</h1>
          </div>
          <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }} className="mobile-hide">
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', padding: '0.6rem 1.4rem', background: 'var(--panel-card)', border: '1px solid var(--panel-border)', borderRadius: '100px' }}>
              <Search size={15} style={{ color: 'var(--logo-green)', opacity: 0.7 }} />
              <input type="text" placeholder="Buscar..."
                style={{ background: 'none', border: 'none', outline: 'none', color: 'var(--panel-text)', fontSize: '0.85rem', width: '180px' }}
                value={studentSearchTerm} onChange={e => setStudentSearchTerm(e.target.value)} />
            </div>
            <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
              onClick={() => activeTab === 'videos' ? setIsAddingVideo(true) : setIsAddingStudent(true)}
              style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.7rem 1.4rem', background: 'var(--logo-green)', border: 'none', borderRadius: '100px', color: '#fff', fontWeight: 900, fontSize: '0.8rem', cursor: 'pointer', letterSpacing: '0.03em' }}>
              <Plus size={16} /> {activeTab === 'videos' ? 'Nuevo Video' : 'Nuevo Alumno'}
            </motion.button>
          </div>
        </motion.header >

        <AnimatePresence mode="wait">
          {activeTab === 'dashboard' && (
            <motion.div key="dashboard" initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }}
              style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.2rem' }}>
              {[
                { title: 'Total Alumnos', value: students.length, icon: <Users size={18} />, sub: '+12% este mes', color: 'var(--panel-green-bg)', border: 'var(--panel-green-border)' },
                { title: 'Alumnos al Día', value: students.filter(s => s.isPaid).length, icon: <Award size={18} />, sub: 'Pagos vigentes', color: 'var(--panel-green-bg)', border: 'var(--panel-green-border)' },
                { title: 'Pendientes', value: students.filter(s => !s.isPaid).length, icon: <CreditCard size={18} />, sub: 'Requieren atención', color: 'var(--panel-red-bg)', border: 'var(--panel-red-border)' },
              ].map((card, i) => (
                <motion.div key={i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}
                  style={{ background: card.color, border: `1px solid ${card.border}`, borderRadius: '1.2rem', padding: '1.5rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.2rem' }}>
                    <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'rgba(5,168,106,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--logo-green)' }}>{card.icon}</div>
                    <span style={{ fontSize: '0.65rem', fontWeight: 800, color: 'var(--panel-muted)', letterSpacing: '0.05em' }}>{card.sub}</span>
                  </div>
                  <div style={{ fontSize: '2.2rem', fontWeight: 900, letterSpacing: '-1px', marginBottom: '0.2rem', color: 'var(--panel-text)' }}>{card.value}</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--panel-muted)', fontWeight: 600 }}>{card.title}</div>
                </motion.div>
              ))}

              {/* Upcoming Birthdays */}
              <div style={{ gridColumn: 'span 3', marginTop: '1rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.2rem' }}>
                  <h3 style={{ fontSize: '1.1rem', fontWeight: 900, color: 'var(--logo-green)' }}>Próximos Cumpleaños 🎂</h3>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '1rem' }}>
                  {getUpcomingBirthdays().map((student) => {
                    const bd = new Date(student.birthDate!);
                    return (
                      <motion.div key={student.id} whileHover={{ y: -5 }}
                        style={{ background: 'var(--panel-surface)', border: '1px solid var(--panel-border)', borderRadius: '1.2rem', padding: '1.5rem', textAlign: 'center' }}>
                        <div style={{ fontSize: '1.8rem', marginBottom: '0.6rem' }}>🎁</div>
                        <div style={{ fontWeight: 900, fontSize: '0.85rem', color: 'var(--panel-text)', marginBottom: '0.3rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{student.name.split(' ')[0]}</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--logo-green)', fontWeight: 800 }}>
                          {bd.toLocaleDateString('es-CL', { day: 'numeric', month: 'long' })}
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              </div>

              {/* Pending Payments */}
              <section style={{ gridColumn: 'span 2', marginTop: '1rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.2rem' }}>
                  <h3 style={{ fontSize: '1rem', fontWeight: 900, color: 'var(--logo-green)' }}>Pagos Pendientes ⚠️</h3>
                  <button style={{ background: 'none', border: 'none', color: 'var(--logo-green)', fontWeight: 800, fontSize: '0.75rem', letterSpacing: '0.05em', cursor: 'pointer' }} onClick={() => setActiveTab('students')}>VER TODOS LOS ALUMNOS</button>
                </div>
                <div style={{ background: 'var(--panel-surface)', border: '1px solid var(--panel-border)', borderRadius: '1.2rem', overflow: 'hidden' }}>
                  {students.filter(s => !s.isPaid).slice(0, 5).map((student, i) => (
                    <motion.div key={student.id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 + i * 0.05 }}
                      style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem 1.5rem', borderBottom: '1px solid var(--panel-border-light)', cursor: 'pointer', transition: 'background 0.2s' }}
                      className="hover-light">
                      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <div style={{ width: '38px', height: '38px', borderRadius: '10px', background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, color: '#ef4444', fontSize: '1rem' }}>{student.name[0]}</div>
                        <div>
                          <div style={{ fontWeight: 800, fontSize: '0.9rem', marginBottom: '2px', color: 'var(--panel-text)' }}>{student.name}</div>
                          <div style={{ fontSize: '0.7rem', color: 'var(--panel-muted)' }}>{student.phone}</div>
                        </div>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <div className={`belt-badge belt-${student.belt}`} style={{ fontSize: '0.6rem', padding: '0.3rem 0.8rem' }}>{beltLabels[student.belt]}</div>
                        <span style={{ fontSize: '0.7rem', fontWeight: 800, color: '#ef4444' }}>⚠ PENDIENTE</span>
                      </div>
                    </motion.div>
                  ))}
                  {students.filter(s => !s.isPaid).length === 0 && (
                    <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--panel-muted)' }}>Todo al día ✨</div>
                  )}
                </div>
              </section>

              {/* Belt distribution */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '1rem' }}>
                <h3 style={{ fontSize: '1rem', fontWeight: 900, color: 'var(--logo-green)', marginBottom: '0.2rem' }}>Distribución</h3>
                <div style={{ background: 'var(--panel-surface)', border: '1px solid var(--panel-border)', borderRadius: '1.2rem', padding: '1.5rem', display: 'flex', alignItems: 'flex-end', gap: '0.6rem', height: '220px' }}>
                  {(['WHITE', 'BLUE', 'PURPLE', 'BROWN', 'BLACK', 'GRAY'] as Belt[]).map((belt) => {
                    const count = students.filter(s => s.belt === belt).length;
                    const h = Math.max(10, (count / (students.length || 1)) * 100);
                    return (
                      <div key={belt} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem', flex: 1, justifyContent: 'flex-end' }}>
                        <div style={{ fontSize: '0.65rem', fontWeight: 800, color: 'var(--panel-muted)' }}>{count}</div>
                        <div style={{ width: '100%', height: `${h}%`, background: `var(--belt-${belt.toLowerCase()})`, borderRadius: '6px', border: belt === 'WHITE' ? '1px solid var(--panel-border)' : 'none' }} />
                        <div style={{ fontSize: '0.6rem', fontWeight: 900, color: 'var(--panel-muted-soft)' }}>{beltLabels[belt][0]}</div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'attendance' && (
            <motion.div key="attendance" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'minmax(300px, 1fr) 2fr', gap: '2.5rem' }}>
                <div className="glass" style={{ padding: '3.5rem', borderRadius: '3rem', textAlign: 'center', height: 'fit-content' }}>
                  <div style={{ width: '220px', height: '220px', margin: '0 auto 2rem', padding: '2rem', background: 'white', borderRadius: '2rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <QRCode value="https://ranasjiujitsu.cl/checkin" size={180} />
                  </div>
                  <h3 style={{ fontSize: '1.4rem', fontWeight: 900, marginBottom: '0.8rem' }}>Check-in Tatami</h3>
                  <p style={{ color: 'var(--logo-green)', fontWeight: 800, fontSize: '0.7rem', letterSpacing: '0.15em' }}>REGISTRO DIGITAL</p>
                </div>

                <div>
                  <h3 style={{ fontSize: '1.2rem', fontWeight: 900, marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
                    <Calendar size={20} color="var(--logo-green)" />
                    Alumnos Registrados esta Semana
                  </h3>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1.2rem' }}>
                    {Object.keys(daysMap).map(day => {
                      const cWeekStart = getWeekStart(new Date());
                      const dailyStudents = students.filter(s =>
                        (s.scheduledClasses || []).some(c => c.day === day && c.timestamp >= cWeekStart)
                      );
                      if (dailyStudents.length === 0) return null;
                      return (
                        <div key={day} className="glass" style={{ padding: '1.5rem', borderRadius: '1.8rem', border: '1px solid var(--glass-border)' }}>
                          <h4 style={{ color: 'var(--logo-green)', fontWeight: 900, fontSize: '0.9rem', marginBottom: '1rem', textTransform: 'uppercase', letterSpacing: '0.1em' }}>{day}</h4>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
                            {dailyStudents.map(s => {
                              const cls = s.scheduledClasses?.find(c => c.day === day && c.timestamp >= cWeekStart);
                              return (
                                <div key={s.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                  <div style={{ fontSize: '0.85rem', fontWeight: 700 }}>{s.name.split(' ')[0]} {s.name.split(' ').slice(-1)}</div>
                                  <div style={{ fontSize: '0.75rem', color: 'var(--panel-muted)', fontWeight: 800 }}>{cls?.time}</div>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'students' && (
            <motion.div key="students" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
              <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
                <select className="glass" style={{ padding: '0.8rem 1.2rem', borderRadius: '1rem', background: 'var(--panel-surface)', color: 'var(--panel-text)', border: '1px solid var(--panel-border)', outline: 'none', fontWeight: 700 }}
                  value={studentFilterAge} onChange={e => setStudentFilterAge(e.target.value as any)}>
                  <option value="ALL">Todas las edades</option>
                  <option value="KIDS">Niños (Menores de 18)</option>
                  <option value="ADULTS">Adultos (18+)</option>
                </select>
                <select className="glass" style={{ padding: '0.8rem 1.2rem', borderRadius: '1rem', background: 'var(--panel-surface)', color: 'var(--panel-text)', border: '1px solid var(--panel-border)', outline: 'none', fontWeight: 700 }}
                  value={studentFilterBelt} onChange={e => setStudentFilterBelt(e.target.value as any)}>
                  <option value="ALL">Todos los cinturones</option>
                  {Object.keys(beltLabels).map(b => (
                    <option key={b} value={b}>{beltLabels[b as Belt]}</option>
                  ))}
                </select>
              </div>
              <div className="glass" style={{ borderRadius: '3.5rem', overflow: 'hidden', border: '1px solid var(--glass-border)' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                  <thead>
                    <tr style={{ background: 'rgba(5, 168, 106, 0.05)', borderBottom: '1px solid var(--glass-border)' }}>
                      <th style={{ padding: '1.5rem', fontSize: '0.7rem', fontWeight: 900, color: 'var(--logo-green)', letterSpacing: '0.1em' }}>ALUMNO</th>
                      <th style={{ padding: '1.5rem', fontSize: '0.7rem', fontWeight: 900, color: 'var(--logo-green)', letterSpacing: '0.1em' }}>CINTURÓN</th>
                      <th style={{ padding: '1.5rem', fontSize: '0.7rem', fontWeight: 900, color: 'var(--logo-green)', letterSpacing: '0.1em' }}>ASISTENCIAS</th>
                      <th style={{ padding: '1.5rem', fontSize: '0.7rem', fontWeight: 900, color: 'var(--logo-green)', letterSpacing: '0.1em' }}>ESTADO</th>
                      <th style={{ padding: '1.5rem', fontSize: '0.7rem', fontWeight: 900, color: 'var(--logo-green)', letterSpacing: '0.1em', textAlign: 'right' }}>ACCIONES</th>
                    </tr>
                  </thead>
                  <tbody>
                    {students
                      .filter(s => s.name.toLowerCase().includes(studentSearchTerm.toLowerCase()))
                      .filter(s => studentFilterBelt === 'ALL' || s.belt === studentFilterBelt)
                      .filter(s => {
                        if (studentFilterAge === 'ALL') return true;
                        const ageStr = calculateAge(s.birthDate);
                        if (ageStr === 'N/A') return false;
                        const age = parseInt(ageStr.toString());
                        if (studentFilterAge === 'KIDS') return age < 18;
                        if (studentFilterAge === 'ADULTS') return age >= 18;
                        return true;
                      })
                      .map((student) => (
                        <tr key={student.id} style={{ borderBottom: '1px solid var(--glass-border)', transition: 'all 0.3s' }} className="hover-light">
                          <td style={{ padding: '1.5rem' }}>
                            <p style={{ fontWeight: 900, fontSize: '1rem', color: 'var(--text-main)' }}>{student.name}</p>
                            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{student.email}</p>
                          </td>
                          <td style={{ padding: '1.5rem' }}>
                            <div className={`belt-badge belt-${student.belt}`} style={{ display: 'inline-block', padding: '0.5rem 1rem', fontSize: '0.65rem' }}>{beltLabels[student.belt]}</div>
                          </td>
                          <td style={{ padding: '1.5rem' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
                              <div style={{ flex: 1, height: '5px', background: 'var(--glass-border)', borderRadius: '10px', maxWidth: '80px', overflow: 'hidden' }}>
                                <div style={{ width: `${(student.classesAttended / student.classesToNextBelt) * 100}%`, height: '100%', background: 'var(--logo-green)' }}></div>
                              </div>
                              <span style={{ fontSize: '0.8rem', fontWeight: 800, color: 'var(--text-main)' }}>{student.classesAttended}</span>
                            </div>
                          </td>
                          <td style={{ padding: '1.5rem' }}>
                            <span style={{ color: student.isPaid ? 'var(--logo-green)' : '#ef4444', fontWeight: 900, fontSize: '0.75rem' }}>{student.isPaid ? 'AL DÍA' : 'PENDIENTE'}</span>
                          </td>
                          <td style={{ padding: '1.5rem', textAlign: 'right' }}>
                            <button onClick={() => setSelectedStudent(student)} style={{ background: 'none', border: '1px solid var(--glass-border)', padding: '0.6rem 1.2rem', borderRadius: '0.8rem', color: 'var(--text-main)', fontSize: '0.7rem', fontWeight: 800, cursor: 'pointer' }}>DETALLES</button>
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </motion.div>
          )}

          {activeTab === 'videos' && (
            <motion.div key="videos" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <div style={{ display: 'flex', gap: '1.2rem', marginBottom: '4rem', overflowX: 'auto', paddingBottom: '1rem' }}>
                {(['ALL', 'WHITE', 'BLUE', 'PURPLE', 'BROWN', 'BLACK'] as const).map(level => (
                  <button
                    key={level}
                    className="glass"
                    onClick={() => setVideoFilter(level)}
                    style={{
                      padding: '1rem 2.5rem',
                      borderRadius: '50px',
                      border: '1px solid var(--glass-border)',
                      background: videoFilter === level ? 'var(--logo-green)' : 'var(--bg-glass)',
                      color: 'var(--text-main)',
                      fontWeight: 900,
                      fontSize: '0.8rem',
                      whiteSpace: 'nowrap'
                    }}
                  >
                    {level === 'ALL' ? 'Todos' : beltLabels[level as Belt]}
                  </button>
                ))}
              </div>

              <div className="grid-layout" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(380px, 1fr))', gap: '3rem' }}>
                {videos.filter(v => videoFilter === 'ALL' || v.beltLevel === videoFilter).map(video => (
                  <motion.div whileHover={{ y: -10 }} key={video.id} className="glass" style={{ padding: 0, overflow: 'hidden', borderRadius: '2.5rem', border: '1px solid var(--glass-border)' }}>
                    <div style={{ height: '220px', position: 'relative' }}>
                      <img src={video.thumbnail} alt={video.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      <div className={`belt-badge belt-${video.beltLevel}`} style={{ position: 'absolute', top: '1.5rem', right: '1.5rem', boxShadow: '0 10px 20px var(--bg-glass)' }}>
                        {beltLabels[video.beltLevel]}
                      </div>
                      <div style={{ position: 'absolute', top: '0', left: '0', width: '100%', height: '100%', background: 'linear-gradient(to bottom, transparent 60%, var(--bg-glass))' }}></div>
                      <div style={{ position: 'absolute', bottom: '1.2rem', left: '1.5rem', color: 'var(--logo-green)', fontWeight: 900, fontSize: '0.8rem', letterSpacing: '0.1em' }}>
                        {video.category.toUpperCase()}
                      </div>
                    </div>
                    <div style={{ padding: '2rem' }}>
                      <h4 style={{ fontSize: '1.4rem', fontWeight: 900, marginBottom: '0.8rem', color: 'var(--text-main)' }}>{video.title}</h4>
                      <p style={{ fontSize: '0.95rem', lineHeight: 1.6, color: 'var(--text-muted)', height: '3rem', overflow: 'hidden' }}>{video.description}</p>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '2.5rem', alignItems: 'center' }}>
                        <button className="btn-primary" style={{ padding: '0.8rem 2rem', fontSize: '0.8rem', background: 'var(--logo-green)' }} onClick={() => window.open(video.url)}>
                          <Play size={16} fill="var(--text-main)" /> VER TÉCNICA
                        </button>
                        <button style={{ background: 'none', border: 'none', fontSize: '0.85rem', cursor: 'pointer', color: 'rgba(255,255,255,0.3)', fontWeight: 700 }} onClick={() => setVideos(videos.filter(v => v.id !== video.id))}>
                          ELIMINAR
                        </button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}

          {activeTab === 'payments' && (
            <motion.div key="payments" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '3.5rem' }}>
                <div className="glass" style={{ padding: '4rem', borderRadius: '3.5rem', border: '2px dashed var(--logo-green)', background: 'rgba(5,168,106,0.03)' }}>
                  <img src="https://logospng.org/download/mercado-pago/logo-mercado-pago-2048.png" style={{ height: '40px', marginBottom: '3rem' }} />
                  <h3 style={{ fontSize: '1.8rem', fontWeight: 900, color: 'var(--text-main)', marginBottom: '1rem' }}>Conciliación Automática</h3>
                  <p style={{ color: 'var(--text-muted)', fontWeight: 600, fontSize: '1.1rem', marginBottom: '4rem' }}>Simula un pago para ver el registro automático:</p>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                    <button className="btn-primary" style={{ height: '80px', borderRadius: '2rem', justifyContent: 'center' }} onClick={() => {
                      const success = handleMercadoPagoPayment({ email: students[0].email, name: students[0].name, amount: 45000 });
                      alert(success ? 'Pago conciliado automáticamente' : 'Error en conciliación');
                    }}>Simular Pago Recibido (Alex Rivera)</button>
                    <button className="btn-secondary" style={{ height: '80px', borderRadius: '2rem', justifyContent: 'center', color: 'var(--text-main)', borderColor: 'var(--glass-border)' }} onClick={() => {
                      const success = handleMercadoPagoPayment({ email: 'desconocido@test.com', name: 'Alguien Nuevo', amount: 55000 });
                      alert(success ? 'Pago conciliado' : 'Pago no identificado: Enviado a revisión');
                    }}>Simular Pago Desconocido</button>
                  </div>
                </div>

                <div className="glass" style={{ borderRadius: '3.5rem', border: '1px solid var(--glass-border)', overflow: 'hidden' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                      <tr style={{ background: 'rgba(5, 168, 106, 0.05)' }}>
                        <th style={{ padding: '2.5rem', textAlign: 'left', fontWeight: 900, color: 'var(--logo-green)' }}>ALUMNO</th>
                        <th style={{ padding: '2.5rem', textAlign: 'left', fontWeight: 900, color: 'var(--logo-green)' }}>CUOTA</th>
                        <th style={{ padding: '2.5rem', textAlign: 'left', fontWeight: 900, color: 'var(--logo-green)' }}>ESTADO</th>
                      </tr>
                    </thead>
                    <tbody>
                      {students.map(s => (
                        <tr key={s.id} style={{ borderBottom: '1px solid var(--glass-border)' }}>
                          <td style={{ padding: '2.5rem', fontWeight: 800, color: 'var(--text-main)' }}>{s.name}</td>
                          <td style={{ padding: '2.5rem', fontWeight: 600, color: 'var(--text-muted)' }}>{formatCLP(s.monthlyFee || 0)}</td>
                          <td style={{ padding: '2.5rem' }}>
                            <span style={{ color: s.isPaid ? 'var(--logo-green)' : '#ef4444', fontWeight: 900 }}>{s.isPaid ? 'COMPLETADO' : 'PENDIENTE'}</span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'settings' && (
            <motion.div key="settings" initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.98 }} className="grid-layout" style={{ gridTemplateColumns: '1fr 1fr', gap: '3rem' }}>
              <section className="glass" style={{ padding: '3.5rem', borderRadius: '3.5rem', border: '1px solid var(--glass-border)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2.5rem' }}>
                  <DollarSign size={24} color="var(--logo-green)" />
                  <h3 style={{ fontSize: '1.8rem', fontWeight: 900 }}>Mensualidades</h3>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
                  <div>
                    <h4 style={{ fontWeight: 900, marginBottom: '1.5rem', color: 'var(--logo-green)', letterSpacing: '0.1em', fontSize: '0.85rem' }}>NIÑOS (Sub 18)</h4>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                      {Object.keys(fees.kids).map(planKey => (
                        <div key={`kids-${planKey}`} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <div style={{ fontWeight: 800, fontSize: '0.9rem' }}>{planLabels[planKey] || planKey}</div>
                          <div className="glass" style={{ padding: '0.5rem 1rem', borderRadius: '1rem', border: '1px solid var(--glass-border)', display: 'flex', alignItems: 'center' }}>
                            <span style={{ fontWeight: 900, marginRight: '0.5rem', color: 'var(--logo-green)' }}>$</span>
                            <input
                              type="number" step="1000"
                              value={fees.kids[planKey]}
                              onChange={e => setFees({ ...fees, kids: { ...fees.kids, [planKey]: parseInt(e.target.value) || 0 } })}
                              style={{ background: 'none', border: 'none', outline: 'none', color: 'var(--text-main)', fontWeight: 900, width: '80px', fontSize: '1rem' }}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div>
                    <h4 style={{ fontWeight: 900, marginBottom: '1.5rem', color: 'var(--logo-green)', letterSpacing: '0.1em', fontSize: '0.85rem' }}>ADULTOS</h4>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                      {Object.keys(fees.adults).map(planKey => (
                        <div key={`adults-${planKey}`} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <div style={{ fontWeight: 800, fontSize: '0.9rem' }}>{planLabels[planKey] || planKey}</div>
                          <div className="glass" style={{ padding: '0.5rem 1rem', borderRadius: '1rem', border: '1px solid var(--glass-border)', display: 'flex', alignItems: 'center' }}>
                            <span style={{ fontWeight: 900, marginRight: '0.5rem', color: 'var(--logo-green)' }}>$</span>
                            <input
                              type="number" step="1000"
                              value={fees.adults[planKey]}
                              onChange={e => setFees({ ...fees, adults: { ...fees.adults, [planKey]: parseInt(e.target.value) || 0 } })}
                              style={{ background: 'none', border: 'none', outline: 'none', color: 'var(--text-main)', fontWeight: 900, width: '80px', fontSize: '1rem' }}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </section>

              <section className="glass" style={{ padding: '3.5rem', borderRadius: '3.5rem', border: '1px solid var(--glass-border)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2.5rem' }}>
                  <Bell size={24} color="var(--logo-green)" />
                  <h3 style={{ fontSize: '1.8rem', fontWeight: 900 }}>Comunicación</h3>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '2.5rem' }}>
                  <div>
                    <label style={{ display: 'block', marginBottom: '1rem', fontWeight: 800, fontSize: '0.8rem', color: 'var(--text-muted)' }}>DÍA DE COBRO (MENSUAL)</label>
                    <input type="range" min="1" max="28" value={automation.reminderDay} onChange={e => setAutomation({ ...automation, reminderDay: parseInt(e.target.value) })} style={{ width: '100%', accentColor: 'var(--logo-green)' }} />
                    <p style={{ marginTop: '1rem', fontSize: '1.2rem', fontWeight: 900 }}>Hoy es el día {automation.reminderDay}</p>
                  </div>
                  <button className="btn-primary" style={{ width: '100%', justifyContent: 'center', padding: '1.5rem', borderRadius: '2rem' }} onClick={() => setIsSendingNotice(true)}>ENVIAR COMUNICADO MASIVO</button>
                  <button className="btn-secondary" style={{ width: '100%', justifyContent: 'center', padding: '1.5rem', borderRadius: '2rem', borderColor: 'var(--logo-green)', color: 'var(--logo-green)' }} onClick={handleGeneratePasswordsForAll}>GENERAR CLAVES A ALUMNOS ANTIGUOS</button>
                </div>
              </section>
            </motion.div>
          )}
        </AnimatePresence>
      </main >

      {/* Admin Modals */}
      <AnimatePresence>
        {
          showQRModal && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.85)', zIndex: 1100, display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(30px)' }} onClick={() => setShowQRModal(false)}>
              <motion.div initial={{ scale: 0.8 }} animate={{ scale: 1 }} className="glass" style={{ padding: '5rem', borderRadius: '4rem', textAlign: 'center', background: 'white', border: '1px solid var(--glass-border)' }} onClick={e => e.stopPropagation()}>
                <h2 style={{ color: '#111', fontSize: '2.5rem', fontWeight: 900, marginBottom: '2rem' }}>Acceso Tatami</h2>
                <QRCode value="CLASS_CHECKIN_2024" size={400} />
                <button className="btn-primary" style={{ marginTop: '3rem', width: '100%' }} onClick={() => setShowQRModal(false)}>CERRAR</button>
              </motion.div>
            </motion.div>
          )
        }

        {
          isAddingStudent && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.6)', zIndex: 1100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem', backdropFilter: 'blur(10px)' }}>
              <motion.div style={{ width: '100%', maxWidth: '450px', padding: '3.5rem', borderRadius: '3rem', background: '#fff', color: '#111', border: '1px solid rgba(0,0,0,0.1)', boxShadow: '0 40px 100px -20px rgba(0,0,0,0.2)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2.5rem' }}>
                  <h2 style={{ fontSize: '2.2rem', fontWeight: 900, letterSpacing: '-1px', color: '#111' }}>Nuevo <span style={{ color: 'var(--logo-green)' }}>Alumno</span></h2>
                  <button onClick={() => setIsAddingStudent(false)} style={{ background: 'var(--panel-surface)', border: '1px solid var(--panel-border)', color: '#111', width: '40px', height: '40px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}><X size={18} /></button>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  <input style={{ padding: '1.2rem', borderRadius: '1rem', border: '1px solid var(--panel-border)', background: '#f8fafc', color: '#111', fontWeight: 700, fontSize: '1rem', outline: 'none' }} placeholder="Nombre completo" value={newStudentData.name} onChange={e => setNewStudentData({ ...newStudentData, name: e.target.value })} />
                  <input style={{ padding: '1.2rem', borderRadius: '1rem', border: '1px solid var(--panel-border)', background: '#f8fafc', color: '#111', fontWeight: 700, fontSize: '1rem', outline: 'none' }} placeholder="Correo electrónico" value={newStudentData.email} onChange={e => setNewStudentData({ ...newStudentData, email: e.target.value })} />
                  <input style={{ padding: '1.2rem', borderRadius: '1rem', border: '1px solid var(--panel-border)', background: '#f8fafc', color: '#111', fontWeight: 700, fontSize: '1rem', outline: 'none' }} placeholder="Teléfono" value={newStudentData.phone} onChange={e => setNewStudentData({ ...newStudentData, phone: e.target.value })} />

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', marginTop: '0.5rem' }}>
                    <label style={{ fontSize: '0.8rem', fontWeight: 900, color: 'var(--panel-muted)' }}>DÍAS POR SEMANA (PLAN)</label>
                    <select style={{ padding: '1.2rem', borderRadius: '1rem', border: '1px solid var(--panel-border)', background: '#fff', color: '#111', fontWeight: 900, fontSize: '1rem', outline: 'none', cursor: 'pointer' }} value={newStudentData.plan} onChange={e => {
                      const val = e.target.value;
                      const autoFee = fees.adults[val] || 0;
                      setNewStudentData({ ...newStudentData, plan: val, monthlyFee: autoFee });
                    }}>
                      {Object.keys(planLabels).map(p => <option key={p} value={p}>{planLabels[p]}</option>)}
                    </select>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1.2rem 0', borderTop: '2px dashed var(--panel-border)', marginTop: '0.5rem' }}>
                    <span style={{ fontWeight: 800, color: '#111', fontSize: '0.9rem' }}>Mensualidad Auto:</span>
                    <span style={{ fontWeight: 900, color: 'var(--logo-green)', fontSize: '1.6rem', letterSpacing: '-1px' }}>{formatCLP(newStudentData.monthlyFee)}</span>
                  </div>
                  <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} style={{ marginTop: '0.5rem', width: '100%', padding: '1.4rem', background: 'var(--logo-green)', color: '#fff', fontSize: '0.9rem', letterSpacing: '0.1em', textTransform: 'uppercase', fontWeight: 900, borderRadius: '1.2rem', border: 'none', cursor: 'pointer', boxShadow: '0 15px 30px rgba(5,168,106,0.3)' }} onClick={handleAddStudent}>REGISTRAR EN EL DOJO</motion.button>
                </div>
              </motion.div>
            </motion.div>
          )
        }

        {
          isSendingNotice && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.6)', zIndex: 1100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem', backdropFilter: 'blur(10px)' }}>
              <motion.div className="glass" style={{ width: '100%', maxWidth: '600px', padding: '4rem', borderRadius: '3rem', border: '1px solid var(--glass-border)' }}>
                <h2 style={{ marginBottom: '2rem' }}>Comunicado Masivo</h2>
                <input className="glass" style={{ width: '100%', padding: '1.2rem', marginBottom: '1.5rem' }} value={noticeData.subject} onChange={e => setNoticeData({ ...noticeData, subject: e.target.value })} />
                <textarea className="glass" style={{ width: '100%', height: '200px', padding: '1.5rem', resize: 'none' }} value={noticeData.message} onChange={e => setNoticeData({ ...noticeData, message: e.target.value })} />
                <div style={{ display: 'flex', gap: '1rem', marginTop: '2rem' }}>
                  <button onClick={() => setIsSendingNotice(false)} style={{ flex: 1, background: 'none', border: '1px solid var(--glass-border)', padding: '1.2rem', borderRadius: '1rem', color: 'var(--text-main)' }}>CANCELAR</button>
                  <button className="btn-primary" style={{ flex: 2 }} onClick={handleSendMassNotice}>ENVIAR A TODOS</button>
                </div>
              </motion.div>
            </motion.div>
          )
        }

        {
          selectedStudent && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(15,23,42,0.15)', zIndex: 1100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem', backdropFilter: 'blur(12px)' }}
              onClick={() => setSelectedStudent(null)}>
              <motion.div style={{ width: '100%', maxWidth: '750px', maxHeight: '90vh', overflowY: 'auto', padding: '2.5rem', borderRadius: '3rem', background: '#fff', border: '1px solid var(--panel-border)', boxShadow: '0 40px 100px -20px rgba(0,0,0,0.15)', position: 'relative' }}
                onClick={e => e.stopPropagation()}>
                {/* Decorative Background Element */}
                <div style={{ position: 'absolute', top: '-10%', right: '-10%', width: '300px', height: '300px', background: 'var(--logo-green-soft)', borderRadius: '50%', filter: 'blur(60px)', zIndex: 0 }} />

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', position: 'relative', zIndex: 1, flexWrap: 'wrap', gap: '1.5rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', flex: 1, minWidth: '300px' }}>
                    <div style={{ position: 'relative' }}>
                      <div style={{ width: '100px', height: '100px', borderRadius: '2.5rem', overflow: 'hidden', background: 'var(--panel-surface)', border: '2px solid var(--panel-border)', boxShadow: '0 20px 40px rgba(0,0,0,0.05)' }}>
                        <img
                          src={selectedStudent.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${selectedStudent.name}`}
                          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                        />
                      </div>
                      <label style={{ position: 'absolute', bottom: '-10px', right: '-10px', background: 'var(--logo-green)', color: '#fff', width: '40px', height: '40px', borderRadius: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', boxShadow: '0 10px 20px rgba(5,168,106,0.3)', border: '3px solid #fff' }}>
                        <Camera size={18} />
                        <input type="file" accept="image/*" style={{ display: 'none' }} onChange={e => handleAvatarUpload(e, selectedStudent)} />
                      </label>
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: '0.65rem', fontWeight: 800, color: 'var(--logo-green)', letterSpacing: '0.3em', textTransform: 'uppercase', marginBottom: '0.8rem' }}>{isEditingStudent ? 'Editando Perfil' : 'Ficha del Alumno'}</div>
                      {isEditingStudent ? (
                        <input
                          style={{ fontSize: '2.5rem', fontWeight: 900, color: 'var(--panel-text)', letterSpacing: '-2px', border: 'none', borderBottom: '2px solid var(--logo-green)', outline: 'none', width: '100%', background: 'transparent', textTransform: 'capitalize' }}
                          value={editedStudent?.name || ''}
                          onChange={e => setEditedStudent(prev => prev ? { ...prev, name: e.target.value } : null)}
                        />
                      ) : (
                        <h1 style={{ fontSize: '3rem', fontWeight: 900, color: 'var(--panel-text)', letterSpacing: '-2px', textTransform: 'capitalize', lineHeight: 1.1 }}>{selectedStudent.name}</h1>
                      )}
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: '1rem' }}>
                    {!isEditingStudent ? (
                      <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                        style={{ background: 'var(--panel-surface)', border: '1px solid var(--panel-border)', borderRadius: '1rem', padding: '0.8rem 1.5rem', display: 'flex', alignItems: 'center', gap: '0.6rem', cursor: 'pointer', color: 'var(--panel-text)', fontWeight: 800, fontSize: '0.8rem' }}
                        onClick={() => {
                          setEditedStudent({ ...selectedStudent });
                          setIsEditingStudent(true);
                        }}>
                        <Edit2 size={16} /> EDITAR
                      </motion.button>
                    ) : (
                      <div style={{ display: 'flex', gap: '0.8rem' }}>
                        <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                          style={{ background: 'var(--panel-surface)', border: '1px solid var(--panel-border)', borderRadius: '1rem', padding: '0.8rem 1.5rem', cursor: 'pointer', color: 'var(--panel-muted)', fontWeight: 800, fontSize: '0.8rem' }}
                          onClick={() => setIsEditingStudent(false)}>
                          CANCELAR
                        </motion.button>
                        <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                          style={{ background: 'var(--logo-green)', border: 'none', borderRadius: '1rem', padding: '0.8rem 1.5rem', cursor: 'pointer', color: '#fff', fontWeight: 800, fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '0.6rem' }}
                          onClick={() => editedStudent && handleUpdateStudent(editedStudent)}>
                          <Save size={16} /> GUARDAR
                        </motion.button>
                      </div>
                    )}
                    <motion.button whileHover={{ rotate: 90, scale: 1.1 }} whileTap={{ scale: 0.9 }}
                      style={{ background: 'var(--panel-surface)', border: '1px solid var(--panel-border)', borderRadius: '50%', width: '50px', height: '50px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: 'var(--panel-muted)' }}
                      onClick={() => { setSelectedStudent(null); setIsEditingStudent(false); }}>
                      <X size={24} />
                    </motion.button>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem', position: 'relative', zIndex: 1 }}>
                  <div style={{ padding: '1.2rem', borderRadius: '1.5rem', background: 'var(--panel-surface)', border: '1px solid var(--panel-border)', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
                    <p style={{ color: 'var(--logo-green)', fontSize: '0.6rem', fontWeight: 900, marginBottom: '0.8rem', letterSpacing: '0.15em' }}>CONTACTO PERSONAL</p>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem', width: '100%', alignItems: 'center' }}>
                      {isEditingStudent ? (
                        <>
                          <input style={{ background: '#fff', border: '1px solid var(--panel-border)', borderRadius: '0.5rem', padding: '0.5rem', fontWeight: 700, fontSize: '0.9rem', width: '100%', textAlign: 'center' }} value={editedStudent?.email || ''} onChange={e => setEditedStudent(prev => prev ? { ...prev, email: e.target.value } : null)} placeholder="Email" />
                          <input style={{ background: '#fff', border: '1px solid var(--panel-border)', borderRadius: '0.5rem', padding: '0.5rem', fontWeight: 700, fontSize: '0.9rem', width: '100%', textAlign: 'center' }} value={editedStudent?.phone || ''} onChange={e => setEditedStudent(prev => prev ? { ...prev, phone: e.target.value } : null)} placeholder="Teléfono" />
                          <input type="date" style={{ background: '#fff', border: '1px solid var(--panel-border)', borderRadius: '0.5rem', padding: '0.5rem', fontWeight: 700, fontSize: '0.9rem', width: '100%', textAlign: 'center' }} value={editedStudent?.birthDate || ''} title="Fecha Nacimiento" onChange={e => setEditedStudent(prev => prev ? { ...prev, birthDate: e.target.value } : null)} />
                        </>
                      ) : (
                        <>
                          <p style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--panel-muted)', wordBreak: 'break-all' }}>{selectedStudent.email}</p>
                          <p style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--panel-muted)' }}>{selectedStudent.phone}</p>
                          <p style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--panel-muted)' }}>{selectedStudent.birthDate ? `${selectedStudent.birthDate} (${calculateAge(selectedStudent.birthDate)} años)` : 'No registrada'}</p>
                        </>
                      )}
                    </div>
                  </div>
                  <div style={{ padding: '1.2rem', borderRadius: '1.5rem', background: 'var(--panel-surface)', border: '1px solid var(--panel-border)', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
                    <p style={{ color: 'var(--logo-green)', fontSize: '0.6rem', fontWeight: 900, marginBottom: '0.8rem', letterSpacing: '0.15em' }}>TUTOR</p>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem', width: '100%', alignItems: 'center' }}>
                      {isEditingStudent ? (
                        <>
                          <input style={{ background: '#fff', border: '1px solid var(--panel-border)', borderRadius: '0.5rem', padding: '0.5rem', fontWeight: 700, fontSize: '0.9rem', width: '100%', textAlign: 'center' }} value={editedStudent?.tutorName || ''} onChange={e => setEditedStudent(prev => prev ? { ...prev, tutorName: e.target.value } : null)} placeholder="Nombre y Apellido" />
                          <input style={{ background: '#fff', border: '1px solid var(--panel-border)', borderRadius: '0.5rem', padding: '0.5rem', fontWeight: 700, fontSize: '0.9rem', width: '100%', textAlign: 'center' }} value={editedStudent?.tutorEmail || ''} onChange={e => setEditedStudent(prev => prev ? { ...prev, tutorEmail: e.target.value } : null)} placeholder="Correo Tutor" />
                          <input style={{ background: '#fff', border: '1px solid var(--panel-border)', borderRadius: '0.5rem', padding: '0.5rem', fontWeight: 700, fontSize: '0.9rem', width: '100%', textAlign: 'center' }} value={editedStudent?.tutorPhone || ''} onChange={e => setEditedStudent(prev => prev ? { ...prev, tutorPhone: e.target.value } : null)} placeholder="Teléfono Tutor" />
                        </>
                      ) : (
                        <>
                          <p style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--panel-muted)' }}>{selectedStudent.tutorName || 'Sin tutor'}</p>
                          <p style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--panel-muted)', wordBreak: 'break-all' }}>{selectedStudent.tutorEmail || 'Sin email'}</p>
                          <p style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--panel-muted)' }}>{selectedStudent.tutorPhone || 'Sin teléfono'}</p>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem', position: 'relative', zIndex: 1 }}>
                  <div style={{ padding: '1.2rem', borderRadius: '1.5rem', background: selectedStudent.isPaid ? 'var(--panel-green-bg)' : 'var(--panel-red-bg)', border: `1px solid ${selectedStudent.isPaid ? 'var(--panel-green-border)' : 'var(--panel-red-border)'}`, display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', justifyContent: 'center' }}>
                    <p style={{ color: selectedStudent.isPaid ? 'var(--logo-green)' : '#ef4444', fontSize: '0.6rem', fontWeight: 900, marginBottom: '0.8rem', letterSpacing: '0.15em' }}>ESTADO COMERCIAL</p>
                    {isEditingStudent ? (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem', width: '100%', alignItems: 'center' }}>
                        <select
                          style={{ background: '#fff', border: '1px solid var(--panel-border)', borderRadius: '0.5rem', padding: '0.5rem', fontWeight: 900, fontSize: '1rem', color: editedStudent?.isPaid ? 'var(--logo-green)' : '#ef4444', width: '100%', textAlign: 'center' }}
                          value={editedStudent?.isPaid ? 'true' : 'false'}
                          onChange={e => setEditedStudent(prev => prev ? { ...prev, isPaid: e.target.value === 'true' } : null)}
                        >
                          <option value="true">✅ AL DÍA</option>
                          <option value="false">⚠️ PENDIENTE</option>
                        </select>
                        <input style={{ background: '#fff', border: '1px solid var(--panel-border)', borderRadius: '0.5rem', padding: '0.5rem', fontWeight: 700, fontSize: '0.75rem', width: '100%', textAlign: 'center' }} value={editedStudent?.lastPaymentDate || ''} onChange={e => setEditedStudent(prev => prev ? { ...prev, lastPaymentDate: e.target.value } : null)} placeholder="Último Pago" />
                      </div>
                    ) : (
                      <>
                        <p style={{ fontWeight: 900, fontSize: '1.2rem', color: selectedStudent.isPaid ? 'var(--logo-green)' : '#ef4444', marginBottom: '0.4rem' }}>{selectedStudent.isPaid ? '✅ AL DÍA' : '⚠️ PENDIENTE'}</p>
                        <p style={{ fontWeight: 700, fontSize: '0.75rem', color: selectedStudent.isPaid ? 'var(--logo-green)' : '#ef4444', opacity: 0.7 }}>Último pago: {selectedStudent.lastPaymentDate || 'N/A'}</p>
                      </>
                    )}
                  </div>
                  <div style={{ padding: '1.2rem', borderRadius: '1.5rem', background: 'var(--panel-surface)', border: '1px solid var(--panel-border)', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', justifyContent: 'center' }}>
                    <p style={{ color: 'var(--logo-green)', fontSize: '0.6rem', fontWeight: 900, marginBottom: '0.8rem', letterSpacing: '0.15em' }}>CINTURÓN</p>
                    <div style={{ display: 'flex', alignItems: 'center' }}>
                      {isEditingStudent ? (
                        <select
                          className={`belt-badge belt-${editedStudent?.belt || 'WHITE'}`}
                          style={{ padding: '0.6rem 1.8rem', fontSize: '0.8rem', background: '#fff', textAlign: 'center' }}
                          value={editedStudent?.belt}
                          onChange={e => setEditedStudent(prev => prev ? { ...prev, belt: e.target.value as Belt } : null)}
                        >
                          {Object.keys(beltLabels).map(b => <option key={b} value={b}>{beltLabels[b as Belt]}</option>)}
                        </select>
                      ) : (
                        <div className={`belt-badge belt-${selectedStudent.belt}`} style={{ padding: '0.6rem 1.8rem', fontSize: '0.8rem' }}>{beltLabels[selectedStudent.belt]}</div>
                      )}
                    </div>
                  </div>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem', position: 'relative', zIndex: 1 }}>
                  <div style={{ padding: '1.2rem', borderRadius: '1.5rem', background: 'var(--panel-surface)', border: '1px solid var(--panel-border)', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', justifyContent: 'center' }}>
                    <p style={{ color: 'var(--logo-green)', fontSize: '0.6rem', fontWeight: 900, marginBottom: '0.8rem', letterSpacing: '0.15em' }}>PLAN ACTUAL</p>
                    {isEditingStudent ? (
                      <select style={{ width: '100%', background: '#fff', border: '1px solid var(--panel-border)', borderRadius: '0.5rem', padding: '0.5rem', fontWeight: 900, fontSize: '1rem', textAlign: 'center' }}
                        value={editedStudent?.plan || '3'}
                        onChange={e => {
                          const val = e.target.value;
                          const age = calculateAge(editedStudent?.birthDate) as any;
                          const category = (age !== 'N/A' && age < 18) ? 'kids' : 'adults';
                          const autoFee = fees[category][val] || 0;
                          setEditedStudent(prev => prev ? { ...prev, plan: val, monthlyFee: autoFee } : null);
                        }}>
                        <option value="1">{planLabels['1']}</option>
                        <option value="2">{planLabels['2']}</option>
                        <option value="3">{planLabels['3']}</option>
                        <option value="4">{planLabels['4']}</option>
                        <option value="Ilimitado">{planLabels['Ilimitado']}</option>
                      </select>
                    ) : (
                      <p style={{ fontWeight: 900, fontSize: '1.1rem', color: 'var(--panel-text)' }}>{selectedStudent.plan ? (planLabels[selectedStudent.plan.toString()] || selectedStudent.plan) : 'No asignado'}</p>
                    )}
                  </div>
                  <div style={{ padding: '1.2rem', borderRadius: '1.5rem', background: 'var(--panel-surface)', border: '1px solid var(--panel-border)', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', justifyContent: 'center' }}>
                    <p style={{ color: 'var(--logo-green)', fontSize: '0.6rem', fontWeight: 900, marginBottom: '0.8rem', letterSpacing: '0.15em' }}>MENSUALIDAD</p>
                    {isEditingStudent ? (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', justifyContent: 'center' }}>
                        <span style={{ fontWeight: 900, color: 'var(--logo-green)' }}>$</span>
                        <input type="number" style={{ width: '100px', background: '#fff', border: '1px solid var(--panel-border)', borderRadius: '0.5rem', padding: '0.5rem', fontWeight: 900, fontSize: '1.4rem', textAlign: 'center' }} value={editedStudent?.monthlyFee || 0} onChange={e => setEditedStudent(prev => prev ? { ...prev, monthlyFee: parseInt(e.target.value) } : null)} />
                      </div>
                    ) : (
                      <p style={{ fontWeight: 900, fontSize: '1.4rem', color: 'var(--logo-green)' }}>{formatCLP(selectedStudent.monthlyFee || 0)}</p>
                    )}
                  </div>
                </div>

                <div style={{ marginBottom: '1.5rem', position: 'relative', zIndex: 1 }}>
                  <p style={{ color: 'var(--logo-green)', fontSize: '0.6rem', fontWeight: 900, marginBottom: '0.8rem', letterSpacing: '0.15em' }}>HISTORIAL DE PAGOS</p>
                  <div style={{ background: 'var(--panel-surface)', border: '1px solid var(--panel-border)', borderRadius: '1.5rem', overflow: 'hidden' }}>
                    {selectedStudent.history && selectedStudent.history.length > 0 ? (
                      <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                        <thead>
                          <tr style={{ background: 'rgba(5,168,106,0.05)', borderBottom: '1px solid var(--panel-border)' }}>
                            <th style={{ padding: '0.5rem 1rem', fontSize: '0.7rem', fontWeight: 800, color: 'var(--panel-muted)' }}>FECHA</th>
                            <th style={{ padding: '0.5rem 1rem', fontSize: '0.7rem', fontWeight: 800, color: 'var(--panel-muted)' }}>MONTO</th>
                            <th style={{ padding: '0.5rem 1rem', fontSize: '0.7rem', fontWeight: 800, color: 'var(--panel-muted)' }}>ESTADO</th>
                          </tr>
                        </thead>
                        <tbody>
                          {selectedStudent.history.map((record, idx) => (
                            <tr key={idx} style={{ borderBottom: idx === selectedStudent.history.length - 1 ? 'none' : '1px solid var(--panel-border)' }}>
                              <td style={{ padding: '1rem 1.5rem', fontSize: '0.9rem', fontWeight: 600 }}>{record.date}</td>
                              <td style={{ padding: '1rem 1.5rem', fontSize: '0.9rem', fontWeight: 800, color: 'var(--panel-text)' }}>{formatCLP(record.amount)}</td>
                              <td style={{ padding: '1rem 1.5rem' }}>
                                <span style={{ display: 'inline-block', padding: '0.3rem 0.8rem', borderRadius: '100px', fontSize: '0.7rem', fontWeight: 800, background: record.status === 'Completado' ? 'rgba(37,211,102,0.1)' : 'rgba(239,68,68,0.1)', color: record.status === 'Completado' ? '#25D366' : '#ef4444' }}>
                                  {record.status}
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    ) : (
                      <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--panel-muted)', fontSize: '0.85rem', fontWeight: 600 }}>
                        No hay pagos registrados aún en el sistema. Al sincronizar con Mercado Pago aparecerán aquí.
                      </div>
                    )}
                  </div>
                </div>

                {!selectedStudent.isPaid && (
                  <div style={{ display: 'flex', gap: '1rem', position: 'relative', zIndex: 1 }}>
                    <motion.button whileHover={{ y: -4, boxShadow: '0 15px 30px rgba(0,157,255,0.2)' }} whileTap={{ scale: 0.98 }}
                      style={{ flex: 1, background: '#009EE3', color: '#fff', border: 'none', padding: '1.2rem', borderRadius: '1rem', fontWeight: 900, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.8rem' }}
                      onClick={() => handleCreatePaymentLink(selectedStudent)}>
                      <CreditCard size={18} /> PAGAR CON MERCADO PAGO
                    </motion.button>
                    <motion.button whileHover={{ y: -4, boxShadow: '0 15px 30px rgba(37, 211, 102, 0.2)' }} whileTap={{ scale: 0.98 }}
                      style={{ flex: 1, background: '#25D366', color: '#fff', border: 'none', padding: '1.2rem', borderRadius: '1rem', fontWeight: 900, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.8rem' }}
                      onClick={() => window.open(`https://wa.me/${selectedStudent.phone.replace(/\D/g, '')}?text=Hola ${selectedStudent.name}...`)}>
                      CONTACTAR POR WHATSAPP
                    </motion.button>
                    <motion.button whileHover={{ y: -4, boxShadow: '0 15px 30px rgba(0,0,0,0.1)' }} whileTap={{ scale: 0.98 }}
                      style={{ flex: 1, background: 'var(--panel-text)', color: '#fff', border: 'none', padding: '1.2rem', borderRadius: '1rem', fontWeight: 900, cursor: 'pointer' }}>
                      ENVIAR RECORDATORIO EMAIL
                    </motion.button>
                  </div>
                )}
              </motion.div>
            </motion.div>
          )
        }

        {
          isAddingVideo && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(15,23,42,0.15)', zIndex: 1100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem', backdropFilter: 'blur(12px)' }}>
              <motion.div style={{ width: '100%', maxWidth: '700px', padding: '4rem', borderRadius: '3rem', background: '#fff', border: '1px solid var(--panel-border)', boxShadow: '0 40px 100px -20px rgba(0,0,0,0.1)' }}>
                <h2 style={{ marginBottom: '3rem', color: 'var(--panel-text)' }}>Nuevo Contenido Técnico</h2>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
                  <div style={{ gridColumn: 'span 2' }}>
                    <input className="glass" style={{ width: '100%', padding: '1.2rem' }} placeholder="Título" value={newVideoData.title} onChange={e => setNewVideoData({ ...newVideoData, title: e.target.value })} />
                  </div>
                  <div style={{ gridColumn: 'span 2' }}>
                    <input className="glass" style={{ width: '100%', padding: '1.2rem' }} placeholder="URL Video" value={newVideoData.url} onChange={e => setNewVideoData({ ...newVideoData, url: e.target.value })} />
                  </div>
                  <select className="glass" style={{ padding: '1.2rem' }} value={newVideoData.beltLevel} onChange={e => setNewVideoData({ ...newVideoData, beltLevel: e.target.value as Belt })}>
                    {Object.keys(beltLabels).map(b => <option key={b} value={b}>{beltLabels[b as Belt]}</option>)}
                  </select>
                  <select className="glass" style={{ padding: '1.2rem' }} value={newVideoData.category} onChange={e => setNewVideoData({ ...newVideoData, category: e.target.value as any })}>
                    <option value="Tecnica">Técnica</option>
                    <option value="Sparring">Sparring</option>
                    <option value="Teoria">Teoría</option>
                  </select>
                  <button className="btn-primary" style={{ gridColumn: 'span 2', marginTop: '2rem' }} onClick={handleAddVideo}>PUBLICAR TÉCNICA</button>
                </div>
              </motion.div>
            </motion.div>
          )
        }
      </AnimatePresence >
    </div >
  );
};

export default App;
