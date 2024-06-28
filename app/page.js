"use client";

import { useState, useEffect } from "react";
//useEffect 有些流程只有第一次進入頁面才會執行
import axios from "axios";
import { faEarthAmericas } from "@fortawesome/free-solid-svg-icons";
import CurrentFileIndicator from "@/components/CurrentFileIndicator";
import PageHeader from "@/components/PageHeader";
import GeneratorButton from "@/components/GenerateButton";
// 單字卡
import VocabGenResultCard from "@/components/VocabGenResultCard";
// 等候回應時顯示的單字卡
import VocabGenResultPlaceholder from "@/components/VocabGenResultPlaceholder";

export default function Home() {
  const [userInput, setUserInput] = useState("");
  const [language, setLanguage] = useState("English");
  // 所有的單字生成結果清單
  const [vocabList, setVocabList] = useState([]);
  // 是否在等待回應
  const [isWaiting, setIsWaiting] = useState(false);

  // 將資料透過迴圈轉成可渲染的元件
  const items = vocabList.map((result) => {
    return <VocabGenResultCard result={result} key={result.createdAt} />;
  });

  useEffect(() => {
    console.log("去要資料");
    axios
      .get("/api/vocab-ai")
      .then((res) => {
        console.log("res:", res);
        setVocabList(res.data.dataList);
      })
      .catch((err) => {
        console.log("err:", err);
      });
  }, []);

  //useEffect第一種用法：[] 陣列裡面放入發生改變（通常是一個狀態），就會執行函數
  //useEffect第二種用法：[] 當綁定的資料是空陣列時，以下流程只會在第一次進入頁面渲染時執行
  function submitHandler(e) {
    e.preventDefault();
    console.log("User Input: ", userInput);
    console.log("Language: ", language);
    const body = { userInput, language };
    console.log("body:", body);
    // 設定為等待中
    setIsWaiting(true);
    setUserInput("");
    // 將body POST到 /api/vocab-ai { userInput: "", language: "" }
    axios
      .post("/api/vocab-ai", body)
      .then((res) => {
        // 會在前後端對接都沒問題時觸發
        // 後端回給前端的資料會被包在 res.data 裡
        console.log("res:", res);
        const result = res.data;
        // 更新狀態
        // 把最新查詢的單字結果擺最前面
        setVocabList([result, ...vocabList]);
        setIsWaiting(false);
      })
      .catch((err) => {
        // 會在出錯時觸發，例如：程式碼有錯、金鑰無效、任何錯誤、網路斷線
        console.log("err:", err);
        alert("出錯了，請稍後再試。");

        setIsWaiting(false);
      });
  }

  return (
    <>
      <CurrentFileIndicator filePath="/app/page.js" />
      <PageHeader title="AI Vocabulary Generator" icon={faEarthAmericas} />
      <section>
        <div className="container mx-auto">
          <form onSubmit={submitHandler}>
            <div className="flex">
              <div className="w-3/5 px-2">
                <input
                  value={userInput}
                  onChange={(e) => setUserInput(e.target.value)}
                  type="text"
                  className="border-2 focus:border-pink-500 w-full block p-3 rounded-lg"
                  placeholder="Enter a word or phrase"
                  required
                />
              </div>
              <div className="w-1/5 px-2">
                <select
                  className="border-2 w-full block p-3 rounded-lg"
                  value={language}
                  onChange={(e) => setLanguage(e.target.value)}
                  required
                >
                  <option value="English">English</option>
                  <option value="Japanese">Japanese</option>
                  <option value="Korean">Korean</option>
                  <option value="Spanish">Spanish</option>
                  <option value="French">French</option>
                  <option value="German">German</option>
                  <option value="Italian">Italian</option>
                </select>
              </div>
              <div className="w-1/5 px-2">
                <GeneratorButton isWaiting={isWaiting} />
              </div>
            </div>
          </form>
        </div>
      </section>
      <section>
        <div className="container mx-auto">
          {/* 如果 isWaiting 是 true 秀出等候中的卡片 */}
          {isWaiting ? <VocabGenResultPlaceholder /> : null}

          {/* 顯示AI輸出結果 */}
          {items}
        </div>
      </section>
    </>
  );
}
