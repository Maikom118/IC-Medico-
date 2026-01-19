import { Download, Save, Upload, Mic, Square, Play, Pause, Trash2, Image as ImageIcon, X, FileText, Plus, Calendar, Clock, ChevronDown, ChevronUp } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import jsPDF from 'jspdf';
import { AudioRecorder } from "./AudioRecorder";

/*
*/

type Patient = {
  id: string;
  name: string;
  age: number;
  email: string;
};

type ReportEditorProps = {
  selectedPatient: Patient | null;
};

type ReportStatus = 'pending' | 'in-progress' | 'completed' | 'reviewed';

type AudioRecording = {
  id: string;
  blob: Blob;
  url: string;
  duration: number;
  timestamp: Date;
};

type Template = {
  id: string;
  name: string;
  category: string;
  content: string;
};

type MockReport = {
  id: string;
  patientId: string;
  content: string;
  type: string;
  status: ReportStatus;
  date: Date;
};

export function ReportEditor({ selectedPatient }: ReportEditorProps) {
  const [reportContent, setReportContent] = useState('');
  const [reportType, setReportType] = useState('');
  const [images, setImages] = useState<string[]>([]);
  const [patientSearch, setPatientSearch] = useState('');
  const [selectedPatientLocal, setSelectedPatientLocal] = useState<Patient | null>(selectedPatient);
  const [audioRecordings, setAudioRecordings] = useState<AudioRecording[]>([]);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [playingAudioId, setPlayingAudioId] = useState<string | null>(null);
  const [currentReportId, setCurrentReportId] = useState<string | null>(null);
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const recordingIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const audioRefs = useRef<Map<string, HTMLAudioElement>>(new Map());
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const statusDropdownRef = useRef<HTMLDivElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  


  
  const [editHistory, setEditHistory] = useState<string[]>(['']);
  const [historyIndex, setHistoryIndex] = useState(0);
  const [showPreview, setShowPreview] = useState(false);
  const [audioError, setAudioError] = useState<string>('');
  const [reportStatus, setReportStatus] = useState<ReportStatus>('in-progress');
  const [showStatusDropdown, setShowStatusDropdown] = useState(false);
  const [showAudioSection, setShowAudioSection] = useState(false);
  const [showImagesSection, setShowImagesSection] = useState(false);
  const [showTemplatesSection, setShowTemplatesSection] = useState(false);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [transcriptionProgress, setTranscriptionProgress] = useState('');
  const [micPermissionStatus, setMicPermissionStatus] = useState<'unknown' | 'granted' | 'denied' | 'prompt'>('unknown');
  const [showPermissionGuide, setShowPermissionGuide] = useState(false);
  
  const mockPatients: Patient[] = [
    { id: '1', name: 'Maria Santos', age: 45, email: 'maria.santos@example.com' },
    { id: '2', name: 'João Oliveira', age: 62, email: 'joao.oliveira@example.com' },
    { id: '3', name: 'Ana Costa', age: 34, email: 'ana.costa@example.com' },
  ];

  // Laudos de teste
  const mockReports: MockReport[] = [
    {
      id: 'report-1',
      patientId: '1',
      type: 'Raio-X Tórax',
      status: 'completed',
      date: new Date('2026-01-07'),
      content: `LAUDO DE RAIO-X DE TÓRAX

DADOS DO PACIENTE:
Nome: Maria Santos
Idade: 45 anos
Data do Exame: 07/01/2026

TÉCNICA:
Radiografia de tórax em incidências PA e perfil.

ANÁLISE:
Pulmões com transparência preservada, sem evidências de consolidações, nódulos ou massas.
Trama vascular pulmonar de aspecto habitual.
Seios costofrênicos livres.
Área cardíaca dentro dos limites da normalidade.
Mediastino de contornos regulares, sem alargamento.
Arcabouço ósseo íntegro.

CONCLUSÃO:
Radiografia de tórax sem alterações significativas.

Dr. João Silva
CRM XXXXX/XX
Radiologista`
    },
    {
      id: 'report-2',
      patientId: '2',
      type: 'Tomografia Computadorizada',
      status: 'in-progress',
      date: new Date('2026-01-07'),
      content: `LAUDO DE TOMOGRAFIA COMPUTADORIZADA DE ABDOME

DADOS DO PACIENTE:
Nome: João Oliveira
Idade: 62 anos
Data do Exame: 07/01/2026

TÉCNICA:
Tomografia computadorizada de abdome total, sem e com contraste endovenoso.

ANÁLISE:
Fígado de dimensões e contornos normais, com densidade homogênea.
Vesícula biliar de paredes finas, sem cálculos.
Vias biliares intra e extra-hepáticas sem dilatação.
Pâncreas de morfologia preservada.
Baço de dimensões normais.
Rins tópicos, de morfologia e dimensões preservadas, sem sinais de hidronefrose.
Bexiga de contornos regulares.
Ausência de líquido livre na cavidade.
Alças intestinais de aspecto habitual.

CONCLUSÃO:
Tomografia de abdome sem alterações significativas no momento.

Dr. João Silva
CRM XXXXX/XX
Radiologista`
    },
    {
      id: 'report-3',
      patientId: '3',
      type: 'Ressonância Magnética',
      status: 'pending',
      date: new Date('2026-01-06'),
      content: `LAUDO DE RESSONÂNCIA MAGNÉTICA DE JOELHO DIREITO

DADOS DO PACIENTE:
Nome: Ana Costa
Idade: 34 anos
Data do Exame: 06/01/2026

TÉCNICA:
Ressonância magnética do joelho direito nas sequências T1, T2, STIR e densidade de prótons.

ANÁLISE:
Menisco medial: Aspecto anatômico preservado.
Menisco lateral: Pequena área de hipersinal no corno posterior, inespecífica.
Ligamento cruzado anterior: Íntegro.
Ligamento cruzado posterior: Íntegro.
Ligamentos colaterais: Preservados.
Cartilagem articular: Sem evidências de lesões condrais.
Derrame articular: Discreto derrame articular.

CONCLUSÃO:
1. Discreto derrame articular.
2. Pequena área de hipersinal no corno posterior do menisco lateral, a correlacionar com dados clínicos.

Dr. João Silva
CRM XXXXX/XX
Radiologista`
    }
  ];

  const examTypes = [
    'Raio-X Tórax',
    'Tomografia Computadorizada',
    'Ressonância Magnética',
    'Ultrassom',
    'Mamografia',
    'Densitometria Óssea',
    'Outro'
  ];

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      const newImages = Array.from(files).map(file => URL.createObjectURL(file));
      setImages([...images, ...newImages]);
    }
  };

  const removeImage = (index: number) => {
    setImages(images.filter((_, i) => i !== index));
  };

  const startRecording = async () => {
    try {
      setAudioError('');
      
      // Verificar se a API está disponível
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        setAudioError('Seu navegador não suporta gravação de áudio. Use Chrome, Firefox ou Edge.');
        setTimeout(() => setAudioError(''), 10000);
        return;
      }
      
      // Detectar se está em iframe (como Figma Make)
      const isInIframe = window.self !== window.top;
      if (isInIframe) {
        setAudioError('⚠️ GRAVAÇÃO EM TEMPO REAL NÃO DISPONÍVEL - O Figma Make roda em iframe e bloqueia acesso ao microfone por segurança. USE O BOTÃO "UPLOAD" ao lado para enviar arquivos de áudio gravados previamente.');
        setTimeout(() => setAudioError(''), 20000);
        return;
      }
      
      // Verificar se está em contexto seguro
      if (window.location.protocol !== 'https:' && window.location.hostname !== 'localhost') {
        setAudioError('Gravação de áudio requer HTTPS. O site precisa estar em uma conexão segura.');
        setTimeout(() => setAudioError(''), 10000);
        return;
      }
      
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          sampleRate: 44100
        } 
      });
      
      streamRef.current = stream;
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        const audioUrl = URL.createObjectURL(audioBlob);
        
        const newRecording: AudioRecording = {
          id: Date.now().toString(),
          blob: audioBlob,
          url: audioUrl,
          duration: recordingTime,
          timestamp: new Date(),
        };
        
        setAudioRecordings(prev => [...prev, newRecording]);
        setRecordingTime(0);
        
        if (streamRef.current) {
          streamRef.current.getTracks().forEach(track => track.stop());
          streamRef.current = null;
        }
      };

      mediaRecorder.start();
      setIsRecording(true);
      
      recordingIntervalRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);
      
    } catch (error) {
      console.error('Erro ao acessar microfone:', error);
      let errorMessage = '';
      
      // Detectar se está em iframe
      const isInIframe = window.self !== window.top;
      
      if (error instanceof DOMException) {
        if (error.name === 'NotAllowedError') {
          if (isInIframe) {
            errorMessage = '🚫 BLOQUEADO POR IFRAME - O Figma Make não permite gravação direta por rodar em iframe. SOLUÇÃO: Use o botão "UPLOAD" para enviar arquivos de áudio (.mp3, .wav, .m4a, etc) já gravados no seu computador ou celular.';
          } else {
            errorMessage = '🔒 Permissão negada. SOLUÇÃO: Clique no ícone 🔒 ou ℹ️ na barra de endereço do navegador → Permissões → Permitir Microfone. Depois recarregue a página.';
          }
        } else if (error.name === 'NotFoundError') {
          errorMessage = '🎤 Nenhum microfone encontrado. Verifique se há um microfone conectado ao computador.';
        } else if (error.name === 'NotReadableError') {
          errorMessage = '⚠️ Microfone em uso por outro aplicativo. Feche outros programas que possam estar usando o microfone (Zoom, Teams, Discord, etc).';
        } else if (error.name === 'SecurityError') {
          errorMessage = '🔐 Erro de segurança. A gravação de áudio só funciona em páginas HTTPS ou localhost.';
        } else {
          errorMessage = `Erro: ${error.name} - ${error.message}`;
        }
      } else {
        errorMessage = 'Erro desconhecido ao acessar microfone. Use o botão UPLOAD para enviar arquivos de áudio.';
      }
      
      setAudioError(errorMessage);
      setTimeout(() => setAudioError(''), 20000);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      
      if (recordingIntervalRef.current) {
        clearInterval(recordingIntervalRef.current);
      }
    }
  };

  const handleAudioUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      Array.from(files).forEach(file => {
        const audioUrl = URL.createObjectURL(file);
        const newRecording: AudioRecording = {
          id: Date.now().toString() + Math.random(),
          blob: file,
          url: audioUrl,
          duration: 0,
          timestamp: new Date(),
        };
        setAudioRecordings(prev => [...prev, newRecording]);
      });
    }
  };

  const togglePlayAudio = (id: string, url: string) => {
    if (playingAudioId === id) {
      const audio = audioRefs.current.get(id);
      if (audio) {
        audio.pause();
        setPlayingAudioId(null);
      }
    } else {
      audioRefs.current.forEach(audio => audio.pause());
      
      let audio = audioRefs.current.get(id);
      if (!audio) {
        audio = new Audio(url);
        audioRefs.current.set(id, audio);
        audio.onended = () => setPlayingAudioId(null);
      }
      
      audio.play();
      setPlayingAudioId(id);
    }
  };

  const removeAudio = (id: string) => {
    const audio = audioRefs.current.get(id);
    if (audio) {
      audio.pause();
      audioRefs.current.delete(id);
    }
    setAudioRecordings(audioRecordings.filter(a => a.id !== id));
    if (playingAudioId === id) {
      setPlayingAudioId(null);
    }
  };

  // Função para transcrever áudio usando a API FastAPI
 
      
     
      // 2. Solicitar transcrição
      
    const transcribeAudio = async (audioBlob: Blob, recordingId: string) => {
      alert("TRANSCRIBE AUDIO CHAMADO");
  try {
    console.log("CHEGOU ATÉ AQUI");

    setIsTranscribing(true);
    setTranscriptionProgress("Enviando áudio...");

    const formData = new FormData();
    formData.append(
      "file",
      new File([audioBlob], `audio_${recordingId}.webm`, {
        type: audioBlob.type || "audio/webm",
      })
    );

    const response = await fetch("http://localhost:8000/transcrever", {
      method: "POST",
      body: formData,
    });

    const data = await response.json();
    console.log("RESPOSTA API:", data);

    const texto =
      data.texto_transcrito ||
      data.text ||
      data.texto ||
      "";

    if (!texto) {
      throw new Error("Texto vazio");
    }

    setTranscriptionProgress("Inserindo texto...");

    setReportContent(prev =>
      prev + (prev ? "\n\n" : "") + texto
    );

    setIsTranscribing(false);
    setTranscriptionProgress("");
    console.log("ANTES DO ERRO");

  } catch (error) {
    console.error("Erro na transcrição:", error);
    setIsTranscribing(false);
    setTranscriptionProgress("");
    setAudioError(
      "❌ Erro ao transcrever o áudio. Verifique se a API está rodando."
    );
    setTimeout(() => setAudioError(""), 10000);
  }
};



  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleCreateNewReport = () => {
    if (reportContent || reportType || images.length > 0 || audioRecordings.length > 0) {
      const confirmed = confirm('Tem certeza que deseja criar um novo laudo? Todas as alterações não salvas serão perdidas.');
      if (!confirmed) return;
    }
    
    setReportContent('');
    setReportType('');
    setImages([]);
    setAudioRecordings([]);
    setSelectedPatientLocal(null);
    setPatientSearch('');
    setEditHistory(['']);
    setHistoryIndex(0);
    setReportStatus('in-progress');
    
    audioRefs.current.forEach(audio => audio.pause());
    setPlayingAudioId(null);
  };

  const handleContentChange = (newContent: string) => {
    setReportContent(newContent);
    
    const newHistory = editHistory.slice(0, historyIndex + 1);
    newHistory.push(newContent);
    setEditHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);
  };

  const insertTextAtCursor = (text: string) => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const newContent = reportContent.substring(0, start) + text + reportContent.substring(end);
    
    handleContentChange(newContent);
    
    setTimeout(() => {
      textarea.selectionStart = textarea.selectionEnd = start + text.length;
      textarea.focus();
    }, 0);
  };

  const wordCount = reportContent.trim().split(/\s+/).filter(word => word.length > 0).length;
  const charCount = reportContent.length;

  const handleExportPDF = () => {
    const printWindow = window.open('', '_blank');
    if (printWindow && selectedPatientLocal) {
      const content = `
        <!DOCTYPE html>
        <html>
          <head>
            <title>Laudo Médico - ${selectedPatientLocal.name}</title>
            <style>
              body { font-family: Arial, sans-serif; padding: 40px; }
              .header { border-bottom: 2px solid #2563eb; padding-bottom: 20px; margin-bottom: 30px; }
              .header h1 { color: #2563eb; margin: 0; }
              .patient-info { background: #f3f4f6; padding: 20px; border-radius: 8px; margin-bottom: 30px; }
              .patient-info p { margin: 5px 0; }
              .report-content { line-height: 1.6; white-space: pre-wrap; }
              .images { display: grid; grid-template-columns: repeat(2, 1fr); gap: 20px; margin-top: 30px; }
              .images img { width: 100%; border-radius: 8px; }
              .footer { margin-top: 40px; padding-top: 20px; border-top: 1px solid #e5e7eb; text-align: center; color: #6b7280; }
            </style>
          </head>
          <body>
            <div class="header">
              <h1>LAUDO MÉDICO</h1>
              <p>MediPlataforma - Sistema de Gestão Médica</p>
            </div>
            
            <div class="patient-info">
              <h2>Dados do Paciente</h2>
              <p><strong>Nome:</strong> ${selectedPatientLocal.name}</p>
              <p><strong>Email:</strong> ${selectedPatientLocal.email}</p>
              <p><strong>Idade:</strong> ${selectedPatientLocal.age} anos</p>
              <p><strong>Tipo de Exame:</strong> ${reportType || 'Não especificado'}</p>
              <p><strong>Data:</strong> ${new Date().toLocaleDateString('pt-BR')}</p>
            </div>
            
            <div>
              <h2>Laudo</h2>
              <div class="report-content">${reportContent || 'Nenhum conteúdo adicionado.'}</div>
            </div>
            
            ${images.length > 0 ? `
              <div>
                <h2>Imagens do Exame</h2>
                <div class="images">
                  ${images.map(img => `<img src="${img}" alt="Imagem do exame" />`).join('')}
                </div>
              </div>
            ` : ''}
            
            <div class="footer">
              <p>Dr. João Silva - CRM XXXXX/XX</p>
              <p>Radiologista</p>
              <p>Data de emissão: ${new Date().toLocaleDateString('pt-BR')} às ${new Date().toLocaleTimeString('pt-BR')}</p>
            </div>
          </body>
        </html>
      `;
      
      printWindow.document.write(content);
      printWindow.document.close();
      
      setTimeout(() => {
        printWindow.print();
      }, 500);
    }
  };

  const filteredPatients = mockPatients.filter(p =>
    p.name.toLowerCase().includes(patientSearch.toLowerCase()) ||
    p.email.toLowerCase().includes(patientSearch.toLowerCase())
  );

  const getStatusConfig = (status: ReportStatus) => {
    const configs = {
      'pending': { label: 'Pendente', color: 'bg-yellow-100 text-yellow-700 border-yellow-300', icon: '⏳' },
      'in-progress': { label: 'Em Andamento', color: 'bg-blue-100 text-blue-700 border-blue-300', icon: '✏️' },
      'completed': { label: 'Concluído', color: 'bg-green-100 text-green-700 border-green-300', icon: '✓' },
      'reviewed': { label: 'Revisado', color: 'bg-purple-100 text-purple-700 border-purple-300', icon: '✓✓' },
    };
    return configs[status];
  };

  const handleStatusChange = (newStatus: ReportStatus) => {
    setReportStatus(newStatus);
    setShowStatusDropdown(false);
  };
  
  const templates: Template[] = [
    { id: '1', name: 'Modelo de Raio-X', category: 'Raio-X', content: 'Este é um modelo de laudo para exames de Raio-X. Inclua detalhes específicos do exame aqui.' },
    { id: '2', name: 'Modelo de Tomografia', category: 'Tomografia', content: 'Este é um modelo de laudo para exames de Tomografia Computadorizada. Inclua detalhes específicos do exame aqui.' },
    { id: '3', name: 'Modelo de Ressonância', category: 'Ressonância', content: 'Este é um modelo de laudo para exames de Ressonância Magnética. Inclua detalhes específicos do exame aqui.' },
  ];
  
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (statusDropdownRef.current && !statusDropdownRef.current.contains(event.target as Node)) {
        setShowStatusDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (selectedPatient) {
      setSelectedPatientLocal(selectedPatient);
    }
  }, [selectedPatient]);
  
  // Load report when patient is selected
  useEffect(() => {
    if (selectedPatientLocal) {
      // Find the report for this patient
      const patientReport = mockReports.find(report => report.patientId === selectedPatientLocal.id);
      
      if (patientReport) {
        setReportContent(patientReport.content);
        setReportType(patientReport.type);
        setReportStatus(patientReport.status);
        setCurrentReportId(patientReport.id);
        
        // Update edit history
        setEditHistory([patientReport.content]);
        setHistoryIndex(0);
      }
    }
  }, [selectedPatientLocal]);
  
  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-200">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Editor de Laudos</h2>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={handleCreateNewReport}
            className="flex items-center gap-2 px-4 py-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
          >
            <Plus size={18} />
            Novo
          </button>
          <button className="flex items-center gap-2 px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors">
            <Save size={18} />
            Salvar
          </button>
          <button 
            onClick={handleExportPDF}
            disabled={!selectedPatientLocal}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
          >
            <Download size={18} />
            Exportar
          </button>
        </div>
      </div>

      <div className="flex-1 flex gap-6 overflow-hidden">
        {/* Main Content */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Patient & Exam Info Bar */}
          <div className="flex items-center gap-4 mb-4 p-4 bg-gray-50 rounded-lg">
            {/* Patient */}
            <div className="flex-1">
              {selectedPatientLocal ? (
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white text-xs font-bold">
                      {selectedPatientLocal.name.split(' ').map(n => n[0]).join('').substring(0, 2)}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-800">{selectedPatientLocal.name}</p>
                      <p className="text-xs text-gray-500">{selectedPatientLocal.age} anos</p>
                    </div>
                  </div>
                  <button 
                    onClick={() => setSelectedPatientLocal(null)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <X size={16} />
                  </button>
                </div>
              ) : (
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Selecionar paciente..."
                    value={patientSearch}
                    onChange={(e) => setPatientSearch(e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  {patientSearch && (
                    <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-10 max-h-48 overflow-y-auto">
                      {filteredPatients.map(patient => (
                        <button
                          key={patient.id}
                          onClick={() => {
                            setSelectedPatientLocal(patient);
                            setPatientSearch('');
                          }}
                          className="w-full flex items-center gap-2 p-2 hover:bg-gray-50 transition-colors text-left"
                        >
                          <div className="w-6 h-6 bg-gray-200 rounded-full flex items-center justify-center text-gray-600 text-xs font-bold">
                            {patient.name.split(' ').map(n => n[0]).join('').substring(0, 2)}
                          </div>
                          <div>
                            <p className="text-xs font-medium text-gray-800">{patient.name}</p>
                            <p className="text-xs text-gray-500">{patient.age} anos</p>
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Exam Type */}
            <div className="flex-1">
              <select
                value={reportType}
                onChange={(e) => setReportType(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Tipo de exame...</option>
                {examTypes.map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>

            {/* Status */}
            <div className="relative" ref={statusDropdownRef}>
              <button
                onClick={() => setShowStatusDropdown(!showStatusDropdown)}
                className={`px-3 py-2 rounded-lg border text-sm font-medium flex items-center gap-2 ${getStatusConfig(reportStatus).color}`}
              >
                <span>{getStatusConfig(reportStatus).icon}</span>
                <span>{getStatusConfig(reportStatus).label}</span>
                <span className="ml-1">▾</span>
              </button>
              
              {showStatusDropdown && (
                <div className="absolute right-0 top-full mt-1 z-20 bg-white border border-gray-200 rounded-lg shadow-lg py-1 min-w-[160px]">
                  <button
                    onClick={() => handleStatusChange('pending')}
                    className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-yellow-50 transition-colors flex items-center gap-2"
                  >
                    <span>⏳</span> Pendente
                  </button>
                  <button
                    onClick={() => handleStatusChange('in-progress')}
                    className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-blue-50 transition-colors flex items-center gap-2"
                  >
                    <span>✏️</span> Em Andamento
                  </button>
                  <button
                    onClick={() => handleStatusChange('completed')}
                    className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-green-50 transition-colors flex items-center gap-2"
                  >
                    <span>✓</span> Concluído
                  </button>
                  <button
                    onClick={() => handleStatusChange('reviewed')}
                    className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-purple-50 transition-colors flex items-center gap-2"
                  >
                    <span>✓✓</span> Revisado
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Editor */}
          <div className="flex-1 flex flex-col bg-white rounded-lg border border-gray-200 overflow-hidden">
            {/* Toolbar */}
            <div className="flex items-center justify-between px-4 py-2 border-b border-gray-200 bg-gray-50">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => insertTextAtCursor(new Date().toLocaleDateString('pt-BR'))}
                  className="px-3 py-1 text-xs text-gray-600 hover:bg-gray-200 rounded transition-colors flex items-center gap-1"
                  title="Inserir data atual"
                >
                  <Calendar size={14} />
                  Data
                </button>
                <button
                  onClick={() => insertTextAtCursor(new Date().toLocaleTimeString('pt-BR'))}
                  className="px-3 py-1 text-xs text-gray-600 hover:bg-gray-200 rounded transition-colors flex items-center gap-1"
                  title="Inserir hora atual"
                >
                  <Clock size={14} />
                  Hora
                </button>
              </div>
              
              <div className="flex items-center gap-3 text-xs text-gray-500">
                <span>{wordCount} palavras</span>
                <span>•</span>
                <span>{charCount} caracteres</span>
              </div>
            </div>

            {/* Text Area */}
            <textarea
  ref={textareaRef}
  value={reportContent}
  onChange={(e) => handleContentChange(e.target.value)}
  className="report-textarea"
  placeholder="Digite o laudo aqui..."
/>

          </div>
        </div>

        {/* Sidebar */}
        <div className="w-80 flex flex-col gap-3 overflow-y-auto">
          {/* Templates */}
          <div className="bg-white rounded-lg border border-gray-200">
            <button
              onClick={() => setShowTemplatesSection(!showTemplatesSection)}
              className="w-full flex items-center justify-between p-3 hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-center gap-2">
                <FileText size={18} className="text-gray-600" />
                <span className="font-medium text-gray-800">Modelos</span>
              </div>
              {showTemplatesSection ? <ChevronUp size={18} className="text-gray-400" /> : <ChevronDown size={18} className="text-gray-400" />}
            </button>
            
            {showTemplatesSection && (
              <div className="border-t border-gray-200 p-3 space-y-2">
                {templates.map((template) => (
                  <button
                    key={template.id}
                    onClick={() => {
                      setReportContent(template.content);
                      setReportType(template.category);
                    }}
                    className="w-full text-left p-2 hover:bg-blue-50 rounded transition-colors"
                  >
                    <p className="text-sm font-medium text-gray-800">{template.name}</p>
                    <p className="text-xs text-gray-500">{template.category}</p>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Audio */}
          <div className="bg-white rounded-lg border border-gray-200">
            <button
              onClick={() => setShowAudioSection(!showAudioSection)}
              className="w-full flex items-center justify-between p-3 hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-center gap-2">
                <Mic size={18} className="text-gray-600" />
                <span className="font-medium text-gray-800">Áudio</span>
                {audioRecordings.length > 0 && (
                  <span className="px-2 py-0.5 bg-blue-100 text-blue-700 text-xs rounded-full">{audioRecordings.length}</span>
                )}
              </div>
              {showAudioSection ? <ChevronUp size={18} className="text-gray-400" /> : <ChevronDown size={18} className="text-gray-400" />}
            </button>
            
            {showAudioSection && (
              <div className="border-t border-gray-200 p-3">
                {/* Error Message */}
                {audioError && (
                  <div className="mb-3 p-2 bg-red-50 border border-red-200 rounded text-xs text-red-700 flex items-start gap-2">
                    <span className="flex-shrink-0 mt-0.5">⚠️</span>
                    <div className="flex-1">
                      <p>{audioError}</p>
                    </div>
                    <button onClick={() => setAudioError('')} className="flex-shrink-0 text-red-500 hover:text-red-700">
                      <X size={14} />
                    </button>
                  </div>
                )}

                {/* Controls */}
                <div className="flex gap-2 mb-3">
                  {!isRecording ? (
                    <button 
                      onClick={startRecording}
                      className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm"
                    >
                      <Mic size={16} />
                      Gravar
                    </button>
                  ) : (
                    <button 
                      onClick={stopRecording}
                      className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-900 transition-colors text-sm animate-pulse"
                    >
                      <Square size={16} />
                      {formatTime(recordingTime)}
                    </button>
                  )}
                  <label className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors cursor-pointer text-sm">
                    <Upload size={16} />
                    Upload
                    <input
                      type="file"
                      multiple
                      accept="audio/*"
                      onChange={handleAudioUpload}
                      className="hidden"
                    />
                  </label>
                </div>

                {/* Recordings List */}
                {audioRecordings.length > 0 ? (
                  <div className="space-y-2 max-h-60 overflow-y-auto">
                    {audioRecordings.map((recording) => (
                      <div key={recording.id} className="flex items-center gap-2 p-2 bg-gray-50 rounded">
                        <button
                          onClick={() => togglePlayAudio(recording.id, recording.url)}
                          className="flex-shrink-0 p-1.5 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                        >
                          {playingAudioId === recording.id ? <Pause size={14} /> : <Play size={14} />}
                        </button>
                        
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-medium text-gray-800 truncate">
                            {recording.timestamp.toLocaleTimeString('pt-BR')}
                          </p>
                        </div>
                        
                        <button
                          onClick={() => removeAudio(recording.id)}
                          className="flex-shrink-0 p-1 text-red-600 hover:bg-red-50 rounded transition-colors"
                        >
                          <Trash2 size={14} />
                        </button>
                        
                        <button
  onClick={() => transcribeAudio(recording.blob, recording.id)}
  className="flex-shrink-0 p-1 text-green-600 hover:bg-green-50 rounded transition-colors"
  disabled={isTranscribing}
>
  {isTranscribing ? (
    <span className="text-xs">Transcrevendo...</span>
  ) : (
    <Mic size={14} />
  )}
</button>

                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-gray-400 text-center py-4">Nenhum áudio</p>
                )}
              </div>
            )}
          </div>

          {/* Images */}
          <div className="bg-white rounded-lg border border-gray-200">
            <button
              onClick={() => setShowImagesSection(!showImagesSection)}
              className="w-full flex items-center justify-between p-3 hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-center gap-2">
                <ImageIcon size={18} className="text-gray-600" />
                <span className="font-medium text-gray-800">Imagens</span>
                {images.length > 0 && (
                  <span className="px-2 py-0.5 bg-blue-100 text-blue-700 text-xs rounded-full">{images.length}</span>
                )}
              </div>
              {showImagesSection ? <ChevronUp size={18} className="text-gray-400" /> : <ChevronDown size={18} className="text-gray-400" />}
            </button>
            
            {showImagesSection && (
              <div className="border-t border-gray-200 p-3">
                <label className="flex items-center justify-center gap-2 px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors cursor-pointer text-sm mb-3">
                  <Upload size={16} />
                  Upload
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                </label>
                
                {images.length > 0 ? (
                  <div className="grid grid-cols-2 gap-2 max-h-80 overflow-y-auto">
                    {images.map((img, index) => (
                      <div key={index} className="relative group">
                        <img
                          src={img}
                          alt={`Imagem ${index + 1}`}
                          className="w-full h-24 object-cover rounded"
                        />
                        <button
                          onClick={() => removeImage(index)}
                          className="absolute top-1 right-1 p-1 bg-red-600 text-white rounded opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <X size={12} />
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-gray-400 text-center py-4">Nenhuma imagem</p>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}