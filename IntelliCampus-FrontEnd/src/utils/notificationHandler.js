let openChatHandler = null;
const chatStateListeners = new Set();
let chatState = { isChatOpen: false, activeChatUserId: null };

export function setOpenChatHandler(fn) {
  openChatHandler = fn;
}

export function openChat(type, userId, userName) {
  if (openChatHandler) openChatHandler(type, userId, userName);
}

export function setChatState(state) {
  chatState = { ...chatState, ...state };
  chatStateListeners.forEach((fn) => fn(chatState));
}

export function subscribeChatState(fn) {
  chatStateListeners.add(fn);
  fn(chatState);
  return () => chatStateListeners.delete(fn);
}