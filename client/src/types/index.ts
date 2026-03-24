export type Belt = 'WHITE' | 'BLUE' | 'PURPLE' | 'BROWN' | 'BLACK' | 'GRAY';
export type UserRole = 'guest' | 'admin' | 'student';
export type ViewMode = 'landing' | 'auth' | 'app';

export interface Video {
    id: string;
    title: string;
    description: string;
    url: string;
    thumbnail: string;
    beltLevel: Belt;
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
    lastPaymentDate?: string;
    avatar?: string;
    password?: string;
    scheduledClasses?: {
        day: string;
        time: string;
        name: string;
        timestamp: number;
    }[];
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
