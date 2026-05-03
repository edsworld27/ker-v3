# `src/context/` — React Contexts

Three contexts power the app's state distribution. All are wrapped in `App.tsx` (`<InboxProvider><AppProvider value={…}>`) and `main.tsx` (`<ModalProvider>`).

```
main.tsx:
  <ModalProvider>
    <App />            ← App.tsx wraps its children in:
      <InboxProvider>
        <AppProvider value={appContextValue}>
          ...everything
```

## Files

### `AppContext.tsx` — The everything bag

The largest context. Holds all domain state plus all action handlers. Exposed via:

```ts
const ctx = useAppContext();
ctx.clients;                    // Client[]
ctx.setClients(updater);
ctx.currentUser;                // AppUser | undefined
ctx.handleViewChange('crm');    // change active portal view
ctx.handleImpersonate(userId);
ctx.addLog('Action', 'details', 'auth');
```

#### State slices it owns

`users, clients, tickets, projects, projectTasks, tasks, agencyMessages, activityLogs, userProfile, agencies, customPages, todos, customSidebarLinks` — plus their setters.

#### Identity / current-user state

`currentUser, currentAgency, isAgencyAdmin, isAgencyEmployee, impersonatedUserEmail, impersonatingClientId, loginPortalType, activeAgencyId, activeTemplate`.

#### Config state

`masterConfig, agencyConfig, appLogo` — plus setters.

#### Action handlers (memoized in `useAppLogic`)

`handleImpersonate, handleStopImpersonating, handleUpdateClientStage, handleEditClient, handleDeleteUser, handleViewChange, canCurrentUserImpersonate, addLog`.

#### UI state shared via context

`portalView, setPortalView, editingClient, selectedTask, setSelectedTask, confirmationConfig`.

> **The contract:** `App.tsx` builds an `appContextValue` object from `useAppLogic()` outputs and passes it as `<AppProvider value={…}>`. There's no internal state inside the provider — it's purely a forwarder. This means hot-reloading state lives in `useAppLogic`, not here.

### `ModalContext.tsx` — Modal toggles

Pure `useState` boolean toggles for every modal in the app, plus a few shared UI booleans.

```ts
const {
  showAddClientModal, setShowAddClientModal,
  showInboxModal, setShowInboxModal,
  showMobileMenu, setShowMobileMenu,
  setShowSettingsModal,
  setShowGlobalTasksModal,
  setShowEmployeeManagementModal,
  setShowAppLauncherModal,
  setShowTicketModal,
  // ...18 modals total
} = useModalContext();
```

Why a context: modals are triggered from anywhere (sidebar, header, dropdown menus, deep inside view components). Pulling them up to `App.tsx` would require prop-drilling toggles through dozens of layers. Context is fine here — these are local UI state, not cross-cutting concerns.

`<ModalManager />` (in `src/components/ModalManager.tsx`) reads ALL of these and conditionally mounts the corresponding modal components.

### `InboxContext.tsx` — Inbox / messaging

Owns the chat-channel data: `channels[], messages[], activeChannelId`, plus `createChannel()` and `sendMessage()` actions.

Used by `InboxView`, `InboxModal`, `AgencyCommunicateModal`, and `ProjectChat`.

Lighter than `AppContext` — only the inbox UI components subscribe.

## Why three contexts (not one)

- **AppContext** changes whenever any domain entity changes → most subscribers re-render anyway.
- **ModalContext** changes on open/close → only `ModalManager` and the trigger button cares.
- **InboxContext** changes only during messaging → keeps message-typing perf isolated.

Splitting them means typing in the inbox doesn't cause every dashboard widget to re-render.

## When extracting

- Copying any single widget? You'll likely need to either:
  - (a) wrap it in your own `<AppProvider value={mockedData}>` for storybook-style use, **or**
  - (b) refactor it to take its data as props.
- The pattern itself (one big context for domain data + dedicated contexts for UI toggles) is portable — copy the structure even if you don't copy the contents.
