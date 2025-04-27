export const getActualDate = () => {
    const date = new Date();

    // Opciones para formatear la fecha en español de Costa Rica
    const options: Intl.DateTimeFormatOptions = {
      timeZone: 'America/Costa_Rica',
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    };
    
    const formatter = new Intl.DateTimeFormat('es-CR', options);
    const parts = formatter.formatToParts(date);
    
    let day = '', month = '', year = '', hour = '', minute = '';
    
    parts.forEach((part) => {
      switch (part.type) {
        case 'day':
          day = part.value;
          break;
        case 'month':
          month = part.value;
          break;
        case 'year':
          year = part.value;
          break;
        case 'hour':
          hour = part.value;
          break;
        case 'minute':
          minute = part.value;
          break;
      }
    });
    
    const timestamp = `${day}/${month}/${year} a las ${hour}:${minute}`;
  }