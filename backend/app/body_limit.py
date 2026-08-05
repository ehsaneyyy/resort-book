from fastapi.responses import JSONResponse


class MaxBodySizeMiddleware:
    def __init__(self, app, max_bytes: int = 1_000_000):
        self.app = app
        self.max_bytes = max_bytes

    async def __call__(self, scope, receive, send):
        if scope['type'] != 'http':
            return await self.app(scope, receive, send)

        received = 0
        rejected = {'sent': False}

        async def counting_receive():
            nonlocal received
            message = await receive()
            if message['type'] == 'http.request':
                received += len(message.get('body', b''))
            return message

        async def send_with_limit(message):
            if message['type'] == 'http.response.start' and received > self.max_bytes and not rejected['sent']:
                rejected['sent'] = True
                response = JSONResponse(status_code=413, content={'detail': 'Request body too large'})
                await response(scope, counting_receive, send)
                return
            await send(message)

        await self.app(scope, counting_receive, send_with_limit)
