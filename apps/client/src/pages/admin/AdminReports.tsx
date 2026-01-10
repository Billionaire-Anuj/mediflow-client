import { useState, useEffect } from "react";
import { PageHeader } from "@/components/ui/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CardSkeleton } from "@/components/ui/loading-skeleton";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    PieChart,
    Pie,
    Cell,
    LineChart,
    Line,
    Legend
} from "recharts";
import { BarChart3, PieChart as PieChartIcon, TrendingUp } from "lucide-react";

const appointmentsByDay = [
    { day: "Mon", appointments: 24, completed: 22, cancelled: 2 },
    { day: "Tue", appointments: 28, completed: 25, cancelled: 3 },
    { day: "Wed", appointments: 18, completed: 17, cancelled: 1 },
    { day: "Thu", appointments: 32, completed: 28, cancelled: 4 },
    { day: "Fri", appointments: 26, completed: 24, cancelled: 2 },
    { day: "Sat", appointments: 12, completed: 11, cancelled: 1 },
    { day: "Sun", appointments: 0, completed: 0, cancelled: 0 }
];

const prescriptionsVsLabs = [
    { month: "Jan", prescriptions: 145, labs: 89 },
    { month: "Feb", prescriptions: 168, labs: 102 },
    { month: "Mar", prescriptions: 152, labs: 95 },
    { month: "Apr", prescriptions: 189, labs: 118 },
    { month: "May", prescriptions: 176, labs: 108 },
    { month: "Jun", prescriptions: 198, labs: 125 }
];

const statusDistribution = [
    { name: "Completed", value: 156, color: "hsl(var(--status-success))" },
    { name: "Booked", value: 42, color: "hsl(var(--status-info))" },
    { name: "Cancelled", value: 18, color: "hsl(var(--status-danger))" },
    { name: "No-show", value: 8, color: "hsl(var(--status-warning))" }
];

const departmentStats = [
    { department: "Cardiology", patients: 156, revenue: 23400 },
    { department: "Neurology", patients: 98, revenue: 17150 },
    { department: "Pediatrics", patients: 234, revenue: 28080 },
    { department: "Orthopedics", patients: 87, revenue: 17400 },
    { department: "Dermatology", patients: 145, revenue: 20300 }
];

