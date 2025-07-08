// Serviço para integração com a API do Asaas via backend
import { authService } from './auth';

const BACKEND_API_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8080';

const getHeaders = () => {
  const token = authService.getToken();
  return {
    'Content-Type': 'application/json',
    ...(token && { 'Authorization': `Bearer ${token}` }),
  };
};

export interface Customer {
  id: string;
  name: string;
  email: string;
  phone?: string;
  mobilePhone?: string;
  cpfCnpj: string;
  personType: 'FISICA' | 'JURIDICA';
  dateCreated: string;
  additionalEmails?: string;
  externalReference?: string;
  notificationDisabled: boolean;
  observations?: string;
  municipalInscription?: string;
  stateInscription?: string;
  groupName?: string;
  company?: string;
}

export interface Payment {
  id: string;
  customer: string;
  subscription?: string;
  installment?: string;
  paymentLink?: string;
  value: number;
  netValue: number;
  originalValue?: number;
  interestValue?: number;
  description?: string;
  billingType: 'BOLETO' | 'CREDIT_CARD' | 'DEBIT_CARD' | 'TRANSFER' | 'DEPOSIT' | 'PIX';
  status: 'PENDING' | 'RECEIVED' | 'CONFIRMED' | 'OVERDUE' | 'REFUNDED' | 'RECEIVED_IN_CASH' | 'REFUND_REQUESTED' | 'REFUND_IN_PROGRESS' | 'CHARGEBACK_REQUESTED' | 'CHARGEBACK_DISPUTE' | 'AWAITING_CHARGEBACK_REVERSAL' | 'DUNNING_REQUESTED' | 'DUNNING_RECEIVED' | 'AWAITING_RISK_ANALYSIS';
  dueDate: string;
  originalDueDate: string;
  paymentDate?: string;
  clientPaymentDate?: string;
  installmentNumber?: number;
  invoiceUrl: string;
  invoiceNumber: string;
  externalReference?: string;
  deleted: boolean;
  anticipated: boolean;
  anticipable: boolean;
  dateCreated: string;
  estimatedCreditDate?: string;
  transactionReceiptUrl?: string;
  nossoNumero?: string;
  bankSlipUrl?: string;
  lastInvoiceViewedDate?: string;
  lastBankSlipViewedDate?: string;
}

export interface DashboardStats {
  totalCustomers: number;
  totalRevenue: number;
  pendingPayments: number;
  receivedPayments: number;
  monthlyGrowth: {
    customers: number;
    revenue: number;
    pendingPayments: number;
    receivedPayments: number;
  };
}

