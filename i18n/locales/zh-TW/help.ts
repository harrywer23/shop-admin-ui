export default {
    title: '幫助中心',
    searchPlaceholder: '搜尋常見問題...',
    categories: {
        order: '訂單相關',
        customization: '客製服務',
        payment: '支付相關',
        shipping: '物流配送',
        refund: '退款售後',
        account: '帳戶相關'
    },
    wasHelpful: '這個回答對您有幫助嗎？',
    yes: '有幫助',
    no: '沒幫助',
    feedbackThankYou: '感謝您的反饋！',
    feedbackSorry: '抱歉沒能幫到您，請聯繫客服獲取更多幫助。',
    noResults: '未找到相關問題',
    tryOtherKeywords: '請嘗試其他關鍵詞，或直接聯繫客服',
    needMoreHelp: '沒找到答案？',
    contactSupport: '請聯繫我們的客服團隊，我們會盡快為您解答',
    contactUs: '聯繫客服',
    faqs: {
        order: {
            howToOrder: {
                question: '如何下單購買商品？',
                answer: '1. 選擇心儀的商品並點擊"加入購物車"或"立即購買"<br>2. 在購物車中確認商品信息<br>3. 填寫收貨地址和聯繫方式<br>4. 選擇支付方式並完成支付<br>5. 系統自動生成訂單，您可以在"我的訂單"中查看訂單狀態'
            },
            orderStatus: {
                question: '如何查看訂單狀態？',
                answer: '您可以通過以下方式查看訂單狀態：<br>1. 登錄帳戶後進入"我的訂單"頁面<br>2. 點擊具體訂單可查看詳細信息<br>3. 系統會通過簡訊或郵件通知您訂單狀態的變更'
            },
            cancelOrder: {
                question: '如何取消訂單？',
                answer: '您可以在發貨前取消訂單：<br>1. 進入"我的訂單"頁面<br>2. 找到需要取消的訂單<br>3. 點擊"取消訂單"按鈕<br>4. 選擇取消原因並確認<br>注：發貨後將無法取消，如有問題請申請退款'
            }
        },
        customization: {
            howToCustomize: {
                question: '如何客製商品？',
                answer: '1. 在商品頁面選擇"客製服務"選項<br>2. 上傳您的設計圖或填寫具體需求<br>3. 選擇客製參數（尺寸、材質等）<br>4. 提交客製申請<br>5. 等待客服確認並報價<br>6. 確認後付款即可開始製作'
            },
            customizationTime: {
                question: '客製商品需要多長時間？',
                answer: '客製商品的製作時間因商品類型和具體要求而異：<br>1. 簡單客製：5-15個工作日<br>2. 中等複雜度：1-2個月<br>3. 複雜客製：1-3個月<br>具體時間將在確認訂單時告知'
            },
            requirements: {
                question: '客製商品有什麼要求？',
                answer: '1. 設計圖片要求：清晰度300DPI以上<br>2. 文件格式：支援JPG、PNG、AI、PSD<br>3. 內容限制：不接受違法違規內容<br>4. 尺寸要求：根據具體品類型有所不同<br>5. 材質選擇：可根據商品類型選擇適合的材質'
            }
        },
        payment: {
            methods: {
                question: '支援哪些支付方式？',
                answer: '我們支援多種支付方式：<br>1. 線上支付：支付寶、微信支付、銀聯<br>2. 信用卡支付：Visa、Mastercard、JCB等<br>3. 餘額支付：可使用帳戶餘額<br>4. 分期付款：支援花唄、信用卡分期等'
            },
            security: {
                question: '支付安全有保障嗎？',
                answer: '我們採用多重安全保障措施：<br>1. SSL加密傳輸<br>2. 實名認證<br>3. 支付驗證碼<br>4. 風控系統監控<br>5. 專業支付平台合作<br>所有支付信息都經過加密處理，請放心使用'
            }
        },
        shipping: {
            time: {
                question: '發貨需要多長時間？',
                answer: '1. 現貨商品：1-3個工作日發貨<br>2. 預售商品：以商品詳情頁說明為準<br>3. 客製商品：根據客製複雜度決定<br>4. 海外直發：7-15個工作日<br>節假日可能會延長發貨時間，請以實際通知為準'
            },
            tracking: {
                question: '如何查看物流信息？',
                answer: '1. 登錄帳戶進入"我的訂單"<br>2. 點擊訂單詳情<br>3. 查看物流追蹤信息<br>4. 點擊物流單號可跳轉至快遞公司官網查詢<br>您也可以通過簡訊或郵件獲取物流更新通知'
            }
        },
        refund: {
            howToRefund: {
                question: '如何申請退款？',
                answer: '1. 進入"我的訂單"頁面<br>2. 選擇需要退款的訂單<br>3. 點擊"申請退款"<br>4. 選擇退款原因並上傳相關憑證<br>5. 提交申請等待審核<br>6. 審核通過後退款將原路返回'
            },
            refundTime: {
                question: '退款需要多長時間？',
                answer: '退款時間因支付方式不同而異：<br>1. 支付寶/微信：1-3個工作日<br>2. 信用卡：3-15個工作日<br>3. 銀行卡：3-7個工作日<br>具體到帳時間以銀行實際處理為準'
            },
            conditions: {
                question: '什麼情況可以申請退款？',
                answer: '以下情況可以申請退款：<br>1. 收到商品7天內，商品完好未使用<br>2. 商品存在質量問題<br>3. 商品與描述不符<br>4. 未按承諾時間發貨<br>5. 收到商品與訂單不符<br>注：部分客製商品可能不支援退款，請在購買前確認'
            }
        },
        account: {
            forgotPassword: {
                question: '忘記密碼怎麼辦？',
                answer: '您可以通過以下方式重置密碼<br>1. 點擊登錄頁面的"忘記密碼"<br>2. 輸入註冊郵箱<br>3. 獲取驗證碼<br>4. 設置新密碼<br>5. 完成重置後使用新密碼登錄'
            },
            security: {
                question: '如何保護帳戶安全？',
                answer: '建議採取以下措施保護帳戶：<br>1. 設置強密碼<br>2. 開啟雙重認證<br>3. 定期更換密碼<br>4. 不使用公共設備保存登錄信息<br>5. 及時關注帳戶異常通知'
            }
        }
    }
}