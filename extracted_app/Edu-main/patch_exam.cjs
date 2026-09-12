const fs = require('fs');
let code = fs.readFileSync('src/services/examService.ts', 'utf8');

// Patch 1: subscribeToSubjectMarks
const t1_find = `    return onSnapshot(q, (snapshot) => {
      callback(snapshot.docs.map(doc => doc.data() as ExamMark));
    }, (err) => {
      console.warn('Firestore marks subscription notice, using cached marks:', err);
      const all = getMockMarksList();
      callback(all.filter(m => m.subjectCode === subjectCode));
    });`;
const t1_replace = `    let unsubscribeSnapshot = () => {};
    let isUnsubscribed = false;
    ensureFirebaseAuth().then((user) => {
      if (isUnsubscribed || !user) return;
      unsubscribeSnapshot = onSnapshot(q, (snapshot) => {
        callback(snapshot.docs.map(doc => doc.data() as ExamMark));
      }, (err) => {
        console.warn('Firestore marks subscription notice, using cached marks:', err);
        const all = getMockMarksList();
        callback(all.filter(m => m.subjectCode === subjectCode));
      });
    }).catch(console.warn);
    return () => {
      isUnsubscribed = true;
      unsubscribeSnapshot();
    };`;

code = code.replace(t1_find, t1_replace);

// Patch 2: subscribeToStudentMarks
const t2_find = `    return onSnapshot(q, (snapshot) => {
      callback(snapshot.docs.map(doc => doc.data() as ExamMark));
    }, (err) => {
      console.warn('Firestore student marks subscription notice:', err);
      callback(getMockMarksList().filter(m => m.studentId === studentId));
    });`;
const t2_replace = `    let unsubscribeSnapshot = () => {};
    let isUnsubscribed = false;
    ensureFirebaseAuth().then((user) => {
      if (isUnsubscribed || !user) return;
      unsubscribeSnapshot = onSnapshot(q, (snapshot) => {
        callback(snapshot.docs.map(doc => doc.data() as ExamMark));
      }, (err) => {
        console.warn('Firestore student marks subscription notice:', err);
        callback(getMockMarksList().filter(m => m.studentId === studentId));
      });
    }).catch(console.warn);
    return () => {
      isUnsubscribed = true;
      unsubscribeSnapshot();
    };`;

code = code.replace(t2_find, t2_replace);

// Patch 3: subscribeToClassMarks
const t3_find = `    return onSnapshot(q, (snapshot) => {
      callback(snapshot.docs.map(doc => doc.data() as ExamMark));
    }, (err) => {
      console.warn('Firestore class marks subscription notice:', err);
      callback(getMockMarksList());
    });`;
const t3_replace = `    let unsubscribeSnapshot = () => {};
    let isUnsubscribed = false;
    ensureFirebaseAuth().then((user) => {
      if (isUnsubscribed || !user) return;
      unsubscribeSnapshot = onSnapshot(q, (snapshot) => {
        callback(snapshot.docs.map(doc => doc.data() as ExamMark));
      }, (err) => {
        console.warn('Firestore class marks subscription notice:', err);
        callback(getMockMarksList());
      });
    }).catch(console.warn);
    return () => {
      isUnsubscribed = true;
      unsubscribeSnapshot();
    };`;

code = code.replace(t3_find, t3_replace);

if (!code.includes('ensureFirebaseAuth')) {
  code = code.replace("import { db } from '../firebase';", "import { db, ensureFirebaseAuth } from '../firebase';");
}

fs.writeFileSync('src/services/examService.ts', code);
