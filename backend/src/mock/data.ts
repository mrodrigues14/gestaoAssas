export const mockUsers = [
  {
    id: '1',
    email: 'admin@gestao.com',
    password: '$2b$10$k40l/3sFArATbhefAzfQ0efoigTqjyr53dQQ0PLw60wVHNtjFmvcK', // 123456
    name: 'Administrador',
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: '2',
    email: 'matheus@gestao.com',
    password: '$2b$10$k40l/3sFArATbhefAzfQ0efoigTqjyr53dQQ0PLw60wVHNtjFmvcK', // 123456
    name: 'Matheus',
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
];

export const mockCustomers = [
  {
    id: 'cus_000005734826',
    name: 'João Silva',
    email: 'joao@email.com',
    cpfCnpj: '123.456.789-00',
    phone: '(11) 99999-9999',
    personType: 'FISICA',
    dateCreated: '2024-01-15',
  },
  {
    id: 'cus_000005734827',
    name: 'Maria Santos',
    email: 'maria@email.com',
    cpfCnpj: '987.654.321-00',
    phone: '(11) 88888-8888',
    personType: 'FISICA',
    dateCreated: '2024-01-20',
  },
  {
    id: 'cus_000005734828',
    name: 'Empresa XYZ Ltda',
    email: 'contato@empresa.com',
    cpfCnpj: '12.345.678/0001-90',
    phone: '(11) 77777-7777',
    personType: 'JURIDICA',
    dateCreated: '2024-02-10',
  },
];

export const mockPayments = [
  {
    id: 'pay_123456789',
    customer: 'cus_000005734826',
    value: 150.00,
    netValue: 147.00,
    description: 'Mensalidade Janeiro',
    billingType: 'BOLETO',
    status: 'RECEIVED',
    dueDate: '2024-01-30',
    paymentDate: '2024-01-28',
    dateCreated: '2024-01-15',
    invoiceUrl: 'https://sandbox.asaas.com/invoice/123456789',
    invoiceNumber: '000123',
  },
  {
    id: 'pay_123456790',
    customer: 'cus_000005734827',
    value: 200.00,
    netValue: 196.00,
    description: 'Serviço de Consultoria',
    billingType: 'PIX',
    status: 'PENDING',
    dueDate: '2024-02-15',
    dateCreated: '2024-02-01',
    invoiceUrl: 'https://sandbox.asaas.com/invoice/123456790',
    invoiceNumber: '000124',
  },
  {
    id: 'pay_123456791',
    customer: 'cus_000005734828',
    value: 500.00,
    netValue: 485.00,
    description: 'Licença Software',
    billingType: 'CREDIT_CARD',
    status: 'OVERDUE',
    dueDate: '2024-01-10',
    dateCreated: '2024-01-01',
    invoiceUrl: 'https://sandbox.asaas.com/invoice/123456791',
    invoiceNumber: '000125',
  },
];

export const mockDashboardStats = {
  totalCustomers: 150,
  totalRevenue: 12500.00,
  pendingPayments: 25,
  receivedPayments: 125,
  monthlyGrowth: {
    customers: 12,
    revenue: 8,
    pendingPayments: -5,
    receivedPayments: 15,
  },
};
