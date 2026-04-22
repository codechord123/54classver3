import React, { useState, useEffect } from "react";
import {
  Users,
  ClipboardList,
  CheckSquare,
  LogOut,
  ShieldCheck,
  UserCheck,
  Download,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  Circle,
  CalendarSearch,
  Shuffle,
  Trash2,
  Settings,
  Trophy,
  Key,
  Copy,
  Lock,
  Search,
  Coins,
  Target,
  Gift,
  Save,
  UserPlus,
  UserMinus,
  Unlock,
  MessageSquare,
  Send,
  ChevronDown,
  ChevronUp,
  BarChart,
  BookOpen,
  GripHorizontal,
  Star,
  MessageCircle,
  Mic,
  Headphones,
  LayoutDashboard,
  Medal,
} from "lucide-react";

// 파이어베이스 연동 (실제 배포용)
import { initializeApp } from "firebase/app";
import { getAuth, signInAnonymously, onAuthStateChanged } from "firebase/auth";
import { getFirestore, doc, setDoc, onSnapshot } from "firebase/firestore";

// =========================================================================
// 🚨 중요: 프로젝트 설정값
// =========================================================================
const firebaseConfig = {
  apiKey: "AIzaSyBQ_7DC07mQSC0QKJXrZw_HRVn87U9a1hc",
  authDomain: "w-program.firebaseapp.com",
  projectId: "w-program",
  storageBucket: "w-program.firebasestorage.app",
  messagingSenderId: "303408238032",
  appId: "1:303408238032:web:9d64cdf1a7069b2e3c3dd5",
  measurementId: "G-HRLZJEX2PM",
};

let app, auth, db;
try {
  app = initializeApp(firebaseConfig);
  auth = getAuth(app);
  db = getFirestore(app);
} catch (error) {
  console.error("Firebase 초기화 에러:", error);
}

