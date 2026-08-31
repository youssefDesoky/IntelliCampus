import { useEffect, useState, useRef, useCallback } from "react";
import { useTranslation } from 'react-i18next';
import Section from "../../../components/ui/Section";
import Dialog from "../../../components/ui/Dialog";
import ChatUsers from "./ChatUsers";
import Messaging from "./Messaging";
import DefaultChatPanel from "./DefaultChatPanel";
import AddFriendPanel from "./AddFriendPanel";
import CreateGroupPanel from "./CreateGroupPanel";
import { useSidebar } from "../../../hooks";
import * as signalR from "@microsoft/signalr";
import {
  createHubConnection,
  fetchChatHistory,
  fetchGroupChatHistory,
  toDateKey,
  formatTime,
  sendFriendRequest,
  acceptFriendRequest,
  declineFriendRequest,
  fetchPendingRequests,
  fetchFriends,
  createGroup,
  fetchMyGroups,
} from "../services/chatService";
import { useError } from '../../../contexts/ErrorContext.jsx';

export default function Chat({ isChatOpen, setIsChatOpen, currentUser }) {
  const { t } = useTranslation('chat');
  const { showError } = useError();
  const { isPhone } = useSidebar();
  // "default" | "messaging" | "addFriend" | "createGroup"
  const [activePanel, setActivePanel] = useState("default");
  const [friendId, setFriendId] = useState("");
  const [friendRequests, setFriendRequests] = useState([]);
  const [friends, setFriends] = useState([]);
  const [groups, setGroups] = useState([]);
  const [messages, setMessages] = useState([]);
  const [chatPartner, setChatPartner] = useState(null);
  const [onlineUsers, setOnlineUsers] = useState(new Set());
  const [unreadCounts, setUnreadCounts] = useState({});
  const [isAlreadyTyping, setIsAlreadyTyping] = useState(false);
  const [partnerTyping, setPartnerTyping] = useState(false);
  const [pinnedMessage, setPinnedMessage] = useState(null);
  const [pendingPinMessageId, setPendingPinMessageId] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchMembers, setSearchMembers] = useState("");
  const connectionRef = useRef(null);
  const chatPartnerRef = useRef(null);
  const msgIdsRef = useRef(new Set());
  const typingTimeoutRef = useRef(null);
  const pinnedMessageRef = useRef(null);

  // Keep refs in sync with state so SignalR handlers always have latest value
  useEffect(() => { chatPartnerRef.current = chatPartner; }, [chatPartner]);
  useEffect(() => { pinnedMessageRef.current = pinnedMessage; }, [pinnedMessage]);

  // Fetch friends and pending requests
  useEffect(() => {
    if (!currentUser) return;

    const loadFriends = async () => {
      try {
        const data = await fetchFriends();
        setFriends(data);
      } catch {
        // not critical
      }
    };

    const loadRequests = async () => {
      try {
        const data = await fetchPendingRequests();
        setFriendRequests(
          data.map((r) => ({
            id: r.friendRequestId,
            senderId: r.senderId,
            name: r.senderName,
            avatar: r.senderProfileImage,
            recipientId: r.recipientId,
            recipientName: r.recipientName,
          }))
        );
      } catch {
        // not critical
      }
    };

    const loadGroups = async () => {
      try {
        const data = await fetchMyGroups();
        setGroups(data);
      } catch {
        // not critical
      }
    };

    loadFriends();
    loadRequests();
    loadGroups();
  }, [currentUser]);

  // SignalR connection — always active when chat is open
  useEffect(() => {
    if (!isChatOpen || !currentUser) return;

    const conn = createHubConnection();

    conn.on("ReceivePrivateMessage", (msg) => {
      const senderId = String(msg.senderId);
      const isOwn = senderId === String(currentUser.userId);
      const partner = chatPartnerRef.current;

      if (!isOwn) {
        if (!partner || partner.type === "group" || senderId !== String(partner.userId)) {
          setUnreadCounts((prev) => ({ ...prev, [senderId]: (prev[senderId] || 0) + 1 }));
          return;
        }
      }

      if (!partner || partner.type === "group") return;

      setPartnerTyping(false);
      msgIdsRef.current.add(msg.messageId);
      setMessages((prev) => {
        const exists = prev.some((m) => m.messageId === msg.messageId);
        return exists ? prev : [...prev, msg];
      });
    });

    conn.on("ReceiveGroupMessage", (msg) => {
      const partner = chatPartnerRef.current;
      if (!partner || partner.type !== "group" || partner.groupName !== msg.groupName) return;

      msgIdsRef.current.add(msg.messageId);
      setMessages((prev) => {
        const exists = prev.some((m) => m.messageId === msg.messageId);
        return exists ? prev : [...prev, msg];
      });
    });

    conn.on("UserOnline", (userId) => {
      setOnlineUsers(prev => new Set(prev).add(String(userId)));
    });

    conn.on("UserOffline", (userId) => {
      setOnlineUsers(prev => {
        const next = new Set(prev);
        next.delete(String(userId));
        return next;
      });
    });

    conn.on("ReceiveTypingStatus", (senderId, isTyping) => {
      const partner = chatPartnerRef.current;
      if (partner && String(senderId) === String(partner.userId)) {
        setPartnerTyping(isTyping);
      }
    });

    conn.on("MessageDeleted", (messageId) => {
      setMessages((prev) => prev.filter((m) => m.messageId !== messageId));
    });

    conn.on("MessageEdited", (messageId, newContent, isEdited) => {
      setMessages((prev) =>
        prev.map((m) => (m.messageId === messageId ? { ...m, content: newContent, isEdited: isEdited ?? true } : m))
      );
    });

    conn.on("MessagePinned", (messageId, content) => {
      setPinnedMessage(content);
      setMessages((prev) =>
        prev.map((m) => ({ ...m, isPinned: m.messageId === messageId }))
      );
    });

    conn.on("MessageUnpinned", (messageId) => {
      setPinnedMessage(null);
      setMessages((prev) =>
        prev.map((m) => (m.messageId === messageId ? { ...m, isPinned: false } : m))
      );
    });

    conn.onreconnecting((error) => {
      console.warn("[ChatHub] Reconnecting...", error);
    });

    conn.onreconnected(async () => {
      console.info("[ChatHub] Reconnected.");
      const partner = chatPartnerRef.current;
      if (partner) {
        if (partner.type === "group") {
          await conn.invoke("JoinGroup", partner.groupName);
        }
        await loadHistory(conn, partner);
      }
    });

    conn.onclose((error) => {
      console.error("[ChatHub] Connection closed.", error);
    });

    let disposed = false;
    conn
      .start()
      .then(() => {
        if (disposed) conn.stop();
      })
      .catch((err) => {
        if (disposed) return;
        console.error("[ChatHub] Connection failed:", err);
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
      if (connectionRef.current === conn) connectionRef.current = null;
    };
  }, [isChatOpen, currentUser]);

  // Load history & join group when partner changes
  useEffect(() => {
    const conn = connectionRef.current;
    if (!chatPartner || !conn) return;

    const load = async () => {
      if (chatPartner.type === "group") {
        await conn.invoke("JoinGroup", chatPartner.groupName);
      }
      await loadHistory(conn, chatPartner);
    };
    load();

    // Leave previous group on cleanup (track via ref)
    return () => {
      if (chatPartner.type === "group") {
        conn.invoke("LeaveGroup", chatPartner.groupName).catch(() => {});
      }
    };
  }, [chatPartner]);

  useEffect(() => {
    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    };
  }, []);

  const loadHistory = useCallback(async (conn, partner) => {
    try {
      const history = partner.type === "group"
        ? await fetchGroupChatHistory(partner.groupName)
        : await fetchChatHistory(currentUser.userId, partner.userId);
      setMessages(history.reverse());
      const pinned = history.find(m => m.isPinned);
      setPinnedMessage(pinned ? pinned.content : null);
      history.forEach((m) => msgIdsRef.current.add(m.messageId));
    } catch {
      // no history yet
    }
  }, [currentUser]);

  const handleInputChange = useCallback(() => {
    const conn = connectionRef.current;
    if (!conn || !chatPartner || chatPartner.type === "group") return;

    if (!isAlreadyTyping) {
      conn.invoke("BroadcastTypingStatus", chatPartner.userId, true);
      setIsAlreadyTyping(true);
    }

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    typingTimeoutRef.current = setTimeout(() => {
      conn.invoke("BroadcastTypingStatus", chatPartner.userId, false);
      setIsAlreadyTyping(false);
    }, 2000);
  }, [chatPartner, isAlreadyTyping]);

  const sendMessage = useCallback(
    async (content) => {
      const conn = connectionRef.current;
      if (!conn || !chatPartner) return;

      try {
        if (chatPartner.type === "group") {
          await conn.invoke("SendGroupMessage", chatPartner.groupName, content);
        } else {
          await conn.invoke("SendPrivateMessage", chatPartner.userId, content);
        }
      } catch (err) {
        showError(err.message);
      }
    },
    [chatPartner]
  );

  const deleteMessage = useCallback(async (messageId) => {
    const conn = connectionRef.current;
    if (!conn) return;
    try {
      await conn.invoke("DeleteMessage", String(messageId));
    } catch (err) {
      showError(err.message);
    }
  }, []);

  const editMessage = useCallback(async (messageId, newContent) => {
    const conn = connectionRef.current;
    if (!conn) return;
    try {
      await conn.invoke("EditMessage", String(messageId), newContent);
    } catch (err) {
      showError(err.message);
    }
  }, []);

  const pinMessage = useCallback(async (messageId) => {
    if (pinnedMessageRef.current) {
      setPendingPinMessageId(messageId);
      return;
    }
    const conn = connectionRef.current;
    if (!conn) return;
    try {
      await conn.invoke("PinMessage", String(messageId));
    } catch (err) {
      showError(err.message);
    }
  }, []);

  const handleConfirmPin = useCallback(async () => {
    const messageId = pendingPinMessageId;
    setPendingPinMessageId(null);
    if (!messageId) return;
    const conn = connectionRef.current;
    if (!conn) return;
    try {
      await conn.invoke("PinMessage", String(messageId));
    } catch (err) {
      showError(err.message);
    }
  }, [pendingPinMessageId]);

  const handleCancelPin = useCallback(() => {
    setPendingPinMessageId(null);
  }, []);

  const unpinMessage = useCallback(async (messageId) => {
    const conn = connectionRef.current;
    if (!conn) return;
    try {
      await conn.invoke("UnpinMessage", String(messageId));
    } catch (err) {
      showError(err.message);
    }
  }, []);

  const formattedMessages = {};
  const q = searchQuery.toLowerCase().trim();
  for (const msg of messages) {
    if (q && !msg.content?.toLowerCase().includes(q)) continue;
    const key = toDateKey(msg.timestamp);
    const isOwn = currentUser
      ? String(msg.senderId) === String(currentUser.userId)
      : false;
    if (!formattedMessages[key]) formattedMessages[key] = [];
    formattedMessages[key].push({
      id: msg.messageId,
      sender: {
        name:
          msg.senderName ||
          (isOwn
            ? currentUser?.fullName
            : chatPartner?.fullName || "Unknown"),
        avatar: isOwn ? (currentUser?.avatar || null) : (chatPartner?.avatar || null),
        isOwnMessage: isOwn,
      },
      message: msg.content,
      sendTime: formatTime(msg.timestamp),
      isEdited: msg.isEdited,
      isPinned: msg.isPinned,
    });
  }

  const friendsList = friends.map((f) => ({
    id: f.userId,
    name: f.fullName,
  }));

  const handleSendInvite = async () => {
    if (!friendId.trim()) return;
    try {
      await sendFriendRequest(Number(friendId));
      setFriendId("");
      const data = await fetchPendingRequests();
      setFriendRequests(
        data.map((r) => ({
          id: r.friendRequestId,
          senderId: r.senderId,
          name: r.senderName,
          avatar: r.senderProfileImage,
          recipientId: r.recipientId,
          recipientName: r.recipientName,
        }))
      );
    } catch (err) {
      showError(err.message);
    }
  };

  const handleAcceptRequest = async (requestId) => {
    try {
      await acceptFriendRequest(requestId);
      setFriendRequests((reqs) => reqs.filter((r) => r.id !== requestId));
      const data = await fetchFriends();
      setFriends(data);
    } catch (err) {
      showError(err.message);
    }
  };

  const handleDeclineRequest = async (requestId) => {
    try {
      await declineFriendRequest(requestId);
      setFriendRequests((reqs) => reqs.filter((r) => r.id !== requestId));
    } catch (err) {
      showError(err.message);
    }
  };

  const handleCreateGroup = async ({ title, description, members, profileImage }) => {
    try {
      await createGroup(title, description, members, profileImage);
      const data = await fetchMyGroups();
      setGroups(data);
      setActivePanel("default");
    } catch (err) {
      showError(err.message);
    }
  };

  const handleSelectUser = (user) => {
    setMessages([]);
    setPinnedMessage(null);
    setUnreadCounts((prev) => ({ ...prev, [String(user.id)]: 0 }));
    setChatPartner({
      type: "user",
      userId: String(user.id),
      fullName: user.name,
      role: (user.roles?.[0] ?? ""),
      avatar: user.avatar || null,
    });
    setActivePanel("messaging");
  };

  const handleSelectGroup = (group) => {
    setMessages([]);
    setPinnedMessage(null);
    setChatPartner({
      type: "group",
      groupName: `group_${group.id}`,
      fullName: group.name,
      role: "Group",
      avatar: null,
    });
    setActivePanel("messaging");
  };

  const handleBackToUsers = () => {
    setActivePanel("default");
    setChatPartner(null);
    setMessages([]);
    setPinnedMessage(null);
    setSearchQuery("");
  };

  const handleAttachFile = (file, type) => {
    console.log("[Chat] Attach file:", { name: file.name, type, size: file.size });
    // TODO: wire up file upload / send as message
  };

  return (
    <>
      {isChatOpen && (
        <Section className={`fixed z-50 ${isPhone ? 'inset-0 rounded-none p-0 h-dvh' : 'bottom-4 end-6 w-full max-w-[750px]'} bg-bg-surface-default-light dark:bg-bg-surface-default-dark shadow-lg ${isPhone ? 'p-0' : 'p-4'}`}>
          <div className={`bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden flex flex-col ${isPhone ? 'w-full h-full' : 'w-full max-w-[750px] h-[600px] min-h-[600px]'}`}>
            {/* Top bar with close button */}
            <div className="flex items-center justify-end px-3 py-2 border-b border-gray-100 dark:border-gray-700 shrink-0 bg-white dark:bg-gray-800">
              <button
                onClick={() => setIsChatOpen(false)}
                className="flex items-center justify-center w-8 h-8 rounded-lg text-gray-500 hover:text-red-500 hover:bg-gray-100 dark:hover:bg-gray-700 dark:hover:text-red-400 transition-all active:scale-90"
                aria-label={t('closeChat')}
              >
                <svg width="18" height="18" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M4 4l8 8M12 4l-8 8" />
                </svg>
              </button>
            </div>
            <div className={`flex-1 min-h-0 p-4 ${isPhone ? '' : 'grid grid-cols-3 gap-4'}`}>
              {(!isPhone || activePanel === "default") && (
                isPhone && !friends.length && !groups.length ? (
                  <DefaultChatPanel
                    onAddFriend={() => setActivePanel("addFriend")}
                    onCreateGroup={() => setActivePanel("createGroup")}
                    noMembers
                  />
                ) : (
                  <ChatUsers
                    chatPartner={chatPartner}
                    friends={friends}
                    groups={groups}
                    onlineUsers={onlineUsers}
                    unreadCounts={unreadCounts}
                    onAddFriend={() => setActivePanel("addFriend")}
                    onCreateGroup={() => setActivePanel("createGroup")}
                    onSelectUser={handleSelectUser}
                    onSelectGroup={handleSelectGroup}
                    searchMembers={searchMembers}
                    onSearchMembersChange={setSearchMembers}
                    currentUser={currentUser}
                  />
                )
              )}
            {(!isPhone || activePanel !== "default") && (
              <div className={`${isPhone ? 'h-full' : 'col-span-2 h-full'} flex flex-col min-h-0 gap-0`}>
                  {activePanel === "default" ? (
                    <DefaultChatPanel
                      onAddFriend={() => setActivePanel("addFriend")}
                      onCreateGroup={() => setActivePanel("createGroup")}
                      noMembers={!friends.length && !groups.length}
                    />
                  ) : activePanel === "createGroup" ? (
                    <CreateGroupPanel
                      friends={friendsList}
                      onCreate={handleCreateGroup}
                      onCancel={() => setActivePanel("default")}
                    />
                  ) : activePanel === "addFriend" ? (
                    <AddFriendPanel
                      friendId={friendId}
                      setFriendId={setFriendId}
                      friendRequests={friendRequests}
                      onInvite={handleSendInvite}
                      onBack={() => setActivePanel("default")}
                      onAcceptRequest={handleAcceptRequest}
                      onDeclineRequest={handleDeclineRequest}
                    />
                  ) : (
                    <Messaging
                      messages={formattedMessages}
                      sendMessage={sendMessage}
                      onInputChange={handleInputChange}
                      partnerTyping={partnerTyping}
                      chatPartner={chatPartner}
                      deleteMessage={deleteMessage}
                      editMessage={editMessage}
                      pinMessage={pinMessage}
                      unpinMessage={unpinMessage}
                      pinnedMessage={pinnedMessage}
                      showSenderInfo={chatPartner?.type === "group"}
                      searchQuery={searchQuery}
                      onSearchChange={setSearchQuery}
                    isPhone={isPhone}
                    onBack={handleBackToUsers}
                    onAttachFile={handleAttachFile}
                  />
                  )}
                </div>
              )}
            </div>
          </div>

          <Dialog
            isOpen={!!pendingPinMessageId}
            variant="warning"
            title={t('pin.title')}
            onClose={handleCancelPin}
            onConfirm={handleConfirmPin}
            confirmText={t('pin.confirm')}
            cancelText={t('pin.cancel')}
          >
            <p>
              {t('pin.warning')}
            </p>
          </Dialog>
        </Section>
      )}

    </>
  );
}
