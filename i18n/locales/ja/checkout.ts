export default {
  title: '注文確認',
  itemList: '商品リスト',
  orderInfo: '注文情報',
  contactInfo: {
    title: '連絡先情報',
    name: '受取人',
    phone: '電話番号',
    email: 'メールアドレス',
    namePlaceholder: '受取人の名前を入力してください',
    phonePlaceholder: '電話番号を入力してください',
    emailPlaceholder: 'メールアドレスを入力してください'
  },
  addressInfo: {
    title: '配送先住所',
    country: '国/地域',
    countryPlaceholder: '国/地域を選択してください',
    province: '都道府県',
    provincePlaceholder: '都道府県を選択してください',
    city: '市区町村',
    cityPlaceholder: '市区町村を入力してください',
    zipCode: '郵便番号',
    zipCodePlaceholder: '郵便番号を入力',
    address1: '住所1',
    address1Placeholder: '住所を入力してください（番地、建物名など）',
    address2: '住所2',
    address2Placeholder: '追加の住所情報（会社名、階数など）',
    optional: 'オプション',
    setDefault: 'デフォルトの住所として設定',
    addNew: '新しい住所を追加'
  },
  payment: {
    title: '支払方法',
    balance: '残高支払い',
    alipay: 'Alipay',
    wechat: 'WeChat Pay',
    paypal: 'PayPal',
    currentBalance: '現在の残高',
    recharge: 'チャージする',
    insufficientBalance: '残高不足です。チャージするか他の支払方法を選択してください'
  },
  priceDetail: {
    title: '価格詳細',
    subtotal: '小計',
    shipping: '配送料',
    discount: '割引額',
    coupon: 'クーポン',
    total: '支払金額',
    deposit: '手付金',
    finalPayment: '残金'
  },
  submit: {
    normal: '注文を確定する',
    presell: '手付金を支払う'
  },
  validation: {
    nameRequired: '受取人の名前を入力してください',
    phoneRequired: '電話番号を入力してください',
    emailRequired: 'メールアドレスを入力してください',
    countryRequired: '国/地域を選択してください',
    provinceRequired: '都道府県を選択してください',
    zipCodeRequired: '郵便番号を入力してください',
    addressRequired: '住所を入力してください',
    cityRequired: '市区町村を入力してください',
    cityMaxLength: '市区町村名は50文字以内で入力してください',
    address1Required: '住所を入力してください',
    addressMaxLength: '住所は200文字以内で入力してください',
    zipCodeFormat: '正しい郵便番号を入力してください',
    fillRequired: '必須項目を入力してください'
  },
  totalItems: '合計 {count} 点',
  orderRemark: '注文備考',
  remarkPlaceholder: '注文に関する特記事項がございましたらご記入ください',
  items: {
    total: '合計',
    title: '商品'
  },
  coupon: {
    select: 'クーポンを選択'
  }
}
