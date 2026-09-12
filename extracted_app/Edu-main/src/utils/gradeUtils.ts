export const calculateGrade = (totalMarks: number, maxMarks: number): string => {
  if (maxMarks === 0) return 'N/A';
  const percentage = (totalMarks / maxMarks) * 100;
  
  if (percentage >= 91) return 'A1';
  if (percentage >= 81) return 'A2';
  if (percentage >= 71) return 'B1';
  if (percentage >= 61) return 'B2';
  if (percentage >= 51) return 'C1';
  if (percentage >= 41) return 'C2';
  if (percentage >= 33) return 'D';
  return 'E';
};

export const getStatusForMarks = (totalMarks: number, maxMarks: number): string => {
  if (maxMarks === 0) return 'Draft';
  const percentage = (totalMarks / maxMarks) * 100;
  return percentage >= 33 ? 'Verified' : 'Retest Needed';
};
