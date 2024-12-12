// 定义 PaymentOrderIntroDto 接口
interface PaymentOrderIntroDto {
    orderId: number; // Long 在 TypeScript 中可以用 number 表示
    orderNumber: string;
    prodName: string;
    amount: number; // Double 在 TypeScript 中同样用 number 表示
    kind: number;   // Integer 同样可以使用 TypeScript 的 number 类型
}

// 定义 PayDto 接口
interface PayDto {
    description: string; // 可以在 JSDoc 中定义长度限制
    returnUrl: string;
    cancelUrl: string;
    country: string;
    amount: string;
    items: PaymentOrderIntroDto[]; // 使用 ? 表示该字段是可选的，数组类型使用 []
}

// 如果你需要在 TypeScript 中进行验证，可以使用如下的 JSDoc 注释来描述规则
/**
 * @description 用于支付的 DTO 对象。
 * @property {string} description - 订单描述，大小在 3 到 300 个字符之间。
 * @property {number} userId - 用户 ID。
 * @property {string} returnUrl - 支付成功后的返回 URL。
 * @property {string} cancelUrl - 支付取消后的返回 URL。
 * @property {string} country - 国家代码。
 * @property {PaymentOrderIntroDto[]} [intros] - 订单介绍列表，可选。
 */

// 导出类型
export type { PayDto, PaymentOrderIntroDto }
