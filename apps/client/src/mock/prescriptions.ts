export type PrescriptionStatus = "created" | "pending" | "partially-dispensed" | "dispensed" | "cancelled";

export interface PrescriptionItem {
    id: string;
    medicineName: string;
    dosage: string;
    frequency: string;
    duration: string;
    quantity: number;
    instructions?: string;
    dispensed?: boolean;
}

export interface Prescription {
    id: string;
    encounterId?: string;
    patientId: string;
    patientName: string;
    doctorId: string;
    doctorName: string;
    items: PrescriptionItem[];
    status: PrescriptionStatus;
    pharmacyNotes?: string;
    dispensedBy?: string;
    dispensedAt?: string;
    createdAt: string;
}

export const mockPrescriptions: Prescription[] = [
    {
        id: "rx-1",
        encounterId: "enc-1",
        patientId: "patient-1",
        patientName: "John Miller",
        doctorId: "doctor-2",
        doctorName: "Dr. Michael Chen",
        items: [
            {
                id: "item-1",
                medicineName: "Ibuprofen",
                dosage: "400mg",
                frequency: "As needed",
                duration: "2 weeks",
                quantity: 20,
                instructions: "Take with food. Do not exceed 3 tablets in 24 hours.",
                dispensed: true
            },
            {
                id: "item-2",
                medicineName: "Acetaminophen",
                dosage: "500mg",
                frequency: "Every 6 hours as needed",
                duration: "2 weeks",
                quantity: 30,
                instructions: "Can be alternated with ibuprofen.",
                dispensed: true
            }
        ],
        status: "dispensed",
        pharmacyNotes: "Dispensed complete prescription",
        dispensedBy: "David Thompson",
        dispensedAt: "2024-12-20T14:30:00Z",
        createdAt: "2024-12-20T11:20:00Z"
    },
    {
        id: "rx-2",
        encounterId: "enc-3",
        patientId: "patient-1",
        patientName: "John Miller",
        doctorId: "doctor-9",
        doctorName: "Dr. Jennifer Lee",
        items: [
            {
                id: "item-3",
                medicineName: "Levothyroxine",
                dosage: "50mcg",
                frequency: "Once daily",
                duration: "90 days",
                quantity: 90,
                instructions: "Take on empty stomach, 30-60 minutes before breakfast.",
                dispensed: true
            }
        ],
        status: "dispensed",
        pharmacyNotes: "90-day supply",
        dispensedBy: "David Thompson",
        dispensedAt: "2024-10-20T15:00:00Z",
        createdAt: "2024-10-20T12:15:00Z"
    },
    {
        id: "rx-3",
        patientId: "patient-2",
        patientName: "Emily Johnson",
        doctorId: "doctor-1",
        doctorName: "Dr. Sarah Wilson",
        items: [
            {
                id: "item-4",
                medicineName: "Metoprolol",
                dosage: "25mg",
                frequency: "Twice daily",
                duration: "30 days",
                quantity: 60,
                instructions: "Take with or without food.",
                dispensed: false
            },
            {
                id: "item-5",
                medicineName: "Aspirin",
                dosage: "81mg",
                frequency: "Once daily",
                duration: "30 days",
                quantity: 30,
                instructions: "Take with food.",
                dispensed: true
            }
        ],
        status: "partially-dispensed",
        pharmacyNotes: "Metoprolol out of stock, expected tomorrow",
        createdAt: "2024-12-28T10:00:00Z"
    },
    {
        id: "rx-4",
        patientId: "patient-3",
        patientName: "Robert Davis",
        doctorId: "doctor-6",
        doctorName: "Dr. Robert Kim",
        items: [
            {
                id: "item-6",
                medicineName: "Lisinopril",
                dosage: "10mg",
                frequency: "Once daily",
                duration: "30 days",
                quantity: 30,
                instructions: "Take at the same time each day.",
                dispensed: false
            }
        ],
        status: "pending",
        createdAt: "2024-12-30T09:00:00Z"
    },
    {
        id: "rx-5",
        patientId: "patient-4",
        patientName: "Maria Garcia",
        doctorId: "doctor-5",
        doctorName: "Dr. Lisa Martinez",
        items: [
            {
                id: "item-7",
                medicineName: "Hydrocortisone Cream",
                dosage: "1%",
                frequency: "Apply twice daily",
                duration: "2 weeks",
                quantity: 1,
                instructions: "Apply thin layer to affected area.",
                dispensed: false
            },
            {
                id: "item-8",
                medicineName: "Cetirizine",
                dosage: "10mg",
                frequency: "Once daily",
                duration: "30 days",
                quantity: 30,
                instructions: "Take at bedtime if drowsy.",
                dispensed: false
            }
        ],
        status: "pending",
        createdAt: "2024-12-30T11:30:00Z"
    }
];
