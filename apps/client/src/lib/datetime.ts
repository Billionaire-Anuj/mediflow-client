import { format, parse } from "date-fns";

export const combineDateAndTime = (date?: string | null, time?: string | null) => {
    if (!date) return null;
    if (!time) return new Date(date);
    const normalizedTime = time.length === 5 ? `${time}:00` : time;
    return new Date(`${date}T${normalizedTime}`);
};

export const parseDateOnly = (value?: string | null) => {
    if (!value) return undefined;
    return parse(value, "yyyy-MM-dd", new Date());
};

export const formatDateOnly = (value?: Date | null) => {
    if (!value) return "";
    return format(value, "yyyy-MM-dd");
};
