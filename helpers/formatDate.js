// helpers/dateTimeHelper.js

function formatDate(dateTime) {
    const date = new Date(dateTime);
  
    // Ensure the date is valid
    if (isNaN(date)) {
      return ''; // If the date is invalid, return an empty string
    }
  
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
  
    return `${year}-${month}-${day}`;
  }
  
  export default formatDate;
  