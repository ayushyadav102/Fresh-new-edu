import re

with open('src/components/teacher/TeacherPortalScreen.tsx', 'r') as f:
    content = f.read()

metrics_logic = """
  const [liveChatMessages, setLiveChatMessages] = useState<ChatMessage[]>([]);

  useEffect(() => {
    const unsubChat = subscribeToChatMessages(selectedClass, (msgs) => {
      setLiveChatMessages(msgs);
    });
    return () => unsubChat();
  }, [selectedClass]);

  // Real-time Metrics Calculation
  
  // 1. My Teaching Schedule
  const activeClassesTodayCount = useMemo(() => {
     return teacherTodayTimetable.length;
  }, [teacherTodayTimetable]);
  
  const totalPeriodsWeek = useMemo(() => {
     return teacherTimetable.length;
  }, [teacherTimetable]);

  // 2. Exams Schedule
  const examsMetricText = useMemo(() => {
      const activeExams = availableExams.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()).slice(0, 2);
      if (activeExams.length === 0) return 'No Upcoming Duties';
      const days = activeExams.map(e => new Date(e.date).getDate());
      return `Ph: ${days.join(', ')} Sep`; // Mock format as requested
  }, [availableExams]);

  // 3. My Leaves
  const leavesMetricText = useMemo(() => {
     if (!teacher) return 'Apply for leaves';
     const myLeaves = (staffLeaves || []).filter(l => l.teacherId === teacher.id).sort((a, b) => new Date(b.appliedDate).getTime() - new Date(a.appliedDate).getTime());
     const latest = myLeaves[0];
     if (!latest) return 'Apply for leaves & track status';
     if (latest.status === 'Approved') {
        const startDay = new Date(latest.startDate).getDate();
        const endDay = new Date(latest.endDate).getDate();
        const month = new Date(latest.startDate).toLocaleString('en-US', { month: 'short' });
        if (startDay === endDay) {
           return `Approved: ${startDay} ${month}`;
        }
        return `Approved: ${startDay} to ${endDay} ${month}`;
     } else if (latest.status === 'Pending') {
        return `Pending sign-off: ${latest.totalDays} Days`;
     }
     return 'Apply for leaves & track status';
  }, [staffLeaves, teacher]);

  // 4. Chat Box
  const unreadQueriesCount = useMemo(() => {
     return liveChatMessages.filter(m => m.senderId !== teacher?.id).length; // using all received as unread for dashboard demo
  }, [liveChatMessages, teacher]);

  const teacherModules: TeacherModuleItem[] = [
"""

content = content.replace("  const teacherModules: TeacherModuleItem[] = [", metrics_logic)

with open('src/components/teacher/TeacherPortalScreen.tsx', 'w') as f:
    f.write(content)
