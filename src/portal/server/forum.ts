// Forum runtime — backs the Forum / community plugin.
//
// Categories → topics → replies. Voting on topics + replies.
// Mention notifications fan out via the Email plugin.

import "server-only";
import { getState, mutate } from "./storage";
import { emit } from "./eventBus";

export interface ForumCategory {
  id: string;
  orgId: string;
  name: string;
  slug: string;
  description?: string;
  order: number;
  membersOnly: boolean;
  createdAt: number;
}

export interface ForumTopic {
  id: string;
  orgId: string;
  categoryId: string;
  title: string;
  slug: string;
  body: string;
  authorEmail: string;
  authorName?: string;
  upvotes: number;
  downvotes: number;
  pinned: boolean;
  locked: boolean;
  status: "open" | "flagged" | "removed";
  replyCount: number;
  lastReplyAt?: number;
  createdAt: number;
}

export interface ForumReply {
  id: string;
  orgId: string;
  topicId: string;
  body: string;
  authorEmail: string;
  authorName?: string;
  upvotes: number;
  downvotes: number;
  status: "ok" | "flagged" | "removed";
  createdAt: number;
}

interface ForumState {
  forumCategories?: ForumCategory[];
  forumTopics?: ForumTopic[];
  forumReplies?: ForumReply[];
}

function makeId(prefix: string): string {
  return `${prefix}_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 6)}`;
}

function slugify(s: string): string {
  return s.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "untitled";
}

// ─── Categories ────────────────────────────────────────────────────────────

export function listForumCategories(orgId: string): ForumCategory[] {
  const s = getState() as unknown as ForumState;
  return (s.forumCategories ?? [])
    .filter(c => c.orgId === orgId)
    .sort((a, b) => a.order - b.order);
}

export function createForumCategory(orgId: string, name: string, opts?: { membersOnly?: boolean; description?: string }): ForumCategory {
  const c: ForumCategory = {
    id: makeId("fc"),
    orgId,
    name,
    slug: slugify(name),
    description: opts?.description,
    order: listForumCategories(orgId).length,
    membersOnly: opts?.membersOnly ?? false,
    createdAt: Date.now(),
  };
  mutate(state => {
    const s = state as unknown as ForumState;
    if (!s.forumCategories) s.forumCategories = [];
    s.forumCategories.push(c);
  });
  return c;
}

// ─── Topics ────────────────────────────────────────────────────────────────

export function listTopics(orgId: string, categoryId?: string): ForumTopic[] {
  const s = getState() as unknown as ForumState;
  return (s.forumTopics ?? [])
    .filter(t => t.orgId === orgId && (!categoryId || t.categoryId === categoryId) && t.status !== "removed")
    .sort((a, b) => {
      if (a.pinned !== b.pinned) return a.pinned ? -1 : 1;
      return (b.lastReplyAt ?? b.createdAt) - (a.lastReplyAt ?? a.createdAt);
    });
}

export interface CreateTopicInput {
  orgId: string;
  categoryId: string;
  title: string;
  body: string;
  authorEmail: string;
  authorName?: string;
}

export function createTopic(input: CreateTopicInput): ForumTopic {
  const t: ForumTopic = {
    id: makeId("ft"),
    orgId: input.orgId,
    categoryId: input.categoryId,
    title: input.title,
    slug: slugify(input.title),
    body: input.body,
    authorEmail: input.authorEmail.trim().toLowerCase(),
    authorName: input.authorName,
    upvotes: 0,
    downvotes: 0,
    pinned: false,
    locked: false,
    status: "open",
    replyCount: 0,
    createdAt: Date.now(),
  };
  mutate(state => {
    const s = state as unknown as ForumState;
    if (!s.forumTopics) s.forumTopics = [];
    s.forumTopics.push(t);
  });
  return t;
}

// ─── Replies ───────────────────────────────────────────────────────────────

export function listReplies(orgId: string, topicId: string): ForumReply[] {
  const s = getState() as unknown as ForumState;
  return (s.forumReplies ?? [])
    .filter(r => r.orgId === orgId && r.topicId === topicId && r.status !== "removed")
    .sort((a, b) => a.createdAt - b.createdAt);
}

export interface CreateReplyInput {
  orgId: string;
  topicId: string;
  body: string;
  authorEmail: string;
  authorName?: string;
}

export function createReply(input: CreateReplyInput): ForumReply {
  const r: ForumReply = {
    id: makeId("fr"),
    orgId: input.orgId,
    topicId: input.topicId,
    body: input.body,
    authorEmail: input.authorEmail.trim().toLowerCase(),
    authorName: input.authorName,
    upvotes: 0,
    downvotes: 0,
    status: "ok",
    createdAt: Date.now(),
  };
  mutate(state => {
    const s = state as unknown as ForumState;
    if (!s.forumReplies) s.forumReplies = [];
    s.forumReplies.push(r);
    // Bump topic's replyCount + lastReplyAt.
    const t = (s.forumTopics ?? []).find(x => x.orgId === input.orgId && x.id === input.topicId);
    if (t) {
      t.replyCount++;
      t.lastReplyAt = Date.now();
    }
  });

  // @mention extraction → emit a mention event the Automation /
  // Email plugins can react to.
  const mentions = Array.from(input.body.matchAll(/@([a-zA-Z0-9_.-]+)/g)).map(m => m[1]);
  if (mentions.length > 0) {
    emit(input.orgId, "form.submitted", {
      formName: "forum-mention",
      fields: {
        mentions: mentions.join(","),
        topicId: input.topicId,
        author: input.authorEmail,
      },
    });
  }

  return r;
}
