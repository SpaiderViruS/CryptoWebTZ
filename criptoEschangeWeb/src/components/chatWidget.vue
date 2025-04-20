<template>
  <div class="chat-widget" :class="{ open: isOpen }">
    <div class="chat-header" @click="toggleChat">
      Чат с поддержкой
      <span class="close-btn" @click.stop="isOpen = false">&times;</span>
    </div>

    <div v-if="isOpen" class="chat-body">
      <div class="telegram-link">
        🚀 Не хотите ждать? Продолжите чат с менеджером в
        <a href="https://t.me/zdes_moglo_byt_vash_teg" target="_blank">Telegram</a>.
      </div>

      <div class="messages" ref="messagesContainer">
        <div
          v-for="(msg, index) in messages"
          :key="index"
          :class="msg.from_type === 'client' ? 'message client' : 'message manager'"
        >
          <div class="meta">
            <span class="label">{{ msg.from_type === 'client' ? '👤 Клиент' : '🛠️ Менеджер' }}</span>
            <span class="time">{{ formatTime(msg.timestamp) }}</span>
          </div>
          <div class="text">{{ msg.text }}</div>
        </div>
      </div>

      <div class="chat-input">
        <input
          v-model="newMessage"
          @keydown.enter="sendMessage"
          placeholder="Введите сообщение..."
        />
        <button @click="sendMessage">➤</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, inject, onUnmounted, nextTick } from 'vue';

const $api = inject('$api');
const isOpen = ref(false);
const messages = ref([]);
const newMessage = ref('');
const messagesContainer = ref(null);
let refreshInterval = null;

let clientId = localStorage.getItem('client_id');
if (!clientId) {
  clientId = crypto.randomUUID();
  localStorage.setItem('client_id', clientId);
}

const toggleChat = () => {
  isOpen.value = !isOpen.value;
  if (isOpen.value) loadMessages();
};

const loadMessages = async () => {
  try {
    const res = await $api.get('/chat/3');
    messages.value = res.data.filter(m => m.client_id === clientId);
    scrollToBottom();
  } catch (err) {
    console.error('Ошибка загрузки сообщений:', err);
  }
};

const sendMessage = async () => {
  const text = newMessage.value.trim();
  if (!text) return;

  const payload = {
    text,
    from_type: 'client',
    from_id: clientId
  };

  try {
    await $api.post('/chat', payload);
    messages.value.push({
      ...payload,
      timestamp: new Date().toISOString()
    });
    newMessage.value = '';
    scrollToBottom();
  } catch (err) {
    console.error('Ошибка отправки:', err);
  }
};

const scrollToBottom = () => {
  nextTick(() => {
    if (messagesContainer.value) {
      messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight;
    }
  });
};

const formatTime = (timestamp) => {
  if (!timestamp) return '';
  const date = new Date(timestamp);
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
};

onMounted(() => {
  loadMessages();
  refreshInterval = setInterval(loadMessages, 5000);
});

onUnmounted(() => {
  clearInterval(refreshInterval);
});
</script>

<style scoped>
.chat-widget {
  position: fixed;
  bottom: 20px;
  right: 20px;
  width: 300px;
  font-family: sans-serif;
  z-index: 9999;
}
.chat-header {
  background: #3b82f6;
  color: white;
  padding: 10px;
  font-weight: bold;
  cursor: pointer;
  display: flex;
  justify-content: space-between;
}
.chat-body {
  background: #fff;
  border: 1px solid #ccc;
  max-height: 420px;
  display: flex;
  flex-direction: column;
}
.messages {
  flex: 1;
  padding: 10px;
  overflow-y: auto;
  font-size: 0.9rem;
  display: flex;
  flex-direction: column;
  gap: 6px;
}
.message {
  padding: 6px 10px;
  border-radius: 6px;
  max-width: 80%;
  display: flex;
  flex-direction: column;
  word-wrap: break-word;       
  overflow-wrap: break-word;   
  white-space: pre-line;       
}
.text {
  word-break: break-word;
  white-space: pre-line;
}
.message.client {
  background: #f1f1f1;
  align-self: flex-start;
}
.message.manager {
  background: #daf1ff;
  align-self: flex-end;
  text-align: right;
}
.meta {
  font-size: 0.75rem;
  color: #555;
  display: flex;
  justify-content: space-between;
  margin-bottom: 2px;
}
.label {
  font-weight: 600;
  opacity: 0.9;
}
.time {
  font-size: 0.75rem;
  color: #888;
}
.chat-input {
  display: flex;
  border-top: 1px solid #ccc;
}
.chat-input input {
  flex: 1;
  border: none;
  padding: 10px;
}
.chat-input input:focus {
  outline: none;
}
.chat-input button {
  border: none;
  padding: 10px;
  cursor: pointer;
  background: #3b82f6;
  color: white;
}
.telegram-link {
  font-size: 0.85rem;
  padding: 8px 10px;
  border-top: 1px solid #eee;
  background: #fafafa;
  color: #333;
}
.telegram-link a {
  color: #3b82f6;
  text-decoration: none;
  font-weight: bold;
}
</style>
