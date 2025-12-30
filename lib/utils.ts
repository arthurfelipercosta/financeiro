
export const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value);
};

// Converte string "YYYY-MM-DD" para Date local com segurança
export const parseLocalDate = (dateString: string) => {
  const [year, month, day] = dateString.split('-').map(Number);
  return new Date(year, month - 1, day);
};

export const formatDate = (dateString: string) => {
  // Usamos split para evitar problemas de fuso horário do "new Date(string)"
  const [year, month, day] = dateString.split('-');
  return `${day}/${month}/${year}`;
};

export const getMonthYear = (date: Date) => {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
};

// Extrai o mês e ano diretamente da string YYYY-MM-DD para evitar conversões de fuso
export const getMonthYearFromStr = (dateString: string) => {
  return dateString.substring(0, 7); // Retorna "YYYY-MM"
};

export const generateId = () => {
  return Math.random().toString(36).substr(2, 9);
};
