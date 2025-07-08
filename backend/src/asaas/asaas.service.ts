import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AsaasService {
  private readonly asaasApiUrl: string;
  private readonly asaasApiKey: string;

  constructor(private configService: ConfigService) {
    this.asaasApiUrl = this.configService.get<string>('ASAAS_API_URL') || 'https://www.asaas.com/api/v3';
    this.asaasApiKey = this.configService.get<string>('ASAAS_API_KEY') || '';
  }

  private getHeaders() {
    return {
      'access_token': this.asaasApiKey,
      'Content-Type': 'application/json',
    };
  }

  private async makeRequest(endpoint: string, options?: RequestInit) {
    try {
      const response = await fetch(`${this.asaasApiUrl}${endpoint}`, {
        ...options,
        headers: {
          ...this.getHeaders(),
          ...options?.headers,
        },
      });

      if (!response.ok) {
        throw new HttpException(
          `Erro na API do Asaas: ${response.status} - ${response.statusText}`,
          HttpStatus.BAD_REQUEST
        );
      }

      return await response.json();
    } catch (error) {
      console.error('Erro na requisição para Asaas:', error);
      throw new HttpException(
        'Erro ao comunicar com a API do Asaas',
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
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

  // Buscar clientes
  async getCustomers(limit = 100, offset = 0) {
    return this.makeRequest(`/customers?limit=${limit}&offset=${offset}`);
  }

  // Buscar cliente por ID
  async getCustomerById(customerId: string) {
    return this.makeRequest(`/customers/${customerId}`);
  }

  // Criar novo cliente
  async createCustomer(customerData: any) {
    return this.makeRequest('/customers', {
      method: 'POST',
      body: JSON.stringify(customerData),
    });
  }

  // Buscar pagamentos
  async getPayments(limit = 100, offset = 0, status?: string) {
    const statusParam = status ? `&status=${status}` : '';
    return this.makeRequest(`/payments?limit=${limit}&offset=${offset}${statusParam}`);
  }

  // Buscar pagamentos por período
  async getPaymentsByDateRange(dateFrom: string, dateTo: string) {
    return this.makeRequest(`/payments?dateCreated[ge]=${dateFrom}&dateCreated[le]=${dateTo}&limit=1000`);
  }

  // Criar nova cobrança/pagamento
  async createPayment(paymentData: any) {
    return this.makeRequest('/payments', {
      method: 'POST',
      body: JSON.stringify(paymentData),
    });
  }

  // Buscar estatísticas do dashboard
  async getDashboardStats() {
    try {
      // Buscar dados dos últimos 30 dias
      const currentDate = new Date();
      const pastDate = new Date();
      pastDate.setDate(currentDate.getDate() - 30);
      
      const dateFrom = pastDate.toISOString().split('T')[0];
      const dateTo = currentDate.toISOString().split('T')[0];

      // Buscar clientes
      const customersResponse = await this.getCustomers(1000);
      
      // Buscar pagamentos pendentes
      const pendingPayments = await this.getPayments(1000, 0, 'PENDING');
      
      // Buscar pagamentos recebidos
      const receivedPayments = await this.getPayments(1000, 0, 'RECEIVED');
      
      // Buscar pagamentos do período para calcular faturamento
      const periodPayments = await this.getPaymentsByDateRange(dateFrom, dateTo);
      
      // Calcular faturamento do período
      const totalRevenue = periodPayments.data
        .filter(payment => payment.status === 'RECEIVED')
        .reduce((sum, payment) => sum + payment.value, 0);

      return {
        totalCustomers: customersResponse.totalCount,
        totalRevenue,
        pendingPayments: pendingPayments.totalCount,
        receivedPayments: receivedPayments.totalCount,
        monthlyGrowth: {
          customers: 0,
          revenue: 0,
          pendingPayments: 0,
          receivedPayments: 0,
        },
      };
    } catch (error) {
      console.error('Erro ao buscar estatísticas:', error);
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
  async getRecentActivities() {
    try {
      const response = await this.getPayments(10, 0);
      return response.data.sort((a, b) => 
        new Date(b.dateCreated).getTime() - new Date(a.dateCreated).getTime()
      );
    } catch (error) {
      console.error('Erro ao buscar atividades recentes:', error);
      return [];
    }
  }

  // Buscar clientes inadimplentes
  async getOverdueCustomers() {
    try {
      // Buscar pagamentos em atraso
      const overduePayments = await this.getPayments(1000, 0, 'OVERDUE');
      
      // Agrupar por cliente e calcular dias de atraso
      const customerPayments = new Map();
      
      for (const payment of overduePayments.data) {
        const customer = await this.getCustomerById(payment.customer);
        const dueDate = new Date(payment.dueDate);
        const today = new Date();
        const daysOverdue = Math.floor((today.getTime() - dueDate.getTime()) / (1000 * 60 * 60 * 24));
        
        if (!customerPayments.has(payment.customer) || 
            customerPayments.get(payment.customer).daysOverdue < daysOverdue) {
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

  // Gerar boleto para cliente inadimplente
  async generateBoletoForCustomer(customerId: string, value: number, dueDate: string, description?: string) {
    const paymentData = {
      customer: customerId,
      billingType: 'BOLETO',
      value,
      dueDate,
      description: description || 'Nova cobrança gerada via sistema',
    };

    return this.createPayment(paymentData);
  }
}
