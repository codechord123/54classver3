import React from "react";
import {
  ShieldCheck,
  LogOut,
  MessageSquare,
  Send,
  Coins,
  UserCheck,
  CheckCircle2,
  Circle,
  BookOpen,
} from "lucide-react";

export default function StudentDashboard({
  students,
  authStatus,
  logout,
  suggestionTitle,
  setSuggestionTitle,
  suggestionInput,
  setSuggestionInput,
  submitSuggestion,
  classData,
  goldRewards,
  studentData,
  silverRewards,
  todayStr,
  records,
  toggleRecord,
  readingRecords,
  updateReadingRecord,
  getTurtleReadingStats, // 🐢 추가된 데이터
}) {
  const myInfo = students.find((s) => s.id === authStatus.user.id);
  const myRole = myInfo?.role || "";
  const canCheckToday = true;

  const {
    score,
    silverTokens,
    progressToNextSilver,
    nextRewardTier: nextSilverTier,
  } = studentData;
  const {
    availableGoldTokens,
    earnedGoldTokens,
    progressToNextGold,
    nextRewardTier: nextGoldTier,
  } = classData;

  // 🐢 거북이 미션 계산
  const TURTLE_GOAL = 1250;
  const { classTotal, studentStats, top3 } = getTurtleReadingStats(
    readingRecords,
    students,
    todayStr
  );
  const myReading = studentStats.find((s) => s.id === myInfo.id) || {
    today: 0,
    total: 0,
  };

  if (!myRole || myRole === "역할 없음") {
    return (
      <div className="min-h-screen bg-gray-50 p-6 flex flex-col items-center justify-center text-center">
        <ShieldCheck className="w-16 h-16 text-gray-400 mb-4" />
        <h2 className="text-2xl font-bold text-gray-800 mb-2">
          아직 부여된 역할이 없습니다!
        </h2>
        <button
          onClick={logout}
          className="px-6 py-2 bg-gray-200 text-gray-700 font-bold rounded-lg mt-4 flex items-center gap-2"
        >
          <LogOut className="w-4 h-4" /> 로그아웃
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-100 p-2 md:p-6">
      <div className="max-w-4xl mx-auto space-y-4">
        {/* 거북이 독서 미션 현황판 (새로 추가됨!) */}
        <div className="bg-white p-5 rounded-2xl shadow-sm border-2 border-green-400">
          <div className="flex justify-between items-end mb-4">
            <div>
              <h3 className="text-lg font-black text-green-700 flex items-center gap-2">
                <BookOpen className="w-5 h-5" /> 🐢 거북이 독서 미션
              </h3>
              <p className="text-sm text-gray-600 font-bold mt-1">
                목표 {TURTLE_GOAL}권 중{" "}
                <span className="text-green-600 text-xl">{classTotal}권</span>{" "}
                달성!
              </p>
            </div>
            <div className="text-right bg-green-50 p-2 rounded-xl">
              <p className="text-xs text-gray-600 font-bold">
                내가 오늘 읽은 책
              </p>
              <div className="flex items-center gap-2 mt-1">
                <button
                  onClick={() => updateReadingRecord(myInfo.id, -1)}
                  className="bg-white border border-gray-300 hover:bg-gray-100 text-gray-700 w-8 h-8 rounded-full font-bold shadow-sm"
                >
                  -
                </button>
                <span className="font-black text-xl w-6 text-center text-green-800">
                  {myReading.today}
                </span>
                <button
                  onClick={() => updateReadingRecord(myInfo.id, 1)}
                  className="bg-green-500 hover:bg-green-600 text-white w-8 h-8 rounded-full font-bold shadow-sm"
                >
                  +
                </button>
              </div>
            </div>
          </div>

          <div className="w-full bg-gray-100 rounded-full h-4 mb-5 overflow-hidden border border-gray-200 shadow-inner">
            <div
              className="bg-gradient-to-r from-green-400 to-green-600 h-full rounded-full transition-all duration-500"
              style={{
                width: `${Math.min(100, (classTotal / TURTLE_GOAL) * 100)}%`,
              }}
            ></div>
          </div>

          <div className="bg-green-50/50 rounded-xl p-3 border border-green-100">
            <h4 className="text-xs font-black text-green-800 mb-2">
              👑 명예의 전당 베스트 3
            </h4>
            <div className="flex gap-2">
              {top3.map((student, idx) => (
                <div
                  key={student.id}
                  className="flex-1 bg-white p-2 rounded-lg text-center border border-green-200 shadow-sm relative overflow-hidden"
                >
                  <div
                    className={`absolute top-0 left-0 w-full h-1 ${
                      idx === 0
                        ? "bg-yellow-400"
                        : idx === 1
                        ? "bg-slate-400"
                        : "bg-orange-400"
                    }`}
                  ></div>
                  <div className="text-[10px] font-bold text-gray-400 mt-1">
                    {idx + 1}위
                  </div>
                  <div className="font-black text-sm text-gray-800 truncate">
                    {student.name}
                  </div>
                  <div className="text-xs font-bold text-green-600">
                    {student.total}권
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* 기존 건의 게시판 */}
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-200">
          <h3 className="text-lg font-black text-gray-800 flex items-center gap-2 mb-3">
            <MessageSquare className="w-5 h-5 text-blue-600" /> 선생님께 의견
            남기기
          </h3>
          <div className="flex flex-col gap-3">
            <input
              type="text"
              value={suggestionTitle}
              onChange={(e) => setSuggestionTitle(e.target.value)}
              placeholder="제목"
              className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none font-bold"
            />
            <textarea
              value={suggestionInput}
              onChange={(e) => setSuggestionInput(e.target.value)}
              placeholder="내용..."
              className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none resize-none h-20"
            ></textarea>
            <button
              onClick={submitSuggestion}
              className="bg-blue-600 text-white font-bold py-3 rounded-xl hover:bg-blue-700 flex items-center justify-center gap-2"
            >
              <Send className="w-4 h-4" /> 전송하기
            </button>
          </div>
        </div>

        {/* 기존 1인 1역 현황 및 체크 */}
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-200 flex justify-between items-center gap-6">
          <div className="flex items-center gap-4">
            <div className="bg-gray-100 p-3 rounded-xl text-gray-500">
              <UserCheck className="w-8 h-8" />
            </div>
            <div>
              <p className="text-sm font-bold text-gray-500">
                {myInfo.id}번 {myInfo.name}
              </p>
              <h2 className="text-xl font-black text-gray-800 flex items-center gap-2">
                내 역할:{" "}
                <span className="text-blue-700 bg-blue-50 px-2 py-0.5 rounded">
                  {myRole}
                </span>
              </h2>
            </div>
          </div>
          <button
            onClick={logout}
            className="px-3 py-1.5 bg-white border border-gray-300 hover:bg-gray-100 rounded-lg text-gray-600 font-bold text-xs flex items-center gap-1"
          >
            <LogOut className="w-3 h-3" /> 로그아웃
          </button>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm text-center">
          <h3 className="text-lg font-black text-gray-800 mb-4">
            {todayStr} 친구들 역할 점검표
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
            {students.map((target) => {
              const isChecked =
                records[todayStr]?.[myInfo.id]?.[target.id] === myRole;
              return (
                <button
                  key={target.id}
                  onClick={() => toggleRecord(myInfo.id, myRole, target.id)}
                  className={`relative flex flex-col items-center justify-center p-3 rounded-xl border-2 transition-all duration-200 ${
                    isChecked
                      ? "bg-blue-600 border-blue-700 scale-[0.98]"
                      : "bg-white border-gray-200 hover:border-blue-300"
                  }`}
                >
                  <span
                    className={`absolute top-1.5 left-1.5 text-[10px] font-bold px-1.5 py-0.5 rounded ${
                      isChecked
                        ? "bg-blue-700 text-blue-100"
                        : "bg-gray-100 text-gray-500"
                    }`}
                  >
                    {target.id}
                  </span>
                  <span
                    className={`text-base font-black mt-3 mb-1 truncate w-full ${
                      isChecked ? "text-white" : "text-gray-800"
                    }`}
                  >
                    {target.name || "-"}
                  </span>
                  <div className="mt-0.5">
                    {isChecked ? (
                      <div className="flex items-center justify-center gap-1 text-white font-bold text-xs">
                        <CheckCircle2 className="w-4 h-4 text-green-300" /> 1점
                        부여
                      </div>
                    ) : (
                      <div className="flex items-center justify-center gap-1 text-gray-400 text-xs">
                        <Circle className="w-4 h-4" /> 대기중
                      </div>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
