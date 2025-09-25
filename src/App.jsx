import React, { useState, useRef, useEffect } from 'react';


const N8N_WEBHOOK_URL = 'http://localhost:5678/webhook-test/a9b00a9c-5957-4dc3-a017-7d15103116f2';
// --- Ícones em SVG para a interface ---

const SendIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
    <path d="M3.478 2.405a.75.75 0 00-.926.94l2.432 7.905H13.5a.75.75 0 010 1.5H4.984l-2.432 7.905a.75.75 0 00.926.94 60.519 60.519 0 0018.445-8.986.75.75 0 000-1.218A60.517 60.517 0 003.478 2.405z" />
  </svg>
);

const PlusIcon = () => (
  <svg fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
  </svg>
);

const SparklesIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904 9 18.75l-.813-2.846a4.5 4.5 0 0 0-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 0 0 3.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 0 0 3.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 0 0-3.09 3.09ZM18.259 8.715 18 9.75l-.259-1.035a3.375 3.375 0 0 0-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 0 0 2.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 0 0 2.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 0 0-2.456 2.456Z" />
    </svg>
);


const UserAvatar = () => (
    <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center font-bold text-sm flex-shrink-0">
        U
    </div>
);

const BotAvatar = () => (
    <div className="w-8 h-8 rounded-full bg-gray-700 flex items-center justify-center flex-shrink-0">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 text-gray-300">
            <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 3.75H19.5a.75.75 0 0 1 .75.75v11.25a.75.75 0 0 1-1.5 0V6.31L5.03 20.03a.75.75 0 0 1-1.06-1.06L17.69 5.25H8.25a.75.75 0 0 1 0-1.5Z" />
        </svg>
    </div>
);


function App() {
  // --- Estados da Aplicação ---
  const [chats, setChats] = useState({
    'chat-1': { title: 'Boas-vindas!', messages: [{sender: 'bot', text: 'Oii, eu sou o Goku! Como posso te ajudar a automatizar seu dia hoje?'}] }
  });
  const [currentChatId, setCurrentChatId] = useState('chat-1');
  const [userInput, setUserInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const chatEndRef = useRef(null); 

  // --- Gemini API ---
  const GEMINI_API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-05-20:generateContent?key=`;
  const apiKey = ""; // A chave será injetada pelo ambiente, mantenha em branco.

  const callGeminiAPI = async (prompt, retries = 3) => {
    try {
        const response = await fetch(`${GEMINI_API_URL}${apiKey}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] })
        });
        if (!response.ok) {
            if (response.status === 429 && retries > 0) {
                 await new Promise(res => setTimeout(res, (4 - retries) * 1000));
                 return callGeminiAPI(prompt, retries - 1);
            }
            throw new Error(`Erro na API: ${response.statusText}`);
        }
        const data = await response.json();
        return data.candidates?.[0]?.content?.parts?.[0]?.text || "";
    } catch (error) {
        console.error("Erro ao chamar a API do Gemini:", error);
        return null;
    }
  };
  
  // --- Efeitos ---
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chats, currentChatId]);

  // --- Funções ---
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!userInput.trim() || isLoading) return;

    const userMessage = { sender: 'user', text: userInput };
    const isFirstMessage = chats[currentChatId].messages.length <= 1;

    setChats(prev => ({
        ...prev,
        [currentChatId]: { ...prev[currentChatId], messages: [...prev[currentChatId].messages, userMessage] }
    }));
    
    const question = userInput;
    setUserInput('');
    setIsLoading(true);

    try {
        // ===================================================================
        // TODO: SUBSTITUA A SIMULAÇÃO ABAIXO PELA CHAMADA REAL AO N8N
        // ===================================================================
       const response = await fetch(N8N_WEBHOOK_URL, {
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
    },
    body: JSON.stringify({
        // A chave aqui ('chatInput') deve ser a mesma
        // que seu workflow n8n espera em {{ $json.body.chatInput }}
        message: question,
        sessionId: currentChatId
    })
});

if (!response.ok) {
    throw new Error(`Erro na rede: ${response.statusText}`);
}

