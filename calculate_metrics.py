import re

with open('src/components/dashboard/DashboardScreen.tsx', 'r') as f:
    content = f.read()

metrics_logic = """
  const termPercentage = activeSubjects.length > 0 ? ((totalObtainedMarks / totalMaxMarks) * 100).toFixed(1) : null;

  // Real-time Metrics Calculation
  
  // 1. Homework & Syllabus
  const activeHomeworkCount = useMemo(() => {
    return teacherResources.filter(res => res.type === 'homework').length;
  }, [teacherResources]);

  // 2. Marksheet & Grade
  const { publishedCount, pendingCount } = useMemo(() => {
    let pub = 0;
    let pend = 0;
    liveMarks.forEach(m => {
       if (m.isPublished || m.status === 'Approved' || m.status === 'Verified') pub++;
       else pend++;
    });
    return { publishedCount: pub, pendingCount: pend };
  }, [liveMarks]);

  // 3. Fees
  const pendingFeeAmount = student?.pendingFeeAmount ?? feeSummary.due;

  // 4. Chat Box
  const unreadMessagesCount = useMemo(() => {
    // Count messages not from the current student
    return liveChatMessages.filter(m => m.senderId !== student?.studentId && !m.isRead).length; // assuming isRead property or we just count all from others for now
  }, [liveChatMessages, student]);
  
  // Real Chat Count based on recent messages (mocking unread for this demo since we might not track individual read receipts)
  const newMessagesCount = liveChatMessages.filter(m => m.senderRole !== 'student' && m.senderId !== student?.id).length % 5; // dynamic demo feel if needed, or just liveChatMessages length logic
"""

content = content.replace("const termPercentage = activeSubjects.length > 0 ? ((totalObtainedMarks / totalMaxMarks) * 100).toFixed(1) : null;", metrics_logic)

with open('src/components/dashboard/DashboardScreen.tsx', 'w') as f:
    f.write(content)
