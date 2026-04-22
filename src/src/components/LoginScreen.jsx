import React from "react";
import { Trophy } from "lucide-react";

export default function LoginScreen({
  loginTab,
  setLoginTab,
  selectedId,
  setSelectedId,
  passwordInput,
  setPasswordInput,
  error,
  setError,
  handleLogin,
  students,
}) {
  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-md rounded-2xl shadow-xl overflow-hidden">
        <div className="bg-blue-700 p-8 text-center text-white">
          <Trophy className="w-12 h-12 mx-auto mb-3 text-yellow-300" />
          <h1 className="text-2xl font-black tracking-tight">
            스마트 토큰 학급 관리
          </h1>
          <p className="text-blue-100 mt-2 text-sm font-medium">
            1인 1역 기반 토큰 이코노미 시스템
          </p>
        </div>
        <div className="flex border-b border-gray-200">
          <button
            type="button"
            onClick={() => {
              setLoginTab("student");
              setError("");
              setPasswordInput("");
            }}
            className={`flex-1 py-3 font-bold text-sm ${
              loginTab === "student"
                ? "text-blue-700 border-b-2 border-blue-700"
                : "text-gray-500 hover:bg-gray-50"
            }`}
          >
            학생 로그인
          </button>
          <button
            type="button"
            onClick={() => {
              setLoginTab("teacher");
              setError("");
              setPasswordInput("");
            }}
            className={`flex-1 py-3 font-bold text-sm ${
              loginTab === "teacher"
                ? "text-blue-700 border-b-2 border-blue-700"
                : "text-gray-500 hover:bg-gray-50"
            }`}
          >
            선생님 로그인
          </button>
        </div>
        <form onSubmit={handleLogin} className="p-8 space-y-6">
          {loginTab === "student" ? (
            <>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">
                  내 번호(이름) 선택
                </label>
                <select
                  value={selectedId}
                  onChange={(e) => setSelectedId(e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none font-bold text-gray-700"
                >
                  {students.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.id}번 {s.name ? `(${s.name})` : ""}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">
                  고유 접속 비번 (ID)
                </label>
                <input
                  type="password"
                  value={passwordInput}
                  onChange={(e) => setPasswordInput(e.target.value)}
                  placeholder="선생님이 발급한 비번 입력"
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>
            </>
          ) : (
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">
                관리자 비밀번호
              </label>
              <input
                type="password"
                value={passwordInput}
                onChange={(e) => setPasswordInput(e.target.value)}
                placeholder="비밀번호 입력"
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>
          )}
          {error && (
            <p className="text-red-500 text-sm font-bold text-center bg-red-50 py-2 rounded">
              {error}
            </p>
          )}
          <button
            type="submit"
            className="w-full bg-blue-700 text-white font-bold py-3 rounded-lg hover:bg-blue-800 transition-colors"
          >
            접속하기
          </button>
        </form>
      </div>
    </div>
  );
}