const responseData = await response.json(); // Pega o JSON completo
const botMessageText = responseData.response;
        const botMessage = { sender: 'bot', text: botMessageText };
        
        setChats(prev => ({
            ...prev,
            [currentChatId]: { ...prev[currentChatId], messages: [...prev[currentChatId].messages, botMessage] }
        }));
        
        // ✨ Funcionalidade Gemini: Gerar título da conversa após a primeira troca
        if (isFirstMessage && botMessageText) {
            generateChatTitle(question, botMessageText);
        }

    } catch (error) {
      console.error("Erro na integração com n8n:", error);
      const errorMessage = { sender: 'bot', text: 'Desculpe, ocorreu um erro. Tente novamente.' };
      setChats(prev => ({...prev, [currentChatId]: {...prev[currentChatId], messages: [...prev[currentChatId].messages, errorMessage]}}));
    } finally {
      setIsLoading(false);
    }
  };

  const handleNewChat = () => {
    const newChatId = `chat-${Date.now()}`;
    const newChatNumber = Object.keys(chats).length + 1;
    setChats(prev => ({
      ...prev,
      [newChatId]: { title: `Nova Conversa #${newChatNumber}`, messages: [] }
    }));
    setCurrentChatId(newChatId);
  };

  // ✨ Funcionalidade Gemini: Gera um título para o chat
  const generateChatTitle = async (userText, botText) => {
      const prompt = `Resuma o seguinte diálogo em um título curto de 2 a 4 palavras. Responda apenas com o título. \n\nUsuário: "${userText}"\nAssistente: "${botText}"`;
      const title = await callGeminiAPI(prompt);
      if (title) {
          setChats(prev => ({
              ...prev,
              [currentChatId]: { ...prev[currentChatId], title: title.replace(/"/g, '') }
          }));
      }
  };

  // ✨ Funcionalidade Gemini: Gera uma pergunta inspiradora
  const generateInspiration = async () => {
    setIsGenerating(true);
    const prompt = "Sugira uma pergunta criativa e interessante para fazer a um assistente de IA sobre automação, produtividade ou tecnologia. Retorne apenas a pergunta.";
    const suggestion = await callGeminiAPI(prompt);
    if (suggestion) {
        setUserInput(suggestion.replace(/"/g, ''));
    } else {
        setUserInput("Como posso automatizar meu trabalho com n8n?");
    }
    setIsGenerating(false);
  };

  const currentMessages = chats[currentChatId]?.messages || [];

const chatBackgroundStyle = {
  backgroundImage: `
    linear-gradient(rgba(255, 255, 255, 0.92), rgba(255, 255, 255, 0.92)),
    url('/Goku.jpg')`,
  backgroundSize: 'cover',
  backgroundPosition: 'calc(50% + 128px) center',
  backgroundRepeat: 'no-repeat',
  backgroundAttachment: 'fixed',
};

  return (
    <div style={{ fontFamily: "'Inter', sans-serif" }} className="flex h-screen w-screen text-gray-200 bg-gray-900">
     <aside
  className="w-64 p-4 flex flex-col space-y-4"
  style={{ backgroundColor: '#f85B14' }} // ← aqui, dentro da tag
>
  <h1 className="text-xl font-bold">SaiyaBot</h1>
  <button
  onClick={handleNewChat}
  className="flex items-center justify-center gap-2 w-full p-2 rounded-lg text-sm transition-colors"
  style={{
    backgroundColor: '#072083',
  }}
  onMouseOver={e => e.currentTarget.style.backgroundColor = '#3B82F6'} 
  onMouseOut={e => e.currentTarget.style.backgroundColor = '#072083'}
>
  <PlusIcon /> Nova Conversa
</button>
  <div className="flex-grow overflow-y-auto pr-2">
<ul className="space-y-2">
  {Object.keys(chats).map(chatId => (
    <li key={chatId}>
      <button
        onClick={() => setCurrentChatId(chatId)}
        className="w-full p-2.5 rounded-lg text-left text-sm font-medium transition-colors"
        style={{
          backgroundColor: 'rgba(10, 58, 129, 0.34)', 
          border: '2px solid #cb4604ff',            
        }}
      >
        {chats[chatId].title}
      </button>
    </li>
  ))}
</ul>
  </div>
</aside>


      <main className="flex-1 flex flex-col" style={chatBackgroundStyle}>
        <div className="flex-1 p-6 overflow-y-auto">
          {currentMessages.length === 0 && (
             <div className="flex items-center justify-center h-full"><div className="text-center">
                    <h2 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500">SaiyaBot</h2>
                    <p className="text-gray-500 mt-2">Oii, eu sou o Goku! Como posso ajudar?</p>
                </div></div>
          )}
          <div className="max-w-3xl mx-auto space-y-6">
            {currentMessages.map((msg, index) => (
              <div key={index} className="flex items-start gap-4">
                {msg.sender === 'user' ? <UserAvatar /> : <BotAvatar />}
                <div className="flex-1 pt-1">
                  <p className="font-bold text-sm">{msg.sender === 'user' ? 'Você' : 'SaiyaBot'}</p>
                  <p className="text-gray-300 whitespace-pre-wrap">{msg.text}</p>
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex items-start gap-4"><BotAvatar />
                 <div className="flex-1 pt-1"><div className="flex items-center space-x-2 h-8">
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-pulse"></div>
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-pulse [animation-delay:0.2s]"></div>
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-pulse [animation-delay:0.4s]"></div>
                    </div></div></div>
            )}
            <div ref={chatEndRef} />
          </div>
        </div>

        <div className="p-6">
          <div className="max-w-3xl mx-auto">
         <form
  onSubmit={handleSubmit}
  className="flex items-center rounded-full p-2 pl-4 focus-within:ring-2 focus-within:ring-blue-500"
  style={{ backgroundColor: '#f85B14' }}
>
  <button
    type="button"
    onClick={generateInspiration}
    className="p-2 text-gray-400 hover:text-blue-400 disabled:text-gray-600"
    disabled={isGenerating || isLoading}
  >
    <SparklesIcon />
  </button>
  <input
    type="text"
    value={userInput}
    onChange={(e) => setUserInput(e.target.value)}
    placeholder="Pergunte ao SaiyaBot..."
    className="flex-1 bg-transparent border-none focus:ring-0 text-white placeholder-black"
    disabled={isLoading}
  />
<button
  type="submit"
  className="p-2 rounded-full text-gray-300 disabled:cursor-not-allowed transition-colors"
  style={{
    backgroundColor: '#072083',  // cor principal do botão
  }}
  onMouseOver={e => e.currentTarget.style.backgroundColor = '#3B82F6'} 
  onMouseOut={e => e.currentTarget.style.backgroundColor = '#072083'}
  disabled={isLoading || !userInput.trim()}
>
  <SendIcon />
</button>
</form>
          </div>
        </div>
      </main>
    </div>
  );
}

export default App;

