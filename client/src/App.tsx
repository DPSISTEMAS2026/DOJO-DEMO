// Version: 1.0.1 - Automatic Sync Implemented
import React, { useState, useEffect, useRef } from 'react';
import {
  Users,
  CreditCard,
  QrCode,
  TrendingUp,
  Search,
  Plus,
  Settings,
  LogOut,
  Award,
  Play,
  Instagram,
  Facebook,
  X, Menu,
  Bell,
  Calendar,
  DollarSign,
  Volume2,
  VolumeX,
  Mail,
  Lock,
  Folder,
  ChevronRight,
  ChevronLeft,
  Edit2,
  Save,
  Camera,
  ImageIcon,
  Monitor,
  Trash2,
  Phone
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import QRCode from 'react-qr-code';

// Leaf, Mail, Smartphone, LogIn, Menu removed (not used in current design)
const SocialVideoPlayer: React.FC<{ 
  src: string, 
  showSlider?: boolean, 
  size?: 'sm' | 'lg', 
  isActive?: boolean, 
  onEnded?: () => void 
}> = ({ src, showSlider = true, size = 'sm', isActive = true, onEnded }) => {
  const [localMute, setLocalMute] = useState(true);
  const [localVolume, setLocalVolume] = useState(0.2);
  const videoRef = React.useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (videoRef.current) videoRef.current.volume = localVolume;
  }, [localVolume]);

  useEffect(() => {
    if (videoRef.current) {
      if (isActive) {
        videoRef.current.play().catch(err => console.log("Video play interrupted", err));
      } else {
        videoRef.current.pause();
      }
    }
  }, [isActive]);

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%' }}>
      <video
        ref={videoRef}
        autoPlay={isActive}
        muted={localMute}
        onEnded={onEnded}
        playsInline
        style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: isActive ? 1 : 0.6, transition: 'opacity 0.5s' }}
      >
        <source src={src} type="video/mp4" />
      </video>
      <div style={{ position: 'absolute', bottom: size === 'lg' ? '20px' : '1rem', right: size === 'lg' ? '20px' : '1rem', display: 'flex', alignItems: 'center', gap: '8px', background: 'rgba(0,0,0,0.6)', padding: size === 'lg' ? '8px 15px' : '5px 10px', borderRadius: '30px', backdropFilter: 'blur(10px)', zIndex: 10, border: '1px solid var(--glass-border)', opacity: isActive ? 1 : 0 }}>
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

const API_URL = import.meta.env.VITE_API_URL || (window.location.hostname.includes('localhost') ? 'http://localhost:3002' : 'https://dojoranas.onrender.com');

const newsItems = [
  {
    title: "Frog Challenge Kids eleva el nivel y pone al sur en el mapa del Jiu Jitsu infantil",
    body: "Más de 80 niños y adolescentes dieron vida a la tercera edición del torneo organizado por Ranas Jiu Jitsu, que reunió a equipos de distintas regiones en el gimnasio municipal de la capital penquista.",
    img: "/assets/news_frog_challenge_v2.jpg",
    link: "https://www.diarioconcepcion.cl/deportes/2025/07/15/frog-challenge-kids-eleva-el-nivel-y-pone-al-sur-en-el-mapa-del-jiu-jitsu-infantil.html",
    label: "Noticias del Dojo",
    date: "15 Jul, 2025",
    stats: [
      { label: 'Evento', text: 'Frog Challenge 3' },
      { label: 'Participantes', text: '80+ Atletas' },
      { label: 'Sede', text: 'Gimnasio Municipal' },
      { label: 'Organiza', text: 'Ranas Jiu Jitsu' }
    ]
  },
  {
    title: "Manuel Plaza: penquista suma medallas en tatamis estadounidenses",
    body: "El profesor Manuel Plaza conquistó cuatro medallas, dos de ellas de oro, en el Oklahoma City International Open. El deportista se formó al alero del destacado instructor Reinaldo Duguet.",
    img: "/assets/news_manuel_medals_v2.jpeg",
    link: "https://www.diarioconcepcion.cl/deportes/2023/02/16/manuel-plaza-penquista-suma-medallas-en-tatamis-estadounidenses.html",
    label: "Logro Internacional",
    date: "16 Feb, 2023",
    stats: [
      { label: 'Torneo', text: 'Oklahoma City Open' },
      { label: 'Medallas', text: '2 Oros, 2 Platas' },
      { label: 'Ranking', text: '#155 Mundial' },
      { label: 'Categoría', text: 'Master 1 Súper Pesado' }
    ]
  },
  {
    title: "Canal 9 Biobío: BJJ como Herramienta de Formación Integral",
    body: "En entrevista con Canal 9, Manuel Plaza destacó el impacto del Brazilian Jiu Jitsu en menores de 5 a 17 años, fomentando el autocontrol y la disciplina como bases del desarrollo personal.",
    img: "https://images.unsplash.com/photo-1552072047-54d19335391c?w=800",
    link: "https://www.canal9.cl/episodios/nuestra-casa/2025/07/09/llega-la-tercera-version-del-frog-challenge-kids-torneo-de-jiu-jitsu-juvenil-se-toma-concepcion",
    label: "Entrevista Canal 9",
    date: "09 Jul, 2025",
    stats: [
      { label: 'Cobertura', text: 'Canal 9 Biobío' },
      { label: 'Programa', text: 'Nuestra Casa' },
      { label: 'Enfoque', text: 'Formación Integral' },
      { label: 'Edades', text: '5 a 17 años' }
    ]
  }
];

