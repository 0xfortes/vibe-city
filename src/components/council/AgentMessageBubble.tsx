'use client';

import { useRef, useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import type { AgentMessage } from '@/types';
import { AgentAvatar } from '@/components/ui';
import { AGENT_COLORS } from '@/config/agent-colors';
import { ReactionBadge } from './ReactionBadge';

interface AgentMessageBubbleProps {
  message: AgentMessage;
  index: number;
  isExpanded: boolean;
  onToggle: () => void;
}

function getSummary(content: string): string {
  // First sentence or first ~80 chars
  const firstSentence = content.match(/^[^.!?]+[.!?]/);
  if (firstSentence && firstSentence[0].length <= 100) {
    return firstSentence[0];
  }
  if (content.length <= 80) return content;
  return content.slice(0, 80).replace(/\s+\S*$/, '') + '...';
}

/** Map pin SVG icon (12px) */
function MapPinIcon({ color }: { color: string }) {
  return (
    <svg
      width="12"
      height="12"
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="inline-block shrink-0"
    >
      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
      <circle cx="12" cy="10" r="3" />
    </svg>
  );
}

function highlightVenues(content: string, venues: string[]): string {
  let result = content;
  for (const venue of venues) {
    const escaped = venue.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    result = result.replace(new RegExp(escaped, 'g'), `**${venue}**`);
  }
  return result;
}

function renderContent(text: string, accentColor: string): React.ReactNode[] {
  const parts = text.split(/\*\*(.*?)\*\*/g);
  return parts.map((part, i) =>
    i % 2 === 1 ? (
      <span
        key={i}
        className="mx-0.5 inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium"
        style={{
          backgroundColor: `${accentColor}26`, // 15% opacity
          border: `1px solid ${accentColor}4D`, // 30% opacity
          color: accentColor,
        }}
      >
        <MapPinIcon color={accentColor} />
        {part}
      </span>
    ) : (
      <span key={i}>{part}</span>
    ),
  );
}

export function AgentMessageBubble({ message, index, isExpanded, onToggle }: AgentMessageBubbleProps) {
  const highlighted = highlightVenues(message.content, message.venues);
  const colors = AGENT_COLORS[message.agentId];
  const summary = getSummary(message.content);
  const contentRef = useRef<HTMLDivElement>(null);
  const [contentHeight, setContentHeight] = useState(0);

  useEffect(() => {
    if (contentRef.current) {
      setContentHeight(contentRef.current.scrollHeight);
    }
  }, [message.content, isExpanded]);

  return (
    <motion.div
      className={`cursor-pointer rounded-lg border-l-2 ${colors.border} ${colors.bg} transition-colors hover:brightness-110`}
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ delay: index * 0.08, duration: 0.35 }}
      onClick={onToggle}
    >
      {/* Header — always visible */}
      <div className="flex items-center gap-3 p-3">
        <div className="shrink-0">
          <AgentAvatar agentId={message.agentId} showName={false} size="sm" />
        </div>
        <div className="flex min-w-0 flex-1 items-center gap-2">
          <span className={`text-sm font-medium ${colors.text}`}>{message.agentName}</span>
          {!isExpanded && (
            <span className="truncate text-sm text-white/40">{summary}</span>
          )}
        </div>
        <motion.span
          className="shrink-0 text-white/30"
          animate={{ rotate: isExpanded ? 180 : 0 }}
          transition={{ duration: 0.2 }}
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
            <path d="M4.47 5.47a.75.75 0 0 1 1.06 0L8 7.94l2.47-2.47a.75.75 0 1 1 1.06 1.06l-3 3a.75.75 0 0 1-1.06 0l-3-3a.75.75 0 0 1 0-1.06z" />
          </svg>
        </motion.span>
      </div>

      {/* Expandable content */}
      <div
        className="overflow-hidden transition-all duration-300 ease-in-out"
        style={{
          maxHeight: isExpanded ? `${contentHeight + 32}px` : '0px',
          opacity: isExpanded ? 1 : 0,
        }}
      >
        <div ref={contentRef} className="px-3 pb-3 pl-12">
          <p className="text-sm leading-relaxed text-white/60">
            {renderContent(highlighted, colors.accent)}
          </p>
          {message.reactions.length > 0 && (
            <div className="flex flex-wrap gap-1.5 pt-2">
              {message.reactions.map((reaction, i) => (
                <ReactionBadge key={`${reaction.agentId}-${i}`} reaction={reaction} />
              ))}
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}
