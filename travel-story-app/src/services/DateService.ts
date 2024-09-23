export function calculateDaysDifference(startDate: string, endDate: string): number {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const timeDifference = end.getTime() - start.getTime();    
    const daysDifference = timeDifference / (1000 * 3600 * 24);
    return Math.round(daysDifference); 
}