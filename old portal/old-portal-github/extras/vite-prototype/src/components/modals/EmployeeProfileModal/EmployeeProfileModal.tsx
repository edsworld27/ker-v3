import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { employeeProfileModalUI as ui } from './ui';
import { AppUser } from '../../../types';

interface EmployeeProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  userProfile: { name: string; email: string; avatar: string };
  setUserProfile: (profile: { name: string; email: string; avatar: string }) => void;
  currentUser: AppUser | null;
  isEditingProfile: boolean;
  setIsEditingProfile: (isEditing: boolean) => void;
  users: AppUser[];
  setUsers: (users: AppUser[]) => void;
  addLog: (action: string, details: string, type: 'auth' | 'impersonation' | 'action' | 'system') => void;
}

export function EmployeeProfileModal({
  isOpen,
  onClose,
  userProfile,
  setUserProfile,
  currentUser,
  isEditingProfile,
  setIsEditingProfile,
  users,
  setUsers,
  addLog
}: EmployeeProfileModalProps) {
  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className={ui.overlay}>
        <motion.div
          initial={ui.backdrop.motion.initial}
          animate={ui.backdrop.motion.animate}
          exit={ui.backdrop.motion.exit}
          onClick={onClose}
          className={ui.backdrop.className}
        />
        <motion.div
          initial={ui.modal.motion.initial}
          animate={ui.modal.motion.animate}
          exit={ui.modal.motion.exit}
          className={ui.modal.base}
        >
          <div className={ui.header.base}>
            <h2 className={ui.header.title}>{ui.text.title}</h2>
            <button onClick={onClose} className={ui.header.closeButton}>
              <ui.header.closeIcon className={ui.header.closeIconSize} />
            </button>
          </div>
          <div className={ui.body}>
            <div className={ui.profileSection.base}>
              <div className={ui.profileSection.avatar}>{userProfile.avatar}</div>
              <div>
                <h2 className={ui.profileSection.name}>{userProfile.name}</h2>
                <div className={ui.profileSection.metaRow}>
                  <span className={ui.profileSection.metaItem}>
                    <ui.profileSection.mailIcon className={ui.profileSection.metaIconSize} /> {userProfile.email}
                  </span>
                  <span className={ui.profileSection.metaItem}>
                    <ui.profileSection.shieldIcon className={ui.profileSection.metaIconSize} /> {currentUser?.role}
                  </span>
                </div>
              </div>
            </div>

            <div className={ui.grid}>
              <div className={ui.card.base}>
                <h3 className={ui.card.sectionHeader}>
                  <ui.card.infoIcon className={`${ui.card.iconSize} ${ui.card.infoIconColor}`} />
                  {ui.text.generalInfoTitle}
                </h3>
                <div className={ui.card.fieldContainer}>
                  <div className={ui.card.field.base}>
                    <label className={ui.card.field.label}>{ui.text.fullNameLabel}</label>
                    <input
                      type="text"
                      value={userProfile.name}
                      onChange={(e) => setUserProfile({ ...userProfile, name: e.target.value })}
                      className={ui.card.field.input}
                      disabled={!isEditingProfile}
                    />
                  </div>
                  <div className={ui.card.field.base}>
                    <label className={ui.card.field.label}>{ui.text.bioLabel}</label>
                    <textarea
                      rows={3}
                      value={currentUser?.bio || ''}
                      onChange={(e) => setUsers(users.map(u => u.id === currentUser?.id ? { ...u, bio: e.target.value } : u))}
                      className={ui.card.field.textarea}
                      disabled={!isEditingProfile}
                      placeholder={ui.text.bioPlaceholder}
                    />
                  </div>
                </div>
              </div>

              <div className={ui.card.base}>
                <h3 className={ui.card.sectionHeader}>
                  <ui.card.availabilityIcon className={`${ui.card.iconSize} ${ui.card.availabilityIconColor}`} />
                  {ui.text.availabilityTitle}
                </h3>
                <div className={ui.card.fieldContainer}>
                  <div className={ui.card.field.base}>
                    <label className={ui.card.field.label}>{ui.text.workingHoursLabel}</label>
                    <div className={ui.card.field.inputWithIconWrapper}>
                      <ui.card.field.clockIcon className={ui.card.field.iconInside} />
                      <input
                        type="text"
                        value={currentUser?.workingHours || ui.text.workingHoursDefault}
                        onChange={(e) => setUsers(users.map(u => u.id === currentUser?.id ? { ...u, workingHours: e.target.value } : u))}
                        className={ui.card.field.inputWithIcon}
                        disabled={!isEditingProfile}
                        placeholder={ui.text.workingHoursPlaceholder}
                      />
                    </div>
                  </div>
                  <div className={ui.card.statusCard.base}>
                    <div className={ui.card.statusCard.label}>{ui.text.statusLabel}</div>
                    <div className={ui.card.statusCard.statusRow}>
                      <div className={ui.card.statusCard.dot} />
                      <span className={ui.card.statusCard.text}>{ui.text.statusText}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className={ui.footer.base}>
              {isEditingProfile ? (
                <>
                  <button onClick={() => setIsEditingProfile(false)} className={ui.footer.cancelButton}>
                    {ui.text.cancelText}
                  </button>
                  <button
                    onClick={() => {
                      setIsEditingProfile(false);
                      addLog('Profile Updated', 'User updated their profile information', 'action');
                    }}
                    className={ui.footer.saveButton}
                  >
                    {ui.text.saveText}
                  </button>
                </>
              ) : (
                <button onClick={() => setIsEditingProfile(true)} className={ui.footer.editButton}>
                  <ui.footer.editIcon className={ui.footer.editIconSize} />
                  {ui.text.editText}
                </button>
              )}
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
