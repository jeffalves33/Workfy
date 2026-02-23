import spaceMeeting from '@/assets/space-meeting.jpg';
import spaceCoworking from '@/assets/space-coworking.jpg';
import spaceOffice from '@/assets/space-office.jpg';

export type SpaceType = 'MEETING_ROOM' | 'OFFICE' | 'CLINIC' | 'COWORKING' | 'STUDIO' | 'TRAINING_ROOM';

export interface Space {
  id: string;
  title: string;
  type: SpaceType;
  description: string;
  city: string;
  state: string;
  address: string;
  capacity: number;
  areaSqm: number;
  pricePerHourCents: number;
  cleaningFeeCents: number;
  rating: number;
  reviewCount: number;
  amenities: string[];
  images: string[];
  isVerified: boolean;
  ownerName: string;
  rules?: string;
}

export const spaceTypeLabels: Record<SpaceType, string> = {
  MEETING_ROOM: 'Sala de Reunião',
  OFFICE: 'Escritório',
  CLINIC: 'Consultório',
  COWORKING: 'Coworking',
  STUDIO: 'Estúdio',
  TRAINING_ROOM: 'Sala de Treinamento',
};

export const spaceTypeIcons: Record<SpaceType, string> = {
  MEETING_ROOM: '🏢',
  OFFICE: '💼',
  CLINIC: '🏥',
  COWORKING: '👥',
  STUDIO: '🎬',
  TRAINING_ROOM: '📚',
};

export const amenityLabels: Record<string, string> = {
  wifi: 'Wi-Fi',
  projector: 'Projetor',
  whiteboard: 'Quadro Branco',
  air_conditioning: 'Ar Condicionado',
  coffee: 'Café',
  parking: 'Estacionamento',
  printer: 'Impressora',
  monitor: 'Monitor',
  webcam: 'Webcam',
  sound_system: 'Sistema de Som',
  kitchen: 'Cozinha',
  reception: 'Recepção',
  locker: 'Armário',
  phone_booth: 'Cabine Telefônica',
};

export function formatPrice(cents: number): string {
  return (cents / 100).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

export const mockSpaces: Space[] = [
  {
    id: '1',
    title: 'Sala de Reunião Premium',
    type: 'MEETING_ROOM',
    description: 'Sala de reunião moderna com vista panorâmica para a Av. Paulista, equipada com projetor 4K, sistema de videoconferência e café cortesia. Ideal para reuniões executivas e apresentações.',
    city: 'São Paulo',
    state: 'SP',
    address: 'Av. Paulista, 1000 - Bela Vista',
    capacity: 12,
    areaSqm: 35,
    pricePerHourCents: 15000,
    cleaningFeeCents: 0,
    rating: 4.9,
    reviewCount: 127,
    amenities: ['wifi', 'projector', 'air_conditioning', 'coffee', 'webcam'],
    images: [spaceMeeting],
    isVerified: true,
    ownerName: 'Marina Santos',
    rules: 'Não fumar. Manter o espaço organizado após o uso.',
  },
  {
    id: '2',
    title: 'Consultório Equipado Centro',
    type: 'CLINIC',
    description: 'Consultório completo no centro do Rio, com maca, pia, ar condicionado e sala de espera compartilhada. Perfeito para profissionais de saúde que precisam de um espaço por período.',
    city: 'Rio de Janeiro',
    state: 'RJ',
    address: 'Rua da Assembleia, 50 - Centro',
    capacity: 3,
    areaSqm: 18,
    pricePerHourCents: 12000,
    cleaningFeeCents: 2000,
    rating: 4.7,
    reviewCount: 84,
    amenities: ['wifi', 'air_conditioning', 'reception'],
    images: [spaceOffice],
    isVerified: true,
    ownerName: 'Dr. Carlos Mendes',
    rules: 'Manter higienização do espaço. Agendar com antecedência mínima de 2h.',
  },
  {
    id: '3',
    title: 'Escritório Privativo Savassi',
    type: 'OFFICE',
    description: 'Escritório privativo com mobília premium na região da Savassi. Mesa ampla, cadeira ergonômica, monitor extra e acesso 24h. Silencioso e com excelente internet.',
    city: 'Belo Horizonte',
    state: 'MG',
    address: 'Rua Pernambuco, 200 - Savassi',
    capacity: 4,
    areaSqm: 22,
    pricePerHourCents: 8000,
    cleaningFeeCents: 0,
    rating: 4.8,
    reviewCount: 56,
    amenities: ['wifi', 'monitor', 'air_conditioning', 'coffee', 'printer', 'parking'],
    images: [spaceOffice],
    isVerified: true,
    ownerName: 'Fernanda Oliveira',
  },
  {
    id: '4',
    title: 'Coworking Open Space',
    type: 'COWORKING',
    description: 'Espaço de coworking aberto e vibrante no coração de Curitiba. Ambiente colaborativo com café ilimitado, internet de alta velocidade e eventos de networking semanais.',
    city: 'Curitiba',
    state: 'PR',
    address: 'Rua XV de Novembro, 300 - Centro',
    capacity: 1,
    areaSqm: 4,
    pricePerHourCents: 3500,
    cleaningFeeCents: 0,
    rating: 4.6,
    reviewCount: 203,
    amenities: ['wifi', 'coffee', 'kitchen', 'locker', 'phone_booth', 'printer'],
    images: [spaceCoworking],
    isVerified: false,
    ownerName: 'Hub Coworking LTDA',
  },
  {
    id: '5',
    title: 'Estúdio de Fotografia Completo',
    type: 'STUDIO',
    description: 'Estúdio profissional com ciclorama branco, iluminação completa (flash e contínua), fundo infinito e camarim. Espaço amplo para produções fotográficas e de vídeo.',
    city: 'São Paulo',
    state: 'SP',
    address: 'Rua Augusta, 1500 - Consolação',
    capacity: 8,
    areaSqm: 80,
    pricePerHourCents: 25000,
    cleaningFeeCents: 5000,
    rating: 4.9,
    reviewCount: 45,
    amenities: ['wifi', 'air_conditioning', 'sound_system', 'parking'],
    images: [spaceCoworking],
    isVerified: true,
    ownerName: 'Studio Luz Produções',
    rules: 'Não alterar a iluminação fixa. Limpeza do ciclorama após uso.',
  },
  {
    id: '6',
    title: 'Sala de Treinamento Corporativo',
    type: 'TRAINING_ROOM',
    description: 'Sala ampla para treinamentos com capacidade para 30 pessoas, projetor, quadro branco, sistema de som e layout configurável (auditório, U ou mesas). Inclui coffee break opcional.',
    city: 'Brasília',
    state: 'DF',
    address: 'SCS Quadra 1, Bloco A - Asa Sul',
    capacity: 30,
    areaSqm: 60,
    pricePerHourCents: 20000,
    cleaningFeeCents: 3000,
    rating: 4.5,
    reviewCount: 32,
    amenities: ['wifi', 'projector', 'whiteboard', 'air_conditioning', 'sound_system', 'coffee', 'parking'],
    images: [spaceMeeting],
    isVerified: true,
    ownerName: 'Centro Empresarial BSB',
    rules: 'Reserva mínima de 4 horas. Solicitar coffee break com 48h de antecedência.',
  },
];
