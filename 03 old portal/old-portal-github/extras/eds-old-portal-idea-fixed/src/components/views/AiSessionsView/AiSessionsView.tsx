import React from 'react';
import { motion } from 'motion/react';
import { DashboardWidget } from '../../shared/DashboardWidget';
import { aiSessionsViewUI as ui } from './ui';
import { useAppContext } from '../../../context/AppContext';

interface AiSession {
  id: string;
  userId: number;
  userName: string;
  interactions: {
    prompt: string;
    response: string;
    timestamp: string;
  }[];
}

interface AiSessionsViewProps {
  aiSessions?: AiSession[];
}

export const AiSessionsView: React.FC<AiSessionsViewProps> = (props) => {
  const { aiSessions: contextAiSessions } = useAppContext() as any;
  const aiSessions = props.aiSessions || contextAiSessions || [];
  return (
    <motion.div key={ui.page.motionKey} initial={ui.page.animation.initial} animate={ui.page.animation.animate} className={ui.page.layout}>
      <div className={ui.header.layout}>
        <div>
          <h2 className={ui.header.titleStyle}>{ui.header.title}</h2>
          <p className={ui.header.subtitleStyle}>{ui.header.subtitle}</p>
        </div>
        <div className={ui.header.actions.layout}>
          <button className={ui.header.actions.exportBtn}>{ui.header.actions.exportLabel}</button>
        </div>
      </div>

      <div className={ui.widgets.grid}>
        {ui.widgets.items.map(widget => (
          <DashboardWidget key={widget.id} icon={widget.icon} label={widget.label} value={widget.value} trend={widget.trend} color={widget.color as any} />
        ))}
      </div>

      <div className={ui.sessions.layout}>
        <h3 className={ui.sessions.titleStyle}>{ui.sessions.title}</h3>
        {aiSessions.map(session => (
          <div key={session.id} className={ui.sessions.card.layout}>
            <div className={ui.sessions.card.header.layout}>
              <div className={ui.sessions.card.header.userGroup}>
                <div className={ui.sessions.card.header.avatar}>{((session.userName || '').split(' ') || []).map(n => n[0]).join('')}</div>
                <div className={ui.sessions.card.header.infoGroup}>
                  <div className={ui.sessions.card.header.userName}>{session.userName}</div>
                  <div className={ui.sessions.card.header.sessionId}>{session.id}</div>
                </div>
              </div>
              <span className={ui.sessions.card.header.interactionsBadge}>{(session.interactions || []).length}{ui.sessions.card.header.interactionsSuffix}</span>
            </div>
            <div className={ui.sessions.card.interactionsList}>
              {(session.interactions || []).map((int, i) => (
                <div key={`${session.id}-int-${i}`} className={ui.sessions.card.interaction.layout}>
                  <div className={ui.sessions.card.interaction.promptHeader}>
                    <div className={ui.sessions.card.interaction.promptLabel}>{ui.sessions.card.interaction.promptLabelText}</div>
                    <div className={ui.sessions.card.interaction.timeStyle}>{new Date(int.timestamp).toLocaleTimeString()}</div>
                  </div>
                  <p className={ui.sessions.card.interaction.promptText}>"{int.prompt}"</p>
                  <div className={ui.sessions.card.interaction.responseSection}>
                    <div className={ui.sessions.card.interaction.responseLabel}>{ui.sessions.card.interaction.responseLabelText}</div>
                    <p className={ui.sessions.card.interaction.responseText}>{int.response}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </motion.div>
  );
};