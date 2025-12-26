
import { PaymentMethod } from './types';

export const DEFAULT_CATEGORIES = [
  'Alimentação',
  'Moradia',
  'Transporte',
  'Lazer',
  'Saúde',
  'Educação',
  'Assinaturas',
  'Compras Gerais',
  'Salário',
  'Freelance',
  'Investimento',
  'Outros'
];

export const PAYMENT_METHODS: { value: PaymentMethod; label: string }[] = [
  { value: 'DEBIT', label: 'Débito' },
  { value: 'CREDIT', label: 'Crédito' },
  { value: 'PIX', label: 'PIX' },
  { value: 'CASH', label: 'Dinheiro' },
  { value: 'BOLETO', label: 'Boleto' },
  { value: 'TRANSFER', label: 'Transferência' }
];

export const INITIAL_PEOPLE = [
  { id: '1', name: 'Eu', color: '#3b82f6' },
  { id: '2', name: 'Cônjuge', color: '#ec4899' }
];
