import axios from 'axios'

import * as types from './types'

export const getBook = async (bookId?: string): Promise<types.bookObj[]> => {
    const res = await axios({
        baseURL: this._server.url,
        url: '/api/book',
        method: 'get',
        params: {
            book_id: bookId,
        },
    })
    return res.data.data
}
