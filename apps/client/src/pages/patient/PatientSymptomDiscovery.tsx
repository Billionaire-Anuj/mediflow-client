import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useMutation } from "@tanstack/react-query";
import { DoctorRecommendationService, type DoctorRecommendationResultDto } from "@mediflow/mediflow-api";
import { PageHeader } from "@/components/ui/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Activity, ArrowRight, Sparkles, Stethoscope, Thermometer, Waves } from "lucide-react";
import { toast } from "sonner";
import { getErrorMessage, getResponseMessage } from "@/lib/api";

const symptomOptions = [
    "Chest pain",
    "Shortness of breath",
    "Palpitations",
    "Headache",
    "Dizziness",
    "Numbness",
    "Weakness",
    "Seizure",
    "Rash",
    "Itching",
    "Skin lesion",
    "Acne",
    "Anxiety",
    "Depression",
    "Insomnia",
    "Panic",
    "Abdominal pain",
    "Nausea",
    "Vomiting",
    "Diarrhea",
    "Constipation",
    "Heartburn",
    "Bloating",
    "Jaundice",
    "Excessive thirst",
    "Frequent urination",
    "Weight loss",
    "Weight gain",
    "Fatigue",
    "Joint pain",
    "Back pain",
    "Neck pain",
    "Knee pain",
    "Fracture",
    "Stiffness",
    "Fever",
    "Cough",
    "Sore throat",
    "Sneezing",
    "Wheezing",
    "Runny nose",
    "Hives",
    "Burning urination",
    "Blood in urine",
    "Flank pain",
    "Hair loss",
    "Fainting",
    "Leg swelling"
];

type AssessmentFormState = {
    ageYears: string;
    systolicBloodPressure: string;
    diastolicBloodPressure: string;
    temperatureCelsius: string;
    heartRateBpm: string;
    respiratoryRatePerMinute: string;
    oxygenSaturationPercent: string;
    bloodSugarMgDl: string;
    symptoms: string[];
};

const initialAssessmentForm: AssessmentFormState = {
    ageYears: "",
    systolicBloodPressure: "",
    diastolicBloodPressure: "",
    temperatureCelsius: "",
    heartRateBpm: "",
    respiratoryRatePerMinute: "",
    oxygenSaturationPercent: "",
    bloodSugarMgDl: "",
    symptoms: []
};

function parseOptionalNumber(value: string) {
    if (!value.trim()) return undefined;
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : undefined;
}

