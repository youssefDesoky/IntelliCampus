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
  deleteFriend,
  FAHIM_USER_ID,
  leaveGroup,
  uploadFile,
  fetchGroupById,
  addGroupMember,
  searchUsers,
} from "../services/chatService";
import { useError } from '../../../contexts/ErrorContext.jsx';
import { useToast } from '../../../contexts/ToastContext.jsx';
import { setChatState } from '../../../utils/notificationHandler';
import { getLocalizedField } from '../../../utils/getLocalizedField';

export default function Chat({ isChatOpen, setIsChatOpen, currentUser, defaultPanel, defaultPanelTrigger, defaultUser, defaultGroupName }) {
  const { t, i18n } = useTranslation('chat');
  const { showError } = useError();
  const { showToast } = useToast();
  const { isPhone, isMobile, width } = useSidebar();
  // "default" | "messaging" | "addFriend" | "createGroup"
  const [activePanel, setActivePanel] = useState(defaultPanel || "default");
  useEffect(() => {
    if (defaultPanel) setActivePanel(defaultPanel);
  }, [defaultPanel, defaultPanelTrigger]);
  useEffect(() => {
    if (defaultUser) {
      console.log("[Chat] defaultUser effect firing", { userId: defaultUser.id, trigger: defaultPanelTrigger });
      setMessages([]);
      setPinnedMessage(null);
      setChatPartner({
        type: "user",
        userId: String(defaultUser.id),
        fullName: defaultUser.name || "User",
        role: "",
        avatar: null,
      });
      setActivePanel("messaging");
    }
  }, [defaultUser, defaultPanelTrigger]);
  useEffect(() => {
    if (defaultGroupName) {
      openGroupChat(defaultGroupName);
    }
  }, [defaultGroupName, defaultPanelTrigger]);
  const isChatOpenRef = useRef(isChatOpen);
  useEffect(() => { isChatOpenRef.current = isChatOpen; }, [isChatOpen]);
  const [friendId, setFriendId] = useState("");
  const [friendRequests, setFriendRequests] = useState([]);
  const [sentRequests, setSentRequests] = useState([]);
  const [friends, setFriends] = useState([]);
  const [groups, setGroups] = useState([]);
  const [messages, setMessages] = useState([]);
  const [chatPartner, setChatPartner] = useState(null);
  const [onlineUsers, setOnlineUsers] = useState(new Set());
  const [unreadCounts, setUnreadCounts] = useState({});
  const [groupMembers, setGroupMembers] = useState([]);
  const [groupDetails, setGroupDetails] = useState(null);
  const [isAlreadyTyping, setIsAlreadyTyping] = useState(false);
  const [partnerTyping, setPartnerTyping] = useState(false);
  const [pinnedMessage, setPinnedMessage] = useState(null);
  const [pendingPinMessageId, setPendingPinMessageId] = useState(null);
  const [confirmDialog, setConfirmDialog] = useState({ isOpen: false, title: "", message: "", onConfirm: null });

  const [searchQuery, setSearchQuery] = useState("");
  const [searchMembers, setSearchMembers] = useState("");
  const isSendingRef = useRef(false);
  const connectionRef = useRef(null);
  const chatPartnerRef = useRef(null);
  const msgIdsRef = useRef(new Set());
  const typingTimeoutRef = useRef(null);
  const pinnedMessageRef = useRef(null);
  const leavingGroupRef = useRef(null);
  const chatRef = useRef(null);
  const posRef = useRef(null);
  const dragOffsetRef = useRef({ x: 0, y: 0 });
  const hasMovedRef = useRef(false);
  const isDraggingRef = useRef(false);
  const [position, setPosition] = useState(null);
  const [chatSize, setChatSize] = useState(() => {
    try {
      const saved = localStorage.getItem('chat-size');
      if (saved) {
        const parsed = JSON.parse(saved);
        const vw = window.innerWidth;
        const vh = window.innerHeight;
        return {
          width: Math.max(400, Math.min(parsed.width, Math.min(vw * 0.9, 1100))),
          height: Math.max(400, Math.min(parsed.height, vh * 0.9)),
        };
      }
    } catch {}
    return { width: 750, height: 600 };
  });
  const chatSizeRef = useRef(chatSize);
  useEffect(() => { chatSizeRef.current = chatSize; }, [chatSize]);
  const isResizingRef = useRef(false);
  const resizeDirRef = useRef(null);
  const resizeStartRef = useRef({ x: 0, y: 0, width: 0, height: 0, top: 0, left: 0 });

  // Keep refs in sync with state so SignalR handlers always have latest value
  useEffect(() => { chatPartnerRef.current = chatPartner; }, [chatPartner]);
  useEffect(() => { pinnedMessageRef.current = pinnedMessage; }, [pinnedMessage]);

  useEffect(() => {
    const userId = chatPartner && chatPartner.type !== 'group' ? String(chatPartner.userId) : null;
    setChatState({ isChatOpen, activeChatUserId: userId });
  }, [isChatOpen, chatPartner]);

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
        console.log("[Chat] loadGroups returned:", data);
        setGroups(data);
      } catch (err) {
        console.error("[Chat] loadGroups failed:", err);
      }
    };

    loadFriends();
    loadRequests();
    loadGroups();
  }, [currentUser]);

  // SignalR connection — alive as long as user is logged in
  useEffect(() => {
    if (!currentUser) return;

    const conn = createHubConnection();

    conn.on("ReceiveFriendRequest", (req) => {
      setFriendRequests((prev) => [
        ...prev,
        {
          id: req.friendRequestId,
          senderId: req.senderId,
          name: req.senderName,
          avatar: req.senderProfileImage,
          recipientId: req.recipientId,
          recipientName: req.recipientName,
        },
      ]);
    });

    conn.on("FriendRequestAccepted", async (req) => {
      setSentRequests((prev) => prev.filter((r) => r.id !== req.friendRequestId));
      try {
        const data = await fetchFriends();
        setFriends(data);
      } catch {}
    });

    conn.on("ReceivePrivateMessage", (msg) => {
      const senderId = String(msg.senderId);
      const isOwn = senderId === String(currentUser.userId);
      const partner = chatPartnerRef.current;
      const isActiveChat = isChatOpenRef.current && partner && partner.type !== "group" && senderId === String(partner.userId);

      if (isOwn || isActiveChat) {
        setPartnerTyping(false);
        msgIdsRef.current.add(msg.messageId);
        setMessages((prev) => {
          const exists = prev.some((m) => m.messageId === msg.messageId);
          return exists ? prev : [...prev, msg];
        });
        return;
      }

      setUnreadCounts((prev) => ({ ...prev, [senderId]: (prev[senderId] || 0) + 1 }));
    });

    conn.on("ReceiveGroupMessage", (msg) => {
      const partner = chatPartnerRef.current;
      const isActiveGroup = partner && partner.type === "group" && partner.groupName === msg.groupName && isChatOpenRef.current;
      if (isActiveGroup) {
        msgIdsRef.current.add(msg.messageId);
        setMessages((prev) => {
          const exists = prev.some((m) => m.messageId === msg.messageId);
          return exists ? prev : [...prev, msg];
        });
      } else {
        setUnreadCounts((prev) => ({ ...prev, [msg.groupName]: (prev[msg.groupName] || 0) + 1 }));
      }
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
      if (!isChatOpenRef.current) return;
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

    conn.on("GroupMembersUpdated", (data) => {
      const partner = chatPartnerRef.current;
      const isViewingThisGroup = partner?.type === "group" && partner.groupName === data.groupName;
      if (isViewingThisGroup && leavingGroupRef.current !== data.groupName) {
        setMessages((prev) => [...prev, {
          messageId: `sys_${Date.now()}`,
          content: data.content,
          timestamp: data.timestamp,
          senderId: "0",
          senderName: "System",
          isSystemMessage: true,
        }]);
        const gid = partner.groupName.replace("group_", "");
        fetchGroupById(gid).then((details) => { setGroupDetails(details); setGroupMembers(details.members || []); }).catch(() => {});
      } else if (!isViewingThisGroup) {
        showToast({ type: "info", title: "Group Update", message: data.content });
      }
    });

    conn.on("GroupCreated", async () => {
      try {
        const data = await fetchMyGroups();
        setGroups(data);
      } catch {}
    });

    conn.onreconnecting((error) => {
      console.warn("[ChatHub] Reconnecting...", error);
    });

    conn.onreconnected(async () => {
      console.info("[ChatHub] Reconnected.");
      await joinAllGroups(conn);
    });

    conn.onclose((error) => {
      console.error("[ChatHub] Connection closed.", error);
    });

    let disposed = false;
    conn
      .start()
      .then(async () => {
        if (disposed) { conn.stop(); return; }
        await joinAllGroups(conn);
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
  }, [currentUser]);

  // Track chat state for notification system
  useEffect(() => {
    setChatState({ isChatOpen, activeChatUserId: chatPartner?.userId || chatPartner?.groupName || null });
  }, [isChatOpen, chatPartner]);

  async function joinAllGroups(conn) {
    try {
      const groups = await fetchMyGroups();
      for (const g of groups) {
        await conn.invoke("JoinGroup", `group_${g.groupId}`);
      }
    } catch (err) {
      console.warn("[ChatHub] Failed to join groups:", err);
    }
  }

  function openPrivateChat(senderId, senderName, senderAvatar) {
    setMessages([]);
    setPinnedMessage(null);
    setUnreadCounts((prev) => ({ ...prev, [senderId]: 0 }));
    setChatPartner({
      type: "user",
      userId: senderId,
      fullName: senderName,
      role: "",
      avatar: senderAvatar || null,
    });
    setActivePanel("messaging");
    setIsChatOpen(true);
  }

  function openGroupChat(groupName, groupTitle) {
    const groupId = Number(groupName.replace("group_", ""));
    setMessages([]);
    setPinnedMessage(null);
    setUnreadCounts((prev) => ({ ...prev, [groupName]: 0 }));
    setChatPartner({
      type: "group",
      groupName,
      fullName: groupTitle || groupName.replace("group_", "Group "),
      role: "Group",
      avatar: null,
    });
    setActivePanel("messaging");
    setIsChatOpen(true);
    fetchGroupById(groupId).then((details) => {
      setGroupDetails(details);
      setGroupMembers(details.members || []);
    }).catch(() => {
      setGroupDetails(null);
      setGroupMembers([]);
    });
  }

  const loadHistory = useCallback(async (conn, partner) => {
    try {
      const start = Date.now();
      const history = partner.type === "group"
        ? await fetchGroupChatHistory(partner.groupName)
        : await fetchChatHistory(currentUser.userId, partner.userId);
      console.log("[Chat] loadHistory success", { count: history?.length, took: Date.now() - start });
      setMessages(history.reverse());
      const pinned = history.find(m => m.isPinned);
      setPinnedMessage(pinned ? pinned.content : null);
      history.forEach((m) => msgIdsRef.current.add(m.messageId));
    } catch (err) {
      console.warn("[Chat] loadHistory failed:", err);
    }
  }, [currentUser]);

  // Load history & join group when partner changes
  useEffect(() => {
    const conn = connectionRef.current;
    console.log("[Chat] chatPartner effect running", { chatPartner: chatPartner?.userId || chatPartner?.groupName, hasConn: !!conn });
    if (!chatPartner || !conn) return;

    let cancelled = false;

    const load = async () => {
      if (cancelled) { console.log("[Chat] load cancelled"); return; }
      if (chatPartner.type === "group") {
        console.log("[Chat] joining group", chatPartner.groupName);
        await conn.invoke("JoinGroup", chatPartner.groupName);
      }
      if (cancelled) { console.log("[Chat] load cancelled after join"); return; }
      console.log("[Chat] calling loadHistory for", chatPartner.userId || chatPartner.groupName);
      await loadHistory(conn, chatPartner);
      console.log("[Chat] loadHistory completed");
    };
    load();

    return () => { console.log("[Chat] chatPartner effect cleanup"); cancelled = true; };
  }, [chatPartner, loadHistory]);

  useEffect(() => {
    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    };
  }, []);

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
      if (isSendingRef.current) return;
      isSendingRef.current = true;
      const conn = connectionRef.current;
      if (!conn || !chatPartner) {
        isSendingRef.current = false;
        return;
      }

      try {
        if (chatPartner.type === "group") {
          await conn.invoke("SendGroupMessage", chatPartner.groupName, content);
        } else {
          await conn.invoke("SendPrivateMessage", chatPartner.userId, content);
        }
      } catch (err) {
        showError(err.message);
      } finally {
        isSendingRef.current = false;
      }
    },
    [chatPartner]
  );

  const sendCourseQuestion = useCallback(
    async (course, content, fileUrl) => {
      if (isSendingRef.current) return;
      isSendingRef.current = true;
      const conn = connectionRef.current;
      if (!conn || !chatPartner) {
        isSendingRef.current = false;
        return;
      }

      try {
        await conn.invoke("SendCourseQuestion", chatPartner.userId, course.code, course.name, content, fileUrl ?? null);
      } catch (err) {
        showError(err.message);
      } finally {
        isSendingRef.current = false;
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
          (String(msg.senderId) === FAHIM_USER_ID
            ? "Faheem"
            : msg.senderName) ||
          (isOwn
            ? getLocalizedField(currentUser, 'fullName', i18n.language)
            : getLocalizedField(chatPartner, 'fullName', i18n.language) || "Unknown"),
        avatar: isOwn ? (currentUser?.avatar || null) : (chatPartner?.avatar || null),
        isOwnMessage: isOwn,
      },
      message: (!isOwn && (String(chatPartner?.userId) === FAHIM_USER_ID || String(msg.senderId) === FAHIM_USER_ID))
        ? msg.content.replace(/\s*##\s*Answer\s*/g, '\n\n').replace(/\s*##\s*Recommendation\s*/g, '\n\n').trim()
        : msg.content,
      sendTime: formatTime(msg.timestamp),
      isEdited: msg.isEdited,
      isPinned: msg.isPinned,
      isAi: !isOwn && (String(chatPartner?.userId) === FAHIM_USER_ID || String(msg.senderId) === FAHIM_USER_ID),
      isSystemMessage: msg.isSystemMessage,
    });
  }

  const friendsList = friends.map((f) => ({
    id: f.userId,
    name: getLocalizedField(f, 'fullName', i18n.language),
  }));

  const handleSendInvite = async () => {
    const id = friendId.trim();
    if (!id) return;
    try {
      const result = await sendFriendRequest(id);
      setFriendId("");
      setSentRequests((prev) => [
        ...prev,
        {
          id: result.friendRequestId,
          recipientId: result.recipientId,
          name: result.recipientName,
          avatar: result.recipientProfileImage,
          status: result.status,
        },
      ]);
      const [reqData, friendData] = await Promise.all([
        fetchPendingRequests(),
        fetchFriends(),
      ]);
      setFriendRequests(
        reqData.map((r) => ({
          id: r.friendRequestId,
          senderId: r.senderId,
          name: r.senderName,
          avatar: r.senderProfileImage,
          recipientId: r.recipientId,
          recipientName: r.recipientName,
        }))
      );
      setFriends(friendData);
      showToast({ type: "success", title: "Sent", message: "Friend request sent." });
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
      const newGroup = await createGroup(title, description, members, profileImage);
      setGroups((prev) => [...prev, newGroup]);
      setActivePanel("default");
      showToast({ type: "success", title: "Group Created", message: `"${title}" has been created successfully.` });
    } catch (err) {
      showError(err.message);
    }
  };

  const handleSelectUser = (user) => {
    setMessages([]);
    setPinnedMessage(null);
    setGroupDetails(null);
    setGroupMembers([]);
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

  const handleSelectGroup = async (group) => {
    setMessages([]);
    setPinnedMessage(null);
    const groupName = `group_${group.id}`;
    setUnreadCounts((prev) => ({ ...prev, [groupName]: 0 }));
    setChatPartner({
      type: "group",
      groupName: groupName,
      fullName: group.name,
      role: "Group",
      avatar: group.profileImage || null,
    });
    setActivePanel("messaging");
    try {
      const details = await fetchGroupById(group.id);
      setGroupDetails(details);
      setGroupMembers(details.members || []);
    } catch {
      setGroupDetails(null);
      setGroupMembers([]);
    }
  };

  const handleAddGroupMember = async (userId) => {
    if (!groupDetails) return;
    try {
      await addGroupMember(groupDetails.groupId, userId);
      const details = await fetchGroupById(groupDetails.groupId);
      setGroupDetails(details);
      setGroupMembers(details.members || []);
    } catch (err) {
      showError(err.message);
    }
  };

  const handleBackToUsers = () => {
    setActivePanel("default");
    setChatPartner(null);
    setMessages([]);
    setPinnedMessage(null);
    setGroupDetails(null);
    setGroupMembers([]);
    setSearchQuery("");
  };

  // Attachments are handled inside ChatControls (upload → send URL as message
  // in normal chat, or stash a pending attachment for Course Q&A send).
  const handleAttachFile = (_file, _type) => {};

  const handleDeleteFriend = (friendId) => {
    // Prevent removing the AI assistant
    if (String(chatPartner?.userId) === FAHIM_USER_ID) return;

    const name = chatPartner?.fullName || "this user";
    
    setConfirmDialog({
      isOpen: true,
      title: "Remove Friend",
      message: (
        <>
          <p className="mb-2">Are you sure you want to remove <strong>{name}</strong> from your friends?</p>
          <p className="text-xs opacity-70">This will unfriend you and remove them from your contacts. They won't be able to send you messages unless you become friends again.</p>
        </>
      ),
      onConfirm: async () => {
        try {
          await deleteFriend(friendId);
          setFriends((prev) => prev.filter((f) => f.userId !== friendId));
          setChatPartner(null);
          setActivePanel("default");
          setMessages([]);
          showToast({ type: "info", title: "Removed", message: "Friend removed successfully." });
        } catch (err) {
          showError(err.message);
        }
      },
    });
  };

  const executeConfirmAction = () => {
    if (confirmDialog.onConfirm) {
      confirmDialog.onConfirm();
    }
    setConfirmDialog((prev) => ({ ...prev, isOpen: false }));
  };

  const handleLeaveGroup = () => {
    if (!chatPartner || chatPartner.type !== "group") return;
    const name = chatPartner.fullName || "this group";
    setConfirmDialog({
      isOpen: true,
      title: "Leave Group",
      message: (
        <>
          <p className="mb-2">Are you sure you want to leave <strong>"{name}"</strong>?</p>
          <p className="text-xs opacity-70">You will no longer receive messages from this group. You can only rejoin if a group member adds you back.</p>
        </>
      ),
      onConfirm: async () => {
        const groupId = Number(chatPartner.groupName?.replace("group_", ""));
        if (!groupId) return;
        leavingGroupRef.current = `group_${groupId}`;
        try {
          await leaveGroup(groupId);
          setGroups((prev) => prev.filter((g) => g.groupId !== groupId));
          setChatPartner(null);
          setActivePanel("default");
          setMessages([]);
          setGroupMembers([]);
          leavingGroupRef.current = null;
          showToast({ type: "info", title: "Left", message: "You left the group." });
        } catch (err) {
          leavingGroupRef.current = null;
          showError(err.message);
        }
      },
    });
  };

  const handlePointerDown = useCallback((e) => {
    if (isPhone) return;
    if (e.target.closest('button') || e.target.closest('a') || e.target.closest('input') || e.target.closest('textarea')) return;

    const chatEl = chatRef.current;
    if (!chatEl) return;

    const rect = chatEl.getBoundingClientRect();
    const clientX = e.clientX ?? e.touches?.[0]?.clientX;
    const clientY = e.clientY ?? e.touches?.[0]?.clientY;
    if (clientX == null) return;

    dragOffsetRef.current = { x: clientX - rect.left, y: clientY - rect.top };

    const initialPos = posRef.current || { top: rect.top, left: rect.left };
    posRef.current = initialPos;
    setPosition(initialPos);

    isDraggingRef.current = true;
    hasMovedRef.current = false;

    const onMove = (ev) => {
      if (!isDraggingRef.current) return;
      const cx = ev.clientX ?? ev.touches?.[0]?.clientX;
      const cy = ev.clientY ?? ev.touches?.[0]?.clientY;
      if (cx == null) return;
      ev.preventDefault();
      hasMovedRef.current = true;
      let newTop = cy - dragOffsetRef.current.y;
      let newLeft = cx - dragOffsetRef.current.x;
      const el = chatRef.current;
        if (el) {
        const r = el.getBoundingClientRect();
        const vw = window.innerWidth;
        const vh = window.innerHeight;
        const headerH = isMobile ? 60 : 80;
        const asideW = !isMobile ? (width / 100) * vw : 0;
        const bottomH = 0;
        const minTop = headerH + 4;
        const maxTop = vh - bottomH - r.height - 4;
        const isRtl = i18n.dir() === 'rtl';
        const minLeft = isRtl ? 4 : asideW + 4;
        const maxLeft = isRtl ? vw - asideW - r.width - 4 : vw - r.width - 4;
        if (minTop <= maxTop) newTop = Math.max(minTop, Math.min(newTop, maxTop));
        if (minLeft <= maxLeft) newLeft = Math.max(minLeft, Math.min(newLeft, maxLeft));
      }
      const newPos = { top: newTop, left: newLeft };
      posRef.current = newPos;
      setPosition(newPos);
    };

    const onEnd = () => {
      isDraggingRef.current = false;
      document.removeEventListener('mousemove', onMove);
      document.removeEventListener('mouseup', onEnd);
      document.removeEventListener('touchmove', onMove);
      document.removeEventListener('touchend', onEnd);
      document.body.style.userSelect = '';

      if (!hasMovedRef.current) return;

      const currentPos = posRef.current;
      const el = chatRef.current;
      if (!currentPos || !el) return;

      const r = el.getBoundingClientRect();
      const vw = window.innerWidth;
      const vh = window.innerHeight;
      const headerH = isMobile ? 60 : 80;
      const asideW = !isMobile ? (width / 100) * vw : 0;
      const bottomH = 0;

      let newTop = currentPos.top;
      let newLeft = currentPos.left;

      const minTop = headerH + 4;
      const maxTop = vh - bottomH - r.height - 4;
      const isRtl = i18n.dir() === 'rtl';
      const minLeft = isRtl ? 4 : asideW + 4;
      const maxLeft = isRtl ? vw - asideW - r.width - 4 : vw - r.width - 4;
      if (minTop <= maxTop) newTop = Math.max(minTop, Math.min(newTop, maxTop));
      if (minLeft <= maxLeft) newLeft = Math.max(minLeft, Math.min(newLeft, maxLeft));

      if (newTop !== currentPos.top || newLeft !== currentPos.left) {
        setPosition({ top: newTop, left: newLeft });
      }
    };

    document.addEventListener('mousemove', onMove);
    document.addEventListener('mouseup', onEnd);
    document.addEventListener('touchmove', onMove, { passive: false });
    document.addEventListener('touchend', onEnd);
  }, [isPhone, isMobile, width]);

  const handleResizeStart = useCallback((e, direction) => {
    if (isPhone) return;
    e.preventDefault();
    e.stopPropagation();

    const clientX = e.clientX ?? e.touches?.[0]?.clientX;
    const clientY = e.clientY ?? e.touches?.[0]?.clientY;
    if (clientX == null) return;

    const el = chatRef.current;
    if (!el) return;

    const rect = el.getBoundingClientRect();
    const currentPos = posRef.current;

    resizeStartRef.current = {
      x: clientX,
      y: clientY,
      width: chatSizeRef.current.width,
      height: chatSizeRef.current.height,
      top: currentPos?.top ?? rect.top,
      left: currentPos?.left ?? rect.left,
    };
    resizeDirRef.current = direction;
    isResizingRef.current = true;
    document.body.style.userSelect = 'none';

    const onMove = (ev) => {
      if (!isResizingRef.current) return;
      const cx = ev.clientX ?? ev.touches?.[0]?.clientX;
      const cy = ev.clientY ?? ev.touches?.[0]?.clientY;
      if (cx == null) return;
      ev.preventDefault();

      const { x, y, width, height, top, left } = resizeStartRef.current;
      const dx = cx - x;
      const dy = cy - y;
      const dir = resizeDirRef.current;
      const vw = window.innerWidth;
      const vh = window.innerHeight;
      const maxW = Math.min(vw * 0.9, 1100);
      let newWidth = width;
      let newHeight = height;
      let newTop = top;
      let newLeft = left;

      if (dir.includes('e')) {
        newWidth = Math.max(400, Math.min(width + dx, maxW));
      }
      if (dir.includes('w')) {
        newWidth = Math.max(400, Math.min(width - dx, maxW));
        newLeft = left + (width - newWidth);
      }
      if (dir.includes('s')) {
        newHeight = Math.max(400, Math.min(height + dy, vh * 0.9));
      }
      if (dir.includes('n')) {
        newHeight = Math.max(400, Math.min(height - dy, vh * 0.9));
        newTop = top + (height - newHeight);
      }

      setChatSize({ width: newWidth, height: newHeight });

      if (dir.includes('n') || dir.includes('w')) {
        setPosition({ top: newTop, left: newLeft });
        posRef.current = { top: newTop, left: newLeft };
      }
    };

    const onEnd = () => {
      isResizingRef.current = false;
      resizeDirRef.current = null;
      document.removeEventListener('mousemove', onMove);
      document.removeEventListener('mouseup', onEnd);
      document.removeEventListener('touchmove', onMove);
      document.removeEventListener('touchend', onEnd);
      document.body.style.userSelect = '';
      localStorage.setItem('chat-size', JSON.stringify(chatSizeRef.current));
    };

    document.addEventListener('mousemove', onMove);
    document.addEventListener('mouseup', onEnd);
    document.addEventListener('touchmove', onMove, { passive: false });
    document.addEventListener('touchend', onEnd);
  }, [isPhone]);

  return (
    <>
      {isChatOpen && (
        <Section
          ref={chatRef}
          className={`fixed z-50 bg-white dark:bg-gray-800 ${isPhone ? 'inset-0 rounded-none p-0 h-dvh' : `${!position ? 'bottom-4 end-6' : ''} rounded-lg shadow-lg`}`}
          style={!isPhone ? { width: chatSize.width, height: chatSize.height, ...(position ? { top: position.top, left: position.left } : {}) } : undefined}
        >
          {!isPhone && (
            <>
              <div className="absolute top-0 left-0 w-3.5 h-3.5 z-30 cursor-nw-resize" onMouseDown={(e) => handleResizeStart(e, 'nw')} onTouchStart={(e) => handleResizeStart(e, 'nw')} />
              <div className="absolute top-0 right-0 w-3.5 h-3.5 z-30 cursor-ne-resize" onMouseDown={(e) => handleResizeStart(e, 'ne')} onTouchStart={(e) => handleResizeStart(e, 'ne')} />
              <div className="absolute bottom-0 left-0 w-3.5 h-3.5 z-30 cursor-sw-resize" onMouseDown={(e) => handleResizeStart(e, 'sw')} onTouchStart={(e) => handleResizeStart(e, 'sw')} />
              <div className="absolute bottom-0 right-0 w-3.5 h-3.5 z-30 cursor-se-resize" onMouseDown={(e) => handleResizeStart(e, 'se')} onTouchStart={(e) => handleResizeStart(e, 'se')} />
              <div className="absolute top-0 left-3.5 right-3.5 h-1.5 z-30 cursor-n-resize" onMouseDown={(e) => handleResizeStart(e, 'n')} onTouchStart={(e) => handleResizeStart(e, 'n')} />
              <div className="absolute bottom-0 left-3.5 right-3.5 h-1.5 z-30 cursor-s-resize" onMouseDown={(e) => handleResizeStart(e, 's')} onTouchStart={(e) => handleResizeStart(e, 's')} />
              <div className="absolute top-3.5 bottom-3.5 left-0 w-1.5 z-30 cursor-w-resize" onMouseDown={(e) => handleResizeStart(e, 'w')} onTouchStart={(e) => handleResizeStart(e, 'w')} />
              <div className="absolute top-3.5 bottom-3.5 right-0 w-1.5 z-30 cursor-e-resize" onMouseDown={(e) => handleResizeStart(e, 'e')} onTouchStart={(e) => handleResizeStart(e, 'e')} />
              <div className="absolute bottom-0.5 right-0.5 z-20 pointer-events-none opacity-50">
                <svg width="10" height="10" viewBox="0 0 10 10" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-gray-500">
                  <path d="M1 10L10 1" />
                  <path d="M5 10L10 5" />
                </svg>
              </div>
            </>
          )}
          <div className={`bg-white dark:bg-gray-800 flex flex-col w-full h-full overflow-hidden ${isPhone ? '' : 'rounded-lg'}`}>
            {/* Top bar with close button */}
            <div
              className="flex items-center justify-end px-3 py-2 border-b border-gray-100 dark:border-gray-700 shrink-0 bg-white dark:bg-gray-800"
              onMouseDown={!isPhone ? handlePointerDown : undefined}
              onTouchStart={!isPhone ? handlePointerDown : undefined}
              style={!isPhone ? { cursor: 'grab', touchAction: 'none' } : undefined}
            >
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
                      sentRequests={sentRequests}
                      onInvite={handleSendInvite}
                      onBack={() => setActivePanel("default")}
                      onAcceptRequest={handleAcceptRequest}
                      onDeclineRequest={handleDeclineRequest}
                      searchUsers={searchUsers}
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
                    onDeleteFriend={handleDeleteFriend}
                    onSendCourseQuestion={sendCourseQuestion}
                    onLeaveGroup={handleLeaveGroup}
                    groupMembers={groupMembers}
                    groupDetails={groupDetails}
                    onAddGroupMember={handleAddGroupMember}
                    currentUser={currentUser}
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

          <Dialog
            isOpen={confirmDialog.isOpen}
            variant="warning"
            title={confirmDialog.title}
            onClose={() => setConfirmDialog((prev) => ({ ...prev, isOpen: false }))}
            onConfirm={executeConfirmAction}
            confirmText={confirmDialog.title === "Remove Friend" ? "Remove" : "Leave"}
            cancelText="Cancel"
          >
            {confirmDialog.message}
          </Dialog>
        </Section>
      )}

    </>
  );
}
