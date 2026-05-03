import React, { useState } from 'react';
import { motion } from 'motion/react';
import { agencyBuilderViewUI as ui } from './ui';
import { useAppContext } from '../../../context/AppContext';
import { CustomSidebarLink, AgencyTemplate } from '../../../types';
import { PageBuilder } from '../PageBuilder';
import { RoleBuilder } from '../RoleBuilder';
import { ViewLayoutEditor } from './ViewLayoutEditor';
import { PREDEFINED_TEMPLATES } from '../../../data/templates';
import { useTheme } from '../../../hooks/useTheme';
import { Save, BookMarked } from 'lucide-react';

export function AgencyBuilderView() {
  const { customSidebarLinks, setCustomSidebarLinks, activeTemplate, setActiveTemplate, addLog, customPages, agencyConfig, setAgencyConfig } = useAppContext();
  const theme = useTheme();
  const [editingLinks, setEditingLinks] = useState<CustomSidebarLink[]>(customSidebarLinks);
  const [activeTab, setActiveTab] = useState<'navigation' | 'layouts' | 'pages' | 'roles'>('navigation');
  const [customTemplates, setCustomTemplates] = useState<AgencyTemplate[]>([]);

  React.useEffect(() => {
    setEditingLinks(customSidebarLinks);
  }, [customSidebarLinks]);

  const allTemplates = [...PREDEFINED_TEMPLATES, ...customTemplates];

  const handleActivateTemplate = (template: AgencyTemplate) => {
    // Apply full role definitions from the template into agencyConfig
    setAgencyConfig(prev => ({
      ...prev,
      roles: {
        ...Object.fromEntries(
          Object.entries(template.roles).map(([roleId, roleDef]) => [
            roleId,
            {
              ...roleDef,
              // Preserve any isSystem flag from existing roles with same id
              isSystem: prev.roles[roleId]?.isSystem ?? false,
            },
          ])
        ),
      },
    }));
    setActiveTemplate(template);
    setCustomSidebarLinks(template.sidebarLinks);
    setEditingLinks(template.sidebarLinks);
    addLog('Template Activated', `Applied template: ${template.name}`, 'system');
  };

  const handleSaveAsTemplate = () => {
    const name = prompt('Name this template:');
    if (!name?.trim()) return;

    const snapshot: AgencyTemplate = {
      id: `custom-${Date.now()}`,
      name: name.trim(),
      description: `Custom template saved from current configuration.`,
      features: [],
      sidebarLinks: customSidebarLinks,
      isCustom: true,
      roles: Object.fromEntries(
        Object.entries(agencyConfig.roles).map(([roleId, rc]) => [
          roleId,
          {
            displayName: rc.displayName,
            accentColor: rc.accentColor,
            allowedViews: rc.allowedViews,
            canImpersonate: rc.canImpersonate,
            canManageUsers: rc.canManageUsers,
            canManageRoles: rc.canManageRoles,
            canAccessConfigurator: rc.canAccessConfigurator,
            labelOverrides: rc.labelOverrides,
            viewLayouts: rc.viewLayouts ?? {},
          },
        ])
      ),
    };

    setCustomTemplates(prev => [...prev, snapshot]);
    addLog('Template Saved', `Saved custom template: ${name.trim()}`, 'system');
  };

  const handleAddLink = () => {
    const newLink: CustomSidebarLink = {
      id: `link-${Date.now()}`,
      label: 'New Link',
      iconName: 'Link2',
      view: 'dashboard',
      roles: ['Founder'],
      order: editingLinks.length + 1,
    };
    setEditingLinks([...editingLinks, newLink]);
  };

  const handleUpdateLink = (id: string, updates: Partial<CustomSidebarLink>) => {
    setEditingLinks(editingLinks.map(link => link.id === id ? { ...link, ...updates } : link));
  };

  const handleRemoveLink = (id: string) => {
    setEditingLinks(editingLinks.filter(link => link.id !== id));
  };

  const handleSaveLinks = () => {
    setCustomSidebarLinks(editingLinks);
    addLog('Sidebar Updated', 'Custom sidebar links were updated', 'system');
  };

  const nav = ui.navigation;
  const sidebar = nav.sidebarSection;

  return (
    <motion.div
      key={ui.container.animation.key}
      initial={ui.container.animation.initial}
      animate={ui.container.animation.animate}
      exit={ui.container.animation.exit}
      className={ui.container.base}
    >
      <div className={ui.header.base}>
        <div>
          <h1 className={ui.header.titleStyle}>{ui.header.text.title}</h1>
          <p className={ui.header.subtitleStyle}>{ui.header.text.subtitle}</p>
        </div>
        <button
          onClick={handleSaveAsTemplate}
          className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all"
          style={theme.primaryBgStyle}
        >
          <Save className="w-4 h-4" />
          Save as Template
        </button>
      </div>

      {/* Tabs */}
      <div className={ui.tabs.base}>
        {ui.tabs.items.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as typeof activeTab)}
            className={`${ui.tabs.button.base} ${activeTab === tab.id ? '' : ui.tabs.button.inactive}`}
            style={activeTab === tab.id ? { backgroundColor: `${theme.primary}33`, color: theme.primary } : undefined}
          >
            <tab.icon className="w-4 h-4" />
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === 'pages' && <PageBuilder />}
      {activeTab === 'roles' && <RoleBuilder />}
      {activeTab === 'layouts' && <ViewLayoutEditor />}

      {activeTab === 'navigation' && (
        <div className={nav.grid}>

          {/* Templates */}
          <div className={nav.templatesSection.base}>
            <div className={nav.templatesSection.card}>
              <h2 className={nav.templatesSection.titleStyle}>
                <nav.templatesSection.titleIcon className={nav.templatesSection.titleIconSize} />
                {nav.templatesSection.titleText}
              </h2>
              <div className={nav.templatesSection.list}>
                {allTemplates.map(template => (
                  <div
                    key={template.id}
                    className={`${nav.templatesSection.templateCard.base} ${activeTemplate?.id === template.id ? nav.templatesSection.templateCard.active : nav.templatesSection.templateCard.inactive}`}
                  >
                    <div className={nav.templatesSection.templateCard.headerRow}>
                      <div className="flex items-center gap-2">
                        <h3 className={nav.templatesSection.templateCard.name}>{template.name}</h3>
                        {template.isCustom && (
                          <span className="text-[10px] px-1.5 py-0.5 rounded-md bg-white/10 text-slate-400 font-medium">Custom</span>
                        )}
                      </div>
                      {activeTemplate?.id === template.id && (
                        <nav.templatesSection.templateCard.activeIcon className={nav.templatesSection.templateCard.activeIconSize} />
                      )}
                    </div>
                    <p className={nav.templatesSection.templateCard.description}>{template.description}</p>

                    {/* Role pills */}
                    <div className="flex flex-wrap gap-1 mb-3">
                      {Object.entries(template.roles).map(([roleId, roleDef]) => (
                        <span
                          key={roleId}
                          className="text-[10px] px-2 py-0.5 rounded-full font-medium"
                          style={{ backgroundColor: `${roleDef.accentColor}20`, color: roleDef.accentColor }}
                        >
                          {roleDef.displayName}
                        </span>
                      ))}
                    </div>

                    <button
                      onClick={() => handleActivateTemplate(template)}
                      className={`${nav.templatesSection.templateCard.activateButton.base} ${activeTemplate?.id === template.id ? nav.templatesSection.templateCard.activateButton.active : nav.templatesSection.templateCard.activateButton.inactive}`}
                    >
                      {activeTemplate?.id === template.id
                        ? nav.templatesSection.templateCard.text.activeLabel
                        : nav.templatesSection.templateCard.text.activateLabel}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Sidebar link editor */}
          <div className={sidebar.base}>
            <div className={sidebar.card}>
              <div className={sidebar.header}>
                <h2 className={sidebar.titleStyle}>
                  <sidebar.titleIcon className={sidebar.titleIconSize} />
                  {sidebar.titleText}
                </h2>
                <div className={sidebar.headerActions}>
                  <button onClick={handleAddLink} className={sidebar.addButton}>
                    <sidebar.addIcon className={sidebar.addIconSize} />
                    {sidebar.text.addLinkText}
                  </button>
                  <button onClick={handleSaveLinks} className={sidebar.saveButton} style={theme.primaryBgStyle}>
                    <sidebar.saveIcon className={sidebar.saveIconSize} />
                    {sidebar.text.saveChangesText}
                  </button>
                </div>
              </div>

              <div className={sidebar.linkList}>
                {editingLinks.length === 0 ? (
                  <div className={sidebar.linkEmpty}>{sidebar.text.emptyState}</div>
                ) : (
                  editingLinks.sort((a, b) => a.order - b.order).map(link => (
                    <div key={link.id} className={sidebar.linkRow.base}>
                      <div className={sidebar.linkRow.grip}>
                        <sidebar.linkRow.gripIcon className={sidebar.linkRow.gripIconSize} />
                      </div>

                      <div className={sidebar.linkRow.fieldsGrid}>
                        <div>
                          <label className={sidebar.linkRow.label}>{sidebar.linkRow.text.labelField}</label>
                          <input
                            type="text"
                            value={link.label}
                            onChange={e => handleUpdateLink(link.id, { label: e.target.value })}
                            className={sidebar.linkRow.input}
                          />
                        </div>
                        <div>
                          <label className={sidebar.linkRow.label}>{sidebar.linkRow.text.iconField}</label>
                          <input
                            type="text"
                            value={link.iconName}
                            onChange={e => handleUpdateLink(link.id, { iconName: e.target.value })}
                            className={sidebar.linkRow.input}
                            placeholder={sidebar.linkRow.text.iconPlaceholder}
                          />
                        </div>
                        <div className={sidebar.linkRow.colSpan}>
                          <label className={sidebar.linkRow.label}>{sidebar.linkRow.text.viewField}</label>
                          <select
                            value={link.view}
                            onChange={e => handleUpdateLink(link.id, { view: e.target.value })}
                            className={sidebar.linkRow.select}
                          >
                            <optgroup label={sidebar.text.standardViewsGroup}>
                              {sidebar.standardViewOptions.map(opt => (
                                <option key={opt.value} value={opt.value}>{opt.label}</option>
                              ))}
                            </optgroup>
                            {customPages.length > 0 && (
                              <optgroup label={sidebar.text.customPagesGroup}>
                                {customPages.map(page => (
                                  <option key={page.id} value={page.slug}>{page.title}</option>
                                ))}
                              </optgroup>
                            )}
                          </select>
                        </div>
                      </div>

                      <button
                        onClick={() => handleRemoveLink(link.id)}
                        className={sidebar.linkRow.removeButton}
                      >
                        <sidebar.linkRow.removeIcon className={sidebar.linkRow.removeIconSize} />
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </motion.div>
  );
}
