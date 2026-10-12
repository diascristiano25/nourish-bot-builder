/**
 * ChatWidget - Quick chat interface with nutritionist
 * Provides a simple messaging interface for patient-nutritionist communication
 */

import { motion } from 'framer-motion';
import { fadeInUp } from '@/lib/motion-variants';
import { MessageCircle, Send } from 'lucide-react';
import { useState } from 'react';

export function ChatWidget() {
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState<Array<{ id: string; text: string; sender: 'patient' | 'nutritionist'; timestamp: Date }>>([]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;

    const newMessage = {
      id: Date.now().toString(),
      text: message,
      sender: 'patient' as const,
      timestamp: new Date(),
    };

    setMessages([...messages, newMessage]);
    setMessage('');
  };

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={fadeInUp}
      className="rounded-lg border border-blue-200 bg-white p-6 shadow-sm"
    >
      <div className="flex items-center gap-3 mb-4">
        <MessageCircle className="w-6 h-6 text-teal-500" />
        <h2 className="text-xl font-bold text-slate-900">Fale com seu Nutricionista</h2>
      </div>

      <div className="space-y-3 mb-4 max-h-64 overflow-y-auto">
        {messages.length === 0 ? (
          <p className="text-slate-500 text-center py-4">
            Nenhuma mensagem ainda. Envie uma mensagem para seu nutricionista!
          </p>
        ) : (
          messages.map((msg) => (
            <div
              key={msg.id}
              className={`p-3 rounded-lg ${
                msg.sender === 'patient'
                  ? 'bg-teal-50 ml-auto max-w-[80%]'
                  : 'bg-blue-50 mr-auto max-w-[80%]'
              }`}
            >
              <p className="text-sm text-slate-900">{msg.text}</p>
              <p className="text-xs text-slate-500 mt-1">
                {msg.timestamp.toLocaleTimeString('pt-BR', {
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </p>
            </div>
          ))
        )}
      </div>

      <form onSubmit={handleSendMessage} className="flex gap-2">
        <input
          type="text"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Digite sua mensagem..."
          className="flex-1 border border-slate-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
        />
        <button
          type="submit"
          className="bg-teal-500 text-white px-4 py-2 rounded-lg hover:bg-teal-600 transition-colors flex items-center gap-2"
        >
          <Send className="w-4 h-4" />
          Enviar
        </button>
      </form>
    </motion.div>
  );
}
