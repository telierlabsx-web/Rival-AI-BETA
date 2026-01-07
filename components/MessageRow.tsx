import React, { useState } from 'react';
import { format } from 'date-fns';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';
import { Message, UserProfile } from '../types';
import { ArtifactCard } from './ArtifactCard';
import { WebSourcesDisplay } from './WebSourcesDisplay';
import { EbookViewer } from './EbookViewer';
import { MapDisplay } from './MapDisplay';

interface MessageRowProps {
  message: Message;
  profile: UserProfile;
  isDark: boolean;
  borderColor: string;
  assistantRowBg: string;
  cleanTextFromCode: (text: string) => string;
  onCopy: (text: string, id: string) => void;
  onToggleSave: (id: string) => void;
  onDownloadImage: (url: string) => void;
  onViewImage: (url: string) => void;
  onOpenArtifact: (code: string) => void;
  copyFeedback: string | null;
}

export const MessageRow: React.FC<MessageRowProps> = ({
  message,
  profile,
  isDark,
  borderColor,
  assistantRowBg,
  cleanTextFromCode,
  onCopy,
  onToggleSave,
  onDownloadImage,
  onViewImage,
  onOpenArtifact,
  copyFeedback
}) => {
  const [showEbook, setShowEbook] = useState(false);
  const hasSources = message.sources && message.sources.length > 0;

  const processedContent = message.role === 'assistant' 
    ? cleanTextFromCode(message.content).split(/halaman \d+/i)[0].trim() || cleanTextFromCode(message.content)
    : message.content;

  return (
    <div className={`w-full flex justify-center py-10 md:py-16 border-b ${borderColor} ${message.role === 'assistant' ? assistantRowBg : 'bg-transparent'}`}>
      <div className="w-full max-w-4xl flex gap-6 md:gap-10 px-6">
        <div className="flex-shrink-0">
          <img 
            src={message.role === 'assistant' ? profile.aiAvatar : profile.avatar} 
            className={`w-10 h-10 md:w-12 md:h-12 rounded-xl object-cover shadow-sm ${borderColor} border`} 
            alt={message.role} 
          />
        </div>
        
        <div className="flex-1 min-w-0 pt-1">
          <div className="mb-4 flex items-center gap-4">
            <span className={`text-[10px] font-black uppercase tracking-[0.2em] opacity-80`}>
              {message.role === 'assistant' ? profile.aiName : 'ANDA'}
            </span>
            <span className="text-[10px] font-black opacity-30 uppercase tracking-widest whitespace-nowrap">
              {format(message.timestamp, 'EEEE, dd MMM yyyy · HH:mm').toUpperCase()}
            </span>
          </div>

          {hasSources && (
            <WebSourcesDisplay sources={message.sources!} isDark={isDark} />
          )}
          
          {message.role === 'assistant' ? (
            <div className="markdown-content">
              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                rehypePlugins={[rehypeRaw]}
                components={{
                  h1: ({node, ...props}) => <h1 className={`text-3xl font-black mb-6 mt-8 ${isDark ? 'text-zinc-100' : 'text-zinc-900'}`} {...props} />,
                  h2: ({node, ...props}) => <h2 className={`text-2xl font-black mb-4 mt-6 ${isDark ? 'text-zinc-100' : 'text-zinc-900'}`} {...props} />,
                  h3: ({node, ...props}) => <h3 className={`text-xl font-bold mb-3 mt-5 ${isDark ? 'text-zinc-200' : 'text-zinc-800'}`} {...props} />,
                  
                  p: ({node, ...props}) => <p className={`text-base md:text-lg leading-[1.8] font-medium mb-4 ${isDark ? 'text-zinc-100' : 'text-zinc-800'}`} {...props} />,
                  
                  ul: ({node, ...props}) => <ul className="space-y-2 my-4 ml-6 list-disc" {...props} />,
                  ol: ({node, ...props}) => <ol className="space-y-2 my-4 ml-6 list-decimal" {...props} />,
                  li: ({node, ...props}) => <li className={`text-base md:text-lg leading-relaxed ${isDark ? 'text-zinc-100' : 'text-zinc-800'}`} {...props} />,
                  
                  table: ({node, ...props}) => (
                    <div className={`overflow-x-auto my-6 rounded-xl border ${isDark ? 'border-zinc-700' : 'border-zinc-200'}`}>
                      <table className="min-w-full divide-y divide-current/10" {...props} />
                    </div>
                  ),
                  thead: ({node, ...props}) => <thead className={`${isDark ? 'bg-zinc-800/50' : 'bg-zinc-50'}`} {...props} />,
                  tbody: ({node, ...props}) => <tbody className="divide-y divide-current/10" {...props} />,
                  tr: ({node, ...props}) => <tr className={`transition-colors ${isDark ? 'hover:bg-zinc-800/30' : 'hover:bg-zinc-50'}`} {...props} />,
                  th: ({node, ...props}) => <th className={`px-6 py-3 text-left text-xs font-black uppercase tracking-wider ${isDark ? 'text-zinc-300' : 'text-zinc-700'}`} {...props} />,
                  td: ({node, ...props}) => <td className={`px-6 py-4 text-sm font-medium ${isDark ? 'text-zinc-200' : 'text-zinc-800'}`} {...props} />,
                  
                  blockquote: ({node, ...props}) => (
                    <blockquote className={`border-l-4 pl-4 my-4 italic ${isDark ? 'border-zinc-600 text-zinc-300' : 'border-zinc-300 text-zinc-600'}`} {...props} />
                  ),
                  
                  code: ({node, inline, ...props}: any) => 
                    inline ? (
                      <code className={`px-2 py-1 rounded text-sm font-mono ${isDark ? 'bg-zinc-800 text-zinc-200' : 'bg-zinc-100 text-zinc-800'}`} {...props} />
                    ) : (
                      <code className={`block p-4 rounded-xl text-sm font-mono overflow-x-auto my-4 ${isDark ? 'bg-zinc-800/80 text-zinc-200' : 'bg-zinc-50 text-zinc-800'}`} {...props} />
                    ),
                  
                  a: ({node, ...props}) => (
                    <a className="text-blue-500 hover:text-blue-600 underline font-semibold transition-colors" target="_blank" rel="noopener noreferrer" {...props} />
                  ),
                  
                  strong: ({node, ...props}) => <strong className="font-black" {...props} />,
                  em: ({node, ...props}) => <em className="italic" {...props} />,
                  hr: ({node, ...props}) => <hr className={`my-8 ${isDark ? 'border-zinc-700' : 'border-zinc-200'}`} {...props} />,
                }}
              >
                {processedContent}
              </ReactMarkdown>
            </div>
          ) : (
            <div className={`text-base md:text-lg leading-[1.8] font-medium whitespace-pre-wrap ${isDark ? 'text-zinc-100' : 'text-zinc-800'}`}>
              {processedContent}
            </div>
          )}

          {message.mapData && <MapDisplay mapData={message.mapData} isDark={isDark} />}

          {message.ebookData && (
            <div className="mt-8 max-w-2xl w-full">
              <div 
                onClick={() => setShowEbook(true)}
                className={`group relative aspect-[16/9] w-full rounded-[2.5rem] overflow-hidden cursor-pointer shadow-[0_30px_60px_rgba(0,0,0,0.4)] transition-all hover:scale-[1.02] active:scale-[0.98] border border-white/10`}
              >
                <div className="absolute inset-0 bg-[#0a0a0a]">
                  {message.ebookData.coverImage ? (
                    <img src={message.ebookData.coverImage} className="w-full h-full object-cover opacity-60 group-hover:opacity-100 transition-opacity duration-700" alt="" />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-zinc-800 to-black" />
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent" />
                </div>

                <div className="absolute inset-0 p-10 flex flex-col justify-end">
                  <div className="flex items-center gap-3 mb-6">
                    <span className="px-3 py-1 bg-white text-black text-[9px] font-black uppercase tracking-widest rounded-md shadow-xl">PREMIUM DECK</span>
                    <span className="text-white/40 text-[9px] font-black uppercase tracking-widest">{message.ebookData.pages.length} VISUAL SLIDES</span>
                  </div>
                  <h3 className="text-2xl md:text-4xl font-black text-white uppercase tracking-tighter leading-[0.9] mb-4 group-hover:translate-x-2 transition-transform duration-500">
                    {message.ebookData.title}
                  </h3>
                  <div className="flex items-center justify-between">
                    <p className="text-white/60 text-[10px] font-black uppercase tracking-widest italic">{message.ebookData.author}</p>
                    <div className="flex items-center gap-2 text-white">
                      <span className="text-[10px] font-black uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity">Launch Presentation</span>
                      <div className="w-10 h-10 rounded-full bg-white text-black flex items-center justify-center shadow-2xl">
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z" /></svg>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {showEbook && (
                <div className="fixed inset-0 z-[200]">
                  <EbookViewer ebookData={message.ebookData} isDark={isDark} onClose={() => setShowEbook(false)} />
                </div>
              )}
            </div>
          )}
          
          {message.imageUrls && message.imageUrls.length > 0 && (
            <div className="mt-6 grid grid-cols-2 md:grid-cols-3 gap-3">
              {message.imageUrls.map((url, idx) => (
                <div key={idx} className="cursor-zoom-in" onClick={() => onViewImage(url)}>
                  <img src={url} className="rounded-2xl border border-current/10 shadow-xl w-full h-32 object-cover" alt="" />
                </div>
              ))}
            </div>
          )}

          {message.imageUrl && (
            <div className="mt-8 group relative max-w-xl">
              <div className="absolute -top-4 -left-4 z-10 bg-black text-white px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest border border-white/20 shadow-2xl">Visual Suggestion</div>
              <img src={message.imageUrl} className={`rounded-[2.5rem] border ${borderColor} shadow-2xl w-full aspect-square object-cover cursor-zoom-in transition-transform group-hover:scale-[1.01]`} alt="" onClick={() => onViewImage(message.imageUrl!
             <img src={message.imageUrl} className={`rounded-[2.5rem] border ${borderColor} shadow-2xl w-full aspect-square object-cover cursor-zoom-in transition-transform group-hover:scale-[1.01]`} alt="" onClick={() => onViewImage(message.imageUrl!)} />
              <button onClick={() => onDownloadImage(message.imageUrl!)} className="absolute top-6 right-6 p-4 bg-black/50 backdrop-blur-xl text-white rounded-2xl opacity-0 group-hover:opacity-100 transition-all hover:bg-black">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
              </button>
            </div>
          )}

          {message.role === 'assistant' && message.codeSnippet && (
            <ArtifactCard code={message.codeSnippet} timestamp={message.timestamp} isDark={isDark} borderColor={borderColor} onOpen={() => onOpenArtifact(message.codeSnippet!)} />
          )}

          <div className="mt-10 flex items-center gap-6">
            <button onClick={() => onCopy(message.role === 'assistant' ? cleanTextFromCode(message.content) : message.content, message.id)} className={`text-[10px] font-black uppercase tracking-widest flex items-center gap-2 transition-all ${copyFeedback === message.id ? 'text-green-500' : 'opacity-30 hover:opacity-100'}`}>
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" /></svg>
              {copyFeedback === message.id ? 'Tersalin' : 'Salin'}
            </button>
            <button onClick={() => onToggleSave(message.id)} className={`text-[10px] font-black uppercase tracking-widest flex items-center gap-2 transition-all ${message.isSaved ? 'text-blue-500' : 'opacity-30 hover:opacity-100'}`}>
              <svg className="w-3.5 h-3.5" fill={message.isSaved ? "currentColor" : "none"} stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" /></svg>
              {message.isSaved ? 'Tersimpan' : 'Simpan'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
