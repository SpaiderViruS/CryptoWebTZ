<template>
  <div class="admin-chat-container">
    <div class="admin-chat">
      <div class="chat-sidebar">
        <h3>Клиенты</h3>
        <ul>
          <li
            v-for="client in clients"
            :key="client"
            :class="{ active: selectedClient === client }"
            @click="selectClient(client)"
            title="Нажмите, чтобы выбрать"
          >
            {{ client }}
          </li>
        </ul>
      </div>

      <div class="chat-window" v-if="selectedClient">
        <div class="messages" ref="messagesContainer">
          <div
            v-for="(msg, idx) in messages"
            :key="idx"
            :class="msg.from_type === 'manager' ? 'message admin' : 'message client'"
          >
            <strong>{{ msg.from_type === 'manager' ? 'Менеджер' : 'Клиент' }}:</strong>
            {{ msg.text }}
            <div class="timestamp">{{ formatTime(msg.timestamp) }}</div>
          </div>
        </div>

        <div class="input-box">
          <input
            v-model="newMessage"
            placeholder="Введите сообщение..."
            @keyup.enter="sendMessage"
          />
          <button @click="sendMessage">Отправить</button>
        </div>
      </div>

      <div class="chat-placeholder" v-else>
        Выберите клиента, чтобы начать общение
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, inject, onMounted, watch, onUnmounted, nextTick } from 'vue';

const $api = inject('$api');
const managerId = '3';

const clients = ref([]);
const selectedClient = ref(null);
const messages = ref([]);
const allMessages = ref([]);
const newMessage = ref('');
const messagesContainer = ref(null);
let refreshInterval;

const loadChatData = async () => {
  try {
    const res = await $api.get(`/chat/${managerId}`);
    allMessages.value = res.data;

    const uniqueClientIds = [...new Set(
      res.data.map(m => m.client_id).filter(Boolean)
    )];
    clients.value = uniqueClientIds;

    if (selectedClient.value) {
      filterMessagesForClient();
    }
  } catch (err) {
    console.error('Ошибка загрузки чатов:', err);
  }
};

const filterMessagesForClient = () => {
  messages.value = allMessages.value.filter(m => m.client_id === selectedClient.value);
  scrollToBottom();
};

const selectClient = (clientId) => {
  selectedClient.value = clientId;
  filterMessagesForClient();
};

const sendMessage = async () => {
  if (!newMessage.value.trim()) return;

  const payload = {
    text: newMessage.value.trim(),
    from_type: 'manager',
    from_id: managerId,
    client_id: selectedClient.value
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
    console.error('Ошибка отправки сообщения:', err);
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
  loadChatData();
  refreshInterval = setInterval(loadChatData, 5000);
});

onUnmounted(() => {
  clearInterval(refreshInterval);
});

watch(selectedClient, () => {
  if (selectedClient.value) loadChatData();
});
</script>

<style scoped>
.admin-chat-container {
  padding: 20px;
  box-sizing: border-box;
  height: 100vh;
  background: #f0f2f5;
}

.admin-chat {
  display: flex;
  height: calc(100vh - 120px); /* Чуть короче */
  border: 1px solid #ccc;
  max-width: 1200px;
  margin: 0 auto;
  background: white;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.chat-sidebar {
  width: 320px; /* Увеличили место под имя клиента */
  border-right: 1px solid #ddd;
  padding: 12px;
  background: #f8f9fa;
  overflow-y: auto;
}

.chat-sidebar h3 {
  margin-bottom: 10px;
  font-size: 1.1rem;
}

.chat-sidebar ul {
  list-style: none;
  padding: 0;
  margin: 0;
}

.chat-sidebar li {
  padding: 10px;
  cursor: pointer;
  transition: 0.2s;
  user-select: none;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  border-radius: 6px;
  font-size: 0.95rem;
}

.chat-sidebar li.active,
.chat-sidebar li:hover {
  background: #007bff;
  color: white;
}

.chat-window {
  flex: 1;
  display: flex;
  flex-direction: column;
  padding: 16px;
}

.messages {
  flex: 1;
  overflow-y: auto;
  margin-bottom: 12px;
  display: flex;
  flex-direction: column;
  gap: 8px;
  scroll-behavior: smooth;
}

.message {
  padding: 8px 12px;
  border-radius: 6px;
  max-width: 75%;
  word-break: break-word;
  position: relative;
  font-size: 0.95rem;
  line-height: 1.4;
}

.message.admin {
  align-self: flex-end;
  background: #daf1ff;
  text-align: right;
}

.message.client {
  align-self: flex-start;
  background: #f1f1f1;
  text-align: left;
}

.timestamp {
  font-size: 0.75rem;
  color: #777;
  margin-top: 4px;
}

.input-box {
  display: flex;
  gap: 8px;
}

.input-box input {
  flex: 1;
  padding: 10px 12px;
  font-size: 1rem;
  border: 1px solid #ccc;
  border-radius: 6px;
}

.input-box input:focus {
  outline: none;
  border-color: #007bff;
}

.input-box button {
  padding: 10px 16px;
  font-size: 1rem;
  background: #3b82f6;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  transition: 0.2s;
}

.input-box button:hover {
  background: #2563eb;
}

.chat-placeholder {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1rem;
  color: #777;
  padding: 20px;
  text-align: center;
}

@media (max-width: 768px) {
  .admin-chat {
    flex-direction: column;
    height: calc(100dvh - 100px);
    border: none;
    border-radius: 0;
  }

  .chat-sidebar {
    width: 100%;
    border-right: none;
    border-bottom: 1px solid #ddd;
  }

  .chat-window {
    padding: 10px;
  }

  .input-box input,
  .input-box button {
    font-size: 0.9rem;
  }

  .chat-sidebar h3 {
    font-size: 1rem;
  }

  .message {
    font-size: 0.9rem;
  }

  .timestamp {
    font-size: 0.7rem;
  }
}
</style>

