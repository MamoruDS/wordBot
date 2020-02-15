import axios from 'axios'

import * as types from './types'

class request {
    private _serverUrl: string
    constructor(serverUrl) {
        this._serverUrl = serverUrl
    }

    getBook = async (bookId?: string): Promise<types.bookObj[]> => {
        const res = await axios({
            baseURL: this._serverUrl,
            url: '/api/book',
            method: 'get',
            params: {
                book_id: bookId,
            },
        })
        return res.data.data
    }
}

export = request
