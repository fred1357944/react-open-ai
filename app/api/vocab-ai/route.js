import openai from "@/services/openai";
import db from "@/services/firebase-db";
// http method : POST, GET, PUT, DELETE

export async function GET() {
  //從FIRESTORE 的 Vocab-ai 集合內取得所有的文件
  const snapshot = await db
    .collection("vocab-ai")
    .orderBy("createdAt", "desc")
    .get();
  const dataList = [];
  snapshot.forEach((doc) => {
    const data = doc.data();
    // Push 是用來把資料放到陣列內
    dataList.push(data);
  });
  //後端一定要回傳資料給前端
  //postman 或是 thunder client 會收到資料
  return Response.json({ dataList });
}

export async function POST(req) {
  const body = await req.json();
  console.log("body:", body);
  const { userInput, language } = body;
  console.log("前端傳來的資料:", userInput, language);
  // TODO: 透過GPT-4o模型讓AI回傳相關單字
  // 文件連結：https://platform.openai.com/docs/guides/text-generation/chat-completions-api?lang=node.js
  // JSON Mode: https://platform.openai.com/docs/guides/text-generation/json-mode?lang=node.js
  const systemPrompt = `請作為一個單字聯想AI根據所提供的單字聯想5個相關指定語言的單字以及繁體中文意思
    輸入：機場
    語言：English
    ### 回應JSON範例:
    {
       wordList: [單字1, 單字2, ...]
       zhWordList: [單字1繁中意思, 單字2繁中意思, ...]
    }
    ###
    `;
  const propmpt = `輸入：${userInput} 語言：${language}`;

  const openAIReqBody = {
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: propmpt },
    ],
    model: "gpt-4o",
    response_format: { type: "json_object" },
  };
  const completion = await openai.chat.completions.create(openAIReqBody);
  const aiContent = completion.choices[0].message.content;
  // JSON.parse("{}") => {} 字串轉物件的函數
  const payload = JSON.parse(aiContent);
  console.log("AI模型傳回的內容:", payload, typeof payload);
  // 前端會收到的資料
  const data = {
    title: userInput,
    language,
    payload,
    createdAt: new Date().getTime(),
  };
  // 把資料存到 firestore 的 vocab-ai 集合內
  await db.collection("vocab-ai").add(data);

  // 把物件 data 傳給前端
  return Response.json(data);
}

