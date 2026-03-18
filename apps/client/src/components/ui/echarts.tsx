import { useEffect, useRef } from "react";
import * as echarts from "echarts";
import type { EChartsOption } from "echarts";

import { cn } from "@/lib/utils";

type DashboardChartProps = {
    option: EChartsOption;
    className?: string;
};

export function DashboardChart({ option, className }: DashboardChartProps) {
    const containerRef = useRef<HTMLDivElement | null>(null);
    const chartRef = useRef<echarts.EChartsType | null>(null);

    useEffect(() => {
        if (!containerRef.current) return;

        const chart = echarts.init(containerRef.current, undefined, { renderer: "canvas" });
        chartRef.current = chart;

        const resizeObserver = new ResizeObserver(() => {
            chart.resize();
        });

        resizeObserver.observe(containerRef.current);

        const handleResize = () => chart.resize();
        window.addEventListener("resize", handleResize);

        return () => {
            window.removeEventListener("resize", handleResize);
            resizeObserver.disconnect();
            chart.dispose();
            chartRef.current = null;
        };
    }, []);

    useEffect(() => {
        if (!chartRef.current) return;

        chartRef.current.setOption(option, true);
    }, [option]);

    return <div ref={containerRef} className={cn("h-[320px] w-full", className)} />;
}
