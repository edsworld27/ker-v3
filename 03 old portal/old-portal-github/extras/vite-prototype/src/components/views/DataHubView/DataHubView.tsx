import React from 'react';
import { motion } from 'motion/react';
import { ArrowLeft, Download, FileText } from 'lucide-react';
import { dataHubViewUI as ui } from './ui';

interface DataHubViewProps {
  handleViewChange: (view: any) => void;
}

export const DataHubView: React.FC<DataHubViewProps> = ({ handleViewChange }) => {
  const DiscoveryIcon = ui.discovery.titleIcon;
  const StakeholderIcon = ui.stakeholders.titleIcon;
  const DocsIcon = ui.documents.titleIcon;

  return (
    <motion.div
      key={ui.page.motionKey}
      initial={ui.page.animation.initial}
      animate={ui.page.animation.animate}
      className={`${ui.page.padding} ${ui.page.maxWidth}`}
    >
      {/* Header */}
      <div className={`${ui.header.layout} ${ui.header.gap}`}>
        <div>
          <h2 className={`${ui.header.titleSize} ${ui.header.titleWeight} ${ui.header.titleGap}`}>{ui.header.title}</h2>
          <p className={`${ui.header.subtitleSize} ${ui.header.subtitleColor}`}>{ui.header.subtitle}</p>
        </div>
        <button
          onClick={() => handleViewChange(ui.header.backBtn.target)}
          className={`${ui.header.backBtn.layout} ${ui.header.backBtn.textColor} ${ui.header.backBtn.textColorHover} ${ui.header.backBtn.transition} ${ui.header.backBtn.fontSize} ${ui.header.backBtn.alignment}`}
        >
          <ArrowLeft className={ui.header.backBtn.iconSize} />
          {ui.header.backBtn.label}
        </button>
      </div>

      <div className={ui.contentGrid.layout}>

        {/* Main column */}
        <div className={ui.contentGrid.mainCol}>

          {/* Discovery info */}
          <section className={`glass-card ${ui.discovery.padding} ${ui.discovery.radius}`}>
            <h3 className={ui.discovery.titleLayout}>
              <DiscoveryIcon className={`${ui.discovery.titleIconSize} ${ui.discovery.titleIconColor}`} />
              {ui.discovery.title}
            </h3>
            <div className={ui.discovery.grid}>
              {ui.discovery.fields.map((field, i) => (
                <div key={i} className={`${ui.discovery.cell.padding} ${ui.discovery.cell.bg} ${ui.discovery.cell.radius}`}>
                  <div className={`${ui.discovery.cell.labelSize} ${ui.discovery.cell.labelTransform} ${ui.discovery.cell.labelTracking} ${ui.discovery.cell.labelWeight} ${ui.discovery.cell.labelColor} ${ui.discovery.cell.labelGap}`}>{field.label}</div>
                  <p className={`${ui.discovery.cell.valueSize} ${ui.discovery.cell.valueTruncate}`}>{field.value}</p>
                </div>
              ))}
              <div className={`${ui.discovery.cell.padding} ${ui.discovery.cell.bg} ${ui.discovery.cell.radius} ${ui.discovery.challenges.span}`}>
                <div className={`${ui.discovery.cell.labelSize} ${ui.discovery.cell.labelTransform} ${ui.discovery.cell.labelTracking} ${ui.discovery.cell.labelWeight} ${ui.discovery.cell.labelColor} ${ui.discovery.cell.labelGap}`}>{ui.discovery.challenges.label}</div>
                <ul className={ui.discovery.challenges.listStyle}>
                  {ui.discovery.challenges.items.map((item, i) => <li key={i}>{item}</li>)}
                </ul>
              </div>
            </div>
          </section>

          {/* Stakeholders */}
          <section className={`glass-card ${ui.stakeholders.padding} ${ui.stakeholders.radius}`}>
            <h3 className={ui.stakeholders.titleLayout}>
              <StakeholderIcon className={`${ui.stakeholders.titleIconSize} ${ui.stakeholders.titleIconColor}`} />
              {ui.stakeholders.title}
            </h3>
            <div className={ui.stakeholders.listSpacing}>
              {ui.stakeholders.people.map((person, i) => (
                <div key={i} className={`${ui.stakeholders.row.layout} ${ui.stakeholders.row.padding} ${ui.stakeholders.row.bg} ${ui.stakeholders.row.radius} ${ui.stakeholders.row.border} ${ui.stakeholders.row.gap}`}>
                  <div className="min-w-0">
                    <div className={ui.stakeholders.row.nameSize}>{person.name}</div>
                    <div className={ui.stakeholders.row.roleSize}>{person.role}</div>
                  </div>
                  <div className={ui.stakeholders.row.metricsLayout}>
                    <div><span className={ui.stakeholders.row.metricLabel}>Influence: </span><span className={person.influence === 'High' ? ui.stakeholders.row.highColor : ui.stakeholders.row.medColor}>{person.influence}</span></div>
                    <div><span className={ui.stakeholders.row.metricLabel}>Interest: </span><span className={person.interest === 'High' ? ui.stakeholders.row.highColor : ui.stakeholders.row.medColor}>{person.interest}</span></div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>

        {/* Side column */}
        <div className={ui.contentGrid.sideCol}>

          {/* Documents */}
          <section className={`glass-card ${ui.documents.padding} ${ui.documents.radius}`}>
            <h3 className={ui.documents.titleLayout}>
              <DocsIcon className={`${ui.documents.titleIconSize} ${ui.documents.titleIconColor}`} />
              {ui.documents.title}
            </h3>
            <div className={ui.documents.listSpacing}>
              {ui.documents.files.map((file, i) => (
                <div key={i} className={`${ui.documents.row.layout} ${ui.documents.row.padding} ${ui.documents.row.bg} ${ui.documents.row.radius} ${ui.documents.row.border} ${ui.documents.row.borderHover} ${ui.documents.row.transition}`}>
                  <div className={ui.documents.row.iconLayout}>
                    <FileText className={`${ui.documents.row.iconSize} ${ui.documents.row.iconColor}`} />
                    <span className={`${ui.documents.row.nameSize} ${ui.documents.row.nameColor}`}>{file}</span>
                  </div>
                  <Download className={`${ui.documents.row.downloadIconSize} ${ui.documents.row.downloadColor}`} />
                </div>
              ))}
            </div>
          </section>

          {/* Transparency CTA */}
          <div className={`${ui.transparency.padding} ${ui.transparency.radius} ${ui.transparency.bg} ${ui.transparency.border}`}>
            <h4 className={`${ui.transparency.titleWeight} ${ui.transparency.titleGap} ${ui.transparency.titleSize}`}>{ui.transparency.title}</h4>
            <p className={`${ui.transparency.bodySize} ${ui.transparency.bodyColor} ${ui.transparency.bodyLeading}`}>{ui.transparency.body}</p>
          </div>

        </div>
      </div>
    </motion.div>
  );
};