export default function PatientSymptomDiscovery() {
    const navigate = useNavigate();
    const [assessmentForm, setAssessmentForm] = useState<AssessmentFormState>(initialAssessmentForm);
    const [recommendationResult, setRecommendationResult] = useState<DoctorRecommendationResultDto | null>(null);

    const recommendationMutation = useMutation({
        mutationFn: async () =>
            DoctorRecommendationService.getDoctorRecommendationsFromAssessment({
                requestBody: {
                    ageYears: parseOptionalNumber(assessmentForm.ageYears),
                    systolicBloodPressure: parseOptionalNumber(assessmentForm.systolicBloodPressure),
                    diastolicBloodPressure: parseOptionalNumber(assessmentForm.diastolicBloodPressure),
                    temperatureCelsius: parseOptionalNumber(assessmentForm.temperatureCelsius),
                    heartRateBpm: parseOptionalNumber(assessmentForm.heartRateBpm),
                    respiratoryRatePerMinute: parseOptionalNumber(assessmentForm.respiratoryRatePerMinute),
                    oxygenSaturationPercent: parseOptionalNumber(assessmentForm.oxygenSaturationPercent),
                    bloodSugarMgDl: parseOptionalNumber(assessmentForm.bloodSugarMgDl),
                    symptoms: assessmentForm.symptoms,
                    limit: 6
                }
            }),
        onSuccess: (response) => {
            toast.success(getResponseMessage(response));
            setRecommendationResult(response.result ?? null);
        },
        onError: (error) => toast.error(getErrorMessage(error))
    });

    const hasClinicalInput =
        assessmentForm.symptoms.length > 0 ||
        [
            assessmentForm.ageYears,
            assessmentForm.systolicBloodPressure,
            assessmentForm.diastolicBloodPressure,
            assessmentForm.temperatureCelsius,
            assessmentForm.heartRateBpm,
            assessmentForm.respiratoryRatePerMinute,
            assessmentForm.oxygenSaturationPercent,
            assessmentForm.bloodSugarMgDl
        ].some((value) => value.trim().length > 0);

    return (
        <div className="space-y-6 animate-fade-in">
            <PageHeader
                title="Symptom Discovery"
                description="Use clinical details and symptom selection to discover which specialty fits best."
            />

            <Card className="overflow-hidden border-emerald-100 shadow-sm">
                <CardHeader className="border-b border-emerald-100 bg-[linear-gradient(135deg,_rgba(236,253,245,0.92),_rgba(240,253,250,0.96),_rgba(255,255,255,1))]">
                    <CardTitle className="flex items-center gap-2 text-base">
                        <Sparkles className="h-4 w-4 text-primary" />
                        Specialty Discovery
                    </CardTitle>
                    <CardDescription>
                        We use the vitals and symptoms below to recommend the most relevant doctor specialty. Then you
                        can jump straight into your filtered doctor list.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6 p-6">
                    <div className="grid gap-6 xl:grid-cols-[1.1fr_1.2fr]">
                        <div className="space-y-4">
                            <div className="flex items-center gap-2 text-sm font-medium text-foreground">
                                <Activity className="h-4 w-4 text-primary" />
                                Clinical Measurements
                            </div>
                            <div className="grid gap-4 sm:grid-cols-2">
                                <Input
                                    type="number"
                                    placeholder="Age in years"
                                    value={assessmentForm.ageYears}
                                    onChange={(event) =>
                                        setAssessmentForm((current) => ({ ...current, ageYears: event.target.value }))
                                    }
                                    className="sm:col-span-2"
                                />
                                <Input
                                    type="number"
                                    placeholder="Systolic BP (e.g. 120)"
                                    value={assessmentForm.systolicBloodPressure}
                                    onChange={(event) =>
                                        setAssessmentForm((current) => ({
                                            ...current,
                                            systolicBloodPressure: event.target.value
                                        }))
                                    }
                                />
                                <Input
                                    type="number"
                                    placeholder="Diastolic BP (e.g. 80)"
                                    value={assessmentForm.diastolicBloodPressure}
                                    onChange={(event) =>
                                        setAssessmentForm((current) => ({
                                            ...current,
                                            diastolicBloodPressure: event.target.value
                                        }))
                                    }
                                />
                                <Input
                                    type="number"
                                    step="0.1"
                                    placeholder="Temperature in C"
                                    value={assessmentForm.temperatureCelsius}
                                    onChange={(event) =>
                                        setAssessmentForm((current) => ({
                                            ...current,
                                            temperatureCelsius: event.target.value
                                        }))
                                    }
                                />
                                <Input
                                    type="number"
                                    placeholder="Heart rate (bpm)"
                                    value={assessmentForm.heartRateBpm}
                                    onChange={(event) =>
                                        setAssessmentForm((current) => ({
                                            ...current,
                                            heartRateBpm: event.target.value
                                        }))
                                    }
                                />
                                <Input
                                    type="number"
                                    placeholder="Respiratory rate / min"
                                    value={assessmentForm.respiratoryRatePerMinute}
                                    onChange={(event) =>
                                        setAssessmentForm((current) => ({
                                            ...current,
                                            respiratoryRatePerMinute: event.target.value
                                        }))
                                    }
                                />
                                <Input
                                    type="number"
                                    placeholder="Oxygen saturation %"
                                    value={assessmentForm.oxygenSaturationPercent}
                                    onChange={(event) =>
                                        setAssessmentForm((current) => ({
                                            ...current,
                                            oxygenSaturationPercent: event.target.value
                                        }))
                                    }
                                />
                                <Input
                                    type="number"
                                    step="0.1"
                                    placeholder="Blood sugar mg/dL"
                                    value={assessmentForm.bloodSugarMgDl}
                                    onChange={(event) =>
                                        setAssessmentForm((current) => ({
                                            ...current,
                                            bloodSugarMgDl: event.target.value
                                        }))
                                    }
                                    className="sm:col-span-2"
                                />
                            </div>
                            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                                <div className="rounded-2xl border border-emerald-100 bg-emerald-50/70 p-4">
                                    <div className="flex items-center gap-2 text-sm font-medium text-slate-900">
                                        <Waves className="h-4 w-4 text-emerald-700" />
                                        Blood pressure
                                    </div>
                                    <p className="mt-1 text-xs text-slate-600">
                                        Use both systolic and diastolic when you have them.
                                    </p>
                                </div>
                                <div className="rounded-2xl border border-amber-100 bg-amber-50/70 p-4">
                                    <div className="flex items-center gap-2 text-sm font-medium text-slate-900">
                                        <Thermometer className="h-4 w-4 text-amber-700" />
                                        Temperature
                                    </div>
                                    <p className="mt-1 text-xs text-slate-600">
                                        Enter Celsius values for cleaner triage matching.
                                    </p>
                                </div>
                                <div className="rounded-2xl border border-sky-100 bg-sky-50/70 p-4 sm:col-span-2 xl:col-span-1">
                                    <div className="flex items-center gap-2 text-sm font-medium text-slate-900">
                                        <Stethoscope className="h-4 w-4 text-sky-700" />
                                        Outcome
                                    </div>
                                    <p className="mt-1 text-xs text-slate-600">
                                        This page recommends the specialty. The next page filters doctors.
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <div className="flex items-center gap-2 text-sm font-medium text-foreground">
                                <Sparkles className="h-4 w-4 text-primary" />
                                Symptom Checklist
                            </div>
                            <div className="grid gap-3 sm:grid-cols-2">
                                {symptomOptions.map((symptom) => {
                                    const checked = assessmentForm.symptoms.includes(symptom);

                                    return (
                                        <label
                                            key={symptom}
                                            className="flex cursor-pointer items-center gap-3 rounded-2xl border border-border/70 bg-background/60 px-4 py-3 text-sm transition hover:border-primary/40 hover:bg-accent/30"
                                        >
                                            <Checkbox
                                                checked={checked}
                                                onCheckedChange={(value) =>
                                                    setAssessmentForm((current) => ({
                                                        ...current,
                                                        symptoms: value
                                                            ? [...current.symptoms, symptom]
                                                            : current.symptoms.filter((item) => item !== symptom)
                                                    }))
                                                }
                                            />
                                            <span>{symptom}</span>
                                        </label>
                                    );
                                })}
                            </div>
                        </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-3">
                        <Button
                            onClick={() => {
                                if (!hasClinicalInput) {
                                    toast.error("Please enter at least one symptom or one clinical measurement.");
                                    return;
                                }

                                recommendationMutation.mutate();
                            }}
                            disabled={recommendationMutation.isPending}
                        >
                            {recommendationMutation.isPending ? "Assessing..." : "Discover Specialty"}
                            <ArrowRight className="ml-2 h-4 w-4" />
                        </Button>
                        <Button
                            variant="outline"
                            onClick={() => {
                                setAssessmentForm(initialAssessmentForm);
                                setRecommendationResult(null);
                            }}
                        >
                            Clear Assessment
                        </Button>
                        <Button variant="ghost" asChild>
                            <Link to="/patient/doctors">Go to Find Doctors</Link>
                        </Button>
                    </div>

                    {recommendationResult && (
                        <div className="grid gap-4 xl:grid-cols-[1.2fr_0.8fr]">
                            <Card className="border-emerald-100 bg-emerald-50/60 shadow-none">
                                <CardContent className="space-y-4 p-5">
                                    <div className="flex flex-wrap items-center gap-2">
                                        <Badge className="bg-emerald-700 text-white hover:bg-emerald-700">
                                            Recommended Specialty
                                        </Badge>
                                        <span className="text-lg font-semibold text-slate-900">
                                            {recommendationResult.recommendedSpecialization || "General Physician"}
                                        </span>
                                    </div>
                                    <p className="text-sm leading-6 text-slate-700">
                                        {recommendationResult.assessmentSummary || recommendationResult.query}
                                    </p>
                                    {recommendationResult.matchedSignals &&
                                        recommendationResult.matchedSignals.length > 0 && (
                                            <div className="flex flex-wrap gap-2">
                                                {recommendationResult.matchedSignals.map((signal) => (
                                                    <Badge
                                                        key={signal}
                                                        variant="secondary"
                                                        className="bg-white/90 text-slate-700"
                                                    >
                                                        {signal}
                                                    </Badge>
                                                ))}
                                            </div>
                                        )}
                                </CardContent>
                            </Card>

                            <Card className="border-border/70 shadow-none">
                                <CardContent className="space-y-4 p-5">
                                    <p className="text-sm font-medium text-slate-900">Next step</p>
                                    <p className="text-sm text-muted-foreground">
                                        Open the doctors page and we will filter it to this specialty for you
                                        automatically.
                                    </p>
                                    <Button
                                        className="w-full"
                                        onClick={() =>
                                            navigate(
                                                `/patient/doctors?specialization=${encodeURIComponent(
                                                    recommendationResult.recommendedSpecialization ||
                                                        "General Physician"
                                                )}&source=discovery`
                                            )
                                        }
                                    >
                                        View Matching Doctors
                                        <ArrowRight className="ml-2 h-4 w-4" />
                                    </Button>
                                </CardContent>
                            </Card>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
