# `src/components/collaboration/` — Project collaboration widgets

Four widgets that compose into the `CollaborationView` (the client-side project workspace). Each is a panel within a project's collaboration dashboard.

## The four widgets

### `ProjectChat/`

Real-time-style chat panel for a project. Reads messages from `InboxContext` (filtered by project's channel) and renders message bubbles with sender avatars and timestamps. Has an input at the bottom.

Composer calls `sendMessage(channelId, text, senderId)` from `InboxContext`.

### `ProjectTimeline/`

Vertical timeline of project events: kickoff, design phase, dev phase, launch. Each milestone has status (complete / in-progress / upcoming) and a date. Visual treatment is gradient line + numbered nodes.

Currently driven by hardcoded sample data inside the component — connect to `Project.status` + activity logs for a production port.

### `DesignConcepts/`

Grid of design concept thumbnails for client review. Each concept card shows preview image, title, and "Approve" / "Request Changes" buttons.

Sample data is internal to the component. In a real version you'd source from a `DesignConcept` model that doesn't exist in the current types.

### `SyncCard/`

Compact "next sync meeting" card showing date, attendees, and "Join" button. Used as a sidebar element within CollaborationView.

## Where they're composed

`src/components/views/CollaborationView/CollaborationView.tsx` arranges all four widgets into the client workspace layout (chat in the main column, timeline + design concepts + sync card in side columns).

## Folder anatomy

Same as everywhere:

```
SomeCollab/
├── SomeCollab.tsx
├── ui.ts
└── index.ts
```

## ui.config.ts

```ts
export const collaborationUI = {
  ProjectChat: projectChatUI,
  ProjectTimeline: projectTimelineUI,
  DesignConcepts: designConceptsUI,
  SyncCard: syncCardUI,
};
```

## When extracting

- **`SyncCard`** is the lightest lift — pure presentation.
- **`ProjectTimeline`** is reusable as a generic milestone tracker if you swap the hardcoded events for a prop.
- **`ProjectChat`** depends on `InboxContext`. Either bring `InboxContext` along or refactor to accept `messages[]` and `onSend()` as props.
- **`DesignConcepts`** is mostly decorative — needs a real data model to be useful.
