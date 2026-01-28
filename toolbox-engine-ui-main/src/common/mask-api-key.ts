export const maskApiKey = (apiKey: string): string => {
    if (!apiKey) return "";
    const maskedPart = apiKey.slice(0, 4);
    const lastFourChars = apiKey.slice(-4);
    return `${maskedPart}${"***"}${lastFourChars}`;
}