import { format } from 'date-fns';


// Others
export const getDateToday = async (formatDate) => {
    
const today = format(new Date(), formatDate);
return today
}

export const formatDate = async (date, formatDate) => {
    
    const data = format(date, formatDate);
    return data
    }