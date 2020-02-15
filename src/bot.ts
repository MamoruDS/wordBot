import * as tgBot from 'node-telegram-bot-api'

import * as types from './types'
import * as menu from './menu'
import Request from './request'

const commands = {
    getBook: '',
}

export { commands }

export class wordBot {
    private _bot: tgBot
    private _server: types.serverInfo
    private _curBookId: 'string'
    private _req

    constructor(bot: tgBot, server: types.serverInfo) {
        this._bot = bot
        this._server = server
        this._server.url = `${server.protocol}://${server.addr}:${server.port}`
        this._req = new Request(this._server.url)
    }

    private sendMsg = async (chatId: string | number, msg: string) => {
        this._bot.sendMessage(chatId, msg)
    }

    root = async (chatId: string) => {
        let inlineKeys = await menu.inlineMenu('app')
        this._bot
            .sendMessage(chatId, `menu of\n${inlineKeys.name}`, {
                reply_markup: {
                    inline_keyboard: inlineKeys.keys,
                },
            })
            .catch(e => {
                // console.log(e)
            })
    }

    callback = async callbackQuery => {
        const data = await menu.dataGet(callbackQuery.data)
        const msg = callbackQuery.message
        const opts = {
            chat_id: msg.chat.id,
            message_id: msg.message_id,
        }
        const route = data['redir']
        let msgText = ''
        let msgKeyInlineKB: Array<types.inlineKBData> = []
        if (route === 'app/setDefaultBook/books') {
            let books = await this._req.getBook()
            msgKeyInlineKB = books.map(b => {
                return {
                    text: b.book_name,
                    callbackData: {
                        book_id: b.book_id,
                    },
                }
            })
        }
        const inlineKeys = await menu.inlineMenu(data['redir'], msgKeyInlineKB)
        this._bot.editMessageText(inlineKeys.name, opts)
        this._bot.editMessageReplyMarkup(
            {
                inline_keyboard: inlineKeys.keys,
            },
            opts
        )
    }
}
