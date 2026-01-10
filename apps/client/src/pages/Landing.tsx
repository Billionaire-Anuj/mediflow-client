import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Heart, Stethoscope, Users, Building2, ArrowRight, Shield, Clock, CheckCircle } from "lucide-react";

export default function Landing() {
    return (
        <div className="min-h-screen bg-background">
            {/* Header */}
            <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-16">
                        <div className="flex items-center gap-2">
                            <div className="h-9 w-9 rounded-lg bg-primary flex items-center justify-center">
                                <span className="text-primary-foreground font-bold">M</span>
                            </div>
                            <span className="font-display font-semibold text-xl">Mediflow</span>
                        </div>
                        <div className="flex items-center gap-3">
                            <Button variant="ghost" asChild>
                                <Link to="/login">Sign In</Link>
                            </Button>
                            <Button asChild>
                                <Link to="/register">Register</Link>
                            </Button>
                        </div>
                    </div>
                </div>
            </header>

            {/* Hero Section */}
            <section className="relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-b from-accent/30 to-background" />
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-24 relative">
                    <div className="grid lg:grid-cols-2 gap-12 items-center">
                        {/* Left Column - CTA Tiles */}
                        <div className="order-2 lg:order-1">
                            <div className="grid grid-cols-2 gap-4">
                                <Link to="/login" className="card-interactive p-6 group">
                                    <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                                        <Heart className="h-6 w-6 text-primary" />
                                    </div>
                                    <h3 className="font-semibold text-foreground mb-1">For Our Patients</h3>
                                    <p className="text-sm text-muted-foreground">
                                        Book appointments & access your records
                                    </p>
                                </Link>

                                <Link to="/login" className="card-interactive p-6 group">
                                    <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                                        <Stethoscope className="h-6 w-6 text-primary" />
                                    </div>
                                    <h3 className="font-semibold text-foreground mb-1">For Our Doctors</h3>
                                    <p className="text-sm text-muted-foreground">Manage consultations & patient care</p>
                                </Link>

                                <Link to="/login" className="card-interactive p-6 group">
                                    <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                                        <Users className="h-6 w-6 text-primary" />
                                    </div>
                                    <h3 className="font-semibold text-foreground mb-1">For Our Staff</h3>
                                    <p className="text-sm text-muted-foreground">Lab & pharmacy workflow tools</p>
                                </Link>

                                <Link to="/login" className="card-interactive p-6 group">
                                    <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                                        <Building2 className="h-6 w-6 text-primary" />
                                    </div>
                                    <h3 className="font-semibold text-foreground mb-1">For Hospitals</h3>
                                    <p className="text-sm text-muted-foreground">Complete administration portal</p>
                                </Link>
                            </div>
                        </div>

                        {/* Right Column - Hero Content */}
                        <div className="order-1 lg:order-2 text-center lg:text-left">
                            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-display font-bold text-foreground tracking-tight mb-6">
                                Healthcare
                                <span className="text-primary block">Made Simple</span>
                            </h1>
                            <p className="text-lg text-muted-foreground mb-8 max-w-lg mx-auto lg:mx-0">
                                Streamline your healthcare journey with Mediflow. Book appointments, manage records, and
                                connect with healthcare providers — all in one place.
                            </p>
                            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                                <Button size="lg" asChild className="gap-2">
                                    <Link to="/register">
                                        Get Started
                                        <ArrowRight className="h-4 w-4" />
                                    </Link>
                                </Button>
                                <Button size="lg" variant="outline" asChild>
                                    <Link to="/login">Sign In</Link>
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Features Section */}
            <section className="py-16 lg:py-24 bg-card/50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-12">
                        <h2 className="text-3xl font-display font-bold text-foreground mb-4">Why Choose Mediflow?</h2>
                        <p className="text-muted-foreground max-w-2xl mx-auto">
                            Built for modern healthcare, designed for everyone.
                        </p>
                    </div>

                    <div className="grid md:grid-cols-3 gap-8">
                        <div className="text-center">
                            <div className="h-14 w-14 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
                                <Clock className="h-7 w-7 text-primary" />
                            </div>
                            <h3 className="font-semibold text-lg mb-2">Easy Scheduling</h3>
                            <p className="text-sm text-muted-foreground">
                                Book appointments with your preferred doctors in just a few clicks.
                            </p>
                        </div>

                        <div className="text-center">
                            <div className="h-14 w-14 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
                                <Shield className="h-7 w-7 text-primary" />
                            </div>
                            <h3 className="font-semibold text-lg mb-2">Secure Records</h3>
                            <p className="text-sm text-muted-foreground">
                                Your medical history is safely stored and easily accessible.
                            </p>
                        </div>

                        <div className="text-center">
                            <div className="h-14 w-14 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
                                <CheckCircle className="h-7 w-7 text-primary" />
                            </div>
                            <h3 className="font-semibold text-lg mb-2">Complete Care</h3>
                            <p className="text-sm text-muted-foreground">
                                From consultation to prescription, everything in one platform.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="border-t border-border py-8">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                        <div className="flex items-center gap-2">
                            <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
                                <span className="text-primary-foreground font-bold text-sm">M</span>
                            </div>
                            <span className="font-display font-semibold">Mediflow</span>
                        </div>
                        <p className="text-sm text-muted-foreground">
                            © 2026 Mediflow Health Center. All rights reserved.
                        </p>
                    </div>
                </div>
            </footer>
        </div>
    );
}
