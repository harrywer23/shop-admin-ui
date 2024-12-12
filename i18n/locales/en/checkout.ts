export default {
  title: 'Confirm Order',
  itemList: 'Item List',
  orderInfo: 'Order Information',
  contactInfo: {
    title: 'Contact Information',
    name: 'Recipient',
    phone: 'Phone',
    email: 'Email',
    namePlaceholder: 'Enter recipient name',
    phonePlaceholder: 'Enter phone number',
    emailPlaceholder: 'Enter email address'
  },
  addressInfo: {
    title: 'Shipping Address',
    country: 'Country/Region',
    countryPlaceholder: 'Select country/region',
    province: 'State/Province',
    provincePlaceholder: 'Select state/province',
    city: 'City',
    cityPlaceholder: 'Enter city name',
    zipCode: 'ZIP Code',
    zipCodePlaceholder: 'Enter ZIP code',
    address1: 'Address Line 1',
    address1Placeholder: 'Enter street address, building number, etc.',
    address2: 'Address Line 2',
    address2Placeholder: 'Additional address info (company, floor, etc.)',
    optional: 'Optional',
    setDefault: 'Set as Default Address',
    addNew: 'Add New Address'
  },
  payment: {
    title: 'Payment Method',
    balance: 'Balance Payment',
    alipay: 'Alipay',
    wechat: 'WeChat Pay',
    paypal: 'PayPal',
    currentBalance: 'Current Balance',
    recharge: 'Recharge',
    insufficientBalance: 'Insufficient balance, please recharge or choose another payment method'
  },
  priceDetail: {
    title: 'Price Details',
    subtotal: 'Subtotal',
    shipping: 'Shipping Fee',
    discount: 'Discount',
    coupon: 'Coupon',
    total: 'Total Payment',
    deposit: 'Deposit',
    finalPayment: 'Final Payment'
  },
  submit: {
    normal: 'Place Order',
    presell: 'Pay Deposit'
  },
  validation: {
    nameRequired: 'Please enter recipient name',
    phoneRequired: 'Please enter phone number',
    emailRequired: 'Please enter email address',
    countryRequired: 'Please select country/region',
    provinceRequired: 'Please select state/province',
    zipCodeRequired: 'Please enter ZIP code',
    addressRequired: 'Please enter address',
    cityRequired: 'Please enter city',
    cityMaxLength: 'City name cannot exceed 50 characters',
    address1Required: 'Please enter address',
    addressMaxLength: 'Address cannot exceed 200 characters',
    zipCodeFormat: 'Please enter a valid ZIP code',
    fillRequired: 'Please fill in all required fields'
  },
  totalItems: 'Total {count} items',
  orderRemark: 'Order Remark',
  remarkPlaceholder: 'Please enter any special instructions for your order',
  items: {
    total: 'Total',
    title: 'Items'
  },
  coupon: {
    select: 'Select Coupon'
  }
} 