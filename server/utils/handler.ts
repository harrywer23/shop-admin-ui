// 服务器路由由unjs/h3提供支持，它附带了一组方便的帮助程序。
// 阅读可用的 H3 请求助手中的更多内容。
// 您可以自己在目录中添加更多助手~/server/utils。
// 例如，您可以定义一个自定义处理程序实用程序，该实用程序包装原始处理程序并在返回最终响应之前执行其他操作。
import type { EventHandler, EventHandlerRequest } from 'h3'

export const defineWrappedResponseHandler = <T extends EventHandlerRequest, D> (
    handler: EventHandler<T, D>
): EventHandler<T, D> =>
    defineEventHandler<T>(async event => {
        try {
            // do something before the route handler
            const response = await handler(event)
            // do something after the route handler
            return { response }
        } catch (err) {
            // Error handling
            return { err }
        }
    })

