import React from 'react';
import { CheckCircle, Circle } from 'lucide-react';
import { projectTimelineUI as ui } from './ui';

export const ProjectTimeline: React.FC = () => (
  <section className={`glass-card ${ui.wrapper.padding} ${ui.wrapper.radius}`}>

    {/* Title */}
    <h3 className={`${ui.title.fontSize} ${ui.title.fontWeight} ${ui.title.gap}`}>{ui.title.label}</h3>

    {/* Stages */}
    <div className={ui.list.spacing}>
      {ui.stages.map((item, i) => {
        const dot = ui.dot[item.status as keyof typeof ui.dot] as { bg: string; textColor: string; border: string };
        return (
          <div key={i} className={ui.item.layout}>

            {/* Status dot */}
            <div className={`${ui.dot.size} ${ui.dot.radius} ${ui.dot.layout} ${dot.bg} ${dot.textColor} ${dot.border}`}>
              {item.status === 'completed'
                ? <CheckCircle className={ui.dot.iconSize} />
                : <Circle className={ui.dot.iconSize} />}
            </div>

            {/* Label + date + progress */}
            <div className="flex-1">
              <div className={ui.label.layout}>
                <span className={`${ui.label.fontSize} ${ui.label.fontWeight} ${item.status === 'pending' ? ui.label.colorPending : ui.label.colorActive}`}>
                  {item.stage}
                </span>
                <span className={`${ui.label.dateFontSize} ${ui.label.dateColor}`}>{item.date}</span>
              </div>
              {item.status === 'current' && (
                <div className={ui.progressBar.wrapper}>
                  <div className={ui.progressBar.fill} />
                </div>
              )}
            </div>

          </div>
        );
      })}
    </div>

  </section>
);
