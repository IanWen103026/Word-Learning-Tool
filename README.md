# 單字題庫

這是一個單字題庫工具，幫助用戶通過答題來學習和記憶單字片語。

## 功能

- 生成單字填空題型並即時顯示正確率與完成率

## 安裝

1. 複製到本地端：
   ```bash
   git clone https://github.com/IanWen103026/Word-Learning-Tool
   ```
2. 打開專案目錄：
   ```bash
   cd 資料夾名稱
   ```

## 使用/修改方法

1. 打開 `index.html` 文件以啟動網頁。
2. `word.js` 為題庫資料，修改應遵守以下格式：

```js
const jsonData = [
  {
    Chinese: "單字/片語中文提示",
    English: "單字/片語的英文",
  },
];
```

## 授權

此專案使用 [MIT 授權](LICENSE)。

---