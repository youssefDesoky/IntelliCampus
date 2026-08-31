import { useState, useEffect, useCallback, useRef, useMemo } from "react";
import { useOutletContext, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useTranslation } from 'react-i18next';
import { useError } from '../../../contexts/ErrorContext.jsx';
import { useDeviceType } from '../../../hooks';
import * as signalR from "@microsoft/signalr";
import { InboxMessageListSkeleton } from "./SkeletonLoader";
import { fetchInboxMessages, fetchSentMessages, deleteMessage, sendMessage } from "../../../api/messages";
import { EnvelopIcon, PaperPlaneIcon, TrashIcon, MessageSlashIcon, XIcon, PenSquareIcon } from "../../../components/ui/icons";
import InputItem from "../../../components/form/InputItem";
import BaseFormComponent from "../../../components/ui/BaseFormComponent";
import Button from "../../../components/ui/Button";
import TextArea from "../../../components/ui/TextArea";

const FILTERS = [
  { key: "all", labelKey: "inbox.filterAll", icon: EnvelopIcon },
  { key: "unread", labelKey: "inbox.filterUnread", icon: EnvelopIcon },
  { key: "sent", labelKey: "inbox.filterSent", icon: PaperPlaneIcon },
];

function ChevronIcon({ className = "" }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      width="16"
      height="16"
    >
      <polyline points="6 9 12 15 18 9" />
    </svg>
  );
}

function getInitials(name) {
  if (!name) return "?";
  const parts = name.trim().split(/\s+/);
  const first = parts[0]?.[0] || "";
  const last = parts.length > 1 ? parts[parts.length - 1][0] : "";
  return (first + last).toUpperCase();
}

function parseDate(raw) {
  if (!raw) return new Date(0);
  const t = new Date(raw).getTime();
  return Number.isNaN(t) ? new Date(0) : new Date(t);
}

function getThreadLatestTimestamp(thread) {
  const rootDate = parseDate(thread.sentAt);
  if (!thread.replies?.length) return rootDate;
  const replyDates = thread.replies.map((r) => parseDate(r.sentAt));
  return new Date(Math.max(rootDate.getTime(), ...replyDates.map((d) => d.getTime())));
}

function getEmptyStateMessage(filter, searchQuery, t) {
  if (searchQuery) return t('inbox.emptySearch');
  switch (filter) {
    case "unread":
      return t('inbox.emptyUnread');
    case "sent":
      return t('inbox.emptySent');
    default:
      return t('inbox.emptyAll');
  }
}

function getMessageDirection(msg, currentUserId) {
  return msg.senderId === currentUserId ? "sent" : "received";
}

function decorateThread(thread, currentUserId) {
  return {
    ...thread,
    direction: getMessageDirection(thread, currentUserId),
    replies: (thread.replies || []).map((r) => ({
      ...r,
      direction: getMessageDirection(r, currentUserId),
    })),
  };
}

