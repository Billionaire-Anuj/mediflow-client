export type LabRequestStatus = "requested" | "in-progress" | "completed" | "cancelled";
export type LabPriority = "routine" | "urgent" | "stat";

export interface LabTest {
    id: string;
    name: string;
    category: string;
}

export interface LabResult {
    testId: string;
    testName: string;
    value: string;
    unit: string;
    referenceRange: string;
    flag?: "normal" | "low" | "high" | "critical";
    remarks?: string;
}

export interface LabRequest {
    id: string;
    encounterId?: string;
    patientId: string;
    patientName: string;
    doctorId: string;
    doctorName: string;
    tests: LabTest[];
    priority: LabPriority;
    status: LabRequestStatus;
    clinicalNotes?: string;
    results?: LabResult[];
    resultNotes?: string;
    processedBy?: string;
    processedAt?: string;
    createdAt: string;
}

export const availableLabTests: LabTest[] = [
    { id: "test-1", name: "Complete Blood Count (CBC)", category: "Hematology" },
    { id: "test-2", name: "Basic Metabolic Panel (BMP)", category: "Chemistry" },
    { id: "test-3", name: "Comprehensive Metabolic Panel (CMP)", category: "Chemistry" },
    { id: "test-4", name: "Lipid Panel", category: "Chemistry" },
    { id: "test-5", name: "Thyroid Stimulating Hormone (TSH)", category: "Endocrine" },
    { id: "test-6", name: "Hemoglobin A1c", category: "Diabetes" },
    { id: "test-7", name: "Urinalysis", category: "Urinalysis" },
    { id: "test-8", name: "Liver Function Tests (LFT)", category: "Chemistry" },
    { id: "test-9", name: "Coagulation Panel", category: "Hematology" },
    { id: "test-10", name: "Cardiac Enzymes", category: "Cardiology" },
    { id: "test-11", name: "Blood Culture", category: "Microbiology" },
    { id: "test-12", name: "Vitamin D, 25-Hydroxy", category: "Vitamins" }
];

export const mockLabRequests: LabRequest[] = [
    {
        id: "lab-1",
        encounterId: "enc-2",
        patientId: "patient-1",
        patientName: "John Miller",
        doctorId: "doctor-6",
        doctorName: "Dr. Robert Kim",
        tests: [
            { id: "test-1", name: "Complete Blood Count (CBC)", category: "Hematology" },
            { id: "test-3", name: "Comprehensive Metabolic Panel (CMP)", category: "Chemistry" },
            { id: "test-4", name: "Lipid Panel", category: "Chemistry" }
        ],
        priority: "routine",
        status: "completed",
        clinicalNotes: "Annual screening labs",
        results: [
            {
                testId: "test-1",
                testName: "WBC",
                value: "7.2",
                unit: "K/uL",
                referenceRange: "4.5-11.0",
                flag: "normal"
            },
            {
                testId: "test-1",
                testName: "RBC",
                value: "4.8",
                unit: "M/uL",
                referenceRange: "4.5-5.5",
                flag: "normal"
            },
            {
                testId: "test-1",
                testName: "Hemoglobin",
                value: "14.5",
                unit: "g/dL",
                referenceRange: "13.5-17.5",
                flag: "normal"
            },
            {
                testId: "test-3",
                testName: "Glucose",
                value: "102",
                unit: "mg/dL",
                referenceRange: "70-100",
                flag: "high",
                remarks: "Slightly elevated"
            },
            { testId: "test-3", testName: "BUN", value: "15", unit: "mg/dL", referenceRange: "7-20", flag: "normal" },
            {
                testId: "test-3",
                testName: "Creatinine",
                value: "0.9",
                unit: "mg/dL",
                referenceRange: "0.7-1.3",
                flag: "normal"
            },
            {
                testId: "test-4",
                testName: "Total Cholesterol",
                value: "210",
                unit: "mg/dL",
                referenceRange: "<200",
                flag: "high"
            },
            { testId: "test-4", testName: "LDL", value: "130", unit: "mg/dL", referenceRange: "<100", flag: "high" },
            { testId: "test-4", testName: "HDL", value: "55", unit: "mg/dL", referenceRange: ">40", flag: "normal" },
            {
                testId: "test-4",
                testName: "Triglycerides",
                value: "125",
                unit: "mg/dL",
                referenceRange: "<150",
                flag: "normal"
            }
        ],
        resultNotes: "Lipid panel shows borderline high cholesterol. Recommend lifestyle modifications.",
        processedBy: "Emma Rodriguez",
        processedAt: "2024-11-16T09:30:00Z",
        createdAt: "2024-11-15T10:00:00Z"
    },
    {
        id: "lab-2",
        encounterId: "enc-3",
        patientId: "patient-1",
        patientName: "John Miller",
        doctorId: "doctor-9",
        doctorName: "Dr. Jennifer Lee",
        tests: [{ id: "test-5", name: "Thyroid Stimulating Hormone (TSH)", category: "Endocrine" }],
        priority: "routine",
        status: "completed",
        clinicalNotes: "Follow-up TSH for hypothyroidism on levothyroxine",
        results: [
            {
                testId: "test-5",
                testName: "TSH",
                value: "2.4",
                unit: "mIU/L",
                referenceRange: "0.4-4.0",
                flag: "normal"
            }
        ],
        resultNotes: "TSH within normal range. Thyroid well-controlled on current medication.",
        processedBy: "Emma Rodriguez",
        processedAt: "2024-10-21T08:00:00Z",
        createdAt: "2024-10-20T12:30:00Z"
    },
    {
        id: "lab-3",
        patientId: "patient-2",
        patientName: "Emily Johnson",
        doctorId: "doctor-1",
        doctorName: "Dr. Sarah Wilson",
        tests: [
            { id: "test-10", name: "Cardiac Enzymes", category: "Cardiology" },
            { id: "test-1", name: "Complete Blood Count (CBC)", category: "Hematology" }
        ],
        priority: "urgent",
        status: "in-progress",
        clinicalNotes: "Chest pain evaluation",
        createdAt: "2024-12-30T14:00:00Z"
    },
    {
        id: "lab-4",
        patientId: "patient-3",
        patientName: "Robert Davis",
        doctorId: "doctor-6",
        doctorName: "Dr. Robert Kim",
        tests: [
            { id: "test-2", name: "Basic Metabolic Panel (BMP)", category: "Chemistry" },
            { id: "test-7", name: "Urinalysis", category: "Urinalysis" }
        ],
        priority: "routine",
        status: "requested",
        clinicalNotes: "New hypertension workup",
        createdAt: "2024-12-30T10:00:00Z"
    },
    {
        id: "lab-5",
        patientId: "patient-4",
        patientName: "Maria Garcia",
        doctorId: "doctor-5",
        doctorName: "Dr. Lisa Martinez",
        tests: [{ id: "test-1", name: "Complete Blood Count (CBC)", category: "Hematology" }],
        priority: "routine",
        status: "requested",
        clinicalNotes: "Rule out allergic reaction",
        createdAt: "2024-12-30T11:45:00Z"
    }
];
