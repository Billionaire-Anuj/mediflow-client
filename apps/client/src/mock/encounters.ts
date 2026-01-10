export interface Encounter {
    id: string;
    appointmentId: string;
    patientId: string;
    patientName: string;
    doctorId: string;
    doctorName: string;
    dateTime: string;
    chiefComplaint: string;
    notes: string;
    diagnosis: string;
    treatmentPlan: string;
    followUp?: string;
    vitals?: {
        bloodPressure: string;
        heartRate: number;
        temperature: number;
        weight: number;
        height: number;
    };
    createdAt: string;
}

export const mockEncounters: Encounter[] = [
    {
        id: "enc-1",
        appointmentId: "apt-3",
        patientId: "patient-1",
        patientName: "John Miller",
        doctorId: "doctor-2",
        doctorName: "Dr. Michael Chen",
        dateTime: "2024-12-20T10:30:00Z",
        chiefComplaint: "Recurring headaches for the past 2 weeks",
        notes: "Patient reports tension-type headaches, primarily in the afternoon. No visual disturbances, nausea, or photophobia. Sleep pattern irregular due to work stress.",
        diagnosis: "Tension-type headache (G44.2)",
        treatmentPlan:
            "Prescribed ibuprofen 400mg as needed. Recommended stress management techniques and regular sleep schedule. Advised to maintain headache diary.",
        followUp: "Return in 4 weeks if symptoms persist",
        vitals: {
            bloodPressure: "128/82",
            heartRate: 72,
            temperature: 98.4,
            weight: 180,
            height: 72
        },
        createdAt: "2024-12-20T11:15:00Z"
    },
    {
        id: "enc-2",
        appointmentId: "apt-9",
        patientId: "patient-1",
        patientName: "John Miller",
        doctorId: "doctor-6",
        doctorName: "Dr. Robert Kim",
        dateTime: "2024-11-15T09:30:00Z",
        chiefComplaint: "Annual physical examination",
        notes: "Routine annual physical. Patient reports feeling generally well. No major complaints. Exercise 3 times weekly. Diet could be improved.",
        diagnosis: "Annual wellness visit (Z00.00)",
        treatmentPlan:
            "Continue current lifestyle. Increase vegetable intake. Recommended flu vaccination. Ordered routine blood work.",
        vitals: {
            bloodPressure: "124/78",
            heartRate: 68,
            temperature: 98.2,
            weight: 178,
            height: 72
        },
        createdAt: "2024-11-15T10:00:00Z"
    },
    {
        id: "enc-3",
        appointmentId: "apt-10",
        patientId: "patient-1",
        patientName: "John Miller",
        doctorId: "doctor-9",
        doctorName: "Dr. Jennifer Lee",
        dateTime: "2024-10-20T11:30:00Z",
        chiefComplaint: "Follow-up for thyroid function",
        notes: "Patient on levothyroxine 50mcg daily. Reports improved energy levels. No palpitations or weight changes.",
        diagnosis: "Hypothyroidism, well-controlled (E03.9)",
        treatmentPlan: "Continue current medication. Recheck TSH in 3 months.",
        followUp: "TSH recheck in January 2025",
        vitals: {
            bloodPressure: "120/76",
            heartRate: 74,
            temperature: 98.6,
            weight: 176,
            height: 72
        },
        createdAt: "2024-10-20T12:00:00Z"
    }
];
