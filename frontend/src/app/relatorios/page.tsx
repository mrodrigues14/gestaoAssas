'use client';

import { useState, useEffect } from 'react';
import { asaasService, type DashboardStats, type Payment } from '@/services/asaas';
import { 
  ChartBarIcon, 
  DocumentChartBarIcon,
  CalendarIcon,
  ArrowDownTrayIcon,
  CurrencyDollarIcon,
  UsersIcon,
  CreditCardIcon,
  ClockIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon
} from '@heroicons/react/24/outline';

export default function RelatoriosPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dashboardStats, setDashboardStats] = useState<DashboardStats | null>(null);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [dateFilter, setDateFilter] = useState({
    startDate: new Date(new Date().setMonth(new Date().getMonth() - 1)).toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0]
  });

  useEffect(() => {
    loadReportsData();
  }, [dateFilter]);

  const loadReportsData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Carregar estatísticas gerais
      const stats = await asaasService.getDashboardStats();
      setDashboardStats(stats);
      
      // Carregar pagamentos do período
      const paymentsResponse = await asaasService.getPaymentsByDateRange(
        dateFilter.startDate, 
        dateFilter.endDate
      );
      setPayments(paymentsResponse.data);
      
    } catch (err) {
      setError('Erro ao carregar dados dos relatórios');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Calcular métricas do período
  const periodStats = {
    totalPayments: payments.length,
    receivedPayments: payments.filter(p => p.status === 'RECEIVED').length,
    pendingPayments: payments.filter(p => p.status === 'PENDING').length,
    overduePayments: payments.filter(p => p.status === 'OVERDUE').length,
    totalRevenue: payments.filter(p => p.status === 'RECEIVED').reduce((sum, p) => sum + p.value, 0),
    pendingRevenue: payments.filter(p => p.status === 'PENDING').reduce((sum, p) => sum + p.value, 0),
    overdueRevenue: payments.filter(p => p.status === 'OVERDUE').reduce((sum, p) => sum + p.value, 0),
    averageTicket: payments.length > 0 ? payments.reduce((sum, p) => sum + p.value, 0) / payments.length : 0,
  };

  // Agrupar pagamentos por tipo
  const paymentsByType = payments.reduce((acc, payment) => {
    acc[payment.billingType] = (acc[payment.billingType] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  // Agrupar faturamento por mês
  const revenueByMonth = payments
    .filter(p => p.status === 'RECEIVED')
    .reduce((acc, payment) => {
      const month = new Date(payment.paymentDate || payment.dateCreated).toLocaleDateString('pt-BR', { 
        year: 'numeric', 
        month: 'short' 
      });
      acc[month] = (acc[month] || 0) + payment.value;
      return acc;
    }, {} as Record<string, number>);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  const formatPercentage = (value: number) => {
    return `${value.toFixed(1)}%`;
  };

  const getBillingTypeText = (billingType: string) => {
    switch (billingType) {
      case 'BOLETO':
        return 'Boleto';
      case 'CREDIT_CARD':
        return 'Cartão de Crédito';
      case 'PIX':
        return 'PIX';
      case 'TRANSFER':
        return 'Transferência';
      default:
        return billingType;
    }
  };

  const calculateConversionRate = () => {
    if (periodStats.totalPayments === 0) return 0;
    return (periodStats.receivedPayments / periodStats.totalPayments) * 100;
  };

  const exportReport = () => {
    // Função básica de exportação - pode ser expandida
    const reportData = {
      periodo: `${dateFilter.startDate} até ${dateFilter.endDate}`,
      estatisticas: periodStats,
      pagamentosPorTipo: paymentsByType,
      faturamentoPorMes: revenueByMonth
    };
    
    const dataStr = JSON.stringify(reportData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `relatorio_${dateFilter.startDate}_${dateFilter.endDate}.json`;
    link.click();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="container mx-auto p-6">
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="container mx-auto p-6">
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
            {error}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto p-6">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Relatórios</h1>
            <p className="text-gray-600">Análise detalhada do seu negócio</p>
          </div>
          <button
            onClick={exportReport}
            className="flex items-center px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
          >
            <ArrowDownTrayIcon className="h-5 w-5 mr-2" />
            Exportar Relatório
          </button>
        </div>

        {/* Filtros de Data */}
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Período de Análise</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Data Inicial
              </label>
              <input
                type="date"
                value={dateFilter.startDate}
                onChange={(e) => setDateFilter({ ...dateFilter, startDate: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Data Final
              </label>
              <input
                type="date"
                value={dateFilter.endDate}
                onChange={(e) => setDateFilter({ ...dateFilter, endDate: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="flex items-end">
              <button
                onClick={loadReportsData}
                className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
              >
                Atualizar Relatório
              </button>
            </div>
          </div>
        </div>

        {/* Métricas Principais */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <CurrencyDollarIcon className="h-8 w-8 text-green-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Faturamento Recebido</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {formatCurrency(periodStats.totalRevenue)}
                </p>
                <div className="flex items-center mt-1">
                  <ArrowTrendingUpIcon className="h-4 w-4 text-green-500 mr-1" />
                  <span className="text-sm text-green-600">Período Selecionado</span>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <ClockIcon className="h-8 w-8 text-yellow-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Pendente de Recebimento</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {formatCurrency(periodStats.pendingRevenue)}
                </p>
                <p className="text-sm text-gray-600 mt-1">
                  {periodStats.pendingPayments} cobranças
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <ExclamationTriangleIcon className="h-8 w-8 text-red-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Valor em Atraso</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {formatCurrency(periodStats.overdueRevenue)}
                </p>
                <p className="text-sm text-gray-600 mt-1">
                  {periodStats.overduePayments} cobranças
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <ChartBarIcon className="h-8 w-8 text-blue-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Taxa de Conversão</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {formatPercentage(calculateConversionRate())}
                </p>
                <p className="text-sm text-gray-600 mt-1">
                  {periodStats.receivedPayments}/{periodStats.totalPayments} cobranças
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Gráficos e Análises */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Pagamentos por Tipo */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Cobranças por Tipo</h3>
            <div className="space-y-4">
              {Object.entries(paymentsByType).length > 0 ? (
                Object.entries(paymentsByType).map(([type, count]) => {
                  const percentage = (count / periodStats.totalPayments) * 100;
                  return (
                    <div key={type}>
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-sm font-medium text-gray-700">
                          {getBillingTypeText(type)}
                        </span>
                        <span className="text-sm text-gray-500">
                          {count} ({formatPercentage(percentage)})
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-blue-600 h-2 rounded-full"
                          style={{ width: `${percentage}%` }}
                        ></div>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="text-center py-8">
                  <CreditCardIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">Nenhuma cobrança no período selecionado</p>
                </div>
              )}
            </div>
          </div>

          {/* Faturamento por Mês */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Faturamento por Mês</h3>
            <div className="space-y-4">
              {Object.entries(revenueByMonth).length > 0 ? (
                Object.entries(revenueByMonth).map(([month, revenue]) => {
                  const maxRevenue = Math.max(...Object.values(revenueByMonth));
                  const percentage = maxRevenue > 0 ? (revenue / maxRevenue) * 100 : 0;
                  return (
                    <div key={month}>
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-sm font-medium text-gray-700">
                          {month}
                        </span>
                        <span className="text-sm text-gray-900 font-semibold">
                          {formatCurrency(revenue)}
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-green-600 h-2 rounded-full"
                          style={{ width: `${percentage}%` }}
                        ></div>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="text-center py-8">
                  <CalendarIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">Nenhum faturamento no período selecionado</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Resumo Detalhado */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Resumo Detalhado</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="space-y-2">
              <h4 className="font-medium text-gray-700">Estatísticas Gerais</h4>
              <div className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Total de Cobranças:</span>
                  <span className="font-medium">{periodStats.totalPayments}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Ticket Médio:</span>
                  <span className="font-medium">{formatCurrency(periodStats.averageTicket)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Taxa de Recebimento:</span>
                  <span className="font-medium">{formatPercentage(calculateConversionRate())}</span>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <h4 className="font-medium text-gray-700">Status das Cobranças</h4>
              <div className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <span className="text-green-600">✓ Recebidas:</span>
                  <span className="font-medium">{periodStats.receivedPayments}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-yellow-600">⏳ Pendentes:</span>
                  <span className="font-medium">{periodStats.pendingPayments}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-red-600">⚠️ Vencidas:</span>
                  <span className="font-medium">{periodStats.overduePayments}</span>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <h4 className="font-medium text-gray-700">Valores Financeiros</h4>
              <div className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <span className="text-green-600">Recebido:</span>
                  <span className="font-medium">{formatCurrency(periodStats.totalRevenue)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-yellow-600">A Receber:</span>
                  <span className="font-medium">{formatCurrency(periodStats.pendingRevenue)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-red-600">Em Atraso:</span>
                  <span className="font-medium">{formatCurrency(periodStats.overdueRevenue)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Informações do Sistema */}
        {dashboardStats && (
          <div className="mt-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg text-white p-6">
            <h3 className="text-lg font-semibold mb-4">📊 Visão Geral do Sistema</h3>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold">{dashboardStats.totalCustomers}</div>
                <div className="text-blue-100">Total de Clientes</div>
              </div>
              <div>
                <div className="text-2xl font-bold">{formatCurrency(dashboardStats.totalRevenue)}</div>
                <div className="text-blue-100">Faturamento Total</div>
              </div>
              <div>
                <div className="text-2xl font-bold">{dashboardStats.pendingPayments}</div>
                <div className="text-blue-100">Cobranças Pendentes</div>
              </div>
              <div>
                <div className="text-2xl font-bold">{dashboardStats.receivedPayments}</div>
                <div className="text-blue-100">Cobranças Recebidas</div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
