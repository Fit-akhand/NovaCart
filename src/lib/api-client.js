const getBaseUrl = () => {
    if (typeof window !== 'undefined') {
        return ''
    }

    return process.env.BASE_URL || ''
}

const fetchOptions = {
    credentials: 'include',
}

export const getData = async (url, token) => {
    const baseUrl = getBaseUrl()

    const res = await fetch(`${baseUrl}/api/${url}`, {
        method: 'GET',
        headers: {
            Authorization: token || '',
        },
        ...fetchOptions,
    })

    const data = await res.json()
    return data
}

export const postData = async (url, post, token) => {
    const baseUrl = getBaseUrl()

    const res = await fetch(`${baseUrl}/api/${url}`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            Authorization: token || '',
        },
        body: JSON.stringify(post),
        ...fetchOptions,
    })

    const data = await res.json()
    return data
}

export const putData = async (url, post, token) => {
    const baseUrl = getBaseUrl()

    const res = await fetch(`${baseUrl}/api/${url}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
            Authorization: token || '',
        },
        body: JSON.stringify(post),
        ...fetchOptions,
    })

    const data = await res.json()
    return data
}

export const patchData = async (url, post, token) => {
    const baseUrl = getBaseUrl()

    const res = await fetch(`${baseUrl}/api/${url}`, {
        method: 'PATCH',
        headers: {
            'Content-Type': 'application/json',
            Authorization: token || '',
        },
        body: JSON.stringify(post),
        ...fetchOptions,
    })

    const data = await res.json()
    return data
}

export const deleteData = async (url, token) => {
    const baseUrl = getBaseUrl()

    const res = await fetch(`${baseUrl}/api/${url}`, {
        method: 'DELETE',
        headers: {
            'Content-Type': 'application/json',
            Authorization: token || '',
        },
        ...fetchOptions,
    })

    const data = await res.json()
    return data
}
