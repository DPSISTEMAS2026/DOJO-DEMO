export type Belt = 'WHITE' | 'BLUE' | 'PURPLE' | 'BROWN' | 'BLACK' | 'GRAY';
export type UserRole = 'guest' | 'admin' | 'superadmin' | 'student';
export type ViewMode = 'landing' | 'auth' | 'app';

export interface Video {
    id: string;
    title: string;
    description: string;
    url: string;
    thumbnail: string;
    targetAudience: 'ADULTS' | 'KIDS' | 'BOTH';
    category: string;
}

export interface PaymentRecord {
    date: string;
    status: 'Completado' | 'Pendiente';
    amount: number;
}

export interface Student {
    id: string;
    name: string;
    email: string;
    phone: string;
    birthDate?: string;
    documentId?: string;
    belt: Belt;
    classesAttended: number;
    classesToNextBelt: number;
    lastPaymentMonth: string;
    isPaid: boolean;
    history: PaymentRecord[];
    tutorName?: string;
    tutorEmail?: string;
    tutorPhone?: string;
    plan?: string;
    monthlyFee?: number;
    joinDate?: string;
    lastGrade?: string;
    graduationDate?: string;
    lastPaymentDate?: string;
    avatar?: string;
    password?: string;
    scheduledClasses?: {
        day: string;
        time: string;
        name: string;
        timestamp: number;
    }[];
    weight?: number;
    gender?: 'MALE' | 'FEMALE';
    terms_accepted?: boolean;
    sedeId?: number;
    sede_id?: number;
}

export type PlanFees = {
    adults: { [classesPerWeek: string]: number };
    kids: { [classesPerWeek: string]: number };
};

export interface AutomationConfig {
    reminderDay: number;
    whatsappTemplate: string;
    emailTemplate: string;
}
