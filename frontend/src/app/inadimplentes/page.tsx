'use client';

import { useState, useEffect } from 'react';
import { asaasService, Customer, Payment } from '@/services/asaas';
import { Clock, CreditCard, AlertTriangle, DollarSign, FileText } from 'lucide-react';

interface OverdueCustomer {
  customer: Customer;
  payment: Payment;
  daysOverdue: number;
}

interface BoletoModalProps {
  isOpen: boolean;
  onClose: () => void;
  customer: Customer;
  onGenerate: (dueDate: string, value: number, description: string) => void;
}

function BoletoModal({ isOpen, onClose, customer, onGenerate }: BoletoModalProps) {
  const [dueDate, setDueDate] = useState('');
  const [value, setValue] = useState('');
  const [description, setDescription] = useState('');

  useEffect(() => {
    // Definir data mínima como amanhã
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    setDueDate(tomorrow.toISOString().split('T')[0]);
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (dueDate && value && parseFloat(value) > 0) {
      onGenerate(dueDate, parseFloat(value), description);
      onClose();
      // Reset form
      setValue('');
      setDescription('');
    } else {
      alert('Por favor, preencha todos os campos obrigatórios');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <h3 className="text-lg font-semibold mb-4">Gerar Boleto</h3>
        <p className="text-gray-600 mb-4">Cliente: {customer.name}</p>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Valor (R$)
            </label>
            <input
              type="number"
              step="0.01"
              min="0.01"
              value={value}
              onChange={(e) => setValue(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Data de Vencimento
            </label>
            <input
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              min={new Date().toISOString().split('T')[0]}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Descrição (opcional)
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              rows={3}
              placeholder="Descrição da cobrança..."
            />
          </div>
          
          <div className="flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              Gerar Boleto
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function InadimplentesPage() {
  const [overdueCustomers, setOverdueCustomers] = useState<OverdueCustomer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    loadOverdueCustomers();
  }, []);

  const loadOverdueCustomers = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await asaasService.getOverdueCustomers();
      setOverdueCustomers(response.data);
    } catch (err) {
      setError('Erro ao carregar clientes inadimplentes');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateBoleto = async (dueDate: string, value: number, description: string) => {
    if (!selectedCustomer) return;

    try {
      if (value <= 0) {
        alert('Por favor, informe um valor válido');
        return;
      }

      await asaasService.generateBoletoForCustomer(
        selectedCustomer.id,
        value,
        dueDate,
        description
      );

      alert(`Boleto gerado com sucesso!\nValor: ${formatCurrency(value)}\nVencimento: ${formatDate(dueDate)}`);
      
      // Recarregar a lista de inadimplentes
      await loadOverdueCustomers();
      
    } catch (err) {
      alert('Erro ao gerar boleto. Verifique os dados e tente novamente.');
      console.error(err);
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  const getDaysOverdueColor = (days: number) => {
    if (days <= 15) return 'text-yellow-600 bg-yellow-100';
    if (days <= 30) return 'text-orange-600 bg-orange-100';
    return 'text-red-600 bg-red-100';
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
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Clientes Inadimplentes</h1>
        <p className="text-gray-600">Gerencie clientes com pagamentos em atraso</p>
      </div>

      {/* Estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <AlertTriangle className="h-8 w-8 text-red-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Total Inadimplentes</p>
              <p className="text-2xl font-semibold text-gray-900">{overdueCustomers.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <DollarSign className="h-8 w-8 text-orange-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Valor Total em Atraso</p>
              <p className="text-2xl font-semibold text-gray-900">
                {formatCurrency(overdueCustomers.reduce((sum, item) => sum + item.payment.value, 0))}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <Clock className="h-8 w-8 text-yellow-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Média de Dias em Atraso</p>
              <p className="text-2xl font-semibold text-gray-900">
                {overdueCustomers.length > 0 
                  ? Math.round(overdueCustomers.reduce((sum, item) => sum + item.daysOverdue, 0) / overdueCustomers.length)
                  : 0} dias
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Lista de clientes inadimplentes */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Lista de Inadimplentes</h2>
        </div>

        {overdueCustomers.length === 0 ? (
          <div className="p-8 text-center">
            <AlertTriangle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">Nenhum cliente inadimplente encontrado</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Cliente
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Valor em Atraso
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Data de Vencimento
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Dias em Atraso
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Ações
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {overdueCustomers.map((item) => (
                  <tr key={item.customer.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {item.customer.name}
                        </div>
                        <div className="text-sm text-gray-500">
                          {item.customer.email}
                        </div>
                        {item.customer.phone && (
                          <div className="text-sm text-gray-500">
                            {item.customer.phone}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {formatCurrency(item.payment.value)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {formatDate(item.payment.dueDate)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getDaysOverdueColor(item.daysOverdue)}`}>
                        {item.daysOverdue} dias
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                      <button
                        onClick={() => {
                          setSelectedCustomer(item.customer);
                          setIsModalOpen(true);
                        }}
                        className="inline-flex items-center px-3 py-1 bg-blue-600 text-white text-xs rounded-md hover:bg-blue-700 transition-colors"
                      >
                        <FileText className="h-3 w-3 mr-1" />
                        Gerar Boleto
                      </button>
                      
                      {item.payment.bankSlipUrl && (
                        <a
                          href={item.payment.bankSlipUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center px-3 py-1 bg-gray-600 text-white text-xs rounded-md hover:bg-gray-700 transition-colors"
                        >
                          <CreditCard className="h-3 w-3 mr-1" />
                          Ver Boleto Original
                        </a>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal para gerar boleto */}
      <BoletoModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        customer={selectedCustomer!}
        onGenerate={handleGenerateBoleto}
      />
      </div>
    </div>
  );
}
