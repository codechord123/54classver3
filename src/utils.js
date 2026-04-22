export const getLocalDateString = (d) => {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

export const parseDateStringSafe = (dateStr) => {
  const [y, m, d] = dateStr.split("-");
  return new Date(parseInt(y), parseInt(m) - 1, parseInt(d));
};

export const getPoints = (val) => {
  if (val === true) return 1;
  if (typeof val === "string" && val.trim() !== "" && val !== "false") return 1;
  if (typeof val === "number") return val;
  return 0;
};

export const getStudentTokenData = (studentId, score, spentTokens) => {
  const earnedSilverTokens = Math.floor(score / 25);
  const spent = spentTokens[studentId] || 0;
  const silverTokens = earnedSilverTokens - spent;
  const progressToNextSilver = score % 25;

  let nextRewardTier = Math.ceil((earnedSilverTokens + 1) / 10) * 10;
  if (earnedSilverTokens >= 100) nextRewardTier = 100;
  if (nextRewardTier === 0) nextRewardTier = 10;

  return {
    earnedSilverTokens,
    silverTokens,
    progressToNextSilver,
    nextRewardTier,
  };
};

export const chunkArrayCustom = (array) => {
  const chunked = [];
  let index = 0;
  while (index < array.length) {
    const remaining = array.length - index;
    if (remaining === 5) {
      chunked.push(array.slice(index, index + 5));
      break;
    }
    chunked.push(array.slice(index, index + 4));
    index += 4;
  }
  return chunked;
};

// 🐢 거북이 독서 미션 통계 계산기 (새로 추가됨!)
export const getTurtleReadingStats = (
  readingRecords,
  students,
  baseDateStr
) => {
  let classTotal = 0;
  const studentStats = students.map((s) => ({
    id: s.id,
    name: s.name,
    today: 0,
    total: 0,
  }));

  Object.entries(readingRecords || {}).forEach(([dateStr, dayRecord]) => {
    const isToday = dateStr === baseDateStr;
    Object.entries(dayRecord).forEach(([studentIdStr, books]) => {
      const studentId = parseInt(studentIdStr);
      const student = studentStats.find((s) => s.id === studentId);
      if (student) {
        classTotal += books;
        student.total += books;
        if (isToday) student.today += books;
      }
    });
  });

  // 누적 독서량 기준 1~3위 정렬
  const top3 = [...studentStats].sort((a, b) => b.total - a.total).slice(0, 3);
  return { classTotal, studentStats, top3 };
};