function MessageRow({ thread, currentUserId, onDelete }) {
  const navigate = useNavigate();
  const { t } = useTranslation('common');
  const isSent = thread.direction === "sent";
  const personName = isSent
    ? thread.recipientName || t('message.unknownRecipient')
    : thread.senderName || t('message.unknownSender');
  const avatarUrl = thread.senderAvatar || thread.senderImage || null;
  const initials = getInitials(personName);
  const replyCount = thread.replies?.length || 0;
  const hasUnreadReplies = (thread.replies || []).some(
    (r) => r.recipientId === currentUserId && !r.isRead
  );
  const isUnread = (thread.recipientId === currentUserId && !thread.isRead) || hasUnreadReplies;

  return (
    <div
      className={`overflow-hidden rounded-xl border ${
        isSent
          ? "border-border-accent-default-light dark:border-border-accent-default-dark"
          : "border-border-primary-default-light dark:border-border-primary-default-dark"
      } ${
        isUnread
          ? "bg-bg-fill-secondary-default-light dark:bg-bg-fill-secondary-default-dark"
          : "bg-bg-surface-primary-default-light dark:bg-bg-surface-primary-default-dark"
      }`}
    >
      <div
        role="button"
        tabIndex={0}
        onClick={() => navigate(`/inbox/${thread.messageId}`, { state: { thread } })}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            navigate(`/inbox/${thread.messageId}`, { state: { thread } });
          }
        }}
        className="flex items-start gap-3 px-4 py-3 cursor-pointer hover:bg-bg-fill-primary-hover-light dark:hover:bg-bg-fill-primary-hover-dark transition-colors"
      >
        <div className="shrink-0 w-10 h-10 rounded-full overflow-hidden flex items-center justify-center text-xs font-semibold bg-bg-fill-secondary-default-light dark:bg-bg-fill-secondary-default-dark">
          {isSent ? (
            <PaperPlaneIcon className="w-4 h-4 text-text-secondary-active-light dark:text-text-secondary-active-dark" />
          ) : avatarUrl ? (
            <img src={avatarUrl} alt={personName} className="w-full h-full object-cover" />
          ) : (
            <span className="text-text-blue-default-light dark:text-text-blue-default-dark">{initials}</span>
          )}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 min-w-0">
              <span
                className={`text-sm truncate ${
                  isUnread
                    ? "font-semibold text-text-primary-active-light dark:text-text-primary-active-dark"
                    : "font-medium text-text-secondary-active-light dark:text-text-secondary-active-dark"
                }`}
              >
                {personName} <span className={`shrink-0 text-[10px] font-semibold px-2 py-0.5 rounded-full ${isSent ? "bg-bg-fill-accent-default-light dark:bg-bg-fill-accent-default-dark text-text-accent-active-light dark:text-text-accent-active-dark" : "bg-bg-fill-secondary-default-light dark:bg-bg-fill-secondary-default-dark text-text-secondary-active-light dark:text-text-secondary-active-dark"}`}>{isSent ? t('message.sent') : t('message.received')}</span>
              </span>
              {replyCount > 0 && (
                <span className="shrink-0 text-[10px] font-medium px-1.5 py-0.5 rounded-full bg-bg-fill-secondary-default-light dark:bg-bg-fill-secondary-default-dark text-text-secondary-active-light dark:text-text-secondary-active-dark">
                  {t('message.replyCount', { count: replyCount })}
                </span>
              )}
            </div>
            <span className="shrink-0 text-xs text-text-secondary-default-light dark:text-text-secondary-default-dark">
              {thread.sentAt || ""}
            </span>
          </div>

          <p
            className={`text-sm mt-0.5 truncate ${
              isUnread
                ? "font-semibold text-text-primary-active-light dark:text-text-primary-active-dark"
                : "text-text-secondary-active-light dark:text-text-secondary-active-dark"
            }`}
          >
            {thread.subject || t('message.noSubject')}
          </p>

          <p className="text-xs text-text-secondary-default-light dark:text-text-secondary-default-dark truncate mt-0.5">
            {thread.preview || thread.body || ""}
          </p>
        </div>

        <div className="flex items-center gap-1 shrink-0">
          <button
            onClick={(e) => { e.stopPropagation(); onDelete(e, thread); }}
            className="p-1 rounded hover:bg-bg-fill-primary-hover-light dark:hover:bg-bg-fill-primary-hover-dark text-text-secondary-default-light dark:text-text-secondary-default-dark hover:text-red-500"
            aria-label={t('message.deleteAriaLabel')}
          >
            <TrashIcon className="w-3.5 h-3.5" />
          </button>
          <ChevronIcon className="text-text-secondary-default-light dark:text-text-secondary-default-dark" />
        </div>
      </div>
    </div>
  );
}

