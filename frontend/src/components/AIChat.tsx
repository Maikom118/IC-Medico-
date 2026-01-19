import { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, Sparkles } from 'lucide-react';

type Message = {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
};

export function AIChat() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'assistant',
      content: 'Olá! Sou o assistente de IA da MediPlataforma. Posso ajudá-lo com interpretação de exames, sugestões de diagnóstico, revisão de laudos e muito mais. Como posso ajudá-lo hoje?',
      timestamp: new Date(),
    },
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const generateAIResponse = (userMessage: string): string => {
    const lowerMessage = userMessage.toLowerCase();
    
    if (lowerMessage.includes('raio-x') || lowerMessage.includes('radiografia')) {
      return 'Com base na sua consulta sobre raio-x, aqui estão alguns pontos importantes:\n\n1. **Avaliação da técnica**: Verifique se a incidência e penetração estão adequadas\n2. **Análise sistemática**: Avalie ossos, tecidos moles, e espaços articulares\n3. **Comparação**: Sempre que possível, compare com exames anteriores\n\nGostaria de discutir algum achado específico?';
    }
    
    if (lowerMessage.includes('tomografia') || lowerMessage.includes('tc')) {
      return 'Para análise de tomografia computadorizada, recomendo:\n\n1. **Janelas adequadas**: Use janelas de parênquima, mediastino e óssea conforme necessário\n2. **Cortes multiplanares**: Avalie em múltiplos planos (axial, coronal, sagital)\n3. **Contraste**: Observe a fase de realce e distribuição do contraste\n4. **Achados secundários**: Não esqueça de avaliar estruturas adjacentes\n\nPosso ajudar com alguma dúvida específica sobre os achados?';
    }
    
    if (lowerMessage.includes('laudo') || lowerMessage.includes('relatorio')) {
      return 'Para estruturar um laudo completo e claro, sugiro:\n\n1. **Indicação clínica**: Sempre mencione a suspeita ou indicação\n2. **Técnica**: Descreva brevemente o método utilizado\n3. **Descrição**: Seja objetivo e sistemático nos achados\n4. **Conclusão**: Seja claro e direto, correlacionando com a clínica\n\nPrecisa de ajuda para revisar algum laudo específico?';
    }
    
    if (lowerMessage.includes('ressonância') || lowerMessage.includes('rm')) {
      return 'Na análise de ressonância magnética, considere:\n\n1. **Sequências**: T1, T2, FLAIR, difusão - cada uma fornece informações diferentes\n2. **Contraste**: O realce pode indicar quebra de barreira ou vascularização\n3. **Artefatos**: Esteja atento a artefatos de movimento ou metálicos\n4. **Sinais**: Analise hiper/hipossinal em diferentes sequências\n\nQual região ou achado você gostaria de discutir?';
    }

    if (lowerMessage.includes('obrigad') || lowerMessage.includes('valeu')) {
      return 'Por nada! Estou aqui para ajudar sempre que precisar. Boa sorte com seus laudos! 😊';
    }
    
    return 'Entendo sua pergunta. Como assistente médico de IA, posso ajudar com:\n\n• **Interpretação de exames** de imagem\n• **Sugestões de diagnóstico diferencial**\n• **Estruturação de laudos**\n• **Revisão de terminologia médica**\n• **Protocolos de exame**\n\nPoderia fornecer mais detalhes sobre o que você precisa? Por exemplo, qual tipo de exame ou achado você está analisando?';
  };

  const handleSendMessage = async () => {
    if (!inputValue.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: inputValue,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsTyping(true);

    // Simulate AI response delay
    setTimeout(() => {
      const aiResponse: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: generateAIResponse(inputValue),
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, aiResponse]);
      setIsTyping(false);
    }, 1000 + Math.random() * 1000);
  };

  const quickQuestions = [
    'Como interpretar um raio-x de tórax?',
    'Protocolo para TC de abdome',
    'Estrutura de laudo de ressonância',
    'Diagnóstico diferencial de nódulo pulmonar',
  ];

  return (
    <div className="h-full flex flex-col">
      <div className="mb-6">
        <h2 className="text-3xl font-bold text-gray-800 mb-2">Assistente IA</h2>
        <p className="text-gray-600">Converse com nossa IA para obter ajuda com diagnósticos e laudos</p>
      </div>

      <div className="flex-1 bg-white rounded-xl shadow-sm flex flex-col overflow-hidden">
        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex gap-3 ${message.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}
            >
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                  message.role === 'user' ? 'bg-blue-600' : 'bg-purple-600'
                }`}
              >
                {message.role === 'user' ? (
                  <User size={18} className="text-white" />
                ) : (
                  <Bot size={18} className="text-white" />
                )}
              </div>
              
              <div
                className={`max-w-[70%] rounded-lg px-4 py-3 ${
                  message.role === 'user'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-800'
                }`}
              >
                <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                <p className={`text-xs mt-1 ${message.role === 'user' ? 'text-blue-100' : 'text-gray-500'}`}>
                  {message.timestamp.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>
            </div>
          ))}
          
          {isTyping && (
            <div className="flex gap-3">
              <div className="w-8 h-8 rounded-full bg-purple-600 flex items-center justify-center flex-shrink-0">
                <Bot size={18} className="text-white" />
              </div>
              <div className="bg-gray-100 rounded-lg px-4 py-3">
                <div className="flex gap-1">
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                </div>
              </div>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>

        {/* Quick Questions */}
        {messages.length === 1 && (
          <div className="px-6 pb-4">
            <div className="flex items-center gap-2 mb-3">
              <Sparkles size={16} className="text-purple-600" />
              <p className="text-sm font-medium text-gray-700">Perguntas sugeridas:</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {quickQuestions.map((question, index) => (
                <button
                  key={index}
                  onClick={() => setInputValue(question)}
                  className="text-left text-sm px-4 py-2 bg-purple-50 text-purple-700 rounded-lg hover:bg-purple-100 transition-colors"
                >
                  {question}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Input Area */}
        <div className="border-t border-gray-200 p-4">
          <div className="flex gap-3">
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
              placeholder="Digite sua pergunta..."
              className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
            <button
              onClick={handleSendMessage}
              disabled={!inputValue.trim()}
              className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center gap-2"
            >
              <Send size={20} />
            </button>
          </div>
          <p className="text-xs text-gray-500 mt-2">
            💡 Esta IA é um assistente educacional. Sempre verifique informações críticas com fontes confiáveis.
          </p>
        </div>
      </div>
    </div>
  );
}
