import { Controller, Get, Post, Body, Query, Param, UseGuards } from '@nestjs/common';
import { AsaasService } from './asaas.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('api/asaas')
@UseGuards(JwtAuthGuard)
export class AsaasController {
  constructor(private readonly asaasService: AsaasService) {}

  @Get('status')
  async checkApiStatus() {
    const status = await this.asaasService.checkApiStatus();
    return { status };
  }

  @Get('dashboard-stats')
  async getDashboardStats() {
    return this.asaasService.getDashboardStats();
  }

  @Get('customers')
  async getCustomers(
    @Query('limit') limit?: string,
    @Query('offset') offset?: string
  ) {
    const limitNum = limit ? parseInt(limit) : 100;
    const offsetNum = offset ? parseInt(offset) : 0;
    return this.asaasService.getCustomers(limitNum, offsetNum);
  }

  @Get('customers/:id')
  async getCustomerById(@Param('id') id: string) {
    return this.asaasService.getCustomerById(id);
  }

  @Post('customers')
  async createCustomer(@Body() customerData: any) {
    return this.asaasService.createCustomer(customerData);
  }

  @Get('payments')
  async getPayments(
    @Query('limit') limit?: string,
    @Query('offset') offset?: string,
    @Query('status') status?: string
  ) {
    const limitNum = limit ? parseInt(limit) : 100;
    const offsetNum = offset ? parseInt(offset) : 0;
    return this.asaasService.getPayments(limitNum, offsetNum, status);
  }

  @Get('payments/date-range')
  async getPaymentsByDateRange(
    @Query('dateFrom') dateFrom: string,
    @Query('dateTo') dateTo: string
  ) {
    return this.asaasService.getPaymentsByDateRange(dateFrom, dateTo);
  }

  @Post('payments')
  async createPayment(@Body() paymentData: any) {
    return this.asaasService.createPayment(paymentData);
  }

  @Get('recent-activities')
  async getRecentActivities() {
    return this.asaasService.getRecentActivities();
  }

  @Get('overdue-customers')
  async getOverdueCustomers() {
    return this.asaasService.getOverdueCustomers();
  }

  @Post('generate-boleto')
  async generateBoletoForCustomer(@Body() boletoData: {
    customerId: string;
    value: number;
    dueDate: string;
    description?: string;
  }) {
    return this.asaasService.generateBoletoForCustomer(
      boletoData.customerId,
      boletoData.value,
      boletoData.dueDate,
      boletoData.description
    );
  }
}
