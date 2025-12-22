
export interface Holiday {
    date: string; // ISO format YYYY-MM-DD
    name: string;
}

const fixedHolidays = [
    { day: 1, month: 0, name: 'Ano Novo' },
    { day: 21, month: 3, name: 'Tiradentes' },
    { day: 1, month: 4, name: 'Dia do Trabalho' },
    { day: 7, month: 8, name: 'Independência do Brasil' },
    { day: 12, month: 9, name: 'Nossa Senhora Aparecida' },
    { day: 2, month: 10, name: 'Finados' },
    { day: 15, month: 10, name: 'Proclamação da República' },
    { day: 20, month: 10, name: 'Consciência Negra' },
    { day: 25, month: 11, name: 'Natal' },
];

const variableHolidays: Record<number, { day: number, month: number, name: string }[]> = {
    2024: [
        { day: 29, month: 2, name: 'Sexta-feira Santa' },
        { day: 30, month: 4, name: 'Corpus Christi' },
    ],
    2025: [
        { day: 18, month: 3, name: 'Sexta-feira Santa' },
        { day: 19, month: 5, name: 'Corpus Christi' },
    ]
};

export const getHoliday = (date: Date): Holiday | null => {
    const day = date.getDate();
    const month = date.getMonth();
    const year = date.getFullYear();

    // Check fixed
    const fixed = fixedHolidays.find(h => h.day === day && h.month === month);
    if (fixed) return { date: date.toISOString().split('T')[0], name: fixed.name };

    // Check variable
    const yearVars = variableHolidays[year];
    if (yearVars) {
        const variable = yearVars.find(h => h.day === day && h.month === month);
        if (variable) return { date: date.toISOString().split('T')[0], name: variable.name };
    }

    return null;
};

export const isHoliday = (date: Date): boolean => {
    return getHoliday(date) !== null;
};