const App: React.FC = () => {
  const [viewMode, setViewMode] = useState<ViewMode>(() => localStorage.getItem('viewMode') as ViewMode || 'landing');
  const [noticeData, setNoticeData] = useState({ 
    subject: '', 
    message: ''
  });
  const [role, setRole] = useState<UserRole>(() => localStorage.getItem('role') as UserRole || 'guest');
  const [currentUser, setCurrentUser] = useState<Student | null>(() => {
    const u = localStorage.getItem('currentUser');
    return u ? JSON.parse(u) : null;
  });

  // --- UTILITIES ---
  const getWeekStart = (date: Date) => {
    const d = new Date(date);
    const day = d.getDay() || 7;
    d.setHours(0, 0, 0, 0);
    d.setDate(d.getDate() - day + 1);
    return d.getTime();
  };


  const handleBookClass = (timestamp: number) => {
    const isBooked = (currentUser?.scheduledClasses || []).some(c => c.timestamp === timestamp);
    let newScheduled = [];
    if (isBooked) {
      newScheduled = (currentUser?.scheduledClasses || []).filter(c => c.timestamp !== timestamp);
    } else {
      const planLimits: Record<string, number> = { '1': 1, '2': 2, '3': 3, '4': 4, 'Ilimitado': 99 };
      let planMax = 2;
      const planVal = currentUser?.plan ? currentUser.plan[0] : '2';
      if (currentUser?.plan?.toLowerCase().includes('ilimitado')) planMax = 99;
      else planMax = planLimits[planVal] || 2;

      const currentWeekStart = getWeekStart(new Date());
      const thisWeekCount = (currentUser?.scheduledClasses || []).filter(c => c.timestamp >= currentWeekStart).length;

      if (thisWeekCount >= planMax) {
        alert(`Has alcanzado el límite de tu plan (${planMax} clases por semana).`);
        return;
      }
      newScheduled = [...(currentUser?.scheduledClasses || []), { timestamp, day: '', time: '', name: 'Reserva' }];
    }
    handleUpdateStudent({ ...currentUser!, scheduledClasses: newScheduled as any[] });
  };

  const handleLogout = () => {
    localStorage.clear();
    setViewMode('landing');
    setRole('guest');
    setCurrentUser(null);
  };

  const [isMobile, setIsMobile] = useState(window.innerWidth <= 1024);
  
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 1024);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  const [activeHeroVideo, setActiveHeroVideo] = useState(0);
  const [activeNews, setActiveNews] = useState(0);
  const [activeTab, setActiveTab] = useState<'dashboard' | 'students' | 'payments' | 'settings' | 'videos' | 'website' | 'communications'>(() => localStorage.getItem('activeTab') as any || 'dashboard');

  useEffect(() => {
    localStorage.setItem('viewMode', viewMode);
    localStorage.setItem('role', role);
    localStorage.setItem('activeTab', activeTab);
    if (currentUser) {
      localStorage.setItem('currentUser', JSON.stringify(currentUser));
    } else {
      localStorage.removeItem('currentUser');
    }
  }, [viewMode, role, currentUser, activeTab]);
  const [liveNews, setLiveNews] = useState(newsItems);
  const [liveHeroVideos, setLiveHeroVideos] = useState([
    "/assets/WhatsApp Video 2026-03-04 at 3.29.01 PM.mp4",
    "/assets/WhatsApp Video 2026-03-04 at 3.29.02 PM.mp4",
    "/assets/WhatsApp Video 2026-03-04 at 3.29.03 PM.mp4"
  ]);
  const [studentSearchTerm, setStudentSearchTerm] = useState('');
  const [studentFilterAge, setStudentFilterAge] = useState<'ALL' | 'KIDS' | 'ADULTS'>('ALL');
  const [studentFilterPayment, setStudentFilterPayment] = useState<'ALL' | 'PAID' | 'PENDING'>('ALL');
  const [studentFilterBelt, setStudentFilterBelt] = useState<Belt | 'ALL'>('ALL');
  const [liveGallery, setLiveGallery] = useState([
    { img: '/assets/WhatsApp Image 2026-03-04 at 3.39.08 PM.jpeg', size: 'large' },
    { img: '/assets/frog_challenge.jpeg', size: 'small' },
    { img: '/assets/frog_combat_1.jpeg', size: 'small' },
    { img: 'https://images.unsplash.com/photo-1599058917232-d750c185ca0d?w=800', size: 'tall' },
    { img: '/assets/frog_face.jpeg', size: 'small' },
    { img: 'https://images.unsplash.com/photo-1555597673-b21d5c935865?w=800', size: 'wide' },
    { img: '/assets/frog_combat_2.jpeg', size: 'small' },
    { img: 'https://images.unsplash.com/photo-1552072047-54d19335391c?w=800', size: 'small' },
  ]);
  const [isAddingGallery, setIsAddingGallery] = useState(false);
  const [newGalleryData, setNewGalleryData] = useState<{ img: string, size: 'small' | 'wide' | 'tall' | 'large' }>({ img: '', size: 'small' });

  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [showQRModal, setShowQRModal] = useState(false);
  const [students, setStudents] = useState<Student[]>([]);
  const [manualPaymentDates, setManualPaymentDates] = useState<Record<string, string>>({});
  
  const handleManualPayment = async (studentId: string, customDate?: string) => {
    try {
      const student = students.find(s => s.id === studentId);
      if (!student) return;

      const finalDate = customDate || new Date().toISOString().split('T')[0];
      const finalMonth = finalDate.substring(0, 7);
      
      const newHistoryEntry = {
        date: finalDate,
        amount: Number(student.monthlyFee) || 0,
        status: 'Completado' as 'Completado' | 'Pendiente',
        method: 'Manual',
        transaction_id: `MANUAL_${finalDate.replace(/-/g, '')}_${student.monthlyFee}`
      };

      const updatedHistory = [...(Array.isArray(student.history) ? student.history : []), newHistoryEntry];

      const response = await fetch(`${API_URL}/api/students/${studentId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          isPaid: true, 
          lastPaymentDate: finalDate, 
          lastPaymentMonth: finalMonth,
          history: updatedHistory
        })
      });

      if (response.ok) {
        setStudents(prev => prev.map(s => s.id === studentId ? { 
          ...s, 
          isPaid: true, 
          lastPaymentDate: finalDate, 
          lastPaymentMonth: finalMonth,
          history: updatedHistory
        } : s));
        
        if (selectedStudent?.id === studentId) {
          setSelectedStudent(prev => prev ? { ...prev, isPaid: true, lastPaymentDate: finalDate, lastPaymentMonth: finalMonth, history: updatedHistory } : null);
        }
      }
    } catch (e) {
      console.error("Error updating payment:", e);
    }
  };
  const [videos, setVideos] = useState<Video[]>([]);
  const [isAddingVideo, setIsAddingVideo] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [newVideoData, setNewVideoData] = useState<Omit<Video, 'id'>>({ title: '', description: '', url: '', thumbnail: '', beltLevel: 'WHITE', category: 'Tecnica' });
  const [isAddingStudent, setIsAddingStudent] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSendingNotice, setIsSendingNotice] = useState(false);
  const [isAddingNews, setIsAddingNews] = useState(false);
  const [newNewsData, setNewNewsData] = useState({ 
    title: '', 
    body: '', 
    img: '', 
    link: '#', 
    label: 'Noticias del Dojo', 
    date: new Date().toLocaleDateString('es-CL', { day: 'numeric', month: 'short', year: 'numeric' }),
    stats: [{ label: 'Evento', text: '' }]
  });
  const [authEmail, setAuthEmail] = useState('');
  const [authPassword, setAuthPassword] = useState('');
  const [isEditingStudent, setIsEditingStudent] = useState(false);
  const [editedStudent, setEditedStudent] = useState<Student | null>(null);
  const [studentNewPassword, setStudentNewPassword] = useState('');

  const [isNoticeDismissed, setIsNoticeDismissed] = useState(false);
  const [isSendingBirthdays, setIsSendingBirthdays] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => {
      setActiveNews(prev => (prev + 1) % liveNews.length);
    }, 15000);
    return () => clearInterval(timer);
  }, [liveNews.length]);

  // API Data Loading
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [studentsRes, videosRes, newsRes, galleryRes, heroVideosRes, noticeRes] = await Promise.all([
          fetch(`${API_URL}/api/students`),
          fetch(`${API_URL}/api/videos`),
          fetch(`${API_URL}/api/news`),
          fetch(`${API_URL}/api/gallery`),
          fetch(`${API_URL}/api/hero-videos`),
          fetch(`${API_URL}/api/global-notice`)
        ]);
        const studentsData = await studentsRes.json();
        const videosData = await videosRes.json();
        const newsData = await newsRes.json();
        const galleryData = await galleryRes.json();
        const heroVideosData = await heroVideosRes.json();
        const noticeDataResult = await noticeRes.json();

        setStudents(studentsData || []);
        setVideos(videosData || []);
        if (newsData !== null) setLiveNews(newsData);
        if (galleryData !== null) setLiveGallery(galleryData);
        if (heroVideosData !== null) setLiveHeroVideos(heroVideosData);
        if (noticeDataResult !== null) setNoticeData(noticeDataResult);

        // Sync currentUser with fresh data from server (e.g. admin changed payment status)
        const cachedUser = localStorage.getItem('currentUser');
        if (cachedUser) {
          const cached = JSON.parse(cachedUser);
          const fresh = (studentsData || []).find((s: Student) => s.id === cached.id);
          if (fresh) {
            setCurrentUser(fresh);
          }
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };
    fetchData();
  }, []);

  const syncWebsite = async (type: 'news' | 'gallery' | 'hero-videos', data: any) => {
    try {
      const endpoint = type === 'hero-videos' ? 'hero-videos' : type;
      await fetch(`${API_URL}/api/${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
    } catch (e) {
      console.error(`Error syncing ${type}:`, e);
    }
  };

  const handleUpdateStudent = async (updatedStudent: Student) => {
    try {
      // Only send fields that exist in the Supabase table
      const payload: any = { id: updatedStudent.id };
      if (updatedStudent.name !== undefined) payload.name = updatedStudent.name;
      if (updatedStudent.email !== undefined) payload.email = updatedStudent.email;
      if (updatedStudent.phone !== undefined) payload.phone = updatedStudent.phone;
      if (updatedStudent.password !== undefined) payload.password = updatedStudent.password;
      if (updatedStudent.belt !== undefined) payload.belt = updatedStudent.belt;
      if (updatedStudent.classesAttended !== undefined) payload.classesAttended = updatedStudent.classesAttended;
      if (updatedStudent.classesToNextBelt !== undefined) payload.classesToNextBelt = updatedStudent.classesToNextBelt;
      if (updatedStudent.isPaid !== undefined) payload.isPaid = updatedStudent.isPaid;
      if (updatedStudent.plan !== undefined) payload.plan = updatedStudent.plan;
      if (updatedStudent.monthlyFee !== undefined) payload.monthlyFee = updatedStudent.monthlyFee;
      if (updatedStudent.birthDate !== undefined) payload.birthDate = updatedStudent.birthDate;
      if (updatedStudent.avatar !== undefined) payload.avatar = updatedStudent.avatar;
      if (updatedStudent.history !== undefined) payload.history = updatedStudent.history;
      if (updatedStudent.lastPaymentDate !== undefined) payload.lastPaymentDate = updatedStudent.lastPaymentDate;
      if (updatedStudent.lastPaymentMonth !== undefined) payload.lastPaymentMonth = updatedStudent.lastPaymentMonth;

      const response = await fetch(`${API_URL}/api/students/${updatedStudent.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (response.ok) {
        const mergedStudent = { ...students.find(s => s.id === updatedStudent.id), ...updatedStudent };
        setStudents(prev => prev.map(s => s.id === updatedStudent.id ? mergedStudent : s));
        setSelectedStudent(mergedStudent);
        setIsEditingStudent(false);
        if (currentUser?.id === updatedStudent.id) {
          setCurrentUser(mergedStudent);
        }
      } else {
        const errData = await response.json().catch(() => ({}));
        console.error('Server error:', errData);
        alert('❌ Error al guardar los cambios. Revisa la consola.');
      }
    } catch (error) {
      console.error("Error updating student:", error);
      alert('❌ Error de conexión al guardar.');
    }
  };



  const handleDeleteStudent = async (studentId: string) => {
    try {
      const response = await fetch(`${API_URL}/api/students/${studentId}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' }
      });
      if (response.ok) {
        setStudents(prev => prev.filter(s => s.id !== studentId));
        setSelectedStudent(null);
      } else {
        alert('Error al eliminar alumno');
      }
    } catch (error) {
      console.error("Error deleting student:", error);
    }
  };


  const handleGenericImageUpload = (e: React.ChangeEvent<HTMLInputElement>, callback: (base64: string) => void) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => callback(reader.result as string);
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
            id: student.id,
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
  const [newStudentData, setNewStudentData] = useState({ name: '', email: '', phone: '', birthDate: '', documentId: '', belt: 'WHITE' as Belt, plan: '3', monthlyFee: 40000 });

  const [fees, setFees] = useState<PlanFees>({
    adults: { '1': 5000, '2': 35000, '3': 40000, '4': 45000, 'Ilimitado': 50000 },
    kids: { '1': 5000, '2': 35000, '3': 40000, '4': 45000, 'Ilimitado': 50000 }
  });

  const [automation, setAutomation] = useState<AutomationConfig>({ reminderDay: 5, whatsappTemplate: "Hola {nombre}...", emailTemplate: "Hola {nombre}..." });
  const calculateAge = (birthDateStr: string | null) => {
    if (!birthDateStr) return 'N/A';
    const parts = birthDateStr.split('-');
    if (parts.length < 3) return 'N/A';
    const birthDate = new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]));
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  };

  const getUpcomingBirthdays = () => {
    const today = new Date();
    today.setHours(0,0,0,0);
    return students
      .filter(s => s.birthDate)
      .map(s => {
        const parts = s.birthDate!.split('-');
        const bMonth = parseInt(parts[1]) - 1;
        const bDay = parseInt(parts[2]);

        const currentYearBd = new Date(today.getFullYear(), bMonth, bDay);
        
        let isToday = false;
        if (bMonth === today.getMonth() && bDay === today.getDate()) {
            isToday = true;
        }

        if (currentYearBd < today && !isToday) currentYearBd.setFullYear(today.getFullYear() + 1);
        return { ...s, nextBd: currentYearBd, isToday };
      })
      .sort((a, b) => {
          if (a.isToday) return -1;
          if (b.isToday) return 1;
          return a.nextBd.getTime() - b.nextBd.getTime();
      })
      .slice(0, 5);
  };

  const beltLabels: Record<Belt, string> = { WHITE: 'Blanco', BLUE: 'Azul', PURPLE: 'Morado', BROWN: 'Marrón', BLACK: 'Negro', GRAY: 'Gris' };
  const planLabels: Record<string, string> = { '1': 'Clase Individual', '2': '2x Semana', '3': '3x Semana', '4': '4x Semana', 'Ilimitado': 'Full Rana' };
  const formatCLP = (amount: number) => new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP', maximumFractionDigits: 0 }).format(amount);

  const handleLogin = (studentToLogin?: Student) => {
    const adminEmails = ['d.diazaraya19@gmail.com', 'manuelplazaarenas@gmail.com', 'contacto@dpsistemas.cl'];
    const lowerEmail = authEmail.trim().toLowerCase();
    
    // Unified login: try admin password first + white-listed emails
    if (authPassword.trim() === 'admin123' && adminEmails.includes(lowerEmail)) {
      setRole('admin');
      setViewMode('app');
      return;
    }

    // Try student login
    const student = studentToLogin || students.find(s => 
      s.email && 
      s.email.toLowerCase() === authEmail.trim().toLowerCase() && 
      s.password === authPassword.trim()
    );
    if (student) {
      setRole('student');
      setCurrentUser(student);
      setViewMode('app');
    } else {
      alert('Correo o contraseña incorrecta');
    }
  };

  const handleUpdateStudentPassword = async () => {
    if (!studentNewPassword || !currentUser) return;
    const updated = { ...currentUser, password: studentNewPassword };
    try {
      await fetch(`${API_URL}/api/students/${currentUser.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password: studentNewPassword })
      });
      setCurrentUser(updated);
      setStudents(prev => prev.map(s => s.id === updated.id ? updated : s));
      setStudentNewPassword('');
      alert('✅ Contraseña actualizada exitosamente.');
    } catch (e) {
      console.error('Error updating password:', e);
      alert('❌ Error al actualizar la contraseña.');
    }
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

  const handleSendMassNotice = async () => {
    try {
      const response = await fetch(`${API_URL}/api/admin/broadcast`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(noticeData)
      });
      if (response.ok) {
        alert('✅ Mensaje enviado exitosamente. Los alumnos lo verán al entrar al portal.');
        setIsSendingNotice(false);
      } else {
        alert('❌ Error al enviar el mensaje.');
      }
    } catch (e) {
      console.error("Error broadcast:", e);
      alert('❌ Error de conexión.');
    }
  };

  const handleSendPaymentReminder = async (student: Student) => {
    try {
      const response = await fetch(`${API_URL}/api/students/${student.id}/send-payment-reminder`, {
        method: 'POST',
      });
      if (response.ok) {
        alert(`✅ Recordatorio de cobra enviado a ${student.name}`);
      } else {
        alert('❌ Error al enviar el recordatorio');
      }
    } catch (error) {
      console.error("Error sending payment reminder:", error);
      alert('❌ Error de red al intentar enviar');
    }
  };

  const handleSendBirthdayGreetings = async () => {
    try {
      setIsSendingBirthdays(true);
      const res = await fetch(`${API_URL}/api/admin/check-birthdays`, { method: 'POST' });
      const data = await res.json();
      if (data.success) {
        alert(`🎂 ¡Operación exitosa!\n\n${data.message}`);
      } else {
        alert('❌ Hubo un problema al procesar los saludos.');
      }
    } catch (e) {
      console.error("Error sending birthdays:", e);
      alert('❌ Error de conexión con el servidor.');
    } finally {
      setIsSendingBirthdays(false);
    }
  };

  const handleGeneratePasswordsForAll = async () => {
    if (!confirm("¿Deseas generar contraseñas automáticas para TODOS los alumnos que aún no tienen una clave?")) return;
    try {
      const response = await fetch(`${API_URL}/api/admin/generate-passwords`, { method: 'POST' });
      const result = await response.json();
      if (result.success) {
        alert(`✅ Se generaron claves para ${result.count} alumnos correctamente en el servidor.`);
        // Recargar datos para ver las claves reflejadas
        window.location.reload(); 
      }
    } catch (e) {
      alert("Error al generar las claves.");
    }
  };

  const handleSendCredentialsByEmail = async (group: 'ALL' | 'KIDS' | 'ADULTS') => {
    if (!confirm(`¿Deseas enviar un correo de bienvenida y credenciales a todo el grupo ${group === 'ALL' ? 'TODOS' : group}?`)) return;
    try {
      const response = await fetch(`${API_URL}/api/admin/send-credentials`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ageGroup: group })
      });
      const result = await response.json();
      if (result.success) {
        alert(`✅ Emails enviados: ${result.message}`);
      } else {
        alert("Error: " + result.error);
      }
    } catch (e) {
      alert("Error al enviar correos.");
    }
  };


  const handleAddVideo = async () => {
    try {
      let videoThumbnail = 'https://images.unsplash.com/photo-1599058917232-d750c185ca0d?w=800'; 
      
      const ytRegex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^\"&?\/\s]{11})/;
      const match = newVideoData.url.match(ytRegex);
      if (match && match[1]) {
           videoThumbnail = `https://img.youtube.com/vi/${match[1]}/maxresdefault.jpg`;
      }

      const payload = { ...newVideoData, thumbnail: videoThumbnail };

      const response = await fetch(`${API_URL}/api/videos`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (response.ok) {
        const savedVideo = await response.json();
        setVideos([...videos, savedVideo]);
        setIsAddingVideo(false);
        setNewVideoData({ title: '', description: '', url: '', thumbnail: '', beltLevel: 'WHITE', category: 'General' });
      }
    } catch (error) {
      console.error("Error adding video:", error);
    }
  };

  if (viewMode === 'landing') {
    return (
      <div className="landing-page" style={{ background: 'var(--bg-main)', color: 'var(--text-main)' }}>
        {/* Navbar */}
        <nav className="mobile-nav-compact" style={{ position: 'fixed', top: '2.5rem', left: '0', right: '0', zIndex: 1000, display: 'flex', justifyContent: 'center' }}>
          <div className="glass" style={{ padding: '0.8rem 2rem', display: 'flex', gap: '2rem', alignItems: 'center', borderRadius: '100px', border: '1px solid var(--glass-border)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', position: 'relative' }}>
              <div style={{ position: 'relative', display: 'flex' }}>
                <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: '50px', height: '50px', background: 'var(--logo-green)', filter: 'blur(30px)', opacity: 0.6, borderRadius: '50%', zIndex: -1 }}></div>
                <img src="/assets/WhatsApp Image 2026-03-04 at 1.50.04 PM.jpeg" alt="Logo" style={{ width: '35px', height: '35px', borderRadius: '50%', objectFit: 'cover', border: '2px solid var(--logo-green)' }} />
              </div>
              <span className="nav-brand-text" style={{ fontWeight: 900, fontSize: '1.1rem', letterSpacing: '-0.5px', color: 'var(--text-main)' }}>RANAS <span style={{ color: 'var(--logo-green)' }}>JIU JITSU</span></span>
            </div>
            <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center' }}>
              <div className="mobile-hide" style={{ display: 'flex', gap: '2rem' }}>
                <a href="#inicio" style={{ fontWeight: 800, color: 'var(--text-main)', textDecoration: 'none', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.1em', opacity: 0.8 }}>Inicio</a>
                <a href="#profesor" style={{ fontWeight: 800, color: 'var(--text-main)', textDecoration: 'none', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.1em', opacity: 0.8 }}>Noticias</a>
                <a href="#gallery" style={{ fontWeight: 800, color: 'var(--text-main)', textDecoration: 'none', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.1em', opacity: 0.8 }}>Galería</a>
              </div>
              <div className="mobile-hide" style={{ width: '1px', height: '20px', background: 'var(--glass-border)' }} />
              <button style={{ background: 'var(--logo-green)', border: 'none', padding: '0.7rem 1.5rem', borderRadius: '50px', fontWeight: 900, fontSize: '0.75rem', textTransform: 'uppercase', cursor: 'pointer', color: '#fff' }} onClick={() => setViewMode('auth')}>Entrar</button>
            </div>
          </div>
        </nav>

        {/* Hero Section - 1. INICIO */}
        <section id="inicio" style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', padding: '12rem 0 2rem', position: 'relative' }}>
          <div className="mesh-gradient" style={{ opacity: 0.2 }} />
          <div className="section-container">
            <div className="responsive-stack" style={{ gap: '4rem', alignItems: 'center' }}>
              <motion.div 
                initial={{ opacity: 0, x: -50 }} 
                animate={{ opacity: 1, x: 0 }} 
                transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
                style={{ flex: 1 }}
                className="mobile-center"
              >
                <span className="font-cartoon" style={{ color: 'var(--logo-green)', fontWeight: 900, letterSpacing: '0.4em', fontSize: '1.2rem', textTransform: 'uppercase', display: 'block', marginBottom: '2rem' }}>
                  Concepción • Chile • Orompello 1421
                </span>
                <h1 className="font-martial pop-text" style={{ fontSize: '7rem', marginBottom: '3rem', color: 'var(--text-main)', maxWidth: '800px', lineHeight: 0.9 }}>
                  ÚNETE AL <br />
                  <span style={{ color: 'var(--logo-green)' }}>PODER</span> <br />
                  <span style={{ color: 'transparent', WebkitTextStroke: '2px var(--tatami-black)' }}>ANFIBIO.</span>
                </h1>
                <p style={{ fontSize: 'clamp(1.1rem, 2vw, 1.4rem)', color: 'var(--text-muted)', marginBottom: '3rem', maxWidth: '800px', margin: '0 auto 3rem', lineHeight: 1.5, fontWeight: 500 }}>
                  Domina el arte suave bajo el linaje de Manuel Plaza. Excelencia técnica y el máximo rendimiento deportivo en el corazón de Concepción.
                </p>
                <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', justifyContent: window.innerWidth < 1024 ? 'center' : 'flex-start' }}>
                  <button className="btn-cartoon" style={{ padding: '0.8rem 1.5rem', fontSize: '1rem' }} onClick={() => window.open('https://wa.me/56939601560?text=Hola,%20me%20gustaría%20reservar%20una%20clase%20de%20Jiu%20Jitsu')}>Reservar Clase</button>
                  <button className="btn-secondary" style={{ padding: '0.8rem 1.5rem', fontSize: '0.9rem' }} onClick={() => window.open('https://www.instagram.com/ranasjiujitsu/?hl=es')}>Instagram</button>
                </div>
              </motion.div>

              <div className="hero-video-wrapper" style={{ marginTop: '2rem' }}>
                <div className="hero-video-container"
                  onTouchStart={(e) => {
                    const touch = e.touches[0];
                    (e.currentTarget as any).touchStart = touch.clientX;
                  }}
                  onTouchEnd={(e) => {
                    const startX = (e.currentTarget as any).touchStart;
                    const endX = e.changedTouches[0].clientX;
                    if (startX - endX > 50) setActiveHeroVideo((activeHeroVideo + 1) % 3);
                    if (endX - startX > 50) setActiveHeroVideo((activeHeroVideo - 1 + 3) % 3);
                  }}
                  style={{ overflow: 'visible' }}
                >
                  {liveHeroVideos.map((src, idx) => {
                    const offset = (idx - activeHeroVideo + 3) % 3;
                    const isCenter = offset === 0;
                    return (
                      <motion.div 
                        key={src}
                        animate={{ 
                          scale: isCenter ? 1.05 : 0.8,
                          x: offset === 0 ? 0 : offset === 1 ? 300 : -300,
                          opacity: isCenter ? 1 : 0.6,
                          rotateY: offset === 0 ? 0 : offset === 1 ? 20 : -20,
                          zIndex: isCenter ? 50 : 10,
                          filter: isCenter ? 'grayscale(0) blur(0px)' : 'grayscale(1) blur(2px)',
                          pointerEvents: isCenter ? 'auto' : 'none'
                        }}
                        transition={{ 
                          type: "spring", 
                          stiffness: 100, 
                          damping: 18
                        }}
                        className="hero-video-card"
                        onClick={() => setActiveHeroVideo(idx)}
                        style={{ cursor: 'pointer' }}
                      >
                        <SocialVideoPlayer 
                          src={src} 
                          size="lg" 
                          isActive={isCenter} 
                          onEnded={() => setActiveHeroVideo((idx + 1) % 3)}
                        />
                      </motion.div>
                    );
                  })}
                </div>
                
                <div className="slider-controls">
                  <button className="slider-nav-btn" onClick={() => setActiveHeroVideo((activeHeroVideo - 1 + 3) % 3)}>
                    <ChevronLeft size={32} strokeWidth={3} />
                  </button>
                  <button className="slider-nav-btn" onClick={() => setActiveHeroVideo((activeHeroVideo + 1) % liveHeroVideos.length)}>
                    <ChevronRight size={32} strokeWidth={3} />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Section 2. PROFESOR / NOTICIAS DESTACADAS */}
        <section id="profesor" className="section-alt" style={{ padding: 'var(--section-padding) 0', position: 'relative' }}>
          <div className="section-container">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeNews}
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -50 }}
                transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                className="responsive-stack"
                style={{ gap: '5rem', alignItems: 'center' }}
              >
                {/* Left Side: Newspaper Visual */}
                <div style={{ position: 'relative', width: '100%', maxWidth: '500px' }}>
                  <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: '100%', height: '100%', background: 'var(--logo-green)', filter: 'blur(100px)', opacity: 0.15, zIndex: -1 }}></div>
                  <div style={{ borderRadius: '4rem', overflow: 'hidden', border: '1px solid var(--logo-green)', boxShadow: '0 40px 80px rgba(0,0,0,0.5)', background: '#fff' }}>
                    <div style={{ padding: '1.5rem', borderBottom: '2px solid #000', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span className="font-martial" style={{ color: '#000', fontSize: '1.2rem' }}>DIARIO DEPORTIVO</span>
                      <span style={{ color: '#000', fontWeight: 800, fontSize: '0.8rem' }}>{liveNews[activeNews].date}</span>
                    </div>
                    <img src={liveNews[activeNews].img} alt="Noticia" style={{ width: '100%', height: 'auto', minHeight: '300px', maxHeight: '500px', objectFit: 'cover', filter: 'sepia(0.2) contrast(1.1)' }} />
                    <div style={{ padding: '2rem', color: '#000' }}>
                      <h4 style={{ fontSize: '2rem', marginBottom: '1rem', color: '#000', lineHeight: 1.1 }}>{liveNews[activeNews].title}</h4>
                      <div className="glass" style={{ display: 'inline-block', padding: '0.5rem 1rem', background: 'var(--logo-green)', color: '#fff', borderRadius: '1rem', fontWeight: 900, fontSize: '0.8rem' }}>
                        {liveNews[activeNews].label}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Right Side: News Body */}
                <div style={{ flex: 1, padding: window.innerWidth < 1024 ? '0 1rem' : '0' }}>
                  <span style={{ color: 'var(--logo-green)', fontWeight: 900, letterSpacing: '0.5em', fontSize: '0.9rem', textTransform: 'uppercase', display: 'block', marginBottom: '2rem' }}>
                    {liveNews[activeNews].label}
                  </span>
                  <h2 style={{ fontSize: 'clamp(3rem, 5vw, 5rem)', color: 'var(--text-main)', marginBottom: '3rem', lineHeight: 1 }}>
                    {liveNews[activeNews].title.includes(':') ? (
                      <>
                        <span style={{ fontSize: '0.6em', opacity: 0.7, display: 'block', marginBottom: '0.5rem' }}>{liveNews[activeNews].title.split(':')[0]}</span>
                        <span style={{ color: 'var(--logo-green)' }}>{liveNews[activeNews].title.split(':')[1].trim()}</span>
                      </>
                    ) : (
                      liveNews[activeNews].title
                    )}
                  </h2>
                  <p style={{ fontSize: '1.1rem', color: 'var(--text-muted)', lineHeight: 1.6, marginBottom: '3rem', fontWeight: 500, margin: window.innerWidth < 1024 ? '0 auto 3rem' : '0 0 3rem' }}>
                    {liveNews[activeNews].body}
                  </p>
                  
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', marginBottom: '4rem' }}>
                    {liveNews[activeNews].stats.map((item, i) => (
                      <div key={i}>
                        <p style={{ color: 'var(--logo-green)', fontWeight: 900, fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.2em', marginBottom: '0.8rem' }}>{item.label}</p>
                        <p style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--text-main)' }}>{item.text}</p>
                      </div>
                    ))}
                  </div>

                  <div style={{ display: 'flex', gap: '2rem', alignItems: 'center', justifyContent: window.innerWidth < 1024 ? 'center' : 'flex-start' }}>
                    <button className="btn-cartoon" onClick={() => window.open(liveNews[activeNews].link, '_blank')}>Leer Noticia Completa</button>
                    <div style={{ display: 'flex', gap: '1rem' }}>
                      {liveNews.map((_, i) => (
                        <div 
                          key={i} 
                          onClick={() => setActiveNews(i)}
                          style={{ 
                            width: i === activeNews ? '40px' : '12px', 
                            height: '12px', 
                            borderRadius: '10px', 
                            background: i === activeNews ? 'var(--logo-green)' : 'rgba(255,255,255,0.2)', 
                            cursor: 'pointer',
                            transition: 'all 0.3s ease'
                          }} 
                        />
                      ))}
                    </div>
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>
        </section>

        {/* Section 3. GALLERY */}
        <section id="gallery" style={{ padding: 'var(--section-padding) 0', position: 'relative' }}>
          <div className="section-container">
            <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
              <span style={{ color: 'var(--logo-green)', fontWeight: 900, letterSpacing: '0.5em', fontSize: '0.8rem', textTransform: 'uppercase', display: 'block', marginBottom: '1.5rem' }}>Experiencia Ranas</span>
              <h2 style={{ fontSize: 'clamp(2.5rem, 6vw, 6rem)', color: 'var(--text-main)', marginBottom: '1.5rem' }}>Galería de <span style={{ color: 'var(--logo-green)' }}>Acción.</span></h2>
              <p className="mobile-hide" style={{ color: 'var(--text-muted)', fontSize: '1.1rem', maxWidth: '600px', margin: '0 auto', fontWeight: 500 }}>Capturando los mejores momentos en el tatami, desde competencias internacionales hasta el día a día en el dojo.</p>
            </div>

            <div className="mobile-horizontal-slider" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gridAutoRows: '300px', gap: '1.5rem' }}>
              {liveGallery.map((item, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, scale: 0.9 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className="mobile-slide"
                  style={{
                    gridColumn: item.size === 'large' ? 'span 2' : item.size === 'wide' ? 'span 2' : 'span 1',
                    gridRow: item.size === 'large' ? 'span 2' : item.size === 'tall' ? 'span 2' : 'span 1',
                    borderRadius: '2rem',
                    overflow: 'hidden',
                    background: 'var(--panel-card)',
                    border: '1px solid var(--panel-border)',
                    cursor: 'pointer',
                    position: 'relative'
                  }}
                >
                  <img src={item.img} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt="Gallery" />
                  <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(0,0,0,0.6), transparent)', opacity: 0, transition: 'opacity 0.3s' }} onMouseEnter={(e) => (e.currentTarget.style.opacity = '1')} onMouseLeave={(e) => (e.currentTarget.style.opacity = '0')}>
                    <div style={{ position: 'absolute', bottom: '2rem', left: '2rem' }}>
                      <ImageIcon size={24} color="#fff" />
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Section 4. CONTACT/JOIN CALL TO ACTION */}
        <section id="contact" className="section-alt" style={{ padding: 'var(--section-padding) 0', position: 'relative' }}>
          <div className="section-container">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="responsive-stack glass"
              style={{
                borderRadius: '4rem',
                overflow: 'hidden',
                background: 'var(--panel-card)',
                border: '1px solid var(--panel-border)',
                minHeight: '400px',
                boxShadow: '0 40px 100px -20px rgba(0,0,0,0.1)'
              }}
            >
              {/* Image Side */}
              <div style={{ position: 'relative', overflow: 'hidden' }}>
                <img 
                  src="/assets/contact_section.jpeg" 
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                  alt="Unete al Poder Anfibio" 
                />
                <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to right, transparent, var(--panel-card))', opacity: 0.1 }}></div>
              </div>

              <div style={{ padding: window.innerWidth < 1024 ? '2rem' : '4rem', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                <span className="mobile-center" style={{ color: 'var(--logo-green)', fontWeight: 900, letterSpacing: '0.4em', fontSize: '0.85rem', textTransform: 'uppercase', marginBottom: '1.5rem', display: 'block' }}>Únete a Nosotros</span>
                <h2 className="mobile-center" style={{ fontSize: 'clamp(2.5rem, 4vw, 3.5rem)', lineHeight: 1.1, marginBottom: '2rem', color: 'var(--text-main)', letterSpacing: '-1px' }}>
                  ¿Quieres sumarte al <span style={{ color: 'var(--logo-green)' }}>poder anfibio?</span>
                </h2>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                  <p style={{ fontSize: 'clamp(1.1rem, 2vw, 1.4rem)', color: 'var(--text-muted)', fontWeight: 500, lineHeight: 1.5 }}>
                    Forma parte de la comunidad de Jiu Jitsu más fuerte de Concepción. No importa tu nivel, solo tu determinación.
                  </p>
                  
                  <div style={{ display: 'flex', alignItems: 'center', gap: '2rem', marginTop: '1rem' }}>
                    <a 
                      href="https://wa.me/56939601560" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="btn-primary hover-lift" 
                      style={{ 
                        padding: '1.5rem 2.5rem', 
                        fontSize: '1rem', 
                        background: 'var(--logo-green)', 
                        textDecoration: 'none', 
                        display: 'flex', 
                        alignItems: 'center', 
                        textAlign: 'center',
                        justifyContent: 'center',
                        gap: '1rem',
                        width: '100%'
                      }}
                    >
                      WHATSAPP +56 9 3960 1560
                    </a>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </section>


        <footer style={{ background: '#000', padding: 'var(--section-padding) 0 4rem', borderTop: '1px solid rgba(255,255,255,0.1)', color: '#fff' }}>
          <div className="section-container">
            <div className="responsive-stack" style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr', gap: '4rem', marginBottom: '6rem' }}>
              <div className="mobile-center">
                <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', marginBottom: '2rem', justifyContent: 'inherit' }}>
                  <div style={{ padding: '3px', background: '#fff', borderRadius: '50%', display: 'flex' }}>
                    <img src="/assets/WhatsApp Image 2026-03-04 at 1.50.04 PM.jpeg" alt="Logo" style={{ width: '50px', height: '50px', borderRadius: '50%', objectFit: 'cover' }} />
                  </div>
                  <span style={{ fontWeight: 900, fontSize: '1.6rem', letterSpacing: '-1px', color: '#fff' }}>RANAS <span style={{ color: 'var(--logo-green)' }}>JIU JITSU</span></span>
                </div>
                <p className="mobile-hide" style={{ color: 'rgba(255,255,255,0.6)', lineHeight: 1.8, fontSize: '1rem', maxWidth: '400px', fontWeight: 500 }}>
                  El epicentro del Jiu Jitsu de alto nivel en Concepción. Orompello 1421. Maestría técnica y comunidad.
                </p>
              </div>
              <div className="mobile-center">
                <h4 style={{ fontSize: '1rem', marginBottom: '1.5rem', fontWeight: 900, color: 'var(--logo-green)', letterSpacing: '0.05em' }}>COMUNIDAD</h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', color: 'rgba(255,255,255,0.8)', fontSize: '0.85rem', fontWeight: 600 }}>
                  <span className="footer-link">Nosotros</span>
                  <span className="footer-link">Horarios</span>
                  <span className="footer-link">Membresías</span>
                </div>
              </div>
              <div className="mobile-center">
                <h4 style={{ fontSize: '1rem', marginBottom: '1.5rem', fontWeight: 900, color: 'var(--logo-green)', letterSpacing: '0.05em' }}>CONTACTO</h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', color: 'rgba(255,255,255,0.8)', fontSize: '0.85rem', fontWeight: 600 }}>
                  <span>+56 9 3960 1560</span>
                  <span>manuelplazaarenas@gmail.com</span>
                  <span>Orompello 1421, Concepción</span>
                </div>
              </div>
              <div className="mobile-center">
                <h4 style={{ fontSize: '1rem', marginBottom: '1.5rem', fontWeight: 900, color: 'var(--logo-green)', letterSpacing: '0.05em' }}>SÍGUENOS</h4>
                <div style={{ display: 'flex', gap: '1.5rem', color: 'var(--logo-green)', justifyContent: 'inherit' }}>
                  <Instagram size={24} className="hover-lift" style={{ cursor: 'pointer' }} />
                  <Facebook size={24} className="hover-lift" style={{ cursor: 'pointer' }} />
                </div>
              </div>
            </div>
            <div style={{ paddingTop: '3rem', borderTop: '1px solid rgba(255,255,255,0.05)', textAlign: 'center', color: 'rgba(255,255,255,0.4)', fontSize: '0.75rem', fontWeight: 600, letterSpacing: '0.1em' }}>
              © 2026 RANAS JIU JITSU • CONCEPCIÓN CHILE
            </div>
          </div>
        </footer>
      </div>
    );
  }

  // --- RENDERING AUTH PAGE ---
  if (viewMode === 'auth') {
    return (
      <div style={{ width: '100%', minHeight: '100vh', display: 'flex', flexDirection: window.innerWidth < 1024 ? 'column' : 'row', position: 'relative', overflowX: 'hidden', background: '#000' }}>
        {/* Decorative Background for Mobile */}
        <div style={{ position: 'absolute', inset: 0, zIndex: 0, pointerEvents: 'none', opacity: 0.4 }}>
          <div style={{ position: 'absolute', top: '20%', left: '10%', width: '300px', height: '300px', background: 'var(--logo-green)', filter: 'blur(100px)', borderRadius: '50%' }} />
          <div style={{ position: 'absolute', bottom: '20%', right: '10%', width: '300px', height: '300px', background: 'var(--logo-green)', filter: 'blur(100px)', borderRadius: '50%', opacity: 0.5 }} />
        </div>

        {/* Left Side: Branding (Hidden on small mobile if needed, but here we stack) */}
        <motion.div 
          initial={{ opacity: 0, x: -50 }} 
          animate={{ opacity: 1, x: 0 }}
          style={{ 
            width: window.innerWidth < 1024 ? '100%' : '45%', 
            padding: window.innerWidth < 1024 ? '3rem 2rem 1rem' : '6rem 8rem', 
            display: 'flex', 
            flexDirection: 'column', 
            justifyContent: window.innerWidth < 1024 ? 'center' : 'center',
            alignItems: window.innerWidth < 1024 ? 'center' : 'flex-start',
            position: 'relative',
            zIndex: 1,
            color: '#fff',
            background: 'linear-gradient(135deg, #000, #0a0a0a)'
          }}
        >
          <div style={{ position: 'relative', display: 'inline-flex', marginBottom: window.innerWidth < 1024 ? '0' : '2.5rem' }}>
            <img src="/assets/WhatsApp Image 2026-03-04 at 1.50.04 PM.jpeg" alt="Logo" style={{ width: window.innerWidth < 1024 ? '120px' : '100px', height: window.innerWidth < 1024 ? '120px' : '100px', borderRadius: '50%', objectFit: 'cover', border: '3px solid var(--logo-green)' }} />
          </div>
          <div className="desktop-only" style={{ width: '100%', textAlign: 'inherit', display: 'flex', flexDirection: 'column' }}>
            <span style={{ color: 'var(--logo-green)', fontWeight: 900, letterSpacing: '0.4em', fontSize: '0.8rem', textTransform: 'uppercase', marginBottom: '1.5rem', display: 'block', marginTop: '2.5rem' }}>Portal de Miembros</span>
            <h1 style={{ fontSize: 'clamp(2.5rem, 5vw, 4.5rem)', color: '#fff', marginBottom: '2rem', lineHeight: 1, letterSpacing: '-2px' }}>
              Tu dojo,<br />
              <span style={{ color: 'var(--logo-green)' }}>tu legado.</span>
            </h1>
            <p style={{ fontSize: '1.1rem', color: 'rgba(255,255,255,0.6)', maxWidth: '400px', lineHeight: 1.6, fontWeight: 500 }}>
              Inicia sesión para acceder a tu plan de entrenamiento, clases registradas y contenido técnico exclusivo de Ranas Jiu Jitsu.
            </p>
          </div>
        </motion.div>

        {/* Right Side: Traditional Login Form */}
        <div style={{ width: window.innerWidth < 1024 ? '100%' : '55%', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: window.innerWidth < 1024 ? '1rem' : '2rem', position: 'relative', zIndex: 1 }}>
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="glass"
            style={{ 
              width: '100%', 
              maxWidth: '450px', 
              padding: window.innerWidth < 768 ? '2.5rem' : '4rem', 
              borderRadius: '3rem', 
              background: 'rgba(255,255,255,0.03)', 
              border: '1px solid rgba(255,255,255,0.1)',
              backdropFilter: 'blur(40px)',
              boxShadow: '0 50px 100px rgba(0,0,0,0.5)'
            }}
          >
            <div style={{ marginBottom: window.innerWidth < 1024 ? '1.5rem' : '3rem' }}>
              <button 
                onClick={() => setViewMode('landing')}
                className="desktop-only"
                style={{ background: 'none', border: 'none', color: 'var(--logo-green)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 800, fontSize: '0.85rem', marginBottom: '1.5rem', padding: 0 }}
              >
                <ChevronLeft size={16} /> Volver al inicio
              </button>
              <h2 style={{ fontSize: window.innerWidth < 1024 ? '1.8rem' : '2.5rem', color: '#fff', letterSpacing: '-1px', marginBottom: '0.2rem' }}>Acceso</h2>
              <p className="desktop-only" style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.95rem', fontWeight: 500 }}>Ingresa tus credenciales para continuar</p>
            </div>

            <form onSubmit={(e) => { e.preventDefault(); handleLogin(); }} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                <label style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.1em' }}>Correo Electrónico</label>
                <div style={{ position: 'relative' }}>
                  <Mail size={18} style={{ position: 'absolute', left: '1.2rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--logo-green)' }} />
                  <input 
                    type="email" 
                    placeholder="nombre@ejemplo.com" 
                    value={authEmail}
                    onChange={e => setAuthEmail(e.target.value)}
                    required
                    style={{ 
                      width: '100%', 
                      padding: '1.2rem 1.2rem 1.2rem 3.5rem', 
                      background: 'rgba(255,255,255,0.05)', 
                      border: '1px solid rgba(255,255,255,0.1)', 
                      borderRadius: '1.2rem', 
                      color: '#fff', 
                      fontSize: '1rem', 
                      outline: 'none',
                      transition: 'border-color 0.3s'
                    }} 
                    onFocus={(e) => e.target.style.borderColor = 'var(--logo-green)'}
                    onBlur={(e) => e.target.style.borderColor = 'rgba(255,255,255,0.1)'}
                  />
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <label style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.1em' }}>Contraseña</label>
                  <button type="button" onClick={() => alert('Sistema de recuperación de contraseña disponible próximamente.')} style={{ background: 'none', border: 'none', color: 'var(--logo-green)', fontSize: '0.75rem', fontWeight: 800, cursor: 'pointer', padding: 0 }}>¿Olvidaste tu contraseña?</button>
                </div>
                <div style={{ position: 'relative' }}>
                  <Lock size={18} style={{ position: 'absolute', left: '1.2rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--logo-green)' }} />
                  <input 
                    type="password" 
                    placeholder="••••••••" 
                    value={authPassword}
                    onChange={e => setAuthPassword(e.target.value)}
                    required
                    style={{ 
                      width: '100%', 
                      padding: '1.2rem 1.2rem 1.2rem 3.5rem', 
                      background: 'rgba(255,255,255,0.05)', 
                      border: '1px solid rgba(255,255,255,0.1)', 
                      borderRadius: '1.2rem', 
                      color: '#fff', 
                      fontSize: '1rem', 
                      outline: 'none',
                      letterSpacing: '0.1em'
                    }} 
                    onFocus={(e) => e.target.style.borderColor = 'var(--logo-green)'}
                    onBlur={(e) => e.target.style.borderColor = 'rgba(255,255,255,0.1)'}
                  />
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', marginTop: '0.5rem' }}>
                <input type="checkbox" id="remember" style={{ accentColor: 'var(--logo-green)' }} />
                <label htmlFor="remember" style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.85rem', fontWeight: 500, cursor: 'pointer' }}>Recordarme en este equipo</label>
              </div>

              <button 
                type="submit"
                className="btn-primary"
                style={{ 
                  marginTop: '1.5rem', 
                  padding: '1.5rem', 
                  justifyContent: 'center', 
                  background: 'var(--logo-green)', 
                  width: '100%', 
                  fontSize: '1rem',
                  borderRadius: '1.5rem'
                }}
              >
                Iniciar Sesión
              </button>
            </form>

            <div style={{ marginTop: '2.5rem', textAlign: 'center', borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '2rem' }}>
              <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.85rem' }}>
                ¿Aún no eres parte de la manada? <br />
                <a href="#contact" onClick={() => setViewMode('landing')} style={{ color: 'var(--logo-green)', fontWeight: 800, textDecoration: 'none' }}>Únete hoy mismo</a>
              </p>
            </div>
          </motion.div>
        </div>
      </div>
    );
  }




  if (viewMode === 'app' && role === 'student' && currentUser) {
    return (
      <div style={{ background: 'var(--panel-bg)', minHeight: '100vh', color: 'var(--panel-text)', overflowX: 'hidden' }}>
        {/* Waiver / Terms Modal Check */}
        {currentUser && !currentUser.terms_accepted && (
          <AcceptTermsModal student={currentUser} onAccept={async () => {
             const updated = { ...currentUser, terms_accepted: true };
             // Sincronizar con el servidor inmediatamente
             try {
               await fetch(`${API_URL}/api/students/${currentUser.id}/accept-terms`, { method: 'POST' });
             } catch(e) { console.error("Sync error:", e); }
             
             setCurrentUser(updated);
             setStudents(prev => prev.map(s => s.id === updated.id ? updated : s));
          }} />
        )}

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
                <img src={currentUser.avatar || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(currentUser.name)}&backgroundColor=05a86a&fontFamily=Arial,sans-serif&fontWeight=900&fontSize=40`} style={{ position: 'absolute', inset: '2px', borderRadius: '50%', background: '#111', objectFit: 'cover' }} />
              </div>
              <div>
                <div style={{ fontSize: '0.6rem', fontWeight: 900, color: 'var(--logo-green)', letterSpacing: '0.3em', textTransform: 'uppercase' }}>Bienvenido</div>
                <div style={{ fontSize: '1.5rem', fontWeight: 900, letterSpacing: '-0.5px', marginBottom: '4px' }}>{currentUser?.name?.split(' ')[0]}</div>
                <div className={`belt-badge belt-${currentUser?.belt || 'WHITE'}`} style={{ fontSize: '0.55rem', padding: '0.2rem 0.5rem', display: 'inline-block' }}>{beltLabels[currentUser?.belt || 'WHITE']}</div>
              </div>
            </div>
            <div style={{ display: 'flex', gap: '0.6rem' }}>
              <motion.button whileTap={{ scale: 0.88 }} onClick={handleLogout} style={{ width: '40px', height: '40px', borderRadius: '11px', background: 'var(--panel-card)', border: '1px solid var(--panel-border)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: 'var(--panel-muted)' }}>
                <LogOut size={17} />
              </motion.button>
            </div>
          </motion.header>

          {/* Main Views */}
          <AnimatePresence mode="wait">
            {activeTab === 'dashboard' && (
              <motion.div key="dashboard" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.3 }}>
                {noticeData.subject && !isNoticeDismissed && (
                  <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
                    style={{ background: 'linear-gradient(135deg, rgba(5,168,106,0.1) 0%, rgba(16,244,156,0.1) 100%)', border: '1px solid rgba(5,168,106,0.2)', padding: '1.5rem', borderRadius: '1.5rem', marginBottom: '1.5rem', position: 'relative', overflow: 'hidden' }}>
                    <button 
                      onClick={() => setIsNoticeDismissed(true)}
                      style={{ position: 'absolute', top: '1rem', right: '1rem', background: 'rgba(0,0,0,0.05)', border: 'none', color: 'var(--text-main)', padding: '5px', borderRadius: '50%', cursor: 'pointer', zIndex: 10, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                    >
                      <X size={16} />
                    </button>
                    <div style={{ position: 'absolute', top: '-20px', right: '-20px', width: '80px', height: '80px', background: 'var(--logo-green)', filter: 'blur(40px)', opacity: 0.2 }} />
                    <div style={{ display: 'flex', gap: '1rem', alignItems: 'start', position: 'relative', zIndex: 1 }}>
                      <div style={{ background: 'var(--logo-green)', padding: '0.6rem', borderRadius: '12px', color: '#fff' }}>
                        <Bell size={18} />
                      </div>
                      <div>
                        <h4 style={{ margin: 0, fontSize: '1rem', fontWeight: 900, color: 'var(--text-main)', marginBottom: '0.3rem' }}>{noticeData.subject}</h4>
                        <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-muted)', lineHeight: 1.5 }}>{noticeData.message}</p>
                      </div>
                    </div>
                  </motion.div>
                )}
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
                  style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.9rem', marginBottom: '1.2rem' }}>
                  <motion.div 
                    whileTap={{ scale: 0.95 }}
                    onClick={() => !currentUser?.isPaid && handleCreatePaymentLink(currentUser)}
                    style={{ 
                      background: currentUser?.isPaid ? 'var(--panel-green-bg)' : 'var(--panel-red-bg)', 
                      border: `1px solid ${currentUser?.isPaid ? 'var(--panel-green-border)' : 'var(--panel-red-border)'}`, 
                      borderRadius: '1.1rem', 
                      padding: '1.3rem', 
                      textAlign: 'center',
                      cursor: currentUser?.isPaid ? 'default' : 'pointer',
                      position: 'relative'
                    }}>
                    <CreditCard size={22} style={{ color: currentUser?.isPaid ? 'var(--logo-green)' : '#ef4444', marginBottom: '0.6rem' }} />
                    <div style={{ fontSize: '0.6rem', color: 'var(--panel-muted)', fontWeight: 800, letterSpacing: '0.1em', marginBottom: '0.2rem' }}>MENSUALIDAD</div>
                    <div style={{ fontWeight: 900, color: currentUser?.isPaid ? 'var(--logo-green)' : '#ef4444', fontSize: '0.85rem' }}>{currentUser?.isPaid ? '✓ AL DÍA' : '⚠ PENDIENTE'}</div>
                    {!currentUser?.isPaid && <div style={{ fontSize: '0.55rem', color: '#ef4444', fontWeight: 800, marginTop: '4px' }}>TOCA PARA PAGAR</div>}
                  </motion.div>
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

                {/* Weekly Schedule Subsystem */}
                 <motion.section initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
                   style={{ marginBottom: '1.5rem' }}>
                   <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.2rem' }}>
                     <h3 style={{ fontWeight: 900, fontSize: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}><Calendar size={18} style={{ color: 'var(--logo-green)' }} /> Horario de Clases</h3>
                     <div style={{ fontSize: '0.7rem', color: 'var(--panel-muted)', fontWeight: 700 }}>Esta Semana</div>
                   </div>

                   <div style={{ display: 'flex', overflowX: 'auto', gap: '0.8rem', paddingBottom: '1rem', margin: '0 -1.5rem', padding: '0 1.5rem', WebkitOverflowScrolling: 'touch' }} className="no-scrollbar">
                     {((typeof calculateAge(currentUser?.birthDate || null) === 'number' ? (calculateAge(currentUser?.birthDate || null) as number) : parseInt(calculateAge(currentUser?.birthDate || null) as string)) < 18 ? [
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
                     ]).map((dayItem, idx) => (
                       <div key={idx} style={{ flexShrink: 0, width: '140px', background: 'var(--panel-card)', border: '1px solid var(--panel-border)', borderRadius: '1.2rem', padding: '1rem', display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
                         <div style={{ fontSize: '0.75rem', fontWeight: 900, color: 'var(--logo-green)', letterSpacing: '0.1em', textTransform: 'uppercase' }}>{dayItem.day}</div>
                         <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                           {dayItem.classes.map((cls, cIdx) => {
                             const cWeekStart = getWeekStart(new Date());
                             const isBooked = (currentUser?.scheduledClasses || []).some(sc => sc.timestamp >= cWeekStart && sc.day === dayItem.day && sc.time === cls.time);

                             return (
                               <motion.button key={cIdx} whileTap={{ scale: 0.95 }}
                                 onClick={() => handleBookClass(new Date().getTime())} // Simulating booking logic
                                 style={{
                                   background: isBooked ? 'var(--logo-green)' : 'var(--panel-surface)',
                                   borderRadius: '0.8rem', padding: '0.8rem', border: 'none', cursor: 'pointer', textAlign: 'left', width: '100%'
                                 }}>
                                 <div style={{ fontSize: '1rem', fontWeight: 900, color: isBooked ? '#000' : 'var(--panel-text)', marginBottom: '2px' }}>{cls.time}</div>
                                 <div style={{ fontSize: '0.6rem', fontWeight: 700, color: isBooked ? 'rgba(0,0,0,0.6)' : 'var(--panel-muted)', textTransform: 'uppercase' }}>{cls.name}</div>
                               </motion.button>
                             );
                           })}
                         </div>
                       </div>
                     ))}
                   </div>
                 </motion.section>

                {/* Library Highlights */}
                <motion.section initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
                  style={{ marginBottom: '6rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.2rem', padding: '0 0.5rem' }}>
                    <h3 style={{ fontWeight: 900, fontSize: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}><Award size={18} style={{ color: 'var(--logo-green)' }} /> Para tu grado</h3>
                    <button style={{ background: 'none', border: 'none', color: 'var(--logo-green)', fontWeight: 800, fontSize: '0.7rem' }}>Ver todo</button>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
                    {videos.filter(v => v.beltLevel === currentUser?.belt).length > 0 ? (
                      videos.filter(v => v.beltLevel === currentUser?.belt).slice(0, 3).map(video => (
                        <motion.div key={video.id} whileTap={{ scale: 0.98 }} onClick={() => window.open(video.url)}
                          style={{ background: 'var(--panel-card)', borderRadius: '1.2rem', padding: '0.8rem', display: 'flex', gap: '1rem', alignItems: 'center', border: '1px solid var(--panel-border)' }}>
                          <div style={{ width: '70px', height: '50px', borderRadius: '8px', overflow: 'hidden', background: '#000', position: 'relative' }}>
                            <img src={video.thumbnail} style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: 0.6 }} />
                            <Play size={12} fill="#fff" style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', color: '#fff' }} />
                          </div>
                          <div style={{ flex: 1 }}>
                            <h5 style={{ margin: 0, fontSize: '0.8rem', fontWeight: 800, color: 'var(--text-main)', marginBottom: '0.2rem' }}>{video.title}</h5>
                            <p style={{ margin: 0, fontSize: '0.65rem', color: 'var(--panel-muted)', fontWeight: 700 }}>{video.category}</p>
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
              </motion.div>
            )}



            {
              activeTab === 'settings' && (
                <motion.div key="settings" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} transition={{ duration: 0.3 }}>
                  <div style={{ padding: '2rem', background: 'var(--panel-card)', borderRadius: '1.5rem', border: '1px solid var(--panel-border)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem' }}>
                      <Settings size={28} style={{ color: 'var(--logo-green)' }} />
                      <h3 style={{ fontWeight: 900, fontSize: '1.4rem' }}>Mi Perfil</h3>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', marginBottom: '2.5rem', padding: '1rem' }}>
                      <div style={{ position: 'relative' }}>
                        <div style={{ width: '85px', height: '85px', borderRadius: '50%', overflow: 'hidden', border: '3px solid var(--logo-green)', background: 'var(--panel-surface)' }}>
                          <img src={currentUser.avatar || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(currentUser.name)}&backgroundColor=05a86a&fontFamily=Arial,sans-serif&fontWeight=900&fontSize=40`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        </div>
                      </div>
                      <div>
                        <div style={{ fontSize: '0.7rem', fontWeight: 800, color: 'var(--panel-muted)', letterSpacing: '0.1em', marginBottom: '0.3rem' }}>TU FOTO DE PERFIL</div>
                        <p style={{ fontSize: '0.8rem', color: 'var(--panel-muted)', maxWidth: '180px', lineHeight: 1.3 }}>La actualización de fotos está desactivada temporalmente.</p>
                      </div>
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

                    <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.95 }} onClick={handleLogout}
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
  const tabLabels: Record<string, string> = { dashboard: 'Resumen', students: 'Alumnos', videos: 'Biblioteca', attendance: 'Asistencia', payments: 'Finanzas', settings: 'Ajustes', website: 'Sitio Web', communications: 'Comunicaciones' };
  return (
    <div style={{ background: 'var(--panel-bg)', minHeight: '100vh', display: 'flex', color: 'var(--panel-text)', overflow: 'hidden' }}>


      {/* BG */}
      <div style={{ position: 'fixed', inset: 0, zIndex: 0, pointerEvents: 'none' }}>
        <div style={{ position: 'absolute', top: 0, right: '20%', width: '600px', height: '600px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(5,168,106,0.08) 0%, transparent 70%)', filter: 'blur(100px)', opacity: 'var(--panel-orb-opacity)' }} />
        <div style={{ position: 'absolute', bottom: 0, left: '20%', width: '400px', height: '400px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(5,168,106,0.06) 0%, transparent 70%)', filter: 'blur(80px)', opacity: 'var(--panel-orb-opacity)' }} />
        <div style={{ position: 'absolute', inset: 0, backgroundImage: 'radial-gradient(circle at 1px 1px, var(--panel-grid-dot) 1px, transparent 0)', backgroundSize: '32px 32px' }} />
      </div>

      {/* Sidebar */}
      <motion.nav initial={{ x: -350, opacity: 0 }} animate={{ x: isMobile ? (isMobileMenuOpen ? 0 : -500) : 0, opacity: 1 }} transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
        className={`sidebar ${isMobileMenuOpen ? 'sidebar-open' : ''}`}
        style={{ position: 'fixed', left: 0, top: isMobile ? '70px' : 0, bottom: 0, padding: '2rem 1.5rem', display: 'flex', flexDirection: 'column', zIndex: 995, background: 'rgba(6,6,6,0.98)', backdropFilter: 'blur(40px)', borderRight: '1px solid rgba(255,255,255,0.06)' }}>
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

            { id: 'payments', label: 'Finanzas', icon: <CreditCard size={17} /> },
            { id: 'videos', label: 'Biblioteca', icon: <Play size={17} /> },
            { id: 'communications', label: 'Comunicaciones', icon: <Mail size={17} /> },
            { id: 'website', label: 'Sitio Web', icon: <Monitor size={17} /> },
            { id: 'settings', label: 'Ajustes', icon: <Settings size={17} /> },
          ].filter(item => {
              if (isMobile) {
                  return ['dashboard', 'students', 'payments', 'communications'].includes(item.id);
              }
              return true;
          }).map(item => (
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
          <motion.button whileTap={{ scale: 0.95 }} onClick={handleLogout}
            style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.9rem', padding: '0.7rem 1rem', borderRadius: '0.8rem', border: 'none', background: 'transparent', color: 'rgba(239,68,68,0.7)', fontWeight: 700, fontSize: '0.8rem', cursor: 'pointer', width: '100%' }}>
            <LogOut size={16} /> Cerrar sesión
          </motion.button>
        </div>
      </motion.nav>

      {/* Main content */}
      <main className="main-content" style={{ flex: 1, padding: isMobile ? '1.5rem 1rem' : '2.5rem 3rem', position: 'relative', zIndex: 1, overflowY: 'auto' }}>
        {/* Header */}
        <motion.header initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}
          style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            {isMobile && (
              <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} 
                style={{ background: 'var(--panel-card)', border: '1px solid var(--panel-border)', borderRadius: '12px', width: '45px', height: '45px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--logo-green)', cursor: 'pointer', boxShadow: '0 4px 10px rgba(0,0,0,0.05)' }}>
                {isMobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
              </button>
            )}
            <div>
              <div style={{ fontSize: '0.65rem', fontWeight: 800, color: 'var(--logo-green)', letterSpacing: '0.3em', textTransform: 'uppercase', marginBottom: '0.3rem' }}>Ranas · Orompello 1421</div>
              <h1 style={{ fontSize: '2rem', fontWeight: 900, letterSpacing: '-1px', color: 'var(--logo-green)' }}>{tabLabels[activeTab]}</h1>
            </div>
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
              style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(3, 1fr)', gap: '1.2rem' }}>
              {/* Mobile Quick Actions on Dashboard (Moved to top) */}
              {isMobile && (
                <motion.div key="mobile-quick-actions" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                  style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.8rem', gridColumn: 'span 1' }}>
                  <motion.button whileTap={{ scale: 0.95 }} onClick={() => setIsAddingStudent(true)}
                    style={{ background: 'var(--logo-green)', border: 'none', borderRadius: '1.2rem', padding: '1.2rem', color: '#fff', fontWeight: 900, fontSize: '0.8rem', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem' }}>
                    <Plus size={22} /> NUEVO ALUMNO
                  </motion.button>
                  <motion.button whileTap={{ scale: 0.95 }} onClick={() => setIsSendingNotice(true)}
                    style={{ background: 'var(--panel-card)', border: '1px solid var(--panel-border)', borderRadius: '1.2rem', padding: '1.2rem', color: 'var(--panel-text)', fontWeight: 900, fontSize: '0.8rem', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem' }}>
                    <Bell size={22} style={{ color: 'var(--logo-green)' }} /> NOTIFICACIÓN
                  </motion.button>
                </motion.div>
              )}

              {[
                { title: 'Total Alumnos', value: students.length, icon: <Users size={18} />, sub: '+12% este mes', color: 'var(--panel-green-bg)', border: 'var(--panel-green-border)', onClick: () => { setActiveTab('students'); setStudentFilterPayment('ALL'); } },
                { title: 'Alumnos al Día', value: students.filter(s => s.isPaid).length, icon: <Award size={18} />, sub: 'Pagos vigentes', color: 'var(--panel-green-bg)', border: 'var(--panel-green-border)', onClick: () => { setActiveTab('students'); setStudentFilterPayment('PAID'); } },
                { title: 'Pendientes', value: students.filter(s => !s.isPaid).length, icon: <CreditCard size={18} />, sub: 'Requieren atención', color: 'var(--panel-red-bg)', border: 'var(--panel-red-border)', onClick: () => { setActiveTab('students'); setStudentFilterPayment('PENDING'); } },
              ].map((card, i) => (
                <motion.div key={i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }} onClick={card.onClick} whileHover={{ y: -4, scale: 1.02 }}
                  style={{ background: card.color, border: `1px solid ${card.border}`, borderRadius: '1.2rem', padding: '1.5rem', cursor: 'pointer' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.2rem' }}>
                    <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'rgba(5,168,106,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--logo-green)' }}>{card.icon}</div>
                    <span style={{ fontSize: '0.65rem', fontWeight: 800, color: 'var(--panel-muted)', letterSpacing: '0.05em' }}>{card.sub}</span>
                  </div>
                  <div style={{ fontSize: '2.2rem', fontWeight: 900, letterSpacing: '-1px', marginBottom: '0.2rem', color: 'var(--panel-text)' }}>{card.value}</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--panel-muted)', fontWeight: 600 }}>{card.title}</div>
                </motion.div>
              ))}

              {/* Upcoming Birthdays */}
              <div style={{ gridColumn: isMobile ? 'span 1' : 'span 3', marginTop: '1rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.2rem' }}>
                  <h3 style={{ fontSize: '1.1rem', fontWeight: 900, color: 'var(--logo-green)' }}>Próximos Cumpleaños 🎂</h3>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: isMobile ? 'repeat(2, 1fr)' : 'repeat(5, 1fr)', gap: '1rem' }}>
                  {getUpcomingBirthdays().map((student: any) => {
                    const bd = new Date(student.birthDate!);
                    return (
                      <motion.div key={student.id} whileHover={{ y: -5 }} onClick={() => setSelectedStudent(student)}
                        style={{ 
                          background: student.isToday ? 'var(--panel-green-bg)' : 'var(--panel-surface)', 
                          border: `1px solid ${student.isToday ? 'var(--logo-green)' : 'var(--panel-border)'}`, 
                          borderRadius: '1.2rem', 
                          padding: '1.5rem', 
                          textAlign: 'center', 
                          cursor: 'pointer',
                          position: 'relative',
                          overflow: 'hidden'
                        }}>
                        {student.isToday && (
                          <div style={{ position: 'absolute', top: '10px', right: '10px', fontSize: '0.6rem', fontWeight: 900, color: 'var(--logo-green)', background: 'rgba(5,168,106,0.1)', padding: '2px 8px', borderRadius: '10px' }}>HOY 🎂</div>
                        )}
                        <div style={{ fontSize: '1.8rem', marginBottom: '0.6rem' }}>{student.isToday ? '🎉' : '🎁'}</div>
                        <div style={{ fontWeight: 900, fontSize: '0.85rem', color: 'var(--panel-text)', marginBottom: '0.3rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{student.name.split(' ')[0]}</div>
                        <div style={{ fontSize: '0.75rem', color: student.isToday ? 'var(--panel-text)' : 'var(--logo-green)', fontWeight: 800 }}>
                          {bd.toLocaleDateString('es-CL', { day: 'numeric', month: 'long' })}
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              </div>

              {/* Pending Payments */}
              <section style={{ gridColumn: isMobile ? 'span 1' : 'span 2', marginTop: '1rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.2rem' }}>
                  <h3 style={{ fontSize: '1rem', fontWeight: 900, color: 'var(--logo-green)' }}>Pagos Pendientes ⚠️</h3>
                  <button style={{ background: 'none', border: 'none', color: 'var(--logo-green)', fontWeight: 800, fontSize: '0.75rem', letterSpacing: '0.05em', cursor: 'pointer' }} onClick={() => setActiveTab('students')}>VER TODOS LOS ALUMNOS</button>
                </div>
                <div style={{ background: 'var(--panel-surface)', border: '1px solid var(--panel-border)', borderRadius: '1.2rem', overflow: 'hidden' }}>
                  {students.filter(s => !s.isPaid).slice(0, 5).map((student, i) => (
                    <motion.div key={student.id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 + i * 0.05 }}
                      style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem 1.5rem', borderBottom: '1px solid var(--panel-border-light)', cursor: 'pointer', transition: 'background 0.2s' }}
                      className="hover-light" onClick={() => setSelectedStudent(student)}>
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



          {activeTab === 'students' && (
            <motion.div key="students" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
              {/* Filters + Search for Mobile */}
              <div style={{ display: 'flex', gap: '0.6rem', marginBottom: '1rem', flexWrap: 'wrap' }}>
                {isMobile && (
                  <div style={{ width: '100%', position: 'relative', marginBottom: '0.3rem' }}>
                    <Search size={15} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--logo-green)', opacity: 0.7 }} />
                    <input type="text" placeholder="Buscar alumno..."
                      style={{ width: '100%', padding: '0.8rem 1rem 0.8rem 2.8rem', borderRadius: '1rem', background: 'var(--panel-surface)', color: 'var(--panel-text)', border: '1px solid var(--panel-border)', outline: 'none', fontWeight: 700, fontSize: '0.85rem' }}
                      value={studentSearchTerm} onChange={e => setStudentSearchTerm(e.target.value)} />
                  </div>
                )}
                <select className="glass" style={{ padding: '0.7rem 1rem', borderRadius: '1rem', background: 'var(--panel-surface)', color: 'var(--panel-text)', border: '1px solid var(--panel-border)', outline: 'none', fontWeight: 700, fontSize: isMobile ? '0.75rem' : '0.85rem', flex: isMobile ? 1 : 'none' }}
                  value={studentFilterPayment} onChange={e => setStudentFilterPayment(e.target.value as any)}>
                  <option value="ALL">Todos</option>
                  <option value="PAID">Al Día</option>
                  <option value="PENDING">Pendiente</option>
                </select>
                {isMobile && (
                  <motion.button whileTap={{ scale: 0.95 }} onClick={() => setIsAddingStudent(true)}
                    style={{ background: 'var(--logo-green)', border: 'none', borderRadius: '1rem', padding: '0.7rem 1.2rem', color: '#fff', fontWeight: 900, fontSize: '0.75rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    <Plus size={14} /> Nuevo
                  </motion.button>
                )}
                {!isMobile && (
                  <>
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
                  </>
                )}
              </div>

              {/* MOBILE: Compact student cards */}
              {isMobile ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  {students
                    .filter(s => s.name.toLowerCase().includes(studentSearchTerm.toLowerCase()))
                    .filter(s => {
                      if (studentFilterPayment === 'ALL') return true;
                      if (studentFilterPayment === 'PAID') return s.isPaid;
                      return !s.isPaid;
                    })
                    .map((student) => (
                      <motion.div key={student.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                        style={{ background: 'var(--panel-surface)', border: '1px solid var(--panel-border)', borderRadius: '1rem', padding: '0.8rem 1rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', flex: 1, minWidth: 0 }}>
                          <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: student.isPaid ? 'rgba(5,168,106,0.1)' : 'rgba(239,68,68,0.1)', border: `1px solid ${student.isPaid ? 'rgba(5,168,106,0.2)' : 'rgba(239,68,68,0.2)'}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, color: student.isPaid ? 'var(--logo-green)' : '#ef4444', fontSize: '0.85rem', flexShrink: 0 }}>
                            {student.name[0]}
                          </div>
                          <div style={{ minWidth: 0 }}>
                            <div style={{ fontWeight: 800, fontSize: '0.85rem', color: 'var(--panel-text)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{student.name}</div>
                            <div style={{ fontSize: '0.65rem', fontWeight: 700, color: student.isPaid ? 'var(--logo-green)' : '#ef4444' }}>
                              {student.isPaid ? '✅ Al día' : '⚠️ Pendiente'}
                            </div>
                          </div>
                        </div>
                        <div style={{ display: 'flex', gap: '0.4rem', flexShrink: 0 }}>
                          <motion.button whileTap={{ scale: 0.9 }}
                            onClick={() => {
                              const todayStr = new Date().toISOString().split('T')[0];
                              const alreadyPaidToday = (student.history || []).some((h: any) => h.date === todayStr);
                              if (alreadyPaidToday) {
                                alert(`⚠️ Ya se registró un pago para ${student.name} el día de hoy.`);
                                return;
                              }
                              if (window.confirm(`¿Registrar pago de ${student.name} por ${formatCLP(student.monthlyFee || 0)}?`)) {
                                handleUpdateStudent({ ...student, isPaid: true, lastPaymentDate: todayStr, lastPaymentMonth: todayStr.substring(0, 7), history: [...(student.history || []), { date: todayStr, status: 'Completado' as const, amount: student.monthlyFee || 0 }] });
                              }
                            }}
                            style={{ background: 'rgba(5,168,106,0.1)', border: 'none', width: '34px', height: '34px', borderRadius: '8px', color: 'var(--logo-green)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
                            title="Registrar pago">
                            <DollarSign size={15} />
                          </motion.button>
                          <motion.button whileTap={{ scale: 0.9 }}
                            onClick={() => window.open(`https://wa.me/${student.phone?.replace(/\D/g, '')}?text=Hola ${student.name}...`)}
                            style={{ background: 'rgba(37,211,102,0.1)', border: 'none', width: '34px', height: '34px', borderRadius: '8px', color: '#25D366', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
                            title="WhatsApp">
                            <Phone size={15} />
                          </motion.button>
                          <motion.button whileTap={{ scale: 0.9 }}
                            onClick={() => setSelectedStudent(student)}
                            style={{ background: 'none', border: '1px solid var(--panel-border)', height: '34px', paddingInline: '0.8rem', borderRadius: '8px', color: 'var(--panel-text)', fontSize: '0.65rem', fontWeight: 800, cursor: 'pointer', whiteSpace: 'nowrap' }}>
                            Detalle
                          </motion.button>
                        </div>
                      </motion.div>
                    ))}
                </div>
              ) : (
                /* DESKTOP: Full table */
                <div className="glass" style={{ borderRadius: '3.5rem', overflow: 'hidden', border: '1px solid var(--glass-border)' }}>
                  <div style={{ width: "100%", overflowX: "auto", WebkitOverflowScrolling: "touch" }}><div style={{ width: "100%", overflowX: "auto", WebkitOverflowScrolling: "touch" }}><table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
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
                          if (studentFilterPayment === 'ALL') return true;
                          if (studentFilterPayment === 'PAID') return s.isPaid;
                          if (studentFilterPayment === 'PENDING') return !s.isPaid;
                          return true;
                        })
                        .filter(s => {
                          if (studentFilterAge === 'ALL') return true;
                           const ageStr = calculateAge(s.birthDate || null);
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
                              <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                                <button onClick={() => {
                                   if(confirm(`¿Enviar recordatorio de pago a ${student.name}?`)) {
                                      handleSendPaymentReminder(student);
                                   }
                                }} style={{ background: 'rgba(5,168,106,0.1)', border: 'none', padding: '0.63rem', borderRadius: '0.8rem', color: 'var(--logo-green)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }} title="Recordatorio de Pago">
                                  <Bell size={15} />
                                </button>
                                <button onClick={() => setSelectedStudent(student)} style={{ background: 'none', border: '1px solid var(--glass-border)', padding: '0.6rem 1.2rem', borderRadius: '0.8rem', color: 'var(--text-main)', fontSize: '0.7rem', fontWeight: 800, cursor: 'pointer' }}>DETALLES</button>
                                <button onClick={() => { if (window.confirm(`¿Estás seguro de que deseas eliminar a ${student.name}?`)) handleDeleteStudent(student.id); }} style={{ background: 'rgba(239, 68, 68, 0.1)', border: 'none', padding: '0.63rem', borderRadius: '0.8rem', color: '#ef4444', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }} title="Eliminar Alumno">
                                  <Trash2 size={15} />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                    </tbody>
                  </table></div></div>
                </div>
              )}
            </motion.div>
          )}

          {activeTab === 'videos' && (
            <motion.div key="videos" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <div className="grid-layout" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '2rem' }}>
                {videos.length === 0 && (
                  <div style={{ textAlign: 'center', gridColumn: '1 / -1', padding: '5rem 2rem', color: 'var(--text-muted)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                    <div style={{ width: '80px', height: '80px', borderRadius: '50%', background: 'rgba(255,255,255,0.02)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.5rem', border: '1px solid var(--glass-border)' }}>
                      <Folder size={32} style={{ opacity: 0.4, color: 'var(--logo-green)' }} />
                    </div>
                    <h3 style={{ fontSize: '1.2rem', fontWeight: 900, color: 'var(--text-main)', marginBottom: '0.5rem' }}>Biblioteca Vacía</h3>
                    <p style={{ fontSize: '0.85rem', maxWidth: '400px', lineHeight: 1.5, opacity: 0.7 }}>Aún no has creado "Situaciones". Haz clic en el botón de arriba **"+ Nuevo Video"** para inaugurar tu primera carpeta de técnicas.</p>
                  </div>
                )}
                {Array.from(new Set(videos.map(v => v.category || 'General'))).map(category => {
                  const categoryVideos = videos.filter(v => (v.category || 'General') === category);
                  return (
                    <motion.div 
                      whileHover={{ y: -8, boxShadow: '0 20px 40px rgba(0,0,0,0.1)' }} 
                      key={category} 
                      onClick={() => setSelectedCategory(category)}
                      className="glass" 
                      style={{ padding: '2.5rem', borderRadius: '2rem', border: '1px solid var(--glass-border)', background: 'var(--panel-card)', cursor: 'pointer', display: 'flex', flexDirection: 'column', gap: '1rem', position: 'relative', overflow: 'hidden' }}>
                      
                      <div style={{ position: 'absolute', top: 0, right: 0, width: '120px', height: '120px', background: 'radial-gradient(circle, rgba(5,168,106,0.06) 0%, transparent 70%)', filter: 'blur(30px)' }} />
                      
                      <div style={{ width: '50px', height: '50px', borderRadius: '15px', background: 'rgba(5,168,106,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--logo-green)' }}>
                        <Folder size={24} />
                      </div>
                      <div>
                        <h4 style={{ fontSize: '1.4rem', fontWeight: 900, color: 'var(--text-main)', marginBottom: '0.4rem', textTransform: 'capitalize' }}>{category}</h4>
                        <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', lineHeight: 1.4 }}>Aquí verás tus videos disponibles para tus alumnos sobre {category}.</p>
                      </div>
                      <div style={{ marginTop: 'auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '1rem', borderTop: '1px solid rgba(255,255,255,0.04)' }}>
                        <span style={{ fontSize: '0.8rem', fontWeight: 800, color: 'var(--logo-green)' }}>{categoryVideos.length} Videos</span>
                        <ChevronRight size={16} style={{ opacity: 0.5 }} />
                      </div>
                    </motion.div>
                  );
                })}
              </div>

              {/* Group Modal for selected category */}
              {selectedCategory && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.7)', zIndex: 1200, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem', backdropFilter: 'blur(10px)' }}>
                  <motion.div style={{ width: '100%', maxWidth: '900px', padding: '3rem', borderRadius: '2rem', background: 'var(--panel-bg)', color: 'var(--text-main)', border: '1px solid var(--glass-border)', boxShadow: '0 40px 100px -20px rgba(0,0,0,0.5)', maxHeight: '85vh', overflowY: 'auto' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2.5rem', borderBottom: '1px solid var(--glass-border)', paddingBottom: '1.5rem' }}>
                      <div>
                        <h2 style={{ fontSize: '2rem', fontWeight: 900, textTransform: 'capitalize', color: 'var(--text-main)' }}>{selectedCategory}</h2>
                        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Videos disponibles para todos tus alumnos</p>
                      </div>
                      <button onClick={() => setSelectedCategory(null)} style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid var(--glass-border)', color: 'var(--text-main)', width: '40px', height: '40px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}><X size={18} /></button>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '1.5rem' }}>
                      {videos.filter(v => (v.category || 'General') === selectedCategory).map(video => (
                        <div key={video.id} className="glass" style={{ borderRadius: '1.5rem', overflow: 'hidden', border: '1px solid var(--glass-border)', background: 'var(--panel-card)' }}>
                          <div style={{ height: '140px', position: 'relative' }}>
                            <img src={video.thumbnail} alt={video.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                          </div>
                          <div style={{ padding: '1.2rem' }}>
                            <h4 style={{ fontSize: '1rem', fontWeight: 800, marginBottom: '0.4rem', color: 'var(--text-main)' }}>{video.title}</h4>
                            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', height: '2rem', overflow: 'hidden', textOverflow: 'ellipsis', marginBottom: '1rem' }}>{video.description}</p>
                            <div style={{ display: 'flex', gap: '0.5rem' }}>
                              <button className="btn-primary" style={{ flex: 1, padding: '0.6rem', fontSize: '0.75rem' }} onClick={() => window.open(video.url)}>VER</button>
                              <button style={{ background: 'none', border: 'none', color: '#ef4444', fontSize: '0.75rem', padding: '0.5rem', cursor: 'pointer' }} onClick={async () => {
                                if(confirm('¿Eliminar video?')) {
                                                                    await fetch(`${API_URL}/api/videos/${video.id}`, { method: 'DELETE' });
                                  setVideos(videos.filter(v => v.id !== video.id));
                                }
                              }}>Eliminar</button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                </motion.div>
              )}
            </motion.div>
          )}

          {activeTab === 'communications' && (
            <motion.div key="communications" initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }}
              style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: '2.5rem' }}>
              
              {/* Notification Editor */}
              <div className="glass" style={{ padding: '2.5rem', borderRadius: '2rem', border: '1px solid var(--glass-border)', background: 'var(--panel-card)', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <div style={{ width: '45px', height: '45px', borderRadius: '12px', background: 'rgba(167,139,250,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#a78bfa' }}>
                    <Bell size={22} />
                  </div>
                  <div>
                    <h3 style={{ fontSize: '1.2rem', fontWeight: 900, color: 'var(--text-main)' }}>Editor de Notificación</h3>
                    <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Redacta el mensaje para el portal y el email.</p>
                  </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  <label style={{ fontSize: '0.7rem', fontWeight: 800, color: 'var(--text-muted)' }}>ASUNTO DEL MENSAJE</label>
                  <input type="text" value={noticeData.subject} onChange={e => setNoticeData({ ...noticeData, subject: e.target.value })}
                    placeholder="Ej: Cambio de horario este viernes"
                    style={{ padding: '1rem', background: 'var(--panel-surface)', border: '1px solid var(--panel-border)', borderRadius: '1rem', color: 'var(--text-main)', outline: 'none', fontWeight: 700 }} />
                  
                  <label style={{ fontSize: '0.7rem', fontWeight: 800, color: 'var(--text-muted)' }}>CUERPO DEL AVISO</label>
                  <textarea rows={6} value={noticeData.message} onChange={e => setNoticeData({ ...noticeData, message: e.target.value })}
                    placeholder="Escribe aquí el contenido de la notificación..."
                    style={{ padding: '1rem', background: 'var(--panel-surface)', border: '1px solid var(--panel-border)', borderRadius: '1rem', color: 'var(--text-main)', outline: 'none', resize: 'none', fontSize: '0.9rem' }} />
                </div>

                <div style={{ padding: '1.2rem', background: 'rgba(5,168,106,0.05)', borderRadius: '1.2rem', border: '1px dashed var(--logo-green)' }}>
                  <p style={{ fontSize: '0.75rem', color: 'var(--logo-green)', fontWeight: 800, lineHeight: 1.5 }}>
                    📢 Este mensaje aparecerá exclusivamente como notificación en el portal de los alumnos (No consume créditos de email).
                  </p>
                </div>

                <button onClick={async () => {
                  if(!noticeData.subject || !noticeData.message) return alert('Por favor escribe un asunto y un mensaje.');
                  if(confirm('¿Deseas LANZAR esta notificación a todos los alumnos?')) {
                    try {
                      setIsSendingNotice(true);
                      const res = await fetch(`${API_URL}/api/admin/broadcast`, { 
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ subject: noticeData.subject, message: noticeData.message })
                      });
                      const data = await res.json();
                      alert(data.message || 'Notificación enviada');
                    } catch(e) { alert('Error en el envío'); }
                    finally { setIsSendingNotice(false); }
                  }
                }} disabled={isSendingNotice} className="btn-primary" 
                  style={{ padding: '1.4rem', borderRadius: '1.5rem', fontWeight: 900, justifyContent: 'center', background: 'linear-gradient(135deg, #a78bfa, #8b5cf6)', boxShadow: '0 10px 20px rgba(167,139,250,0.3)' }}>
                  {isSendingNotice ? 'Enviando...' : '🚀 LANZAR NOTIFICACIÓN'}
                </button>
              </div>

              {/* Birthday Greetings Panel */}
              <div className="glass" style={{ padding: '2.5rem', borderRadius: '2rem', border: '1px solid var(--glass-border)', background: 'var(--panel-card)', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <div style={{ width: '45px', height: '45px', borderRadius: '12px', background: 'rgba(5,168,106,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--logo-green)' }}>
                    <Calendar size={22} />
                  </div>
                  <div>
                    <h3 style={{ fontSize: '1.2rem', fontWeight: 900, color: 'var(--text-main)' }}>Saludos de Cumpleaños</h3>
                    <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Envía felicitaciones automáticas a quienes cumplen hoy.</p>
                  </div>
                </div>

                <div style={{ padding: '1.2rem', background: 'rgba(5,168,106,0.05)', borderRadius: '1.2rem', border: '1px dashed var(--logo-green)' }}>
                  <p style={{ fontSize: '0.75rem', color: 'var(--logo-green)', fontWeight: 800, lineHeight: 1.5 }}>
                    🎁 El sistema buscará a todos los alumnos que cumplen años hoy ({new Date().toLocaleDateString('es-CL', { day: 'numeric', month: 'long' })}) y les enviará un correo especial personalizado de Dojo Ranas.
                  </p>
                </div>

                <button 
                  onClick={handleSendBirthdayGreetings} 
                  disabled={isSendingBirthdays}
                  className="btn-primary" 
                  style={{ padding: '1.4rem', borderRadius: '1.5rem', fontWeight: 900, justifyContent: 'center', background: 'var(--logo-green)', boxShadow: '0 10px 20px rgba(5,168,106,0.2)' }}
                >
                  <motion.div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
                    {isSendingBirthdays ? 'Procesando...' : (
                      <>
                        <span style={{ fontSize: '1.2rem' }}>🎂</span> 
                        ENVIAR SALUDOS DE HOY
                      </>
                    )}
                  </motion.div>
                </button>
              </div>

              {/* Live Preview Card */}
              <div className="glass" style={{ padding: '2.5rem', borderRadius: '2rem', border: '1px solid var(--glass-border)', background: 'var(--panel-card)', display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <div style={{ width: '45px', height: '45px', borderRadius: '12px', background: 'rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)' }}>
                    <Monitor size={22} />
                  </div>
                  <div>
                    <h3 style={{ fontSize: '1.2rem', fontWeight: 900, color: 'var(--text-main)' }}>Vista Previa en Portal</h3>
                    <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Así es como lo verán los alumnos en su App.</p>
                  </div>
                </div>

                <div style={{ padding: '2rem', background: 'var(--panel-bg)', borderRadius: '2rem', border: '1px solid var(--panel-border)', minHeight: '300px', display: 'flex', flexDirection: 'column', gap: '1.5rem', position: 'relative' }}>
                   {/* Mockup Header */}
                   <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', opacity: 0.3 }}>
                      <div style={{ width: '40px', height: '40px', background: '#334155', borderRadius: '50%' }} />
                      <div style={{ width: '80px', height: '12px', background: '#334155', borderRadius: '6px' }} />
                   </div>

                   {/* Global Broadcast Notice */}
        {noticeData.subject && !isNoticeDismissed && (
          <section style={{ margin: '0 1.5rem 2rem', padding: '1.5rem', background: 'linear-gradient(135deg, #1e1b4b, #312e81)', borderRadius: '1.5rem', border: '1px solid rgba(255,255,255,0.1)', position: 'relative', overflow: 'hidden' }}>
            <button 
              onClick={() => setIsNoticeDismissed(true)}
              style={{ position: 'absolute', top: '1rem', right: '1rem', background: 'rgba(255,255,255,0.1)', border: 'none', color: '#fff', padding: '5px', borderRadius: '50%', cursor: 'pointer', zIndex: 10 }}
            >
              <X size={16} />
            </button>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', marginBottom: '0.8rem', color: '#a78bfa' }}>
              <Bell size={18} fill="#a78bfa" />
              <span style={{ fontSize: '0.7rem', fontWeight: 900, letterSpacing: '0.1em', textTransform: 'uppercase' }}>AVISO IMPORTANTE</span>
            </div>
            <h4 style={{ fontSize: '1.1rem', fontWeight: 900, color: '#fff', marginBottom: '0.6rem', lineHeight: 1.3 }}>{noticeData.subject}</h4>
            <p style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.8)', lineHeight: 1.5 }} dangerouslySetInnerHTML={{ __html: noticeData.message.replace(/\n/g, '<br>') }} />
          </section>
        )}
                   {/* The Banner Preview */}
                   <motion.div style={{ padding: '1.2rem', borderRadius: '1.2rem', background: '#f5f3ff', border: '1px solid #a78bfa', display: 'flex', flexDirection: 'column', gap: '0.4rem', boxShadow: '0 10px 30px rgba(167,139,250,0.15)', position: 'relative', overflow: 'hidden' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', color: '#7c3aed', marginBottom: '0.2rem' }}>
                        <Bell size={14} fill="#7c3aed" />
                        <span style={{ fontSize: '0.6rem', fontWeight: 900, letterSpacing: '0.15em', textTransform: 'uppercase' }}>AVISO INTEGRAL</span>
                      </div>
                      <div style={{ fontSize: '0.95rem', fontWeight: 900, color: '#1e1b4b', lineHeight: 1.2 }}>{noticeData.subject || 'Título de ejemplo'}</div>
                      <div style={{ fontSize: '0.8rem', color: '#5b21b6', lineHeight: 1.4, margin: 0 }} dangerouslySetInnerHTML={{ __html: noticeData.message ? noticeData.message.replace(/\n/g, '<br>') : 'Aquí se mostrará el cuerpo de tu mensaje redactado a la izquierda...' }} />
                    </motion.div>

                    {/* Mockup rest of portal */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', opacity: 0.2 }}>
                      <div style={{ height: '80px', background: '#334155', borderRadius: '1rem' }} />
                      <div style={{ height: '80px', background: '#334155', borderRadius: '1rem' }} />
                    </div>
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'payments' && (
            <motion.div key="payments" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}>
              <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 2fr', gap: isMobile ? '1.5rem' : '2.5rem' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
                  <div className="glass" style={{ padding: '2rem', borderRadius: '1.5rem', border: '1px solid var(--glass-border)', background: 'var(--panel-card)', position: 'relative', overflow: 'hidden' }}>
                    <div style={{ position: 'absolute', top: 0, right: 0, width: '100px', height: '100px', background: 'radial-gradient(circle, rgba(5,168,106,0.1) 0%, transparent 70%)', filter: 'blur(20px)' }} />
                    <p style={{ fontSize: '0.8rem', fontWeight: 800, color: 'var(--text-muted)', marginBottom: '0.5rem' }}>RECAUDACIÓN MES</p>
                    <p style={{ fontSize: '2rem', fontWeight: 900, color: 'var(--logo-green)' }}>{formatCLP(students.filter(s => s.isPaid).reduce((acc, curr) => acc + (Number(curr.monthlyFee) || 0), 0))}</p>
                    <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>De un total proyectado de {formatCLP(students.reduce((acc, curr) => acc + (Number(curr.monthlyFee) || 0), 0))}</p>
                  </div>

                  <div className="glass" style={{ padding: '2rem', borderRadius: '1.5rem', border: '1px solid var(--glass-border)', background: 'var(--panel-card)' }}>
                    <p style={{ fontSize: '0.8rem', fontWeight: 800, color: 'var(--text-muted)', marginBottom: '0.5rem' }}>PENDIENTE DE COBRO</p>
                    <p style={{ fontSize: '2rem', fontWeight: 900, color: '#ef4444' }}>{formatCLP(students.filter(s => !s.isPaid).reduce((acc, curr) => acc + (Number(curr.monthlyFee) || 0), 0))}</p>
                    <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Sobre {students.filter(s => !s.isPaid).length} alumnos pendientes</p>
                  </div>
                </div>

                <div className="glass" style={{ borderRadius: '1.5rem', border: '1px solid var(--glass-border)', overflow: 'hidden', background: 'var(--panel-card)', padding: '1.5rem' }}>
                  <h3 style={{ fontSize: '1.1rem', fontWeight: 900, marginBottom: '1.5rem', color: 'var(--text-main)' }}>Lista de Deudores</h3>
                  <div style={{ width: "100%", overflowX: "auto", WebkitOverflowScrolling: "touch" }}>
                    <div style={{ width: "100%", overflowX: "auto", WebkitOverflowScrolling: "touch" }}><table style={{ width: '100%', borderCollapse: 'collapse' }}>
                      <thead>
                        <tr style={{ borderBottom: '1px solid var(--panel-border)', opacity: 0.6 }}>
                          <th style={{ padding: '1rem', textAlign: 'left', fontSize: '0.75rem', fontWeight: 800 }}>ALUMNO</th>
                          <th style={{ padding: '1rem', textAlign: 'left', fontSize: '0.75rem', fontWeight: 800 }}>CUOTA</th>
                          <th style={{ padding: '1rem', textAlign: 'center', fontSize: '0.75rem', fontWeight: 800 }}>ACCIÓN</th>
                        </tr>
                      </thead>
                      <tbody>
                        {students.filter(s => !s.isPaid).map(s => (
                          <tr key={s.id} style={{ borderBottom: '1px solid var(--glass-border)' }}>
                            <td style={{ padding: '1rem', fontWeight: 700, color: 'var(--text-main)', fontSize: '0.85rem' }}>{s.name}</td>
                            <td style={{ padding: '1rem', fontWeight: 600, color: 'var(--text-muted)', fontSize: '0.85rem' }}>{formatCLP(s.monthlyFee || 0)}</td>
                            <td style={{ padding: '1rem', textAlign: 'center' }}>
                              <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', justifyContent: 'center' }}>
                                <input 
                                  type="date" 
                                  defaultValue={new Date().toISOString().split('T')[0]}
                                  onChange={(e) => setManualPaymentDates(prev => ({ ...prev, [s.id]: e.target.value }))}
                                  style={{ padding: '0.4rem', borderRadius: '6px', border: '1px solid var(--glass-border)', fontSize: '0.7rem', background: 'transparent', color: 'var(--text-main)', outline: 'none' }}
                                />
                                <button onClick={() => {
                                  const customDate = manualPaymentDates[s.id];
                                  handleManualPayment(s.id, customDate);
                                  alert(`Pago registrado el ${customDate || 'hoy'} para ${s.name}`);
                                }} style={{ background: 'rgba(5,168,106,0.1)', border: 'none', color: 'var(--logo-green)', padding: '0.5rem 0.8rem', borderRadius: '8px', fontSize: '0.7rem', fontWeight: 800, cursor: 'pointer' }}>Registrar</button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table></div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'website' && (
            <motion.div key="website" initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'minmax(350px, 1fr) 2fr', gap: '2.5rem' }}>
              {/* Manage Hero Videos */}
              <div className="glass" style={{ padding: '2.5rem', borderRadius: '2.5rem', background: 'var(--panel-card)', border: '1px solid var(--panel-border)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                  <h3 style={{ fontSize: '1.2rem', fontWeight: 900 }}>Hero Videos <br/><span style={{ fontSize: '0.7rem', opacity: 0.5 }}>(Slider Principal)</span></h3>
                  <button className="btn-primary" style={{ padding: '0.5rem 1rem', fontSize: '0.7rem' }} onClick={() => {
                    const input = document.createElement('input');
                    input.type = 'file';
                    input.accept = 'video/mp4';
                    input.onchange = async (e: any) => {
                      const file = e.target.files[0];
                      if (!file) return;
                      
                      try {
                        const response = await fetch(`${API_URL}/api/upload`, {
                          method: 'POST',
                          headers: { 'X-Filename': file.name },
                          body: file
                        });
                        if (response.ok) {
                          const data = await response.json();
                          const url = `${API_URL}${data.url}`;
                          const updated = [...liveHeroVideos, url];
                          setLiveHeroVideos(updated);
                          syncWebsite('hero-videos', updated);
                        } else {
                          alert('Error al subir el archivo');
                        }
                      } catch (error) {
                        console.error('Error uploading:', error);
                      }
                    };
                    input.click();
                  }}><Plus size={14}/> Añadir</button>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  {liveHeroVideos.map((url, i) => (
                    <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '1rem', background: 'rgba(255,255,255,0.03)', padding: '1rem', borderRadius: '1.2rem', border: '1px solid var(--panel-border)' }}>
                      <div style={{ width: '60px', height: '40px', background: '#000', borderRadius: '0.6rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Play size={14} /></div>
                      <div style={{ flex: 1, fontSize: '0.75rem', color: 'var(--panel-muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{url.split('/').pop()}</div>
                      <button style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', padding: '0.5rem' }} onClick={() => {
                        const updated = liveHeroVideos.filter((_, idx) => idx !== i);
                        setLiveHeroVideos(updated);
                        syncWebsite('hero-videos', updated);
                      }}><X size={16} /></button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Manage News */}
              <div className="glass" style={{ padding: '2.5rem', borderRadius: '2.5rem', background: 'var(--panel-card)', border: '1px solid var(--panel-border)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                  <h3 style={{ fontSize: '1.2rem', fontWeight: 900 }}>Noticias <br/><span style={{ fontSize: '0.7rem', opacity: 0.5 }}>(Slider Diario)</span></h3>
                  <button className="btn-primary" style={{ padding: '0.5rem 1rem', fontSize: '0.7rem' }} onClick={() => {
                    setNewNewsData({
                      title: '', 
                      body: '', 
                      img: '', 
                      link: '#', 
                      label: 'Noticias del Dojo', 
                      date: new Date().toLocaleDateString('es-CL', { day: 'numeric', month: 'short', year: 'numeric' }),
                      stats: [{ label: 'Evento', text: '' }]
                    });
                    setIsAddingNews(true);
                  }}><Plus size={14}/> Nueva Noticia</button>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.5rem' }}>
                  {liveNews.map((news, i) => (
                    <div key={i} style={{ display: 'flex', gap: '1.2rem', background: 'rgba(255,255,255,0.03)', padding: '1.2rem', borderRadius: '1.5rem', border: '1px solid var(--panel-border)', position: 'relative' }}>
                      <img src={news.img} style={{ width: '80px', height: '60px', objectFit: 'cover', borderRadius: '0.8rem' }} />
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: '0.85rem', fontWeight: 800, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', marginBottom: '0.3rem' }}>{news.title}</div>
                        <div style={{ fontSize: '0.7rem', color: 'var(--panel-muted)' }}>{news.date}</div>
                        <div style={{ fontSize: '0.65rem', color: 'var(--logo-green)', fontWeight: 900, marginTop: '0.4rem' }}>{news.label}</div>
                      </div>
                      <button style={{ position: 'absolute', top: '0.8rem', right: '0.8rem', background: 'rgba(239,68,68,0.1)', border: 'none', color: '#ef4444', cursor: 'pointer', padding: '0.4rem', borderRadius: '0.5rem' }} onClick={() => {
                        const updated = liveNews.filter((_, idx) => idx !== i);
                        setLiveNews(updated);
                        syncWebsite('news', updated);
                      }}><X size={14} /></button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Manage Gallery */}
              <div className="glass" style={{ gridColumn: 'span 2', padding: '2.5rem', borderRadius: '2.5rem', background: 'var(--panel-card)', border: '1px solid var(--panel-border)', marginTop: '2rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                  <h3 style={{ fontSize: '1.2rem', fontWeight: 900 }}>Galería de Fotos <br/><span style={{ fontSize: '0.7rem', opacity: 0.5 }}>(Mosaico de Inicio)</span></h3>
                  <button className="btn-primary" style={{ padding: '0.5rem 1.2rem', fontSize: '0.7rem', background: 'var(--logo-green)' }} onClick={() => {
                    setNewGalleryData({ img: '', size: 'small' });
                    setIsAddingGallery(true);
                  }}><Plus size={14}/> Nueva Foto</button>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '1.5rem' }}>
                  {liveGallery.map((photo, i) => (
                    <div key={i} style={{ position: 'relative', borderRadius: '1.5rem', overflow: 'hidden', border: '1px solid var(--panel-border)', height: '180px' }}>
                      <img src={photo.img} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      <div style={{ position: 'absolute', top: '0.5rem', right: '0.5rem', display: 'flex', gap: '0.4rem' }}>
                        <div style={{ background: 'rgba(0,0,0,0.6)', color: '#fff', padding: '0.3rem 0.6rem', borderRadius: '0.6rem', fontSize: '0.6rem', fontWeight: 900, textTransform: 'uppercase' }}>{photo.size}</div>
                        <button style={{ background: '#ef4444', border: 'none', color: '#fff', cursor: 'pointer', padding: '0.4rem', borderRadius: '0.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }} onClick={() => {
                          const updated = liveGallery.filter((_, idx) => idx !== i);
                          setLiveGallery(updated);
                          syncWebsite('gallery', updated);
                        }}><X size={14} /></button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'settings' && (
            <motion.div key="settings" initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.98 }} className="grid-layout" style={{ gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: '3rem' }}>
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
                  <button className="btn-primary" style={{ width: '100%', background: '#111', color: '#fff', border: '1px solid #333', justifyContent: 'center', padding: '1.2rem', borderRadius: '2rem' }} onClick={() => handleSendCredentialsByEmail('ALL')}>SOLO ENVIAR CREDENCIALES POR EMAIL (SIN NOTIFICACIÓN)</button>
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
              <motion.div className="glass" style={{ width: '100%', maxWidth: '600px', padding: isMobile ? '2rem' : '4rem', borderRadius: isMobile ? '2rem' : '3rem', border: '1px solid var(--glass-border)', background: 'var(--panel-surface)' }}>
                <h2 style={{ marginBottom: '2rem', color: 'var(--panel-text)' }}>Comunicado Masivo</h2>
                <input className="glass" style={{ width: '100%', padding: '1.2rem', marginBottom: '1.5rem', background: 'var(--panel-bg)', color: 'var(--panel-text)', border: '1px solid var(--panel-border)' }} placeholder="Asunto del correo" value={noticeData.subject} onChange={e => setNoticeData({ ...noticeData, subject: e.target.value })} />
                <textarea className="glass" style={{ width: '100%', height: '200px', padding: '1.5rem', resize: 'none', background: 'var(--panel-bg)', color: 'var(--panel-text)', border: '1px solid var(--panel-border)' }} placeholder="Mensaje para todos los alumnos..." value={noticeData.message} onChange={e => setNoticeData({ ...noticeData, message: e.target.value })} />
                <div style={{ display: 'flex', gap: '1rem', marginTop: '2rem', flexDirection: isMobile ? 'column' : 'row' }}>
                  <button onClick={() => setIsSendingNotice(false)} style={{ flex: 1, background: 'none', border: '1px solid var(--glass-border)', padding: '1.2rem', borderRadius: '1rem', color: 'var(--text-main)', cursor: 'pointer' }}>CANCELAR</button>
                  <button className="btn-primary" style={{ flex: 2, justifyContent: 'center', background: 'var(--logo-green)', padding: '1.2rem', borderRadius: '1rem' }} onClick={handleSendMassNotice}>ENVIAR A TODOS</button>
                </div>
              </motion.div>
            </motion.div>
          )
        }

        {
          selectedStudent && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(15,23,42,0.15)', zIndex: 1100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: isMobile ? '0.5rem' : '2rem', backdropFilter: 'blur(12px)' }}
              onClick={() => setSelectedStudent(null)}>
              <motion.div style={{ width: '100%', maxWidth: '750px', maxHeight: isMobile ? '95vh' : '90vh', overflowY: 'auto', padding: isMobile ? '1.5rem' : '2.5rem', borderRadius: isMobile ? '1.5rem' : '3rem', background: '#fff', border: '1px solid var(--panel-border)', boxShadow: '0 40px 100px -20px rgba(0,0,0,0.15)', position: 'relative' }}
                onClick={e => e.stopPropagation()}>
                {/* Decorative Background Element */}
                <div style={{ position: 'absolute', top: '-10%', right: '-10%', width: '300px', height: '300px', background: 'var(--logo-green-soft)', borderRadius: '50%', filter: 'blur(60px)', zIndex: 0 }} />

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', position: 'relative', zIndex: 1, flexWrap: 'wrap', gap: '1.5rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', flex: 1, minWidth: isMobile ? '100%' : '300px' }}>
                    <div style={{ position: 'relative' }}>
                      <div style={{ width: '100px', height: '100px', borderRadius: '2.5rem', overflow: 'hidden', background: 'var(--panel-surface)', border: '2px solid var(--panel-border)', boxShadow: '0 20px 40px rgba(0,0,0,0.05)' }}>
                        <img
                          src={selectedStudent.avatar || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(selectedStudent.name)}&backgroundColor=05a86a&fontFamily=Arial,sans-serif&fontWeight=900&fontSize=40`}
                          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                        />
                      </div>
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
                  <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
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

                <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: '1rem', marginBottom: '1rem', position: 'relative', zIndex: 1 }}>
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

                <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: '1rem', marginBottom: '1rem', position: 'relative', zIndex: 1 }}>
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
                <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: '1rem', marginBottom: '1.5rem', position: 'relative', zIndex: 1 }}>
                  <div style={{ padding: '1.2rem', borderRadius: '1.5rem', background: 'var(--panel-surface)', border: '1px solid var(--panel-border)', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', justifyContent: 'center' }}>
                    <p style={{ color: 'var(--logo-green)', fontSize: '0.6rem', fontWeight: 900, marginBottom: '0.8rem', letterSpacing: '0.15em' }}>PLAN ACTUAL</p>
                    {isEditingStudent ? (
                      <select style={{ width: '100%', background: '#fff', border: '1px solid var(--panel-border)', borderRadius: '0.5rem', padding: '0.5rem', fontWeight: 900, fontSize: '1rem', textAlign: 'center' }}
                        value={editedStudent?.plan || '3'}
                        onChange={e => {
                          const val = e.target.value;
                           const age = calculateAge(editedStudent?.birthDate || null) as any;
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
                      <div style={{ width: "100%", overflowX: "auto", WebkitOverflowScrolling: "touch" }}><div style={{ width: "100%", overflowX: "auto", WebkitOverflowScrolling: "touch" }}><table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
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
                      </table></div></div>
                    ) : (
                      <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--panel-muted)', fontSize: '0.85rem', fontWeight: 600 }}>
                        No hay pagos registrados aún en el sistema. Al sincronizar con Mercado Pago aparecerán aquí.
                      </div>
                    )}
                  </div>
                </div>

                {role === 'admin' && (
                  <motion.button whileHover={{ y: -3, boxShadow: '0 10px 25px rgba(34,197,94,0.2)' }} whileTap={{ scale: 0.98 }}
                    style={{ background: '#22c55e', color: '#fff', border: 'none', padding: '1.2rem', borderRadius: '1rem', fontWeight: 900, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.8rem', width: '100%', marginBottom: '1.2rem', position: 'relative', zIndex: 1 }}
                    onClick={() => {
                       if (!window.confirm(`¿Registrar pago manual de ${selectedStudent.name} por ${formatCLP(selectedStudent.monthlyFee || 0)}?`)) return;
                       const updated = { 
                           ...selectedStudent, 
                           isPaid: true, 
                           lastPaymentDate: new Date().toISOString().split('T')[0],
                           lastPaymentMonth: new Date().toISOString().substring(0, 7),
                           history: [
                               ...(selectedStudent.history || []),
                               { date: new Date().toISOString().split('T')[0], status: 'Completado' as "Completado" | "Pendiente", amount: selectedStudent.monthlyFee || 0, method: 'Manual/Transferencia' }
                           ]
                       };
                       handleUpdateStudent(updated);
                    }}>
                    <DollarSign size={18} /> REGISTRAR PAGO MANUAL (EFECTIVO / TRANSFERENCIA)
                  </motion.button>
                )}

                <div style={{ display: 'flex', gap: '1rem', position: 'relative', zIndex: 1 }}>
                    {!selectedStudent.isPaid && (
                      <motion.button whileHover={{ y: -4, boxShadow: '0 15px 30px rgba(0,157,255,0.2)' }} whileTap={{ scale: 0.98 }}
                        style={{ flex: 1, background: '#009EE3', color: '#fff', border: 'none', padding: '1.2rem', borderRadius: '1rem', fontWeight: 900, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.8rem' }}
                        onClick={() => handleCreatePaymentLink(selectedStudent)}>
                        <CreditCard size={18} /> PAGAR CON MERCADO PAGO
                      </motion.button>
                    )}
                    <motion.button whileHover={{ y: -4, boxShadow: '0 15px 30px rgba(37, 211, 102, 0.2)' }} whileTap={{ scale: 0.98 }}
                      style={{ flex: 1, background: '#25D366', color: '#fff', border: 'none', padding: '1.2rem', borderRadius: '1rem', fontWeight: 900, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.8rem' }}
                      onClick={() => window.open(`https://wa.me/${selectedStudent.phone.replace(/\D/g, '')}?text=Hola ${selectedStudent.name}...`)}>
                      CONTACTAR POR WHATSAPP
                    </motion.button>
                    <motion.button whileHover={{ y: -4, boxShadow: '0 15px 30px rgba(0,0,0,0.1)' }} whileTap={{ scale: 0.98 }}
                      style={{ flex: 1, background: 'var(--panel-text)', color: '#fff', border: 'none', padding: '1.2rem', borderRadius: '1rem', fontWeight: 900, cursor: 'pointer' }}
                      onClick={() => handleSendPaymentReminder(selectedStudent)}>
                      ENVIAR RECORDATORIO EMAIL
                    </motion.button>
                  </div>
              </motion.div>
            </motion.div>
          )
        }

        {
          isAddingVideo && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(15,23,42,0.15)', zIndex: 1100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem', backdropFilter: 'blur(12px)' }}>
              <motion.div style={{ width: '100%', maxWidth: '700px', padding: '4rem', borderRadius: '3rem', background: '#fff', border: '1px solid var(--panel-border)', boxShadow: '0 40px 100px -20px rgba(0,0,0,0.1)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2.5rem' }}>
                  <h2 style={{ fontSize: '2rem', fontWeight: 900, color: 'var(--panel-text)' }}>Nuevo <span style={{ color: 'var(--logo-green)' }}>Contenido</span></h2>
                  <button onClick={() => setIsAddingVideo(false)} style={{ background: 'var(--panel-surface)', border: '1px solid var(--panel-border)', color: '#000', width: '40px', height: '40px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}><X size={18} /></button>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
                  <div style={{ gridColumn: 'span 2' }}>
                    <input className="glass" style={{ width: '100%', padding: '1.2rem' }} placeholder="Título" value={newVideoData.title} onChange={e => setNewVideoData({ ...newVideoData, title: e.target.value })} />
                  </div>
                  <div style={{ gridColumn: 'span 2' }}>
                    <input className="glass" style={{ width: '100%', padding: '1.2rem' }} placeholder="URL Video" value={newVideoData.url} onChange={e => setNewVideoData({ ...newVideoData, url: e.target.value })} />
                  </div>
                  
                  <input className="glass" style={{ padding: '1.2rem' }} placeholder="Categoría (Ej: Agarre, Guardia)" value={newVideoData.category} onChange={e => setNewVideoData({ ...newVideoData, category: e.target.value })} />
                  <button className="btn-primary" style={{ gridColumn: 'span 2', marginTop: '2rem' }} onClick={handleAddVideo}>PUBLICAR TÉCNICA</button>
                </div>
              </motion.div>
            </motion.div>
          )
        }

        {
          isAddingNews && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.6)', zIndex: 1100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem', backdropFilter: 'blur(10px)' }}>
              <motion.div style={{ width: '100%', maxWidth: '500px', padding: '3.5rem', borderRadius: '3rem', background: '#fff', color: '#111', border: '1px solid rgba(0,0,0,0.1)', boxShadow: '0 40px 100px -20px rgba(0,0,0,0.2)', maxHeight: '90vh', overflowY: 'auto' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2.5rem' }}>
                  <h2 style={{ fontSize: '2.2rem', fontWeight: 900, letterSpacing: '-1px', color: '#111' }}>Crear <span style={{ color: 'var(--logo-green)' }}>Noticia</span></h2>
                  <button onClick={() => setIsAddingNews(false)} style={{ background: 'var(--panel-surface)', border: '1px solid var(--panel-border)', color: '#111', width: '40px', height: '40px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}><X size={18} /></button>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
                  {newNewsData.img && (
                    <div style={{ width: '100%', height: '150px', borderRadius: '1.5rem', overflow: 'hidden', border: '2px solid var(--logo-green)', marginBottom: '0.5rem' }}>
                      <img src={newNewsData.img} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt="Preview" onError={(e) => (e.currentTarget.src = 'https://images.unsplash.com/photo-1552072047-54d19335391c?w=800')} />
                    </div>
                  )}
                  <div>
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 800, fontSize: '0.7rem', color: '#64748b' }}>TÍTULO DE LA NOTICIA</label>
                    <input style={{ width: '100%', padding: '1.2rem', borderRadius: '1rem', border: '1px solid #e2e8f0', background: '#f8fafc', color: '#111', fontWeight: 700, fontSize: '1rem', outline: 'none' }} placeholder="Escribe el titular principal..." value={newNewsData.title} onChange={e => setNewNewsData({ ...newNewsData, title: e.target.value })} />
                  </div>
                  <div>
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 800, fontSize: '0.7rem', color: '#64748b' }}>IMAGEN DE LA NOTICIA (Link o subir archivo)</label>
                    <div style={{ display: 'flex', gap: '0.8rem' }}>
                      <input style={{ flex: 1, padding: '1.2rem', borderRadius: '1rem', border: '1px solid #e2e8f0', background: '#f8fafc', color: '#111', fontWeight: 700, fontSize: '1rem', outline: 'none' }} placeholder="https://..." value={newNewsData.img} onChange={e => setNewNewsData({ ...newNewsData, img: e.target.value })} />
                      <label style={{ background: 'var(--logo-green)', color: '#fff', padding: '0 1.5rem', borderRadius: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', fontWeight: 900, transition: 'all 0.2s' }} className="hover-lift">
                        <Camera size={20} />
                        <input type="file" accept="image/*" style={{ display: 'none' }} onChange={e => handleGenericImageUpload(e, (b64) => setNewNewsData({ ...newNewsData, img: b64 }))} />
                      </label>
                    </div>
                  </div>
                  <div>
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 800, fontSize: '0.7rem', color: '#64748b' }}>CUERPO / RESUMEN DE LA NOTICIA</label>
                    <textarea style={{ width: '100%', padding: '1.2rem', borderRadius: '1rem', border: '1px solid #e2e8f0', background: '#f8fafc', color: '#111', fontWeight: 600, fontSize: '0.9rem', outline: 'none', minHeight: '100px', resize: 'none' }} placeholder="Escribe el contenido de la noticia aquí..." value={newNewsData.body} onChange={e => setNewNewsData({ ...newNewsData, body: e.target.value })} />
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                    <div>
                      <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 800, fontSize: '0.7rem', color: '#64748b' }}>ETIQUETA (CATEGORÍA)</label>
                      <input style={{ width: '100%', padding: '1.2rem', borderRadius: '1rem', border: '1px solid #e2e8f0', background: '#f8fafc', color: '#111', fontWeight: 700, fontSize: '0.9rem', outline: 'none' }} placeholder="Ej: Noticias del Dojo" value={newNewsData.label} onChange={e => setNewNewsData({ ...newNewsData, label: e.target.value })} />
                    </div>
                    <div>
                      <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 800, fontSize: '0.7rem', color: '#64748b' }}>FECHA DE PUBLICACIÓN</label>
                      <input style={{ width: '100%', padding: '1.2rem', borderRadius: '1rem', border: '1px solid #e2e8f0', background: '#f8fafc', color: '#111', fontWeight: 700, fontSize: '0.9rem', outline: 'none' }} placeholder="Ej: 11 Mar, 2026" value={newNewsData.date} onChange={e => setNewNewsData({ ...newNewsData, date: e.target.value })} />
                    </div>
                  </div>
                  <div>
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 800, fontSize: '0.7rem', color: '#64748b' }}>LINK A ARTÍCULO COMPLETO (OPCIONAL)</label>
                    <input style={{ width: '100%', padding: '1.2rem', borderRadius: '1rem', border: '1px solid #e2e8f0', background: '#f8fafc', color: '#111', fontWeight: 700, fontSize: '0.9rem', outline: 'none' }} placeholder="https://..." value={newNewsData.link} onChange={e => setNewNewsData({ ...newNewsData, link: e.target.value })} />
                  </div>
                  <button className="btn-primary" style={{ marginTop: '1rem', width: '100%', justifyContent: 'center', padding: '1.5rem', borderRadius: '2rem', background: 'var(--logo-green)', color: '#fff', fontWeight: 900, fontSize: '1rem', letterSpacing: '0.05em' }} onClick={() => {
                    if (newNewsData.title && newNewsData.body && newNewsData.img) {
                      const updated = [newNewsData, ...liveNews];
                      setLiveNews(updated);
                      syncWebsite('news', updated);
                      setIsAddingNews(false);
                    } else {
                      alert('Por favor, completa al menos el título, imagen y cuerpo.');
                    }
                  }}>PUBLICAR NOTICIA EN EL SLIDER</button>
                </div>
              </motion.div>
            </motion.div>
          )
        }

        {
          isAddingGallery && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.6)', zIndex: 1100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem', backdropFilter: 'blur(10px)' }}>
              <motion.div style={{ width: '100%', maxWidth: '450px', padding: '3.5rem', borderRadius: '3rem', background: '#fff', color: '#111', border: '1px solid rgba(0,0,0,0.1)', boxShadow: '0 40px 100px -20px rgba(0,0,0,0.2)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2.5rem' }}>
                  <h2 style={{ fontSize: '2.2rem', fontWeight: 900, letterSpacing: '-1px', color: '#111' }}>Añadir a <span style={{ color: 'var(--logo-green)' }}>Galería</span></h2>
                  <button onClick={() => setIsAddingGallery(false)} style={{ background: 'var(--panel-surface)', border: '1px solid var(--panel-border)', color: '#111', width: '40px', height: '40px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}><X size={18} /></button>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                  {newGalleryData.img && (
                    <div style={{ width: '100%', height: '200px', borderRadius: '1.5rem', overflow: 'hidden', border: '2px solid var(--logo-green)' }}>
                      <img src={newGalleryData.img} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    </div>
                  )}
                  <div>
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 800, fontSize: '0.7rem', color: '#64748b' }}>IMAGEN (Link o subir archivo)</label>
                    <div style={{ display: 'flex', gap: '0.8rem' }}>
                      <input style={{ flex: 1, padding: '1.2rem', borderRadius: '1rem', border: '1px solid #e2e8f0', background: '#f8fafc', color: '#111', fontWeight: 700, fontSize: '1rem', outline: 'none' }} placeholder="https://..." value={newGalleryData.img} onChange={e => setNewGalleryData({ ...newGalleryData, img: e.target.value })} />
                      <label style={{ background: 'var(--logo-green)', color: '#fff', padding: '0 1.5rem', borderRadius: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', fontWeight: 900 }} className="hover-lift">
                        <Camera size={20} />
                        <input type="file" accept="image/*" style={{ display: 'none' }} onChange={e => handleGenericImageUpload(e, (b64) => setNewGalleryData({ ...newGalleryData, img: b64 }))} />
                      </label>
                    </div>
                  </div>
                  <div>
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 800, fontSize: '0.7rem', color: '#64748b' }}>TAMAÑO EN EL MOSAICO</label>
                    <select style={{ width: '100%', padding: '1.2rem', borderRadius: '1rem', border: '1px solid #e2e8f0', background: '#fff', color: '#111', fontWeight: 900, fontSize: '1rem', outline: 'none', cursor: 'pointer' }} value={newGalleryData.size} onChange={e => setNewGalleryData({ ...newGalleryData, size: e.target.value as any })}>
                      <option value="small">Pequeño (1x1)</option>
                      <option value="wide">Ancho (2x1)</option>
                      <option value="tall">Alto (1x2)</option>
                      <option value="large">Grande (2x2)</option>
                    </select>
                  </div>
                  <button className="btn-primary" style={{ marginTop: '1rem', width: '100%', justifyContent: 'center', padding: '1.5rem', borderRadius: '2rem', background: 'var(--logo-green)', color: '#fff', fontWeight: 900 }} onClick={() => {
                    if (newGalleryData.img) {
                      const updated = [newGalleryData, ...liveGallery];
                      setLiveGallery(updated);
                      syncWebsite('gallery', updated);
                      setIsAddingGallery(false);
                    } else {
                      alert('Por favor, selecciona una imagen.');
                    }
                  }}>AGREGAR A GALERÍA</button>
                </div>
              </motion.div>
            </motion.div>
          )
        }
        
      </AnimatePresence>
    </div>
  );
};

export default App;

// --- SUBSYSTEM: Waiver / Terms Modal ---
const AcceptTermsModal: React.FC<{ student: Student, onAccept: () => void }> = ({ student, onAccept }) => {
  const [accepted, setAccepted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hasScrolledToBottom, setHasScrolledToBottom] = useState(false);
  const termsRef = useRef<HTMLDivElement>(null);

  // Comprobar si no necesita scroll inicial (textos cortos)
  useEffect(() => {
    if (termsRef.current) {
      if (termsRef.current.scrollHeight <= termsRef.current.clientHeight + 10) {
        setHasScrolledToBottom(true);
      }
    }
  }, []);

  const handleScroll = () => {
    if (termsRef.current) {
      const { scrollTop, scrollHeight, clientHeight } = termsRef.current;
      // 10px de margen de error al scrollear
      if (scrollTop + clientHeight >= scrollHeight - 10) {
        setHasScrolledToBottom(true);
      }
    }
  };

  const handleConfirm = async () => {
    if (!accepted || !hasScrolledToBottom) return;
    setIsSubmitting(true);
    try {
      const res = await fetch(`${API_URL}/api/students/${student.id}/accept-terms`, { method: 'POST' });
      if (res.ok) {
        onAccept();
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ position: 'fixed', inset: 0, zIndex: 9999, background: 'rgba(0,0,0,0.92)', backdropFilter: 'blur(15px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1.5rem' }}>
      <motion.div initial={{ y: 50, opacity: 0 }} animate={{ y: 0, opacity: 1 }} style={{ width: '100%', maxWidth: '550px', background: '#fff', borderRadius: '2.5rem', overflow: 'hidden', boxShadow: '0 50px 100px rgba(0,0,0,0.5)', display: 'flex', flexDirection: 'column', maxHeight: '90vh' }}>
        <div style={{ padding: '1.5rem 1.5rem 1rem', textAlign: 'center' }}>
          <h2 style={{ fontSize: '1.4rem', fontWeight: 900, color: '#111', letterSpacing: '-0.5px', marginBottom: '0.5rem' }}>Aviso Importante</h2>
          <p style={{ color: '#64748b', fontSize: '0.85rem', lineHeight: 1.4, margin: 0 }}>Hola <strong>{student.name}</strong>, para ingresar al portal es necesario que leas y aceptes la liberación de responsabilidad.</p>
        </div>
        
        <div 
          ref={termsRef}
          onScroll={handleScroll}
          style={{ flex: 1, overflowY: 'auto', padding: '0 1.5rem', margin: '0' }}
        >
          <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '1.2rem', padding: '1rem', fontSize: '0.75rem', color: '#334155', lineHeight: 1.5, whiteSpace: 'pre-line' }}>
            <h4 style={{ textAlign: 'center', margin: '0 0 1rem 0', fontWeight: 900 }}>LIBERACIÓN DE RESPONSABILIDAD</h4>
            {`CLUB DEPORTIVO SOCIAL Y CULTURAL RANAS JIU JITSU

            A través de este documento acepto y libero de toda responsabilidad al Club Deportivo Social y Cultural Ranas Jiu Jitsu, a sus representantes, asociados, recinto que albergue actividades y/o sponsors del club y/o cualquier evento, de responsabilidad ante accidentes que generen lesiones y/o enfermedades, como resultado de mi participación como deportista o espectador en los entrenamientos, competencias y actividades propias de la organización.
            Por lo cual libero totalmente al Club Deportivo Social y Cultural Ranas Jiu Jitsu, de ser declarado responsable por lesiones que sucedan durante la práctica de la actividad deportiva o como espectador.

            Declaro que:
            1. He leído y acepto las condiciones de participación del Club Deportivo Social y Cultural Ranas Jiu Jitsu también su reglamento y circular de financiamiento.
            2. Entiendo que la participación incluye riesgo de lesiones físicas.
            3. Estoy en conocimiento de alguna condición médica previamente informada en la anamnesis que limite la participación de las actividades del Club Deportivo Social y Cultural Ranas Jiu Jitsu.
            4. Poseo cobertura médica para estas actividades.
            5. Entiendo como apoderado, tutor o participante que en el caso de que exista algún accidente o lesión el Club Deportivo Social y Cultural Ranas Jiu Jitsu y sus representantes proveerán los primeros auxilios básicos, derivando al centro asistencial señalado previamente en la anamnesis, informando al tutor o familiar.
            6. Acepto que el Club Deportivo Social y Cultural Ranas Jiu Jitsu haga uso de fotografías, video o cualquier otra forma de broadcast, para efectos de promoción nacional e internacional.
            7. A través de mi firma en este documento acepto toda responsabilidad de mis acciones en relación con mi participación del Club Deportivo Social y Cultural Ranas Jiu Jitsu.
            8. Acepto la responsabilidad por mis posesiones y equipo deportivo durante los entrenamientos.
            9. A través de este documento libero de toda responsabilidad Club Deportivo Social y Cultural Ranas Jiu Jitsu y a sus representantes, voluntarios, sponsors, directores, miembros, empleados, agentes y administradores de toda compensación o prosecución relacionada a las actividades del club de las cuales pueda resultar lesionado y/o accidentado.
            10. Libero de toda responsabilidad, posible persecución y responsabilidad económica o demandas de compensación a los organizadores por pérdida de posesiones personales o equipamiento deportivo.`}
          </div>
        </div>

        <div style={{ padding: '1rem 1.5rem 1.5rem' }}>
          <label style={{ display: 'flex', gap: '0.8rem', alignItems: 'flex-start', cursor: hasScrolledToBottom ? 'pointer' : 'not-allowed', marginBottom: '1rem', opacity: hasScrolledToBottom ? 1 : 0.5 }}>
            <input type="checkbox" disabled={!hasScrolledToBottom} checked={accepted} onChange={e => setAccepted(e.target.checked)} style={{ width: '18px', height: '18px', marginTop: '2px', accentColor: 'var(--logo-green)' }} />
            <span style={{ fontSize: '0.8rem', color: '#111', fontWeight: 600 }}>He leído y entiendo a cabalidad este documento y sus términos de responsabilidad.</span>
          </label>
          <button onClick={handleConfirm} disabled={!accepted || !hasScrolledToBottom || isSubmitting} style={{ width: '100%', padding: '1rem', borderRadius: '1rem', border: 'none', background: (accepted && hasScrolledToBottom) ? 'var(--logo-green)' : '#cbd5e1', color: '#fff', fontWeight: 900, fontSize: '0.9rem', cursor: (accepted && hasScrolledToBottom) ? 'pointer' : 'not-allowed', transition: 'all 0.3s' }}>
            {isSubmitting ? 'Guardando...' : 'ACEPTAR Y ENTRAR AL PORTAL'}
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
};

