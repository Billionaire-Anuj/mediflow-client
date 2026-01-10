export type AppointmentStatus = "booked" | "completed" | "cancelled" | "no-show";

export interface Appointment {
    id: string;
    patientId: string;
    patientName: string;
    doctorId: string;
    doctorName: string;
    department: string;
    dateTime: string;
    duration: number;
    status: AppointmentStatus;
    type: "consultation" | "follow-up" | "procedure";
    notes?: string;
    cancellationReason?: string;
    createdAt: string;
}

export const mockAppointments: Appointment[] = [
    {
        id: "apt-1",
        patientId: "patient-1",
        patientName: "John Miller",
        doctorId: "doctor-1",
        doctorName: "Dr. Sarah Wilson",
        department: "Cardiology",
        dateTime: "2024-12-31T09:00:00Z",
        duration: 30,
        status: "booked",
        type: "consultation",
        notes: "Regular cardiac check-up",
        createdAt: "2024-12-28T10:00:00Z"
    },
    {
        id: "apt-2",
        patientId: "patient-1",
        patientName: "John Miller",
        doctorId: "doctor-3",
        doctorName: "Dr. Emily Roberts",
        department: "Pediatrics",
        dateTime: "2025-01-02T11:00:00Z",
        duration: 20,
        status: "booked",
        type: "follow-up",
        createdAt: "2024-12-27T14:00:00Z"
    },
    {
        id: "apt-3",
        patientId: "patient-1",
        patientName: "John Miller",
        doctorId: "doctor-2",
        doctorName: "Dr. Michael Chen",
        department: "Neurology",
        dateTime: "2024-12-20T10:30:00Z",
        duration: 45,
        status: "completed",
        type: "consultation",
        notes: "Headache evaluation completed",
        createdAt: "2024-12-15T09:00:00Z"
    },
    {
        id: "apt-4",
        patientId: "patient-1",
        patientName: "John Miller",
        doctorId: "doctor-5",
        doctorName: "Dr. Lisa Martinez",
        department: "Dermatology",
        dateTime: "2024-12-18T14:00:00Z",
        duration: 30,
        status: "cancelled",
        type: "consultation",
        cancellationReason: "Schedule conflict",
        createdAt: "2024-12-10T11:00:00Z"
    },
    {
        id: "apt-5",
        patientId: "patient-2",
        patientName: "Emily Johnson",
        doctorId: "doctor-1",
        doctorName: "Dr. Sarah Wilson",
        department: "Cardiology",
        dateTime: "2024-12-31T09:30:00Z",
        duration: 30,
        status: "booked",
        type: "follow-up",
        createdAt: "2024-12-25T10:00:00Z"
    },
    {
        id: "apt-6",
        patientId: "patient-3",
        patientName: "Robert Davis",
        doctorId: "doctor-1",
        doctorName: "Dr. Sarah Wilson",
        department: "Cardiology",
        dateTime: "2024-12-31T10:00:00Z",
        duration: 30,
        status: "booked",
        type: "consultation",
        createdAt: "2024-12-26T15:00:00Z"
    },
    {
        id: "apt-7",
        patientId: "patient-4",
        patientName: "Maria Garcia",
        doctorId: "doctor-1",
        doctorName: "Dr. Sarah Wilson",
        department: "Cardiology",
        dateTime: "2024-12-31T10:30:00Z",
        duration: 30,
        status: "booked",
        type: "procedure",
        notes: "ECG and cardiac stress test",
        createdAt: "2024-12-24T09:00:00Z"
    },
    {
        id: "apt-8",
        patientId: "patient-5",
        patientName: "James Wilson",
        doctorId: "doctor-1",
        doctorName: "Dr. Sarah Wilson",
        department: "Cardiology",
        dateTime: "2024-12-31T11:00:00Z",
        duration: 30,
        status: "booked",
        type: "consultation",
        createdAt: "2024-12-28T16:00:00Z"
    },
    {
        id: "apt-9",
        patientId: "patient-1",
        patientName: "John Miller",
        doctorId: "doctor-6",
        doctorName: "Dr. Robert Kim",
        department: "Internal Medicine",
        dateTime: "2024-11-15T09:30:00Z",
        duration: 30,
        status: "completed",
        type: "consultation",
        createdAt: "2024-11-10T10:00:00Z"
    },
    {
        id: "apt-10",
        patientId: "patient-1",
        patientName: "John Miller",
        doctorId: "doctor-9",
        doctorName: "Dr. Jennifer Lee",
        department: "Endocrinology",
        dateTime: "2024-10-20T11:30:00Z",
        duration: 30,
        status: "completed",
        type: "follow-up",
        createdAt: "2024-10-15T14:00:00Z"
    }
];
