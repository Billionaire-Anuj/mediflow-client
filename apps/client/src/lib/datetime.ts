export const combineDateAndTime = (date?: string | null, time?: string | null) => {
    if (!date) return null;
    if (!time) return new Date(date);
    const normalizedTime = time.length === 5 ? `${time}:00` : time;
    return new Date(`${date}T${normalizedTime}`);
};