class AsaasService {
  private async makeRequest<T>(endpoint: string, options?: RequestInit): Promise<T> {
    try {
      const response = await fetch(`${BACKEND_API_URL}/api/asaas${endpoint}`, {
        ...options,
        headers: {
          ...getHeaders(),
          ...options?.headers,
        },
      });

      if (!response.ok) {
        throw new Error(`Erro na API: ${response.status} - ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Erro na requisição para Asaas:', error);
      throw error;
    }
  }

  // Buscar clientes
  async getCustomers(limit = 100, offset = 0): Promise<{ data: Customer[]; totalCount: number }> {
    return this.makeRequest(`/customers?limit=${limit}&offset=${offset}`);
  }

  // Buscar cobranças/pagamentos
  async getPayments(limit = 100, offset = 0, status?: string): Promise<{ data: Payment[]; totalCount: number }> {
    const statusParam = status ? `&status=${status}` : '';
    return this.makeRequest(`/payments?limit=${limit}&offset=${offset}${statusParam}`);
  }

  // Buscar pagamentos por período
  async getPaymentsByDateRange(dateFrom: string, dateTo: string): Promise<{ data: Payment[]; totalCount: number }> {
    return this.makeRequest(`/payments/date-range?dateFrom=${dateFrom}&dateTo=${dateTo}`);
  }

  // Buscar estatísticas do dashboard
  async getDashboardStats(): Promise<DashboardStats> {
    try {
      return this.makeRequest('/dashboard-stats');
    } catch (error) {
      console.error('Erro ao buscar estatísticas:', error);
      // Retornar dados mock em caso de erro
      return {
        totalCustomers: 0,
        totalRevenue: 0,
        pendingPayments: 0,
        receivedPayments: 0,
        monthlyGrowth: {
          customers: 0,
          revenue: 0,
          pendingPayments: 0,
          receivedPayments: 0,
        },
      };
    }
  }

  // Buscar atividades recentes
  async getRecentActivities(): Promise<Payment[]> {
    try {
      return this.makeRequest('/recent-activities');
    } catch (error) {
      console.error('Erro ao buscar atividades recentes:', error);
      return [];
    }
  }

  // Criar nova cobrança/boleto
  async createPayment(paymentData: {
    customer: string;
    billingType: Payment['billingType'];
    value: number;
    dueDate: string;
    description?: string;
    externalReference?: string;
  }): Promise<Payment> {
    return this.makeRequest('/payments', {
      method: 'POST',
      body: JSON.stringify(paymentData),
    });
  }

  // Gerar boleto para cliente inadimplente
  async generateBoletoForCustomer(customerId: string, value: number, dueDate: string, description?: string): Promise<Payment> {
    const paymentData = {
      customer: customerId,
      billingType: 'BOLETO' as const,
      value,
      dueDate,
      description: description || 'Nova cobrança gerada via sistema',
    };

    return this.createPayment(paymentData);
  }

  // Criar novo cliente
  async createCustomer(customerData: {
    name: string;
    email: string;
    phone?: string;
    mobilePhone?: string;
    cpfCnpj: string;
    personType: 'FISICA' | 'JURIDICA';
    notificationDisabled?: boolean;
    additionalEmails?: string;
    externalReference?: string;
    observations?: string;
  }): Promise<Customer> {
    return this.makeRequest('/customers', {
      method: 'POST',
      body: JSON.stringify(customerData),
    });
  }

  // Buscar clientes inadimplentes
  async getOverdueCustomers(): Promise<{ data: Array<{ customer: Customer; payment: Payment; daysOverdue: number }>; totalCount: number }> {
    try {
      // Buscar pagamentos em atraso
      const overduePayments = await this.getPayments(1000, 0, 'OVERDUE');
      
      // Agrupar por cliente e calcular dias de atraso
      const customerPayments = new Map<string, { customer: Customer; payment: Payment; daysOverdue: number }>();
      
      for (const payment of overduePayments.data) {
        const customer = await this.getCustomerById(payment.customer);
        const dueDate = new Date(payment.dueDate);
        const today = new Date();
        const daysOverdue = Math.floor((today.getTime() - dueDate.getTime()) / (1000 * 60 * 60 * 24));
        
        if (!customerPayments.has(payment.customer) || 
            customerPayments.get(payment.customer)!.daysOverdue < daysOverdue) {
          customerPayments.set(payment.customer, {
            customer,
            payment,
            daysOverdue
          });
        }
      }
      
      const data = Array.from(customerPayments.values()).sort((a, b) => b.daysOverdue - a.daysOverdue);
      
      return {
        data,
        totalCount: data.length
      };
    } catch (error) {
      console.error('Erro ao buscar clientes inadimplentes:', error);
      return { data: [], totalCount: 0 };
    }
  }

  // Buscar cliente por ID
  async getCustomerById(customerId: string): Promise<Customer> {
    return this.makeRequest(`/customers/${customerId}`);
  }

  // Verificar status da API
  async checkApiStatus(): Promise<boolean> {
    try {
      await this.makeRequest('/customers?limit=1');
      return true;
    } catch (error) {
      return false;
    }
  }
}

export const asaasService = new AsaasService();
