const fs = require('fs');
let code = fs.readFileSync('src/services/cloudDbService.ts', 'utf8');

const targets = [
  {
    find: `  try {
    const colRef = collection(db, CLOUD_COLLECTIONS.ATTENDANCE_REPORTS);
    return onSnapshot(
      colRef,
      (snap) => {`,
    replace: `  try {
    let unsubscribeSnapshot = () => {};
    let isUnsubscribed = false;

    ensureFirebaseAuth().then((user) => {
      if (isUnsubscribed || !user) return;
      const colRef = collection(db, CLOUD_COLLECTIONS.ATTENDANCE_REPORTS);
      unsubscribeSnapshot = onSnapshot(
        colRef,
        (snap) => {`
  },
  {
    find: `      (err) => {
        console.warn('Attendance reports subscription notice:', err);
      }
    );
  } catch (e) {`,
    replace: `      (err) => {
        console.warn('Attendance reports subscription notice:', err);
      }
    );
    }).catch(console.warn);

    return () => {
      isUnsubscribed = true;
      unsubscribeSnapshot();
    };
  } catch (e) {`
  },
  {
    find: `  try {
    const colRef = collection(db, CLOUD_COLLECTIONS.STUDENTS);
    return onSnapshot(
      colRef,
      (snap) => {`,
    replace: `  try {
    let unsubscribeSnapshot = () => {};
    let isUnsubscribed = false;

    ensureFirebaseAuth().then((user) => {
      if (isUnsubscribed || !user) return;
      const colRef = collection(db, CLOUD_COLLECTIONS.STUDENTS);
      unsubscribeSnapshot = onSnapshot(
        colRef,
        (snap) => {`
  },
  {
    find: `      (err) => {
        console.warn('Students subscription notice:', err);
      }
    );
  } catch (e) {`,
    replace: `      (err) => {
        console.warn('Students subscription notice:', err);
      }
    );
    }).catch(console.warn);

    return () => {
      isUnsubscribed = true;
      unsubscribeSnapshot();
    };
  } catch (e) {`
  }
];

targets.forEach(t => {
  code = code.replace(t.find, t.replace);
});

fs.writeFileSync('src/services/cloudDbService.ts', code);