export default function AdminReports() {
    const [loading, setLoading] = useState(true);
    const [timeRange, setTimeRange] = useState("week");

    useEffect(() => {
        const timer = setTimeout(() => setLoading(false), 400);
        return () => clearTimeout(timer);
    }, []);

    if (loading) {
        return (
            <div className="space-y-6">
                <PageHeader title="Reports" />
                <div className="grid gap-4 md:grid-cols-2">
                    <CardSkeleton />
                    <CardSkeleton />
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6 animate-fade-in">
            <PageHeader title="Reports & Analytics" description="View clinic performance metrics">
                <Select value={timeRange} onValueChange={setTimeRange}>
                    <SelectTrigger className="w-[150px]">
                        <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-popover">
                        <SelectItem value="week">This Week</SelectItem>
                        <SelectItem value="month">This Month</SelectItem>
                        <SelectItem value="quarter">This Quarter</SelectItem>
                        <SelectItem value="year">This Year</SelectItem>
                    </SelectContent>
                </Select>
            </PageHeader>

            {/* Summary Cards */}
            <div className="grid gap-4 md:grid-cols-4">
                <Card>
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-muted-foreground">Total Appointments</p>
                                <p className="text-2xl font-bold">224</p>
                                <p className="text-xs text-status-success">+12% vs last week</p>
                            </div>
                            <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                                <TrendingUp className="h-6 w-6 text-primary" />
                            </div>
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-muted-foreground">Completion Rate</p>
                                <p className="text-2xl font-bold">91.5%</p>
                                <p className="text-xs text-status-success">+2.3% vs last week</p>
                            </div>
                            <div className="h-12 w-12 rounded-full bg-status-success-bg flex items-center justify-center">
                                <BarChart3 className="h-6 w-6 text-status-success" />
                            </div>
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-muted-foreground">Prescriptions</p>
                                <p className="text-2xl font-bold">156</p>
                                <p className="text-xs text-muted-foreground">This week</p>
                            </div>
                            <div className="h-12 w-12 rounded-full bg-status-info-bg flex items-center justify-center">
                                <PieChartIcon className="h-6 w-6 text-status-info" />
                            </div>
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-muted-foreground">Lab Requests</p>
                                <p className="text-2xl font-bold">89</p>
                                <p className="text-xs text-muted-foreground">This week</p>
                            </div>
                            <div className="h-12 w-12 rounded-full bg-status-warning-bg flex items-center justify-center">
                                <BarChart3 className="h-6 w-6 text-status-warning" />
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            <Tabs defaultValue="appointments" className="space-y-4">
                <TabsList>
                    <TabsTrigger value="appointments">Appointments</TabsTrigger>
                    <TabsTrigger value="orders">Prescriptions & Labs</TabsTrigger>
                    <TabsTrigger value="departments">Departments</TabsTrigger>
                </TabsList>

                {/* Appointments Charts */}
                <TabsContent value="appointments">
                    <div className="grid gap-6 lg:grid-cols-2">
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-base">Appointments by Day</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <ResponsiveContainer width="100%" height={300}>
                                    <BarChart data={appointmentsByDay}>
                                        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                                        <XAxis dataKey="day" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                                        <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
                                        <Tooltip
                                            contentStyle={{
                                                backgroundColor: "hsl(var(--popover))",
                                                border: "1px solid hsl(var(--border))",
                                                borderRadius: "8px"
                                            }}
                                        />
                                        <Legend />
                                        <Bar
                                            dataKey="completed"
                                            name="Completed"
                                            fill="hsl(var(--status-success))"
                                            radius={[4, 4, 0, 0]}
                                        />
                                        <Bar
                                            dataKey="cancelled"
                                            name="Cancelled"
                                            fill="hsl(var(--status-danger))"
                                            radius={[4, 4, 0, 0]}
                                        />
                                    </BarChart>
                                </ResponsiveContainer>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle className="text-base">Status Distribution</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <ResponsiveContainer width="100%" height={300}>
                                    <PieChart>
                                        <Pie
                                            data={statusDistribution}
                                            cx="50%"
                                            cy="50%"
                                            innerRadius={60}
                                            outerRadius={100}
                                            paddingAngle={2}
                                            dataKey="value"
                                            label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                                            labelLine={false}
                                        >
                                            {statusDistribution.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={entry.color} />
                                            ))}
                                        </Pie>
                                        <Tooltip
                                            contentStyle={{
                                                backgroundColor: "hsl(var(--popover))",
                                                border: "1px solid hsl(var(--border))",
                                                borderRadius: "8px"
                                            }}
                                        />
                                    </PieChart>
                                </ResponsiveContainer>
                            </CardContent>
                        </Card>
                    </div>
                </TabsContent>

                {/* Prescriptions & Labs */}
                <TabsContent value="orders">
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-base">Prescriptions vs Lab Requests (6 Months)</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <ResponsiveContainer width="100%" height={350}>
                                <LineChart data={prescriptionsVsLabs}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                                    <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                                    <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
                                    <Tooltip
                                        contentStyle={{
                                            backgroundColor: "hsl(var(--popover))",
                                            border: "1px solid hsl(var(--border))",
                                            borderRadius: "8px"
                                        }}
                                    />
                                    <Legend />
                                    <Line
                                        type="monotone"
                                        dataKey="prescriptions"
                                        name="Prescriptions"
                                        stroke="hsl(var(--primary))"
                                        strokeWidth={2}
                                        dot={{ fill: "hsl(var(--primary))" }}
                                    />
                                    <Line
                                        type="monotone"
                                        dataKey="labs"
                                        name="Lab Requests"
                                        stroke="hsl(var(--status-warning))"
                                        strokeWidth={2}
                                        dot={{ fill: "hsl(var(--status-warning))" }}
                                    />
                                </LineChart>
                            </ResponsiveContainer>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Department Stats */}
                <TabsContent value="departments">
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-base">Department Performance</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <ResponsiveContainer width="100%" height={350}>
                                <BarChart data={departmentStats} layout="vertical">
                                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                                    <XAxis type="number" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                                    <YAxis
                                        dataKey="department"
                                        type="category"
                                        stroke="hsl(var(--muted-foreground))"
                                        fontSize={12}
                                        width={100}
                                    />
                                    <Tooltip
                                        contentStyle={{
                                            backgroundColor: "hsl(var(--popover))",
                                            border: "1px solid hsl(var(--border))",
                                            borderRadius: "8px"
                                        }}
                                    />
                                    <Legend />
                                    <Bar
                                        dataKey="patients"
                                        name="Patients"
                                        fill="hsl(var(--primary))"
                                        radius={[0, 4, 4, 0]}
                                    />
                                </BarChart>
                            </ResponsiveContainer>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
}