export default function Inbox() {
  const { t } = useTranslation('common');
  const navigate = useNavigate();
  const outletContext = useOutletContext() || {};
  const user = outletContext.user;
  const currentUserId = user?.userId ?? null;
  const currentUserEmail = user?.email ?? "";
  const { showError } = useError();
  const { isPhone } = useDeviceType();
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState("all");
  const [showCompose, setShowCompose] = useState(false);
  const [recipientEmail, setRecipientEmail] = useState("");
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [sending, setSending] = useState(false);
  const connectionRef = useRef(null);

  const inboxQueryKey = useMemo(() => ["inbox", currentUserId], [currentUserId]);

  const { data: threads = [], isLoading } = useQuery({
    queryKey: inboxQueryKey,
    queryFn: async () => {
      const [inboxData, sentData] = await Promise.all([
        fetchInboxMessages(),
        fetchSentMessages(),
      ]);
      const inbox = (Array.isArray(inboxData) ? inboxData : []).map((t) =>
        decorateThread(t, currentUserId)
      );
      const sent = (Array.isArray(sentData) ? sentData : []).map((t) =>
        decorateThread(t, currentUserId)
      );
      const merged = mergeThreads(inbox, sent);
      merged.sort((a, b) => getThreadLatestTimestamp(b).getTime() - getThreadLatestTimestamp(a).getTime());
      return merged;
    },
    staleTime: 0,
    gcTime: 10 * 60 * 1000,
    enabled: !!currentUserId,
  });

  const resetCompose = () => {
    setRecipientEmail("");
    setSubject("");
    setBody("");
    setSending(false);
    setShowCompose(false);
  };

  const sendMutation = useMutation({
    mutationFn: sendMessage,
    onSuccess: () => {
      resetCompose();
      queryClient.invalidateQueries({ queryKey: inboxQueryKey });
    },
    onError: (err) => showError(err.message || t('inbox.sendFailed')),
  });

  const handleSend = (e) => {
    e.preventDefault();
    if (!recipientEmail.trim()) {
      showError(t('inbox.missingRecipient'));
      return;
    }
    if (recipientEmail.trim().toLowerCase() === currentUserEmail.toLowerCase()) {
      showError(t('inbox.selfMessage'));
      return;
    }
    if (!subject.trim()) {
      showError(t('inbox.missingSubject'));
      return;
    }
    if (!body.trim()) {
      showError(t('inbox.missingBody'));
      return;
    }
    setSending(true);
    sendMutation.mutate({
      recipientEmail: recipientEmail.trim(),
      subject: subject.trim(),
      body: body.trim(),
      parentMessageId: undefined,
    }, {
      onSettled: () => setSending(false),
    });
  };

  const mergeThreads = useCallback((inboxThreads, sentThreads) => {
    const map = new Map();
    for (const t of inboxThreads) {
      map.set(t.messageId, t);
    }
    for (const t of sentThreads) {
      if (map.has(t.messageId)) {
        const existing = map.get(t.messageId);
        const existingReplyIds = new Set(existing.replies.map((r) => r.messageId));
        for (const r of t.replies) {
          if (!existingReplyIds.has(r.messageId)) {
            existing.replies.push(r);
            existingReplyIds.add(r.messageId);
          }
        }
        // Re-sort replies
        existing.replies.sort((a, b) => parseDate(a.sentAt).getTime() - parseDate(b.sentAt).getTime());
      } else {
        map.set(t.messageId, t);
      }
    }
    return Array.from(map.values());
  }, []);

  useEffect(() => {
    const conn = new signalR.HubConnectionBuilder()
      .withUrl("/hubs/inbox", { withCredentials: true })
      .withAutomaticReconnect()
      .configureLogging(signalR.LogLevel.Information)
      .build();

    conn.on("NewMessage", (dto) => {
      queryClient.setQueryData(inboxQueryKey, (prev = []) => {
        const direction = getMessageDirection(dto, currentUserId);
        const newMsg = { ...dto, direction };

        if (dto.parentMessageId) {
          const idx = prev.findIndex((t) => t.messageId === dto.parentMessageId);
          if (idx !== -1) {
            const updated = [...prev];
            const thread = { ...updated[idx] };
            const replies = [...(thread.replies || [])];
            if (!replies.some((r) => r.messageId === dto.messageId)) {
              replies.push(newMsg);
              replies.sort((a, b) => parseDate(a.sentAt).getTime() - parseDate(b.sentAt).getTime());
            }
            thread.replies = replies;
            updated[idx] = thread;
            updated.sort((a, b) => getThreadLatestTimestamp(b).getTime() - getThreadLatestTimestamp(a).getTime());
            return updated;
          }
          return [newMsg, ...prev];
        }

        if (prev.some((t) => t.messageId === dto.messageId)) return prev;
        const decorated = decorateThread(dto, currentUserId);
        return [decorated, ...prev];
      });
    });

    conn.onreconnecting((error) => {
      console.warn("[InboxHub] Reconnecting...", error);
    });

    conn.onreconnected(async () => {
      console.info("[InboxHub] Reconnected.");
      queryClient.invalidateQueries({ queryKey: inboxQueryKey });
    });

    conn.onclose((error) => {
      console.error("[InboxHub] Connection closed.", error);
    });

    let disposed = false;
    conn
      .start()
      .then(() => {
        if (disposed) conn.stop();
      })
      .catch((err) => {
        if (disposed) return;
        console.error("[InboxHub] Connection failed:", err);
      });

    connectionRef.current = conn;

    return () => {
      disposed = true;
      if (
        conn.state === signalR.HubConnectionState.Connected ||
        conn.state === signalR.HubConnectionState.Reconnecting
      ) {
        conn.stop();
      }
    };
  }, [currentUserId, inboxQueryKey, queryClient]);

  const deleteMutation = useMutation({
    mutationFn: deleteMessage,
    onSuccess: (_data, messageId) => {
      queryClient.setQueryData(inboxQueryKey, (prev = []) => {
        const isRootReply = prev.some((t) =>
          (t.replies || []).some((r) => r.messageId === messageId)
        );
        if (isRootReply) {
          return prev.map((t) => ({
            ...t,
            replies: (t.replies || []).filter((r) => r.messageId !== messageId),
          }));
        }
        return prev.filter((t) => t.messageId !== messageId);
      });
      const key = `thread-${messageId}`;
      if (expandedKey === key) setExpandedKey(null);
    },
    onError: (err) => showError(err.message),
  });

  const handleDelete = (e, msg) => {
    e.stopPropagation();
    deleteMutation.mutate(msg.messageId);
  };

  const unreadCount = threads.reduce(
    (count, t) =>
      count +
      (t.recipientId === currentUserId && !t.isRead ? 1 : 0) +
      (t.replies || []).filter((r) => r.recipientId === currentUserId && !r.isRead).length,
    0
  );

  const filteredThreads = threads.filter((thread) => {
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      const searchInMessage = (m) =>
        (m.subject || "").toLowerCase().includes(q) ||
        (m.senderName || "").toLowerCase().includes(q) ||
        (m.recipientName || "").toLowerCase().includes(q) ||
        (m.body || "").toLowerCase().includes(q);
      if (searchInMessage(thread)) return true;
      if (thread.replies?.some(searchInMessage)) return true;
      return false;
    }
    switch (activeFilter) {
      case "unread": {
        const hasUnreadRoot = thread.recipientId === currentUserId && !thread.isRead;
        const hasUnreadReply = thread.replies?.some((r) => r.recipientId === currentUserId && !r.isRead);
        return hasUnreadRoot || hasUnreadReply;
      }
      case "sent": {
        const hasSentRoot = thread.senderId === currentUserId;
        const hasSentReply = thread.replies?.some((r) => r.senderId === currentUserId);
        return hasSentRoot || hasSentReply;
      }
      default:
        return true;
    }
  });

  return (
    <div className="flex flex-col h-[calc(100vh-14rem)] md:h-[calc(100vh-10rem)]">
      <div className="flex flex-col gap-3 mb-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <EnvelopIcon className="w-6 h-6 text-text-blue-default-light dark:text-text-blue-default-dark" />
            <h1 className="text-2xl font-bold text-text-primary-active-light dark:text-text-primary-active-dark">
              {t('inbox.title')}
            </h1>
            {unreadCount > 0 && (
              <span className="text-sm text-text-secondary-default-light dark:text-text-secondary-default-dark">
                {t('inbox.unreadCount', { count: unreadCount })}
              </span>
            )}
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            <button
              onClick={() => { setRecipientEmail(""); setSubject(""); setBody(""); setShowCompose(true); }}
              className={`flex items-center justify-center gap-2 text-sm font-medium rounded-lg bg-bg-fill-accent-default-light dark:bg-bg-fill-accent-default-dark text-text-accent-active-light dark:text-text-accent-active-dark hover:opacity-90 transition-opacity ${isPhone ? "p-2" : "px-4 py-2"}`}
            >
              <PenSquareIcon className="w-4 h-4" />
              {!isPhone && t('inbox.sendEmail')}
            </button>

            <div className="relative flex-1 sm:flex-none sm:w-64">
              <input
                type="text"
                placeholder={t('inbox.searchPlaceholder')}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-3 py-2 pe-8 text-sm rounded-lg border border-border-primary-default-light dark:border-border-primary-default-dark bg-bg-surface-primary-default-light dark:bg-bg-surface-primary-default-dark text-text-primary-active-light dark:text-text-primary-active-dark outline-none focus:border-text-blue-default-light dark:focus:border-text-blue-default-dark"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute end-2 top-1/2 -translate-y-1/2"
                  aria-label={t('clearSearch')}
                >
                  <XIcon className="w-4 h-4 text-text-secondary-default-light dark:text-text-secondary-default-dark" />
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2 mb-4 overflow-x-auto pb-1 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
        {FILTERS.map(({ key, labelKey, icon: Icon }) => {
          const count = key === "unread" ? unreadCount : 0;
          const isActive = activeFilter === key;
          return (
            <button
              key={key}
              onClick={() => setActiveFilter(key)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-colors shrink-0 ${
                isActive
                    ? "bg-bg-fill-accent-default-light dark:bg-bg-fill-accent-default-dark text-white"
                    : "text-text-secondary-active-light dark:text-text-secondary-active-dark bg-bg-fill-primary-default-light dark:bg-bg-fill-primary-default-dark hover:bg-bg-fill-primary-hover-light dark:hover:bg-bg-fill-primary-hover-dark"
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              {t(labelKey)}
              {count > 0 && (
                  <span
                    className={`text-xs px-1.5 rounded-full ${
                      isActive
                        ? "bg-white/20"
                        : "bg-bg-fill-accent-default-light dark:bg-bg-fill-accent-default-dark text-white"
                    }`}
                  >
                  {count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      <div className="flex-1 overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
        {isLoading ? (
          <InboxMessageListSkeleton />
        ) : filteredThreads.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-text-secondary-default-light dark:text-text-secondary-default-dark gap-2">
            <MessageSlashIcon className="w-12 h-12 opacity-40" />
            <p className="text-sm">{getEmptyStateMessage(activeFilter, searchQuery, t)}</p>
          </div>
        ) : (
          <div className="flex flex-col gap-2 pb-2">
            {filteredThreads.map((thread) => (
              <MessageRow
                key={`thread-${thread.messageId}`}
                thread={thread}
                currentUserId={currentUserId}
                onDelete={handleDelete}
              />
            ))}
          </div>
        )}
      </div>

      {showCompose && isPhone ? (
        <div className="fixed inset-0 z-50 flex flex-col bg-bg-surface-primary-default-light dark:bg-bg-surface-primary-default-dark">
          <div className="flex items-center justify-between px-4 py-3 border-b border-border-primary-default-light dark:border-border-primary-default-dark">
            <h3 className="text-lg font-semibold text-text-primary-active-light dark:text-text-primary-active-dark">
              {t('inbox.newMessage')}
            </h3>
            <button
              type="button"
              onClick={resetCompose}
              className="p-1.5 rounded-lg hover:bg-bg-fill-primary-hover-light dark:hover:bg-bg-fill-primary-hover-dark"
              aria-label={t('close')}
            >
              <XIcon className="w-5 h-5 text-text-secondary-default-light dark:text-text-secondary-default-dark" />
            </button>
          </div>
          <form onSubmit={handleSend} className="flex-1 flex flex-col p-4 gap-4 overflow-y-auto">
            <InputItem
              label={t('compose.recipientEmail')}
              type="email"
              name="recipientEmail"
              placeholder={t('compose.recipientPlaceholder')}
              value={recipientEmail}
              onChange={(e) => setRecipientEmail(e.target.value)}
            />
            <InputItem
              label={t('compose.subject')}
              type="text"
              name="subject"
              placeholder={t('compose.subjectPlaceholder')}
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
            />
            <div className="flex-1 flex flex-col">
              <label className="block text-sm font-medium text-text-secondary-active-light dark:text-text-secondary-active-dark mb-1">
                {t('compose.message')}
              </label>
              <TextArea
                minHeight={120}
                maxHeight={250}
                placeholder={t('compose.messagePlaceholder')}
                value={body}
                onChange={(e) => setBody(e.target.value)}
                className="flex-1 w-full px-3 py-2 text-sm rounded-lg border border-border-primary-default-light dark:border-border-primary-default-dark bg-bg-surface-primary-default-light dark:bg-bg-surface-primary-default-dark text-text-primary-active-light dark:text-text-primary-active-dark outline-none focus:border-text-blue-default-light dark:focus:border-text-blue-default-dark"
              />
            </div>
            <div className="flex gap-3">
              <Button variant="secondary" type="button" onClick={resetCompose} width="flex-1">
                {t('cancel')}
              </Button>
              <Button
                variant="primary"
                type="submit"
                width="flex-1"
                disabled={sending || !recipientEmail.trim() || !subject.trim() || !body.trim()}
                loading={sending}
              >
                {t('compose.send')}
              </Button>
            </div>
          </form>
        </div>
      ) : (
        <BaseFormComponent
          isOpen={showCompose}
          title={t('inbox.newMessage')}
          onClose={resetCompose}
          onSubmit={handleSend}
          submitText={sending ? t('compose.sending') : t('compose.send')}
          submitDisabled={sending || !recipientEmail.trim() || !subject.trim() || !body.trim()}
          submitLoading={sending}
          maxWidth="max-w-xl"
        >
          <div className="flex flex-col gap-4">
            <InputItem
              label={t('compose.recipientEmail')}
              type="email"
              name="recipientEmail"
              placeholder={t('compose.recipientPlaceholder')}
              value={recipientEmail}
              onChange={(e) => setRecipientEmail(e.target.value)}
            />

            <InputItem
              label={t('compose.subject')}
              type="text"
              name="subject"
              placeholder={t('compose.subjectPlaceholder')}
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
            />

            <div>
              <label className="block text-sm font-medium text-text-secondary-active-light dark:text-text-secondary-active-dark mb-1">
                {t('compose.message')}
              </label>
              <TextArea
                minHeight={120}
                maxHeight={250}
                placeholder={t('compose.messagePlaceholder')}
                value={body}
                onChange={(e) => setBody(e.target.value)}
                className="w-full px-3 py-2 text-sm rounded-lg border border-border-primary-default-light dark:border-border-primary-default-dark bg-bg-surface-primary-default-light dark:bg-bg-surface-primary-default-dark text-text-primary-active-light dark:text-text-primary-active-dark outline-none focus:border-text-blue-default-light dark:focus:border-text-blue-default-dark"
              />
            </div>
          </div>
        </BaseFormComponent>
      )}
    </div>
  );
}