export default function App() {
  // ---------------------------------------------------------
  // 1. 상태 관리
  // ---------------------------------------------------------
  const [dbUser, setDbUser] = useState(null);
  const [isDBLoaded, setIsDBLoaded] = useState(false);
  const [authStatus, setAuthStatus] = useState({ type: null, user: null });

  const [confirmModal, setConfirmModal] = useState(null);
  const [toastMsg, setToastMsg] = useState("");
  const [scoreModalStudent, setScoreModalStudent] = useState(null);
  const [selectedRoleStat, setSelectedRoleStat] = useState(null);

  const getLocalDateString = (d) => {
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(
      2,
      "0"
    )}-${String(d.getDate()).padStart(2, "0")}`;
  };

  const [selectedDate, setSelectedDate] = useState(
    getLocalDateString(new Date())
  );
  const ANONYMOUS_CUTOFF = new Date("2026-04-22T00:00:00+09:00").getTime();

  // 성별 매핑 데이터
  const genderMap = {
    가동민: "M",
    김선유: "M",
    김수형: "M",
    김예원: "F",
    김용훈: "M",
    김원준: "M",
    김주아: "F",
    김찬우: "M",
    김하영: "F",
    문서우: "F",
    박찬: "M",
    배한민: "M",
    유선재: "F",
    윤재익: "M",
    이다인: "F",
    이서이: "F",
    이서희: "F",
    이채연: "F",
    이혜강: "F",
    정지수: "M",
    조수아: "F",
    조이환: "M",
    최지완: "M",
    한민종: "M",
    홍아영: "F",
  };

  const defaultRoles = [
    "반장",
    "부반장",
    "아침 시간 관리자",
    "말차례 경청 지킴이",
    "학습&숙제 관리자 (남)",
    "학습&숙제 관리자 (여)",
    "쉬는 시간 정리 지킴이 A",
    "쉬는 시간 정리 지킴이 B",
    "테크 매니저 A",
    "테크 매니저 B",
    "우편 배달부",
    "창틀 환경 요정 A",
    "창틀 환경 요정 B",
    "청소함 관리자 A",
    "청소함 관리자 B",
    "쓰레기통 관리자",
    "분리수거 전문가 A",
    "분리수거 전문가 B",
    "에너지 보안관",
    "우유 지킴이",
    "급식 시간 질서 지킴이 A",
    "급식 시간 질서 지킴이 B",
    "도서 관리인 A",
    "거북이 독서 지킴이",
    "도서 관리인 B",
  ];

  const [rolePool, setRolePool] = useState(defaultRoles);
  const [localRolePool, setLocalRolePool] = useState(defaultRoles.join("\n"));
  const realNames = Object.keys(genderMap);

  const [teacherPassword, setTeacherPassword] = useState("05041106");
  const [students, setStudents] = useState(() => {
    return Array.from({ length: 25 }, (_, i) => ({
      id: i + 1,
      name: realNames[i] || `학생${i + 1}`,
      role: defaultRoles[i] || "역할 없음",
      password: "",
      isLocked: false,
      gender: genderMap[realNames[i]] || "M",
    }));
  });

  const [records, setRecords] = useState({});
  const [spentTokens, setSpentTokens] = useState({});
  const [spentClassGoldTokens, setSpentClassGoldTokens] = useState(0);

  const [suggestions, setSuggestions] = useState([]);
  const [suggestionTitle, setSuggestionTitle] = useState("");
  const [suggestionInput, setSuggestionInput] = useState("");
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [expandedSugId, setExpandedSugId] = useState(null);
  const [commentInputs, setCommentInputs] = useState({});

  const READING_GOAL = 1250;
  const CLASS_SCORE_GOAL = 1562500;
  const [booksRead, setBooksRead] = useState({});
  const [readingReports, setReadingReports] = useState([]);

  const [reportForm, setReportForm] = useState({
    title: "",
    author: "",
    publisher: "",
    scene: "",
    quote: "",
    summary: "",
    thoughts: "",
  });
  const [isReportAnonymous, setIsReportAnonymous] = useState(false);
  const [expandedReportId, setExpandedReportId] = useState(null);

  const [seatingTab, setSeatingTab] = useState("classroom");
  const [classroomSeating, setClassroomSeating] = useState(
    new Array(35).fill(null)
  );
  const [secretClassroomSeating, setSecretClassroomSeating] = useState(
    new Array(35).fill(null)
  );
  const [savedClassroomSeating, setSavedClassroomSeating] = useState({});
  const [seatingSaveName, setSeatingSaveName] = useState("");
  const [isSecretModalOpen, setIsSecretModalOpen] = useState(false);
  const [tempSecretSeating, setTempSecretSeating] = useState([]);

  const [classroomHistory, setClassroomHistory] = useState({});
  const [lunchHistory, setLunchHistory] = useState({});
  const [currentLunchBoys, setCurrentLunchBoys] = useState([]);
  const [currentLunchGirls, setCurrentLunchGirls] = useState([]);
  const [lunchDateInput, setLunchDateInput] = useState(
    getLocalDateString(new Date())
  );
  const [draggedClassroomIdx, setDraggedClassroomIdx] = useState(null);
  const [draggedLunchInfo, setDraggedLunchInfo] = useState(null);

  const [tokenManageStudent, setTokenManageStudent] = useState(null);
  const [manageGoldTokenOpen, setManageGoldTokenOpen] = useState(false);
  const [editTokenAmount, setEditTokenAmount] = useState(0);

  const [editingStudents, setEditingStudents] = useState(students);
  const [renameOldRole, setRenameOldRole] = useState("");
  const [renameNewRole, setRenameNewRole] = useState("");

  const defaultSilverRewards = {
    10: "간식 1개",
    20: "자리 우선 선택권",
    30: "숙제 면제권 1회",
    40: "음료수 교환권",
    50: "자유시간 10분",
    60: "음악 신청권",
    70: "보드게임 1회권",
    80: "선생님과 산책",
    90: "영화 감상권(개인)",
    100: "문화상품권 5천원",
  };
  const defaultGoldRewards = {
    10: "체육시간 10분 연장",
    20: "점심시간 10분 연장",
    30: "학급 보드게임 1시간",
    40: "아이스크림 파티",
    50: "영화 감상 (1교시)",
    60: "피자 파티",
    70: "숙제 없는 날",
    80: "체육대회",
    90: "야외 수업",
    100: "과자 파티 및 자율활동",
  };

  const [silverRewards, setSilverRewards] = useState(defaultSilverRewards);
  const [goldRewards, setGoldRewards] = useState(defaultGoldRewards);

  const [loginTab, setLoginTab] = useState("student");
  const [selectedId, setSelectedId] = useState(1);
  const [passwordInput, setPasswordInput] = useState("");
  const [error, setError] = useState("");

  const [teacherTab, setTeacherTab] = useState("overview");
  const [studentTab, setStudentTab] = useState("overview");
  const [studentReadingSubTab, setStudentReadingSubTab] = useState("write");
  const [scoreBoardDate, setScoreBoardDate] = useState(
    getLocalDateString(new Date())
  );

  // ---------------------------------------------------------
  // 2. DB 효과
  // ---------------------------------------------------------
  useEffect(() => {
    if (!auth) {
      setIsDBLoaded(true);
      return;
    }
    signInAnonymously(auth).catch(() => setIsDBLoaded(true));
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setDbUser(user);
      if (!user) setIsDBLoaded(true);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!dbUser || !db) return;
    const unsub = onSnapshot(
      doc(db, "classData", "mainState"),
      (snap) => {
        if (snap.exists()) {
          const data = snap.data();
          if (data.teacherPassword !== undefined)
            setTeacherPassword(String(data.teacherPassword));
          if (data.students && data.students.length > 0) {
            const mergedStudents = data.students.map((s) => ({
              ...s,
              isLocked: s.isLocked || false,
              gender: s.gender || genderMap[s.name] || "M",
            }));
            setStudents(mergedStudents);
            setEditingStudents(mergedStudents);
          }
          if (data.records) setRecords(data.records);
          if (data.spentTokens) setSpentTokens(data.spentTokens);
          if (data.spentClassGoldTokens !== undefined)
            setSpentClassGoldTokens(data.spentClassGoldTokens);
          if (data.silverRewards) setSilverRewards(data.silverRewards);
          if (data.goldRewards) setGoldRewards(data.goldRewards);
          if (data.rolePool) {
            setRolePool(data.rolePool);
            setLocalRolePool(data.rolePool.join("\n"));
          }
          if (data.suggestions) setSuggestions(data.suggestions);
          if (data.booksRead) setBooksRead(data.booksRead);
          if (data.readingReports) setReadingReports(data.readingReports);
          if (data.classroomSeating) setClassroomSeating(data.classroomSeating);
          if (data.secretClassroomSeating)
            setSecretClassroomSeating(data.secretClassroomSeating);
          if (data.savedClassroomSeating)
            setSavedClassroomSeating(data.savedClassroomSeating);
          if (data.classroomHistory) setClassroomHistory(data.classroomHistory);
          if (data.lunchHistory) setLunchHistory(data.lunchHistory);
        }
        setIsDBLoaded(true);
      },
      (error) => {
        console.error("데이터 불러오기 실패:", error);
        setIsDBLoaded(true);
      }
    );
    return () => unsub();
  }, [dbUser]);

  const saveToDB = async (updateObj) => {
    if (!dbUser || !db) return;
    try {
      await setDoc(doc(db, "classData", "mainState"), updateObj, {
        merge: true,
      });
    } catch (e) {
      showToast("데이터베이스 저장 실패");
    }
  };

  const showToast = (msg) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(""), 3000);
  };

  // ---------------------------------------------------------
  // 3. 로직 함수
  // ---------------------------------------------------------
  const getPoints = (val) => {
    if (val === true) return 1;
    if (typeof val === "string" && val.trim() !== "" && val !== "false") {
      if (val.startsWith("[-] ")) return -1;
      if (val.startsWith("[거북이] "))
        return parseInt(val.replace("[거북이] ", "")) || 0;
      return 1;
    }
    if (typeof val === "number") return val;
    return 0;
  };

  const getCumulativeScore = (studentId) => {
    let score = 0;
    Object.values(records || {}).forEach((dR) =>
      Object.values(dR || {}).forEach(
        (t) => (score += getPoints(t?.[studentId]))
      )
    );
    return score;
  };

  const getCombinedSpeakingListeningScore = (studentId) => {
    let score = 0;
    Object.values(records || {}).forEach((dR) =>
      Object.entries(dR || {}).forEach(([cId, tgts]) => {
        const val = tgts?.[studentId];
        if (val) {
          const pts = getPoints(val);
          if (
            cId === "teacher_speaking" ||
            cId === "teacher_listening" ||
            (typeof val === "string" &&
              (val.includes("말차례") || val.includes("경청")))
          )
            score += pts;
        }
      })
    );
    return score;
  };

  const getStudentTokenData = (studentId) => {
    const score = getCumulativeScore(studentId);
    const earnedSilverTokens = Math.floor(score / 25);
    const silverTokens = earnedSilverTokens - (spentTokens[studentId] || 0);
    const progressToNextSilver = score % 25;
    let nextRewardTier = Math.ceil((earnedSilverTokens + 1) / 10) * 10;
    if (earnedSilverTokens >= 100) nextRewardTier = 100;
    if (nextRewardTier === 0) nextRewardTier = 10;
    return {
      score,
      earnedSilverTokens,
      silverTokens,
      progressToNextSilver,
      nextRewardTier,
    };
  };

  const getClassTokenData = () => {
    let totalEarnedSilverTokens = 0;
    students.forEach((s) => {
      totalEarnedSilverTokens += Math.floor(getCumulativeScore(s.id) / 25);
    });
    const earnedGoldTokens = Math.floor(totalEarnedSilverTokens / 25);
    const availableGoldTokens = earnedGoldTokens - spentClassGoldTokens;
    return {
      totalSilverTokens: totalEarnedSilverTokens,
      earnedGoldTokens,
      availableGoldTokens,
      progressToNextGold: totalEarnedSilverTokens % 25,
      nextRewardTier: Math.min(
        Math.ceil((earnedGoldTokens + 1) / 10) * 10 || 10,
        100
      ),
    };
  };

  const getTotalBooksRead = () =>
    Object.values(booksRead || {}).reduce((acc, curr) => acc + curr, 0);

  const adjustTeacherReading = (studentId, delta) => {
    const current = booksRead[studentId] || 0;
    const newVal = Math.max(0, current + delta);
    const updated = { ...booksRead, [studentId]: newVal };
    setBooksRead(updated);
    saveToDB({ booksRead: updated });
    if (delta > 0) showToast("독서 마라톤 +1권 처리됨");
    if (delta < 0) showToast("독서 마라톤 -1권 차감됨");
  };

  const getDetailedScoresByDate = (targetStudentId, baseDateStr) => {
    const baseDate = new Date(baseDateStr);
    baseDate.setHours(0, 0, 0, 0);
    const diffToMon = baseDate.getDay() === 0 ? -6 : 1 - baseDate.getDay();
    const startOfWeek = new Date(baseDate);
    startOfWeek.setDate(baseDate.getDate() + diffToMon);
    startOfWeek.setHours(0, 0, 0, 0);
    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 6);
    endOfWeek.setHours(23, 59, 59, 999);
    const targetMonth = baseDate.getMonth();
    const targetYear = baseDate.getFullYear();

    let daily = 0,
      weekly = 0,
      monthly = 0,
      cumulative = 0;
    Object.entries(records || {}).forEach(([dateStr, dayRecord]) => {
      const parts = dateStr.split("-");
      if (parts.length !== 3) return;
      const recordDate = new Date(
        parseInt(parts[0]),
        parseInt(parts[1]) - 1,
        parseInt(parts[2])
      );
      recordDate.setHours(0, 0, 0, 0);
      let pointsThisDay = 0;
      Object.values(dayRecord || {}).forEach((targets) => {
        pointsThisDay += getPoints(targets?.[targetStudentId]);
      });
      if (pointsThisDay !== 0) {
        cumulative += pointsThisDay;
        if (dateStr === baseDateStr) daily += pointsThisDay;
        if (recordDate >= startOfWeek && recordDate <= endOfWeek)
          weekly += pointsThisDay;
        if (
          recordDate.getMonth() === targetMonth &&
          recordDate.getFullYear() === targetYear
        )
          monthly += pointsThisDay;
      }
    });
    return { daily, weekly, monthly, cumulative };
  };

  const getWeeklyScore = (studentId) =>
    getDetailedScoresByDate(studentId, getLocalDateString(new Date())).weekly;

  const getDailyDetails = (dateString, targetStudentId) => {
    const dayRecords = (records || {})[dateString] || {};
    let dailyScore = 0;
    let checkedBy = [];
    Object.entries(dayRecords || {}).forEach(([checkerId, targets]) => {
      const val = targets?.[targetStudentId];
      let pts = getPoints(val);
      let roleStr = "";
      if (
        checkerId === "teacher_racing" ||
        checkerId === "teacher_speaking" ||
        checkerId === "teacher_listening"
      )
        roleStr = `선생님 권한(${pts > 0 ? "+" : ""}${pts})`;
      else if (typeof val === "string" && val !== "false" && val !== "")
        roleStr = val.startsWith("[-] ")
          ? val.substring(4) + "(-1)"
          : val.startsWith("[거북이] ")
          ? `거북이 지킴이(${pts > 0 ? "+" : ""}${pts})`
          : val + "(+1)";
      else if (pts !== 0) roleStr = "이전 역할(기록됨)";
      if (pts !== 0 && roleStr) {
        dailyScore += pts;
        checkedBy.push(roleStr);
      }
    });
    return { dailyScore, checkedBy };
  };

  // --- 자리배치 로직 ---
  const gridStructure = [
    1, 1, 1, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 1, 1, 1, 1, 0, 0,
    0, 1, 1, 1, 1, 0, 0, 0, 1, 1,
  ];

  const getPrioritizedStudentsForSeating = (gender) => {
    let list = students.filter((s) => s.gender === gender);
    list.sort((a, b) => {
      const histA = classroomHistory[a.name] || {
        front: 0,
        middle: 0,
        back: 0,
      };
      const histB = classroomHistory[b.name] || {
        front: 0,
        middle: 0,
        back: 0,
      };
      let scoreA = histA.back * 1.5 - histA.front * 2 + (Math.random() * 2 - 1);
      let scoreB = histB.back * 1.5 - histB.front * 2 + (Math.random() * 2 - 1);
      return scoreB - scoreA;
    });
    return list;
  };

  const generateClassroomSeating = (e) => {
    if (
      e &&
      e.ctrlKey &&
      secretClassroomSeating &&
      secretClassroomSeating.length > 0 &&
      secretClassroomSeating.some((s) => s !== null)
    ) {
      setClassroomSeating(secretClassroomSeating);
      return;
    }
    let boys = getPrioritizedStudentsForSeating("M");
    let girls = getPrioritizedStudentsForSeating("F");
    let newSeats = new Array(35).fill(null);
    let isBoyTurn = true;
    for (let i = 0; i < 35; i++) {
      if (gridStructure[i] === 1) {
        if (isBoyTurn && boys.length > 0) newSeats[i] = boys.shift();
        else if (!isBoyTurn && girls.length > 0) newSeats[i] = girls.shift();
        else if (boys.length > 0) newSeats[i] = boys.shift();
        else newSeats[i] = girls.shift();
        isBoyTurn = !isBoyTurn;
      }
    }
    setClassroomSeating(newSeats);
    showToast("🎲 새로운 자리가 임시 배치되었습니다! (저장 필수)");
  };

  const saveClassroomLayout = () => {
    const nameToSave =
      seatingSaveName.trim() ||
      `${new Date().getMonth() + 1}월 ${new Date().getDate()}일 자리`;
    if (!classroomSeating || !classroomSeating.some((s) => s !== null))
      return showToast("⚠️ 자리를 먼저 뽑아주세요!");
    const newSaved = {
      ...savedClassroomSeating,
      [nameToSave]: classroomSeating,
    };
    const newHistory = { ...classroomHistory };
    students.forEach((s) => {
      if (!newHistory[s.name])
        newHistory[s.name] = { front: 0, middle: 0, back: 0 };
    });
    classroomSeating.forEach((student, index) => {
      if (!student) return;
      const rowNum = Math.floor(index / 7) + 1;
      if (!newHistory[student.name])
        newHistory[student.name] = { front: 0, middle: 0, back: 0 };
      if (rowNum <= 2) newHistory[student.name].front += 1;
      else if (rowNum === 3) newHistory[student.name].middle += 1;
      else newHistory[student.name].back += 1;
    });
    setSavedClassroomSeating(newSaved);
    setClassroomHistory(newHistory);
    saveToDB({ savedClassroomSeating: newSaved, classroomHistory: newHistory });
    setSeatingSaveName("");
    showToast(`💾 '${nameToSave}' 저장 및 통계 반영 완료!`);
  };

  const loadClassroomLayout = (name) => {
    if (savedClassroomSeating[name]) {
      setClassroomSeating(savedClassroomSeating[name]);
      showToast(`📂 '${name}' 불러왔습니다.`);
    }
  };

  const deleteClassroomLayout = (name) => {
    setConfirmModal({
      title: "교실 자리 삭제",
      message: `'${name}' 기록을 삭제하시겠습니까?`,
      onConfirm: () => {
        const newSaved = { ...savedClassroomSeating };
        delete newSaved[name];
        setSavedClassroomSeating(newSaved);
        saveToDB({ savedClassroomSeating: newSaved });
        setConfirmModal(null);
        showToast(`🗑️ 삭제되었습니다.`);
      },
    });
  };

  const clearClassroomHistory = () => {
    setConfirmModal({
      title: "교실 자리 통계 초기화",
      message:
        "교실 자리 누적 착석 통계를 초기화하시겠습니까?\n(저장된 자리 목록은 유지됩니다)",
      onConfirm: () => {
        setClassroomHistory({});
        saveToDB({ classroomHistory: {} });
        setConfirmModal(null);
        showToast("🗑️ 초기화되었습니다.");
      },
    });
  };

  const openSecretSeatingModal = () => {
    if (classroomSeating && classroomSeating.some((s) => s !== null))
      setTempSecretSeating([...classroomSeating]);
    else setTempSecretSeating(new Array(35).fill(null));
    setIsSecretModalOpen(true);
  };

  const saveSecretSeating = () => {
    setSecretClassroomSeating(tempSecretSeating);
    saveToDB({ secretClassroomSeating: tempSecretSeating });
    setIsSecretModalOpen(false);
    showToast(
      "🤫 몰래 자리가 저장되었습니다. Ctrl + 자리 뽑기로 불러올 수 있습니다."
    );
  };

  const getDerangedShuffle = (arr, prevArr) => {
    let shuffled = [...arr],
      maxAttempts = 200;
    while (maxAttempts > 0) {
      for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
      }
      let hasOverlap = false;
      if (prevArr && prevArr.length > 0) {
        for (let i = 0; i < shuffled.length; i++) {
          if (shuffled[i] && prevArr[i] && shuffled[i].id === prevArr[i].id) {
            hasOverlap = true;
            break;
          }
        }
      }
      if (!hasOverlap) break;
      maxAttempts--;
    }
    return shuffled;
  };

  const generateLunchSeating = () => {
    const defaultBoys = students.filter((s) => s.gender === "M"),
      defaultGirls = students.filter((s) => s.gender === "F");
    const dates = Object.keys(lunchHistory || {}).sort();
    if (dates.length > 0) {
      const lastDate = dates[dates.length - 1];
      setCurrentLunchBoys(
        getDerangedShuffle(defaultBoys, lunchHistory[lastDate].boys)
      );
      setCurrentLunchGirls(
        getDerangedShuffle(defaultGirls, lunchHistory[lastDate].girls)
      );
      showToast("🎲 이전 자리와 겹치지 않게 무작위로 배치했습니다.");
    } else {
      setCurrentLunchBoys(getDerangedShuffle(defaultBoys, null));
      setCurrentLunchGirls(getDerangedShuffle(defaultGirls, null));
      showToast("🎲 무작위로 초기 배치되었습니다.");
    }
  };

  const saveLunchSeating = () => {
    const nameToSave =
      lunchDateInput ||
      `${new Date().getMonth() + 1}월 ${new Date().getDate()}일`;
    if (currentLunchBoys.length === 0)
      return showToast("⚠️ 자리를 먼저 배치해주세요!");
    const newLunchHistory = {
      ...lunchHistory,
      [nameToSave]: { boys: currentLunchBoys, girls: currentLunchGirls },
    };
    setLunchHistory(newLunchHistory);
    saveToDB({ lunchHistory: newLunchHistory });
    showToast(`💾 ${nameToSave} 급식 자리가 저장되었습니다!`);
  };

  const loadSpecificLunchSeating = (dateStr) => {
    if (lunchHistory[dateStr]) {
      setCurrentLunchBoys(lunchHistory[dateStr].boys);
      setCurrentLunchGirls(lunchHistory[dateStr].girls);
      showToast(`📂 ${dateStr} 급식 자리를 불러왔습니다.`);
    }
  };

  const deleteSpecificLunchSeating = (dateStr) => {
    setConfirmModal({
      title: "급식 자리 삭제",
      message: `'${dateStr}' 기록을 삭제하시겠습니까?`,
      onConfirm: () => {
        const newHistory = { ...lunchHistory };
        delete newHistory[dateStr];
        setLunchHistory(newHistory);
        saveToDB({ lunchHistory: newHistory });
        setConfirmModal(null);
        showToast(`🗑️ 삭제되었습니다.`);
      },
    });
  };

  const clearLunchHistory = () => {
    setConfirmModal({
      title: "급식 자리 기록 초기화",
      message: "급식 자리 기록을 모두 지우시겠습니까?",
      onConfirm: () => {
        setLunchHistory({});
        setCurrentLunchBoys([]);
        setCurrentLunchGirls([]);
        saveToDB({ lunchHistory: {} });
        setConfirmModal(null);
        showToast("🗑️ 초기화되었습니다.");
      },
    });
  };

  const submitReadingReport = () => {
    const { title, author, publisher, scene, quote, summary, thoughts } =
      reportForm;
    if (!title.trim() || !author.trim() || !publisher.trim())
      return showToast("제목, 지은이, 출판사를 입력해주세요.");
    const totalLength =
      (scene || "").length +
      (quote || "").length +
      (summary || "").length +
      (thoughts || "").length;
    if (totalLength < 500)
      return showToast(
        `본문은 500자 이상이어야 합니다. (현재 ${totalLength}자) 🐢`
      );

    const s = students.find((x) => x.id === authStatus.user.id);
    const nR = {
      id: Date.now(),
      studentId: s.id,
      studentName: s.name,
      title: title.trim(),
      author: author.trim(),
      publisher: publisher.trim(),
      scene: scene.trim(),
      quote: quote.trim(),
      summary: summary.trim(),
      thoughts: thoughts.trim(),
      isAnonymous: isReportAnonymous,
      date: new Date().toLocaleString("ko-KR", {
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      }),
    };
    const nBooks = { ...booksRead, [s.id]: (booksRead[s.id] || 0) + 1 };
    setReadingReports([...readingReports, nR]);
    setBooksRead(nBooks);
    saveToDB({ readingReports: [...readingReports, nR], booksRead: nBooks });
    setReportForm({
      title: "",
      author: "",
      publisher: "",
      scene: "",
      quote: "",
      summary: "",
      thoughts: "",
    });
    setIsReportAnonymous(false);
    showToast("감상문이 등록되고 1권이 누적되었습니다! 🐢");
  };

  const deleteReadingReport = (id) => {
    setConfirmModal({
      title: "독서 감상문 삭제",
      message: "삭제하시겠습니까? (누적 권수는 유지됨)",
      onConfirm: () => {
        const updated = readingReports.filter((r) => r.id !== id);
        setReadingReports(updated);
        saveToDB({ readingReports: updated });
        setConfirmModal(null);
      },
    });
  };

  const submitSuggestion = () => {
    if (!suggestionTitle.trim() || !suggestionInput.trim())
      return showToast("제목과 내용을 모두 입력해주세요.");
    const myInfo = students.find((s) => s.id === authStatus.user.id);
    const newSug = {
      id: Date.now(),
      studentId: myInfo.id,
      studentName: myInfo.name,
      title: suggestionTitle.trim(),
      text: suggestionInput.trim(),
      isAnonymous: isAnonymous,
      comments: [],
      date: new Date().toLocaleString("ko-KR", {
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      }),
    };
    const updated = [...suggestions, newSug];
    setSuggestions(updated);
    saveToDB({ suggestions: updated });
    setSuggestionTitle("");
    setSuggestionInput("");
    setIsAnonymous(false);
    showToast(
      isAnonymous ? "비공개 의견이 전달되었습니다." : "의견이 등록되었습니다."
    );
  };

  const deleteSuggestion = (id) => {
    setConfirmModal({
      title: "게시글 삭제",
      message: "이 글을 완전히 삭제하시겠습니까?",
      onConfirm: () => {
        const updated = suggestions.filter((s) => s.id !== id);
        setSuggestions(updated);
        saveToDB({ suggestions: updated });
        setConfirmModal(null);
      },
    });
  };

  const submitComment = (sugId) => {
    const text = commentInputs[sugId]?.trim();
    if (!text) return;
    let authorName = "선생님",
      authorId = "teacher";
    if (authStatus.type === "student") {
      const myInfo = students.find((s) => s.id === authStatus.user.id);
      authorName = myInfo.name;
      authorId = myInfo.id;
    }
    const newComment = {
      id: Date.now(),
      studentId: authorId,
      studentName: authorName,
      text,
      date: new Date().toLocaleString("ko-KR", {
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      }),
    };
    const updated = suggestions.map((s) =>
      s.id === sugId
        ? { ...s, comments: [...(s.comments || []), newComment] }
        : s
    );
    setSuggestions(updated);
    saveToDB({ suggestions: updated });
    setCommentInputs({ ...commentInputs, [sugId]: "" });
  };

  const adjustTeacherScore = async (
    studentId,
    delta,
    overrideDate = null,
    category = "teacher_racing"
  ) => {
    const date = overrideDate || selectedDate || getLocalDateString(new Date());
    const checkerId = category;
    const currentVal = records[date]?.[checkerId]?.[studentId] || 0;
    const newVal = currentVal + delta;
    setRecords((prev) => {
      const dayData = prev[date] || {};
      const checkerData = dayData[checkerId] || {};
      return {
        ...prev,
        [date]: {
          ...dayData,
          [checkerId]: { ...checkerData, [studentId]: newVal },
        },
      };
    });
    if (dbUser && db) {
      try {
        await setDoc(
          doc(db, "classData", "mainState"),
          { records: { [date]: { [checkerId]: { [studentId]: newVal } } } },
          { merge: true }
        );
        if (delta > 0) showToast(`+1점 처리되었습니다.`);
        if (delta < 0) showToast(`-1점 처리되었습니다.`);
      } catch (e) {
        console.error(e);
      }
    }
  };

  const setPeerRecord = async (checkerId, checkerRole, targetId, point) => {
    const today = getLocalDateString(new Date());
    const currentVal = records[today]?.[checkerId]?.[targetId];
    let newVal = false;
    if (point === 1) newVal = currentVal === checkerRole ? false : checkerRole;
    else if (point === -1) {
      const minusRole = "[-] " + checkerRole;
      newVal = currentVal === minusRole ? false : minusRole;
    }
    setRecords((prev) => ({
      ...prev,
      [today]: {
        ...(prev[today] || {}),
        [checkerId]: {
          ...(prev[today]?.[checkerId] || {}),
          [targetId]: newVal,
        },
      },
    }));
    if (dbUser && db) {
      try {
        await setDoc(
          doc(db, "classData", "mainState"),
          { records: { [today]: { [checkerId]: { [targetId]: newVal } } } },
          { merge: true }
        );
      } catch (e) {
        console.error(e);
      }
    }
  };

  const setTurtleRecord = async (checkerId, targetId, newPts) => {
    const today = getLocalDateString(new Date());
    let newVal = false;
    if (newPts !== 0) newVal = `[거북이] ${newPts}`;
    setRecords((prev) => ({
      ...prev,
      [today]: {
        ...(prev[today] || {}),
        [checkerId]: {
          ...(prev[today]?.[checkerId] || {}),
          [targetId]: newVal,
        },
      },
    }));
    if (dbUser && db) {
      try {
        await setDoc(
          doc(db, "classData", "mainState"),
          { records: { [today]: { [checkerId]: { [targetId]: newVal } } } },
          { merge: true }
        );
      } catch (e) {
        console.error(e);
      }
    }
  };

  const getCheckerBreakdown = (targetStudentId) => {
    const breakdown = {};
    students.forEach((s) => {
      const rName = s.role || "역할 없음";
      if (!breakdown[rName]) breakdown[rName] = 0;
    });
    breakdown["선생님 권한 부여"] = 0;
    Object.values(records || {}).forEach((dayRecord) => {
      Object.entries(dayRecord || {}).forEach(([checkerId, targets]) => {
        const val = targets?.[targetStudentId];
        let pts = getPoints(val);
        let roleName = null;
        if (
          checkerId === "teacher_racing" ||
          checkerId === "teacher_speaking" ||
          checkerId === "teacher_listening"
        )
          roleName = "선생님 권한 부여";
        else if (typeof val === "string" && val !== "false" && val !== "")
          roleName = val.startsWith("[-] ")
            ? val.substring(4)
            : val.startsWith("[거북이] ")
            ? "거북이 독서 지킴이"
            : val;
        else if (pts !== 0) {
          const checker = students.find((s) => s.id === parseInt(checkerId));
          if (checker) roleName = checker.role;
          else roleName = "이전 역할(기록됨)";
        }
        if (pts !== 0 && roleName) {
          if (breakdown[roleName] !== undefined) breakdown[roleName] += pts;
          else breakdown[roleName] = pts;
        }
      });
    });
    return breakdown;
  };

  const handleEditStudent = (index, field, value) => {
    setEditingStudents((prev) => {
      const newData = [...prev];
      newData[index] = { ...newData[index], [field]: value };
      return newData;
    });
  };
  const handleRemoveStudent = (index) => {
    setConfirmModal({
      title: "학생 삭제",
      message: "삭제하시겠습니까?",
      onConfirm: () => {
        setEditingStudents((prev) => prev.filter((_, i) => i !== index));
        setConfirmModal(null);
      },
    });
  };
  const handleAddStudent = () => {
    const maxId =
      editingStudents.length > 0
        ? Math.max(...editingStudents.map((s) => parseInt(s.id) || 0))
        : 0;
    setEditingStudents([
      ...editingStudents,
      {
        id: maxId + 1,
        name: "",
        role: "예비 도우미",
        password: Math.floor(1000 + Math.random() * 9000).toString(),
        isLocked: false,
        gender: "M",
      },
    ]);
    showToast("전입생이 추가되었습니다.");
  };

  const handleRenameFromPalette = (oldRole) => {
    const newRolePrompt = window.prompt(
      `'${oldRole}'의 새로운 역할을 입력하세요:\n(입력 시 관련된 모든 명단 및 기록이 자동 연동됩니다)`,
      oldRole
    );
    if (
      newRolePrompt &&
      newRolePrompt.trim() !== "" &&
      newRolePrompt !== oldRole
    ) {
      const newRole = newRolePrompt.trim();
      const updatedStudents = editingStudents.map((s) =>
        s.role === oldRole ? { ...s, role: newRole } : s
      );
      setEditingStudents(updatedStudents);
      setStudents(updatedStudents);
      const updatedPool = rolePool.map((r) => (r === oldRole ? newRole : r));
      setRolePool(updatedPool);
      setLocalRolePool(updatedPool.join("\n"));

      const updatedRecords = JSON.parse(JSON.stringify(records || {}));
      Object.keys(updatedRecords).forEach((date) => {
        Object.keys(updatedRecords[date]).forEach((checkerId) => {
          Object.keys(updatedRecords[date][checkerId]).forEach((targetId) => {
            const val = updatedRecords[date][checkerId][targetId];
            if (val === oldRole)
              updatedRecords[date][checkerId][targetId] = newRole;
            else if (val === "[-] " + oldRole)
              updatedRecords[date][checkerId][targetId] = "[-] " + newRole;
          });
        });
      });
      setRecords(updatedRecords);
      saveToDB({
        students: updatedStudents,
        rolePool: updatedPool,
        records: updatedRecords,
      });
      showToast(`'${oldRole}'이(가) '${newRole}'(으)로 연동 변경되었습니다.`);
    }
  };

  const executeRoleRename = () => {
    if (!renameOldRole || !renameNewRole.trim())
      return showToast("변경할 역할을 입력하세요.");
    const oldName = renameOldRole;
    const newName = renameNewRole.trim();
    setConfirmModal({
      title: "역할명 연동 변경",
      message: `'${oldName}' 역할을 '${newName}'(으)로 변경하시겠습니까?`,
      onConfirm: () => {
        const updatedStudents = editingStudents.map((s) =>
          s.role === oldName ? { ...s, role: newName } : s
        );
        setEditingStudents(updatedStudents);
        setStudents(updatedStudents);
        const updatedPool = rolePool.map((r) => (r === oldName ? newName : r));
        setRolePool(updatedPool);
        setLocalRolePool(updatedPool.join("\n"));
        const updatedRecords = JSON.parse(JSON.stringify(records || {}));
        Object.keys(updatedRecords).forEach((date) => {
          Object.keys(updatedRecords[date]).forEach((checkerId) => {
            Object.keys(updatedRecords[date][checkerId]).forEach((targetId) => {
              const val = updatedRecords[date][checkerId][targetId];
              if (val === oldName)
                updatedRecords[date][checkerId][targetId] = newName;
              else if (val === "[-] " + oldName)
                updatedRecords[date][checkerId][targetId] = "[-] " + newName;
            });
          });
        });
        setRecords(updatedRecords);
        saveToDB({
          students: updatedStudents,
          rolePool: updatedPool,
          records: updatedRecords,
        });
        setRenameOldRole("");
        setRenameNewRole("");
        setConfirmModal(null);
        showToast(`성공적으로 변경되었습니다.`);
      },
    });
  };

  const saveStudentSettings = () => {
    setStudents(editingStudents);
    saveToDB({ students: editingStudents });
    showToast("명단/역할 저장 완료!");
  };
  const saveRolePool = () => {
    const newPool = localRolePool
      .split("\n")
      .map((r) => r.trim())
      .filter((r) => r !== "");
    setRolePool(newPool);
    saveToDB({ rolePool: newPool });
    showToast("목록 업데이트 완료.");
  };

  const resetAllRecords = () => {
    setConfirmModal({
      title: "전체 초기화",
      message: "⚠️ 모든 기록이 초기화됩니다. 계속하시겠습니까?",
      onConfirm: () => {
        const initialStudents = Array.from({ length: 25 }, (_, i) => ({
          id: i + 1,
          name: realNames[i] || `학생${i + 1}`,
          role: defaultRoles[i] || "역할 없음",
          password: "",
          isLocked: false,
          gender: genderMap[realNames[i]] || "M",
        }));
        setStudents(initialStudents);
        setEditingStudents(initialStudents);
        setRecords({});
        setSpentTokens({});
        setSpentClassGoldTokens(0);
        setSuggestions([]);
        setBooksRead({});
        setReadingReports([]);
        setSavedClassroomSeating({});
        setClassroomHistory({});
        setLunchHistory({});
        saveToDB({
          records: {},
          spentTokens: {},
          spentClassGoldTokens: 0,
          students: initialStudents,
          suggestions: [],
          booksRead: {},
          readingReports: [],
          savedClassroomSeating: {},
          classroomHistory: {},
          lunchHistory: {},
        });
        setConfirmModal(null);
        showToast("전체 데이터 초기화 완료.");
      },
    });
  };

  const requestShuffleRoles = () => {
    setConfirmModal({
      title: "역할 랜덤 배정",
      message: "학생들의 역할이 무작위로 섞입니다.",
      onConfirm: executeShuffleRoles,
    });
  };
  const executeShuffleRoles = () => {
    const lockedStudents = editingStudents.filter((s) => s.isLocked);
    const unlockedStudents = editingStudents.filter((s) => !s.isLocked);
    const lockedRoles = lockedStudents.map((s) => s.role);
    const currentUnlockedRoles = unlockedStudents.map((s) => s.role);
    let availableRoles = [...rolePool];
    lockedRoles.forEach((lr) => {
      const idx = availableRoles.indexOf(lr);
      if (idx !== -1) availableRoles.splice(idx, 1);
    });
    while (availableRoles.length < unlockedStudents.length)
      availableRoles.push("예비 도우미");
    let rolesToShuffle = availableRoles.slice(0, unlockedStudents.length);
    let newRoles = [];
    let isValid = false;
    let attempts = 0;
    while (!isValid && attempts < 1000) {
      newRoles = [...rolesToShuffle];
      for (let i = newRoles.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [newRoles[i], newRoles[j]] = [newRoles[j], newRoles[i]];
      }
      isValid = true;
      for (let i = 0; i < unlockedStudents.length; i++) {
        if (newRoles[i] === currentUnlockedRoles[i]) {
          isValid = false;
          break;
        }
      }
      attempts++;
    }
    let unlockedIdx = 0;
    const newStudents = editingStudents.map((s) => {
      if (s.isLocked) return s;
      return { ...s, role: newRoles[unlockedIdx++] };
    });
    setEditingStudents(newStudents);
    setConfirmModal(null);
    showToast(`역할 배정 완료! (저장 버튼을 눌러야 확정됩니다)`);
  };

  const generatePasswords = () => {
    setConfirmModal({
      title: "비밀번호 생성",
      message: "기존 비번이 지워지고 새로 생성됩니다.",
      onConfirm: () => {
        const newStudents = editingStudents.map((s) => ({
          ...s,
          password: Math.floor(1000 + Math.random() * 9000).toString(),
        }));
        setEditingStudents(newStudents);
        setConfirmModal(null);
        showToast("비번 생성 완료! ('저장'을 눌러야 확정됩니다)");
      },
    });
  };

  const copyToClipboard = () => {
    const text = students
      .map((s) => `${s.id}번\t${s.name}\t${s.role}\t${s.password}`)
      .join("\n");
    const fullText = "번호\t이름\t1인1역\t접속비밀번호(ID)\n" + text;
    const textArea = document.createElement("textarea");
    textArea.value = fullText;
    document.body.appendChild(textArea);
    textArea.select();
    try {
      document.execCommand("copy");
      showToast("✅ 복사 완료!");
    } catch (err) {
      showToast("복사 실패");
    }
    document.body.removeChild(textArea);
  };

  const changeTeacherPassword = (newPw) => {
    if (newPw.trim() === "") return;
    setTeacherPassword(newPw);
    saveToDB({ teacherPassword: newPw });
    showToast("비밀번호 변경 완료.");
  };

  const handleRewardChange = (type, tier, value) => {
    if (type === "silver") {
      const newRewards = { ...silverRewards, [tier]: value };
      setSilverRewards(newRewards);
      saveToDB({ silverRewards: newRewards });
    } else {
      const newRewards = { ...goldRewards, [tier]: value };
      setGoldRewards(newRewards);
      saveToDB({ goldRewards: newRewards });
    }
  };

  const logout = () => {
    setAuthStatus({ type: null, user: null });
    setPasswordInput("");
  };

  const handleDragStartStudent = (e, index) => {
    e.dataTransfer.setData("sourceIndex", index);
  };
  const handleDragStartRolePool = (e, roleName) => {
    e.dataTransfer.setData("sourceRoleName", roleName);
  };
  const handleDropStudent = (e, targetIndex) => {
    e.preventDefault();
    const sourceIndex = e.dataTransfer.getData("sourceIndex");
    const sourceRoleName = e.dataTransfer.getData("sourceRoleName");
    if (sourceIndex !== "") {
      const srcIdx = parseInt(sourceIndex, 10);
      if (srcIdx === targetIndex) return;
      const newStudents = [...editingStudents];
      const tempRole = newStudents[srcIdx].role;
      newStudents[srcIdx].role = newStudents[targetIndex].role;
      newStudents[targetIndex].role = tempRole;
      setEditingStudents(newStudents);
      showToast("🔄 학생 간 역할 교환됨 (저장 필수).");
    } else if (sourceRoleName) {
      const newStudents = [...editingStudents];
      newStudents[targetIndex].role = sourceRoleName;
      setEditingStudents(newStudents);
      showToast(`✨ 역할 변경됨 (저장 필수).`);
    }
  };

  // --- 공통 렌더링 컴포넌트 ---
  const renderStatusDashboard = () => {
    const tScore = students.reduce(
      (sum, s) => sum + getCumulativeScore(s.id),
      0
    );
    const avgScore = Math.round(tScore / students.length) || 0;
    const tBooks = getTotalBooksRead();
    const cData = getClassTokenData();

    return (
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6 animate-in slide-in-from-bottom-2">
        <div className="bg-blue-500 p-4 rounded-xl shadow-sm text-white flex flex-col justify-center">
          <div className="text-[11px] opacity-90 flex items-center gap-1 mb-2">
            <Trophy className="w-3.5 h-3.5" /> 학급 총 누적 점수
          </div>
          <div className="text-2xl font-black">{tScore.toLocaleString()}점</div>
          <div className="text-[10px] opacity-75 mt-1 hidden md:block">
            목표 {CLASS_SCORE_GOAL.toLocaleString()}점 중
          </div>
        </div>
        <div className="bg-yellow-500 p-4 rounded-xl shadow-sm text-white flex flex-col justify-center">
          <div className="text-[11px] opacity-90 flex items-center gap-1 mb-2">
            <Coins className="w-3.5 h-3.5" /> 학급 골드 토큰
          </div>
          <div className="text-2xl font-black">
            {cData.availableGoldTokens}개
          </div>
          <div className="text-[10px] opacity-75 mt-1">
            누적 {cData.earnedGoldTokens}개
          </div>
        </div>
        <div className="bg-emerald-500 p-4 rounded-xl shadow-sm text-white flex flex-col justify-center">
          <div className="text-[11px] opacity-90 flex items-center gap-1 mb-2">
            <BookOpen className="w-3.5 h-3.5" /> 학급 책 읽기
          </div>
          <div className="text-2xl font-black">{tBooks}권</div>
          <div className="text-[10px] opacity-75 mt-1 hidden md:block">
            목표 {READING_GOAL.toLocaleString()}권 중
          </div>
        </div>
        <div className="bg-purple-500 p-4 rounded-xl shadow-sm text-white flex flex-col justify-center">
          <div className="text-[11px] opacity-90 flex items-center gap-1 mb-2">
            <Medal className="w-3.5 h-3.5" /> 1인당 평균 점수
          </div>
          <div className="text-2xl font-black">{avgScore}점</div>
          <div className="text-[10px] opacity-75 mt-1 hidden md:block">
            지속적으로 올려보세요!
          </div>
        </div>
      </div>
    );
  };

  const renderRankingOverview = () => {
    const getTop5 = (arr, fn) =>
      [...arr].sort((a, b) => fn(b) - fn(a)).slice(0, 5);
    const catData = [
      {
        title: "전체 상점 Top5",
        icon: Trophy,
        color: "blue",
        data: getTop5(students, (s) => getCumulativeScore(s.id)),
        unit: "점",
        fn: (s) => getCumulativeScore(s.id),
      },
      {
        title: "이번주 상점 Top5",
        icon: Target,
        color: "indigo",
        data: getTop5(
          students,
          (s) =>
            getDetailedScoresByDate(s.id, getLocalDateString(new Date())).weekly
        ),
        unit: "점",
        fn: (s) =>
          getDetailedScoresByDate(s.id, getLocalDateString(new Date())).weekly,
      },
      {
        title: "독서 마라톤 Top5",
        icon: BookOpen,
        color: "emerald",
        data: getTop5(students, (s) => booksRead[s.id] || 0),
        unit: "권",
        fn: (s) => booksRead[s.id] || 0,
      },
      {
        title: "말차례·경청 Top5",
        icon: Mic,
        color: "orange",
        data: getTop5(students, (s) => getCombinedSpeakingListeningScore(s.id)),
        unit: "점",
        fn: (s) => getCombinedSpeakingListeningScore(s.id),
      },
    ];

    return (
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6 animate-in slide-in-from-bottom-3">
        {catData.map((cat, idx) => {
          const Icon = cat.icon;
          return (
            <div
              key={idx}
              className={`bg-white p-3 rounded-xl shadow-sm border border-${cat.color}-200`}
            >
              <h3
                className={`text-[11px] font-black flex items-center gap-1.5 mb-2.5 text-${cat.color}-800`}
              >
                <Icon className={`w-3.5 h-3.5 text-${cat.color}-500`} />{" "}
                {cat.title}
              </h3>
              <div className="space-y-1.5">
                {cat.data.map((s, idx2) => (
                  <div
                    key={s.id}
                    className={`flex justify-between items-center p-1.5 rounded border bg-${cat.color}-50/50 border-${cat.color}-50`}
                  >
                    <div className="flex items-center gap-1.5">
                      <span
                        className={`w-4 h-4 flex items-center justify-center rounded-full text-[8px] font-black ${
                          idx2 < 3
                            ? `bg-${
                                ["yellow", "slate", "orange"][idx2]
                              }-400 text-white`
                            : "bg-gray-200 text-gray-500"
                        }`}
                      >
                        {idx2 + 1}
                      </span>
                      <span className="font-bold text-[10px] text-gray-700">
                        {s.name}
                      </span>
                    </div>
                    <span
                      className={`font-black text-[10px] text-${cat.color}-700`}
                    >
                      {cat.fn(s)}
                      {cat.unit}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  const renderTurtleMarathonDisplay = () => {
    const totalBooks = getTotalBooksRead();
    const progress = Math.min((totalBooks / READING_GOAL) * 100, 100);
    return (
      <div className="bg-white p-4 rounded-xl shadow-sm border border-emerald-200 relative overflow-hidden mb-5">
        <div className="absolute top-0 right-0 p-3 opacity-5">
          <BookOpen className="w-24 h-24 text-emerald-800" />
        </div>
        <div className="relative z-10">
          <h3 className="text-sm font-black text-emerald-800 flex items-center gap-1.5 mb-1">
            <BookOpen className="w-4 h-4" /> 거북이 독서 마라톤 현황 🐢
          </h3>
          <p className="text-xs font-bold text-emerald-600 mb-3">
            학급 목표: {READING_GOAL.toLocaleString()}권 (현재 {totalBooks}권
            달성!)
          </p>
          <div className="relative w-full h-8 bg-emerald-100 rounded-full border-[2px] border-emerald-300 mt-1 shadow-inner overflow-hidden">
            <div
              className="absolute inset-0 opacity-50"
              style={{
                backgroundImage:
                  'url("data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAiIGhlaWdodD0iMjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGNpcmNsZSBjeD0iMSIgY3k9IjEwIiByPSIxIiBmaWxsPSIjYTRkNGNjIi8+PC9zdmc+")',
              }}
            />
            <div
              className="absolute top-0 left-0 h-full bg-gradient-to-r from-emerald-400 to-emerald-500 transition-all duration-1000 ease-out shadow-md"
              style={{ width: `${progress}%` }}
            />
            <div className="absolute top-1/2 -translate-y-1/2 right-2 text-base z-10 drop-shadow-md">
              🏁
            </div>
            <div
              className="absolute top-1/2 -translate-y-1/2 text-xl transition-all duration-1000 ease-out z-20 drop-shadow-lg"
              style={{ left: `max(5px, calc(${progress}% - 24px))` }}
            >
              🐢
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderStudentReadingStatus = () => {
    const sortedStudents = [...students].sort((a, b) => a.id - b.id);
    const maxBooks = Math.max(...Object.values(booksRead || {}), 5);
    return (
      <div className="bg-white rounded-xl shadow-sm border border-emerald-200 mb-6 overflow-hidden">
        <h3 className="text-xs font-black text-emerald-800 flex items-center gap-1.5 p-2.5 bg-emerald-50 border-b border-emerald-100">
          <BookOpen className="w-3.5 h-3.5 text-emerald-500" /> 학생별 책 읽기
          기여도
        </h3>
        <div className="overflow-y-auto max-h-64 custom-scrollbar">
          <table className="w-full text-[10px] md:text-xs text-left border-collapse">
            <thead className="bg-gray-50 border-b text-gray-500 sticky top-0 z-10">
              <tr>
                <th className="p-2 text-center w-10">번호</th>
                <th className="p-2 w-16">이름</th>
                <th className="p-2 w-16 text-center">읽은 권수</th>
                <th className="p-2">기여도 그래프</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {sortedStudents.map((s) => {
                const books = booksRead[s.id] || 0;
                const pct = Math.min((books / maxBooks) * 100, 100);
                return (
                  <tr key={s.id} className="hover:bg-emerald-50/20">
                    <td className="p-2 text-center font-bold text-gray-500">
                      {s.id}
                    </td>
                    <td className="p-2 font-bold text-gray-800">{s.name}</td>
                    <td className="p-2 text-center font-black text-emerald-600">
                      {books}권
                    </td>
                    <td className="p-2">
                      <div className="flex items-center w-full max-w-xs gap-1.5">
                        <div className="w-2 h-2 rounded-full bg-emerald-500 shrink-0"></div>
                        <div className="w-full bg-gray-100 rounded-full h-1.5 overflow-hidden">
                          <div
                            className="bg-emerald-400 h-full rounded-full transition-all duration-500"
                            style={{ width: `${pct}%` }}
                          ></div>
                        </div>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  const renderReadingReportCard = (report, isTeacher, myInfoId) => {
    const isExpanded = expandedReportId === report.id;
    return (
      <div
        key={report.id}
        className={`bg-white border rounded-xl p-3 cursor-pointer transition-all ${
          isExpanded
            ? "border-teal-400 shadow-md col-span-1 md:col-span-2"
            : "border-teal-100 shadow-sm hover:border-teal-300"
        }`}
      >
        <div
          onClick={() => setExpandedReportId(isExpanded ? null : report.id)}
          className="flex justify-between items-start gap-2 mb-1.5"
        >
          <div className="flex-1">
            <h4 className="font-bold text-teal-900 text-sm truncate">
              {report.title}
            </h4>
            <span className="text-[10px] font-black text-teal-600 mt-0.5 inline-block">
              {report.isAnonymous && (
                <span className="mr-1 text-red-600">[비공개]</span>
              )}{" "}
              {report.studentName}
            </span>
          </div>
          <div className="flex items-center gap-1.5 shrink-0">
            <span className="text-[9px] text-gray-400 hidden sm:inline-block">
              {report.date}
            </span>
            {isExpanded ? (
              <ChevronUp className="w-4 h-4 text-gray-400" />
            ) : (
              <ChevronDown className="w-4 h-4 text-gray-400" />
            )}
          </div>
        </div>
        {isExpanded && (
          <div
            className="mt-3 pt-3 border-t border-teal-50 animate-in fade-in"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="grid grid-cols-2 gap-3 mb-3 bg-gray-50 p-3 rounded-lg border border-gray-100">
              <div>
                <span className="text-[10px] font-bold text-teal-700">
                  지은이
                </span>
                <p className="text-[11px] font-medium text-gray-800 mt-0.5">
                  {report.author}
                </p>
              </div>
              <div>
                <span className="text-[10px] font-bold text-teal-700">
                  출판사
                </span>
                <p className="text-[11px] font-medium text-gray-800 mt-0.5">
                  {report.publisher}
                </p>
              </div>
            </div>
            <div className="space-y-3 bg-teal-50/30 p-3 rounded-lg border border-teal-100">
              <div>
                <span className="text-[10px] font-bold text-teal-700 block mb-0.5">
                  🎬 인상 깊은 장면
                </span>
                <p className="text-[11px] text-gray-700 whitespace-pre-wrap leading-relaxed">
                  {report.scene}
                </p>
              </div>
              <div className="border-t border-teal-100 pt-1.5">
                <span className="text-[10px] font-bold text-teal-700 block mb-0.5">
                  ✍️ 기억에 남는 문장
                </span>
                <p className="text-[11px] text-gray-700 whitespace-pre-wrap leading-relaxed italic">
                  "{report.quote}"
                </p>
              </div>
              <div className="border-t border-teal-100 pt-1.5">
                <span className="text-[10px] font-bold text-teal-700 block mb-0.5">
                  📖 줄거리
                </span>
                <p className="text-[11px] text-gray-700 whitespace-pre-wrap leading-relaxed">
                  {report.summary}
                </p>
              </div>
              <div className="border-t border-teal-100 pt-1.5">
                <span className="text-[10px] font-bold text-teal-700 block mb-0.5">
                  💡 느낀점
                </span>
                <p className="text-[11px] text-gray-700 whitespace-pre-wrap leading-relaxed">
                  {report.thoughts}
                </p>
              </div>
            </div>
            {(isTeacher || report.studentId === myInfoId) && (
              <div className="mt-3 flex justify-end">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    deleteReadingReport(report.id);
                  }}
                  className="text-red-500 bg-red-50 px-2 py-1 rounded-md text-[10px] font-bold hover:bg-red-100 transition-colors flex items-center gap-1"
                >
                  <Trash2 className="w-3 h-3" /> 삭제
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    );
  };

  const renderSuggestionCard = (sug, isTeacher, myInfoId) => {
    const isEx = expandedSugId === sug.id;
    const isForceAnonymous = sug.id <= ANONYMOUS_CUTOFF;
    const isPri = sug.isAnonymous || isForceAnonymous;
    const displayName = isTeacher
      ? `${sug.studentName} (${sug.studentId}번)`
      : isPri
      ? "나의 비공개 의견"
      : `${sug.studentName}`;
    const commentCount = (sug.comments || []).length;

    return (
      <div
        key={sug.id}
        className={`bg-white border rounded-lg p-2.5 cursor-pointer ${
          isEx ? "border-blue-400 shadow-sm" : "hover:border-blue-200"
        }`}
      >
        <div
          onClick={() => setExpandedSugId(isEx ? null : sug.id)}
          className="flex justify-between items-center gap-2"
        >
          <div className="flex items-center gap-2 flex-1 overflow-hidden">
            <span
              className={`text-[9px] font-black px-1.5 py-0.5 rounded shrink-0 ${
                isPri
                  ? "bg-red-100 text-red-800"
                  : "bg-indigo-100 text-indigo-800"
              }`}
            >
              {isPri && <span className="text-red-600 mr-0.5">[비공개]</span>}{" "}
              {displayName}
            </span>
            <span className="font-bold text-xs truncate text-gray-800 flex-1">
              {sug.title}
            </span>
          </div>
          <div className="flex items-center gap-1 shrink-0">
            {commentCount > 0 && (
              <span className="text-[9px] font-bold text-purple-600 flex items-center gap-0.5">
                <MessageCircle className="w-3 h-3" /> {commentCount}
              </span>
            )}
            <span className="text-[8px] text-gray-400 hidden sm:inline-block">
              {sug.date}
            </span>
            {(isTeacher || sug.studentId === myInfoId) && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  deleteSuggestion(sug.id);
                }}
                className="text-gray-300 hover:text-red-500 p-0.5 rounded"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            )}
            {isEx ? (
              <ChevronUp className="w-3.5 h-3.5 text-gray-400" />
            ) : (
              <ChevronDown className="w-3.5 h-3.5 text-gray-400" />
            )}
          </div>
        </div>
        {isEx && (
          <div
            className="mt-2 pt-2 border-t text-[11px]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="bg-gray-50 p-2 rounded whitespace-pre-wrap leading-relaxed">
              {sug.text}
            </div>
            <div className="mt-2 bg-purple-50/50 p-2 rounded border border-purple-100">
              <h5 className="font-bold text-purple-800 mb-1">
                💬 댓글 ({commentCount})
              </h5>
              <div className="space-y-1 mb-2 max-h-24 overflow-y-auto">
                {(sug.comments || []).map((c) => (
                  <div
                    key={c.id}
                    className="bg-white p-1 rounded border text-[9px]"
                  >
                    <span
                      className={`font-bold mr-1 ${
                        c.studentId === "teacher"
                          ? "text-red-600"
                          : "text-purple-700"
                      }`}
                    >
                      {c.studentName}:
                    </span>
                    {c.text}
                  </div>
                ))}
              </div>
              <div className="flex gap-1">
                <input
                  type="text"
                  value={commentInputs[sug.id] || ""}
                  onChange={(e) =>
                    setCommentInputs({
                      ...commentInputs,
                      [sug.id]: e.target.value,
                    })
                  }
                  placeholder="댓글 달기..."
                  className="flex-1 p-1 border rounded outline-none"
                  onKeyDown={(e) => e.key === "Enter" && submitComment(sug.id)}
                />
                <button
                  onClick={() => submitComment(sug.id)}
                  className="bg-purple-600 text-white px-2 py-1 rounded font-bold"
                >
                  등록
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  // ---------------------------------------------------------
  // 로그인 렌더링
  // ---------------------------------------------------------
  if (!authStatus.type) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
        <div className="bg-white w-full max-w-sm rounded-2xl shadow-xl overflow-hidden">
          <div className="bg-blue-700 p-6 text-center text-white">
            <Trophy className="w-10 h-10 mx-auto mb-2 text-yellow-300" />
            <h1 className="text-xl font-black">스마트 학급 관리</h1>
          </div>
          <div className="flex border-b border-gray-200 text-sm">
            <button
              onClick={() => {
                setLoginTab("student");
                setError("");
              }}
              className={`flex-1 py-3 font-bold ${
                loginTab === "student"
                  ? "text-blue-700 border-b-2 border-blue-700"
                  : "text-gray-500 bg-gray-50"
              }`}
            >
              학생
            </button>
            <button
              onClick={() => {
                setLoginTab("teacher");
                setError("");
              }}
              className={`flex-1 py-3 font-bold ${
                loginTab === "teacher"
                  ? "text-blue-700 border-b-2 border-blue-700"
                  : "text-gray-500 bg-gray-50"
              }`}
            >
              선생님
            </button>
          </div>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              setError("");
              if (loginTab === "teacher") {
                if (
                  passwordInput === teacherPassword ||
                  passwordInput === "05041106"
                )
                  setAuthStatus({ type: "teacher", user: null });
                else setError("비밀번호 오류");
              } else {
                const s = students.find((x) => x.id === parseInt(selectedId));
                if (!s || !s.password) {
                  setError("접속 비번이 아직 설정되지 않았습니다.");
                  return;
                }
                if (s && String(s.password).trim() === passwordInput.trim()) {
                  setSelectedDate(getLocalDateString(new Date()));
                  setAuthStatus({ type: "student", user: s });
                } else setError("아이디(비번) 오류");
              }
            }}
            className="p-6 space-y-4"
          >
            {loginTab === "student" && (
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  번호(이름)
                </label>
                <select
                  value={selectedId}
                  onChange={(e) => setSelectedId(e.target.value)}
                  className="w-full p-2.5 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 outline-none text-sm font-bold"
                >
                  {students.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.id}번 {s.name}
                    </option>
                  ))}
                </select>
              </div>
            )}
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">
                비밀번호
              </label>
              <input
                type="password"
                value={passwordInput}
                onChange={(e) => setPasswordInput(e.target.value)}
                className="w-full p-2.5 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 outline-none text-sm"
              />
            </div>
            {error && (
              <p className="text-red-500 text-xs font-bold text-center bg-red-50 py-1 rounded">
                {error}
              </p>
            )}
            <button
              type="submit"
              className="w-full bg-blue-700 text-white font-bold py-2.5 rounded hover:bg-blue-800"
            >
              접속하기
            </button>
          </form>
        </div>
      </div>
    );
  }

  // ---------------------------------------------------------
  // 학생 대시보드 렌더링
  // ---------------------------------------------------------
  if (authStatus.type === "student") {
    const myInfo = students.find((s) => s.id === authStatus.user.id);
    const myRole = myInfo?.role || "";
    const todayStr = getLocalDateString(new Date());

    const canCheckToday = true;
    const { score, silverTokens, progressToNextSilver, nextRewardTier } =
      getStudentTokenData(myInfo.id);

    if (!myRole || myRole === "역할 없음") {
      return (
        <div className="min-h-screen bg-gray-50 p-6 flex flex-col items-center justify-center text-center">
          <ShieldCheck className="w-16 h-16 text-gray-400 mb-4" />
          <h2 className="text-2xl font-bold text-gray-800 mb-2">
            아직 부여된 역할이 없습니다!
          </h2>
          <button
            type="button"
            onClick={logout}
            className="px-6 py-2 bg-gray-200 text-gray-700 font-bold rounded-lg mt-4 flex items-center gap-2"
          >
            <LogOut className="w-4 h-4" /> 로그아웃
          </button>
        </div>
      );
    }

    const visibleSuggestions = suggestions.filter((s) => {
      const isForceAnonymous = s.id <= ANONYMOUS_CUTOFF;
      const isActuallyAnonymous = s.isAnonymous || isForceAnonymous;
      return !isActuallyAnonymous || s.studentId === myInfo.id;
    });

    const publicReports = readingReports.filter((r) => !r.isAnonymous);

    return (
      <div className="min-h-screen bg-slate-100 p-2 md:p-4 text-gray-800">
        <div className="max-w-4xl mx-auto flex flex-col h-full min-h-[95vh] bg-white rounded-xl shadow-lg overflow-hidden">
          <header className="bg-blue-700 text-white p-3 flex justify-between items-center shrink-0">
            <div className="flex items-center gap-2">
              <UserCheck className="w-8 h-8 text-blue-200 bg-blue-800 p-1.5 rounded-full" />
              <div>
                <h1 className="text-sm font-black">
                  {myInfo.id}번 {myInfo.name}
                </h1>
                <p className="text-xs font-bold text-blue-200">
                  역할:{" "}
                  <span className="bg-blue-100 text-blue-800 px-1 rounded">
                    {myInfo.role}
                  </span>
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="text-right">
                <p className="text-[9px] text-blue-300 font-bold">보유 실버</p>
                <p className="text-base font-black text-yellow-400 leading-none">
                  {silverTokens}개
                </p>
              </div>
              <button
                onClick={logout}
                className="bg-blue-800 p-2 rounded-lg hover:bg-blue-900"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          </header>

          <div className="flex border-b border-gray-200 bg-gray-50 text-xs font-bold sticky top-0 z-40 shadow-sm">
            <button
              onClick={() => setStudentTab("overview")}
              className={`flex-1 py-2.5 ${
                studentTab === "overview"
                  ? "text-blue-700 border-b-2 border-blue-600 bg-white"
                  : "text-gray-500"
              }`}
            >
              📊 개요
            </button>
            <button
              onClick={() => setStudentTab("role_check")}
              className={`flex-1 py-2.5 ${
                studentTab === "role_check"
                  ? "text-blue-700 border-b-2 border-blue-600 bg-white"
                  : "text-gray-500"
              }`}
            >
              ✅ 1인1역
            </button>
            <button
              onClick={() => setStudentTab("reading")}
              className={`flex-1 py-2.5 ${
                studentTab === "reading"
                  ? "text-emerald-700 border-b-2 border-emerald-600 bg-white"
                  : "text-gray-500"
              }`}
            >
              🐢 독서
            </button>
            <button
              onClick={() => setStudentTab("suggestions")}
              className={`flex-1 py-2.5 ${
                studentTab === "suggestions"
                  ? "text-purple-700 border-b-2 border-purple-600 bg-white"
                  : "text-gray-500"
              }`}
            >
              💬 건의
            </button>
          </div>

          <div className="p-3 md:p-5 overflow-y-auto bg-slate-50 flex-1">
            {studentTab === "overview" && (
              <div className="animate-in fade-in space-y-4">
                {renderTurtleMarathonDisplay()}
                {renderStatusDashboard()}
                <div className="bg-white p-4 rounded-xl shadow-sm mb-4 border border-gray-200">
                  <div className="flex justify-between text-xs font-bold text-gray-500 mb-1">
                    <span>나의 실버 획득 게이지 ({score}점)</span>
                    <span>{progressToNextSilver} / 25점</span>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden mb-2">
                    <div
                      className="bg-blue-500 h-full transition-all"
                      style={{ width: `${(progressToNextSilver / 25) * 100}%` }}
                    ></div>
                  </div>
                  <p className="text-[10px] text-center font-bold text-blue-700 bg-blue-50 py-1 rounded">
                    🎯 {nextRewardTier}실버 목표:{" "}
                    {silverRewards[nextRewardTier]}
                  </p>
                </div>
                <h2 className="text-sm font-black text-gray-800 mb-1">
                  우리반 랭킹 현황
                </h2>
                {renderRankingOverview()}
              </div>
            )}

            {studentTab === "role_check" && (
              <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 animate-in fade-in text-center">
                <h3 className="text-sm font-black mb-1">오늘 역할 점검표</h3>
                <p className="text-[10px] text-gray-500 mb-4">
                  +1점 또는 -1점을 클릭하세요.
                </p>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2">
                  {students.map((target) => {
                    const rVal = records[todayStr]?.[myInfo.id]?.[target.id];
                    let turtlePts = 0;
                    if (
                      typeof rVal === "string" &&
                      rVal.startsWith("[거북이] ")
                    ) {
                      turtlePts = parseInt(rVal.replace("[거북이] ", "")) || 0;
                    }
                    const isPlus =
                      rVal === myInfo.role &&
                      myInfo.role !== "거북이 지킴이" &&
                      myInfo.role !== "거북이 독서 지킴이";
                    const isMinus =
                      rVal === "[-] " + myInfo.role &&
                      myInfo.role !== "거북이 지킴이" &&
                      myInfo.role !== "거북이 독서 지킴이";

                    return (
                      <div
                        key={target.id}
                        className={`relative p-2 rounded-lg border flex flex-col items-center ${
                          isPlus
                            ? "bg-blue-50 border-blue-300"
                            : isMinus
                            ? "bg-red-50 border-red-300"
                            : turtlePts !== 0
                            ? "bg-emerald-50 border-emerald-300"
                            : "bg-white border-gray-200 shadow-sm hover:border-gray-300"
                        }`}
                      >
                        <span
                          className={`absolute top-1 left-1 text-[8px] font-bold px-1 py-0.5 rounded ${
                            isPlus
                              ? "bg-blue-700 text-blue-100"
                              : isMinus
                              ? "bg-red-700 text-red-100"
                              : turtlePts !== 0
                              ? "bg-emerald-700 text-emerald-100"
                              : "bg-gray-100 text-gray-500"
                          }`}
                        >
                          {target.id}
                        </span>
                        <span
                          className={`text-xs font-black mt-3 mb-1 truncate w-full text-center ${
                            isPlus
                              ? "text-blue-800"
                              : isMinus
                              ? "text-red-800"
                              : turtlePts !== 0
                              ? "text-emerald-800"
                              : "text-gray-800"
                          }`}
                        >
                          {target.name}
                        </span>

                        {myRole.includes("반장") && (
                          <span
                            className={`text-[8px] font-bold px-1 py-0.5 rounded truncate w-full text-center mb-1 ${
                              isPlus
                                ? "bg-blue-500 text-blue-100"
                                : isMinus
                                ? "bg-red-500 text-red-100"
                                : "bg-indigo-50 text-indigo-600"
                            }`}
                          >
                            {target.role || "없음"}
                          </span>
                        )}

                        {myRole === "거북이 독서 지킴이" ? (
                          <div className="flex items-center justify-between w-full mt-1 bg-emerald-50 rounded p-0.5 border border-emerald-200">
                            <button
                              disabled={!canCheckToday}
                              onClick={() =>
                                adjustTeacherReading(target.id, -1)
                              }
                              className="w-5 h-5 bg-white border border-emerald-300 rounded text-emerald-600 font-bold hover:bg-emerald-100"
                            >
                              -
                            </button>
                            <span className="font-black text-emerald-700 text-xs">
                              {booksRead[target.id] || 0}권
                            </span>
                            <button
                              disabled={!canCheckToday}
                              onClick={() => adjustTeacherReading(target.id, 1)}
                              className="w-5 h-5 bg-white border border-emerald-300 rounded text-emerald-600 font-bold hover:bg-emerald-100"
                            >
                              +
                            </button>
                          </div>
                        ) : myRole === "거북이 지킴이" ? (
                          <div className="flex items-center justify-between w-full mt-1 bg-gray-50 rounded p-0.5 border border-gray-200">
                            <button
                              disabled={!canCheckToday}
                              onClick={() =>
                                setTurtleRecord(
                                  myInfo.id,
                                  target.id,
                                  turtlePts - 1
                                )
                              }
                              className="w-5 h-5 bg-white border rounded text-gray-600 font-bold"
                            >
                              -
                            </button>
                            <span className="font-black text-emerald-700 text-xs">
                              {turtlePts > 0 ? `+${turtlePts}` : turtlePts}
                            </span>
                            <button
                              disabled={!canCheckToday}
                              onClick={() =>
                                setTurtleRecord(
                                  myInfo.id,
                                  target.id,
                                  turtlePts + 1
                                )
                              }
                              className="w-5 h-5 bg-white border rounded text-gray-600 font-bold"
                            >
                              +
                            </button>
                          </div>
                        ) : (
                          <div className="flex gap-1 mt-1 w-full">
                            <button
                              disabled={!canCheckToday}
                              onClick={() =>
                                setPeerRecord(myInfo.id, myRole, target.id, 1)
                              }
                              className={`flex-1 py-1 text-[10px] font-bold rounded ${
                                isPlus
                                  ? "bg-blue-600 text-white"
                                  : "bg-gray-100 text-gray-500 hover:bg-blue-100"
                              }`}
                            >
                              +1
                            </button>
                            <button
                              disabled={!canCheckToday}
                              onClick={() =>
                                setPeerRecord(myInfo.id, myRole, target.id, -1)
                              }
                              className={`flex-1 py-1 text-[10px] font-bold rounded ${
                                isMinus
                                  ? "bg-red-500 text-white"
                                  : "bg-gray-100 text-gray-500 hover:bg-red-100"
                              }`}
                            >
                              -1
                            </button>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {studentTab === "reading" && (
              <div className="animate-in fade-in space-y-4">
                <div className="flex gap-2">
                  <button
                    onClick={() => setStudentReadingSubTab("write")}
                    className={`flex-1 py-2 text-xs font-bold rounded-lg transition-colors border ${
                      studentReadingSubTab === "write"
                        ? "bg-emerald-600 text-white border-emerald-600"
                        : "bg-white text-gray-600 border-gray-200"
                    }`}
                  >
                    마라톤 현황 및 작성
                  </button>
                  <button
                    onClick={() => setStudentReadingSubTab("board")}
                    className={`flex-1 py-2 text-xs font-bold rounded-lg transition-colors border ${
                      studentReadingSubTab === "board"
                        ? "bg-teal-600 text-white border-teal-600"
                        : "bg-white text-gray-600 border-gray-200"
                    }`}
                  >
                    독서 게시판 보기
                  </button>
                </div>

                {studentReadingSubTab === "write" && (
                  <div className="space-y-4 animate-in slide-in-from-left-2">
                    {renderTurtleMarathonDisplay()}
                    <div className="bg-emerald-50 p-4 rounded-xl border border-emerald-200 shadow-sm">
                      <h4 className="text-xs font-bold text-emerald-800 mb-3 flex items-center gap-1.5">
                        <Star className="w-4 h-4" /> 감상문 쓰고 마라톤 1권
                        누적하기 (500자 이상)
                      </h4>
                      <div className="space-y-2">
                        <input
                          type="text"
                          value={reportForm.title}
                          onChange={(e) =>
                            setReportForm({
                              ...reportForm,
                              title: e.target.value,
                            })
                          }
                          placeholder="책 제목"
                          className="w-full p-2 text-xs rounded border outline-none focus:border-emerald-400 bg-white"
                        />
                        <div className="flex gap-2">
                          <input
                            type="text"
                            value={reportForm.author}
                            onChange={(e) =>
                              setReportForm({
                                ...reportForm,
                                author: e.target.value,
                              })
                            }
                            placeholder="지은이"
                            className="w-full p-2 text-xs rounded border outline-none focus:border-emerald-400 bg-white"
                          />
                          <input
                            type="text"
                            value={reportForm.publisher}
                            onChange={(e) =>
                              setReportForm({
                                ...reportForm,
                                publisher: e.target.value,
                              })
                            }
                            placeholder="출판사"
                            className="w-full p-2 text-xs rounded border outline-none focus:border-emerald-400 bg-white"
                          />
                        </div>

                        <div className="relative">
                          <span className="absolute top-1.5 left-2 text-[9px] font-bold text-emerald-700 bg-emerald-100 px-1 rounded">
                            인상 깊은 장면
                          </span>
                          <textarea
                            value={reportForm.scene}
                            onChange={(e) =>
                              setReportForm({
                                ...reportForm,
                                scene: e.target.value,
                              })
                            }
                            className="w-full p-2 pt-6 text-xs rounded border outline-none focus:border-emerald-400 h-16 resize-none bg-white"
                          ></textarea>
                        </div>
                        <div className="relative">
                          <span className="absolute top-1.5 left-2 text-[9px] font-bold text-emerald-700 bg-emerald-100 px-1 rounded">
                            기억에 남는 문장
                          </span>
                          <textarea
                            value={reportForm.quote}
                            onChange={(e) =>
                              setReportForm({
                                ...reportForm,
                                quote: e.target.value,
                              })
                            }
                            className="w-full p-2 pt-6 text-xs rounded border outline-none focus:border-emerald-400 h-16 resize-none bg-white"
                          ></textarea>
                        </div>
                        <div className="relative">
                          <span className="absolute top-1.5 left-2 text-[9px] font-bold text-emerald-700 bg-emerald-100 px-1 rounded">
                            줄거리 요약
                          </span>
                          <textarea
                            value={reportForm.summary}
                            onChange={(e) =>
                              setReportForm({
                                ...reportForm,
                                summary: e.target.value,
                              })
                            }
                            className="w-full p-2 pt-6 text-xs rounded border outline-none focus:border-emerald-400 h-24 resize-none bg-white"
                          ></textarea>
                        </div>
                        <div className="relative">
                          <span className="absolute top-1.5 left-2 text-[9px] font-bold text-emerald-700 bg-emerald-100 px-1 rounded">
                            나의 느낀점
                          </span>
                          <textarea
                            value={reportForm.thoughts}
                            onChange={(e) =>
                              setReportForm({
                                ...reportForm,
                                thoughts: e.target.value,
                              })
                            }
                            className="w-full p-2 pt-6 text-xs rounded border outline-none focus:border-emerald-400 h-24 resize-none bg-white mb-2"
                          ></textarea>
                        </div>

                        <div
                          className={`text-right text-[10px] font-bold ${
                            (reportForm.scene || "").length +
                              (reportForm.quote || "").length +
                              (reportForm.summary || "").length +
                              (reportForm.thoughts || "").length >=
                            500
                              ? "text-emerald-600"
                              : "text-red-500"
                          }`}
                        >
                          현재{" "}
                          {(reportForm.scene || "").length +
                            (reportForm.quote || "").length +
                            (reportForm.summary || "").length +
                            (reportForm.thoughts || "").length}{" "}
                          / 500자
                        </div>
                        <div className="flex justify-between items-center mt-2">
                          <label className="flex items-center gap-1.5 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={isReportAnonymous}
                              onChange={(e) =>
                                setIsReportAnonymous(e.target.checked)
                              }
                              className="w-3 h-3 text-emerald-600 rounded"
                            />
                            <span className="text-[10px] font-bold text-emerald-700">
                              비공개 (선생님만 보기)
                            </span>
                          </label>
                          <button
                            onClick={submitReadingReport}
                            className={`text-white font-bold py-1.5 px-4 rounded text-[10px] shadow-sm transition-colors ${
                              (reportForm.scene || "").length +
                                (reportForm.quote || "").length +
                                (reportForm.summary || "").length +
                                (reportForm.thoughts || "").length >=
                              500
                                ? "bg-emerald-500 hover:bg-emerald-600"
                                : "bg-gray-400 cursor-not-allowed"
                            }`}
                          >
                            제출하고 1권 추가
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {studentReadingSubTab === "board" && (
                  <div className="bg-white p-4 rounded-xl border border-teal-200 shadow-sm animate-in slide-in-from-right-2">
                    <h4 className="text-sm font-bold text-teal-800 mb-3 flex items-center gap-1.5">
                      <ClipboardList className="w-4 h-4" /> 공개된 독서 감상문
                    </h4>
                    <div className="space-y-2.5 max-h-[60vh] overflow-y-auto pr-1 custom-scrollbar">
                      {publicReports.length === 0 ? (
                        <div className="text-xs text-gray-400 text-center py-6">
                          공개된 감상문이 없습니다.
                        </div>
                      ) : (
                        [...publicReports]
                          .reverse()
                          .map((report) =>
                            renderReadingReportCard(report, false, myInfo.id)
                          )
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}

            {studentTab === "suggestions" && (
              <div className="animate-in fade-in space-y-4">
                <div className="bg-white p-4 rounded-xl border border-purple-200 shadow-sm">
                  <h4 className="text-sm font-bold text-purple-800 mb-3 flex items-center gap-1.5">
                    <MessageSquare className="w-4 h-4" /> 학급 건의 게시판
                    (토론)
                  </h4>
                  <div className="space-y-2.5 max-h-[50vh] overflow-y-auto pr-1 mb-4 custom-scrollbar">
                    {visibleSuggestions.length === 0 ? (
                      <p className="text-center text-gray-400 py-4 text-xs font-medium">
                        등록된 의견이 없습니다.
                      </p>
                    ) : (
                      [...visibleSuggestions]
                        .reverse()
                        .map((sug) =>
                          renderSuggestionCard(sug, false, myInfo.id)
                        )
                    )}
                  </div>
                  <div className="bg-gray-50 p-3 rounded-xl border border-gray-200">
                    <input
                      type="text"
                      value={suggestionTitle}
                      onChange={(e) => setSuggestionTitle(e.target.value)}
                      placeholder="제목"
                      className="w-full p-2 text-xs border rounded-lg mb-2 font-bold outline-none focus:border-purple-400"
                    />
                    <textarea
                      value={suggestionInput}
                      onChange={(e) => setSuggestionInput(e.target.value)}
                      placeholder="내용"
                      className="w-full p-2 text-xs border rounded-lg mb-2 resize-none h-12 outline-none focus:border-purple-400"
                    ></textarea>
                    <div className="flex justify-between items-center">
                      <label className="flex items-center gap-1.5 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={isAnonymous}
                          onChange={(e) => setIsAnonymous(e.target.checked)}
                          className="w-3.5 h-3.5"
                        />
                        <span className="text-[10px] font-bold text-gray-600">
                          비공개
                        </span>
                      </label>
                      <button
                        onClick={submitSuggestion}
                        className="bg-purple-600 text-white px-3 py-1.5 text-xs font-bold rounded-lg shadow-sm"
                      >
                        게시하기
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // ---------------------------------------------------------
  // 8. 선생님 대시보드 렌더링
  // ---------------------------------------------------------
  return (
    <div className="min-h-screen bg-gray-100 p-2 md:p-3 font-sans text-gray-800 flex justify-center">
      <div className="w-full max-w-7xl bg-white rounded-xl shadow-lg flex flex-col h-[98vh] overflow-hidden">
        <header className="bg-slate-900 text-white p-3 flex justify-between items-center shrink-0">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-blue-400" />
            <div>
              <h1 className="text-sm md:text-base font-bold">
                스마트 학급 관리 시스템
              </h1>
              <p className="text-slate-400 text-[10px] mt-0.5">
                클라우드 동기화 완료
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="bg-slate-800 border border-slate-700 rounded-md p-1 px-2 flex items-center gap-2">
              <Coins className="w-3.5 h-3.5 text-yellow-400" />
              <div className="leading-tight">
                <p className="text-[8px] text-slate-400 font-bold">학급 골드</p>
                <p className="font-black text-yellow-400 text-sm leading-tight">
                  {getClassTokenData().availableGoldTokens}개
                </p>
              </div>
              <button
                onClick={() => {
                  setEditTokenAmount(spentClassGoldTokens);
                  setManageGoldTokenOpen(true);
                }}
                className="bg-yellow-500/20 text-yellow-400 hover:bg-yellow-500/40 px-1.5 py-0.5 rounded text-[9px] font-bold transition-colors"
              >
                관리
              </button>
            </div>
            <button
              type="button"
              onClick={logout}
              className="bg-slate-700 hover:bg-slate-600 p-1.5 rounded"
            >
              <LogOut className="w-3.5 h-3.5" />
            </button>
          </div>
        </header>

        <div className="flex border-b border-gray-200 bg-gray-50 overflow-x-auto custom-scrollbar shrink-0 text-[10px] md:text-xs sticky top-0 z-40 shadow-sm">
          <button
            onClick={() => setTeacherTab("overview")}
            className={`flex-1 min-w-[70px] py-2.5 font-bold flex items-center justify-center gap-1 ${
              teacherTab === "overview"
                ? "text-blue-700 border-b-2 border-blue-600 bg-white"
                : "text-gray-500 hover:bg-gray-100"
            }`}
          >
            📊 개요
          </button>
          <button
            onClick={() => setTeacherTab("main_seating")}
            className={`flex-1 min-w-[80px] py-2.5 font-bold flex items-center justify-center gap-1 ${
              teacherTab === "main_seating"
                ? "text-indigo-700 border-b-2 border-indigo-600 bg-white"
                : "text-gray-500 hover:bg-gray-100"
            }`}
          >
            🏫 자리/급식
          </button>
          <button
            onClick={() => setTeacherTab("token_dashboard")}
            className={`flex-1 min-w-[80px] py-2.5 font-bold flex items-center justify-center gap-1 ${
              teacherTab === "token_dashboard"
                ? "text-blue-700 border-b-2 border-blue-600 bg-white"
                : "text-gray-500 hover:bg-gray-100"
            }`}
          >
            🏆 명단/점수
          </button>
          <button
            onClick={() => setTeacherTab("role_stats")}
            className={`flex-1 min-w-[80px] py-2.5 font-bold flex items-center justify-center gap-1 ${
              teacherTab === "role_stats"
                ? "text-blue-700 border-b-2 border-blue-600 bg-white"
                : "text-gray-500 hover:bg-gray-100"
            }`}
          >
            ⭐ 역할통계
          </button>
          <button
            onClick={() => setTeacherTab("daily_records")}
            className={`flex-1 min-w-[70px] py-2.5 font-bold flex items-center justify-center gap-1 ${
              teacherTab === "daily_records"
                ? "text-slate-800 border-b-2 border-slate-600 bg-white"
                : "text-gray-500 hover:bg-gray-100"
            }`}
          >
            ✅ 일일점검
          </button>
          <button
            onClick={() => setTeacherTab("suggestions")}
            className={`flex-1 min-w-[80px] py-2.5 font-bold flex items-center justify-center gap-1 ${
              teacherTab === "suggestions"
                ? "text-purple-700 border-b-2 border-purple-600 bg-white"
                : "text-gray-500 hover:bg-gray-100"
            }`}
          >
            💬 건의게시판
          </button>
          <button
            onClick={() => setTeacherTab("reading_reports")}
            className={`flex-1 min-w-[80px] py-2.5 font-bold flex items-center justify-center gap-1 ${
              teacherTab === "reading_reports"
                ? "text-emerald-700 border-b-2 border-emerald-600 bg-white"
                : "text-gray-500 hover:bg-gray-100"
            }`}
          >
            🐢 독서감상문
          </button>
          <button
            onClick={() => setTeacherTab("settings")}
            className={`flex-1 min-w-[60px] py-2.5 font-bold flex items-center justify-center gap-1 ${
              teacherTab === "settings"
                ? "text-slate-800 border-b-2 border-slate-600 bg-white"
                : "text-gray-500 hover:bg-gray-100"
            }`}
          >
            <Settings className="w-3 h-3" /> 설정
          </button>
        </div>

        <div className="p-3 overflow-auto bg-slate-50 flex-1">
          {teacherTab === "overview" && (
            <div className="space-y-4 animate-in fade-in duration-300 max-w-5xl mx-auto">
              {renderTurtleMarathonDisplay()}
              {renderStatusDashboard()}
              {renderStudentReadingStatus()}
              <h2 className="text-sm font-black text-gray-800 mb-2 mt-4">
                선생님 요약 대시보드 (랭킹)
              </h2>
              {renderRankingOverview()}
            </div>
          )}

          {teacherTab === "main_seating" && (
            <div className="animate-in fade-in duration-300 max-w-5xl mx-auto space-y-4">
              <div className="flex justify-center space-x-2 mb-2">
                <button
                  onClick={() => setSeatingTab("classroom")}
                  className={`px-5 py-2 rounded-full font-bold text-xs border transition ${
                    seatingTab === "classroom"
                      ? "bg-indigo-600 text-white border-indigo-600 shadow"
                      : "bg-white text-gray-500 border-gray-200"
                  }`}
                >
                  🏫 교실 자리
                </button>
                <button
                  onClick={() => setSeatingTab("lunch")}
                  className={`px-5 py-2 rounded-full font-bold text-xs border transition ${
                    seatingTab === "lunch"
                      ? "bg-orange-500 text-white border-orange-500 shadow"
                      : "bg-white text-gray-500 border-gray-200"
                  }`}
                >
                  🍲 급식 자리
                </button>
              </div>

              {seatingTab === "classroom" && (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
                  <div className="lg:col-span-2 bg-white p-4 rounded-xl shadow-sm border border-gray-200 flex flex-col h-[520px]">
                    <div className="flex justify-between items-center mb-3 shrink-0">
                      <div>
                        <h2 className="text-sm font-black text-gray-800">
                          교실 자리 배치
                        </h2>
                        <p className="text-[9px] text-gray-500 mt-0.5">
                          Ctrl+자리뽑기 시 몰래 설정한 자리가 배정됩니다.
                        </p>
                      </div>
                      <div className="flex gap-1 items-center bg-gray-50 p-1 rounded-lg border border-gray-200">
                        <button
                          onClick={(e) => generateClassroomSeating(e)}
                          className="px-2 py-1.5 bg-indigo-600 text-white rounded text-[10px] font-bold hover:bg-indigo-700 whitespace-nowrap"
                        >
                          🎲 자리 뽑기
                        </button>
                        <div className="w-px h-5 bg-gray-300 mx-0.5"></div>
                        <input
                          type="text"
                          value={seatingSaveName}
                          onChange={(e) => setSeatingSaveName(e.target.value)}
                          placeholder="저장 이름(4월21일)"
                          className="px-1.5 py-1 text-[10px] rounded border outline-none w-24"
                        />
                        <button
                          onClick={saveClassroomLayout}
                          className="px-2 py-1.5 bg-teal-600 text-white rounded text-[10px] font-bold hover:bg-teal-700 whitespace-nowrap"
                        >
                          💾 저장
                        </button>
                      </div>
                    </div>
                    <div className="w-full flex justify-center mb-4 shrink-0">
                      <div className="w-1/2 py-1.5 bg-gray-700 text-white text-center rounded-lg font-bold text-[10px] shadow-inner">
                        교 탁
                      </div>
                    </div>
                    <div className="grid grid-cols-7 gap-1.5 flex-1 items-center">
                      {classroomSeating.map((student, index) => {
                        if (gridStructure[index] === 0)
                          return <div key={index}></div>;
                        return (
                          <div
                            key={index}
                            draggable
                            onDragStart={() => setDraggedClassroomIdx(index)}
                            onDragOver={(e) => e.preventDefault()}
                            onDrop={(e) => {
                              e.preventDefault();
                              if (
                                draggedClassroomIdx !== null &&
                                draggedClassroomIdx !== index
                              ) {
                                const newArr = [...classroomSeating];
                                const temp = newArr[draggedClassroomIdx];
                                newArr[draggedClassroomIdx] = newArr[index];
                                newArr[index] = temp;
                                setClassroomSeating(newArr);
                              }
                            }}
                            className={`relative p-1.5 rounded-lg flex flex-col items-center justify-center border aspect-[4/3] cursor-grab active:cursor-grabbing hover:scale-105 transition-transform ${
                              !student
                                ? "bg-gray-50 border-dashed border-gray-300"
                                : student.gender === "M"
                                ? "bg-blue-50 border-blue-200"
                                : "bg-pink-50 border-pink-200"
                            }`}
                          >
                            {student && (
                              <>
                                <span className="absolute top-0.5 left-1 text-[7px] text-gray-400 font-bold">
                                  {Math.floor(index / 7) + 1}줄
                                </span>
                                <span
                                  className={`text-[10px] font-bold ${
                                    student.gender === "M"
                                      ? "text-blue-800"
                                      : "text-pink-800"
                                  }`}
                                >
                                  {student.name}
                                </span>
                              </>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  <div className="bg-white p-3 rounded-xl shadow-sm border border-gray-200 flex flex-col h-[520px] gap-3">
                    <div className="flex-1 flex flex-col min-h-0">
                      <h2 className="text-[11px] font-black mb-1.5 flex items-center gap-1 text-indigo-700">
                        📂 저장된 자리 목록
                      </h2>
                      <div className="overflow-y-auto flex-1 custom-scrollbar border border-gray-100 rounded bg-gray-50 p-1 space-y-1">
                        {Object.keys(savedClassroomSeating || {}).length ===
                        0 ? (
                          <div className="text-gray-400 text-center py-4 text-[9px]">
                            저장된 자리가 없습니다.
                          </div>
                        ) : (
                          Object.keys(savedClassroomSeating || {}).map(
                            (name) => (
                              <div
                                key={name}
                                className="flex justify-between items-center bg-white p-1 rounded shadow-sm border border-gray-100 hover:border-indigo-200 transition-colors"
                              >
                                <span className="text-[10px] font-bold text-gray-700 truncate mr-1 pl-1">
                                  {name}
                                </span>
                                <div className="flex gap-0.5 shrink-0">
                                  <button
                                    onClick={() => loadClassroomLayout(name)}
                                    className="bg-indigo-50 hover:bg-indigo-100 text-indigo-600 px-1.5 py-0.5 rounded text-[8px] font-bold"
                                  >
                                    불러오기
                                  </button>
                                  <button
                                    onClick={() => deleteClassroomLayout(name)}
                                    className="bg-red-50 hover:bg-red-100 text-red-600 px-1.5 py-0.5 rounded text-[8px] font-bold"
                                  >
                                    <Trash2 className="w-2.5 h-2.5" />
                                  </button>
                                </div>
                              </div>
                            )
                          )
                        )}
                      </div>
                    </div>

                    <div className="flex-1 flex flex-col min-h-0 border-t border-gray-100 pt-2">
                      <h2 className="text-[11px] font-black mb-1.5">
                        📊 누적 착석 통계 (앞/뒤)
                      </h2>
                      <div className="overflow-y-auto flex-1 custom-scrollbar border rounded">
                        <table className="w-full text-[9px] text-left border-collapse">
                          <thead className="sticky top-0 bg-gray-100 text-gray-600 border-b">
                            <tr>
                              <th className="py-1 px-1">이름</th>
                              <th className="py-1 text-center">앞</th>
                              <th className="py-1 text-center">뒤</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-100">
                            {[...students]
                              .sort(
                                (a, b) =>
                                  (classroomHistory[b.name]?.back || 0) -
                                  (classroomHistory[b.name]?.front || 0) -
                                  ((classroomHistory[a.name]?.back || 0) -
                                    (classroomHistory[a.name]?.front || 0))
                              )
                              .map((s) => {
                                const hist = classroomHistory[s.name] || {
                                  front: 0,
                                  back: 0,
                                };
                                return (
                                  <tr key={s.id}>
                                    <td className="py-1 px-1 font-bold text-gray-700">
                                      {s.name}
                                    </td>
                                    <td className="py-1 text-center text-indigo-600 font-bold">
                                      {hist.front}
                                    </td>
                                    <td className="py-1 text-center text-rose-600 font-bold">
                                      {hist.back}
                                    </td>
                                  </tr>
                                );
                              })}
                          </tbody>
                        </table>
                      </div>
                      <button
                        onClick={clearClassroomHistory}
                        className="mt-1 text-[9px] bg-red-50 text-red-600 py-1 rounded font-bold hover:bg-red-100"
                      >
                        통계 초기화
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {seatingTab === "lunch" && (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
                  <div className="lg:col-span-2 space-y-3">
                    <div className="bg-white p-3 rounded-xl shadow-sm border-t-2 border-orange-400 flex flex-col md:flex-row justify-between items-start md:items-center gap-2">
                      <h1 className="text-sm font-bold text-gray-800">
                        🍲 급식 자리 배치{" "}
                        <span className="text-[9px] font-normal">
                          (이전 자리 방지)
                        </span>
                      </h1>
                      <div className="flex gap-1 w-full md:w-auto">
                        <input
                          type="date"
                          value={lunchDateInput}
                          onChange={(e) => setLunchDateInput(e.target.value)}
                          className="px-1.5 py-1 text-[9px] rounded border outline-none"
                        />
                        <button
                          onClick={() =>
                            loadSpecificLunchSeating(lunchDateInput)
                          }
                          className="px-2 py-1 bg-slate-600 text-white rounded text-[9px] font-bold"
                        >
                          불러오기
                        </button>
                        <button
                          onClick={generateLunchSeating}
                          className="px-2 py-1 bg-orange-500 text-white rounded text-[9px] font-bold"
                        >
                          무작위
                        </button>
                        <button
                          onClick={saveLunchSeating}
                          className="px-2 py-1 bg-teal-600 text-white rounded text-[9px] font-bold"
                        >
                          저장
                        </button>
                      </div>
                    </div>

                    <div className="bg-white p-3 rounded-xl shadow-sm border border-blue-100">
                      <h2 className="text-[10px] font-bold text-blue-800 mb-2 text-center bg-blue-50 py-1 rounded">
                        👦 남학생 (13석)
                      </h2>
                      <div className="grid grid-cols-7 gap-1">
                        {currentLunchBoys.map((student, index) => (
                          <div
                            key={`b-${index}`}
                            draggable
                            onDragStart={() =>
                              setDraggedLunchInfo({ type: "M", index })
                            }
                            onDragOver={(e) => e.preventDefault()}
                            onDrop={(e) => {
                              e.preventDefault();
                              if (
                                draggedLunchInfo &&
                                draggedLunchInfo.type === "M" &&
                                draggedLunchInfo.index !== index
                              ) {
                                const newArr = [...currentLunchBoys];
                                const temp = newArr[draggedLunchInfo.index];
                                newArr[draggedLunchInfo.index] = newArr[index];
                                newArr[index] = temp;
                                setCurrentLunchBoys(newArr);
                              }
                            }}
                            className={`p-1 rounded flex items-center justify-center border text-[9px] font-bold cursor-grab hover:scale-105 ${
                              !student
                                ? "bg-gray-50 border-dashed"
                                : "bg-blue-50 border-blue-200 text-blue-800 h-6"
                            }`}
                          >
                            {student ? student.name : ""}
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="bg-white p-3 rounded-xl shadow-sm border border-pink-100">
                      <h2 className="text-[10px] font-bold text-pink-800 mb-2 text-center bg-pink-50 py-1 rounded">
                        👧 여학생 (12석)
                      </h2>
                      <div className="grid grid-cols-6 gap-1">
                        {currentLunchGirls.map((student, index) => (
                          <div
                            key={`g-${index}`}
                            draggable
                            onDragStart={() =>
                              setDraggedLunchInfo({ type: "F", index })
                            }
                            onDragOver={(e) => e.preventDefault()}
                            onDrop={(e) => {
                              e.preventDefault();
                              if (
                                draggedLunchInfo &&
                                draggedLunchInfo.type === "F" &&
                                draggedLunchInfo.index !== index
                              ) {
                                const newArr = [...currentLunchGirls];
                                const temp = newArr[draggedLunchInfo.index];
                                newArr[draggedLunchInfo.index] = newArr[index];
                                newArr[index] = temp;
                                setCurrentLunchGirls(newArr);
                              }
                            }}
                            className={`p-1 rounded flex items-center justify-center border text-[9px] font-bold cursor-grab hover:scale-105 ${
                              !student
                                ? "bg-gray-50 border-dashed"
                                : "bg-pink-50 border-pink-200 text-pink-800 h-6"
                            }`}
                          >
                            {student ? student.name : ""}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 flex flex-col h-[420px]">
                    <h2 className="text-xs font-bold mb-2 text-orange-700">
                      📅 저장된 기록
                    </h2>
                    <div className="overflow-y-auto flex-1 custom-scrollbar space-y-1.5 border p-1 rounded bg-gray-50">
                      {Object.keys(lunchHistory || {}).length === 0 ? (
                        <div className="text-gray-400 text-center py-4 text-[9px]">
                          기록이 없습니다.
                        </div>
                      ) : (
                        Object.keys(lunchHistory || {})
                          .sort((a, b) => new Date(b) - new Date(a))
                          .map((date) => (
                            <div
                              key={date}
                              className="bg-white border p-1.5 rounded shadow-sm text-[10px] font-bold text-orange-700 flex justify-between items-center"
                            >
                              {date}{" "}
                              <button
                                onClick={() => deleteSpecificLunchSeating(date)}
                                className="text-red-400 hover:text-red-600"
                              >
                                <Trash2 className="w-3 h-3" />
                              </button>
                            </div>
                          ))
                      )}
                    </div>
                    <button
                      onClick={clearLunchHistory}
                      className="mt-2 text-[9px] bg-red-50 text-red-600 py-1.5 rounded font-bold hover:bg-red-100"
                    >
                      전체 지우기
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {teacherTab === "token_dashboard" && (
            <div className="space-y-4 animate-in fade-in duration-300 max-w-6xl mx-auto">
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="p-3 border-b border-gray-100 flex flex-col md:flex-row justify-between items-start md:items-center bg-blue-50/30 gap-2">
                  <h2 className="text-sm font-black text-blue-800 flex items-center gap-1.5">
                    <Target className="w-4 h-4" /> 점수 부여/관리
                  </h2>
                  <div className="flex items-center gap-1.5 bg-white p-1 rounded-lg border border-blue-200">
                    <button
                      onClick={() => {
                        const d = new Date(scoreBoardDate);
                        d.setDate(d.getDate() - 1);
                        setScoreBoardDate(getLocalDateString(d));
                      }}
                      className="p-1 hover:bg-blue-50 rounded"
                    >
                      <ChevronLeft className="w-3 h-3 text-blue-600" />
                    </button>
                    <input
                      type="date"
                      value={scoreBoardDate}
                      onChange={(e) => setScoreBoardDate(e.target.value)}
                      className="font-bold text-[10px] text-blue-800 outline-none"
                    />
                    <button
                      onClick={() => {
                        const d = new Date(scoreBoardDate);
                        d.setDate(d.getDate() + 1);
                        setScoreBoardDate(getLocalDateString(d));
                      }}
                      className="p-1 hover:bg-blue-50 rounded"
                    >
                      <ChevronRight className="w-3 h-3 text-blue-600" />
                    </button>
                  </div>
                  <button
                    onClick={() => {
                      const headers = [
                        "번호",
                        "이름",
                        `기준일(${scoreBoardDate}) 점수`,
                        "해당 주간 점수",
                        "해당 월간 점수",
                        "총 누적 점수",
                        "총 획득 실버",
                        "사용한 실버",
                        "남은 실버 토큰",
                        "읽은 책(권)",
                      ];
                      const rows = students.map((s) => {
                        const { daily, weekly, monthly, cumulative } =
                          getDetailedScoresByDate(s.id, scoreBoardDate);
                        const earned = Math.floor(cumulative / 25);
                        const spent = spentTokens[s.id] || 0;
                        return [
                          `${s.id}번`,
                          s.name || "",
                          `${daily}점`,
                          `${weekly}점`,
                          `${monthly}점`,
                          `${cumulative}점`,
                          `${earned}개`,
                          `${spent}개`,
                          `${earned - spent}개`,
                          `${booksRead[s.id] || 0}권`,
                        ];
                      });
                      const csvContent =
                        "data:text/csv;charset=utf-8,\uFEFF" +
                        [
                          headers.join(","),
                          ...rows.map((e) => e.join(",")),
                        ].join("\n");
                      const link = document.createElement("a");
                      link.setAttribute("href", encodeURI(csvContent));
                      link.setAttribute(
                        "download",
                        `학생점수현황_${scoreBoardDate}기준.csv`
                      );
                      document.body.appendChild(link);
                      link.click();
                      document.body.removeChild(link);
                    }}
                    className="bg-green-600 text-white px-2.5 py-1 rounded text-[9px] font-bold"
                  >
                    <Download className="w-2.5 h-2.5 inline" /> 엑셀
                  </button>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse min-w-[1000px]">
                    <thead>
                      <tr className="bg-gray-50 text-gray-600 text-[9px] border-b">
                        <th className="p-1.5 text-center w-8">번호</th>
                        <th className="p-1.5 text-center w-14">이름</th>
                        <th className="p-1 text-center bg-blue-50 text-blue-800 border-l border-r">
                          상점(일)
                        </th>
                        <th className="p-1 text-center bg-emerald-50 text-emerald-800 border-r">
                          독서(누적)
                        </th>
                        <th className="p-1 text-center bg-orange-50 text-orange-800 border-r">
                          말차례(일)
                        </th>
                        <th className="p-1 text-center bg-teal-50 text-teal-800 border-r">
                          경청(일)
                        </th>
                        <th className="p-1 text-center bg-blue-50/50 text-blue-800">
                          상점 누적
                        </th>
                        <th className="p-1 text-center bg-slate-100">
                          보유 실버
                        </th>
                        <th className="p-1 text-center">상세조회</th>
                      </tr>
                    </thead>
                    <tbody>
                      {students.map((student) => {
                        const { cumulative } = getDetailedScoresByDate(
                          student.id,
                          scoreBoardDate
                        );
                        const { silverTokens } = getStudentTokenData(
                          student.id
                        );
                        const tRacing =
                          records[scoreBoardDate]?.teacher_racing?.[
                            student.id
                          ] || 0;
                        const tSpeaking =
                          records[scoreBoardDate]?.teacher_speaking?.[
                            student.id
                          ] || 0;
                        const tListening =
                          records[scoreBoardDate]?.teacher_listening?.[
                            student.id
                          ] || 0;
                        const tReading = booksRead[student.id] || 0;

                        return (
                          <tr
                            key={student.id}
                            className="border-b text-[10px] hover:bg-gray-50"
                          >
                            <td className="p-1.5 text-center font-bold text-gray-500">
                              {student.id}
                            </td>
                            <td className="p-1.5 text-center font-black text-gray-800">
                              {student.name}
                            </td>
                            <td className="p-1 text-center border-l border-r bg-blue-50/20">
                              <div className="flex justify-center gap-0.5">
                                <button
                                  onClick={() =>
                                    adjustTeacherScore(
                                      student.id,
                                      -1,
                                      scoreBoardDate,
                                      "teacher_racing"
                                    )
                                  }
                                  className="w-4 h-4 bg-red-50 text-red-600 rounded flex items-center justify-center font-bold"
                                >
                                  -
                                </button>
                                <span className="w-3 text-[9px] font-black text-blue-700 text-center">
                                  {tRacing > 0 ? `+${tRacing}` : tRacing}
                                </span>
                                <button
                                  onClick={() =>
                                    adjustTeacherScore(
                                      student.id,
                                      +1,
                                      scoreBoardDate,
                                      "teacher_racing"
                                    )
                                  }
                                  className="w-4 h-4 bg-blue-50 text-blue-600 rounded flex items-center justify-center font-bold"
                                >
                                  +
                                </button>
                              </div>
                            </td>
                            <td className="p-1 text-center border-r bg-emerald-50/20">
                              <div className="flex justify-center gap-0.5">
                                <button
                                  onClick={() =>
                                    adjustTeacherReading(student.id, -1)
                                  }
                                  className="w-4 h-4 bg-orange-50 text-orange-600 rounded flex items-center justify-center font-bold"
                                >
                                  -
                                </button>
                                <span className="w-3 text-[9px] font-black text-emerald-700 text-center">
                                  {tReading}
                                </span>
                                <button
                                  onClick={() =>
                                    adjustTeacherReading(student.id, +1)
                                  }
                                  className="w-4 h-4 bg-emerald-50 text-emerald-600 rounded flex items-center justify-center font-bold"
                                >
                                  +
                                </button>
                              </div>
                            </td>
                            <td className="p-1 text-center border-r bg-orange-50/20">
                              <div className="flex justify-center gap-0.5">
                                <button
                                  onClick={() =>
                                    adjustTeacherScore(
                                      student.id,
                                      -1,
                                      scoreBoardDate,
                                      "teacher_speaking"
                                    )
                                  }
                                  className="w-4 h-4 bg-red-50 text-red-600 rounded flex items-center justify-center font-bold"
                                >
                                  -
                                </button>
                                <span className="w-3 text-[9px] font-black text-orange-700 text-center">
                                  {tSpeaking > 0 ? `+${tSpeaking}` : tSpeaking}
                                </span>
                                <button
                                  onClick={() =>
                                    adjustTeacherScore(
                                      student.id,
                                      +1,
                                      scoreBoardDate,
                                      "teacher_speaking"
                                    )
                                  }
                                  className="w-4 h-4 bg-orange-50 text-orange-600 rounded flex items-center justify-center font-bold"
                                >
                                  +
                                </button>
                              </div>
                            </td>
                            <td className="p-1 text-center border-r bg-teal-50/20">
                              <div className="flex justify-center gap-0.5">
                                <button
                                  onClick={() =>
                                    adjustTeacherScore(
                                      student.id,
                                      -1,
                                      scoreBoardDate,
                                      "teacher_listening"
                                    )
                                  }
                                  className="w-4 h-4 bg-red-50 text-red-600 rounded flex items-center justify-center font-bold"
                                >
                                  -
                                </button>
                                <span className="w-3 text-[9px] font-black text-teal-700 text-center">
                                  {tListening > 0
                                    ? `+${tListening}`
                                    : tListening}
                                </span>
                                <button
                                  onClick={() =>
                                    adjustTeacherScore(
                                      student.id,
                                      +1,
                                      scoreBoardDate,
                                      "teacher_listening"
                                    )
                                  }
                                  className="w-4 h-4 bg-teal-50 text-teal-600 rounded flex items-center justify-center font-bold"
                                >
                                  +
                                </button>
                              </div>
                            </td>
                            <td className="p-1 text-center font-black text-blue-800 bg-blue-50/50">
                              {cumulative}점
                            </td>
                            <td className="p-1 text-center bg-slate-100 flex justify-center gap-1.5 items-center">
                              <span className="font-black text-blue-700">
                                {silverTokens}
                              </span>
                              <button
                                onClick={() => {
                                  setEditTokenAmount(
                                    spentTokens[student.id] || 0
                                  );
                                  setTokenManageStudent(student);
                                }}
                                className="bg-white border text-[8px] px-1 py-0.5 rounded"
                              >
                                관리
                              </button>
                            </td>
                            <td className="p-1 text-center">
                              <button
                                onClick={() => setScoreModalStudent(student)}
                                className="text-[8px] bg-white border px-1.5 py-0.5 rounded shadow-sm"
                              >
                                보기
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200">
                <div className="flex justify-between items-center mb-3">
                  <h2 className="text-sm font-black text-gray-800 flex items-center gap-1.5">
                    <Gift className="w-4 h-4 text-purple-600" /> 토큰 누적 보상
                    설정
                  </h2>
                  <button
                    onClick={resetAllRecords}
                    className="bg-red-50 hover:bg-red-100 text-red-600 px-2 py-1 rounded text-[9px] font-bold"
                  >
                    초기화
                  </button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
                    <h3 className="font-black text-slate-700 text-[10px] mb-2">
                      개인 실버 보상
                    </h3>
                    <div className="space-y-1.5 max-h-32 overflow-y-auto custom-scrollbar pr-1">
                      {[10, 20, 30, 40, 50, 60, 70, 80, 90, 100].map((tier) => (
                        <div key={tier} className="flex items-center gap-1">
                          <span className="w-8 text-right font-bold text-slate-500 text-[9px]">
                            {tier}:
                          </span>
                          <input
                            type="text"
                            value={silverRewards[tier] || ""}
                            onChange={(e) =>
                              handleRewardChange("silver", tier, e.target.value)
                            }
                            className="flex-1 p-1 border rounded text-[9px] outline-none"
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="bg-yellow-50/50 p-3 rounded-lg border border-yellow-200">
                    <h3 className="font-black text-yellow-800 text-[10px] mb-2">
                      학급 골드 보상
                    </h3>
                    <div className="space-y-1.5 max-h-32 overflow-y-auto custom-scrollbar pr-1">
                      {[10, 20, 30, 40, 50, 60, 70, 80, 90, 100].map((tier) => (
                        <div key={tier} className="flex items-center gap-1">
                          <span className="w-8 text-right font-bold text-yellow-700 text-[9px]">
                            {tier}:
                          </span>
                          <input
                            type="text"
                            value={goldRewards[tier] || ""}
                            onChange={(e) =>
                              handleRewardChange("gold", tier, e.target.value)
                            }
                            className="flex-1 p-1 border rounded text-[9px] outline-none bg-white"
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {teacherTab === "role_stats" && (
            <div className="space-y-5 animate-in fade-in duration-300 max-w-4xl mx-auto">
              <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="p-4 border-b border-gray-100 bg-indigo-50/30">
                  <h2 className="text-base font-black text-indigo-800 flex items-center gap-1.5">
                    <BarChart className="w-4 h-4" /> 역할별 점수 부여 통계
                  </h2>
                  <p className="text-[10px] text-gray-500 mt-1">
                    목록을 클릭하면 수혜자 랭킹을 볼 수 있습니다.
                  </p>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-xs text-left">
                    <thead>
                      <tr className="bg-gray-50 border-b">
                        <th className="p-2.5 pl-4 w-1/2">역할명</th>
                        <th className="p-2.5 text-center w-1/2">
                          총 부여 점수 (클릭)
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {(() => {
                        const stats = {};
                        rolePool.forEach(
                          (r) => (stats[r] = { role: r, pts: 0, receivers: {} })
                        );
                        stats["선생님 권한 부여"] = {
                          role: "선생님 권한 부여",
                          pts: 0,
                          receivers: {},
                        };
                        Object.values(records || {}).forEach((dR) =>
                          Object.entries(dR || {}).forEach(([cId, tgts]) => {
                            Object.entries(tgts || {}).forEach(([tId, val]) => {
                              let p = getPoints(val),
                                rName = "이전 역할(기록됨)";
                              if (
                                cId === "teacher_racing" ||
                                cId === "teacher_speaking" ||
                                cId === "teacher_listening"
                              )
                                rName = "선생님 권한 부여";
                              else if (
                                typeof val === "string" &&
                                val !== "false" &&
                                val !== ""
                              )
                                rName = val.startsWith("[-] ")
                                  ? val.substring(4)
                                  : val.startsWith("[거북이] ")
                                  ? "거북이 지킴이"
                                  : val;
                              else {
                                const c = students.find(
                                  (s) => s.id === parseInt(cId)
                                );
                                if (c) rName = c.role;
                              }
                              if (p !== 0) {
                                if (!stats[rName])
                                  stats[rName] = {
                                    role: rName,
                                    pts: 0,
                                    receivers: {},
                                  };
                                stats[rName].pts += Math.abs(p);
                                stats[rName].receivers[tId] =
                                  (stats[rName].receivers[tId] || 0) + p;
                              }
                            });
                          })
                        );
                        return Object.values(stats).sort(
                          (a, b) => b.pts - a.pts
                        );
                      })().map((st, i) => (
                        <tr
                          key={i}
                          onClick={() =>
                            setSelectedRoleStat({
                              role: st.role,
                              receivers: st.receivers || {},
                            })
                          }
                          className="border-b hover:bg-indigo-50 cursor-pointer text-sm"
                        >
                          <td className="p-3 pl-6 font-bold text-gray-800 flex items-center gap-1.5">
                            <Search className="w-3 h-3 text-indigo-400" />{" "}
                            {st.role}
                          </td>
                          <td className="p-3 text-center font-black text-indigo-600 bg-indigo-50/20">
                            {st.pts > 0 ? `+${st.pts}` : st.pts} 점
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {teacherTab === "daily_records" && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden animate-in fade-in max-w-4xl mx-auto">
              <div className="flex justify-between items-center p-2.5 border-b bg-gray-50">
                <h2 className="text-xs font-black text-gray-800">
                  일일 점검 확인
                </h2>
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="text-[10px] font-bold p-1 rounded border outline-none"
                />
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-[10px] text-left">
                  <thead className="bg-blue-50 text-blue-800 border-b">
                    <tr>
                      <th className="p-1.5 text-center w-10">번호</th>
                      <th className="p-1.5 text-center w-16">이름</th>
                      <th className="p-1.5 text-center w-12">합계</th>
                      <th className="p-1.5">제공 내역</th>
                    </tr>
                  </thead>
                  <tbody>
                    {students.map((s) => {
                      const { dailyScore, checkedBy } = getDailyDetails(
                        selectedDate,
                        s.id
                      );
                      return (
                        <tr
                          key={s.id}
                          className="border-b hover:bg-gray-50 text-sm"
                        >
                          <td className="p-1.5 text-center font-bold">
                            {s.id}
                          </td>
                          <td className="p-1.5 text-center font-bold">
                            {s.name}
                          </td>
                          <td className="p-1.5 text-center font-black">
                            {dailyScore > 0 ? `+${dailyScore}` : dailyScore}점
                          </td>
                          <td className="p-1.5">
                            {checkedBy.length > 0 ? (
                              <div className="flex flex-wrap gap-1">
                                {checkedBy.map((r, i) => (
                                  <span
                                    key={i}
                                    className="text-[8px] bg-gray-100 border px-1 rounded"
                                  >
                                    {r}
                                  </span>
                                ))}
                              </div>
                            ) : (
                              <span className="text-[8px] text-gray-400">
                                없음
                              </span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {teacherTab === "suggestions" && (
            <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 animate-in fade-in max-w-4xl mx-auto">
              <div className="flex justify-between items-center mb-3">
                <h2 className="text-sm font-black text-gray-800 flex items-center gap-1.5">
                  <MessageSquare className="w-4 h-4 text-blue-600" /> 건의
                  게시판 관리
                </h2>
                <div className="text-[10px] font-bold text-blue-800 bg-blue-50 px-2 py-1 rounded">
                  총 {suggestions.length}건
                </div>
              </div>
              <div className="space-y-2.5 max-h-[70vh] overflow-y-auto pr-1 custom-scrollbar">
                {suggestions.length === 0 ? (
                  <div className="bg-gray-50 rounded-xl p-8 flex flex-col items-center justify-center border border-gray-200 border-dashed">
                    <MessageSquare className="w-10 h-10 text-gray-300 mb-2" />
                    <p className="text-gray-500 font-medium text-sm">
                      아직 등록된 건의사항이 없습니다.
                    </p>
                  </div>
                ) : (
                  [...suggestions]
                    .reverse()
                    .map((sug) => renderSuggestionCard(sug, true, null))
                )}
              </div>
            </div>
          )}

          {teacherTab === "reading_reports" && (
            <div className="bg-white p-4 rounded-xl shadow-sm border border-emerald-200 animate-in fade-in max-w-4xl mx-auto">
              <h2 className="text-sm font-black text-emerald-800 mb-3 flex items-center gap-1.5">
                <BookOpen className="w-4 h-4" /> 독서 감상문 관리 (
                {readingReports.length}건)
              </h2>
              <div className="grid grid-cols-1 gap-2 max-h-[70vh] overflow-y-auto pr-1 custom-scrollbar">
                {readingReports.length === 0 ? (
                  <div className="text-xs text-gray-400 text-center py-6">
                    등록된 독서 감상문이 없습니다.
                  </div>
                ) : (
                  [...readingReports]
                    .reverse()
                    .map((report) =>
                      renderReadingReportCard(report, true, null)
                    )
                )}
              </div>
            </div>
          )}

          {teacherTab === "settings" && (
            <div className="space-y-4 animate-in fade-in max-w-5xl mx-auto">
              <div className="bg-white p-3 rounded-xl shadow-sm border border-gray-200 flex justify-between items-center">
                <h3 className="text-xs font-bold text-slate-800 flex items-center gap-1">
                  <Lock className="w-3 h-3" /> 마스터 비번 변경
                </h3>
                <div className="flex items-center gap-1">
                  <input
                    type="text"
                    id="newTeacherPw"
                    placeholder="새 비번"
                    className="w-20 p-1 text-[10px] border rounded outline-none"
                  />
                  <button
                    onClick={() => {
                      changeTeacherPassword(
                        document.getElementById("newTeacherPw").value
                      );
                      document.getElementById("newTeacherPw").value = "";
                    }}
                    className="bg-slate-800 text-white px-2 py-1 rounded text-[9px] font-bold"
                  >
                    변경
                  </button>
                </div>
              </div>

              <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200">
                <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-2 mb-3">
                  <div>
                    <h2 className="text-sm font-black text-gray-800">
                      명단/역할 세팅
                    </h2>
                    <p className="text-[9px] text-gray-500 mt-0.5">
                      역할을 <strong>드래그</strong>하여 서로 바꿀 수 있습니다.
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-1">
                    <button
                      onClick={openSecretSeatingModal}
                      className="bg-gray-800 text-white px-2 py-1 rounded flex items-center gap-1 font-bold text-[9px]"
                    >
                      <Users className="w-3 h-3" /> 🤫 몰래자리
                    </button>
                    <button
                      onClick={saveStudentSettings}
                      className="bg-green-600 text-white px-2 py-1 rounded flex items-center gap-1 font-bold text-[9px]"
                    >
                      <Save className="w-3 h-3" /> 저장
                    </button>
                    <button
                      onClick={requestShuffleRoles}
                      className="bg-blue-50 text-blue-700 border px-2 py-1 rounded flex items-center gap-1 font-bold text-[9px]"
                    >
                      <Shuffle className="w-3 h-3" /> 배정
                    </button>
                    <button
                      onClick={generatePasswords}
                      className="bg-purple-50 text-purple-700 border px-2 py-1 rounded flex items-center gap-1 font-bold text-[9px]"
                    >
                      <Key className="w-3 h-3" /> 비번
                    </button>
                    <button
                      onClick={copyToClipboard}
                      className="bg-slate-800 text-white px-2 py-1 rounded flex items-center gap-1 font-bold text-[9px]"
                    >
                      <Copy className="w-3 h-3" /> 복사
                    </button>
                  </div>
                </div>
                <div className="overflow-x-auto border border-gray-200 rounded">
                  <table className="w-full text-left border-collapse min-w-[600px]">
                    <thead>
                      <tr className="bg-slate-100 text-slate-700 border-b text-[9px]">
                        <th className="p-1 text-center">고정</th>
                        <th className="p-1 text-center">번호</th>
                        <th className="p-1 w-1/4">이름</th>
                        <th className="p-1 w-1/3">역할 (드래그)</th>
                        <th className="p-1 text-center">비번</th>
                        <th className="p-1 text-center">삭제</th>
                      </tr>
                    </thead>
                    <tbody>
                      {editingStudents.map((student, index) => (
                        <tr
                          key={index}
                          className={`border-b text-[10px] ${
                            student.isLocked
                              ? "bg-orange-50/30"
                              : "hover:bg-gray-50"
                          }`}
                        >
                          <td className="p-1 text-center">
                            <button
                              onClick={() =>
                                handleEditStudent(
                                  index,
                                  "isLocked",
                                  !student.isLocked
                                )
                              }
                              className={`p-1 rounded ${
                                student.isLocked
                                  ? "text-orange-600"
                                  : "text-gray-400"
                              }`}
                            >
                              {student.isLocked ? (
                                <Lock className="w-3 h-3" />
                              ) : (
                                <Unlock className="w-3 h-3" />
                              )}
                            </button>
                          </td>
                          <td className="p-1 text-center">
                            <input
                              type="number"
                              value={student.id}
                              onChange={(e) =>
                                handleEditStudent(
                                  index,
                                  "id",
                                  parseInt(e.target.value) || ""
                                )
                              }
                              className="w-8 p-1 text-center bg-transparent outline-none font-bold"
                            />
                          </td>
                          <td className="p-1">
                            <input
                              type="text"
                              value={student.name}
                              onChange={(e) =>
                                handleEditStudent(index, "name", e.target.value)
                              }
                              className="w-full p-1 bg-transparent outline-none font-bold"
                            />
                          </td>
                          <td
                            className="p-1"
                            onDragOver={(e) => e.preventDefault()}
                            onDrop={(e) => handleDropStudent(e, index)}
                          >
                            <div
                              draggable
                              onDragStart={(e) =>
                                handleDragStartStudent(e, index)
                              }
                              className={`w-full p-1 flex justify-between items-center border border-dashed rounded cursor-move text-[11px] ${
                                student.isLocked
                                  ? "bg-orange-50 border-orange-200 text-orange-700"
                                  : "bg-white border-gray-300 text-blue-700"
                              }`}
                            >
                              <span className="truncate pr-1">
                                {student.role || "-"}
                              </span>
                              <GripHorizontal className="w-3 h-3 text-gray-300 shrink-0" />
                            </div>
                          </td>
                          <td className="p-1">
                            <input
                              type="text"
                              value={student.password}
                              onChange={(e) =>
                                handleEditStudent(
                                  index,
                                  "password",
                                  e.target.value
                                )
                              }
                              className="w-full p-1 text-center bg-transparent outline-none font-mono"
                            />
                          </td>
                          <td className="p-1 text-center">
                            <button
                              onClick={() => handleRemoveStudent(index)}
                              className="text-gray-400 hover:text-red-500"
                            >
                              <UserMinus className="w-3 h-3 mx-auto" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <div className="mt-2 text-center">
                  <button
                    onClick={handleAddStudent}
                    className="text-[10px] bg-gray-100 px-2 py-1 rounded font-bold hover:bg-gray-200"
                  >
                    + 전학생 추가
                  </button>
                </div>
              </div>

              <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200">
                <div className="flex flex-col md:flex-row gap-4">
                  <div className="flex-1">
                    <h2 className="text-sm font-black text-gray-800 mb-1">
                      📋 1인 1역 전체 풀 / 역할명 변경
                    </h2>
                    <p className="text-[10px] text-gray-500 mb-2">
                      줄바꿈으로 구분. '랜덤 배정'시 사용
                    </p>
                    <textarea
                      className="w-full h-32 p-2 border rounded outline-none text-[11px] resize-none bg-gray-50"
                      value={localRolePool}
                      onChange={(e) => setLocalRolePool(e.target.value)}
                    />
                    <button
                      onClick={saveRolePool}
                      className="mt-1 bg-blue-600 text-white px-3 py-1 rounded text-[10px] font-bold"
                    >
                      목록 저장
                    </button>
                  </div>
                  <div className="flex-1 border-t md:border-t-0 md:border-l border-gray-200 pt-3 md:pt-0 md:pl-4">
                    <h3 className="font-bold text-gray-700 text-[11px] mb-1.5">
                      <GripHorizontal className="w-3 h-3 inline text-gray-400" />{" "}
                      역할 드래그 팔레트
                    </h3>
                    <p className="text-[9px] text-gray-500 mb-2">
                      역할을 <strong>더블 클릭</strong>하면 이름을 연동하여
                      변경할 수 있습니다.
                    </p>
                    <div className="flex flex-wrap gap-1 max-h-[80px] overflow-y-auto custom-scrollbar">
                      {rolePool.map((role, idx) => (
                        <div
                          key={idx}
                          draggable
                          onDragStart={(e) => handleDragStartRolePool(e, role)}
                          onDoubleClick={() => handleRenameFromPalette(role)}
                          className="bg-indigo-50 border border-indigo-200 text-indigo-700 font-bold text-[9px] px-1.5 py-1 rounded shadow-sm cursor-move hover:bg-indigo-100 transition-colors"
                          title="더블 클릭하여 역할명 수정"
                        >
                          {role}
                        </div>
                      ))}
                    </div>

                    <div className="bg-indigo-50 p-2 rounded-lg border border-indigo-100 mt-2">
                      <h3 className="text-[10px] font-bold text-indigo-800 mb-1">
                        기존 역할명 수동 변경
                      </h3>
                      <div className="flex flex-col gap-1">
                        <select
                          value={renameOldRole}
                          onChange={(e) => setRenameOldRole(e.target.value)}
                          className="w-full p-1 text-[9px] rounded border outline-none"
                        >
                          <option value="">기존 역할 선택</option>
                          {rolePool.map((r) => (
                            <option key={r} value={r}>
                              {r}
                            </option>
                          ))}
                        </select>
                        <input
                          type="text"
                          value={renameNewRole}
                          onChange={(e) => setRenameNewRole(e.target.value)}
                          placeholder="새 역할명"
                          className="w-full p-1 text-[9px] rounded border outline-none"
                        />
                        <button
                          onClick={executeRoleRename}
                          className="w-full bg-indigo-600 text-white py-1 rounded text-[9px] font-bold"
                        >
                          변경 및 연동
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ⭐️ 비밀 자리 설정 모달 */}
      {isSecretModalOpen && (
        <div className="fixed inset-0 bg-black/70 z-[100] flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full p-6">
            <div className="mb-4">
              <h2 className="text-lg font-black flex items-center gap-2">
                🤫 선생님 전용 비밀 자리 설정
              </h2>
              <p className="text-xs text-gray-500 mt-1">
                이 곳에서 자리를 배치하고 저장해두면, 메인 탭에서{" "}
                <b>Ctrl + 자리 뽑기</b> 클릭 시 이 자리가 로드됩니다.
              </p>
            </div>
            <div className="w-full flex justify-center mb-6">
              <div className="w-1/3 py-1.5 bg-gray-800 text-white text-center rounded font-bold text-[10px]">
                교 탁
              </div>
            </div>
            <div className="grid grid-cols-7 gap-1.5">
              {tempSecretSeating.map((student, index) => {
                if (gridStructure[index] === 0) return <div key={index}></div>;
                return (
                  <div
                    key={index}
                    draggable
                    onDragStart={(e) =>
                      e.dataTransfer.setData("secretIdx", index)
                    }
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={(e) => {
                      e.preventDefault();
                      const fromIdx = e.dataTransfer.getData("secretIdx");
                      if (fromIdx !== "" && fromIdx != index) {
                        const newArr = [...tempSecretSeating];
                        const temp = newArr[fromIdx];
                        newArr[fromIdx] = newArr[index];
                        newArr[index] = temp;
                        setTempSecretSeating(newArr);
                      }
                    }}
                    className={`relative p-1.5 rounded flex items-center justify-center border aspect-[4/3] cursor-grab text-[9px] font-bold transition-transform ${
                      !student
                        ? "bg-gray-50 border-dashed text-gray-400"
                        : "bg-indigo-50 border-indigo-200 text-indigo-800"
                    }`}
                  >
                    {student ? student.name : "빈 자리"}
                  </div>
                );
              })}
            </div>
            <div className="flex justify-end gap-2 mt-6">
              <button
                onClick={() => {
                  let unassigned = [...students];
                  let newArr = new Array(35).fill(null);
                  for (let i = 0; i < 35; i++) {
                    if (gridStructure[i] === 1 && unassigned.length > 0)
                      newArr[i] = unassigned.shift();
                  }
                  setTempSecretSeating(newArr);
                }}
                className="px-3 py-1.5 bg-gray-100 text-gray-700 text-[10px] font-bold rounded"
              >
                명단 채우기
              </button>
              <button
                onClick={() => setIsSecretModalOpen(false)}
                className="px-3 py-1.5 bg-gray-200 text-gray-700 text-[10px] font-bold rounded"
              >
                취소
              </button>
              <button
                onClick={saveSecretSeating}
                className="px-3 py-1.5 bg-indigo-600 text-white text-[10px] font-bold rounded"
              >
                저장
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 모달: 점수 상세 */}
      {scoreModalStudent && (
        <div className="fixed inset-0 bg-black/60 z-[70] flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-5 w-full max-w-md">
            <h3 className="font-black text-base mb-3">
              {scoreModalStudent.name} 획득 내역 (
              {getCumulativeScore(scoreModalStudent.id)}점)
            </h3>
            <div className="grid grid-cols-3 gap-2 mb-4 max-h-[50vh] overflow-y-auto pr-1">
              {Object.entries(getCheckerBreakdown(scoreModalStudent.id))
                .filter(([, pts]) => pts !== 0)
                .map(([role, pts], i) => (
                  <div
                    key={i}
                    className="border p-2 rounded-lg text-center shadow-sm"
                  >
                    <div className="text-[9px] font-bold text-gray-500 truncate mb-1">
                      {role}
                    </div>
                    <div
                      className={`text-sm font-black ${
                        pts > 0 ? "text-blue-600" : "text-red-500"
                      }`}
                    >
                      {pts > 0 ? `+${pts}` : pts}
                    </div>
                  </div>
                ))}
            </div>
            <div className="text-center">
              <button
                onClick={() => setScoreModalStudent(null)}
                className="px-5 py-1.5 bg-slate-800 text-white text-xs font-bold rounded"
              >
                닫기
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 모달: 역할 통계 */}
      {selectedRoleStat && (
        <div className="fixed inset-0 bg-black/60 z-[70] flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 w-full max-w-sm">
            <h3 className="font-black text-sm mb-3">
              [{selectedRoleStat.role}] 수혜 랭킹
            </h3>
            <div className="space-y-1.5 mb-4 max-h-[40vh] overflow-y-auto">
              {Object.entries(selectedRoleStat.receivers || {})
                .sort(([, a], [, b]) => b - a)
                .map(([tId, pts], i) => (
                  <div
                    key={tId}
                    className="flex justify-between bg-indigo-50 p-1.5 rounded border text-[10px]"
                  >
                    <span className="font-bold">
                      {i + 1}.{" "}
                      {students.find((s) => s.id === parseInt(tId))?.name ||
                        tId}
                    </span>
                    <span className="font-black text-indigo-700">
                      {pts > 0 ? `+${pts}` : pts}점
                    </span>
                  </div>
                ))}
            </div>
            <div className="text-center">
              <button
                onClick={() => setSelectedRoleStat(null)}
                className="px-4 py-1.5 bg-slate-800 text-white text-xs font-bold rounded"
              >
                닫기
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 토큰 관리 모달들 */}
      {tokenManageStudent && (
        <div className="fixed inset-0 bg-black/60 z-[80] flex items-center justify-center p-4">
          <div className="bg-white rounded-xl p-4 w-full max-w-[250px] text-center">
            <h3 className="font-bold text-sm mb-2">
              {tokenManageStudent.name} 실버 관리
            </h3>
            <div className="text-[10px] mb-2">
              총 획득:{" "}
              {getStudentTokenData(tokenManageStudent.id).earnedSilverTokens}개
            </div>
            <div className="flex justify-center items-center gap-1.5 mb-3">
              <button
                onClick={() =>
                  setEditTokenAmount(Math.max(0, editTokenAmount - 1))
                }
                className="bg-gray-100 px-2.5 py-1 font-bold rounded"
              >
                -
              </button>
              <input
                type="number"
                value={editTokenAmount}
                onChange={(e) =>
                  setEditTokenAmount(Math.max(0, parseInt(e.target.value) || 0))
                }
                className="w-12 text-center border p-1 text-sm font-bold"
              />
              <button
                onClick={() =>
                  setEditTokenAmount(
                    Math.min(
                      getStudentTokenData(tokenManageStudent.id)
                        .earnedSilverTokens,
                      editTokenAmount + 1
                    )
                  )
                }
                className="bg-gray-100 px-2.5 py-1 font-bold rounded"
              >
                +
              </button>
            </div>
            <div className="flex gap-1.5 justify-center">
              <button
                onClick={() => setTokenManageStudent(null)}
                className="px-3 py-1 text-[10px] bg-gray-200 font-bold rounded"
              >
                취소
              </button>
              <button
                onClick={() => {
                  const ns = {
                    ...spentTokens,
                    [tokenManageStudent.id]: editTokenAmount,
                  };
                  setSpentTokens(ns);
                  saveToDB({ spentTokens: ns });
                  setTokenManageStudent(null);
                  showToast("저장 완료");
                }}
                className="px-3 py-1 text-[10px] bg-blue-600 text-white font-bold rounded"
              >
                적용
              </button>
            </div>
          </div>
        </div>
      )}

      {manageGoldTokenOpen && (
        <div className="fixed inset-0 bg-black/60 z-[80] flex items-center justify-center p-4">
          <div className="bg-white rounded-xl p-4 w-full max-w-[250px] text-center border-t-4 border-yellow-400">
            <h3 className="font-bold text-sm mb-2">학급 골드 관리</h3>
            <div className="text-[10px] mb-2">
              총 획득: {getClassTokenData().earnedGoldTokens}개
            </div>
            <div className="flex justify-center items-center gap-1.5 mb-3">
              <button
                onClick={() =>
                  setEditTokenAmount(Math.max(0, editTokenAmount - 1))
                }
                className="bg-gray-100 px-2.5 py-1 font-bold rounded"
              >
                -
              </button>
              <input
                type="number"
                value={editTokenAmount}
                onChange={(e) =>
                  setEditTokenAmount(Math.max(0, parseInt(e.target.value) || 0))
                }
                className="w-12 text-center border p-1 text-sm font-bold text-yellow-600"
              />
              <button
                onClick={() =>
                  setEditTokenAmount(
                    Math.min(
                      getClassTokenData().earnedGoldTokens,
                      editTokenAmount + 1
                    )
                  )
                }
                className="bg-gray-100 px-2.5 py-1 font-bold rounded"
              >
                +
              </button>
            </div>
            <div className="flex gap-1.5 justify-center">
              <button
                onClick={() => setManageGoldTokenOpen(false)}
                className="px-3 py-1 text-[10px] bg-gray-200 font-bold rounded"
              >
                취소
              </button>
              <button
                onClick={() => {
                  setSpentClassGoldTokens(editTokenAmount);
                  saveToDB({ spentClassGoldTokens: editTokenAmount });
                  setManageGoldTokenOpen(false);
                  showToast("저장 완료");
                }}
                className="px-3 py-1 text-[10px] bg-yellow-500 text-white font-bold rounded"
              >
                적용
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 공통 알림 */}
      {confirmModal && (
        <div className="fixed inset-0 bg-black/50 z-[90] flex items-center justify-center p-4">
          <div className="bg-white rounded-xl p-5 max-w-xs w-full text-center">
            <h3 className="font-bold text-sm mb-2">{confirmModal.title}</h3>
            <p className="text-[11px] text-gray-600 mb-4 whitespace-pre-wrap">
              {confirmModal.message}
            </p>
            <div className="flex justify-center gap-2">
              <button
                onClick={() => setConfirmModal(null)}
                className="px-3 py-1.5 bg-gray-100 font-bold text-[10px] rounded"
              >
                취소
              </button>
              <button
                onClick={confirmModal.onConfirm}
                className="px-3 py-1.5 bg-blue-600 text-white font-bold text-[10px] rounded"
              >
                확인
              </button>
            </div>
          </div>
        </div>
      )}
      {toastMsg && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-slate-800 text-white px-4 py-2 rounded-full shadow-xl flex items-center gap-1.5 animate-in slide-in-from-bottom-5 z-[100]">
          <CheckCircle2 className="w-3.5 h-3.5 text-green-400" />
          <span className="font-bold text-[10px]">{toastMsg}</span>
        </div>
      )}
    </div>
  );
}
