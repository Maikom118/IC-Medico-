import { useState } from 'react';
import { Plus, Edit, Trash2, FileText, X, Save } from 'lucide-react';
import type { ReportTemplate } from '../App';

type ReportTemplatesProps = {
  templates: ReportTemplate[];
  onAddTemplate: (template: ReportTemplate) => void;
  onDeleteTemplate: (id: string) => void;
};

export function ReportTemplates({ templates, onAddTemplate, onDeleteTemplate }: ReportTemplatesProps) {
  const [showModal, setShowModal] = useState(false);
  const [templateName, setTemplateName] = useState('');
  const [templateCategory, setTemplateCategory] = useState('');
  const [templateContent, setTemplateContent] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const categories = ['Raio-X', 'Tomografia', 'Ressonância', 'Ultrassom', 'Mamografia', 'Outro'];

  const handleCreateTemplate = () => {
    if (!templateName || !templateCategory || !templateContent) {
      alert('Por favor, preencha todos os campos');
      return;
    }

    const newTemplate: ReportTemplate = {
      id: Date.now().toString(),
      name: templateName,
      category: templateCategory,
      content: templateContent,
      createdAt: new Date().toISOString().split('T')[0],
    };

    onAddTemplate(newTemplate);
    
    // Reset form
    setTemplateName('');
    setTemplateCategory('');
    setTemplateContent('');
    setShowModal(false);
  };

  const filteredTemplates = templates.filter(template => {
    const matchesSearch = template.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         template.category.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || template.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const groupedTemplates = filteredTemplates.reduce((acc, template) => {
    if (!acc[template.category]) {
      acc[template.category] = [];
    }
    acc[template.category].push(template);
    return acc;
  }, {} as Record<string, ReportTemplate[]>);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-gray-800 mb-2">Modelos de Laudos</h2>
          <p className="text-gray-600">Crie e gerencie seus modelos de laudos personalizados</p>
        </div>
        <button 
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus size={20} />
          Novo Modelo
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm p-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Buscar</label>
            <input
              type="text"
              placeholder="Buscar por nome ou categoria..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Filtrar por Categoria</label>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">Todas as categorias</option>
              {categories.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Templates Grid */}
      {Object.keys(groupedTemplates).length > 0 ? (
        <div className="space-y-8">
          {Object.entries(groupedTemplates).map(([category, categoryTemplates]) => (
            <div key={category}>
              <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                <FileText size={24} className="text-blue-600" />
                {category}
                <span className="text-sm font-normal text-gray-500">
                  ({categoryTemplates.length} {categoryTemplates.length === 1 ? 'modelo' : 'modelos'})
                </span>
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {categoryTemplates.map((template) => (
                  <div key={template.id} className="bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition-shadow border border-gray-200">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <h4 className="font-bold text-gray-800 mb-2">{template.name}</h4>
                        <p className="text-xs text-gray-500">
                          Criado em {new Date(template.createdAt).toLocaleDateString('pt-BR')}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <button className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
                          <Edit size={16} />
                        </button>
                        <button 
                          onClick={() => {
                            if (confirm('Tem certeza que deseja excluir este modelo?')) {
                              onDeleteTemplate(template.id);
                            }
                          }}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                    
                    <div className="bg-gray-50 rounded-lg p-4 mb-4 max-h-40 overflow-y-auto">
                      <pre className="text-xs text-gray-700 whitespace-pre-wrap font-mono">
                        {template.content.substring(0, 200)}
                        {template.content.length > 200 && '...'}
                      </pre>
                    </div>
                    
                    <div className="flex gap-2">
                      <button className="flex-1 px-4 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors text-sm font-medium">
                        Visualizar
                      </button>
                      <button className="flex-1 px-4 py-2 bg-green-50 text-green-600 rounded-lg hover:bg-green-100 transition-colors text-sm font-medium">
                        Usar Modelo
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm p-12 text-center">
          <FileText size={64} className="mx-auto text-gray-300 mb-4" />
          <h3 className="text-xl font-bold text-gray-800 mb-2">Nenhum modelo encontrado</h3>
          <p className="text-gray-600 mb-6">
            {searchTerm || selectedCategory !== 'all' 
              ? 'Tente ajustar os filtros de busca' 
              : 'Comece criando seu primeiro modelo de laudo'}
          </p>
          {!searchTerm && selectedCategory === 'all' && (
            <button 
              onClick={() => setShowModal(true)}
              className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Plus size={20} />
              Criar Primeiro Modelo
            </button>
          )}
        </div>
      )}

      {/* Create Template Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
              <h3 className="text-2xl font-bold text-gray-800">Novo Modelo de Laudo</h3>
              <button 
                onClick={() => setShowModal(false)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X size={24} />
              </button>
            </div>
            
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nome do Modelo <span className="text-red-500">*</span>
                </label>
                <input 
                  type="text"
                  value={templateName}
                  onChange={(e) => setTemplateName(e.target.value)}
                  placeholder="Ex: Raio-X de Tórax - Pneumonia"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Categoria <span className="text-red-500">*</span>
                </label>
                <select
                  value={templateCategory}
                  onChange={(e) => setTemplateCategory(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Selecione uma categoria</option>
                  {categories.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Conteúdo do Modelo <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={templateContent}
                  onChange={(e) => setTemplateContent(e.target.value)}
                  placeholder="Digite o conteúdo do modelo de laudo..."
                  rows={15}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none font-mono text-sm"
                />
                <p className="text-xs text-gray-500 mt-2">
                  💡 Dica: Use este espaço para criar um modelo que você pode reutilizar. Inclua todas as seções que você normalmente usa.
                </p>
              </div>

              {/* Quick Templates */}
              <div className="bg-blue-50 rounded-lg p-4">
                <p className="text-sm font-medium text-gray-700 mb-3">Modelos rápidos:</p>
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => setTemplateContent('INDICAÇÃO CLÍNICA:\n\nTÉCNICA:\n\nDESCRIÇÃO:\n\nCONCLUSÃO:\n')}
                    className="px-3 py-1 bg-white text-blue-600 rounded-lg hover:bg-blue-100 transition-colors text-sm"
                  >
                    Estrutura Básica
                  </button>
                  <button
                    onClick={() => setTemplateContent('INDICAÇÃO CLÍNICA:\n\nTÉCNICA: Radiografia de tórax em incidências PA e perfil.\n\nDESCRIÇÃO:\nPulmões:\nCoração:\nMediastino:\nEstrutura óssea:\n\nCONCLUSÃO:\n')}
                    className="px-3 py-1 bg-white text-blue-600 rounded-lg hover:bg-blue-100 transition-colors text-sm"
                  >
                    Raio-X Tórax
                  </button>
                  <button
                    onClick={() => setTemplateContent('INDICAÇÃO CLÍNICA:\n\nTÉCNICA: Exame realizado em equipamento de tomografia computadorizada helicoidal multislice.\n\nDESCRIÇÃO:\n\nCONCLUSÃO:\n')}
                    className="px-3 py-1 bg-white text-blue-600 rounded-lg hover:bg-blue-100 transition-colors text-sm"
                  >
                    Tomografia
                  </button>
                </div>
              </div>
              
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={handleCreateTemplate}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <Save size={20} />
                  Salvar Modelo
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
