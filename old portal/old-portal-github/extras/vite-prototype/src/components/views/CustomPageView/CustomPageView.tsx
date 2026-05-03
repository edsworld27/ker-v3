import React from 'react';
import { motion } from 'motion/react';
import { customPageViewUI as ui } from './ui';
import { useAppContext } from '../../../context/AppContext';
import { DashboardWidget } from '../../shared/DashboardWidget';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts';

interface CustomPageViewProps {
  pageId: string;
}

export const CustomPageView: React.FC<CustomPageViewProps> = ({ pageId }) => {
  const { customPages } = useAppContext();
  const page = customPages.find(p => p.id === pageId);

  if (!page) {
    return (
      <div className={ui.notFound.base}>
        <h2 className={ui.notFound.titleStyle}>{ui.notFound.text.title}</h2>
        <p className={ui.notFound.subtitleStyle}>{ui.notFound.text.subtitle}</p>
      </div>
    );
  }

  return (
    <motion.div
      key={page.id}
      initial={ui.container.animation.initial}
      animate={ui.container.animation.animate}
      className={ui.container.base}
    >
      <div className={ui.header.base}>
        <div>
          <h2 className={ui.header.titleStyle}>{page.title}</h2>
          <p className={ui.header.subtitleStyle}>{ui.header.text.subtitle}</p>
        </div>
      </div>

      <div className={ui.metricsGrid}>
        {page.widgets.map(widget => {
          if (widget.type === 'metric') {
            return (
              <DashboardWidget
                key={widget.id}
                icon={ui.metricWidget.icon}
                label={widget.title}
                value={ui.metricWidget.value}
                trend={ui.metricWidget.trend}
                color={ui.metricWidget.color}
              />
            );
          }
          return null;
        })}
      </div>

      <div className={ui.widgetGrid}>
        {page.widgets.map(widget => {
          if (widget.type !== 'metric') {
            return (
              <div key={widget.id} className={`${ui.widgetCard.base} ${widget.size === 'full' ? ui.widgetCard.fullWidth : ''}`}>
                <h3 className={ui.widgetCard.titleStyle}>{widget.title}</h3>
                {widget.type === 'text' && (
                  <p className={ui.textWidget.base}>{widget.content || ui.textWidget.emptyText}</p>
                )}
                {widget.type === 'chart' && (
                  <div className={ui.chartWidget.height}>
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={ui.dummyChartData}>
                        <defs>
                          <linearGradient id={ui.chartWidget.gradientId} x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor={ui.chartWidget.gradientStartColor} stopOpacity={ui.chartWidget.gradientStartOpacity} />
                            <stop offset="95%" stopColor={ui.chartWidget.gradientStartColor} stopOpacity={ui.chartWidget.gradientEndOpacity} />
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke={ui.chartWidget.gridStroke} vertical={false} />
                        <XAxis dataKey="name" stroke={ui.chartWidget.axisStroke} fontSize={ui.chartWidget.axisFontSize} tickLine={false} axisLine={false} />
                        <YAxis stroke={ui.chartWidget.axisStroke} fontSize={ui.chartWidget.axisFontSize} tickLine={false} axisLine={false} />
                        <Tooltip contentStyle={ui.chartWidget.tooltipStyle} itemStyle={ui.chartWidget.tooltipItemStyle} />
                        <Area type="monotone" dataKey="value" stroke={ui.chartWidget.lineColor} strokeWidth={ui.chartWidget.lineWidth} fillOpacity={1} fill={`url(#${ui.chartWidget.gradientId})`} />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                )}
                {widget.type === 'list' && (
                  <div className={ui.listWidget.base}>
                    {ui.dummyListData.map(item => (
                      <div key={item.id} className={ui.listWidget.item}>
                        <div className={ui.listWidget.itemLeft}>
                          <div className={`${ui.listWidget.statusDot} ${ui.listWidget.statusColors[item.status as keyof typeof ui.listWidget.statusColors] || ui.listWidget.statusColors.error}`} />
                          <span className={ui.listWidget.itemTitle}>{item.title}</span>
                        </div>
                        <span className={ui.listWidget.itemTime}>{item.time}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          }
          return null;
        })}
      </div>
    </motion.div>
  );
};
