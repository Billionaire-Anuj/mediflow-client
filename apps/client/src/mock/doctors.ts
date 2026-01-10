export interface DoctorSchedule {
    day: string;
    startTime: string;
    endTime: string;
    slotDuration: number;
}

export interface Doctor {
    id: string;
    name: string;
    email: string;
    specialty: string;
    department: string;
    avatar?: string;
    bio: string;
    education: string;
    experience: number;
    rating: number;
    reviewCount: number;
    schedule: DoctorSchedule[];
    nextAvailable?: string;
    consultationFee: number;
    status: "available" | "busy" | "offline";
}

export const mockDoctors: Doctor[] = [
    {
        id: "doctor-1",
        name: "Dr. Sarah Wilson",
        email: "sarah.wilson@mediflow.com",
        specialty: "Interventional Cardiology",
        department: "Cardiology",
        bio: "Board-certified cardiologist with expertise in minimally invasive cardiac procedures.",
        education: "MD, Johns Hopkins University",
        experience: 15,
        rating: 4.9,
        reviewCount: 287,
        consultationFee: 150,
        status: "available",
        nextAvailable: "2024-12-31T09:00:00Z",
        schedule: [
            { day: "Monday", startTime: "09:00", endTime: "17:00", slotDuration: 30 },
            { day: "Tuesday", startTime: "09:00", endTime: "17:00", slotDuration: 30 },
            { day: "Wednesday", startTime: "09:00", endTime: "13:00", slotDuration: 30 },
            { day: "Thursday", startTime: "09:00", endTime: "17:00", slotDuration: 30 },
            { day: "Friday", startTime: "09:00", endTime: "15:00", slotDuration: 30 }
        ]
    },
    {
        id: "doctor-2",
        name: "Dr. Michael Chen",
        email: "michael.chen@mediflow.com",
        specialty: "Neurophysiology",
        department: "Neurology",
        bio: "Specializing in complex neurological disorders and advanced diagnostics.",
        education: "MD, Stanford University",
        experience: 12,
        rating: 4.8,
        reviewCount: 203,
        consultationFee: 175,
        status: "available",
        nextAvailable: "2024-12-31T10:30:00Z",
        schedule: [
            { day: "Monday", startTime: "10:00", endTime: "18:00", slotDuration: 45 },
            { day: "Wednesday", startTime: "10:00", endTime: "18:00", slotDuration: 45 },
            { day: "Friday", startTime: "10:00", endTime: "16:00", slotDuration: 45 }
        ]
    },
    {
        id: "doctor-3",
        name: "Dr. Emily Roberts",
        email: "emily.roberts@mediflow.com",
        specialty: "Pediatric Medicine",
        department: "Pediatrics",
        bio: "Compassionate pediatrician dedicated to child health and development.",
        education: "MD, Harvard Medical School",
        experience: 10,
        rating: 4.9,
        reviewCount: 412,
        consultationFee: 120,
        status: "available",
        nextAvailable: "2024-12-31T11:00:00Z",
        schedule: [
            { day: "Monday", startTime: "08:00", endTime: "16:00", slotDuration: 20 },
            { day: "Tuesday", startTime: "08:00", endTime: "16:00", slotDuration: 20 },
            { day: "Thursday", startTime: "08:00", endTime: "16:00", slotDuration: 20 },
            { day: "Friday", startTime: "08:00", endTime: "14:00", slotDuration: 20 }
        ]
    },
    {
        id: "doctor-4",
        name: "Dr. James Anderson",
        email: "james.anderson@mediflow.com",
        specialty: "Orthopedic Surgery",
        department: "Orthopedics",
        bio: "Expert in joint replacement and sports injury rehabilitation.",
        education: "MD, UCLA School of Medicine",
        experience: 18,
        rating: 4.7,
        reviewCount: 156,
        consultationFee: 200,
        status: "busy",
        nextAvailable: "2025-01-02T09:00:00Z",
        schedule: [
            { day: "Tuesday", startTime: "09:00", endTime: "17:00", slotDuration: 30 },
            { day: "Thursday", startTime: "09:00", endTime: "17:00", slotDuration: 30 }
        ]
    },
    {
        id: "doctor-5",
        name: "Dr. Lisa Martinez",
        email: "lisa.martinez@mediflow.com",
        specialty: "Dermatology",
        department: "Dermatology",
        bio: "Specialized in cosmetic and medical dermatology treatments.",
        education: "MD, Yale School of Medicine",
        experience: 8,
        rating: 4.8,
        reviewCount: 298,
        consultationFee: 140,
        status: "available",
        nextAvailable: "2024-12-31T14:00:00Z",
        schedule: [
            { day: "Monday", startTime: "10:00", endTime: "18:00", slotDuration: 30 },
            { day: "Wednesday", startTime: "10:00", endTime: "18:00", slotDuration: 30 },
            { day: "Friday", startTime: "10:00", endTime: "16:00", slotDuration: 30 }
        ]
    },
    {
        id: "doctor-6",
        name: "Dr. Robert Kim",
        email: "robert.kim@mediflow.com",
        specialty: "Internal Medicine",
        department: "Internal Medicine",
        bio: "Comprehensive primary care with focus on preventive medicine.",
        education: "MD, Columbia University",
        experience: 14,
        rating: 4.6,
        reviewCount: 189,
        consultationFee: 100,
        status: "available",
        nextAvailable: "2024-12-31T09:30:00Z",
        schedule: [
            { day: "Monday", startTime: "08:00", endTime: "17:00", slotDuration: 30 },
            { day: "Tuesday", startTime: "08:00", endTime: "17:00", slotDuration: 30 },
            { day: "Wednesday", startTime: "08:00", endTime: "17:00", slotDuration: 30 },
            { day: "Thursday", startTime: "08:00", endTime: "17:00", slotDuration: 30 },
            { day: "Friday", startTime: "08:00", endTime: "12:00", slotDuration: 30 }
        ]
    },
    {
        id: "doctor-7",
        name: "Dr. Amanda Foster",
        email: "amanda.foster@mediflow.com",
        specialty: "Psychiatry",
        department: "Mental Health",
        bio: "Expert in anxiety, depression, and cognitive behavioral therapy.",
        education: "MD, Duke University",
        experience: 11,
        rating: 4.9,
        reviewCount: 167,
        consultationFee: 180,
        status: "available",
        nextAvailable: "2024-12-31T15:00:00Z",
        schedule: [
            { day: "Tuesday", startTime: "09:00", endTime: "17:00", slotDuration: 60 },
            { day: "Thursday", startTime: "09:00", endTime: "17:00", slotDuration: 60 }
        ]
    },
    {
        id: "doctor-8",
        name: "Dr. William Turner",
        email: "william.turner@mediflow.com",
        specialty: "Gastroenterology",
        department: "Gastroenterology",
        bio: "Specialized in digestive disorders and endoscopic procedures.",
        education: "MD, University of Pennsylvania",
        experience: 16,
        rating: 4.7,
        reviewCount: 134,
        consultationFee: 160,
        status: "offline",
        nextAvailable: "2025-01-06T09:00:00Z",
        schedule: [
            { day: "Monday", startTime: "09:00", endTime: "16:00", slotDuration: 30 },
            { day: "Wednesday", startTime: "09:00", endTime: "16:00", slotDuration: 30 }
        ]
    },
    {
        id: "doctor-9",
        name: "Dr. Jennifer Lee",
        email: "jennifer.lee@mediflow.com",
        specialty: "Endocrinology",
        department: "Endocrinology",
        bio: "Expert in diabetes management and thyroid disorders.",
        education: "MD, University of Chicago",
        experience: 9,
        rating: 4.8,
        reviewCount: 221,
        consultationFee: 145,
        status: "available",
        nextAvailable: "2024-12-31T11:30:00Z",
        schedule: [
            { day: "Monday", startTime: "08:30", endTime: "16:30", slotDuration: 30 },
            { day: "Tuesday", startTime: "08:30", endTime: "16:30", slotDuration: 30 },
            { day: "Thursday", startTime: "08:30", endTime: "16:30", slotDuration: 30 }
        ]
    },
    {
        id: "doctor-10",
        name: "Dr. Christopher Moore",
        email: "christopher.moore@mediflow.com",
        specialty: "Pulmonology",
        department: "Pulmonology",
        bio: "Specializing in respiratory diseases and sleep medicine.",
        education: "MD, Northwestern University",
        experience: 13,
        rating: 4.6,
        reviewCount: 178,
        consultationFee: 155,
        status: "available",
        nextAvailable: "2024-12-31T10:00:00Z",
        schedule: [
            { day: "Tuesday", startTime: "09:00", endTime: "17:00", slotDuration: 30 },
            { day: "Wednesday", startTime: "09:00", endTime: "17:00", slotDuration: 30 },
            { day: "Friday", startTime: "09:00", endTime: "15:00", slotDuration: 30 }
        ]
    }
];

export const departments = [
    "Cardiology",
    "Neurology",
    "Pediatrics",
    "Orthopedics",
    "Dermatology",
    "Internal Medicine",
    "Mental Health",
    "Gastroenterology",
    "Endocrinology",
    "Pulmonology",
    "Oncology",
    "Ophthalmology",
    "ENT",
    "Urology"
];

export const specialties = [
    "Interventional Cardiology",
    "Neurophysiology",
    "Pediatric Medicine",
    "Orthopedic Surgery",
    "Dermatology",
    "Internal Medicine",
    "Psychiatry",
    "Gastroenterology",
    "Endocrinology",
    "Pulmonology",
    "General Surgery",
    "Sports Medicine"
];
