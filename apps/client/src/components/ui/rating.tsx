import { Star } from "lucide-react";
import { cn } from "@/lib/utils";

interface RatingStarsProps {
    rating?: number | null;
    max?: number;
    size?: number;
    className?: string;
    showValue?: boolean;
}

export function RatingStars({
    rating = 0,
    max = 5,
    size = 14,
    className,
    showValue = false
}: RatingStarsProps) {
    const filledCount = Math.floor(rating || 0);

    return (
        <div className={cn("flex items-center gap-1", className)}>
            {Array.from({ length: max }).map((_, index) => {
                const filled = index < filledCount;
                return (
                    <Star
                        key={`rating-star-${index}`}
                        className={cn(
                            "shrink-0",
                            filled ? "text-amber-400" : "text-muted-foreground/40"
                        )}
                        style={{ width: size, height: size }}
                        fill={filled ? "currentColor" : "transparent"}
                    />
                );
            })}
            {showValue && (
                <span className="text-xs text-muted-foreground">{rating?.toFixed(1)}</span>
            )}
        </div>
    );
}

interface RatingInputProps {
    value: number;
    max?: number;
    size?: number;
    className?: string;
    onChange: (value: number) => void;
    disabled?: boolean;
}

export function RatingInput({
    value,
    max = 5,
    size = 20,
    className,
    onChange,
    disabled = false
}: RatingInputProps) {
    return (
        <div className={cn("flex items-center gap-2", className)} role="radiogroup">
            {Array.from({ length: max }).map((_, index) => {
                const ratingValue = index + 1;
                const filled = ratingValue <= value;
                return (
                    <button
                        key={`rating-input-${ratingValue}`}
                        type="button"
                        disabled={disabled}
                        onClick={() => onChange(ratingValue)}
                        className={cn(
                            "rounded-full transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40",
                            disabled ? "cursor-not-allowed" : "hover:scale-105"
                        )}
                        aria-label={`Rate ${ratingValue} stars`}
                        aria-pressed={filled}
                    >
                        <Star
                            className={cn(
                                "shrink-0",
                                filled ? "text-amber-400" : "text-muted-foreground/40"
                            )}
                            style={{ width: size, height: size }}
                            fill={filled ? "currentColor" : "transparent"}
                        />
                    </button>
                );
            })}
        </div>
    );
}
