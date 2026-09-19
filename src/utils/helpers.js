export function formatDate(dateString) {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString();
}
export function formatToTextDate(dateString) {
    if (!dateString) return 'N/A';
    
    // 1. Convert the string to a Date object
    const date = new Date(dateString);
    
    // 2. Format the Date object
    const formatedDate = date.toLocaleDateString('en-US', {
        month: 'long',
        day: 'numeric',
        year: 'numeric',
        timeZone: 'UTC' // Prevents the date from shifting back 1 day due to local timezones
    });
    
    return formatedDate;
}