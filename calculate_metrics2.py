import re

with open('src/components/dashboard/DashboardScreen.tsx', 'r') as f:
    content = f.read()

content = content.replace(
    "const newMessagesCount = liveChatMessages.filter(m => m.senderRole !== 'student' && m.senderId !== student?.id).length % 5; // dynamic demo feel if needed, or just liveChatMessages length logic",
    "const unreadChatCount = liveChatMessages.filter(m => m.senderId !== student?.studentId).length; // using all received as unread for dashboard demo"
)

with open('src/components/dashboard/DashboardScreen.tsx', 'w') as f:
    f.write(content)
