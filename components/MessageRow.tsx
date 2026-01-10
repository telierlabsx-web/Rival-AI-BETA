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
  isStreaming?: boolean;
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
  copyFeedback,
  isStreaming = false
}) => {
  const [showEbook, setShowEbook] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  const hasSources = message.sources && message.sources.length > 0;

  const processedContent = message.role === 'assistant' 
    ? cleanTextFromCode(message.content).split(/halaman \d+/i)[0].trim() || cleanTextFromCode(message.content)
    : message.content;

  const shouldShowArtifact = message.shouldShowArtifactCard || false;
  const hasCodeSnippet = message.codeSnippet && message.codeSnippet.length > 0;

  return (
    <div className={`w-full py-6 md:py-8 ${message.role === 'user' ? '' : assistantRowBg}`}>
      <div className="w-full max-w-4xl mx-auto px-4 md:px-6">
        
        <div className="flex items-center gap-3 mb-2">
          <img 
            src={message.role === 'assistant' ? profile.aiAvatar : profile.avatar} 
            className={`w-8 h-8 md:w-9 md:h-9 rounded-xl object-cover shadow-sm ${borderColor} border flex-shrink-0`} 
            alt={message.role} 
          />
          
          <div className="flex items-center gap-2">
            <span className={`text-[11px] md:text-xs font-black ${isDark ? 'text-zinc-100' : 'text-zinc-900'} uppercase tracking-wide`}>
              {message.role === 'assistant' ? profile.aiName : profile.name.split(' ')[0]}
            </span>
            <span className={`text-[9px] md:text-[10px] font-bold ${isDark ? 'text-zinc-500' : 'text-zinc-400'} uppercase tracking-wider`}>
              {format(message.timestamp, 'dd MMM yyyy').toUpperCase()} · {format(message.timestamp, 'HH:mm')}
            </span>
          </div>
        </div>

        {message.role === 'assistant' && (
          <div className={`w-full h-px mb-4 ${isDark ? 'bg-zinc-800' : 'bg-zinc-200'}`} />
        )}

        <div className="pl-0">
          {hasSources && (
            <div className="mb-4">
              <WebSourcesDisplay sources={message.sources!} isDark={isDark} />
            </div>
          )}
          
          {message.role === 'assistant' ? (
            <div className="markdown-content break-words overflow-wrap-anywhere">
              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                rehypePlugins={[rehypeRaw]}
                components={{
                  h1: ({node, ...props}) => <h1 className={`text-2xl md:text-3xl font-black mb-4 mt-6 ${isDark ? 'text-zinc-100' : 'text-zinc-900'} break-words`} {...props} />,
                  h2: ({node, ...props}) => <h2 className={`text-xl md:text-2xl font-black mb-3 mt-5 ${isDark ? 'text-zinc-100' : 'text-zinc-900'} break-words`} {...props} />,
                  h3: ({node, ...props}) => <h3 className={`text-lg md:text-xl font-bold mb-2 mt-4 ${isDark ? 'text-zinc-200' : 'text-zinc-800'} break-words`} {...props} />,
                  
                  p: ({node, ...props}) => <p className={`text-sm md:text-base leading-relaxed font-medium mb-3 ${isDark ? 'text-zinc-100' : 'text-zinc-800'} break-words`} {...props} />,
                  
                  ul: ({node, ...props}) => <ul className="space-y-1.5 my-3 ml-5 list-disc" {...props} />,
                  ol: ({node, ...props}) => <ol className="space-y-1.5 my-3 ml-5 list-decimal" {...props} />,
                  li: ({node, ...props}) => <li className={`text-sm md:text-base leading-relaxed ${isDark ? 'text-zinc-100' : 'text-zinc-800'} break-words`} {...props} />,
                  
                  table: ({node, ...props}) => (
                    <div className={`overflow-x-auto my-4 rounded-lg border ${isDark ? 'border-zinc-700' : 'border-zinc-200'} max-w-full`}>
                      <table className="min-w-full divide-y divide-current/10" {...props} />
                    </div>
                  ),
                  thead: ({node, ...props}) => <thead className={`${isDark ? 'bg-zinc-800/50' : 'bg-zinc-50'}`} {...props} />,
                  tbody: ({node, ...props}) => <tbody className="divide-y divide-current/10" {...props} />,
                  tr: ({node, ...props}) => <tr className={`transition-colors ${isDark ? 'hover:bg-zinc-800/30' : 'hover:bg-zinc-50'}`} {...props} />,
                  th: ({node, ...props}) => <th className={`px-3 md:px-4 py-2 text-left text-xs font-bold uppercase tracking-wider ${isDark ? 'text-zinc-300' : 'text-zinc-700'}`} {...props} />,
                  td: ({node, ...props}) => <td className={`px-3 md:px-4 py-2 text-sm font-medium ${isDark ? 'text-zinc-200' : 'text-zinc-800'} break-words`} {...props} />,
                  
                  blockquote: ({node, ...props}) => (
                    <blockquote className={`border-l-3 md:border-l-4 pl-3 md:pl-4 my-3 italic ${isDark ? 'border-zinc-600 text-zinc-300' : 'border-zinc-300 text-zinc-600'}`} {...props} />
                  ),
                  
                  code: ({node, inline, ...props}: any) => 
                    inline ? (
                      <code className={`px-1.5 py-0.5 rounded text-xs md:text-sm font-mono ${isDark ? 'bg-zinc-800 text-zinc-200' : 'bg-zinc-100 text-zinc-800'} break-all`} {...props} />
                    ) : (
                      <div className="relative my-3 rounded-lg overflow-hidden border border-zinc-700/50 max-w-full">
                        <div className={`px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider ${isDark ? 'bg-zinc-900/80 text-zinc-400' : 'bg-zinc-100 text-zinc-600'} border-b ${isDark ? 'border-zinc-800' : 'border-zinc-200'}`}>
                          Code
                        </div>
                        <div className="overflow-x-auto max-w-full">
                          <pre className={`p-3 md:p-4 text-xs md:text-sm font-mono whitespace-pre-wrap break-words ${isDark ? 'bg-zinc-900/60 text-zinc-200' : 'bg-zinc-50 text-zinc-800'}`}>
                            <code {...props} />
                          </pre>
                        </div>
                      </div>
                    ),
                  
                  a: ({node, ...props}) => (
                    <a className="text-blue-500 hover:text-blue-600 underline font-semibold transition-colors break-all" target="_blank" rel="noopener noreferrer" {...props} />
                  ),
                  
                  strong: ({node, ...props}) => <strong className="font-black" {...props} />,
                  em: ({node, ...props}) => <em className="italic" {...props} />,
                  hr: ({node, ...props}) => <hr className={`my-5 ${isDark ? 'border-zinc-700' : 'border-zinc-200'}`} {...props} />,
                }}
              >
                {processedContent}
              </ReactMarkdown>
              {isStreaming && (
                <span className="inline-block w-1 h-4 bg-current animate-pulse ml-0.5" />
              )}
            </div>
          ) : (
            <div className={`text-sm md:text-base leading-relaxed font-medium whitespace-pre-wrap break-words ${isDark ? 'text-zinc-100' : 'text-zinc-800'}`}>
              {processedContent}
            </div>
          )}

          {message.mapData && (
            <div className="mt-4 max-w-full">
              <MapDisplay mapData={message.mapData} isDark={isDark} />
            </div>
          )}

          {message.ebookData && (
            <div className="mt-6 max-w-full">
              <div 
                onClick={() => setShowEbook(true)}
                className="group relative aspect-video w-full rounded-2xl md:rounded-3xl overflow-hidden cursor-pointer shadow-2xl transition-all hover:scale-[1.01] active:scale-[0.99] border border-white/10"
              >
                <div className="absolute inset-0 bg-[#0a0a0a]">
                  {message.ebookData.coverImage ? (
                    <img src={message.ebookData.coverImage} className="w-full h-full object-cover opacity-60 group-hover:opacity-100 transition-opacity duration-700" alt="" />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-zinc-800 to-black" />
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent" />
                </div>

                <div className="absolute inset-0 p-4 md:p-8 flex flex-col justify-end">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="px-2 py-0.5 bg-white text-black text-[8px] md:text-[9px] font-black uppercase tracking-widest rounded shadow-xl">DECK</span>
                    <span className="text-white/40 text-[8px] md:text-[9px] font-black uppercase tracking-widest">{message.ebookData.pages.length} SLIDES</span>
                  </div>
                  <h3 className="text-lg md:text-2xl font-black text-white uppercase tracking-tighter leading-tight mb-2 group-hover:translate-x-2 transition-transform duration-500 line-clamp-2">
                    {message.ebookData.title}
                  </h3>
                  <div className="flex items-center justify-between">
                    <p className="text-white/60 text-[9px] md:text-[10px] font-black uppercase tracking-widest italic truncate max-w-[60%]">{message.ebookData.author}</p>
                    <div className="w-8 h-8 md:w-9 md:h-9 rounded-full bg-white text-black flex items-center justify-center shadow-2xl">
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z" /></svg>
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
            <div className="mt-4 grid grid-cols-2 md:grid-cols-3 gap-2">
              {message.imageUrls.map((url, idx) => (
                <div key={idx} className="cursor-zoom-in aspect-square" onClick={() => onViewImage(url)}>
                  <img src={url} className="rounded-xl border border-current/10 shadow-lg w-full h-full object-cover" alt="" />
                </div>
              ))}
            </div>
          )}

          {message.imageUrl && (
            <div className="mt-6 group relative max-w-sm md:max-w-md">
              <div className="absolute -top-2 -left-2 z-10 bg-black text-white px-2.5 py-1 rounded-full text-[8px] md:text-[9px] font-black uppercase tracking-widest border border-white/20 shadow-xl">Visual</div>
              <img src={message.imageUrl} className={`rounded-2xl border ${borderColor} shadow-xl w-full aspect-square object-cover cursor-zoom-in transition-transform group-hover:scale-[1.01]`} alt="" onClick={() => onViewImage(message.imageUrl!)} />
              <button onClick={() => onDownloadImage(message.imageUrl!)} className="absolute top-3 right-3 p-2.5 md:p-3 bg-black/50 backdrop-blur-xl text-white rounded-xl opacity-0 group-hover:opacity-100 transition-all hover:bg-black">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
              </button>
            </div>
          )}

          {message.role === 'assistant' && hasCodeSnippet && shouldShowArtifact && (
            <div className="mt-4 max-w-full overflow-hidden">
              <ArtifactCard 
                code={message.codeSnippet!} 
                timestamp={message.timestamp} 
                isDark={isDark} 
                borderColor={borderColor} 
                onOpen={() => onOpenArtifact(message.codeSnippet!)} 
              />
            </div>
          )}

          <div className="mt-6 flex items-center gap-3 flex-wrap">
            <button 
              onClick={() => onCopy(message.role === 'assistant' ? cleanTextFromCode(message.content) : message.content, message.id)} 
              className={`p-2 rounded-lg transition-all ${copyFeedback === message.id ? 'text-green-500 bg-green-500/10' : `${isDark ? 'text-zinc-400 hover:bg-zinc-800' : 'text-zinc-600 hover:bg-zinc-100'}`}`}
              title="Salin"
            >
              {copyFeedback === message.id ? (
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                </svg>
              ) : (
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
                </svg>
              )}
            </button>

            <button 
              className={`p-2 rounded-lg transition-all ${isDark ? 'text-zinc-400 hover:bg-zinc-800' : 'text-zinc-600 hover:bg-zinc-100'}`}
              title="Regenerate"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
            </button>

            <button 
              className={`p-2 rounded-lg transition-all ${isDark ? 'text-zinc-400 hover:bg-zinc-800' : 'text-zinc-600 hover:bg-zinc-100'}`}
              title="Bagikan"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
              </svg>
            </button>

            <button 
              onClick={() => setIsLiked(!isLiked)}
              className={`p-2 rounded-lg transition-all ${isLiked ? 'text-red-500 bg-red-500/10' : `${isDark ? 'text-zinc-400 hover:bg-zinc-800' : 'text-zinc-600 hover:bg-zinc-100'}`}`}
              title={isLiked ? "Unlike" : "Like"}
            >
              <svg className="w-4 h-4" fill={isLiked ? "currentColor" : "none"} stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
            </button>

            <button 
              onClick={() => onToggleSave(message.id)} 
              className={`p-2 rounded-lg transition-all ${message.isSaved ? 'text-yellow-500 bg-yellow-500/10' : `${isDark ? 'text-zinc-400 hover:bg-zinc-800' : 'text-zinc-600 hover:bg-zinc-100'}`}`}
              title={message.isSaved ? 'Tersimpan' : 'Simpan'}
            >
              <svg className="w-4 h-4" fill={message.isSaved ? "currentColor" : "none"} stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
