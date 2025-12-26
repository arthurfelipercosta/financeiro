
import React, { useState } from 'react';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';

interface MonthPickerModalProps {
  currentDate: Date;
  onSelect: (date: Date) => void;
  onClose: () => void;
}

const MONTHS = [
  'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
];

const MonthPickerModal: React.FC<MonthPickerModalProps> = ({ currentDate, onSelect, onClose }) => {
  const [viewYear, setViewYear] = useState(currentDate.getFullYear());

  const handleYearChange = (offset: number) => {
    setViewYear(prev => prev + offset);
  };

  const handleMonthSelect = (monthIndex: number) => {
    onSelect(new Date(viewYear, monthIndex, 1));
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[60] p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden animate-in zoom-in duration-300">
        <div className="px-6 py-4 border-b flex justify-between items-center bg-slate-50">
          <h3 className="text-lg font-bold text-slate-800">Escolha o período</h3>
          <button onClick={onClose} className="p-2 hover:bg-slate-200 rounded-full transition-colors text-slate-500">
            <X size={20} />
          </button>
        </div>

        <div className="p-6">
          {/* Year Selector */}
          <div className="flex items-center justify-between mb-6 bg-slate-100 p-2 rounded-xl">
            <button 
              onClick={() => handleYearChange(-1)}
              className="p-2 hover:bg-white rounded-lg text-slate-600 transition-all shadow-sm active:scale-95"
            >
              <ChevronLeft size={20} />
            </button>
            <span className="text-xl font-black text-slate-800">{viewYear}</span>
            <button 
              onClick={() => handleYearChange(1)}
              className="p-2 hover:bg-white rounded-lg text-slate-600 transition-all shadow-sm active:scale-95"
            >
              <ChevronRight size={20} />
            </button>
          </div>

          {/* Month Grid */}
          <div className="grid grid-cols-3 gap-2">
            {MONTHS.map((month, index) => {
              const isSelected = 
                currentDate.getMonth() === index && 
                currentDate.getFullYear() === viewYear;

              return (
                <button
                  key={month}
                  onClick={() => handleMonthSelect(index)}
                  className={`py-3 text-sm font-semibold rounded-xl transition-all active:scale-95 ${
                    isSelected 
                      ? 'bg-blue-600 text-white shadow-lg shadow-blue-200' 
                      : 'bg-slate-50 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {month.substring(0, 3)}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MonthPickerModal;
