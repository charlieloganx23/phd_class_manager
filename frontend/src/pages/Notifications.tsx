import { useEffect, useState } from 'react';
import { notificationService } from '../services';
import Layout from '../components/Layout';
import Loading from '../components/Loading';

interface Notification {
  id: number;
  tipo: string;
  mensagem: string;
  destinatarios: string[];
  status: string;
  created_at: string;
}

export default function Notifications() {
  const [notificacoes, setNotificacoes] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [mensagem, setMensagem] = useState('');
  const [tipo, setTipo] = useState('geral');

  useEffect(() => {
    loadNotifications();
  }, []);

  const loadNotifications = async () => {
    try {
      const data = await notificationService.getAll();
      setNotificacoes(data);
    } catch (error) {
      console.error('Erro ao carregar notificações:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSend = async () => {
    try {
      await notificationService.send({
        tipo,
        mensagem,
        destinatarios: [],
      });
      setMensagem('');
      setShowForm(false);
      loadNotifications();
      alert('Notificação enviada com sucesso!');
    } catch (error) {
      console.error('Erro ao enviar notificação:', error);
      alert('Erro ao enviar notificação');
    }
  };

  if (isLoading) return <Loading />;

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold text-gray-900">📱 Notificações WhatsApp</h1>
          <button 
            onClick={() => setShowForm(!showForm)}
            className="btn-primary"
          >
            + Nova Notificação
          </button>
        </div>

        {/* Form */}
        {showForm && (
          <div className="card">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Enviar Notificação</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tipo
                </label>
                <select
                  value={tipo}
                  onChange={(e) => setTipo(e.target.value)}
                  className="input-field"
                >
                  <option value="geral">Geral</option>
                  <option value="aula">Aula</option>
                  <option value="aviso">Aviso</option>
                  <option value="cancelamento">Cancelamento</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Mensagem
                </label>
                <textarea
                  value={mensagem}
                  onChange={(e) => setMensagem(e.target.value)}
                  className="input-field"
                  rows={4}
                  placeholder="Digite a mensagem..."
                />
              </div>

              <div className="flex space-x-3">
                <button 
                  onClick={handleSend}
                  className="btn-primary"
                  disabled={!mensagem}
                >
                  Enviar para Todos os Alunos
                </button>
                <button 
                  onClick={() => setShowForm(false)}
                  className="btn-secondary"
                >
                  Cancelar
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Notifications List */}
        <div className="card">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Histórico de Notificações</h2>
          <div className="space-y-3">
            {notificacoes.length > 0 ? (
              notificacoes.map((notif, index) => (
                <div 
                  key={`notif-${notif.id}-${index}`} 
                  className="p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center mb-2">
                        <span className={`px-2 py-1 rounded text-xs font-medium mr-2 ${
                          notif.tipo === 'geral' ? 'bg-blue-100 text-blue-800' :
                          notif.tipo === 'aula' ? 'bg-green-100 text-green-800' :
                          notif.tipo === 'aviso' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {notif.tipo}
                        </span>
                        <span className={`px-2 py-1 rounded text-xs font-medium ${
                          notif.status === 'enviado' ? 'bg-green-100 text-green-800' :
                          notif.status === 'pendente' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {notif.status}
                        </span>
                      </div>
                      <p className="text-gray-900 mb-2">{notif.mensagem}</p>
                      <p className="text-xs text-gray-500">
                        {new Date(notif.created_at).toLocaleString('pt-BR')}
                      </p>
                    </div>
                    <div className="ml-4 text-sm text-gray-600">
                      {notif.destinatarios.length} destinatários
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-gray-500 text-center py-8">Nenhuma notificação enviada</p>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
}
